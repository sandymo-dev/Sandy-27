import { Suspense } from "react";
import Link from "next/link";
import { MenuImage } from "@/components/MenuImage";
import { Kicker, Shell } from "@/components/ui";
import { event } from "@/data/event";
import { requireGuest } from "@/lib/access";

export default function MenuPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Menu />
    </Suspense>
  );
}

async function Menu() {
  const { rsvp } = await requireGuest();
  const opening = event.agenda.find((a) => a.showMenuLink);
  return (
    <Shell className="gap-5!">
      <Link
        href={rsvp?.status === "yes" ? "/party" : "/invite"}
        className="flex min-h-11 items-center self-start text-[15px] font-semibold"
      >
        ← Back
      </Link>
      <div className="flex flex-col gap-0.5">
        <Kicker>{opening ? `${opening.label} · NGOPI SORE` : "NGOPI SORE"}</Kicker>
        <h1 className="font-anton text-[84px] leading-[0.9]">KOPI MO</h1>
      </div>
      <div className="flex flex-1 items-start justify-center pt-1.5">
        <MenuImage src={event.coffeeMenuImage} />
      </div>
    </Shell>
  );
}
