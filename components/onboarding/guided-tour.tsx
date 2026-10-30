"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { createPortal } from "react-dom";
import {
  positionCoach,
  shadePath,
  spotlightRect,
  type TourRect,
  type TourViewport,
} from "./position";

export interface GuidedTourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  tip?: string;
}

export interface GuidedTourProps {
  step: GuidedTourStep;
  index: number;
  total: number;
  translations: Dictionary["onboarding"];
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  onDismiss: () => void;
  transitioning?: boolean;
}

type Measurement = {
  id: string;
  status: "loading" | "ready" | "missing";
  rect: TourRect | null;
  viewport: TourViewport;
  canvasWidth: number;
  canvasHeight: number;
  coachHeight: number;
};
const subscribe = () => () => {};
const getClient = () => true;
const getServer = () => false;

function viewportBounds(): TourViewport {
  const viewport = window.visualViewport;
  return {
    left: viewport?.offsetLeft ?? 0,
    top: viewport?.offsetTop ?? 0,
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
  };
}
function sameRect(a: TourRect | null, b: TourRect | null) {
  return (
    a === b ||
    (!!a &&
      !!b &&
      ["left", "top", "width", "height"].every(
        (key) =>
          Math.abs(a[key as keyof TourRect] - b[key as keyof TourRect]) < 0.5,
      ))
  );
}

export function GuidedTour({
  step,
  index,
  total,
  translations: t,
  onNext,
  onBack,
  onFinish,
  onDismiss,
  transitioning = false,
}: GuidedTourProps) {
  const mounted = useSyncExternalStore(subscribe, getClient, getServer);
  const coach = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const [measurement, setMeasurement] = useState<Measurement | null>(null);

  useEffect(() => {
    if (!mounted) return;
    let disposed = false;
    let frame = 0;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let unavailable = false;
    let observedTarget: HTMLElement | null = null;
    let scrolledTarget: HTMLElement | null = null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    function publish(rect: TourRect | null, status: Measurement["status"]) {
      if (disposed) return;
      const viewport = viewportBounds();
      const value: Measurement = {
        id: step.id,
        status,
        rect,
        viewport,
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight,
        coachHeight: coach.current?.getBoundingClientRect().height || 300,
      };
      setMeasurement((previous) =>
        previous?.id === value.id &&
        previous.status === status &&
        sameRect(previous.rect, rect) &&
        sameRect(previous.viewport, viewport) &&
        Math.abs(previous.coachHeight - value.coachHeight) < 0.5 &&
        previous.canvasWidth === value.canvasWidth &&
        previous.canvasHeight === value.canvasHeight
          ? previous
          : value,
      );
    }
    function waitForTarget() {
      if (timeout || unavailable) return;
      timeout = setTimeout(() => {
        timeout = null;
        if (disposed) return;
        unavailable = true;
        publish(null, "missing");
      }, 5000);
    }
    function findTarget() {
      if (transitioning) return null;
      try {
        return (
          Array.from(document.querySelectorAll<HTMLElement>(step.target)).find(
            (element) => {
              const rect = element.getBoundingClientRect();
              const style = getComputedStyle(element);
              return (
                rect.width > 0 &&
                rect.height > 0 &&
                style.visibility !== "hidden" &&
                style.opacity !== "0" &&
                !element.closest("[hidden],[inert]")
              );
            },
          ) ?? null
        );
      } catch {
        return null;
      }
    }
    function measure() {
      frame = 0;
      if (disposed) return;
      const target = findTarget();
      if (target !== observedTarget) {
        if (observedTarget) resizeObserver.unobserve(observedTarget);
        observedTarget = target;
        if (target) resizeObserver.observe(target);
      }
      if (!target) {
        publish(null, unavailable ? "missing" : "loading");
        waitForTarget();
        return;
      }
      const rect = target.getBoundingClientRect();
      const viewport = viewportBounds();
      const visible =
        rect.bottom > viewport.top &&
        rect.top < viewport.top + viewport.height &&
        rect.right > viewport.left &&
        rect.left < viewport.left + viewport.width;
      if (!visible) {
        if (scrolledTarget !== target) {
          scrolledTarget = target;
          target.scrollIntoView({
            block: "center",
            inline: "nearest",
            behavior: reduced.matches ? "auto" : "smooth",
          });
        }
        publish(null, unavailable ? "missing" : "loading");
        waitForTarget();
        return;
      }
      if (timeout) clearTimeout(timeout);
      timeout = null;
      unavailable = false;
      publish(
        spotlightRect(rect, window.innerWidth, window.innerHeight),
        "ready",
      );
    }
    function schedule() {
      if (!disposed && !frame) frame = requestAnimationFrame(measure);
    }
    const resizeObserver = new ResizeObserver(schedule);
    if (coach.current) resizeObserver.observe(coach.current);
    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "data-tour"],
    });
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    schedule();
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      if (timeout) clearTimeout(timeout);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [mounted, step.id, step.target, transitioning]);

  useEffect(() => {
    if (mounted) heading.current?.focus({ preventScroll: true });
  }, [mounted, step.id]);

  if (!mounted) return null;
  const current = measurement?.id === step.id ? measurement : null;
  const viewport = current?.viewport ?? viewportBounds();
  const status = current?.status ?? "loading";
  const ready = status === "ready" && !transitioning;
  const rect = ready ? (current?.rect ?? null) : null;
  const available = ready || status === "missing";
  const layout = positionCoach(rect, viewport, current?.coachHeight ?? 300);
  const counter = t.stepLabel
    .replace("{{current}}", String(index + 1))
    .replace("{{total}}", String(total));
  const width = current?.canvasWidth ?? window.innerWidth;
  const height = current?.canvasHeight ?? window.innerHeight;

  return createPortal(
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
    >
      <div
        data-guided-tour
        className="product-route pointer-events-auto fixed inset-0 z-[100] touch-pan-y font-sans text-ink"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <svg
          aria-hidden="true"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <path
            d={shadePath(rect, width, height)}
            fill="#050605"
            fillOpacity=".74"
            fillRule="evenodd"
          />
          {rect && (
            <rect
              data-tour-highlight
              x={rect.left}
              y={rect.top}
              width={rect.width}
              height={rect.height}
              rx={Math.min(12, rect.width / 2, rect.height / 2)}
              fill="none"
              stroke="#f0cf56"
              strokeWidth="2"
            />
          )}
        </svg>
        <DialogPrimitive.Content
          asChild
          onInteractOutside={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            previousFocus.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            heading.current?.focus({ preventScroll: true });
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const launcher = Array.from(
              document.querySelectorAll<HTMLElement>("[data-tour-launcher]"),
            ).find((element) => element.getBoundingClientRect().width > 0);
            if (launcher) launcher.focus({ preventScroll: true });
            else if (previousFocus.current?.isConnected)
              previousFocus.current.focus({ preventScroll: true });
          }}
        >
          <div
            ref={coach}
            data-tour-tooltip
            data-placement={layout.placement}
            className="fixed flex flex-col overflow-hidden rounded-2xl border border-hairline-strong bg-surface-1 shadow-[0_18px_70px_#0006]"
            style={{
              left: layout.left,
              top: layout.top,
              width: layout.width,
              maxHeight: layout.maxHeight,
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3">
              <p className="text-xs font-medium tabular-nums text-primary">
                {counter}
              </p>
              <button
                type="button"
                onClick={onDismiss}
                aria-label={t.close}
                className="grid size-11 shrink-0 place-items-center rounded-full text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div
              className="min-h-0 overflow-y-auto px-5 pb-5"
              aria-live="polite"
              aria-atomic="true"
            >
              <DialogPrimitive.Title asChild>
                <h2
                  ref={heading}
                  tabIndex={-1}
                  className="text-balance text-[22px] font-semibold leading-[1.15] tracking-[-.035em] outline-none"
                >
                  {step.title}
                </h2>
              </DialogPrimitive.Title>
              <DialogPrimitive.Description asChild>
                <p
                  className={
                    status === "loading"
                      ? "sr-only"
                      : "mt-3 text-sm leading-relaxed text-ink-subtle"
                  }
                >
                  {step.description}
                </p>
              </DialogPrimitive.Description>
              {step.tip && status !== "loading" && (
                <p className="mt-3 text-xs leading-relaxed text-ink-tertiary">
                  {step.tip}
                </p>
              )}
              {!ready && (
                <p
                  role="status"
                  className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink-subtle"
                >
                  {status === "loading" && (
                    <Loader2
                      size={14}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 animate-spin motion-reduce:animate-none"
                    />
                  )}
                  {status === "missing"
                    ? t.guided.unavailable
                    : t.guided.loading}
                </p>
              )}
            </div>
            <footer className="shrink-0 border-t border-hairline px-5 pt-4 pb-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={index === 0 || !available}
                  onClick={onBack}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-hairline px-4 text-xs font-medium transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  {t.back}
                </button>
                <button
                  type="button"
                  disabled={!available}
                  onClick={index === total - 1 ? onFinish : onNext}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-product-accent px-4 text-xs font-semibold text-on-primary transition-colors hover:bg-product-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-40"
                >
                  {index === total - 1 ? t.finish : t.next}
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                className="mt-1 min-h-11 w-full rounded-full px-4 text-xs text-ink-tertiary transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {t.skip}
              </button>
            </footer>
          </div>
        </DialogPrimitive.Content>
      </div>
    </DialogPrimitive.Root>,
    document.body,
  );
}
