import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ByeScreen } from "@/components/ByeScreen";
import { Shell } from "@/components/ui";
import { event } from "@/data/event";
import { homeFor, requireGuest } from "@/lib/access";

export default function ByePage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Bye />
    </Suspense>
  );
}

async function Bye() {
  const { rsvp } = await requireGuest();
  if (rsvp?.status !== "no") redirect(homeFor(rsvp?.status));
  return (
    <ByeScreen
      hostName={event.host.name}
      hostAge={event.host.age}
      durationMs={event.leakPrank.durationMs}
      totalFiles={event.leakPrank.totalFiles}
      images={event.leakPrank.images}
    />
  );
}
