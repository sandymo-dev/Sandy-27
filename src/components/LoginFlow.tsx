"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { checkMagicWord, confirmGuest, lookupGuest } from "@/app/actions";
import { useMusic } from "@/components/music";
import { Burger, Head, Marker, Shell, Star, btnDark, btnLight, inputLight } from "@/components/ui";
import type { PublicGuest } from "@/lib/types";

gsap.registerPlugin(useGSAP);

type Stage =
  | { kind: "enter" }
  | { kind: "match"; guest: PublicGuest; token: string }
  | { kind: "magic"; challenge: string }
  | { kind: "notfound" };

export function LoginFlow() {
  const [stage, setStage] = useState<Stage>({ kind: "enter" });
  const [name, setName] = useState("");

  if (stage.kind === "match") {
    return (
      <MatchScreen
        guest={stage.guest}
        token={stage.token}
        onNope={() => {
          setName("");
          setStage({ kind: "enter" });
        }}
      />
    );
  }
  if (stage.kind === "magic") {
    return (
      <MagicWord
        challenge={stage.challenge}
        onPass={(guest, token) => setStage({ kind: "match", guest, token })}
        onBack={() => {
          setName("");
          setStage({ kind: "enter" });
        }}
      />
    );
  }
  if (stage.kind === "notfound") {
    return <NotInvited onRetry={() => setStage({ kind: "enter" })} />;
  }
  return <EnterName name={name} setName={setName} onResult={setStage} />;
}

function EnterName({
  name,
  setName,
  onResult,
}: {
  name: string;
  setName: (v: string) => void;
  onResult: (s: Stage) => void;
}) {
  const music = useMusic();
  const [pending, startTransition] = useTransition();

  return (
    <Shell>
      <div className="flex items-center justify-center gap-2.5">
        <Star />
        <span className="font-anton text-lg tracking-[0.18em]">ONE NIGHT ONLY</span>
        <Star />
      </div>

      <form
        className="flex -rotate-2 flex-col gap-4 bg-paper px-5 pt-5 pb-6 text-ink hard-shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          music.start();
          startTransition(async () => {
            const r = await lookupGuest(name);
            if (r.found === "magic") onResult({ kind: "magic", challenge: r.challenge });
            else if (r.found) onResult({ kind: "match", guest: r.guest, token: r.token });
            else onResult({ kind: "notfound" });
          });
        }}
      >
        <div className="h-3 w-14 self-center rounded-md bg-ink" aria-hidden="true" />
        <div className="flex items-start justify-between">
          <h1 className="flex flex-col font-anton text-[52px] leading-[0.9]">
            <span>BACKSTAGE</span>
            <span>PASS</span>
          </h1>
          <Burger size={78} tone="dark" />
        </div>
        <Marker className="text-xl">Is your name on the list?</Marker>
        <label htmlFor="guest-name" className="font-anton text-sm tracking-[0.16em]">
          NAME OR PSN
        </label>
        <input
          id="guest-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name or PSN"
          autoComplete="off"
          autoCapitalize="words"
          enterKeyHint="go"
          maxLength={80}
          className={`${inputLight} -mt-2`}
        />
        <button type="submit" disabled={pending || !name.trim()} className="flex min-h-14 items-center justify-center bg-ink font-anton text-2xl tracking-[0.12em] text-paper disabled:opacity-60">
          {pending ? "CHECKING THE LIST…" : "LET ME IN"}
        </button>
      </form>

      <Marker className="mt-auto text-center text-[17px] text-mist">
        Whatever your friends call you. Name or PSN both work.
      </Marker>
    </Shell>
  );
}

function MagicWord({
  challenge,
  onPass,
  onBack,
}: {
  challenge: string;
  onPass: (guest: PublicGuest, token: string) => void;
  onBack: () => void;
}) {
  const [word, setWord] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <Shell>
      <div className="flex items-center justify-center gap-2.5">
        <Star />
        <span className="font-anton text-lg tracking-[0.18em]">VIP ONLY</span>
        <Star />
      </div>

      <form
        className="flex rotate-1 flex-col gap-4 bg-paper px-5 pt-5 pb-6 text-ink hard-shadow-lg"
        onSubmit={(e) => {
          e.preventDefault();
          if (!word.trim()) return;
          setError(null);
          startTransition(async () => {
            const r = await checkMagicWord(challenge, word);
            if (r.ok) onPass(r.guest, r.token);
            else if (r.expired) onBack();
            else {
              setWord("");
              setError("Nope. That's not it.");
            }
          });
        }}
      >
        <div className="h-3 w-14 self-center rounded-md bg-ink" aria-hidden="true" />
        <h1 className="flex flex-col font-anton text-[52px] leading-[0.9]">
          <span>WHAT IS YOUR</span>
          <span>MAGIC WORD?</span>
        </h1>
        <Marker className="text-xl">This name needs a password.</Marker>
        <label htmlFor="magic-word" className="font-anton text-sm tracking-[0.16em]">
          MAGIC WORD
        </label>
        <input
          id="magic-word"
          name="magic-word"
          type="password"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Say the magic word"
          autoComplete="off"
          autoFocus
          enterKeyHint="go"
          maxLength={80}
          className={`${inputLight} -mt-2`}
        />
        {error && (
          <p role="alert" className="-mt-1 font-marker text-lg">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending || !word.trim()} className="flex min-h-14 items-center justify-center bg-ink font-anton text-2xl tracking-[0.12em] text-paper disabled:opacity-60">
          {pending ? "CHECKING…" : "OPEN SESAME"}
        </button>
      </form>

      <button type="button" onClick={onBack} className="mt-auto min-h-11 text-center text-sm font-semibold text-smoke underline underline-offset-4">
        Not you? Go back
      </button>
    </Shell>
  );
}

function MatchScreen({
  guest,
  token,
  onNope,
}: {
  guest: PublicGuest;
  token: string;
  onNope: () => void;
}) {
  const router = useRouter();
  const scope = useRef<HTMLDivElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".stickman", { yPercent: 100, duration: 0.9, ease: "back.out(1.6)", delay: 0.15 });
        gsap.to(".arm-left", { rotation: -14, svgOrigin: "165 120", duration: 0.35, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 });
        gsap.to(".arm-right", { rotation: 14, svgOrigin: "165 120", duration: 0.35, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.15 });
        gsap.from(".match-title", { scale: 0.6, opacity: 0, duration: 0.4, ease: "back.out(2)" });
      });
    },
    { scope },
  );

  return (
    <Shell>
      <div ref={scope} className="contents">
        <div className="relative z-10 flex flex-col gap-3.5">
          <Marker className="-rotate-3 self-start text-[22px]">Wait… we found someone</Marker>
          <h1 className="match-title font-anton text-[82px] leading-[0.9]">IS THIS YOU?</h1>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={pending}
              className={btnLight}
              onClick={() =>
                startTransition(async () => {
                  const r = await confirmGuest(token);
                  if (r.ok) router.replace(r.next);
                  else setError("That took too long. Type your name again.");
                })
              }
            >
              {pending ? "…" : "HELL YEAH"}
            </button>
            <button type="button" disabled={pending} className={btnDark} onClick={onNope}>
              NOPE
            </button>
          </div>
          {error && (
            <p role="alert" className="font-marker text-lg">
              {error}{" "}
              <button type="button" className="underline" onClick={onNope}>
                Try again
              </button>
            </p>
          )}
        </div>

        {/* The stickman pops up from the bottom of the screen with their face as the head.
            It sits in the flow (filling the space below the buttons) so it can never cover them;
            on short viewports it shrinks, and if there's still not enough room the page scrolls. */}
        <div
          className="pointer-events-none relative -mx-6 -mb-10 min-h-[370px] flex-1 overflow-hidden [@media(max-height:760px)]:min-h-[300px]"
          aria-hidden="true"
        >
          <div className="stickman absolute inset-x-0 -bottom-10 flex origin-bottom flex-col items-center [@media(max-height:760px)]:scale-[0.8]">
            <div className="relative z-10">
              <Head photo={guest.photo} animal={guest.animal} size={176} border={6} bare={!!guest.photo} alt="" />
            </div>
            <svg width="330" height="330" viewBox="0 0 330 330" fill="none" stroke="#F5F5F0" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" className="-mt-24" overflow="visible">
              <path d="M165 90 V330" />
              <g className="arm-left">
                <path d="M165 120 L88 108 L52 18" />
                <circle cx="52" cy="14" r="11" fill="#F5F5F0" />
                <path d="M32 0 q-12 14 -4 32" strokeWidth="5" />
              </g>
              <g className="arm-right">
                <path d="M165 120 L246 100 L286 22" />
                <circle cx="288" cy="18" r="11" fill="#F5F5F0" />
                <path d="M306 4 q12 14 4 32 M318 -2 q18 22 6 48" strokeWidth="5" />
              </g>
            </svg>
          </div>
        </div>
        <span className="sr-only">Photo of {guest.displayName}</span>
      </div>
    </Shell>
  );
}

function NotInvited({ onRetry }: { onRetry: () => void }) {
  return (
    <Shell className="gap-4!">
      <span className="font-anton text-base tracking-[0.22em] text-smoke">THE BURGER TOUR · DOOR</span>
      <h1 className="font-anton text-[120px] leading-[0.85]">SORRY.</h1>
      <p className="font-anton text-[34px] leading-none">YOU&apos;RE NOT ON THE LIST.</p>

      <div className="mt-3 flex flex-1 items-end justify-center gap-1.5" aria-hidden="true">
        <svg width="152" height="240" viewBox="0 0 190 300" fill="none" stroke="#F5F5F0" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="95" cy="46" r="34" fill="#0A0A0A" />
          <path d="M66 40 H124" strokeWidth="12" />
          <path d="M95 80 V196" />
          <path d="M95 112 L52 140 L130 150" />
          <path d="M95 112 L138 140 L60 160" />
          <path d="M95 196 L58 290 M95 196 L132 290" />
        </svg>
        <div className="mb-[136px] rotate-6 bg-paper px-3.5 py-2.5 text-ink">
          <span className="font-anton text-[22px] tracking-[0.08em] line-through decoration-4">GUEST LIST</span>
        </div>
      </div>

      <Marker className="text-center text-lg text-mist">Maybe a typo? Try the name Sandy knows you by.</Marker>
      <button type="button" onClick={onRetry} className={btnLight}>
        TRY ANOTHER NAME
      </button>
    </Shell>
  );
}
