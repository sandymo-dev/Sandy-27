import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Crowd, type CrowdMember } from "@/components/Crowd";
import { SwitchGuest } from "@/components/SwitchGuest";
import { Ticket } from "@/components/Ticket";
import { Bolt, Kicker, Marker, SectionTitle, Shell, btnLight } from "@/components/ui";
import { event } from "@/data/event";
import { hostPlusOne, requireGuest } from "@/lib/access";
import { googleCalendarUrl } from "@/lib/calendar";
import { getGuest } from "@/lib/guests";
import { listRsvps } from "@/lib/store";

export default function PartyPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Party />
    </Suspense>
  );
}

async function Party() {
  const { guest, rsvp } = await requireGuest();
  if (!rsvp) redirect("/invite");
  if (rsvp.status === "no") redirect("/bye");

  const all = await listRsvps();
  const yes = all
    .filter((r) => r.status === "yes" && getGuest(r.guestId))
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  const maybeCount = all.filter((r) => r.status === "maybe" && getGuest(r.guestId)).length;

  const members: CrowdMember[] = [
    { key: "host", name: event.host.name, photo: event.crowd.hostPhoto, animal: event.crowd.hostAnimal },
  ];
  const myPlusOne = await hostPlusOne();
  if (myPlusOne) {
    const p = myPlusOne;
    members.push({ key: "host-plus-one", name: p.name, photo: p.photo, animal: p.animal, angel: true });
  }
  for (const r of yes) {
    const g = getGuest(r.guestId)!;
    members.push({ key: g.id, name: g.displayName, photo: g.photo ?? null, animal: g.fallbackAnimal ?? "cat" });
    if (r.plusOne) {
      members.push({
        key: `${g.id}-plus-one`,
        name: r.plusOneName ?? `${g.displayName}+1`,
        photo: r.plusOneAnimal ? null : r.plusOnePhotoUrl,
        animal: r.plusOneAnimal ?? "cat",
      });
    }
  }

  const food = yes.map((r) => ({
    who: getGuest(r.guestId)!.displayName,
    what: r.food ?? "Not sure yet",
  }));
  const claimed = new Set(
    yes.flatMap((r) => (r.food ?? "").split(",").map((s) => s.trim().toLowerCase())),
  );
  const stillNeeded = event.foodIdeas
    .flatMap((g) => g.items)
    .filter((i) => !claimed.has(i.toLowerCase()));

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <Kicker>{event.tourName}</Kicker>
        <Link href="/rsvp" className="flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">
          Edit my RSVP
        </Link>
      </div>

      <div className="flex flex-col gap-1">
        {rsvp.status === "yes" ? (
          <Marker className="-rotate-2 self-start text-[22px]">You&apos;re in, {guest.displayName}!</Marker>
        ) : (
          <Marker className="-rotate-2 self-start text-[22px]">Still not sure, {guest.displayName}?</Marker>
        )}
        <h1 className="font-anton text-[84px] leading-[0.9]">THE CROWD</h1>
      </div>

      {rsvp.status === "maybe" && (
        <div className="-mt-2 flex flex-col gap-3 border-[3px] border-paper p-4">
          <p className="text-[15px] text-mist">Decide before {event.rsvpDeadlineLabel} so Sandy buys enough meat.</p>
          <Link href="/rsvp" className={btnLight}>
            DECIDE NOW
          </Link>
        </div>
      )}

      <div className="flex flex-col bg-paper px-3 pt-4.5 text-ink hard-shadow-lg">
        <div className="flex items-baseline justify-between px-1.5">
          <span className="font-anton text-[22px] tracking-[0.06em]">
            {members.length} IN · {maybeCount} MAYBE
          </span>
          <Bolt size={22} />
        </div>
        <Crowd members={members} />
        <div className="checker-dark -mx-3" />
      </div>

      {guest.isHost && (
        <Link href="/rsvp#crew" className={`${btnLight} -mt-2`}>
          {rsvp.status === "yes" && rsvp.plusOne ? "EDIT MY +1" : "+ ADD MY +1"}
        </Link>
      )}

      <div className="flex flex-col gap-2.5">
        <Ticket compact />
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={googleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12.5 items-center justify-center bg-paper font-anton text-base tracking-[0.08em] text-ink"
          >
            + GOOGLE CAL
          </a>
          <a
            href="/api/calendar"
            className="flex min-h-12.5 items-center justify-center bg-paper font-anton text-base tracking-[0.08em] text-ink"
          >
            + IPHONE (.ICS)
          </a>
        </div>
      </div>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>SETLIST</SectionTitle>
        {event.agenda.map((a, i) => (
          <div key={a.title} className="flex justify-between gap-3 font-anton text-xl tracking-[0.04em]">
            <span>
              {String(i + 1).padStart(2, "0")} {a.title}
            </span>
            <span className="text-smoke">{a.time}</span>
          </div>
        ))}
        <Link href="/menu" className="min-h-11 text-[15px] font-semibold underline underline-offset-4">
          See the coffee menu →
        </Link>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle>THE RIDER</SectionTitle>
        <span className="text-sm text-mist">
          Buns, meat and grill by {event.host.name}. The rest is on you:
        </span>
        {food.length === 0 && <span className="font-marker text-[15px] text-mist">Nothing yet.</span>}
        {food.map((f) => (
          <div key={f.who} className="flex items-baseline justify-between gap-3 border-b-2 border-dashed border-ash pb-2">
            <span className="font-anton text-[19px] tracking-[0.04em] uppercase">{f.what}</span>
            <span className="shrink-0 font-marker text-base">{f.who}</span>
          </div>
        ))}
        {/* {stillNeeded.length > 0 && (
          <p className="pt-1 text-sm text-mist">
            <span className="font-anton tracking-[0.12em] text-paper">NOBODY&apos;S BRINGING YET: </span>
            {stillNeeded.join(", ")}
          </p>
        )} */}
      </section>

      <div className="text-center">
        <SwitchGuest name={guest.displayName} />
      </div>
    </Shell>
  );
}
