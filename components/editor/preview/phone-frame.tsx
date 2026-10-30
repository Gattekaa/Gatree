"use client";

import type { BackgroundConfig } from "@/types";

interface PhoneFrameProps {
  children: React.ReactNode;
  width?: string;
  minHeight?: string;

  background?: BackgroundConfig | null;
}

export function PhoneFrame({
  children,
  width = "w-[280px]",
  minHeight = "min-h-[560px]",
}: PhoneFrameProps) {
  return (
    <div className={`relative ${width}`}>
      <div className="border-2 border-hairline-strong bg-black shadow-[3px_3px_0px_var(--color-hairline-strong)]">
        <div className="relative overflow-hidden">
          {}
          <div className={`relative ${minHeight} overflow-hidden`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
