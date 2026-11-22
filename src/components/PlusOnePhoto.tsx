"use client";
/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from "react";
import { CameraIcon } from "@/components/ui";

/** Polaroid camera button: snaps (or picks) a selfie, shrinks it, uploads it. */
export function PlusOnePhoto({
  url,
  onUploaded,
}: {
  url: string | null;
  onUploaded: (url: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setBusy(true);
    try {
      const { default: compress } = await import("browser-image-compression");
      const small = await compress(file, {
        maxWidthOrHeight: 480,
        maxSizeMB: 0.25,
        useWebWorker: true,
        fileType: "image/jpeg",
      });
      const body = new FormData();
      body.append("photo", small, "plus-one.jpg");
      const res = await fetch("/api/plus-one-photo", { method: "POST", body });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Upload failed");
      onUploaded(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        aria-label={url ? "Retake the photo of your +1" : "Take a photo of your +1"}
        className="shrink-0 -rotate-[4deg] bg-paper px-[7px] pt-[7px] pb-[22px] hard-shadow"
      >
        <span className="flex h-[86px] w-[86px] items-center justify-center overflow-hidden bg-ink text-paper">
          {busy ? (
            <span className="blink font-anton text-sm tracking-widest">…</span>
          ) : url ? (
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <CameraIcon />
          )}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handle(f);
          e.target.value = "";
        }}
      />
      {error && (
        <span role="alert" className="max-w-[120px] text-xs text-mist">
          {error}
        </span>
      )}
    </div>
  );
}
