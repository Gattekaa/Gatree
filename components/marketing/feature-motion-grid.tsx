"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Globe2,
  Link2,
  Mail,
  MapPin,
  MousePointer2,
  MousePointerClick,
  Music2,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type BentoContent = Dictionary["marketing"]["campaign"]["bento"];
const contentIcons = [Music2, Play, MapPin, Mail];

function FeatureCopy({ item }: { item: BentoContent["items"][number] }) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-marketing-accent-text">
        {item.detail}
      </p>
      <h3 className="max-w-md text-[30px] font-medium leading-[1.1] tracking-[-.04em]">
        {item.title}
      </h3>
      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-marketing-muted">
        {item.description}
      </p>
    </div>
  );
}

export function FeatureMotionGrid({ content }: { content: BentoContent }) {
  const root = useRef<HTMLElement>(null);
  const photoCard = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const contentCard = useRef<HTMLDivElement>(null);
  const qrCard = useRef<HTMLDivElement>(null);
  const qrStage = useRef<HTMLDivElement>(null);
  const scanner = useRef<HTMLDivElement>(null);
  const trackingCard = useRef<HTMLDivElement>(null);
  const trackingStage = useRef<HTMLDivElement>(null);
  const cursor = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root.current ?? undefined);
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          small: "(max-width: 767px)",
          large: "(min-width: 768px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;
          const amplitude = context.conditions.small ? 0.5 : 1;
          const artLayers = gsap.utils.toArray<HTMLElement>(
            "[data-feature-art]",
            root.current,
          );
          artLayers.forEach((art, index) => {
            gsap.fromTo(
              art,
              {
                x: (index % 2 === 0 ? -60 : 60) * amplitude,
                y: 35 * amplitude,
                rotationY: (index % 2 === 0 ? -6 : 6) * amplitude,
                transformPerspective: 900,
              },
              {
                x: 0,
                y: 0,
                rotationY: 0,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: art.closest("[data-feature-card]"),
                  start: "top 98%",
                  end: "top 65%",
                  scrub: 0.7,
                },
              },
            );
          });
          gsap.fromTo(
            "[data-feature-heading]",
            { y: 28 * amplitude },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top 90%",
                end: "top 55%",
                scrub: 0.6,
              },
            },
          );
          gsap.fromTo(
            photo.current,
            { yPercent: -8 * amplitude, scale: 1.18 },
            {
              yPercent: 8 * amplitude,
              scale: 1.18,
              ease: "none",
              scrollTrigger: {
                trigger: photoCard.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );

          gsap.fromTo(
            "[data-feature-photo-mask]",
            {
              clipPath: "inset(10% 10% 10% 10% round 24px)",
            },
            {
              clipPath: "inset(0% 0% 0% 0% round 0px)",
              ease: "none",
              scrollTrigger: {
                trigger: photoCard.current,
                start: "top 92%",
                end: "top 35%",
                scrub: 0.7,
              },
            },
          );

          const iconElements = gsap.utils.toArray<HTMLElement>(
            "[data-content-icon]",
            root.current,
          );
          const alignment = gsap.timeline({
            scrollTrigger: {
              trigger: contentCard.current,
              start: "top 88%",
              end: "top 28%",
              scrub: 0.7,
            },
          });
          iconElements.forEach((icon, index) => {
            alignment.fromTo(
              icon,
              {
                x: [-36, 28, -24, 36][index] * amplitude,
                y: [40, -32, 34, -32][index] * amplitude,
                rotation: [-20, 18, -18, 20][index] * amplitude,
              },
              { x: 0, y: 0, rotation: 0, duration: 0.6, ease: "power2.out" },
              0,
            );
          });
          alignment.fromTo(
            "[data-content-phone]",
            { y: 15, opacity: 0.35 },
            { y: 0, opacity: 1, duration: 0.5 },
            0.2,
          );
          alignment.fromTo(
            "[data-content-strip]",
            { scaleX: 0.15, opacity: 0.3, transformOrigin: "left center" },
            { scaleX: 1, opacity: 1, stagger: 0.08, duration: 0.35 },
            0.45,
          );

          const scanning = gsap.timeline({
            scrollTrigger: {
              trigger: qrCard.current,
              start: "top 88%",
              end: "bottom 32%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          });
          scanning.fromTo(
            "[data-qr-corner]",
            { opacity: 0.2, scale: 0.4 },
            {
              opacity: 1,
              scale: 1,
              stagger: 0.05,
              duration: 0.3,
              ease: "power2.out",
            },
            0,
          );
          scanning.set(scanner.current, { opacity: 0.85 }, 0);
          scanning.fromTo(
            scanner.current,
            { y: 0 },
            {
              y: () => Math.max((qrStage.current?.clientHeight ?? 0) - 34, 0),
              duration: 0.5,
              ease: "none",
            },
          );
          scanning.to(scanner.current, { y: 0, duration: 0.5, ease: "none" });

          const nodes = gsap.utils.toArray<HTMLElement>(
            "[data-tracking-node]",
            root.current,
          );
          const lines = gsap.utils.toArray<HTMLElement>(
            "[data-tracking-line]",
            root.current,
          );
          function cursorX(index: number) {
            const node = nodes[index];
            return node ? node.offsetLeft + node.offsetWidth / 2 : 0;
          }
          function cursorY(index: number) {
            const node = nodes[index];
            return node ? node.offsetTop + node.offsetHeight / 2 : 0;
          }
          const tracking = gsap.timeline({
            scrollTrigger: {
              trigger: trackingCard.current,
              start: "top 88%",
              end: "bottom 40%",
              scrub: 0.7,
              invalidateOnRefresh: true,
            },
          });
          tracking.fromTo(
            cursor.current,
            { x: () => cursorX(0), y: () => cursorY(0), opacity: 1 },
            {
              x: () => cursorX(1),
              y: () => cursorY(1),
              duration: 0.45,
              ease: "none",
            },
            0,
          );
          tracking.fromTo(
            lines[0],
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.45, ease: "none" },
            0,
          );
          tracking.fromTo(
            nodes[1],
            { opacity: 0.4, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.2 },
            0.3,
          );
          tracking.to(
            cursor.current,
            {
              x: () => cursorX(2),
              y: () => cursorY(2),
              duration: 0.45,
              ease: "none",
            },
            0.45,
          );
          tracking.fromTo(
            lines[1],
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.45, ease: "none" },
            0.45,
          );
          tracking.fromTo(
            nodes[2],
            { opacity: 0.4, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.2 },
            0.75,
          );
          lines.forEach((line, index) => {
            const pulse = line.querySelector("[data-tracking-pulse]");
            tracking.fromTo(
              pulse,
              { x: 0, opacity: 1 },
              {
                x: () => Math.max(line.clientWidth - 4, 0),
                duration: 0.4,
                ease: "none",
              },
              index * 0.45 + 0.1,
            );
            tracking.to(
              pulse,
              { opacity: 0, duration: 0.1 },
              index * 0.45 + 0.5,
            );
          });
          tracking.to(nodes[1], { scale: 1.12, duration: 0.1 }, 0.45);
          tracking.to(nodes[1], { scale: 1, duration: 0.1 }, 0.55);
          tracking.to(nodes[2], { scale: 1.12, duration: 0.1 }, 0.85);
          tracking.to(nodes[2], { scale: 1, duration: 0.1 }, 0.95);
          tracking.to(cursor.current, { opacity: 0, duration: 0.15 }, 0.9);
        },
      );
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="features" className="scroll-mt-28 pb-28 md:pb-40">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div data-feature-heading>
          <h2 className="max-w-5xl text-balance text-[clamp(2.3rem,5.4vw,5.1rem)] font-semibold leading-[1.04] tracking-[-.055em]">
            {content.title}
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-marketing-muted">
            {content.description}
          </p>
        </div>
        <div className="mt-12 grid grid-flow-dense grid-cols-1 gap-5 md:grid-cols-[1.15fr_1fr] md:gap-6">
          <div
            ref={photoCard}
            data-feature-card
            className="relative min-h-[420px] overflow-hidden rounded-[24px] border border-marketing-border bg-marketing-surface"
          >
            <div className="relative h-[220px] overflow-hidden md:h-[250px]">
              <div data-feature-art className="absolute inset-0">
                <div
                  data-feature-photo-mask
                  className="absolute inset-0 overflow-hidden"
                >
                  <Image
                    ref={photo}
                    src="/marketing/studio-wide.png"
                    alt=""
                    fill
                    sizes="(min-width: 1280px) 670px, (min-width: 768px) 55vw, 100vw"
                    className="object-cover object-[35%_48%]"
                  />
                </div>
              </div>
              <div
                className="absolute inset-0 bg-linear-to-t from-marketing-surface via-transparent to-transparent"
                aria-hidden="true"
              />
            </div>
            <div className="relative p-7 pt-3 sm:p-9 sm:pt-4">
              <FeatureCopy item={content.items[0]} />
            </div>
          </div>
          <div
            ref={contentCard}
            data-feature-card
            className="flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[24px] border border-marketing-border bg-marketing-soft p-7 sm:p-9"
          >
            <div
              className="relative mb-6 h-[210px] overflow-hidden"
              aria-hidden="true"
            >
              <div data-feature-art className="absolute inset-0">
                <div className="absolute top-2 right-0 left-0 flex justify-center gap-3">
                  {contentIcons.map((Icon, index) => (
                    <div
                      data-content-icon
                      key={index}
                      className="grid size-12 shrink-0 place-items-center rounded-2xl border border-marketing-border bg-marketing-bg text-marketing-accent-text sm:size-16"
                    >
                      <Icon className="size-6 sm:size-7" strokeWidth={1.5} />
                    </div>
                  ))}
                </div>
                <div
                  data-content-phone
                  className="absolute bottom-0 left-1/2 flex h-[122px] w-[184px] -translate-x-1/2 flex-col items-center justify-center gap-2.5 rounded-[22px] border border-marketing-border bg-marketing-bg px-6"
                >
                  <span className="absolute top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-marketing-border" />
                  {[0, 1, 2].map((strip) => (
                    <span
                      data-content-strip
                      key={strip}
                      className="h-4 w-full rounded-[5px] bg-marketing-accent/80"
                    />
                  ))}
                </div>
              </div>
            </div>
            <FeatureCopy item={content.items[1]} />
          </div>
          <div
            ref={qrCard}
            data-feature-card
            className="flex flex-col gap-8 overflow-hidden rounded-[24px] border border-marketing-border bg-marketing-soft p-7 sm:p-9 lg:flex-row lg:items-center lg:gap-9"
          >
            <div className="shrink-0 self-start overflow-hidden rounded-[18px]">
              <div
                data-feature-art
                ref={qrStage}
                className="relative shrink-0 self-start overflow-hidden rounded-[18px] bg-[#f7f8f2] p-4"
              >
                <Image
                  src="/marketing/qr-demo.svg"
                  alt={content.items[2].detail}
                  width={144}
                  height={144}
                  className="size-28 sm:size-36"
                />
                <div
                  ref={scanner}
                  className="pointer-events-none absolute top-4 right-4 left-4 h-0.5 bg-[#c9a92e] opacity-0 shadow-[0_0_8px_#c9a92e80]"
                  aria-hidden="true"
                />
                {[
                  "top-2 left-2 border-t-2 border-l-2 origin-top-left",
                  "top-2 right-2 border-t-2 border-r-2 origin-top-right",
                  "bottom-2 left-2 border-b-2 border-l-2 origin-bottom-left",
                  "bottom-2 right-2 border-b-2 border-r-2 origin-bottom-right",
                ].map((corner) => (
                  <span
                    key={corner}
                    data-qr-corner
                    aria-hidden="true"
                    className={`pointer-events-none absolute size-4 border-[#c9a92e] ${corner}`}
                  />
                ))}
              </div>
            </div>
            <FeatureCopy item={content.items[2]} />
          </div>
          <div
            ref={trackingCard}
            data-feature-card
            className="flex flex-col justify-between gap-10 overflow-hidden rounded-[24px] border border-marketing-border bg-marketing-surface p-7 sm:p-9"
          >
            <div className="overflow-hidden">
              <div
                data-feature-art
                ref={trackingStage}
                className="relative flex h-[96px] items-center gap-4 text-marketing-accent-text"
                aria-hidden="true"
              >
                <div
                  data-tracking-node
                  className="grid size-14 shrink-0 place-items-center rounded-full border border-marketing-border bg-marketing-bg"
                >
                  <Globe2 size={32} strokeWidth={1.2} />
                </div>
                <span
                  data-tracking-line
                  className="relative h-px min-w-0 flex-1 bg-marketing-accent-text/60"
                >
                  <span
                    data-tracking-pulse
                    className="absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full bg-marketing-accent opacity-0 shadow-[0_0_9px_#f0cf5680]"
                  />
                </span>
                <div
                  data-tracking-node
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-marketing-border bg-marketing-bg"
                >
                  <Link2 size={26} strokeWidth={1.2} />
                </div>
                <span
                  data-tracking-line
                  className="relative h-px min-w-0 flex-1 bg-marketing-accent-text/60"
                >
                  <span
                    data-tracking-pulse
                    className="absolute top-1/2 left-0 size-2 -translate-y-1/2 rounded-full bg-marketing-accent opacity-0 shadow-[0_0_9px_#f0cf5680]"
                  />
                </span>
                <div
                  data-tracking-node
                  className="grid size-12 shrink-0 place-items-center rounded-full border border-marketing-border bg-marketing-bg"
                >
                  <MousePointerClick size={25} strokeWidth={1.2} />
                </div>
                <MousePointer2
                  ref={cursor}
                  className="pointer-events-none absolute top-0 left-0 size-5 fill-marketing-accent text-marketing-accent-ink opacity-0"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <FeatureCopy item={content.items[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}
