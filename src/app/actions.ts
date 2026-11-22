"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import { isAnimalId, type AnimalId } from "@/components/animals";
import { homeFor } from "@/lib/access";
import { notifyHost } from "@/lib/email";
import { findGuestByName, firstFreeAnimal, getGuest, takenAnimals, toPublicGuest } from "@/lib/guests";
import {
  clearSession,
  getSessionGuestId,
  makeMagicToken,
  makeMatchToken,
  readMagicToken,
  readMatchToken,
  setSession,
} from "@/lib/session";
import { getRsvp, listAllRsvps, listRsvps, upsertRsvp } from "@/lib/store";
import type { PublicGuest, Rsvp } from "@/lib/types";

export type LookupResult =
  | { found: true; guest: PublicGuest; token: string }
  | { found: "magic"; challenge: string }
  | { found: false };

/** Step 1 of the door: "Is your name on the list?" */
export async function lookupGuest(name: string): Promise<LookupResult> {
  if (typeof name !== "string" || name.trim().length === 0 || name.length > 80) {
    return { found: false };
  }
  const guest = findGuestByName(name);
  if (!guest) return { found: false };
  // Protected names get no match token (and no photo) until the magic word is right.
  if (guest.magicWord) return { found: "magic", challenge: makeMagicToken(guest.id) };
  return { found: true, guest: toPublicGuest(guest), token: makeMatchToken(guest.id) };
}

export type MagicResult =
  | { ok: true; guest: PublicGuest; token: string }
  | { ok: false; expired: boolean };

/** Step 1½ for protected names: "What is your magic word?" */
export async function checkMagicWord(challenge: string, word: string): Promise<MagicResult> {
  const guestId = typeof challenge === "string" ? readMagicToken(challenge) : null;
  const guest = guestId ? getGuest(guestId) : null;
  if (!guest?.magicWord) return { ok: false, expired: true };
  if (typeof word !== "string" || word.trim() !== guest.magicWord) {
    // Slow down anyone trying to guess.
    await new Promise((r) => setTimeout(r, 1000));
    return { ok: false, expired: false };
  }
  return { ok: true, guest: toPublicGuest(guest), token: makeMatchToken(guest.id) };
}

/** Step 2: "Is this you?" -> HELL YEAH. Sets the session and says where to go. */
export async function confirmGuest(token: string): Promise<{ ok: boolean; next: string }> {
  const guestId = typeof token === "string" ? readMatchToken(token) : null;
  const guest = guestId ? getGuest(guestId) : null;
  if (!guest) return { ok: false, next: "/" };
  await setSession(guest.id);
  const rsvp = await getRsvp(guest.id);
  return { ok: true, next: homeFor(rsvp?.status) };
}

export async function signOut(): Promise<void> {
  await clearSession();
}

const rsvpSchema = z.object({
  status: z.enum(["yes", "maybe", "no"]),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().trim().max(60).nullish(),
  plusOnePhotoUrl: z.string().trim().max(2000).nullish(),
  plusOneAnimal: z.string().nullish(),
  food: z.string().trim().max(700).nullish(),
  foodUnsure: z.boolean().default(false),
  email: z.string().trim().max(200).nullish(),
});

export type RsvpInput = z.input<typeof rsvpSchema>;
export type SaveResult = { ok: true; next: string } | { ok: false; error: string };

export async function saveRsvp(input: RsvpInput): Promise<SaveResult> {
  const guestId = await getSessionGuestId();
  const guest = guestId ? getGuest(guestId) : null;
  if (!guest) return { ok: false, error: "Your session expired. Open the invite link again." };

  const parsed = rsvpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Something in the form looks off. Try again." };
  const d = parsed.data;
  const previous = await getRsvp(guest.id);

  const email: string | null = d.email ? d.email : null;
  if (d.status === "maybe") {
    if (!email || !z.email().safeParse(email).success) {
      return { ok: false, error: "That email doesn't look right." };
    }
  }

  const plusOne = d.status === "yes" && guest.allowPlusOne && d.plusOne;
  if (plusOne && !d.plusOneName) {
    return { ok: false, error: "What's your +1 called?" };
  }

  // Only accept photo URLs we created ourselves.
  const photo = d.plusOnePhotoUrl ?? null;
  const photoOk =
    !photo ||
    photo.startsWith(`/api/plus-one-photo/${encodeURIComponent(guest.id)}`) ||
    (process.env.SUPABASE_URL ? photo.startsWith(process.env.SUPABASE_URL) : false);

  const animal: AnimalId | null = isAnimalId(d.plusOneAnimal) ? d.plusOneAnimal : null;

  // One +1 per animal. Keeping the animal you already had is always fine.
  let fallbackAnimal: AnimalId = "cat";
  if (plusOne) {
    const taken = takenAnimals(await listAllRsvps(), guest.id);
    if (animal && animal !== previous?.plusOneAnimal && taken.includes(animal)) {
      return { ok: false, error: "Someone else's +1 just took that animal. Pick another one." };
    }
    fallbackAnimal = firstFreeAnimal(taken);
  }

  const rsvp: Rsvp = {
    guestId: guest.id,
    status: d.status,
    plusOne,
    plusOneName: plusOne ? (d.plusOneName ?? null) : null,
    plusOnePhotoUrl: plusOne && photoOk && !animal ? photo : null,
    plusOneAnimal: plusOne ? (animal ?? (photo && photoOk ? null : fallbackAnimal)) : null,
    food: d.status === "yes" && !d.foodUnsure ? (d.food || null) : null,
    foodUnsure: d.status === "yes" ? d.foodUnsure || !d.food : false,
    email: email ?? previous?.email ?? null,
    // A new "maybe" with a different email should get its own reminder.
    remindedAt:
      d.status === "maybe" && previous?.status === "maybe" && previous.email === email
        ? previous.remindedAt
        : null,
    updatedAt: new Date().toISOString(),
  };
  try {
    await upsertRsvp(rsvp);
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Couldn't save your answer. Try again in a minute." };
  }

  // Tell the host by email. Runs after the guest's response, so it never slows them down.
  if (!guest.isHost) after(async () => {
    try {
      await notifyHost(guest.displayName, rsvp, previous, await listRsvps());
    } catch (e) {
      console.error("Host notification failed:", e);
    }
  });

  revalidatePath("/party");
  revalidatePath("/rsvp");
  return { ok: true, next: homeFor(rsvp.status) };
}
