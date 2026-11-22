import { event } from "@/data/event";

const OFFSET = "+07:00"; // Jakarta (WIB) has no daylight saving.

export function eventDate(local: string): Date {
  return new Date(`${local}:00${OFFSET}`);
}

function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

const title = () => `${event.host.name}'s ${event.host.age}th — ${event.tourName}`;

function details(): string {
  const agenda = event.agenda.map((a) => `${a.time} ${a.title}`).join("\n");
  return `${agenda}\n\nDress code: ${event.dressCode}`;
}

const location = () => `${event.venue.name}, ${event.venue.address}`;

export function buildIcs(): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//sandy27//burger-tour//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sandy27-${event.start}@burger-tour`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(eventDate(event.start))}`,
    `DTEND:${icsStamp(eventDate(event.end))}`,
    `SUMMARY:${icsEscape(title())}`,
    `DESCRIPTION:${icsEscape(details())}`,
    `LOCATION:${icsEscape(location())}`,
    `URL:${event.venue.mapsUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT3H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(title())}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

export function googleCalendarUrl(): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title(),
    dates: `${icsStamp(eventDate(event.start))}/${icsStamp(eventDate(event.end))}`,
    details: details(),
    location: location(),
    ctz: event.timezone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** "SAT 12 DEC" */
export function formatDateLabel(): string {
  const d = eventDate(event.start);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: event.timezone,
  })
    .format(d)
    .replace(",", "")
    .toUpperCase();
}

/** "15:00 – 21:00" */
export function formatTimeLabel(): string {
  const f = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: event.timezone,
  });
  return `${f.format(eventDate(event.start))} – ${f.format(eventDate(event.end))}`;
}

/** True once the RSVP deadline day (Jakarta time) is over. */
export function isPastDeadline(now = new Date()): boolean {
  return now.getTime() > eventDate(`${event.rsvpDeadline}T23:59`).getTime();
}
