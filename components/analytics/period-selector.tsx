"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Period } from "@/types";

interface PeriodSelectorProps {
  currentPeriod: Period;
  onPeriodChange: (period: Period) => void;
  translations?: Dictionary["analytics"]["periods"];
}

const PERIOD_VALUES: Period[] = ["today", "7d", "30d", "90d"];

export function PeriodSelector({
  currentPeriod,
  onPeriodChange,
  translations,
}: PeriodSelectorProps) {
  return (
    <div
      data-tour="analytics-period"
      className="bg-surface-1 border-hairline flex gap-[3px] rounded-full border p-1"
    >
      {PERIOD_VALUES.map((value) => (
        <button
          key={value}
          type="button"
          aria-pressed={currentPeriod === value}
          onClick={() => onPeriodChange(value)}
          className={`min-h-9 rounded-full border-0 px-3 py-1.5 text-xs font-medium tracking-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            currentPeriod === value
              ? "bg-product-accent text-on-primary"
              : "text-ink-subtle hover:bg-surface-2 hover:text-ink"
          }`}
        >
          {translations?.[value as keyof typeof translations] ?? value}
        </button>
      ))}
    </div>
  );
}
