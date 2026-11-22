"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { AnimalId } from "@/components/animals";
import { Head, StickBody, type Pose } from "@/components/ui";

gsap.registerPlugin(useGSAP);

export type CrowdMember = {
  key: string;
  name: string;
  photo: string | null;
  animal: AnimalId | null;
  /** Halo + wings. */
  angel?: boolean;
};

const POSES: Pose[] = ["up", "wave", "dance"];

/** The mosh pit: one jumping stickman per guest, their face as the head. */
export function Crowd({ members }: { members: CrowdMember[] }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".crowd-member").forEach((el) => {
          gsap.to(el, {
            y: gsap.utils.random(-22, -12),
            rotation: gsap.utils.random(-6, 6),
            duration: gsap.utils.random(0.3, 0.55),
            delay: gsap.utils.random(0, 0.7),
            repeat: -1,
            yoyo: true,
            ease: "power1.out",
          });
        });
      });
    },
    { scope, dependencies: [members.length] },
  );

  if (members.length === 0) {
    return <p className="px-1.5 pb-4 font-marker text-lg">Nobody&apos;s in yet. Be the first!</p>;
  }

  return (
    <div ref={scope} className="grid grid-cols-4 gap-x-1 gap-y-4 pt-4 pb-3">
      {members.map((m, i) => (
        <div key={m.key} className="crowd-member flex flex-col items-center gap-1 text-ink">
          <div className="relative z-10 -mb-2">
            {m.angel && (
              <svg width="30" height="9" viewBox="0 0 30 9" className="absolute -top-3 left-1/2 -translate-x-1/2" aria-hidden="true">
                <ellipse cx="15" cy="4.5" rx="13" ry="3" fill="none" stroke="#0A0A0A" strokeWidth="2.4" />
              </svg>
            )}
            <Head photo={m.photo} animal={m.animal} size={42} border={3} tone="dark" bare={!!m.photo} alt="" />
          </div>
          <StickBody pose={POSES[i % POSES.length]} width={50} color="#0A0A0A" angel={m.angel} />
          <span className="max-w-full truncate font-anton text-[13px] tracking-[0.06em] uppercase">{m.name}</span>
        </div>
      ))}
    </div>
  );
}
