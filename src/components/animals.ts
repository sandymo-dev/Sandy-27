// 20 hand-drawn animal faces (40×40 line art). Used when a guest or +1 has no photo.
// Inner SVG markup is a trusted constant; stroke/fill use currentColor.

export const ANIMALS = [
  { id: "cat", label: "Cat", svg: `<path d="M8 16 L8 4 L16 11 Q20 10 24 11 L32 4 L32 16 Q35 34 20 35 Q5 34 8 16 Z"/><circle cx="15" cy="20" r="1.8" fill="currentColor"/><circle cx="25" cy="20" r="1.8" fill="currentColor"/><path d="M18 25 L20 27 L22 25 M3 23 L12 25 M3 28 L12 27 M37 23 L28 25 M37 28 L28 27"/>` },
  { id: "dog", label: "Dog", svg: `<path d="M11 9 Q20 5 29 9 Q33 20 29 30 Q20 37 11 30 Q7 20 11 9 Z"/><path d="M11 9 Q3 10 4 22 Q8 22 10 17 M29 9 Q37 10 36 22 Q32 22 30 17"/><circle cx="16" cy="19" r="1.8" fill="currentColor"/><circle cx="24" cy="19" r="1.8" fill="currentColor"/><path d="M17 25 Q20 28 23 25 L20 23 Z" fill="currentColor"/>` },
  { id: "bear", label: "Bear", svg: `<circle cx="10" cy="10" r="5"/><circle cx="30" cy="10" r="5"/><circle cx="20" cy="22" r="13"/><circle cx="15" cy="19" r="1.8" fill="currentColor"/><circle cx="25" cy="19" r="1.8" fill="currentColor"/><ellipse cx="20" cy="27" rx="5" ry="4"/><circle cx="20" cy="26" r="1.2" fill="currentColor"/>` },
  { id: "frog", label: "Frog", svg: `<circle cx="12" cy="11" r="6"/><circle cx="28" cy="11" r="6"/><circle cx="12" cy="11" r="2" fill="currentColor"/><circle cx="28" cy="11" r="2" fill="currentColor"/><path d="M6 15 Q2 32 20 33 Q38 32 34 15"/><path d="M12 25 Q20 30 28 25"/>` },
  { id: "panda", label: "Panda", svg: `<circle cx="10" cy="10" r="5" fill="currentColor"/><circle cx="30" cy="10" r="5" fill="currentColor"/><circle cx="20" cy="22" r="13"/><ellipse cx="14.5" cy="20" rx="3.5" ry="4.5" fill="currentColor" transform="rotate(-20 14.5 20)"/><ellipse cx="25.5" cy="20" rx="3.5" ry="4.5" fill="currentColor" transform="rotate(20 25.5 20)"/><circle cx="20" cy="27" r="1.6" fill="currentColor"/>` },
  { id: "rabbit", label: "Rabbit", svg: `<ellipse cx="14" cy="10" rx="3.5" ry="9"/><ellipse cx="26" cy="10" rx="3.5" ry="9"/><circle cx="20" cy="27" r="11"/><circle cx="16" cy="25" r="1.6" fill="currentColor"/><circle cx="24" cy="25" r="1.6" fill="currentColor"/><path d="M20 29 V31 M18 32 Q20 33 22 32"/>` },
  { id: "pig", label: "Pig", svg: `<path d="M10 11 L8 4 L15 8 M30 11 L32 4 L25 8"/><circle cx="20" cy="21" r="14"/><ellipse cx="20" cy="25" rx="6" ry="4"/><circle cx="18" cy="25" r="1" fill="currentColor"/><circle cx="22" cy="25" r="1" fill="currentColor"/><circle cx="14" cy="17" r="1.6" fill="currentColor"/><circle cx="26" cy="17" r="1.6" fill="currentColor"/>` },
  { id: "fox", label: "Fox", svg: `<path d="M5 6 L14 13 L26 13 L35 6 L33 22 L20 34 L7 22 Z"/><circle cx="15" cy="20" r="1.8" fill="currentColor"/><circle cx="25" cy="20" r="1.8" fill="currentColor"/><circle cx="20" cy="29" r="1.6" fill="currentColor"/>` },
  { id: "mouse", label: "Mouse", svg: `<circle cx="9" cy="12" r="7"/><circle cx="31" cy="12" r="7"/><circle cx="20" cy="24" r="11"/><circle cx="16" cy="22" r="1.6" fill="currentColor"/><circle cx="24" cy="22" r="1.6" fill="currentColor"/><circle cx="20" cy="27" r="1.4" fill="currentColor"/><path d="M13 28 L5 27 M27 28 L35 27"/>` },
  { id: "koala", label: "Koala", svg: `<circle cx="7" cy="15" r="6"/><circle cx="33" cy="15" r="6"/><circle cx="20" cy="22" r="13"/><ellipse cx="20" cy="25" rx="3.5" ry="5" fill="currentColor"/><circle cx="14" cy="19" r="1.6" fill="currentColor"/><circle cx="26" cy="19" r="1.6" fill="currentColor"/>` },
  { id: "lion", label: "Lion", svg: `<circle cx="20" cy="20" r="17" stroke-dasharray="4 3"/><circle cx="20" cy="21" r="11"/><circle cx="16" cy="19" r="1.6" fill="currentColor"/><circle cx="24" cy="19" r="1.6" fill="currentColor"/><path d="M18 24 L20 26 L22 24 Z" fill="currentColor"/>` },
  { id: "owl", label: "Owl", svg: `<path d="M8 8 L14 13 Q20 11 26 13 L32 8 L32 26 Q32 36 20 36 Q8 36 8 26 Z"/><circle cx="15" cy="20" r="4.5"/><circle cx="25" cy="20" r="4.5"/><circle cx="15" cy="20" r="1.6" fill="currentColor"/><circle cx="25" cy="20" r="1.6" fill="currentColor"/><path d="M18 26 L20 30 L22 26 Z" fill="currentColor"/>` },
  { id: "penguin", label: "Penguin", svg: `<ellipse cx="20" cy="21" rx="14" ry="15"/><path d="M20 14 Q12 8 10 20 Q12 32 20 32 Q28 32 30 20 Q28 8 20 14 Z"/><circle cx="16" cy="19" r="1.6" fill="currentColor"/><circle cx="24" cy="19" r="1.6" fill="currentColor"/><path d="M17 24 L20 27 L23 24 Z" fill="currentColor"/>` },
  { id: "chick", label: "Chick", svg: `<path d="M17 9 Q19 3 20 9 Q22 4 23 9"/><circle cx="20" cy="22" r="13"/><circle cx="15" cy="20" r="1.6" fill="currentColor"/><circle cx="25" cy="20" r="1.6" fill="currentColor"/><path d="M17 25 L20 23 L23 25 L20 28 Z" fill="currentColor"/>` },
  { id: "monkey", label: "Monkey", svg: `<circle cx="7" cy="20" r="4"/><circle cx="33" cy="20" r="4"/><circle cx="20" cy="20" r="12"/><ellipse cx="20" cy="26" rx="7" ry="5"/><circle cx="16" cy="17" r="1.6" fill="currentColor"/><circle cx="24" cy="17" r="1.6" fill="currentColor"/><path d="M17 27 Q20 29 23 27"/>` },
  { id: "cow", label: "Cow", svg: `<path d="M10 12 L5 5 M30 12 L35 5"/><rect x="9" y="10" width="22" height="24" rx="9"/><ellipse cx="20" cy="28" rx="8" ry="5"/><circle cx="17" cy="28" r="1" fill="currentColor"/><circle cx="23" cy="28" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1.6" fill="currentColor"/><circle cx="25" cy="19" r="1.6" fill="currentColor"/>` },
  { id: "tiger", label: "Tiger", svg: `<circle cx="10" cy="9" r="3.5"/><circle cx="30" cy="9" r="3.5"/><circle cx="20" cy="22" r="14"/><path d="M20 8 V13 M9 16 L14 18 M31 16 L26 18 M8 25 L12 25 M32 25 L28 25"/><circle cx="15" cy="20" r="1.6" fill="currentColor"/><circle cx="25" cy="20" r="1.6" fill="currentColor"/><path d="M18 25 L20 27 L22 25 Z" fill="currentColor"/>` },
  { id: "hamster", label: "Hamster", svg: `<circle cx="10" cy="12" r="3"/><circle cx="30" cy="12" r="3"/><ellipse cx="20" cy="23" rx="15" ry="12"/><circle cx="10" cy="26" r="3"/><circle cx="30" cy="26" r="3"/><circle cx="15" cy="20" r="1.6" fill="currentColor"/><circle cx="25" cy="20" r="1.6" fill="currentColor"/><path d="M18 27 Q20 29 22 27"/>` },
  { id: "sloth", label: "Sloth", svg: `<circle cx="20" cy="21" r="14"/><ellipse cx="14" cy="20" rx="5" ry="3" transform="rotate(20 14 20)"/><ellipse cx="26" cy="20" rx="5" ry="3" transform="rotate(-20 26 20)"/><circle cx="14" cy="20" r="1.4" fill="currentColor"/><circle cx="26" cy="20" r="1.4" fill="currentColor"/><path d="M16 28 Q20 31 24 28"/>` },
  { id: "whale", label: "Whale", svg: `<path d="M4 23 Q4 12 19 12 Q33 12 33 23 Q33 32 19 32 L10 32 Q4 30 4 23 Z"/><path d="M33 22 L38 16 L38 28 Z"/><path d="M18 12 Q16 6 12 5 M18 12 Q20 6 24 5"/><circle cx="12" cy="21" r="1.6" fill="currentColor"/><path d="M8 26 Q14 29 20 26"/>` },
] as const;

// Extra faces you can set in src/data/ (event.ts, guests.ts). Not shown in the RSVP picker.
export const EXTRA_FACES = [
  { id: "angel-girl", label: "Angel girl", svg: `<path d="M10 35 Q7 28 8 19 Q9 7 20 7 Q31 7 32 19 Q33 28 30 35"/><path d="M11 20 Q11 31 20 31.5 Q29 31 29 20"/><path d="M8.5 19 Q10 8 20 8 Q30 8 31.5 19 Q29 15 26 13 Q22 17 12 18.5 Q10 19 8.5 19 Z" fill="currentColor"/><path d="M14.5 22.5 Q16 21 17.5 22.5 M22.5 22.5 Q24 21 25.5 22.5"/><path d="M14 21.5 L13 20.5 M26 21.5 L27 20.5"/><circle cx="14" cy="26" r="1.6" fill="currentColor" stroke="none" opacity="0.35"/><circle cx="26" cy="26" r="1.6" fill="currentColor" stroke="none" opacity="0.35"/><path d="M18 26.5 Q20 28.5 22 26.5"/>` },
] as const;

/** Every face AnimalFace can draw: the picker animals plus the extras. */
export const ALL_FACES = [...ANIMALS, ...EXTRA_FACES];

export type AnimalId = (typeof ANIMALS)[number]["id"] | (typeof EXTRA_FACES)[number]["id"];

// Only the picker animals: guests can't pick the extras.
export const ANIMAL_IDS = ANIMALS.map((a) => a.id) as AnimalId[];

export function isAnimalId(v: unknown): v is AnimalId {
  return typeof v === "string" && (ANIMAL_IDS as string[]).includes(v);
}
