"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function MotionBridge({ words }: { words: string[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;
      const media = gsap.matchMedia(element);
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px) and (min-height: 680px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;
          const rows = gsap.utils.toArray<HTMLElement>(
            "[data-bridge-word]",
            element,
          );
          if (context.conditions.desktop) {
            element.dataset.immersive = "true";
            const trajectory = gsap.timeline({
              scrollTrigger: {
                trigger: element,
                start: "top 96px",
                end: () => `+=${window.innerHeight * 0.75}`,
                pin: element,
                pinSpacing: true,
                scrub: 0.45,
                invalidateOnRefresh: true,
              },
            });
            rows.forEach((row, index) => {
              trajectory.fromTo(
                row,
                {
                  xPercent: index === 1 ? 24 : index === 0 ? -30 : 32,
                  y: index === 0 ? -30 : index === 2 ? 30 : 0,
                  scale: index === 1 ? 0.82 : 1.05,
                },
                {
                  xPercent: 0,
                  y: 0,
                  scale: 1,
                  duration: 0.4,
                  ease: "power2.out",
                },
                0,
              );
            });
            trajectory.to(
              rows[1],
              { scale: 1.08, duration: 0.28, ease: "power2.inOut" },
              0.38,
            );
            trajectory.to(
              rows[0],
              { y: -18, xPercent: -5, duration: 0.28, ease: "none" },
              0.38,
            );
            trajectory.to(
              rows[2],
              { y: 18, xPercent: 5, duration: 0.28, ease: "none" },
              0.38,
            );
            return () => {
              delete element.dataset.immersive;
            };
          }
          rows.forEach((row, index) => {
            gsap.fromTo(
              row,
              {
                xPercent: index % 2 ? 22 : -22,
                scale: index === 1 ? 0.8 : 0.95,
              },
              {
                xPercent: 0,
                scale: index === 1 ? 1.08 : 1,
                ease: "none",
                scrollTrigger: {
                  trigger: element,
                  start: "top 90%",
                  end: "center 40%",
                  scrub: 0.55,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [words], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      aria-label={words.join(" ")}
      className="group/bridge relative isolate overflow-hidden border-y border-marketing-border bg-marketing-accent-ink px-5 py-20 sm:py-24 data-[immersive=true]:flex data-[immersive=true]:h-[calc(100dvh-110px)] data-[immersive=true]:items-center data-[immersive=true]:justify-center data-[immersive=true]:py-0"
    >
      <div
        aria-hidden="true"
        className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-3"
      >
        {words.map((word, index) => (
          <div
            key={word}
            data-bridge-word
            className={`w-max whitespace-nowrap text-[clamp(3rem,14vw,12rem)] font-semibold uppercase leading-[.98] tracking-[-.065em] group-data-[immersive=true]/bridge:text-[min(13vw,20dvh,190px)] ${index === 1 ? "text-marketing-accent" : "text-marketing-accent-ink [text-shadow:1px_0_#e9ecd9,-1px_0_#e9ecd9,0_1px_#e9ecd9,0_-1px_#e9ecd9]"}`}
          >
            {word}
          </div>
        ))}
      </div>
    </section>
  );
}
