import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { event } from "@/data/event";
import { countHeads, notifyEmail, rsvpChanged } from "@/lib/notify-email";
import { reminderEmail } from "@/lib/reminder-email";
import type { Rsvp } from "@/lib/types";

export function emailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      // Google shows app passwords with spaces; SMTP needs them without.
      pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, ""),
    },
  });
  return transporter;
}

/**
 * Emails the host when a guest answers or changes their answer.
 * Goes to NOTIFY_EMAIL, or GMAIL_USER if that's not set. Does nothing
 * when Gmail isn't configured or the guest re-saved the same answer.
 */
export async function notifyHost(guestName: string, rsvp: Rsvp, previous: Rsvp | null, all: Rsvp[]) {
  if (!emailConfigured() || !rsvpChanged(previous, rsvp)) return;
  const to = process.env.NOTIFY_EMAIL || process.env.GMAIL_USER!;
  const { subject, html, text } = notifyEmail({
    guestName,
    rsvp,
    previous,
    headcount: countHeads(all),
    siteUrl: process.env.SITE_URL,
  });
  await getTransporter().sendMail({
    from: { name: `${event.tourName} RSVP`, address: process.env.GMAIL_USER! },
    to,
    subject,
    html,
    text,
  });
}

export async function sendReminder(to: string, name: string, siteUrl: string) {
  const { subject, html, text } = reminderEmail(event, name, siteUrl);
  await getTransporter().sendMail({
    from: { name: process.env.REMINDER_FROM_NAME || event.host.name, address: process.env.GMAIL_USER! },
    to,
    subject,
    html,
    text,
  });
}
