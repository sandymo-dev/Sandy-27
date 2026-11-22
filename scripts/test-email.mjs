// Sends the real "still not sure?" reminder email so you can see the design.
// Uses the same template (src/lib/reminder-email.ts) and Gmail transport as the app.
//
//   npm run test-email                     -> sends to the default address below
//   npm run test-email -- friend@x.com     -> sends to another address
//   npm run test-email -- --preview        -> no email; writes .data/reminder-preview.html
//
// Reads GMAIL_USER, GMAIL_APP_PASSWORD, REMINDER_FROM_NAME and SITE_URL from .env.local.
import { mkdir, writeFile } from "node:fs/promises";
import nodemailer from "nodemailer";
import { event } from "../src/data/event.ts";
import { reminderEmail } from "../src/lib/reminder-email.ts";

const DEFAULT_TO = "sandymoh99@gmail.com";
const GUEST_NAME = "Sandy"; // the name shown in "STILL NOT SURE, ___?"

const args = process.argv.slice(2);
const preview = args.includes("--preview");
const to = args.find((a) => !a.startsWith("--")) || DEFAULT_TO;
const siteUrl = process.env.SITE_URL || "http://localhost:3000";

const { subject, html, text } = reminderEmail(event, GUEST_NAME, siteUrl);

if (preview) {
  await mkdir(".data", { recursive: true });
  await writeFile(".data/reminder-preview.html", html);
  console.log("Wrote .data/reminder-preview.html (open it in your browser)");
  process.exit(0);
}

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
const fromName = process.env.REMINDER_FROM_NAME || event.host.name;

if (!user || user === "you@gmail.com" || !pass) {
  console.error("Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local first.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

try {
  await transporter.verify();
  console.log(`Logged in to Gmail as ${user}`);
  const info = await transporter.sendMail({
    from: { name: fromName, address: user },
    to,
    subject: `[TEST] ${subject}`,
    html,
    text,
  });
  console.log(`Sent to ${to} (message id ${info.messageId})`);
} catch (e) {
  console.error("Failed:", e.message);
  if (e.code === "EAUTH") {
    console.error(
      "Gmail rejected the login. Check that GMAIL_APP_PASSWORD is an app password (16 letters),\n" +
        "not your normal Gmail password, and that 2-Step Verification is on.",
    );
  }
  process.exit(1);
}
