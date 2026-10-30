"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Progressive enhancement: content stays visible with JavaScript disabled.
export function MarketingReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || preference.matches || !("IntersectionObserver" in window))
      return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.dataset.reveal = "visible";
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );

    // Don't hide content already in the viewport, including the hero.
    if (element.getBoundingClientRect().top >= window.innerHeight) {
      element.dataset.reveal = "pending";
    }
    observer.observe(element);

    const show = () => {
      if (preference.matches) {
        element.dataset.reveal = "visible";
        observer.disconnect();
      }
    };
    preference.addEventListener("change", show);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", show);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-500 ease-out data-[reveal=pending]:translate-y-[18px] data-[reveal=pending]:opacity-0 motion-reduce:transition-none motion-reduce:data-[reveal=pending]:translate-y-0 motion-reduce:data-[reveal=pending]:opacity-100 ${className}`}
    >
      {children}
    </div>
  );
}
