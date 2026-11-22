import { isPastDeadline } from "@/lib/calendar";
import { emailConfigured, sendReminder } from "@/lib/email";
import { getGuest } from "@/lib/guests";
import { listRsvps, markReminded } from "@/lib/store";

/** Don't email the same person twice within this window (guards against duplicate cron calls). */
const COOLDOWN_MS = 12 * 60 * 60 * 1000;

/**
 * Emails everyone still on "Not sure yet". Vercel Cron calls this three times
 * (see vercel.json, times in UTC):
 *   Fri 27 Nov 18:00 WIB, Sat 28 Nov 12:00 WIB, Sun 29 Nov 12:00 WIB.
 * You can also trigger it by hand:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://your-site/api/cron/remind
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isPastDeadline()) return Response.json({ sent: 0, skipped: "RSVP deadline has passed" });
  if (!emailConfigured()) {
    return Response.json({ error: "Set GMAIL_USER and GMAIL_APP_PASSWORD first." }, { status: 500 });
  }
  const siteUrl = process.env.SITE_URL ?? new URL(request.url).origin;

  const now = Date.now();
  const due = (await listRsvps()).filter(
    (r) =>
      r.status === "maybe" &&
      r.email &&
      (!r.remindedAt || now - new Date(r.remindedAt).getTime() > COOLDOWN_MS),
  );
  const sent: string[] = [];
  const failed: { guestId: string; error: string }[] = [];

  for (const r of due) {
    const guest = getGuest(r.guestId);
    if (!guest) continue;
    try {
      await sendReminder(r.email!, guest.displayName, siteUrl);
      sent.push(r.guestId);
    } catch (e) {
      failed.push({ guestId: r.guestId, error: e instanceof Error ? e.message : String(e) });
    }
  }
  await markReminded(sent, new Date(now).toISOString());
  return Response.json({ sent: sent.length, failed });
}
