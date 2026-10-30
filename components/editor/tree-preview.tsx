"use client";

import { getAppDomain } from "@/lib/constants";
import { subscribeAppearanceSaved } from "./appearance-save-events";
import type { Link, Tree } from "@prisma/client";
import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface TreePreviewProps {
  tree: Tree;
  links: Link[];
}

type ViewMode = "mobile" | "desktop";

export function TreePreview({ tree, links }: TreePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");
  const slug = tree.slug || "";
  const previewUrl = `/${slug}`;
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const desktopIframeRef = useRef<HTMLIFrameElement>(null);
  const mobileOverlayRef = useRef<HTMLDivElement>(null);
  const desktopOverlayRef = useRef<HTMLDivElement>(null);
  const prevKeyRef = useRef("");

  const linksKey = links
    .map((l) => `${l.id}:${l.enabled}:${l.position}:${l.priority}`)
    .join(",");
  const currentKey = `${linksKey}-${tree.description}-${tree.avatar}`;

  useEffect(() => {
    if (prevKeyRef.current && prevKeyRef.current !== currentKey) {
      const timeout = setTimeout(() => {
        mobileIframeRef.current?.contentWindow?.location.reload();
        desktopIframeRef.current?.contentWindow?.location.reload();
      }, 400);
      return () => clearTimeout(timeout);
    }
    prevKeyRef.current = currentKey;
  }, [currentKey]);

  useEffect(
    () =>
      subscribeAppearanceSaved(tree.id, () => {
        mobileIframeRef.current?.contentWindow?.location.reload();
        desktopIframeRef.current?.contentWindow?.location.reload();
      }),
    [tree.id],
  );

  useEffect(() => {
    const overlay = mobileOverlayRef.current;
    const iframe = mobileIframeRef.current;
    if (!overlay || !iframe) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      iframe.contentWindow?.scrollBy(0, e.deltaY);
    };
    overlay.addEventListener("wheel", handler, { passive: false });
    return () => overlay.removeEventListener("wheel", handler);
  }, []);

  useEffect(() => {
    const overlay = desktopOverlayRef.current;
    const iframe = desktopIframeRef.current;
    if (!overlay || !iframe) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      iframe.contentWindow?.scrollBy(0, e.deltaY);
    };
    overlay.addEventListener("wheel", handler, { passive: false });
    return () => overlay.removeEventListener("wheel", handler);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 p-1">
        <button
          aria-pressed={viewMode === "mobile"}
          onClick={() => setViewMode("mobile")}
          className={`rounded-full flex min-h-10 items-center gap-2 px-4 py-2 text-[12px] font-medium transition-all ${
            viewMode === "mobile"
              ? "bg-surface-1 text-primary border border-hairline"
              : "text-ink-tertiary hover:text-ink-subtle border border-transparent"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          Mobile
        </button>
        <button
          aria-pressed={viewMode === "desktop"}
          onClick={() => setViewMode("desktop")}
          className={`rounded-full flex min-h-10 items-center gap-2 px-4 py-2 text-[12px] font-medium transition-all ${
            viewMode === "desktop"
              ? "bg-surface-1 text-primary border border-hairline"
              : "text-ink-tertiary hover:text-ink-subtle border border-transparent"
          }`}
        >
          <Monitor className="h-3.5 w-3.5" />
          Desktop
        </button>
      </div>

      {viewMode === "mobile" ? (
        <div className="relative w-70">
          <div className="overflow-hidden rounded-[28px] border border-hairline bg-canvas shadow-[0_12px_40px_#00000015]">
            <div className="relative h-140 w-full overflow-hidden">
              <div
                ref={mobileOverlayRef}
                className="absolute inset-0 z-10 cursor-default"
              />
              <iframe
                ref={mobileIframeRef}
                src={previewUrl}
                sandbox="allow-same-origin allow-scripts"
                className="border-0 origin-top-left"
                style={{
                  width: "390px",
                  height: "800px",
                  transform: "scale(0.718)",
                }}
                title="Preview mobile"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-125">
          <div className="overflow-hidden rounded-2xl border border-hairline bg-canvas">
            <div className="flex items-center gap-2 border-b border-hairline-strong bg-surface-2 px-3 py-2">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <div className="h-2 w-2 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-2 flex flex-1 items-center justify-center rounded-full border border-hairline bg-canvas px-3 py-1">
                <span className="text-xs text-ink-tertiary">
                  {getAppDomain()}/{slug}
                </span>
              </div>
            </div>
            <div className="relative h-112.5 overflow-hidden">
              <div
                ref={desktopOverlayRef}
                className="absolute inset-0 z-10 cursor-default"
              />
              <iframe
                ref={desktopIframeRef}
                src={previewUrl}
                sandbox="allow-same-origin allow-scripts"
                className="border-0 bg-black origin-top-left"
                style={{
                  width: "800px",
                  height: "730px",
                  transform: "scale(0.617)",
                }}
                title="Preview desktop"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
