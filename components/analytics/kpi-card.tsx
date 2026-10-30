"use client";

import type { LucideIcon } from "lucide-react";
import { TrendBadge } from "./trend-badge";

interface KPICardProps {
  title: string;
  value: number | string;
  previousValue: number;
  currentNumeric?: number;
  icon: LucideIcon;
  suffix?: string;
  locale?: string;
  previousLabel?: string;
  accentColor?: string;
}

export function KPICard({
  title,
  value,
  previousValue,
  currentNumeric,
  icon: Icon,
  suffix = "",
  locale = "pt-BR",
  previousLabel = "{{count}} no período anterior",
  accentColor = "border-primary bg-product-accent/10 text-primary",
}: KPICardProps) {
  const numericValue =
    currentNumeric ?? (typeof value === "number" ? value : 0);
  const trend =
    previousValue > 0
      ? Math.round(((numericValue - previousValue) / previousValue) * 100)
      : numericValue > 0
        ? 100
        : 0;

  const parts = accentColor.split(" ");
  const borderColor = parts[0] || "border-primary";
  const bgColor = parts[1] || "bg-product-accent/10";
  const textColor = parts[2] || "text-primary";

  return (
    <div className="border-hairline bg-surface-1 hover:border-primary/25 hover:bg-surface-2 rounded-3xl border px-3.5 py-[18px] transition-colors duration-150 md:p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <span className="text-ink-subtle text-xs font-medium leading-[1.5] tracking-normal">
            {title}
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-ink font-sans text-[25px] leading-[1.2] font-semibold tracking-[-.04em] tabular-nums md:text-[32px]">
              {typeof value === "number" ? value.toLocaleString(locale) : value}
            </span>
          </div>
          <TrendBadge value={trend} />
        </div>
        <div
          className={`flex size-7 shrink-0 items-center justify-center rounded-xl border md:size-10 ${borderColor} ${bgColor}`}
        >
          <Icon className={`size-4 md:size-5 ${textColor}`} />
        </div>
      </div>

      {previousValue > 0 && (
        <p className="text-ink-tertiary mt-3 text-xs leading-[1.5] tracking-normal">
          {previousLabel.replace(
            "{{count}}",
            `${previousValue.toLocaleString(locale)}${suffix}`,
          )}
        </p>
      )}
    </div>
  );
}
