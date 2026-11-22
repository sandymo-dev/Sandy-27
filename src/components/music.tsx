"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type Music = {
  /** Start the music (call from a tap so browsers allow sound). */
  start: () => void;
  /** Pause without changing the guest's mute choice (e.g. for the jump scare). */
  hush: () => void;
  /** Keep music off while a screen is shown (the sad "bye" screen). */
  setSuppressed: (v: boolean) => void;
};

const MusicContext = createContext<Music>({ start: () => {}, hush: () => {}, setSuppressed: () => {} });
const UiContext = createContext<{ on: boolean; available: boolean; toggle: () => void }>({
  on: true,
  available: false,
  toggle: () => {},
});

// v2: resets any mute saved by the old toggle bug, so everyone starts unmuted.
const MUTE_KEY = "sandy27-muted-v2";

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}
function writeMuted(v: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  } catch {
    /* private mode etc. */
  }
}

export function MusicProvider({
  src,
  volume,
  children,
}: {
  src: string;
  volume: number;
  children: React.ReactNode;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const suppressed = useRef(false);
  const muted = useRef(false);
  const [on, setOn] = useState(true);
  const [available, setAvailable] = useState(true);

  const ensureAudio = useCallback(() => {
    if (audio.current) return audio.current;
    const a = new Audio(src);
    a.loop = true;
    a.volume = volume;
    a.preload = "auto";
    a.addEventListener("error", () => setAvailable(false));
    audio.current = a;
    return a;
  }, [src, volume]);

  const start = useCallback(() => {
    if (suppressed.current || muted.current) return;
    ensureAudio()
      .play()
      .catch(() => {});
  }, [ensureAudio]);

  const hush = useCallback(() => {
    audio.current?.pause();
  }, []);

  const setSuppressed = useCallback((v: boolean) => {
    suppressed.current = v;
    if (v) audio.current?.pause();
    // Coming back from a silent screen (or the jump scare's hush): resume
    // unless the guest muted it themselves.
    else if (!muted.current && audio.current) audio.current.play().catch(() => {});
  }, []);

  // Toggle the guest's choice (not the current play state), so the first tap
  // landing on the button doesn't start-then-immediately-pause the music.
  const toggle = useCallback(() => {
    const next = !muted.current;
    muted.current = next;
    setOn(!next);
    writeMuted(next);
    if (next) audio.current?.pause();
    else if (!suppressed.current) ensureAudio().play().catch(() => {});
  }, [ensureAudio]);

  // Music is on by default: try to autoplay right away, and if the browser
  // blocks it, start on the first interaction anywhere.
  useEffect(() => {
    muted.current = readMuted();
    setOn(!muted.current);
    start();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    const onFirst = () => {
      events.forEach((e) => window.removeEventListener(e, onFirst));
      if (audio.current?.paused !== false) start();
    };
    events.forEach((e) => window.addEventListener(e, onFirst));
    return () => events.forEach((e) => window.removeEventListener(e, onFirst));
  }, [start]);

  useEffect(() => () => audio.current?.pause(), []);

  const api = useMemo(() => ({ start, hush, setSuppressed }), [start, hush, setSuppressed]);
  const ui = useMemo(() => ({ on, available, toggle }), [on, available, toggle]);

  return (
    <MusicContext.Provider value={api}>
      <UiContext.Provider value={ui}>{children}</UiContext.Provider>
    </MusicContext.Provider>
  );
}

export function useMusic(): Music {
  return useContext(MusicContext);
}

export function MusicToggle() {
  const { on: playing, available, toggle } = useContext(UiContext);
  if (!available) return null;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={playing ? "Mute music" : "Play music"}
      aria-pressed={playing}
      className="fixed right-4 bottom-6 z-40 flex h-12 w-12 items-center justify-center border-[3px] border-paper bg-ink text-paper hard-shadow"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
        {playing ? (
          <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
        ) : (
          <path d="M17 9l5 6M22 9l-5 6" />
        )}
      </svg>
    </button>
  );
}
