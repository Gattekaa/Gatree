"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getIconComponent } from "@/lib/icons";
import type { LinkClickData } from "@/types";
import { ExternalLink, MousePointerClick } from "lucide-react";

interface ClicksChartProps {
  data: LinkClickData[];
  translations?: Dictionary["analytics"];
  locale?: string;
}

export function ClicksChart({
  data,
  translations,
  locale = "pt-BR",
}: ClicksChartProps) {
  if (data.length === 0) {
    return (
      <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
        <h2 className="text-ink text-sm leading-[1.5] font-semibold">
          {translations?.clicks ?? "Cliques"}{" "}
          {locale.startsWith("en") ? "by link" : "por link"}
        </h2>
        <div className="mt-8 flex h-48 flex-col items-center justify-center gap-2">
          <MousePointerClick className="text-ink-tertiary h-8 w-8" />
          <p className="text-ink-subtle text-sm leading-[1.5]">
            {translations?.noClicksPeriod ?? "Sem cliques neste período"}
          </p>
        </div>
      </div>
    );
  }

  const maxClicks = Math.max(...data.map((d) => d.clicks));

  return (
    <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-ink text-sm leading-[1.5] font-semibold">
          {locale.startsWith("en") ? "All links" : "Todos os links"}
        </h2>
        <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
          {data.length} {data.length === 1 ? "link" : "links"}
        </span>
      </div>

      <div className="space-y-3">
        {data.map((link) => {
          const Icon = getIconComponent(link.icon);
          const percentage =
            maxClicks > 0 ? (link.clicks / maxClicks) * 100 : 0;
          const trend =
            link.clicksPrevious > 0
              ? Math.round(
                  ((link.clicks - link.clicksPrevious) / link.clicksPrevious) *
                    100,
                )
              : link.clicks > 0
                ? 100
                : 0;

          return (
            <div key={link.linkId} className="group min-w-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="border-hairline-strong bg-surface-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border">
                    {Icon ? (
                      <Icon className="text-ink-subtle h-3.5 w-3.5" />
                    ) : (
                      <ExternalLink className="text-ink-subtle h-3.5 w-3.5" />
                    )}
                  </div>
                  <span className="text-ink truncate text-xs leading-[1.5] tracking-normal">
                    {link.label}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-ink text-xs leading-[1.5] font-medium tracking-normal tabular-nums">
                    {link.clicks.toLocaleString(locale)}
                  </span>
                  {trend !== 0 && (
                    <span
                      className={`text-xs leading-[1.5] tracking-normal ${trend > 0 ? "text-success" : "text-error"}`}
                    >
                      {trend > 0 ? "+" : ""}
                      {trend}%
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-surface-3 mt-1.5 ml-[2.375rem] h-1 overflow-hidden rounded-full">
                <div
                  className="bg-product-accent/50 h-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
