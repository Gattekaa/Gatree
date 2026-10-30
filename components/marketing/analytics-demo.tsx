"use client";

import { KPICard } from "@/components/analytics/kpi-card";
import { ViewsChart } from "@/components/analytics/views-chart";
import en from "@/dictionaries/en.json";
import pt from "@/dictionaries/pt-BR.json";
import type { TimeSeriesData } from "@/types";
import { GeistSans } from "geist/font/sans";
import { Eye, MousePointerClick, TrendingUp, Users } from "lucide-react";

// Public demonstration fixtures. These values never come from an account or API.
const DEMO_VIEWS: TimeSeriesData[] = [
  { date: "2026-01-01", count: 140, previousCount: 0 },
  { date: "2026-01-02", count: 165, previousCount: 0 },
  { date: "2026-01-03", count: 150, previousCount: 0 },
  { date: "2026-01-04", count: 180, previousCount: 0 },
  { date: "2026-01-05", count: 210, previousCount: 0 },
  { date: "2026-01-06", count: 180, previousCount: 0 },
  { date: "2026-01-07", count: 215, previousCount: 0 },
];
const DEMO_TOTALS = { views: 1240, visitors: 680, clicks: 420 };

export function AnalyticsDemo({
  english,
  compact = false,
}: {
  english: boolean;
  compact?: boolean;
}) {
  const translations = english ? en.analytics : pt.analytics;
  const locale = english ? "en-US" : "pt-BR";
  const ctr = (DEMO_TOTALS.clicks / DEMO_TOTALS.views) * 100;
  const metrics = [
    { title: translations.views, value: DEMO_TOTALS.views, icon: Eye },
    { title: translations.visitors, value: DEMO_TOTALS.visitors, icon: Users },
    {
      title: translations.clicks,
      value: DEMO_TOTALS.clicks,
      icon: MousePointerClick,
    },
    { title: translations.ctr, value: ctr, icon: TrendingUp },
  ];

  return (
    <div
      className={`product-route w-full max-w-[976px] min-w-0 overflow-hidden rounded-[16px] border border-hairline-strong bg-canvas [font-family:var(--font-geist-sans)] text-ink ${compact ? "p-3" : "p-4 sm:p-6"} ${GeistSans.variable}`}
      role="group"
      aria-label={
        english
          ? "Analytics example with sample data"
          : "Exemplo de analytics com dados de demonstração"
      }
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b border-hairline ${compact ? "mb-2 pb-2" : "mb-5 pb-5"}`}
      >
        {!compact && (
          <div>
            <p className="text-[18px] font-semibold tracking-[-.025em]">
              {english ? "Sample profile" : "Perfil de exemplo"}
            </p>
            <p className="mt-1 text-xs text-ink-subtle">
              {english
                ? "Sample data · January 1–7, 2026"
                : "Dados de demonstração · 1–7 de janeiro de 2026"}
            </p>
          </div>
        )}
        {compact && <p className="text-sm font-medium">{translations.title}</p>}
        <span className="rounded-full border border-primary/30 bg-product-accent/10 px-3 py-1.5 text-xs font-medium text-primary">
          {english ? "Sample data" : "Dados de demonstração"}
        </span>
      </div>
      {!compact && (
        <div
          className="mb-5 flex justify-end"
          aria-label={
            english ? "Example period: 7 days" : "Período de exemplo: 7 dias"
          }
        >
          <ul className="flex list-none items-center gap-1 rounded-[6px] border border-hairline bg-surface-1 p-1 text-xs font-medium">
            {[
              { label: english ? "Today" : "Hoje", selected: false },
              { label: "7d", selected: true },
              { label: "30d", selected: false },
              { label: "90d", selected: false },
            ].map((period) => (
              <li key={period.label}>
                <span
                  aria-current={period.selected ? "true" : undefined}
                  className={`block rounded-[3px] px-3 py-2 ${period.selected ? "bg-product-accent text-on-primary" : "text-ink-subtle"}`}
                >
                  {period.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div
        className={`grid grid-cols-2 ${compact ? "mb-2 gap-2 md:grid-cols-4 [&>div]:p-3 [&>div>div>div:first-child]:space-y-2 [&>div>div>div:first-child>div>span]:text-[24px] [&>div>div>div:last-child]:size-7" : "mb-5 gap-3 xl:grid-cols-4"}`}
      >
        {metrics.map((metric) => (
          <KPICard
            key={metric.title}
            title={metric.title}
            value={
              metric.title === translations.ctr
                ? `${metric.value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
                : metric.value.toLocaleString(locale)
            }
            currentNumeric={metric.value}
            previousValue={0}
            icon={metric.icon}
          />
        ))}
      </div>
      <div className={compact ? "hidden sm:block" : undefined}>
        <ViewsChart
          data={DEMO_VIEWS}
          translations={translations}
          compact={compact}
        />
      </div>
    </div>
  );
}
