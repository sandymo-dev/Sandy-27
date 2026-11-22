import { Suspense } from "react";
import { RsvpFlow } from "@/components/RsvpFlow";
import { Shell } from "@/components/ui";
import { event } from "@/data/event";
import { requireGuest } from "@/lib/access";
import { getGuest, takenAnimals, toPublicGuest } from "@/lib/guests";
import { listAllRsvps } from "@/lib/store";

export default function RsvpPage() {
  return (
    <Suspense fallback={<Shell>{null}</Shell>}>
      <Rsvp />
    </Suspense>
  );
}

async function Rsvp() {
  const { guest, rsvp } = await requireGuest();
  const all = await listAllRsvps();

  const others = all
    .filter((r) => r.status === "yes" && r.guestId !== guest.id && !getGuest(r.guestId)?.isHost)
    .map((r) => ({
      name: getGuest(r.guestId)?.displayName ?? "Someone",
      what: r.food ?? "Not sure yet",
    }));

  return (
    <RsvpFlow
      guest={toPublicGuest(guest)}
      initial={
        rsvp && rsvp.status !== "no"
          ? {
              status: rsvp.status,
              plusOne: rsvp.plusOne,
              plusOneName: rsvp.plusOneName,
              plusOnePhotoUrl: rsvp.plusOnePhotoUrl,
              plusOneAnimal: rsvp.plusOneAnimal,
              food: rsvp.food,
              foodUnsure: rsvp.foodUnsure,
              email: rsvp.email,
            }
          : null
      }
      defaultEmail={guest.email ?? null}
      takenAnimals={takenAnimals(all, guest.id)}
      others={others}
      foodIdeas={event.foodIdeas}
      deadlineLabel={event.rsvpDeadlineLabel}
      scare={{ image: event.jumpScare.image, durationMs: event.jumpScare.durationMs, sound: event.audio.scare }}
      bye={{
        hostName: event.host.name,
        hostAge: event.host.age,
        durationMs: event.leakPrank.durationMs,
        totalFiles: event.leakPrank.totalFiles,
        images: event.leakPrank.images,
      }}
    />
  );
}
