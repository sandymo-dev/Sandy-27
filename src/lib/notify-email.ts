import type { Rsvp, RsvpStatus } from "./types";

// "Someone just RSVP'd" email to the host. Kept free of runtime imports so
// scripts/test-email.mjs can render it outside Next.

const INK = "#0A0A0A";
const PAPER = "#F5F5F0";
const SMOKE = "#BDBDB8";
const MIST = "#D6D6D1";
const SHADOW = "#3A3A3A";
const ANTON = "Anton,Impact,'Arial Narrow Bold','Arial Narrow',sans-serif";
const BODY = "Archivo,Arial,Helvetica,sans-serif";

const STATUS: Record<RsvpStatus, { word: string; emoji: string; headline: string }> = {
  yes: { word: "IN", emoji: "🍔", headline: "IS IN!" },
  maybe: { word: "NOT SURE", emoji: "🤔", headline: "IS NOT SURE YET" },
  no: { word: "CAN'T COME", emoji: "👻", headline: "CAN'T COME" },
};

export type Headcount = { yes: number; plusOnes: number; maybe: number; no: number };

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** True when the guest changed something worth an email (not just re-saving the same answer). */
export function rsvpChanged(previous: Rsvp | null, next: Rsvp): boolean {
  if (!previous) return true;
  return (
    previous.status !== next.status ||
    previous.plusOne !== next.plusOne ||
    previous.plusOneName !== next.plusOneName ||
    previous.food !== next.food ||
    previous.foodUnsure !== next.foodUnsure ||
    previous.email !== next.email
  );
}

export function countHeads(rsvps: Rsvp[]): Headcount {
  const yes = rsvps.filter((r) => r.status === "yes");
  return {
    yes: yes.length,
    plusOnes: yes.filter((r) => r.plusOne).length,
    maybe: rsvps.filter((r) => r.status === "maybe").length,
    no: rsvps.filter((r) => r.status === "no").length,
  };
}

export function notifyEmail(opts: {
  guestName: string;
  rsvp: Rsvp;
  previous: Rsvp | null;
  headcount: Headcount;
  siteUrl?: string;
}) {
  const { guestName, rsvp, previous, headcount } = opts;
  const s = STATUS[rsvp.status];
  const name = escapeHtml(guestName);
  const statusChanged = previous && previous.status !== rsvp.status;
  const updated = Boolean(previous);

  const subject = statusChanged
    ? `${s.emoji} ${guestName}: ${STATUS[previous.status].word} → ${s.word}`
    : updated
      ? `${s.emoji} ${guestName} updated their RSVP (${s.word})`
      : `${s.emoji} ${guestName} is ${s.word}`;

  const plusOne = rsvp.plusOne
    ? escapeHtml(rsvp.plusOneName || "yes") + (rsvp.plusOneAnimal ? ` (${escapeHtml(rsvp.plusOneAnimal)} face)` : "")
    : null;
  const food = rsvp.status !== "yes" ? null : rsvp.food ? escapeHtml(rsvp.food) : "Not sure yet";

  const rows: [string, string][] = [];
  if (statusChanged) rows.push(["WAS", STATUS[previous.status].word]);
  if (rsvp.status === "yes") rows.push(["+1", plusOne ?? "Solo"]);
  if (food) rows.push(["BRINGS", food]);
  if (rsvp.email) rows.push(["EMAIL", escapeHtml(rsvp.email)]);

  const row = ([label, value]: [string, string], last: boolean) => `
          <tr>
            <td style="padding:10px 0;${last ? "" : `border-bottom:2px dashed ${INK};`}font-family:${BODY};font-size:11px;font-weight:700;letter-spacing:3px;color:#5A5A5A;width:78px;vertical-align:top">${label}</td>
            <td style="padding:10px 0;${last ? "" : `border-bottom:2px dashed ${INK};`}font-family:${BODY};font-size:15px;font-weight:700;line-height:1.35;color:${INK}">${value}</td>
          </tr>`;

  const card = rows.length
    ? `
      <tr><td style="padding:22px 8px 0">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};border-right:8px solid ${SHADOW};border-bottom:8px solid ${SHADOW}">
          <tr><td style="padding:6px 18px 8px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
              ${rows.map((r, i) => row(r, i === rows.length - 1)).join("")}
            </table>
          </td></tr>
        </table>
      </td></tr>`
    : "";

  const total = headcount.yes + headcount.plusOnes;
  const stat = (n: number, label: string) => `
            <td width="33%" style="padding:12px 4px;border:2px solid ${SHADOW};text-align:center">
              <div style="font-family:${ANTON};font-size:30px;line-height:1;color:${PAPER}">${n}</div>
              <div style="margin-top:4px;font-family:${BODY};font-size:10px;font-weight:700;letter-spacing:2px;color:${SMOKE}">${label}</div>
            </td>`;

  const link = opts.siteUrl ? `${opts.siteUrl.replace(/\/$/, "")}/party` : null;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK}">
  <tr><td align="center" style="padding:0 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px">
      <tr><td style="padding:28px 8px 0">
        <p style="margin:0 0 12px;font-family:${BODY};font-size:12px;font-weight:700;letter-spacing:4px;color:${SMOKE}">NEW RSVP${updated ? " · UPDATED" : ""}</p>
        <h1 style="margin:0;font-family:${ANTON};font-size:46px;line-height:0.95;font-weight:400;color:${PAPER}">${name.toUpperCase()}<br>${s.headline} ${s.emoji}</h1>
      </td></tr>
      ${card}
      <tr><td style="padding:28px 8px 0">
        <p style="margin:0 0 10px;font-family:${BODY};font-size:12px;font-weight:700;letter-spacing:3px;color:${SMOKE}">HEADCOUNT: <span style="color:${PAPER}">${total} PEOPLE</span>${headcount.plusOnes ? ` <span style="color:${SMOKE}">(${headcount.yes} + ${headcount.plusOnes} PLUS-ONES)</span>` : ""}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
          <tr>${stat(headcount.yes, "IN")}${stat(headcount.maybe, "NOT SURE")}${stat(headcount.no, "CAN'T")}</tr>
        </table>
      </td></tr>
      ${link ? `<tr><td style="padding:22px 8px 0"><a href="${link}" style="font-family:${BODY};font-size:13px;font-weight:700;letter-spacing:2px;color:${PAPER}">SEE THE PARTY BOARD &rarr;</a></td></tr>` : ""}
      <tr><td style="padding:26px 8px 28px">
        <p style="margin:0;font-family:${BODY};font-size:12px;line-height:1.5;color:${MIST};opacity:0.7">Sent by your invite site each time a guest answers or changes their answer.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `${guestName} ${s.headline.toLowerCase()}`,
    ...rows.map(([l, v]) => `${l}: ${v.replace(/&[a-z#0-9]+;/g, (e) => ({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" })[e] ?? e)}`),
    "",
    `Headcount: ${total} people (${headcount.yes} in + ${headcount.plusOnes} plus-ones), ${headcount.maybe} not sure, ${headcount.no} can't come`,
    link ? `\n${link}` : "",
  ].join("\n");

  return { subject, html, text };
}
