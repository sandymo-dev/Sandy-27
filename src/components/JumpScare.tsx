"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SafeImage } from "@/components/SafeImage";
import { GhostSvg } from "@/components/ui";

gsap.registerPlugin(useGSAP);

/** Full-screen white flash + ghost + shake. The sound is started by the tap that opens this. */
export function JumpScare({
  image,
  durationMs,
  onDone,
}: {
  image: string | null;
  durationMs: number;
  onDone: () => void;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  }, [onDone]);

  useEffect(() => {
    navigator.vibrate?.([250, 80, 350]);
    const t = window.setTimeout(() => done.current(), durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs]);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.from(".ghost", { scale: 0.15, duration: 0.14, ease: "power4.out" })
        .from(".boo", { scale: 3, opacity: 0, duration: 0.18, ease: "power4.out" }, 0.05)
        .to(".shake", {
          x: () => gsap.utils.random(-18, 18),
          y: () => gsap.utils.random(-14, 14),
          rotation: () => gsap.utils.random(-4, 4),
          duration: 0.05,
          repeat: Math.max(6, Math.floor(durationMs / 50) - 6),
          yoyo: true,
          repeatRefresh: true,
          ease: "none",
        }, 0.1);
      gsap.to(".ghost", { scale: 1.12, duration: durationMs / 1000, ease: "power1.in" });
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      role="alert"
      aria-label="Boo!"
      className="fixed inset-0 z-50 overflow-hidden bg-paper text-ink"
    >
      <div className="shake absolute inset-0 flex items-center justify-center">
        <div className="ghost relative flex h-[88vh] w-[130vw] max-w-[720px] items-center justify-center">
          <SafeImage
            src={image}
            alt=""
            className="h-full w-full object-contain"
            fallback={<GhostSvg className="h-full w-full" />}
          />
        </div>
        <span className="boo absolute top-10 left-6 -rotate-[8deg] font-anton text-[150px] leading-[0.85]">
          BOO!
        </span>
      </div>
    </div>
  );
}
