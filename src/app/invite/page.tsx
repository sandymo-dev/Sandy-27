import { Suspense } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/SafeImage";
import { SwitchGuest } from "@/components/SwitchGuest";
import { Ticket } from "@/components/Ticket";
import { Burger, Kicker, Marker, SectionTitle, Shell, btnLight } from "@/components/ui";
import { event } from "@/data/event";
import { requireGuest } from "@/lib/access";

export default function InvitePage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Invite />
    </Suspense>
  );
}

async function Invite() {
  const { guest, rsvp } = await requireGuest();
  const { host } = event;

  return (
    <Shell padded={false}>
      {/* Poster header */}
      <section className="flex flex-col gap-1.5 px-6 pt-6">
        <Marker className="-rotate-3 self-start text-[22px]">Hey {guest.displayName}, you&apos;re on the list!</Marker>
        {guest.note && <Marker className="-rotate-1 self-start text-base text-mist">{guest.note}</Marker>}
        <Kicker className="mt-3.5">LIVE · ONE NIGHT ONLY</Kicker>
        <h1 className="sr-only">
          {host.name}&apos;s {host.age}th birthday — {event.tourName}
        </h1>
        <span className="font-anton text-[112px] leading-[0.85] tracking-tight" aria-hidden="true">
          {host.name.toUpperCase()}
        </span>
        <div className="flex items-center gap-3.5" aria-hidden="true">
          <span className="outline-text font-anton text-[150px] leading-[0.85]">{host.age}</span>
          <div className="tape relative ml-1 rotate-[5deg] bg-paper px-[7px] pt-[7px] pb-6 hard-shadow">
            <SafeImage
              src={host.photo}
              alt=""
              className="h-32 w-32 object-cover"
              fallback={
                <div className="placeholder-hatch flex h-32 w-32 items-center justify-center text-center font-anton text-[15px] tracking-[0.08em] text-ink">
                  [SANDY&apos;S PHOTO]
                </div>
              }
            />
            <span className="absolute inset-x-0 bottom-1 text-center font-marker text-sm text-ink">
              the birthday boy
            </span>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <Burger size={70} bolt />
          <div className="-rotate-[1.5deg] bg-paper px-3 py-1.5 text-ink">
            <span className="font-anton text-[30px] tracking-[0.06em]">{event.tourName}</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-7 px-6 pt-8">
        <Ticket />

        <div className="flex flex-col gap-1.5">
          <Kicker className="text-sm! tracking-[0.18em]">DRESS CODE</Kicker>
          <Marker className="text-[30px] leading-[1.1]">{event.dressCode}</Marker>
        </div>

        <div className="flex flex-col gap-3.5">
          <SectionTitle>SETLIST</SectionTitle>
          {event.agenda.map((item, i) => (
            <div key={item.title} className="flex items-start gap-3.5">
              <span className="outline-text-thin w-10 font-anton text-4xl leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-anton text-sm tracking-[0.18em] text-smoke">
                  {item.label} · {item.time}
                </span>
                <span className="font-anton text-[28px] leading-[1.05]">{item.title}</span>
                <span className="text-[15px] leading-normal text-mist">{item.description}</span>
                {item.showMenuLink && (
                  <Link href="/menu" className="mt-1 min-h-11 text-[15px] font-semibold underline underline-offset-4">
                    See the coffee menu →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-auto flex flex-col gap-3.5 px-6 pt-10 pb-8">
        <Marker className="-rotate-2 text-center text-[22px]">
          {rsvp ? "Changed your mind?" : `Confirm before ${event.rsvpDeadlineLabel}!`}
        </Marker>
        <Link href="/rsvp" className={`${btnLight} min-h-16 text-[26px]`}>
          {rsvp ? "CHANGE MY ANSWER" : "GET YOUR TICKET"}
        </Link>
        {rsvp?.status === "yes" && (
          <Link href="/party" className="min-h-11 text-center text-[15px] font-semibold underline underline-offset-4">
            See who&apos;s coming →
          </Link>
        )}
        <div className="text-center">
          <SwitchGuest name={guest.displayName} />
        </div>
      </section>
    </Shell>
  );
}
