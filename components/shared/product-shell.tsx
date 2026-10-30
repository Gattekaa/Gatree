"use client";

import { useEffect, type ReactNode } from "react";

export function ProductShell({
  children,
  fontClassName,
  skipLabel,
}: {
  children: ReactNode;
  fontClassName: string;
  skipLabel: string;
}) {
  useEffect(() => {
    // Radix dialogs render under body; give them the same tokens as the app.
    const root = document.documentElement;
    root.classList.add("product-route", fontClassName);
    return () => root.classList.remove("product-route", fontClassName);
  }, [fontClassName]);

  return (
    <div
      className={`product-route flex min-h-dvh bg-canvas text-ink font-sans text-sm leading-[1.55] ${fontClassName}`}
    >
      <a
        href="#product-content"
        className="fixed top-2 left-4 z-[51] -translate-y-[160%] rounded-full bg-product-accent px-[18px] py-3 text-on-primary focus:translate-y-0"
      >
        {skipLabel}
      </a>
      {children}
    </div>
  );
}
