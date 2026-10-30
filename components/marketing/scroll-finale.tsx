"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollFinale({
  content,
  cta,
  localePath,
}: {
  content: Dictionary["marketing"]["campaign"]["final"];
  cta: string;
  localePath: string;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root.current ?? undefined);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const reveal = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top 85%",
            end: "center 42%",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        reveal
          .fromTo(
            "[data-finale-surface]",
            { clipPath: "circle(0.5% at 50% 100%)" },
            { clipPath: "circle(150% at 50% 70%)", duration: 1 },
            0,
          )
          .fromTo(
            "[data-finale-line='first']",
            { yPercent: 110, x: -60 },
            { yPercent: 0, x: 0, duration: 0.45, ease: "power2.out" },
            0.05,
          )
          .fromTo(
            "[data-finale-line='second']",
            { yPercent: 110, x: 60 },
            { yPercent: 0, x: 0, duration: 0.45, ease: "power2.out" },
            0.22,
          );
      });
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="bg-marketing-bg relative isolate overflow-hidden px-5 pt-20 pb-12 sm:px-8 md:pt-28 lg:px-10"
    >
      <div
        data-finale-surface
        aria-hidden="true"
        className="bg-marketing-accent pointer-events-none absolute inset-0 -z-20 [clip-path:circle(150%_at_50%_80%)]"
      />
      {/* A constant gold surface keeps the copy readable throughout the reveal. */}
      <div className="bg-marketing-accent text-marketing-accent-ink relative mx-auto max-w-[1120px] rounded-[48px] px-5 pt-10 pb-8 text-center sm:px-10 sm:pt-14 sm:pb-10 lg:px-16 lg:pt-16 lg:pb-12">
        <h2 className="text-[clamp(2.35rem,7.1vw,6.5rem)] leading-[1.07] font-semibold tracking-[-.06em] text-balance">
          <span className="block overflow-hidden pb-[.06em]">
            <span data-finale-line="first" className="block">
              {content.line1}
            </span>
          </span>
          <span className="block overflow-hidden pb-[.06em]">
            <span data-finale-line="second" className="block">
              {content.line2}
            </span>
          </span>
        </h2>
        <p className="text-marketing-accent-ink/80 mx-auto mt-7 max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
          {content.description}
        </p>
        <Link
          href={`${localePath}/login`}
          className="group bg-marketing-accent-ink text-marketing-accent focus-visible:outline-marketing-accent-ink mt-9 inline-flex min-h-14 items-center justify-center gap-4 rounded-full px-7 py-4 text-sm font-semibold whitespace-nowrap transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 active:translate-y-0 motion-reduce:transform-none motion-reduce:transition-none"
        >
          {cta}
          <ArrowUpRight
            size={20}
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:rotate-45 motion-reduce:transform-none motion-reduce:transition-none"
          />
        </Link>
      </div>
    </section>
  );
}
