import { buildIcs } from "@/lib/calendar";
import { getSessionGuestId } from "@/lib/session";

/** "Add to calendar" for iPhone / Apple Calendar / Outlook. */
export async function GET() {
  if (!(await getSessionGuestId())) {
    return new Response("Open your invite first.", { status: 401 });
  }
  return new Response(buildIcs(), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sandy-27-burger-tour.ics"',
      "Cache-Control": "no-store",
    },
  });
}
