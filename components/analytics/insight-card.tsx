"use client";

import type { Insight } from "@/types";
import { Lightbulb, TrendingDown, TrendingUp, Zap } from "lucide-react";

interface InsightCardProps {
  insight: Insight;
}

const INSIGHT_CONFIG: Record<
  Insight["type"],
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  growth: {
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/5",
    border: "border-success/25",
  },
  decline: {
    icon: TrendingDown,
    color: "text-error",
    bg: "bg-error/5",
    border: "border-error/25",
  },
  peak: {
    icon: Zap,
    color: "text-primary",
    bg: "bg-product-accent/5",
    border: "border-primary/25",
  },
  recommendation: {
    icon: Lightbulb,
    color: "text-primary",
    bg: "bg-product-accent/5",
    border: "border-primary/25",
  },
};

export function InsightCard({ insight }: InsightCardProps) {
  const config = INSIGHT_CONFIG[insight.type];
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border ${config.border} ${config.bg} p-5`}>
      <div className="flex items-start gap-3">
        <div className="border-hairline bg-surface-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="min-w-0">
          <h3 className="text-ink text-sm leading-[1.5] font-semibold">
            {insight.title}
          </h3>
          <p className="text-ink-subtle mt-1 text-xs leading-[1.5] tracking-normal">
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  );
}
