"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMusic } from "@/components/music";
import { btnLight, Marker, Shell } from "@/components/ui";

const TILE_GRADIENTS = [
  "radial-gradient(circle at 40% 45%, #E8E8E3 0 30%, #6E6E6E 55%, #2A2A2A 100%)",
  "linear-gradient(160deg, #BDBDB8, #3A3A3A)",
  "radial-gradient(circle at 60% 60%, #F5F5F0 0 22%, #8A8A8A 45%, #1F1F1F 100%)",
  "linear-gradient(30deg, #4A4A4A, #D6D6D1 60%, #6E6E6E)",
  "radial-gradient(ellipse at 50% 30%, #CFCFCF 0 35%, #4A4A4A 80%)",
  "linear-gradient(200deg, #E8E8E3, #2A2A2A 70%)",
];

/** "FUCK YOU AND YOUR PLAN." + the fake nude-leak bar that gets stuck at 99%. It's a joke: nothing is sent. */
export function ByeScreen({
  hostName,
  hostAge,
  durationMs,
  totalFiles,
  images,
  onChangeMind,
}: {
  hostName: string;
  hostAge: number;
  durationMs: number;
  totalFiles: number;
  images: string[];
  /** Inside the RSVP flow: go back to the form. Elsewhere it links to /rsvp. */
  onChangeMind?: () => void;
}) {
  const music = useMusic();
  const progress = useLeakProgress(durationMs);
  const stuck = progress >= 99;
  const uploaded = Math.min(totalFiles - 1, Math.floor((progress / 100) * totalFiles));

  useEffect(() => {
    music.setSuppressed(true);
    return () => music.setSuppressed(false);
  }, [music]);

  const tiles = images.length > 0 ? images.slice(0, 6) : TILE_GRADIENTS;

  return (
    <Shell className="gap-2!">
      <div className="flex items-baseline gap-3">
        <span className="font-anton text-[96px] leading-[0.85]">FUCK</span>
        <span className="outline-text font-anton text-[96px] leading-[0.85]">YOU</span>
      </div>
      <div className="mt-1.5 -rotate-2 self-start bg-paper px-3 py-1.5 text-ink">
        <span className="font-anton text-4xl tracking-[0.04em]">AND YOUR PLAN.</span>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-[3px] border-paper p-4">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3L2 21h20z" />
            <path d="M12 10v5M12 18v.5" />
          </svg>
          <span className="font-anton text-[22px] tracking-[0.06em]">LEAKING YOUR NUDES…</span>
        </div>
        <span className="text-sm text-mist">
          {stuck ? "Sending to the group chat… almost there" : "Sending to the group chat"}
        </span>
        <div
          className="h-3.5 border-2 border-paper p-0.5"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.floor(progress)}
          aria-label="Upload progress"
        >
          <div className="h-full bg-paper" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between font-anton text-sm tracking-[0.1em] text-smoke">
          <span>
            {uploaded} OF {totalFiles} UPLOADED
          </span>
          <span className={stuck ? "blink" : ""}>{Math.floor(progress)}%</span>
        </div>
        <div className="grid grid-cols-3 gap-2" aria-hidden="true">
          {tiles.map((t, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden transition-opacity duration-500"
              style={{ opacity: i < Math.ceil((progress / 100) * tiles.length) ? 1 : 0.15 }}
            >
              {images.length > 0 ? (
                <img src={t} alt="" className="h-full w-full scale-110 object-cover blur-[6px]" />
              ) : (
                <div className="h-full w-full blur-[5px]" style={{ background: t }} />
              )}
            </div>
          ))}
        </div>
        {stuck && <span className="blink font-anton text-sm tracking-[0.16em] text-smoke">RETRYING…</span>}
      </div>

      <Marker className="mt-auto -rotate-2 self-end text-xl">
        — {hostName}, {hostAge}, hurt
      </Marker>

      {onChangeMind ? (
        <button type="button" className={`${btnLight} mt-4`} onClick={onChangeMind}>
          WAIT, I CHANGED MY MIND
        </button>
      ) : (
        <Link href="/rsvp" className={`${btnLight} mt-4`}>
          WAIT, I CHANGED MY MIND
        </Link>
      )}
    </Shell>
  );
}

/** 0 → 99 over `durationMs` (fast start, slow finish), then stuck at 99 forever. */
function useLeakProgress(durationMs: number): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 2.2);
      setP(Math.min(99, eased * 99));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs]);
  return p;
}
