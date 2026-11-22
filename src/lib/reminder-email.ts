import type { EventConfig } from "./types";

// The "still not sure?" reminder email. Kept free of runtime imports so
// scripts/test-email.mjs can render it outside Next.
//
// Email clients ignore most CSS (no gradients, transforms, text-stroke or
// box-shadow in Gmail), so the site's look is rebuilt with tables: the checker
// strip is table cells, the hard shadow is a thick right/bottom border.
// Anton loads in Apple Mail / iOS; Gmail falls back to Impact.

const INK = "#0A0A0A";
const PAPER = "#F5F5F0";
const SMOKE = "#BDBDB8";
const MIST = "#D6D6D1";
const SHADOW = "#3A3A3A";
const ANTON = "Anton,Impact,'Arial Narrow Bold','Arial Narrow',sans-serif";
const BODY = "Archivo,Arial,Helvetica,sans-serif";
const MARKER = "'Permanent Marker','Comic Sans MS',cursive";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function checker(dark: boolean): string {
  const cell = (on: boolean) =>
    `<td width="16" height="16" style="width:16px;height:16px;font-size:0;line-height:0;background:${on ? PAPER : INK}">&nbsp;</td>`;
  const row = (offset: number) =>
    `<tr>${Array.from({ length: 30 }, (_, i) => cell((i + offset) % 2 === (dark ? 1 : 0))).join("")}</tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;border-collapse:collapse">${row(0)}${row(1)}</table>`;
}

function when(event: EventConfig): { date: string; time: string } {
  const tz = event.timezone;
  const start = new Date(`${event.start}:00+07:00`);
  const end = new Date(`${event.end}:00+07:00`);
  const date = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz })
    .format(start)
    .replace(",", "");
  const hm = (d: Date) =>
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: tz }).format(d);
  return { date: date.toUpperCase(), time: `${hm(start)} – ${hm(end)} WIB` };
}

export function reminderEmail(event: EventConfig, name: string, siteUrl: string) {
  const host = escapeHtml(event.host.name);
  const tour = escapeHtml(event.tourName);
  const guest = escapeHtml(name).toUpperCase();
  const deadline = escapeHtml(event.rsvpDeadlineLabel).toUpperCase();
  const link = `${siteUrl.replace(/\/$/, "")}/rsvp`;
  const { date, time } = when(event);

  const detail = (label: string, value: string, last = false) => `
          <tr>
            <td style="padding:12px 0;${last ? "" : `border-bottom:2px dashed ${INK};`}font-family:${BODY};font-size:11px;font-weight:700;letter-spacing:3px;color:#5A5A5A;width:84px;vertical-align:top">${label}</td>
            <td style="padding:12px 0;${last ? "" : `border-bottom:2px dashed ${INK};`}font-family:${ANTON};font-size:20px;line-height:1.15;color:${INK};text-transform:uppercase">${value}</td>
          </tr>`;

  const subject = `Still not sure? ${event.host.name}'s ${event.host.age}th is waiting`;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;700&family=Permanent+Marker&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${INK}">
<div style="display:none;max-height:0;overflow:hidden">Answer before ${deadline}. One tap, takes five seconds.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK}">
  <tr><td align="center" style="padding:0 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px">
      <tr><td style="padding-top:24px">${checker(false)}</td></tr>

      <tr><td style="padding:36px 8px 0">
        <p style="margin:0 0 14px;font-family:${BODY};font-size:12px;font-weight:700;letter-spacing:4px;color:${SMOKE}">${tour} · RSVP</p>
        <h1 style="margin:0;font-family:${ANTON};font-size:58px;line-height:0.95;font-weight:400;color:${PAPER};letter-spacing:0.5px">STILL<br>NOT SURE,<br>${guest}?</h1>
        <p style="margin:18px 0 0;font-family:${MARKER};font-size:20px;line-height:1.3;color:${PAPER}">you asked me to remind you :)</p>
        <p style="margin:14px 0 0;font-family:${BODY};font-size:16px;line-height:1.55;color:${MIST}">
          ${host}'s ${event.host.age}th needs your answer. Tap below and tell me if you're coming.
        </p>
      </td></tr>

      <tr><td style="padding:28px 8px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};border-right:8px solid ${SHADOW};border-bottom:8px solid ${SHADOW}">
          <tr><td style="padding:6px 20px 6px;background:${INK};border:3px solid ${PAPER};border-bottom:0">
            <p style="margin:0;font-family:${BODY};font-size:11px;font-weight:700;letter-spacing:4px;color:${PAPER}">ADMIT ONE · ${tour}</p>
          </td></tr>
          <tr><td style="padding:8px 20px 10px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
              ${detail("DATE", date)}
              ${detail("TIME", time)}
              ${detail("VENUE", escapeHtml(event.venue.name), true)}
            </table>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:30px 8px 0">
        <p style="margin:0 0 14px;font-family:${BODY};font-size:12px;font-weight:700;letter-spacing:3px;color:${SMOKE}">ANSWER BEFORE <span style="color:${PAPER}">${deadline}</span></p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="background:${PAPER};border-right:6px solid ${SHADOW};border-bottom:6px solid ${SHADOW}">
            <a href="${link}" style="display:inline-block;padding:16px 30px;font-family:${ANTON};font-size:24px;letter-spacing:2px;color:${INK};text-decoration:none">DECIDE NOW &rarr;</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:32px 8px 0">
        <p style="margin:0;font-family:${BODY};font-size:13px;line-height:1.5;color:${SMOKE}">
          If the button doesn't open your invite, open the link ${host} sent you on WhatsApp.
        </p>
      </td></tr>

      <tr><td style="padding:28px 0 24px">${checker(true)}</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `STILL NOT SURE, ${name.toUpperCase()}?`,
    "",
    `You asked me to remind you. ${event.host.name}'s ${event.host.age}th needs your answer before ${event.rsvpDeadlineLabel}.`,
    "",
    `${date} · ${time}`,
    event.venue.name,
    "",
    `Decide now: ${link}`,
  ].join("\n");

  return { subject, html, text };
}
