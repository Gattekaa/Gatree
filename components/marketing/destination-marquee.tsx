"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

gsap.registerPlugin(useGSAP);

export function DestinationMarquee({
  content,
}: {
  content: Dictionary["marketing"]["campaign"]["marquee"];
}) {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);
  const pausePreference = useRef(false);
  const [paused, setPaused] = useState(false);

  useGSAP(
    () => {
      const media = gsap.matchMedia(container.current ?? undefined);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        animation.current = gsap.fromTo(
          track.current,
          { xPercent: 0 },
          {
            xPercent: -50,
            duration: Math.max(content.items.length * 3, 24),
            repeat: -1,
            ease: "none",
            paused: pausePreference.current,
          },
        );
        return () => {
          animation.current = null;
        };
      });
      return () => media.revert();
    },
    { scope: container, dependencies: [content.items], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      pausePreference.current = paused;
      animation.current?.paused(paused);
    },
    { dependencies: [paused] },
  );

  return (
    <div
      ref={container}
      className="relative overflow-hidden border-y border-marketing-border bg-marketing-accent py-7 text-marketing-accent-ink md:py-9 motion-reduce:px-5"
    >
      <div className="overflow-hidden pr-16 motion-reduce:pr-0">
        <div ref={track} className="flex w-max motion-reduce:w-full">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className={`flex shrink-0 list-none items-center gap-8 pr-8 md:gap-12 md:pr-12 motion-reduce:w-full motion-reduce:shrink motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-5 motion-reduce:pr-0 ${copy === 1 ? "motion-reduce:hidden" : ""}`}
            >
              {content.items.map((destination) => (
                <li
                  key={destination}
                  className="flex items-center gap-8 whitespace-nowrap text-[clamp(20px,3vw,38px)] font-medium tracking-[-.035em] md:gap-12 motion-reduce:gap-5 motion-reduce:text-xl"
                >
                  {destination}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-6 opacity-50 md:size-8 motion-reduce:hidden"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label={paused ? content.resume : content.pause}
        aria-pressed={paused}
        onClick={() => setPaused((value) => !value)}
        className="absolute top-1/2 right-4 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-marketing-accent-ink/25 bg-marketing-accent text-marketing-accent-ink transition-colors hover:bg-marketing-accent-ink hover:text-marketing-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-marketing-accent-ink md:right-6 motion-reduce:hidden"
      >
        {paused ? (
          <Play size={16} aria-hidden="true" />
        ) : (
          <Pause size={16} aria-hidden="true" />
        )}
      </button>
      <p className="hidden motion-reduce:block motion-reduce:mt-5 motion-reduce:text-center motion-reduce:text-xs">
        {content.reduced}
      </p>
    </div>
  );
}
