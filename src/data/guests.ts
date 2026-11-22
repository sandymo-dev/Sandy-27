import type { Guest } from "@/lib/types";

/**
 * THE GUEST LIST
 *
 * One entry per invited friend. Only people in this list can open the invite.
 *
 * - id           Unique, lowercase, no spaces. Used internally; never shown.
 * - displayName  What the invite calls them: "Hey Budi, you're on the list!"
 * - names        Every name they might type to log in (nicknames, full name,
 *                how you call them). Matching ignores capitals, spaces and dots.
 * - psn          Their PSN IDs (a list). They can log in with any of them. Optional.
 * - photo        Face photo, used for "Is this you?" and as their stickman head.
 *                Put the file in /public/guests/ and write the path here, e.g.
 *                "/guests/budi.png". Square, face centered, ~400×400 is ideal.
 *                Leave it out and they get an animal face instead.
 * - fallbackAnimal  Animal used when there's no photo (see AnimalId list in
 *                src/components/AnimalFace.tsx). Optional; default "cat".
 * - allowPlusOne Can they bring someone? false hides the +1 option.
 * - email        Optional. Pre-fills the "remind me later" email field.
 * - note         Optional personal line shown on their invite.
 * - magicWord    Optional. If set, the door asks "What is your magic word?"
 *                before letting them in.
 * - isHost       Marks you. Your RSVP is left out of the crowd and headcount
 *                (you're already drawn first in line).
 *
 * Replace the two examples below with your real friends.
 */
export const guests: Guest[] = [
  {
    // You, the host. The door asks for the magic word after your name.
    id: "sandy",
    displayName: "Sandy",
    names: ["sandy", "sandymo"],
    photo: "/images/me-crop.png",
    allowPlusOne: true,
    isHost: true,
    magicWord: "12345",
  },
  {
    id: "arsa",
    displayName: "Arsa",
    names: ["arsa", "normadi", "normadyarsa rahman", "normandy"],
    psn: ["normadyarsa2000"],
    photo: "/guests/arsa.png",
    allowPlusOne: true,
  },
  {
    id: "dani",
    displayName: "Dani",
    names: ["dani", "wijdani", "muhammad alif wijdani", "alif wijdani"],
    psn: ["daniwijdani", "daniwijdanihd"],
    photo: "/guests/dani.png",
    allowPlusOne: true,
  },
  {
    id: "farras",
    displayName: "Farras",
    names: ["farras", "muhammad farras pangestu", "m farras p", "farras pangestu"],
    psn: [",m_farras_p"],
    photo: "/guests/farras.png",
    allowPlusOne: true,
  },
  {
    id: "heikal",
    displayName: "Heikal",
    names: ["heikal", "heikal aurel nunzi", "heikal aurel", "heikal nunzi", "nunzi"],
    psn: [",heikalyow, heikal_callum06, heikalwow, heikalyoa"],
    photo: "/guests/heikal.png",
    allowPlusOne: true,
  },
  {
    id: "ryan",
    displayName: "Ryan",
    names: ["ryan", "muhammad imam ryan nasution", "imam ryan", "ryan nasution", "nasution"],
    psn: ["hahalucu"],
    photo: "/guests/ryan.png",
    allowPlusOne: true,
  },
  {
    id: "rg",
    displayName: "Rafi Giffari",
    names: ["rg", "rafi giffari", "muhammad rafi giffari", "erge", "rafi"],
    psn: ["rafigiffari0, rafigiffari09"],
    photo: "/guests/rg.png",
    allowPlusOne: true,
  },
  
];
