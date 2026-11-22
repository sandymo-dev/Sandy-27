import { getGuest } from "@/lib/guests";
import { getSessionGuestId } from "@/lib/session";
import { savePlusOnePhoto } from "@/lib/store";

const MAX_BYTES = 3 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Upload the +1 selfie (already shrunk in the browser). */
export async function POST(request: Request) {
  const guestId = await getSessionGuestId();
  const guest = guestId ? getGuest(guestId) : null;
  if (!guest) return Response.json({ error: "Open the invite link again." }, { status: 401 });
  if (!guest.allowPlusOne) return Response.json({ error: "No +1 on this ticket." }, { status: 403 });

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get("photo");
    file = f instanceof File ? f : null;
  } catch {
    file = null;
  }
  if (!file) return Response.json({ error: "No photo received." }, { status: 400 });
  if (!TYPES.has(file.type)) return Response.json({ error: "Use a JPG, PNG or WebP photo." }, { status: 415 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That photo is too big." }, { status: 413 });

  try {
    const url = await savePlusOnePhoto(guest.id, new Uint8Array(await file.arrayBuffer()), file.type);
    return Response.json({ url });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}
