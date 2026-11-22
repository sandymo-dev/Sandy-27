import "server-only";
import { redirect } from "next/navigation";
import type { AnimalId } from "@/components/animals";
import { event } from "@/data/event";
import { getGuest, hostGuest } from "@/lib/guests";
import { getSessionGuestId } from "@/lib/session";
import { getRsvp } from "@/lib/store";
import type { Guest, Rsvp, RsvpStatus } from "@/lib/types";

/** Where a returning guest should land, based on their answer. */
export function homeFor(status: RsvpStatus | null | undefined): string {
  switch (status) {
    case "yes":
      return "/party";
    case "maybe":
      return "/rsvp";
    case "no":
      return "/bye";
    default:
      return "/invite";
  }
}

export async function currentGuest(): Promise<{ guest: Guest; rsvp: Rsvp | null } | null> {
  const id = await getSessionGuestId();
  const guest = id ? getGuest(id) : null;
  if (!guest) return null;
  return { guest, rsvp: await getRsvp(guest.id) };
}

/** For pages behind the login. Sends strangers back to the door. */
export async function requireGuest(): Promise<{ guest: Guest; rsvp: Rsvp | null }> {
  const me = await currentGuest();
  if (!me) redirect("/");
  return me;
}

/**
 * The host's +1, drawn as an angel next to them in the crowd.
 * Comes from the host's own RSVP; falls back to event.ts until they RSVP.
 */
export async function hostPlusOne(): Promise<{ name: string; photo: string | null; animal: AnimalId } | null> {
  const host = hostGuest();
  const r = host ? await getRsvp(host.id) : null;
  if (!r) return event.crowd.plusOne;
  if (r.status !== "yes" || !r.plusOne) return null;
  return {
    name: r.plusOneName ?? `${event.host.name}+1`,
    photo: r.plusOneAnimal ? null : r.plusOnePhotoUrl,
    animal: r.plusOneAnimal ?? "cat",
  };
}
