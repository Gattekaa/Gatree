"use client";

import { getAppDomain } from "@/lib/constants";
import type { BackgroundConfig } from "@/types";
import { getBackgroundStyle } from "./utils";

interface DesktopFrameProps {
  background: BackgroundConfig | null;
  slug: string;
  children: React.ReactNode;
}

export function DesktopFrame({ background, slug, children }: DesktopFrameProps) {
  const bgStyle = getBackgroundStyle(background);

  return (
    <div className="relative w-full max-w-[420px]">
      <div className="border-2 border-hairline-strong bg-black shadow-[3px_3px_0px_var(--color-hairline-strong)]">
        {}
        <div className="flex items-center gap-2 border-b-2 border-hairline-strong bg-surface-2 px-3 py-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 bg-[#28c840]" />
          </div>
          <div className="mx-2 flex flex-1 items-center justify-center border border-hairline-strong bg-surface-3 px-3 py-1">
            <span className="text-[10px] text-ink-tertiary">{getAppDomain()}/{slug}</span>
          </div>
        </div>
        {}
        <div className="min-h-[380px] overflow-y-auto" style={bgStyle}>
          <div className="mx-auto max-w-[320px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
