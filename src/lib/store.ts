import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getGuest } from "@/lib/guests";
import type { Rsvp } from "@/lib/types";

/**
 * Where RSVPs and +1 photos are saved.
 *
 * - Production (Vercel): Supabase. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * - Local dev without those variables: a JSON file in .data/ (git-ignored).
 */

const BUCKET = "plus-ones";

type Row = {
  guest_id: string;
  status: Rsvp["status"];
  plus_one: boolean;
  plus_one_name: string | null;
  plus_one_photo_url: string | null;
  plus_one_animal: string | null;
  food: string | null;
  food_unsure: boolean;
  email: string | null;
  reminded_at: string | null;
  updated_at: string;
};

const toRow = (r: Rsvp): Row => ({
  guest_id: r.guestId,
  status: r.status,
  plus_one: r.plusOne,
  plus_one_name: r.plusOneName,
  plus_one_photo_url: r.plusOnePhotoUrl,
  plus_one_animal: r.plusOneAnimal,
  food: r.food,
  food_unsure: r.foodUnsure,
  email: r.email,
  reminded_at: r.remindedAt,
  updated_at: r.updatedAt,
});

const fromRow = (row: Row): Rsvp => ({
  guestId: row.guest_id,
  status: row.status,
  plusOne: row.plus_one,
  plusOneName: row.plus_one_name,
  plusOnePhotoUrl: row.plus_one_photo_url,
  plusOneAnimal: (row.plus_one_animal as Rsvp["plusOneAnimal"]) ?? null,
  food: row.food,
  foodUnsure: row.food_unsure,
  email: row.email,
  remindedAt: row.reminded_at,
  updatedAt: row.updated_at,
});

let client: SupabaseClient | null = null;
function supabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function storageMode(): "supabase" | "local" {
  return supabase() ? "supabase" : "local";
}

// ---------- local file fallback ----------

const DATA_DIR = path.join(process.cwd(), ".data");
const RSVP_FILE = path.join(DATA_DIR, "rsvps.json");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

function assertLocalAllowed() {
  if (process.env.VERCEL) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
    );
  }
}

async function readLocal(): Promise<Record<string, Rsvp>> {
  try {
    return JSON.parse(await fs.readFile(RSVP_FILE, "utf8"));
  } catch {
    return {};
  }
}

async function writeLocal(data: Record<string, Rsvp>) {
  assertLocalAllowed();
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(RSVP_FILE, JSON.stringify(data, null, 2));
}

// ---------- public API ----------

export async function getRsvp(guestId: string): Promise<Rsvp | null> {
  const sb = supabase();
  if (!sb) return (await readLocal())[guestId] ?? null;
  const { data, error } = await sb.from("rsvps").select("*").eq("guest_id", guestId).maybeSingle();
  if (error) throw new Error(`Could not load RSVP: ${error.message}`);
  return data ? fromRow(data as Row) : null;
}

/** Every guest's RSVP. Leaves out the host, who is always in the crowd anyway. */
export async function listRsvps(): Promise<Rsvp[]> {
  return (await listAllRsvps()).filter((r) => !getGuest(r.guestId)?.isHost);
}

/** Every RSVP, the host's included. */
export async function listAllRsvps(): Promise<Rsvp[]> {
  const sb = supabase();
  if (!sb) return Object.values(await readLocal());
  const { data, error } = await sb.from("rsvps").select("*");
  if (error) throw new Error(`Could not load RSVPs: ${error.message}`);
  return (data as Row[]).map(fromRow);
}

export async function upsertRsvp(rsvp: Rsvp): Promise<void> {
  const sb = supabase();
  if (!sb) {
    const all = await readLocal();
    all[rsvp.guestId] = rsvp;
    await writeLocal(all);
    return;
  }
  const { error } = await sb.from("rsvps").upsert(toRow(rsvp), { onConflict: "guest_id" });
  if (error) throw new Error(`Could not save RSVP: ${error.message}`);
}

export async function markReminded(guestIds: string[], at: string): Promise<void> {
  if (guestIds.length === 0) return;
  const sb = supabase();
  if (!sb) {
    const all = await readLocal();
    for (const id of guestIds) if (all[id]) all[id].remindedAt = at;
    await writeLocal(all);
    return;
  }
  const { error } = await sb.from("rsvps").update({ reminded_at: at }).in("guest_id", guestIds);
  if (error) throw new Error(`Could not mark reminders: ${error.message}`);
}

/** Saves a +1 selfie and returns the URL to show it. */
export async function savePlusOnePhoto(
  guestId: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const sb = supabase();
  if (!sb) {
    assertLocalAllowed();
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    for (const old of await fs.readdir(UPLOAD_DIR)) {
      if (old.startsWith(`${guestId}.`)) await fs.unlink(path.join(UPLOAD_DIR, old));
    }
    await fs.writeFile(path.join(UPLOAD_DIR, `${guestId}.${ext}`), bytes);
    return `/api/plus-one-photo/${encodeURIComponent(guestId)}?v=${Date.now()}`;
  }
  const filePath = `${guestId}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(filePath, bytes, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Could not upload photo: ${error.message}`);
  return sb.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
}

/** Local mode only: read a stored +1 selfie. */
export async function readLocalPlusOnePhoto(
  guestId: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  try {
    const file = (await fs.readdir(UPLOAD_DIR)).find((f) => f.startsWith(`${guestId}.`));
    if (!file) return null;
    const ext = file.split(".").pop();
    const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return { bytes: await fs.readFile(path.join(UPLOAD_DIR, file)), contentType };
  } catch {
    return null;
  }
}
