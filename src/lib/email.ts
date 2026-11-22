import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { event } from "@/data/event";
import { reminderEmail } from "@/lib/reminder-email";

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
