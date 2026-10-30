"use client";

import { PreviewContent } from "@/components/editor/preview/preview-content";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type AudienceContent = Dictionary["marketing"]["campaign"]["audience"];
type AudienceItem = AudienceContent["items"][number];

const compositions = [
  {
    image: "/marketing/creator-cutout.png",
    position: "object-[70%_center]",
    surface: "bg-[#444b2b]",
    accent: "#f0cf56",
  },
  {
    image: "/marketing/studio-wide.png",
    position: "object-[35%_center]",
    surface: "bg-[#24241f]",
    accent: "#bcd19a",
  },
  {
    image: "/marketing/creator-cutout.png",
    position: "object-[70%_center]",
    surface: "bg-[#40332b]",
    accent: "#e5b9a0",
  },
  {
    image: "/marketing/studio-wide.png",
    position: "object-[75%_center]",
    surface: "bg-[#283532]",
    accent: "#b9d8d0",
  },
];

function AudienceDemo({
  item,
  index,
  label,
}: {
  item: AudienceItem;
  index: number;
  label: string;
}) {
  return (
    <figure
      data-audience-phone
      className="w-[252px] max-w-full shrink-0 self-center overflow-hidden rounded-[22px] border border-white/15 bg-[#191a17] shadow-[0_18px_45px_#0005] group-data-[immersive=true]/audience:[&>div]:py-4 group-data-[immersive=true]/audience:[&>div>div:first-child]:size-10 group-data-[immersive=true]/audience:[&>div>div:nth-last-child(2)]:mt-4 group-data-[immersive=true]/audience:[&>div>div:nth-last-child(2)]:gap-2 group-data-[immersive=true]/audience:[&>div>div:nth-last-child(2)>div]:py-2 group-data-[immersive=true]/audience:[&>div>div:last-child]:mt-4"
    >
      <figcaption className="border-b border-white/10 px-4 py-2 text-center text-[10px] font-medium text-white/60">
        {label}
      </figcaption>
      <PreviewContent
        tree={{
          title: item.profileName,
          description: item.bio,
          avatar: null,
          linkStyle: {
            variant: "filled",
            radius: "rounded",
            bgColor: compositions[index % compositions.length].accent,
            textColor: "#171714",
            shadowColor: "#171714",
          },
        }}
        mockLinks={item.links}
        presentation="marketing"
      />
    </figure>
  );
}

export function AudienceShowcase({ content }: { content: AudienceContent }) {
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const container = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const trigger = useRef<ScrollTrigger | null>(null);
  const id = useId();

  useGSAP(
    () => {
      const root = container.current;
      const stageElement = stage.current;
      const viewportElement = viewport.current;
      const trackElement = track.current;
      if (!root || !stageElement || !viewportElement || !trackElement) return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)",
        () => {
          root.dataset.immersive = "true";
          const panels = panelRefs.current.filter(
            (panel): panel is HTMLDivElement => panel !== null,
          );
          const chapters = panels.length;
          const panelWidth = () =>
            panels[0]?.getBoundingClientRect().width ||
            viewportElement.clientWidth;
          const updateChapter = (self: ScrollTrigger) => {
            const chapter = Math.min(
              chapters - 1,
              Math.floor(self.progress * chapters + 0.175),
            );
            if (chapter !== activeRef.current) {
              activeRef.current = chapter;
              setActive(chapter);
            }
          };
          gsap.set(trackElement, { x: 0 });
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: stageElement,
              start: "top 96px",
              end: () =>
                `+=${window.innerHeight * Math.max(1, chapters - 1) * 0.85}`,
              pin: stageElement,
              pinSpacing: true,
              scrub: 0.4,
              invalidateOnRefresh: true,
              onUpdate: updateChapter,
              onRefresh: updateChapter,
            },
          });
          panels.slice(1).forEach((_, index) => {
            timeline.to(
              trackElement,
              {
                x: () => -panelWidth() * (index + 1),
                duration: 0.35,
                ease: "none",
              },
              index + 0.65,
            );
          });
          panels.forEach((panel, index) => {
            const entrance = Math.max(0, index - 0.35);
            const art = panel.querySelector<HTMLElement>("[data-audience-art]");
            const phone = panel.querySelector<HTMLElement>(
              "[data-audience-phone]",
            );
            const copyLines = panel.querySelectorAll<HTMLElement>(
              "[data-audience-copy] > *",
            );
            // Scene layers move independently while the measured rail stays intact.
            if (art) {
              timeline.fromTo(
                art,
                { xPercent: -4 },
                {
                  xPercent: 4,
                  duration: Math.min(chapters, index + 1) - entrance,
                  ease: "none",
                },
                entrance,
              );
            }
            if (phone) {
              timeline.fromTo(
                phone,
                {
                  y: 30,
                  rotation: index % 2 === 0 ? -3 : 3,
                  transformOrigin: "center bottom",
                },
                { y: 0, rotation: 0, duration: 0.55, ease: "power2.out" },
                entrance,
              );
            }
            timeline.fromTo(
              copyLines,
              { y: 24, opacity: 0.7 },
              {
                y: 0,
                opacity: 1,
                duration: 0.42,
                stagger: 0.06,
                ease: "power2.out",
              },
              entrance,
            );
          });
          timeline.fromTo(
            "[data-audience-progress]",
            { scaleX: 0 },
            { scaleX: 1, duration: chapters, ease: "none" },
            0,
          );
          trigger.current = timeline.scrollTrigger || null;
          if (trigger.current) updateChapter(trigger.current);
          return () => {
            trigger.current = null;
            delete root.dataset.immersive;
          };
        },
      );
      return () => media.revert();
    },
    { scope: container, dependencies: [content], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (trigger.current) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          `[data-audience-panel="${active}"]`,
          { opacity: 0.6, y: 12 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
        );
      });
      return () => media.revert();
    },
    { scope: container, dependencies: [active], revertOnUpdate: true },
  );

  function select(index: number) {
    const currentTrigger = trigger.current;
    if (currentTrigger) {
      window.scrollTo({
        top:
          currentTrigger.start +
          (index / content.items.length) *
            (currentTrigger.end - currentTrigger.start),
        behavior: "smooth",
      });
    } else {
      activeRef.current = index;
      setActive(index);
    }
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % content.items.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + content.items.length) % content.items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = content.items.length - 1;
    else return;
    event.preventDefault();
    select(next);
    tabs.current[next]?.focus({ preventScroll: true });
  }

  return (
    <section
      ref={container}
      aria-labelledby={`${id}-heading`}
      className="group/audience mx-auto w-[calc(100%-32px)] max-w-[1240px] py-24 md:w-[calc(100%-64px)] md:py-36"
    >
      <div
        ref={stage}
        data-audience-stage
        data-audience-phase={active}
        className="flex flex-col group-data-[immersive=true]/audience:h-[calc(100dvh-120px)] group-data-[immersive=true]/audience:max-h-[800px]"
      >
        <div className="mb-8 shrink-0 group-data-[immersive=true]/audience:mb-5">
          <h2
            id={`${id}-heading`}
            className="max-w-[900px] text-balance text-[clamp(32px,4.7vw,62px)] font-medium leading-[1.04] tracking-[-.055em] text-marketing-ink group-data-[immersive=true]/audience:text-[clamp(32px,3.5vw,48px)]"
          >
            {content.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-marketing-muted sm:text-lg group-data-[immersive=true]/audience:mt-2 group-data-[immersive=true]/audience:text-sm">
            {content.description}
          </p>
        </div>
        <div className="relative mb-5 shrink-0">
          <div
            role="tablist"
            aria-labelledby={`${id}-heading`}
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"
          >
            {content.items.map((item, index) => (
              <button
                key={item.name}
                ref={(node) => {
                  tabs.current[index] = node;
                }}
                id={`${id}-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={active === index}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => onTabKey(event, index)}
                className={cn(
                  "min-h-11 cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-marketing-accent-text",
                  active === index
                    ? "border-marketing-accent bg-marketing-accent text-marketing-accent-ink"
                    : "border-marketing-border text-marketing-muted hover:bg-marketing-soft",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <div
            aria-hidden="true"
            className="mt-4 hidden h-px overflow-hidden bg-marketing-border group-data-[immersive=true]/audience:block"
          >
            <div
              data-audience-progress
              className="h-full origin-left bg-marketing-accent"
            />
          </div>
        </div>
        <div
          ref={viewport}
          className="min-h-0 overflow-hidden rounded-3xl group-data-[immersive=true]/audience:flex-1"
        >
          <div
            ref={track}
            className="grid w-full group-data-[immersive=true]/audience:flex group-data-[immersive=true]/audience:h-full"
          >
            {content.items.map((item, index) => (
              <div
                key={item.name}
                ref={(node) => {
                  panelRefs.current[index] = node;
                }}
                data-audience-panel={index}
                id={`${id}-panel-${index}`}
                role="tabpanel"
                aria-labelledby={`${id}-tab-${index}`}
                aria-hidden={active !== index}
                inert={active !== index}
                tabIndex={active === index ? 0 : -1}
                className={cn(
                  "relative isolate col-start-1 row-start-1 w-full min-w-0 shrink-0 overflow-hidden rounded-3xl p-6 group-data-[immersive=true]/audience:block group-data-[immersive=true]/audience:h-full group-data-[immersive=true]/audience:px-10 group-data-[immersive=true]/audience:py-6",
                  compositions[index % compositions.length].surface,
                  active !== index && "hidden",
                )}
              >
                <Image
                  data-audience-art
                  src={compositions[index % compositions.length].image}
                  alt=""
                  fill
                  sizes="(min-width: 1304px) 1240px, (min-width: 768px) calc(100vw - 64px), calc(100vw - 32px)"
                  className={cn(
                    "-z-20 opacity-55",
                    index % 2 === 0 ? "object-contain" : "object-cover",
                    compositions[index % compositions.length].position,
                  )}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-linear-to-r from-black/75 via-black/30 to-black/15"
                />
                <div className="flex h-full flex-col items-center justify-center gap-8 sm:flex-row sm:gap-10 group-data-[immersive=true]/audience:justify-between">
                  <div
                    data-audience-copy
                    className="max-w-xl text-white sm:flex-1"
                  >
                    <p className="mb-4 text-sm font-medium text-white/75">
                      {item.name}
                    </p>
                    <h3 className="max-w-[18ch] text-balance text-[clamp(30px,4vw,52px)] font-medium leading-[1.06] tracking-[-.04em] group-data-[immersive=true]/audience:text-[clamp(30px,3.5vw,48px)]">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-[40ch] text-base leading-relaxed text-white/80">
                      {item.description}
                    </p>
                  </div>
                  <AudienceDemo
                    item={item}
                    index={index}
                    label={content.exampleLabel}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <noscript>
        <div className="mt-10 grid gap-8 text-marketing-ink md:grid-cols-3">
          {content.items.slice(1).map((item) => (
            <article key={item.name}>
              <p className="mb-3 text-sm text-marketing-muted">{item.name}</p>
              <h3 className="text-balance text-2xl font-medium leading-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-marketing-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </noscript>
    </section>
  );
}
