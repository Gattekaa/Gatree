"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CalendarDays,
  Camera,
  Folder,
  Lightbulb,
  Link2,
  Mail,
  Music2,
  Play,
} from "lucide-react";
import { useRef, type CSSProperties } from "react";
import { PreviewContent } from "@/components/editor/preview/preview-content";
import { GatreeLogo } from "@/components/shared/logo";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { CinematicField } from "./cinematic-field";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const icons = [
  Music2,
  Play,
  Folder,
  Mail,
  Camera,
  Lightbulb,
  CalendarDays,
  Link2,
];
const positions = [
  [-0.32, -0.3, -3],
  [-0.32, -0.1, -1],
  [-0.32, 0.1, 1],
  [-0.32, 0.3, 3],
  [0.32, -0.3, 3],
  [0.32, -0.1, 1],
  [0.32, 0.1, -1],
  [0.32, 0.3, -3],
];

export function UniverseScene({
  campaign,
}: {
  campaign: Dictionary["marketing"]["campaign"];
}) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const persona = campaign.audience.items[0];

  useGSAP(
    () => {
      const element = root.current;
      const stage = stageRef.current;
      const art = artRef.current;
      if (!element || !stage || !art) return;
      const media = gsap.matchMedia();
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 1024px) and (min-height: 760px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;
          const pinned = !!context.conditions.desktop;
          element.dataset.motion = "true";
          if (pinned) element.dataset.pinned = "true";
          const nodes = gsap.utils.toArray<HTMLElement>(
            "[data-universe-node]",
            element,
          );
          const hub = element.querySelector<HTMLElement>("[data-universe-hub]");
          const phone = element.querySelector<HTMLElement>(
            "[data-universe-phone]",
          );
          const publishProgress = (self: ScrollTrigger) => {
            element.dataset.sceneProgress = self.progress.toFixed(3);
            element.dispatchEvent(
              new CustomEvent("gatree:scene-progress", {
                detail: self.progress,
              }),
            );
            const phase =
              self.progress < 0.11 ? "1" : self.progress < 0.5 ? "2" : "3";
            if (stage.dataset.universePhase !== phase)
              stage.dataset.universePhase = phase;
          };
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: pinned ? stage : art,
              start: pinned ? "top 96px" : "top 45%",
              end: pinned
                ? () => `+=${window.innerHeight * 1.15}`
                : "bottom 60%",
              pin: pinned ? stage : false,
              scrub: 0.45,
              invalidateOnRefresh: true,
              onUpdate: publishProgress,
              onRefresh: publishProgress,
            },
          });
          nodes.forEach((node, index) => {
            const [fanX, fanY, tilt] = positions[index];
            const coordinate = (axis: "x" | "y", fraction: number) => {
              const size = axis === "x" ? art.clientWidth : art.clientHeight;
              const nodeSize =
                axis === "x" ? node.clientWidth : node.clientHeight;
              const limit = Math.max(0, size / 2 - nodeSize * 0.5 - 8);
              if (axis === "x" && art.clientWidth < 640)
                fraction = Math.sign(fraction) * 0.35;
              return gsap.utils.clamp(-limit, limit, size * fraction);
            };
            // Left group settles before the right group begins; no overlapping swarm.
            const entrance =
              index < 4 ? 0.12 + index * 0.03 : 0.34 + (index - 4) * 0.025;
            timeline.fromTo(
              node,
              {
                x: () => coordinate("x", fanX),
                y: () => coordinate("y", fanY),
                rotation: pinned ? tilt : 0,
                opacity: 1,
              },
              {
                x: () =>
                  (index < 4 ? -1 : 1) *
                  ((hub?.clientWidth || 108) / 2 + node.clientWidth / 2 + 4),
                y: () => ((index % 4) - 1.5) * (hub?.clientHeight || 108) * 0.2,
                rotation: 0,
                opacity: 0,
                duration: 0.12,
                ease: "power2.inOut",
              },
              entrance,
            );
          });
          if (hub) {
            gsap.set(hub, { opacity: 1, scale: 1 });
            for (const arrival of [0.3, 0.47]) {
              timeline.to(
                hub,
                {
                  scale: 1.035,
                  borderColor: "#f0cf56",
                  duration: 0.035,
                  ease: "power1.out",
                },
                arrival,
              );
              timeline.to(
                hub,
                {
                  scale: 1,
                  borderColor: "rgba(240,207,86,0.35)",
                  duration: 0.035,
                  ease: "power1.inOut",
                },
                arrival + 0.035,
              );
            }
            timeline.to(hub, { opacity: 0, duration: 0.025 }, 0.515);
          }
          // The page only appears after every chip and the hub have disappeared.
          timeline.fromTo(
            phone,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.15, ease: "power2.out" },
            0.55,
          );
          timeline.fromTo(
            "[data-universe-field]",
            { opacity: 1 },
            { opacity: 0.25, duration: 0.15, ease: "none" },
            0.55,
          );
          timeline.to(
            "[data-universe-start]",
            { opacity: 0, y: -8, duration: 0.055 },
            0.53,
          );
          timeline.fromTo(
            "[data-universe-end]",
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.07 },
            0.59,
          );
          timeline.fromTo(
            "[data-universe-address]",
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.1 },
            0.74,
          );
          timeline.to({}, { duration: 0.26 }, 0.84);
          if (timeline.scrollTrigger) publishProgress(timeline.scrollTrigger);
          return () => {
            delete element.dataset.motion;
            delete element.dataset.pinned;
          };
        },
      );
      return () => media.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="seu-mundo"
      aria-label={campaign.statement.line1 + " " + campaign.statement.line2}
      className="group/universe scroll-mt-24 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <div
        ref={stageRef}
        data-universe-stage
        data-universe-phase="1"
        className="mx-auto flex max-w-[1280px] flex-col text-center group-data-[pinned=true]/universe:h-[calc(100dvh-110px)] group-data-[pinned=true]/universe:max-h-[860px]"
      >
        <div className="relative z-20 shrink-0">
          <div className="grid">
            <h2
              data-universe-start
              className="col-start-1 row-start-1 mx-auto max-w-4xl text-balance text-[clamp(2.4rem,5.2vw,4.7rem)] font-semibold leading-[1.04] tracking-[-.055em]"
            >
              {campaign.statement.line1}{" "}
              <span className="text-marketing-accent-text">
                {campaign.statement.line2}
              </span>
            </h2>
            <p
              data-universe-end
              aria-hidden="true"
              className="col-start-1 row-start-1 mx-auto max-w-4xl text-balance text-[clamp(2.4rem,5.2vw,4.7rem)] font-semibold leading-[1.04] tracking-[-.055em] text-marketing-accent-text opacity-0"
            >
              {campaign.universe.assembledTitle}
            </p>
          </div>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-relaxed text-marketing-muted sm:text-base">
            {campaign.universe.description}
          </p>
        </div>
        <div
          ref={artRef}
          data-universe-art
          className="relative isolate mx-auto mt-5 flex h-[490px] min-h-[440px] w-full min-w-0 flex-1 items-center justify-center overflow-hidden [perspective:1100px] sm:h-[560px] group-data-[pinned=true]/universe:min-h-0"
        >
          <div
            data-universe-field
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-100"
          >
            <CinematicField variant="network" className="absolute inset-0" />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <div
              data-universe-hub
              className="hidden size-10 min-[374px]:size-16 flex-col items-center justify-center gap-0.5 rounded-xl min-[374px]:rounded-2xl border border-[#f0cf56]/35 bg-[#191a17] text-white shadow-[0_12px_40px_#00000020] group-data-[motion=true]/universe:flex lg:size-[150px] lg:gap-2 lg:rounded-[28px]"
            >
              <GatreeLogo
                size="lg"
                className="h-5 w-5 text-[#f0cf56] min-[374px]:h-7 min-[374px]:w-7 lg:h-16 lg:w-16"
              />
              <span className="text-[8px] font-semibold tracking-[-.05em] min-[374px]:text-[11px] lg:text-[23px]">
                Gatree
              </span>
            </div>
          </div>
          {campaign.universe.nodes.map((label, index) => {
            const Icon = icons[index];
            return (
              <div
                key={label}
                aria-hidden="true"
                style={
                  {
                    "--node-x": `${50 + positions[index][0] * 100}%`,
                    "--node-y": `${50 + positions[index][1] * 100}%`,
                  } as CSSProperties
                }
                className="pointer-events-none absolute left-[var(--node-x)] top-[var(--node-y)] z-0 hidden -translate-x-1/2 -translate-y-1/2 group-data-[motion=true]/universe:left-1/2 group-data-[motion=true]/universe:top-1/2 group-data-[motion=true]/universe:block"
              >
                <div
                  data-universe-node
                  className="flex h-[72px] w-[108px] items-center justify-center gap-2 rounded-xl border border-marketing-accent/15 bg-marketing-surface px-3 text-marketing-ink lg:h-[84px] lg:w-[166px]"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-[18px] shrink-0 text-marketing-accent-text lg:size-[22px]"
                    strokeWidth={1.5}
                  />
                  <span className="text-[11px] font-medium lg:text-sm">
                    {label}
                  </span>
                </div>
              </div>
            );
          })}
          <div className="relative z-10 flex flex-col items-center">
            <figure
              data-universe-phone
              className="w-[260px] max-w-[calc(100vw-56px)] overflow-hidden rounded-[28px] border border-white/20 bg-[#191a17] text-white shadow-[0_18px_60px_#00000030] lg:w-[340px] [&>div]:py-4 [&>div>div:first-child]:size-10 [&>div>div:nth-last-child(2)]:mt-4 [&>div>div:nth-last-child(2)]:gap-2 [&>div>div:nth-last-child(2)>div]:py-2 [&>div>div:last-child]:mt-4"
            >
              <figcaption className="border-b border-white/10 px-3 py-2 text-[10px] text-white/60">
                {campaign.audience.exampleLabel}
              </figcaption>
              <PreviewContent
                tree={{
                  title: persona.profileName,
                  description: persona.bio,
                  avatar: null,
                  linkStyle: {
                    variant: "filled",
                    radius: "pill",
                    bgColor: "#f0cf56",
                    textColor: "#171714",
                    shadowColor: "#171714",
                  },
                }}
                mockLinks={persona.links}
                size="sm"
                presentation="marketing"
              />
            </figure>
            <p
              data-universe-address
              className="mt-4 rounded-full border border-marketing-accent/30 bg-marketing-accent/10 px-4 py-2 text-xs font-semibold text-marketing-accent-text sm:text-sm"
            >
              {campaign.universe.address}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-marketing-muted motion-reduce:hidden">
          {campaign.universe.hint}
        </p>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-marketing-muted group-data-[motion=true]/universe:hidden">
          {campaign.universe.nodes.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
