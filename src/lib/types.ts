import type { AnimalId } from "@/components/animals";

export type Guest = {
  id: string;
  displayName: string;
  names: string[];
  psn?: string[];
  photo?: string;
  fallbackAnimal?: AnimalId;
  allowPlusOne: boolean;
  email?: string;
  note?: string;
  /** Asked at the door after the name matches ("What is your magic word?"). */
  magicWord?: string;
  /** The host. Can log in, but never counted in the crowd or headcount. */
  isHost?: boolean;
};

export type AgendaItem = {
  label: string;
  time: string;
  title: string;
  description: string;
  showMenuLink?: boolean;
};

export type FoodIdeaGroup = { group: string; items: string[] };

export type EventConfig = {
  host: { name: string; age: number; photo: string };
  crowd: {
    hostPhoto: string | null;
    hostAnimal: AnimalId;
    plusOne: { name: string; photo: string | null; animal: AnimalId } | null;
  };
  tourName: string;
  start: string;
  end: string;
  timezone: string;
  venue: { name: string; address: string; mapsUrl: string };
  dressCode: string;
  rsvpDeadline: string;
  rsvpDeadlineLabel: string;
  agenda: AgendaItem[];
  coffeeMenuImage: string;
  /** Rider idea chips, shown group by group, most popular first. */
  foodIdeas: FoodIdeaGroup[];
  audio: { music: string; musicVolume: number; scare: string };
  jumpScare: { image: string | null; durationMs: number };
  leakPrank: { durationMs: number; totalFiles: number; images: string[] };
};

export type RsvpStatus = "yes" | "maybe" | "no";

export type Rsvp = {
  guestId: string;
  status: RsvpStatus;
  plusOne: boolean;
  plusOneName: string | null;
  plusOnePhotoUrl: string | null;
  plusOneAnimal: AnimalId | null;
  food: string | null;
  foodUnsure: boolean;
  email: string | null;
  remindedAt: string | null;
  updatedAt: string;
};

/** What the browser is allowed to know about a guest. */
export type PublicGuest = {
  id: string;
  displayName: string;
  photo: string | null;
  animal: AnimalId;
  allowPlusOne: boolean;
};
