/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { ALL_FACES, type AnimalId } from "@/components/animals";

/** Phone-width page frame with the checker strips top and bottom. */
export function Shell({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <main className="halftone min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col">
        <div className="checker" />
        <div className={`relative flex flex-1 flex-col ${padded ? "gap-7 px-6 pt-7 pb-10" : ""} ${className}`}>
          {children}
        </div>
        <div className="checker" />
      </div>
    </main>
  );
}

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-anton text-base tracking-[0.22em] text-smoke ${className}`}>{children}</span>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-anton text-3xl leading-none">{children}</h2>
      <div className="h-[3px] flex-1 bg-paper" />
    </div>
  );
}

export function Marker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`font-marker ${className}`}>{children}</span>;
}

export const btnLight =
  "flex min-h-14 items-center justify-center bg-paper px-4 font-anton text-2xl tracking-[0.1em] text-ink hard-shadow active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60";
export const btnDark =
  "flex min-h-14 items-center justify-center border-[3px] border-paper bg-ink px-4 font-anton text-2xl tracking-[0.1em] text-paper active:bg-shadow disabled:opacity-60";
export const inputDark =
  "h-12 w-full rounded-none border-[3px] border-paper bg-ink px-3 font-body text-base font-semibold text-paper placeholder:text-smoke";
export const inputLight =
  "h-13 w-full rounded-none border-[3px] border-ink bg-paper px-3.5 font-body text-[17px] font-semibold text-ink placeholder:text-[#6b6b6b]";

export function Star({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1l3 8h8l-6.5 5 2.5 8-7-5-7 5 2.5-8L1 9h8z" />
    </svg>
  );
}

export function Bolt({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L4 14h6l-1 8 9-12h-6z" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function CameraIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18v12H3z" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  );
}

type BurgerProps = { size?: number; tone?: "light" | "dark"; bolt?: boolean; sad?: boolean };

/** The burger mascot. light = white burger for dark backgrounds. */
export function Burger({ size = 150, tone = "light", bolt = false, sad = false }: BurgerProps) {
  const fg = tone === "light" ? "#F5F5F0" : "#0A0A0A";
  const bg = tone === "light" ? "#0A0A0A" : "#F5F5F0";
  return (
    <svg width={size} height={size * 0.83} viewBox="0 0 120 100" aria-hidden="true">
      {bolt && <path d="M70 2 L58 22 L66 22 L56 40 L76 16 L68 16 L78 2 Z" fill={fg} />}
      <path d="M12 46 Q12 14 60 14 Q108 14 108 46 Z" fill={fg} />
      {sad ? (
        <>
          <circle cx="46" cy="32" r="4" fill={bg} />
          <circle cx="74" cy="32" r="4" fill={bg} />
          <path d="M44 22 l8 4 M76 22 l-8 4" stroke={bg} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M50 42 q10 -7 20 0" fill="none" stroke={bg} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M44 37 q-2 6 0 9" fill="none" stroke={bg} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <path d="M38 28 l5 -2 M80 30 l5 -1 M48 38 l4 2 M70 38 l5 0" stroke={bg} strokeWidth="3" strokeLinecap="round" />
      )}
      <path d="M8 54 q6 -7 13 0 t13 0 t13 0 t13 0 t13 0 t13 0 t13 0 t13 0" fill="none" stroke={fg} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 62 L106 62 L96 74 L86 63 L74 76 L64 63 L54 72 L44 63 Z" fill={fg} />
      <rect x="9" y="66" width="102" height="14" rx="7" fill={fg} stroke={bg} strokeWidth="3" />
      <path d="M12 85 L108 85 Q108 97 96 97 L24 97 Q12 97 12 85 Z" fill={fg} />
    </svg>
  );
}

export function AnimalFace({
  id,
  size = 34,
  className = "",
}: {
  id: AnimalId;
  size?: number;
  className?: string;
}) {
  const animal = ALL_FACES.find((a) => a.id === id) ?? ALL_FACES[0];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={`${animal.label} face`}
      dangerouslySetInnerHTML={{ __html: animal.svg }}
    />
  );
}

/** Round head: a face photo, or an animal face when there's no photo. */
export function Head({
  photo,
  animal,
  size,
  border = 3,
  tone = "light",
  bare = false,
  alt,
}: {
  photo?: string | null;
  animal?: AnimalId | null;
  size: number;
  border?: number;
  tone?: "light" | "dark";
  /** Drop the circular frame and show the face on its own. */
  bare?: boolean;
  alt: string;
}) {
  const ring = tone === "light" ? "border-paper bg-ink text-paper" : "border-ink bg-paper text-ink";
  const frame = bare
    ? tone === "light" ? "text-paper" : "text-ink"
    : `overflow-hidden rounded-full ${ring}`;
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${frame}`}
      style={{ width: size, height: size, borderWidth: bare ? 0 : border }}
    >
      {photo ? (
        <img src={photo} alt={alt} className={`h-full w-full ${bare ? "object-contain" : "object-cover"}`} draggable={false} />
      ) : (
        <AnimalFace id={animal ?? "cat"} size={Math.round(size * 0.78)} />
      )}
    </div>
  );
}

export type Pose = "up" | "wave" | "dance";

/** Stick-figure body; the head is drawn separately and sits on top. */
export function StickBody({
  pose = "up",
  width = 50,
  stroke = 3.2,
  color = "currentColor",
  angel = false,
}: {
  pose?: Pose;
  width?: number;
  stroke?: number;
  color?: string;
  /** Feathery wings behind the shoulders. */
  angel?: boolean;
}) {
  const d =
    pose === "up"
      ? "M25 8 V34 M25 16 L10 2 M25 16 L40 2 M25 34 L12 56 M25 34 L38 56"
      : pose === "wave"
        ? "M25 8 V34 M25 16 L44 6 M25 16 L8 26 M25 34 L6 46 M25 34 L36 60"
        : "M25 8 V34 M25 16 L6 10 M25 16 L42 24 M25 34 L14 58 M25 34 L42 50";
  return (
    <svg width={width} height={width * 1.24} viewBox="0 0 50 62" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" overflow="visible">
      {angel && (
        <path
          d="M24 15 C18 5 8 1 2 3 C1 7 3 10 6 11 C2 13 3 17 8 17 C6 20 9 23 14 21 C17 23 21 21 24 19 Z M26 15 C32 5 42 1 48 3 C49 7 47 10 44 11 C48 13 47 17 42 17 C44 20 41 23 36 21 C33 23 29 21 26 19 Z"
          fill="#F5F5F0"
          strokeWidth={stroke * 0.6}
        />
      )}
      <path d={d} />
    </svg>
  );
}

export function GhostSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 230 320" className={className} aria-hidden="true">
      <path
        d="M115 6 C50 6 20 60 20 130 V300 L44 278 L68 302 L92 278 L115 304 L138 278 L162 302 L186 278 L210 300 V130 C210 60 180 6 115 6 Z"
        fill="#0A0A0A"
      />
      <ellipse cx="80" cy="120" rx="22" ry="34" fill="#F5F5F0" transform="rotate(-10 80 120)" />
      <ellipse cx="150" cy="120" rx="22" ry="34" fill="#F5F5F0" transform="rotate(10 150 120)" />
      <circle cx="84" cy="130" r="7" fill="#0A0A0A" />
      <circle cx="146" cy="130" r="7" fill="#0A0A0A" />
      <ellipse cx="115" cy="210" rx="30" ry="46" fill="#F5F5F0" />
      <path d="M14 140 L-8 120 M14 170 L-10 168 M216 140 L238 120 M216 170 L240 168" stroke="#0A0A0A" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
