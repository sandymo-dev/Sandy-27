import "server-only";
import { ANIMAL_IDS, type AnimalId } from "@/components/animals";
import { event } from "@/data/event";
import { guests } from "@/data/guests";
import type { Guest, PublicGuest, Rsvp } from "@/lib/types";

/** "Budi Santoso." -> "budisantoso", "Jalapeño" -> "jalapeno" */
export function normalizeName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function findGuestByName(input: string): Guest | null {
  const needle = normalizeName(input);
  if (!needle) return null;
  for (const g of guests) {
    const keys = [g.displayName, ...g.names, ...(g.psn ?? [])].map(normalizeName).filter(Boolean);
    if (keys.includes(needle)) return g;
  }
  return null;
}

export function getGuest(id: string): Guest | null {
  return guests.find((g) => g.id === id) ?? null;
}

export function hostGuest(): Guest | null {
  return guests.find((g) => g.isHost) ?? null;
}

export function allGuests(): Guest[] {
  return guests;
}

export function toPublicGuest(g: Guest): PublicGuest {
  return {
    id: g.id,
    displayName: g.displayName,
    photo: g.photo ?? null,
    animal: g.fallbackAnimal ?? "cat",
    allowPlusOne: g.allowPlusOne,
  };
}

/**
 * Animal faces already in the crowd, so each one is only used once.
 * Leaves out `exceptGuestId`'s own +1 so they can keep their pick.
 * Pass every RSVP (host included) so the host's +1 counts too.
 */
export function takenAnimals(rsvps: Rsvp[], exceptGuestId: string): AnimalId[] {
  const taken = new Set<AnimalId>();
  if (!event.crowd.hostPhoto) taken.add(event.crowd.hostAnimal);
  // The +1 in event.ts only shows until the host RSVPs (then their RSVP's +1 is used).
  const hostPlusOne = event.crowd.plusOne;
  const hostAnswered = rsvps.some((r) => getGuest(r.guestId)?.isHost);
  if (hostPlusOne && !hostPlusOne.photo && !hostAnswered) taken.add(hostPlusOne.animal);
  for (const r of rsvps) {
    if (r.status === "no") continue;
    const g = getGuest(r.guestId);
    if (!g) continue;
    if (!g.photo) taken.add(g.fallbackAnimal ?? "cat");
    if (r.guestId !== exceptGuestId && r.plusOne && r.plusOneAnimal) taken.add(r.plusOneAnimal);
  }
  return [...taken];
}

/** First picker animal nobody has yet ("cat" if the zoo is full). */
export function firstFreeAnimal(taken: AnimalId[]): AnimalId {
  return ANIMAL_IDS.find((id) => !taken.includes(id)) ?? "cat";
}
