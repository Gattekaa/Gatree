"use client";

import { useEffect, useId, useRef } from "react";

export function CinematicField({
  variant = "portal",
  className = "",
}: {
  variant?: "portal" | "network";
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<SVGGElement>(null);
  const id = useId().replace(/:/g, "");
  const gradientId = `connection-light-${id}`;
  const focalX = variant === "portal" ? 900 : 640;
  const paths = Array.from({ length: 8 }, (_, index) => {
    const left = index % 2 === 0;
    const row = Math.floor(index / 2);
    if (variant === "network") {
      const startX = left ? 310 : 970;
      const startY = [160, 320, 480, 640][row];
      const endX = left ? 555 : 725;
      const endY = 400 + [-36, -12, 12, 36][row];
      return `M ${startX} ${startY} C ${left ? 414 : 866} ${startY}, ${left ? 463 : 817} ${endY}, ${endX} ${endY}`;
    }
    const startX = left ? -60 : 1340;
    const startY = 110 + row * 175;
    const bendX = left ? focalX - 300 : focalX + 300;
    return `M ${startX} ${startY} C ${left ? 190 : 1090} ${startY}, ${bendX} ${330 + index * 9}, ${focalX} ${370 + index * 8}`;
  });

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const section = element.closest("section");
    const highlights = element.querySelectorAll<SVGPathElement>(
      "[data-connection-highlight]",
    );
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let progress = Number(section?.dataset.sceneProgress || 0);
    let pointerX = 0;
    let pointerY = 0;
    let visible = true;
    let frame = 0;
    let disposed = false;
    function draw() {
      frame = 0;
      if (!visible || disposed) return;
      const position = reduced.matches
        ? 0.7
        : Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
      highlights.forEach((path, index) => {
        if (variant === "network") {
          const route = Number(path.dataset.routeIndex);
          const row = Math.floor(route / 2);
          const left = route % 2 === 0;
          const start = left ? 0.1 + row * 0.028 : 0.31 + row * 0.024;
          const duration = left ? 0.116 : 0.108;
          const local = Math.max(0, Math.min(1, (position - start) / duration));
          const active = position > start && position < start + duration;
          const glow = path.hasAttribute("data-connection-glow");
          path.style.strokeDashoffset = String(-local * 930);
          path.style.opacity = reduced.matches
            ? "0"
            : String((active ? 1 : 0.35) * (glow ? 0.4 : 1));
          return;
        }
        path.style.strokeDashoffset = String(
          1000 - position * 1120 + index * 28,
        );
        path.style.opacity = reduced.matches
          ? "0"
          : String(0.15 + Math.sin(position * Math.PI) * 0.55);
      });
      if (layer.current)
        layer.current.setAttribute(
          "transform",
          variant === "network"
            ? "translate(0, 0)"
            : `translate(${pointerX * 8}, ${pointerY * 5})`,
        );
      element!.dataset.ready = "true";
    }
    function schedule() {
      if (!frame && visible && !disposed) frame = requestAnimationFrame(draw);
    }
    function onProgress(event: Event) {
      const value = (event as CustomEvent<number>).detail;
      if (typeof value === "number" && Number.isFinite(value)) {
        progress = value;
        schedule();
      }
    }
    function onPointer(event: PointerEvent) {
      if (
        variant === "network" ||
        reduced.matches ||
        event.pointerType !== "mouse"
      )
        return;
      const bounds = element!.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointerX = Math.max(
        -1,
        Math.min(1, ((event.clientX - bounds.left) / bounds.width) * 2 - 1),
      );
      pointerY = Math.max(
        -1,
        Math.min(1, ((event.clientY - bounds.top) / bounds.height) * 2 - 1),
      );
      schedule();
    }
    function reset() {
      pointerX = 0;
      pointerY = 0;
      schedule();
    }
    function updateNetworkGeometry() {
      if (variant !== "network") return;
      const art = section?.querySelector<HTMLElement>("[data-universe-art]");
      const nodes = section?.querySelectorAll<HTMLElement>(
        "[data-universe-node]",
      );
      const hub = section?.querySelector<HTMLElement>("[data-universe-hub]");
      const width = art?.clientWidth || element!.clientWidth;
      const height = art?.clientHeight || element!.clientHeight;
      if (!width || !height) return;
      const hubWidth =
        hub?.clientWidth ||
        (window.innerWidth >= 1024 ? 150 : window.innerWidth < 374 ? 40 : 64);
      const hubHeight = hub?.clientHeight || hubWidth;
      element!
        .querySelectorAll<SVGGElement>("[data-network-route]")
        .forEach((route, index) => {
          const left = index % 2 === 0;
          const row = Math.floor(index / 2);
          const node = nodes?.[left ? row : row + 4];
          const nodeWidth =
            node?.clientWidth || (window.innerWidth < 1024 ? 108 : 166);
          const nodeHeight =
            node?.clientHeight || (window.innerWidth < 1024 ? 72 : 84);
          const xLimit = Math.max(0, width / 2 - nodeWidth / 2 - 8);
          const yLimit = Math.max(0, height / 2 - nodeHeight / 2 - 8);
          const xOffset = Math.min(xLimit, width * (width < 640 ? 0.35 : 0.32));
          const yOffset = Math.max(
            -yLimit,
            Math.min(yLimit, height * [-0.3, -0.1, 0.1, 0.3][row]),
          );
          const startX =
            ((width / 2 + (left ? -1 : 1) * (xOffset - nodeWidth / 2)) * 1280) /
            width;
          const startY = ((height / 2 + yOffset) * 800) / height;
          const endX =
            ((width / 2 + (left ? -hubWidth / 2 : hubWidth / 2)) * 1280) /
            width;
          const endY =
            ((height / 2 + [-0.24, -0.08, 0.08, 0.24][row] * hubHeight) * 800) /
            height;
          const span = endX - startX;
          const d = `M ${startX} ${startY} C ${startX + span * 0.42} ${startY}, ${endX - span * 0.38} ${endY}, ${endX} ${endY}`;
          route
            .querySelectorAll<SVGPathElement>("path")
            .forEach((path) => path.setAttribute("d", d));
          const gradient = element!.querySelector<SVGLinearGradientElement>(
            `[data-network-gradient="${left ? "left" : "right"}"]`,
          );
          gradient?.setAttribute("x1", String(startX));
          gradient?.setAttribute("x2", String(endX));
        });
      schedule();
    }
    const resizeObserver =
      variant === "network" ? new ResizeObserver(updateNetworkGeometry) : null;
    if (resizeObserver) {
      resizeObserver.observe(element);
      section
        ?.querySelectorAll<HTMLElement>(
          "[data-universe-node], [data-universe-hub]",
        )
        .forEach((node) => resizeObserver.observe(node));
      updateNetworkGeometry();
    }
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) schedule();
        else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(element);
    section?.addEventListener("gatree:scene-progress", onProgress);
    section?.addEventListener("pointermove", onPointer);
    section?.addEventListener("pointerleave", reset);
    reduced.addEventListener("change", reset);
    schedule();
    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver?.disconnect();
      section?.removeEventListener("gatree:scene-progress", onProgress);
      section?.removeEventListener("pointermove", onPointer);
      section?.removeEventListener("pointerleave", reset);
      reduced.removeEventListener("change", reset);
      delete element.dataset.ready;
    };
  }, [variant]);

  return (
    <div
      ref={root}
      aria-hidden="true"
      data-cinematic-field={variant}
      className={`pointer-events-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1280 800"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
      >
        <defs>
          {variant === "portal" ? (
            <linearGradient
              id={gradientId}
              x1={variant === "portal" ? 250 : 100}
              y1="0"
              x2={focalX}
              y2="400"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--marketing-accent-text)" stopOpacity="0" />
              <stop
                offset=".6"
                stopColor="var(--marketing-accent-text)"
                stopOpacity=".25"
              />
              <stop
                offset="1"
                stopColor="var(--marketing-accent-text)"
                stopOpacity=".7"
              />
            </linearGradient>
          ) : (
            <>
              {["left", "right"].map((side) => (
                <linearGradient
                  key={side}
                  id={`${gradientId}-${side}`}
                  data-network-gradient={side}
                  x1={side === "left" ? 310 : 970}
                  y1="400"
                  x2={side === "left" ? 555 : 725}
                  y2="400"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop
                    stopColor="var(--marketing-accent-text)"
                    stopOpacity=".4"
                  />
                  <stop
                    offset=".55"
                    stopColor="var(--marketing-accent-text)"
                    stopOpacity=".65"
                  />
                  <stop
                    offset="1"
                    stopColor="var(--marketing-accent-text)"
                    stopOpacity=".8"
                  />
                </linearGradient>
              ))}
              <filter
                id={`${gradientId}-pulse-glow`}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="1.5" />
              </filter>
            </>
          )}
        </defs>
        <g ref={layer}>
          {paths.map((path, index) => (
            <g
              key={index}
              data-network-route={
                variant === "network"
                  ? `${index % 2 === 0 ? "left" : "right"}-${Math.floor(index / 2)}`
                  : undefined
              }
            >
              <path
                d={path}
                stroke={`url(#${variant === "network" ? `${gradientId}-${index % 2 === 0 ? "left" : "right"}` : gradientId})`}
                strokeWidth={variant === "network" ? "1.75" : "1"}
                opacity={variant === "network" ? ".65" : ".35"}
                vectorEffect="non-scaling-stroke"
              />
              {variant === "network" && (
                <path
                  data-connection-highlight
                  data-connection-glow
                  data-route-index={index}
                  d={path}
                  pathLength="1000"
                  stroke="var(--marketing-accent)"
                  strokeWidth="4"
                  strokeDasharray="70 1930"
                  strokeDashoffset="0"
                  opacity=".14"
                  filter={`url(#${gradientId}-pulse-glow)`}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <path
                data-connection-highlight
                data-route-index={variant === "network" ? index : undefined}
                d={path}
                pathLength="1000"
                stroke={
                  variant === "network"
                    ? "var(--marketing-accent)"
                    : `url(#${gradientId})`
                }
                strokeWidth={variant === "network" ? "3" : "1.5"}
                strokeDasharray={variant === "network" ? "70 1930" : "75 925"}
                strokeDashoffset={variant === "network" ? "0" : "1000"}
                opacity={variant === "network" ? ".35" : "0"}
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
