import "server-only";
import { redirect } from "next/navigation";
import { getGuest } from "@/lib/guests";
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
