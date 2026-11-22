import type { EventConfig } from "@/lib/types";

/**
 * THE PARTY DETAILS
 *
 * Everything shown on the invite lives here. Placeholders in [BRACKETS]
 * need your real info before you send the link.
 *
 * Times are in Jakarta time (WIB, UTC+7). Write them as
 * "YYYY-MM-DDTHH:mm" without a timezone; the app adds +07:00.
 */
export const event: EventConfig = {
  host: {
    name: "Sandy",
    age: 27,
    // Your photo for the Polaroid next to "SANDY 27". Put it in /public/images/.
    photo: "/images/me.png",
  },

  // You (and your +1) in THE CROWD on the party page. You're always first in line.
  crowd: {
    // Your face cut-out (transparent PNG) for your stickman head. Put it in /public/images/.
    hostPhoto: "/images/me-crop.png",
    hostAnimal: "cat", // used if hostPhoto is null
    // Your +1, drawn as an angel stickman. Set to null to hide.
    plusOne: null, // or 
    // {
    //   name: "Mahes",
    //   photo: null, // e.g. "/images/plus-one-face.png"
    //   animal: "angel-girl", // used if photo is null
    // },
  },

  tourName: "THE BURGER TOUR",

  start: "2026-12-05T16:00", // [DATE + START TIME]
  end: "2026-12-05T21:00", // [END TIME]
  timezone: "Asia/Jakarta",

  venue: {
    name: "Sandy Parent's House", // [VENUE NAME]
    address: "Jl Yanatera 4 No 5, Komplek Bulog, Jati Melati, Pondok Melati, Kota Bekasi, Jawa Barat 17414", // [VENUE ADDRESS]
    // Paste a Google Maps share link here.
    mapsUrl: "https://maps.app.goo.gl/1h97SvMQJbYqygBt5",
  },

  dressCode: "Just make sure you wear something.",

  // Shown on the invite and used to stop reminder emails after this date.
  rsvpDeadline: "2026-12-01",
  rsvpDeadlineLabel: "1 December",

  agenda: [
    {
      label: "OPENING ACT",
      time: "16:00",
      title: "NGOPI SORE WITH KOPI MO",
      description: "Afternoon coffee to warm up.",
      showMenuLink: true,
    },
    {
      label: "HEADLINER",
      time: "18:30",
      title: "BURGER POTLUCK",
      description:
        "I've got the buns, the meat and the grill. You bring any burger topping or a side dish :)",
    },
  ],

  // Kopi MO menu photo. Put it in /public/images/.
  coffeeMenuImage: "/images/Kopi MO menu.png",

  // Ideas shown as tappable chips on the RSVP "rider", group by group.
  // Within each group, the most popular one goes first.
  foodIdeas: [
    {
      group: "Topping",
      items: ["Keju", "Selada", "Tomat", "Bawang Bombay", "Acar Timun", "Telur Ceplok", "Jamur", "Jalapeño"],
    },
    // {
    //   group: "Saus",
    //   items: ["Saus Sambal", "Mayones", "Saus Tomat", "Saus BBQ", "Mustard"],
    // },
    // {
    //   group: "Pendamping",
    //   items: ["Kentang Goreng", "Onion Ring", "Salad", "Kerupuk"],
    // },
    // {
    //   group: "Camilan & Minuman",
    //   items: ["Camilan", "Minuman", "Es Batu", "Pencuci Mulut"],
    // },
  ],

  audio: {
    // Background music. Starts when the guest taps LET ME IN.
    // Drop an mp3 at public/audio/bgm.mp3 (or change the path). Missing file = silence.
    music: "/audio/bgm.mp3",
    musicVolume: 0.5,
    // Your scream / voice for the jump scare. public/audio/scare.mp3.
    scare: "/audio/scare.mp3",
  },

  jumpScare: {
    // Your ghost image (png/jpg/gif/webp). Set to null to use the drawn ghost.
    // If the file is missing, the drawn ghost is used automatically.
    image: "/images/ghost.jpg",
    durationMs: 1800,
  },

  leakPrank: {
    // How long the fake "leak" bar takes to reach 99% (then it's stuck forever).
    durationMs: 10000,
    totalFiles: 12,
    // Optional harmless blurry images (blurred burgers, landscapes...).
    // Leave empty to use grey shapes.
    images: [] as string[],
  },
};
