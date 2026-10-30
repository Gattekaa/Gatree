"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function MarketingThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isLight = mounted && resolvedTheme === "light";

  return (
    <button
      type="button"
      className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-marketing-border text-marketing-muted transition-colors hover:bg-marketing-soft hover:text-marketing-ink"
      aria-label={label}
      onClick={() => setTheme(isLight ? "dark" : "light")}
    >
      {isLight ? (
        <Moon size={17} aria-hidden="true" />
      ) : (
        <Sun size={17} aria-hidden="true" />
      )}
    </button>
  );
}
