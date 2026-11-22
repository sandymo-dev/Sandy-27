import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sandy27_guest";
const SIXTY_DAYS = 60 * 60 * 24 * 60;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEV_SECRET !== "1") {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 16 characters. Add it in your Vercel project settings.",
    );
  }
  return "dev-only-secret-do-not-use-in-production";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

/** value -> "value.signature" */
export function seal(value: string): string {
  return `${value}.${sign(value)}`;
}

/** "value.signature" -> value, or null if tampered. */
export function unseal(token: string | undefined | null): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const value = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(value));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return value;
}

/** Short-lived token proving the server found this guest by name. */
export function makeMatchToken(guestId: string): string {
  const expires = Date.now() + 10 * 60 * 1000;
  return seal(`match:${guestId}:${expires}`);
}

export function readMatchToken(token: string): string | null {
  const value = unseal(token);
  if (!value) return null;
  const [kind, guestId, expires] = value.split(":");
  if (kind !== "match" || !guestId || Number(expires) < Date.now()) return null;
  return guestId;
}

/** Short-lived token: name matched, now waiting for the magic word. */
export function makeMagicToken(guestId: string): string {
  const expires = Date.now() + 10 * 60 * 1000;
  return seal(`magic:${guestId}:${expires}`);
}

export function readMagicToken(token: string): string | null {
  const value = unseal(token);
  if (!value) return null;
  const [kind, guestId, expires] = value.split(":");
  if (kind !== "magic" || !guestId || Number(expires) < Date.now()) return null;
  return guestId;
}

export async function getSessionGuestId(): Promise<string | null> {
  const store = await cookies();
  const value = unseal(store.get(COOKIE_NAME)?.value);
  if (!value?.startsWith("guest:")) return null;
  return value.slice("guest:".length);
}

export async function setSession(guestId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, seal(`guest:${guestId}`), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SIXTY_DAYS,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
