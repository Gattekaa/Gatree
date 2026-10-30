"use client";

import { getIconComponent } from "@/lib/icons";
import type { LinkClickData } from "@/types";
import { Crown, ExternalLink } from "lucide-react";

interface TopLinksProps {
  data: LinkClickData[];
  totalViews: number;
  locale?: string;
}

export function TopLinks({
  data,
  totalViews,
  locale = "pt-BR",
}: TopLinksProps) {
  const top3 = data.slice(0, 3);

  if (top3.length === 0) {
    return null;
  }

  const maxClicks = top3[0]?.clicks || 1;

  return (
    <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Crown className="text-primary h-4 w-4" />
        <h2 className="text-ink text-sm leading-[1.5] font-semibold">
          {locale.startsWith("en")
            ? "Most clicked links"
            : "Links mais clicados"}
        </h2>
      </div>

      <div className="space-y-4">
        {top3.map((link, index) => {
          const Icon = getIconComponent(link.icon);
          const percentage = (link.clicks / maxClicks) * 100;
          const borders = [
            "border-primary",
            "border-hairline",
            "border-hairline-strong",
          ];
          const bgs = ["bg-product-accent/10", "bg-surface-2", "bg-surface-3"];
          const texts = ["text-primary", "text-ink-subtle", "text-ink-subtle"];
          const bars = [
            "bg-product-accent",
            "bg-product-accent/55",
            "bg-hairline-strong",
          ];

          return (
            <div key={link.linkId} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${borders[index]} ${bgs[index]}`}
                  >
                    {Icon ? (
                      <Icon className={`h-4 w-4 ${texts[index]}`} />
                    ) : (
                      <ExternalLink className={`h-4 w-4 ${texts[index]}`} />
                    )}
                  </div>
                  <span className="text-ink truncate text-sm leading-[1.5]">
                    {link.label}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-ink text-sm leading-[1.5] font-semibold">
                    {link.clicks.toLocaleString(locale)}
                  </span>
                  <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
                    ({link.ctr.toLocaleString(locale)}%)
                  </span>
                </div>
              </div>
              <div className="bg-surface-3 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full ${bars[index]} transition-colors duration-200`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {totalViews > 0 && (
        <p className="text-ink-tertiary mt-4 text-xs leading-[1.5] tracking-normal">
          {locale.startsWith("en")
            ? `Based on ${totalViews.toLocaleString(locale)} views in this period`
            : `Baseado em ${totalViews.toLocaleString(locale)} views no período`}
        </p>
      )}
    </div>
  );
}
