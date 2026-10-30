"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface ScrollStoryProps {
  content: Dictionary["marketing"]["campaign"]["story"] & {
    tabs?: readonly string[];
  };
  localePath: string;
  ctaLabel: string;
}

const screenshots = [
  "/marketing/editor-demo-hd.jpg",
  null,
  "/marketing/short-links-demo-hd.jpg",
];
const AnalyticsDemo = dynamic(
  () => import("./analytics-demo").then((module) => module.AnalyticsDemo),
  { ssr: false },
);

export function ScrollStory({
  content,
  localePath,
  ctaLabel,
}: ScrollStoryProps) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const activeRef = useRef(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const sectionId = useId();
  const english = localePath.startsWith("/en");
  const labels = content.tabs || [
    "Editor",
    "Analytics",
    english ? "Short links" : "Links curtos",
  ];

  useGSAP(
    () => {
      const element = root.current;
      const stage = stageRef.current;
      if (!element || !stage) return;
      const media = gsap.matchMedia();
      media.add(
        "(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference), (min-width: 360px) and (max-width: 1023px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)",
        () => {
          element.dataset.immersive = "true";
          const panels = gsap.utils.toArray<HTMLElement>(
            "[data-story-scene]",
            element,
          );
          const duration = Math.max(1, panels.length);
          const scrollDistance = Math.max(1, panels.length - 1);
          gsap.set(panels, { opacity: 0, y: 20 });
          gsap.set(panels[0], { opacity: 1, y: 0 });
          const updatePhase = (self: ScrollTrigger) => {
            const chapter = Math.min(
              panels.length - 1,
              Math.floor(self.progress * duration + 0.15),
            );
            if (chapter !== activeRef.current) {
              activeRef.current = chapter;
              setActiveTab(chapter);
            }
          };
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top 96px",
              end: () => `+=${window.innerHeight * scrollDistance * 0.85}`,
              pin: stage,
              pinSpacing: true,
              scrub: 0.35,
              invalidateOnRefresh: true,
              onUpdate: updatePhase,
              onRefresh: updatePhase,
            },
          });
          panels.slice(1).forEach((panel, offset) => {
            const position = offset + 0.7;
            timeline.to(
              panels[offset],
              { opacity: 0, y: -20, duration: 0.3, ease: "none" },
              position,
            );
            timeline.to(
              panel,
              { opacity: 1, y: 0, duration: 0.3, ease: "none" },
              position,
            );
          });
          timeline.fromTo(
            "[data-story-progress]",
            { scaleX: 0 },
            { scaleX: 1, duration, ease: "none" },
            0,
          );
          triggerRef.current = timeline.scrollTrigger || null;
          if (triggerRef.current) updatePhase(triggerRef.current);
          return () => {
            triggerRef.current = null;
            delete element.dataset.immersive;
          };
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [content], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (triggerRef.current) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          `[data-story-scene="${activeTab}"]`,
          { opacity: 0.65, y: 10 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
        );
      });
      return () => media.revert();
    },
    { scope: root, dependencies: [activeTab], revertOnUpdate: true },
  );

  function selectTab(index: number) {
    const trigger = triggerRef.current;
    if (trigger) {
      const fraction = index / Math.max(1, content.steps.length);
      window.scrollTo({
        top: trigger.start + fraction * (trigger.end - trigger.start),
        behavior: "smooth",
      });
    } else {
      activeRef.current = index;
      setActiveTab(index);
    }
  }

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const count = content.steps.length;
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % count;
    else if (event.key === "ArrowLeft") next = (index - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;
    event.preventDefault();
    selectTab(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  }

  return (
    <section
      ref={root}
      id="produto"
      aria-labelledby={`${sectionId}-heading`}
      className="group/story scroll-mt-24 px-5 py-20 text-marketing-ink sm:px-8 md:py-28 lg:px-10"
    >
      <div
        data-story-stage
        data-story-phase={activeTab}
        ref={stageRef}
        className="mx-auto flex max-w-[1240px] flex-col group-data-[immersive=true]/story:h-[calc(100dvh-110px)] group-data-[immersive=true]/story:max-h-[850px]"
      >
        <div className="mb-7 max-w-4xl shrink-0 group-data-[immersive=true]/story:mb-4">
          <h2
            id={`${sectionId}-heading`}
            className="text-balance text-[clamp(2.1rem,4.4vw,4.1rem)] font-semibold leading-[1.04] tracking-[-0.045em] group-data-[immersive=true]/story:text-[28px] group-data-[immersive=true]/story:lg:text-[clamp(2rem,3vw,3rem)]"
          >
            {content.title}
          </h2>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-marketing-muted sm:text-lg group-data-[immersive=true]/story:mt-2 group-data-[immersive=true]/story:text-sm group-data-[immersive=true]/story:lg:text-base">
            {content.description}
          </p>
        </div>
        <div className="relative mb-7 shrink-0 border-b border-marketing-border group-data-[immersive=true]/story:mb-4">
          <div
            role="tablist"
            aria-labelledby={`${sectionId}-heading`}
            className="flex gap-1 sm:gap-5"
          >
            {content.steps.map((step, index) => (
              <button
                key={step.title}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`${sectionId}-tab-${index}`}
                aria-selected={activeTab === index}
                aria-controls={`${sectionId}-panel-${index}`}
                tabIndex={activeTab === index ? 0 : -1}
                onClick={() => selectTab(index)}
                onKeyDown={(event) => handleTabKey(event, index)}
                className={`-mb-px min-h-12 border-b-2 px-4 py-3 text-[15px] font-medium transition-colors motion-reduce:transition-none sm:px-5 sm:text-lg ${activeTab === index ? "border-marketing-accent-text text-marketing-ink" : "border-transparent text-marketing-muted hover:border-marketing-border hover:text-marketing-ink"}`}
              >
                {labels[index] || step.tags[0]}
              </button>
            ))}
          </div>
          <div
            aria-hidden="true"
            data-story-progress
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-0.5 origin-left bg-marketing-accent group-data-[immersive=true]/story:block"
          />
        </div>
        <div className="grid min-h-0 group-data-[immersive=true]/story:flex-1">
          {content.steps.map((step, index) => (
            <div
              key={step.title}
              data-story-scene={index}
              id={`${sectionId}-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`${sectionId}-tab-${index}`}
              aria-hidden={activeTab !== index}
              inert={activeTab !== index}
              tabIndex={activeTab === index ? 0 : -1}
              className={`col-start-1 row-start-1 min-w-0 group-data-[immersive=true]/story:flex group-data-[immersive=true]/story:flex-col group-data-[immersive=true]/story:min-h-0 group-data-[immersive=true]/story:justify-center group-data-[immersive=true]/story:gap-3 group-data-[immersive=true]/story:lg:grid group-data-[immersive=true]/story:lg:grid-cols-[minmax(0,.3fr)_minmax(0,.7fr)] group-data-[immersive=true]/story:lg:items-center group-data-[immersive=true]/story:lg:gap-7 ${activeTab === index ? "opacity-100" : "hidden pointer-events-none opacity-0"}`}
            >
              <div className="mb-6 group-data-[immersive=true]/story:mb-0">
                <h3 className="text-balance text-[clamp(1.5rem,2.5vw,2rem)] font-semibold leading-tight tracking-[-0.035em] group-data-[immersive=true]/story:text-[22px] group-data-[immersive=true]/story:lg:text-[clamp(1.5rem,2.5vw,2rem)]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-pretty text-[15px] leading-relaxed text-marketing-muted sm:text-base group-data-[immersive=true]/story:mt-2 group-data-[immersive=true]/story:text-sm group-data-[immersive=true]/story:lg:mt-3 group-data-[immersive=true]/story:lg:text-base">
                  {step.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-3 text-xs text-marketing-muted group-data-[immersive=true]/story:hidden group-data-[immersive=true]/story:lg:flex group-data-[immersive=true]/story:lg:flex-col">
                  {step.tags.map((tag) => (
                    <li key={tag} className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-1 rounded-full bg-marketing-accent-text"
                      />
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid min-h-48 min-w-0 place-items-center overflow-hidden rounded-3xl border border-marketing-border bg-[#111210] p-2 sm:p-3 group-data-[immersive=true]/story:min-h-0 group-data-[immersive=true]/story:max-h-full group-data-[immersive=true]/story:w-full">
                {index === 1 ? (
                  <AnalyticsDemo english={english} compact />
                ) : (
                  <Image
                    src={screenshots[index] || "/marketing/editor-demo-hd.jpg"}
                    alt={step.alt}
                    width={index === 2 ? 1120 : 1952}
                    height={index === 2 ? 1414 : 1280}
                    quality={95}
                    sizes={
                      index === 2
                        ? "(min-width: 1024px) 540px, (min-width: 640px) 540px, calc(100vw - 58px)"
                        : "(min-width: 1320px) 823px, (min-width: 1024px) 65vw, (min-width: 640px) calc(100vw - 90px), calc(100vw - 58px)"
                    }
                    className={`block h-auto max-h-[680px] max-w-full rounded-xl object-contain group-data-[immersive=true]/story:max-h-[calc(100dvh-560px)] group-data-[immersive=true]/story:lg:max-h-[min(590px,calc(100dvh-370px))] ${index === 2 ? "w-[540px]" : "w-[976px]"}`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex shrink-0 items-center justify-between gap-5 group-data-[immersive=true]/story:mt-4">
          <Link
            href={`${localePath}/login`}
            className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-marketing-accent px-6 py-3 text-sm font-semibold text-marketing-accent-ink transition-colors hover:bg-marketing-accent/85 motion-reduce:transition-none"
          >
            {ctaLabel}
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
          <p className="hidden text-[11px] text-marketing-muted group-data-[immersive=true]/story:block lg:text-sm">
            {english ? "Scroll to explore" : "Role para explorar"}
          </p>
        </div>
      </div>
    </section>
  );
}
