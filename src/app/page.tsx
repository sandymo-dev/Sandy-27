import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginFlow } from "@/components/LoginFlow";
import { Shell } from "@/components/ui";
import { currentGuest, homeFor } from "@/lib/access";

export default function DoorPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Door />
    </Suspense>
  );
}

async function Door() {
  const me = await currentGuest();
  if (me) redirect(homeFor(me.rsvp?.status));
  return <LoginFlow />;
}
