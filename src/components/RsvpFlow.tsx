"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveRsvp, type RsvpInput } from "@/app/actions";
import { ANIMALS, type AnimalId } from "@/components/animals";
import { ByeScreen } from "@/components/ByeScreen";
import { JumpScare } from "@/components/JumpScare";
import { useMusic } from "@/components/music";
import { PlusOnePhoto } from "@/components/PlusOnePhoto";
import { Rider, parseFood } from "@/components/Rider";
import {
  AnimalFace,
  Bolt,
  Burger,
  Kicker,
  MailIcon,
  Marker,
  SectionTitle,
  Shell,
  btnDark,
  btnLight,
  inputDark,
  inputLight,
} from "@/components/ui";
import type { FoodIdeaGroup, PublicGuest, Rsvp } from "@/lib/types";

type Choice = "yes" | "maybe" | null;
type Stage = "form" | "sure" | "scare" | "bye" | "reminded";

export type RsvpFlowProps = {
  guest: PublicGuest;
  initial: Pick<
    Rsvp,
    "status" | "plusOne" | "plusOneName" | "plusOnePhotoUrl" | "plusOneAnimal" | "food" | "foodUnsure" | "email"
  > | null;
  defaultEmail: string | null;
  /** Animals other +1s (or guests) already have. Each animal can only be used once. */
  takenAnimals: AnimalId[];
  others: { name: string; what: string }[];
  foodIdeas: FoodIdeaGroup[];
  deadlineLabel: string;
  scare: { image: string | null; durationMs: number; sound: string };
  bye: { hostName: string; hostAge: number; durationMs: number; totalFiles: number; images: string[] };
};

export function RsvpFlow(props: RsvpFlowProps) {
  const { guest, initial, foodIdeas } = props;
  const router = useRouter();
  const music = useMusic();
  const scareAudio = useRef<HTMLAudioElement | null>(null);

  const [stage, setStage] = useState<Stage>("form");
  const [choice, setChoice] = useState<Choice>(
    initial?.status === "yes" ? "yes" : initial?.status === "maybe" ? "maybe" : null,
  );
  const [plusOne, setPlusOne] = useState(initial?.plusOne ?? false);
  const [plusOneName, setPlusOneName] = useState(initial?.plusOneName ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.plusOnePhotoUrl ?? null);
  const [animal, setAnimal] = useState<AnimalId | null>(
    initial?.plusOneAnimal ??
      (initial?.plusOnePhotoUrl ? null : (ANIMALS.find((a) => !props.takenAnimals.includes(a.id))?.id ?? null)),
  );
  const [items, setItems] = useState<string[]>(() => parseFood(initial?.food ?? null, foodIdeas.flatMap((g) => g.items)));
  const [email, setEmail] = useState(initial?.email ?? props.defaultEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Preload the scream so it plays instantly on the tap.
  useEffect(() => {
    const a = new Audio(props.scare.sound);
    a.preload = "auto";
    scareAudio.current = a;
    return () => a.pause();
  }, [props.scare.sound]);

  function submit(input: RsvpInput, after?: (next: string) => void) {
    setError(null);
    startTransition(async () => {
      const r = await saveRsvp(input);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      if (after) after(r.next);
      else router.push(r.next);
    });
  }

  function lockItIn() {
    const food = items.join(", ");
    submit({
      status: "yes",
      plusOne: guest.allowPlusOne && plusOne,
      plusOneName: plusOne ? plusOneName : null,
      plusOnePhotoUrl: plusOne && !animal ? photoUrl : null,
      plusOneAnimal: plusOne ? animal : null,
      food: food || null,
      foodUnsure: !food,
    });
  }

  function cantCome() {
    // Must run inside the tap so phones allow the sound.
    music.hush();
    const a = scareAudio.current;
    if (a) {
      a.currentTime = 0;
      a.play().catch(() => {});
    }
    setStage("scare");
    void saveRsvp({ status: "no" }).catch(() => {});
  }

  if (stage === "scare") {
    return (
      <JumpScare image={props.scare.image} durationMs={props.scare.durationMs} onDone={() => setStage("bye")} />
    );
  }
  if (stage === "bye") return <ByeScreen {...props.bye} onChangeMind={() => setStage("form")} />;
  if (stage === "sure") {
    return (
      <Shell className="gap-4.5!">
        <Kicker>THE BURGER TOUR · RSVP</Kicker>
        <h1 className="font-anton text-[96px] leading-[0.88]">ARE YOU SURE?</h1>
        <Marker className="-rotate-[1.5deg] text-[22px] leading-tight">
          The burger is gonna be lonely. Think about the burger.
        </Marker>
        <div className="flex flex-1 items-center justify-center">
          <Burger size={210} sad />
        </div>
        <button type="button" className={btnLight} onClick={() => setStage("form")}>
          NO WAIT, TAKE ME BACK
        </button>
        <button type="button" className={btnDark} onClick={cantCome}>
          YES, I CAN&apos;T COME
        </button>
      </Shell>
    );
  }
  if (stage === "reminded") {
    return (
      <Shell>
        <Kicker>THE BURGER TOUR · RSVP</Kicker>
        <h1 className="font-anton text-[84px] leading-[0.88]">OK, I&apos;LL REMIND YOU</h1>
        <div className="flex items-center gap-3.5 border-[3px] border-dashed border-paper p-4">
          <MailIcon />
          <p className="text-[15px] leading-normal text-mist">
            Reminders go to <strong className="text-paper">{email}</strong> before {props.deadlineLabel}.
          </p>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          <Link href="/party" className={btnLight}>
            SEE WHO&apos;S COMING
          </Link>
          <button type="button" className={btnDark} onClick={() => { setChoice(null); setStage("form"); }}>
            ACTUALLY, I&apos;VE DECIDED
          </button>
        </div>
      </Shell>
    );
  }

  const option = (active: boolean) =>
    `flex min-h-15 items-center justify-between border-[3px] border-paper px-4.5 text-left font-anton text-[22px] tracking-[0.08em] ${
      active ? "bg-paper text-ink" : "bg-transparent text-paper"
    }`;

  return (
    <Shell className="gap-6.5!">
      <div className="flex flex-col gap-0.5">
        <Kicker>THE BURGER TOUR · RSVP</Kicker>
        <h1 className="font-anton text-[80px] leading-[0.9]">ARE YOU IN?</h1>
        {initial?.status === "maybe" && (
          <Marker className="mt-2 -rotate-1 self-start text-lg">
            You said maybe. Decide before {props.deadlineLabel}!
          </Marker>
        )}
      </div>

      <div role="radiogroup" aria-label="Your answer" className="flex flex-col gap-2.5">
        <button type="button" role="radio" aria-checked={choice === "yes"} className={option(choice === "yes")} onClick={() => setChoice("yes")}>
          I&apos;M IN {choice === "yes" && <Bolt />}
        </button>
        <button type="button" role="radio" aria-checked={choice === "maybe"} className={option(choice === "maybe")} onClick={() => setChoice("maybe")}>
          NOT SURE YET, REMIND ME LATER
        </button>
        <button type="button" role="radio" aria-checked={false} className={option(false)} onClick={() => setStage("sure")}>
          I CAN&apos;T COME
        </button>
      </div>

      {choice === "yes" && (
        <>
          {guest.allowPlusOne && (
            <section id="crew" className="flex scroll-mt-6 flex-col gap-3">
              <SectionTitle>THE CREW</SectionTitle>
              <div className="grid grid-cols-2 gap-2.5">
                {[false, true].map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    aria-pressed={plusOne === v}
                    onClick={() => setPlusOne(v)}
                    className={`min-h-12.5 border-[3px] border-paper font-anton text-xl tracking-[0.1em] ${plusOne === v ? "bg-paper text-ink" : "text-paper"}`}
                  >
                    {v ? "+1" : "SOLO"}
                  </button>
                ))}
              </div>

              {plusOne && (
                <>
                  <div className="mt-1.5 flex items-center gap-4">
                    <PlusOnePhoto
                      url={animal ? null : photoUrl}
                      onUploaded={(url) => {
                        setPhotoUrl(url);
                        if (url) setAnimal(null);
                      }}
                    />
                    <div className="flex flex-1 flex-col gap-1.5">
                      <label htmlFor="plus-one-name" className="font-anton text-sm tracking-[0.18em] text-smoke">
                        YOUR +1&apos;S NAME
                      </label>
                      <input
                        id="plus-one-name"
                        value={plusOneName}
                        onChange={(e) => setPlusOneName(e.target.value)}
                        placeholder="Their name"
                        maxLength={60}
                        autoComplete="off"
                        className={inputDark}
                      />
                      <Marker className="text-[15px]">Snap their face for the crowd!</Marker>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-col gap-2">
                    <span className="text-sm text-mist">Camera shy? Pick an animal face instead (one per animal, first come first served):</span>
                    <div className="grid grid-cols-5 gap-2">
                      {ANIMALS.map((a) => {
                        const on = animal === a.id;
                        const taken = !on && props.takenAnimals.includes(a.id);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            aria-label={taken ? `${a.label} face (taken)` : `${a.label} face`}
                            aria-pressed={on}
                            disabled={taken}
                            onClick={() => setAnimal(a.id)}
                            className={`relative flex h-14.5 items-center justify-center border-[3px] text-paper ${on ? "border-paper bg-shadow shadow-[4px_4px_0_#F5F5F0]" : taken ? "cursor-not-allowed border-ash opacity-35" : "border-paper"}`}
                          >
                            <AnimalFace id={a.id} size={34} />
                            {taken && (
                              <span className="absolute inset-x-0 top-1/2 -rotate-12 font-anton text-[11px] tracking-[0.12em]">
                                TAKEN
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          <Rider
            ideaGroups={foodIdeas}
            others={props.others}
            items={items}
            onItemsChange={setItems}
          />

          {error && <p role="alert" className="font-marker text-lg">{error}</p>}
          <button type="button" disabled={pending} onClick={lockItIn} className={`${btnLight} mt-auto min-h-16 text-[26px]`}>
            {pending ? "SAVING…" : "LOCK IT IN"}
          </button>
        </>
      )}

      {choice === "maybe" && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit({ status: "maybe", email }, () => setStage("reminded"));
          }}
        >
          <p className="text-base leading-normal text-mist">
            No stress. Leave your email and I&apos;ll remind you before the {props.deadlineLabel} deadline.
          </p>
          <div className="flex -rotate-[1.5deg] flex-col gap-3 bg-paper p-5 text-ink hard-shadow-lg">
            <label htmlFor="remind-email" className="font-anton text-sm tracking-[0.16em]">
              YOUR EMAIL
            </label>
            <input
              id="remind-email"
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className={inputLight}
            />
            <button type="submit" disabled={pending} className="flex min-h-14 items-center justify-center bg-ink font-anton text-[22px] tracking-[0.12em] text-paper disabled:opacity-60">
              {pending ? "SAVING…" : "REMIND ME"}
            </button>
          </div>
          {error && <p role="alert" className="font-marker text-lg">{error}</p>}
        </form>
      )}
    </Shell>
  );
}
