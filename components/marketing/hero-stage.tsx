"use client";

import { PreviewContent } from "@/components/editor/preview/preview-content";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CinematicField } from "./cinematic-field";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HeroStage({
  content,
  persona,
  exampleLabel,
  cta,
  localePath,
}: {
  content: Dictionary["marketing"]["campaign"]["hero"];
  persona: Dictionary["marketing"]["campaign"]["audience"]["items"][number];
  exampleLabel: string;
  cta: string;
  localePath: string;
}) {
  const root = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const introPlayed = useRef(false);
  const [resizeRevision, setResizeRevision] = useState(0);

  useEffect(() => {
    let timer = 0;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(
        () => setResizeRevision((value) => value + 1),
        120,
      );
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
          immersive: "(min-width: 1024px) and (min-height: 760px)",
        },
        (context) => {
          if (!context.conditions?.motion) return;
          if (!introPlayed.current) {
            introPlayed.current = true;
            const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
            intro
              .from("[data-hero-line]", {
                y: 46,
                opacity: 0,
                duration: 0.9,
                stagger: 0.13,
              })
              .from(
                "[data-hero-copy]",
                { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 },
                "-=0.5",
              )
              .from(
                "[data-hero-portrait]",
                { y: 35, opacity: 0, duration: 1.1 },
                0.15,
              )
              .from(
                "[data-hero-profile]",
                { y: 65, rotation: -12, opacity: 0, duration: 1.1 },
                0.4,
              );
          }

          if (context.conditions?.immersive) {
            element.dataset.pinned = "true";
            const phone = element.querySelector<HTMLElement>(
              "[data-hero-profile-depth]",
            );
            if (!phone) return;
            // Recompute opening coordinates on refresh so desktop resizes keep
            // the same camera path. Entrances still own separate inner wrappers.
            const openingPhoneHeight = phone.clientHeight;
            const openingWidth = () => Math.min(560, stage.clientWidth * 0.46);
            const openingHeight = () => Math.min(780, window.innerHeight - 160);
            gsap.set(art, { right: "auto", maxWidth: "none" });
            gsap.set(phone, { bottom: "auto" });
            const scene = gsap.timeline({
              defaults: { ease: "power2.inOut" },
              scrollTrigger: {
                trigger: stage,
                start: "top 88px",
                end: () => `+=${window.innerHeight * 1.15}`,
                pin: stage,
                pinSpacing: true,
                scrub: 0.5,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  stage.dataset.heroSceneProgress = self.progress.toFixed(3);
                  element.dataset.sceneProgress = self.progress.toFixed(3);
                  element.dispatchEvent(
                    new CustomEvent("gatree:scene-progress", {
                      detail: self.progress,
                    }),
                  );
                },
                onRefresh: (self) => {
                  stage.dataset.heroSceneProgress = self.progress.toFixed(3);
                  element.dataset.sceneProgress = self.progress.toFixed(3);
                  element.dispatchEvent(
                    new CustomEvent("gatree:scene-progress", {
                      detail: self.progress,
                    }),
                  );
                },
              },
            });
            scene
              .to(
                "[data-hero-line-depth='first']",
                { xPercent: -70, y: -95, autoAlpha: 0, duration: 0.38 },
                0,
              )
              .to(
                "[data-hero-line-depth='second']",
                { xPercent: 55, y: 75, autoAlpha: 0, duration: 0.38 },
                0.04,
              )
              .to(
                "[data-hero-copy-depth]",
                { y: -45, autoAlpha: 0, duration: 0.28 },
                0,
              )
              .fromTo(
                art,
                {
                  left: () => stage.clientWidth + 12 - openingWidth(),
                  top: -28,
                  width: openingWidth,
                  height: openingHeight,
                },
                {
                  left: 0,
                  top: 0,
                  width: () => stage.clientWidth,
                  height: () => stage.clientHeight,
                  duration: 0.3,
                },
                0.12,
              )
              .fromTo(
                "[data-hero-arch]",
                {
                  left: () => openingWidth() * 0.09,
                  right: () => openingWidth() * 0.09,
                  top: () => openingHeight() * 0.08,
                  bottom: 0,
                  borderRadius: "9999px 9999px 36px 36px",
                  backgroundColor: "rgba(240,207,86,0.1)",
                },
                {
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  borderRadius: "32px",
                  backgroundColor: "#191b17",
                  duration: 0.28,
                },
                0.14,
              )
              .to(
                "[data-hero-glow]",
                { scale: 1.2, opacity: 0, duration: 0.3 },
                0.12,
              )
              .fromTo(
                "[data-hero-portrait-depth]",
                {
                  left: () => openingWidth() * 0.12,
                  right: 0,
                  y: 0,
                  autoAlpha: 1,
                },
                {
                  left: 0,
                  right: 0,
                  y: -15,
                  duration: 0.27,
                },
                0.15,
              )
              .to(
                "[data-hero-portrait-depth]",
                { autoAlpha: 0, duration: 0.12 },
                0.3,
              )
              .fromTo(
                phone,
                {
                  left: -28,
                  top: () =>
                    Math.min(openingHeight(), 620) - openingPhoneHeight - 32,
                  width: 220,
                  yPercent: 0,
                  rotation: 0,
                },
                {
                  left: () => stage.clientWidth * 0.7 - 180,
                  top: () => stage.clientHeight / 2,
                  yPercent: -50,
                  width: 360,
                  rotation: 6,
                  duration: 0.42,
                },
                0.17,
              )
              .to("[data-hero-field]", { opacity: 0.22, duration: 0.18 }, 0.42)
              .set("[data-hero-final-pitch]", { autoAlpha: 1 }, 0.43)
              .fromTo(
                "[data-hero-final-pitch]",
                { y: 18 },
                { y: 0, duration: 0.12, ease: "power2.out" },
                0.43,
              )
              .to({}, { duration: 0.4 });
          } else {
            const text = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: element,
                start: "top top",
                end: "top -45%",
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            });
            text
              .to(
                "[data-hero-line-depth='first']",
                { x: -16, y: -42, opacity: 0.7 },
                0,
              )
              .to(
                "[data-hero-line-depth='second']",
                { x: 20, y: -22, opacity: 0.8 },
                0,
              )
              .to("[data-hero-copy-depth]", { y: -12, opacity: 0.85 }, 0);
            const movement = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: art,
                start: "top 80%",
                end: "bottom 10%",
                scrub: 0.6,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                  stage.dataset.heroSceneProgress = self.progress.toFixed(3);
                  element.dataset.sceneProgress = self.progress.toFixed(3);
                  element.dispatchEvent(
                    new CustomEvent("gatree:scene-progress", {
                      detail: self.progress,
                    }),
                  );
                },
                onRefresh: (self) => {
                  stage.dataset.heroSceneProgress = self.progress.toFixed(3);
                  element.dataset.sceneProgress = self.progress.toFixed(3);
                  element.dispatchEvent(
                    new CustomEvent("gatree:scene-progress", {
                      detail: self.progress,
                    }),
                  );
                },
              },
            });
            movement
              .to("[data-hero-field]", { opacity: 0.35 }, 0)
              .to(
                "[data-hero-arch]",
                { scale: 1.14, y: -16, borderRadius: "100px 100px 36px 36px" },
                0,
              )
              .to(
                "[data-hero-portrait-depth]",
                { x: 14, y: -36, scale: 1.03 },
                0,
              )
              .to(
                "[data-hero-profile-depth]",
                { x: 38, y: -48, rotation: 6, scale: 1.04 },
                0,
              )
              .to(
                "[data-hero-glow]",
                { x: -45, y: 28, scale: 1.2, opacity: 0.65 },
                0,
              );
          }
          return () => {
            delete element.dataset.pinned;
            stage.dataset.heroSceneProgress = "0";
            element.dataset.sceneProgress = "0";
          };
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [resizeRevision], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      className="group/hero relative isolate overflow-x-clip px-5 pt-10 pb-16 sm:px-8 lg:min-h-[min(738px,calc(100dvh-68px))] lg:px-10 lg:pt-16 lg:pb-6 [@media(max-height:740px)]:lg:pt-10"
    >
      <div className="relative mx-auto max-w-[1280px]">
        <div
          ref={stageRef}
          data-hero-stage
          data-hero-scene-progress="0"
          className="bg-marketing-bg relative w-full group-data-[pinned=true]/hero:h-[min(650px,calc(100dvh-156px))]"
        >
          <div className="relative z-10 lg:max-w-[70%]">
            <h1 className="max-w-5xl text-[clamp(3.3rem,8.7vw,8rem)] leading-[0.98] font-semibold tracking-[-0.065em] [@media(max-height:740px)]:lg:text-[clamp(3.3rem,7.5vw,6.25rem)]">
              <span data-hero-line-depth="first" className="block">
                <span data-hero-line className="inline-block">
                  {content.line1}
                </span>
              </span>
              <span
                data-hero-line-depth="second"
                className="text-marketing-accent-text block"
              >
                <span data-hero-line className="inline-block">
                  {content.line2}
                </span>
              </span>
            </h1>
            <div data-hero-copy-depth>
              <p
                data-hero-copy
                className="text-marketing-muted mt-7 max-w-[420px] text-base leading-[1.7] text-pretty sm:text-lg lg:mt-9"
              >
                {content.subtitle}
              </p>
              <div
                data-hero-copy
                className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-5 lg:mt-10"
              >
                <Link
                  href={`${localePath}/login`}
                  className="group bg-marketing-accent text-marketing-accent-ink inline-flex min-h-14 items-center justify-center gap-4 rounded-full px-7 py-4 text-sm font-semibold whitespace-nowrap transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 motion-reduce:transform-none"
                >
                  {cta}
                  <ArrowUpRight
                    size={20}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:rotate-45 motion-reduce:transition-none"
                  />
                </Link>
                <Link
                  href="#produto"
                  className="group text-marketing-ink inline-flex min-h-11 items-center gap-3 text-sm font-medium"
                >
                  {content.secondary}
                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-[5%] z-30 hidden w-[42%] max-w-[500px] items-center group-data-[pinned=true]/hero:flex">
            <div
              data-hero-final-pitch
              className="pointer-events-auto invisible w-full text-[#f1f3ec] opacity-0"
            >
              <h2 className="text-[clamp(3rem,4.45vw,4rem)] leading-[1.08] font-semibold tracking-[-.055em] text-balance">
                {content.sceneTitle}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-pretty text-white/70">
                {content.subtitle}
              </p>
              <Link
                href={`${localePath}/login`}
                className="group bg-marketing-accent text-marketing-accent-ink focus-visible:outline-marketing-accent mt-8 inline-flex min-h-14 items-center justify-center gap-4 rounded-full px-7 py-4 text-sm font-semibold whitespace-nowrap transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 active:translate-y-0 motion-reduce:transform-none"
              >
                {cta}
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div
            ref={artRef}
            data-hero-art
            className="relative mx-auto mt-12 h-[460px] w-full max-w-[560px] sm:h-[570px] lg:absolute lg:-top-7 lg:-right-3 lg:mt-0 lg:h-[min(620px,calc(100dvh-160px))] lg:w-[46%] group-data-[pinned=true]/hero:lg:h-[min(780px,calc(100dvh-160px))]"
          >
            <div
              data-hero-glow
              className="bg-marketing-accent/10 pointer-events-none absolute inset-x-[8%] top-[12%] bottom-[10%] rounded-full blur-[60px]"
              aria-hidden="true"
            />
            <div
              data-hero-arch
              className="bg-marketing-accent/10 pointer-events-none absolute inset-x-[9%] top-[8%] bottom-0 rounded-t-full rounded-b-[36px]"
              aria-hidden="true"
            />
            <div
              data-hero-field
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] opacity-0 motion-reduce:hidden"
            >
              <CinematicField variant="portal" className="absolute inset-0" />
            </div>
            <div
              data-hero-portrait-depth
              className="absolute inset-y-0 right-0 left-[12%]"
            >
              <div
                data-hero-portrait
                className="absolute inset-0 overflow-hidden rounded-[36px]"
              >
                <Image
                  src="/marketing/creator-cutout.png"
                  alt={content.portraitAlt}
                  fill
                  priority
                  sizes="(min-width: 1280px) 510px, (min-width: 1024px) 46vw, (min-width: 640px) 480px, 85vw"
                  className="object-contain object-bottom"
                />
              </div>
            </div>
            <div
              data-hero-profile-depth
              className="absolute bottom-4 left-0 w-[190px] sm:bottom-8 sm:w-[220px] lg:-left-7"
            >
              <figure
                data-hero-profile
                className="-rotate-6 overflow-hidden rounded-[24px] border border-white/15 bg-[#191a17] text-[#f3f4ed] shadow-[0_24px_70px_#11121050]"
              >
                <figcaption className="border-b border-white/10 px-3 py-2 text-center font-mono text-[10px] text-white/65">
                  {exampleLabel}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
