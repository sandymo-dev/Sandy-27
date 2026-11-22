import { getSessionGuestId } from "@/lib/session";
import { readLocalPlusOnePhoto } from "@/lib/store";

/** Local dev only: serves +1 selfies saved in .data/uploads. Guests only. */
export async function GET(_request: Request, ctx: RouteContext<"/api/plus-one-photo/[guestId]">) {
  if (!(await getSessionGuestId())) return new Response("Not found", { status: 404 });
  const { guestId } = await ctx.params;
  const photo = await readLocalPlusOnePhoto(guestId);
  if (!photo) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(photo.bytes), {
    headers: { "Content-Type": photo.contentType, "Cache-Control": "private, max-age=3600" },
  });
}
