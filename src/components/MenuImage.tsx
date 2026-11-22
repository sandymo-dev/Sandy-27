"use client";

import { useState } from "react";
import { SafeImage } from "@/components/SafeImage";

/** Taped-on menu photo. Tap to see it full screen (pinch to zoom works there). */
export function MenuImage({ src }: { src: string }) {
  const [open, setOpen] = useState(false);
  const placeholder = (
    <div className="placeholder-hatch flex h-[400px] w-full flex-col items-center justify-center gap-2 text-ink">
      <span className="font-anton text-lg tracking-[0.08em]">[KOPI MO MENU IMAGE]</span>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the coffee menu full screen"
        className="tape relative w-[300px] -rotate-2 bg-paper px-2.5 pt-2.5 pb-10 hard-shadow-lg"
      >
        <SafeImage src={src} alt="Kopi MO menu" className="max-h-[440px] w-full object-cover object-top" fallback={placeholder} />
        <span className="absolute inset-x-0 bottom-2 text-center font-marker text-lg text-ink">tap to zoom</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Coffee menu"
          className="fixed inset-0 z-50 flex flex-col bg-ink/95"
        >
          <div className="flex justify-end p-3">
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              className="min-h-12 border-[3px] border-paper px-4 font-anton text-lg tracking-[0.12em]"
            >
              CLOSE
            </button>
          </div>
          <div className="flex-1 overflow-auto p-3" style={{ touchAction: "pinch-zoom pan-x pan-y" }}>
            <SafeImage src={src} alt="Kopi MO menu" className="mx-auto w-full max-w-[900px]" fallback={placeholder} />
          </div>
        </div>
      )}
    </>
  );
}
