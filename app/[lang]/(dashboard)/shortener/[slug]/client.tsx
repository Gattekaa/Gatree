"use client";

import { LocationChart } from "@/components/analytics/country-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { InsightCard } from "@/components/analytics/insight-card";
import { KPICard } from "@/components/analytics/kpi-card";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { ReferrerList } from "@/components/analytics/referrer-list";
import { ViewsChart } from "@/components/analytics/views-chart";
import { useShortLink, useShortLinkAnalytics } from "@/hooks/use-short-links";
import { getShortLinkDisplay } from "@/lib/constants";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Period } from "@/types";
import {
  Activity,
  ArrowLeft,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { useState } from "react";

interface ShortLinkAnalyticsClientProps {
  slug: string;
  translations: Dictionary["analytics"];
}

export function ShortLinkAnalyticsClient({
  slug,
  translations,
}: ShortLinkAnalyticsClientProps) {
  const localePrefix = getLocalePrefix(usePathname());
  const locale = localePrefix ? "en" : "pt-BR";
  const [period, setPeriod] = useState<Period>("7d");
  const { data: linkData } = useShortLink(slug);
  const { data, isLoading, error } = useShortLinkAnalytics(slug, period);

  const shortUrl = getShortLinkDisplay(slug);

  return (
    <div className="mx-auto max-w-6xl min-w-0 space-y-8 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`${localePrefix}/shortener`}
            aria-label={translations.backToShortener}
            className="border-hairline-strong bg-surface-1 text-ink-subtle hover:bg-surface-2 hover:text-ink flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-ink text-[30px] font-semibold tracking-[-.04em] md:text-[36px]">
              {shortUrl}
            </h1>
            {linkData && (
              <p className="text-ink-subtle max-w-xs truncate text-xs leading-[1.5] tracking-normal sm:max-w-md">
                → {linkData.url}
              </p>
            )}
          </div>
        </div>
        <PeriodSelector
          currentPeriod={period}
          onPeriodChange={setPeriod}
          translations={translations.periods}
        />
      </div>

      {isLoading && <AnalyticsLoadingSkeleton />}

      {error && (
        <div className="border-error bg-error/10 flex flex-col items-center gap-3 rounded-3xl border p-10 text-center">
          <Activity className="text-error h-10 w-10" />
          <div>
            <p className="text-ink text-sm leading-[1.5] font-medium">
              {translations.loadError}
            </p>
            <p className="text-ink-subtle mt-1 text-xs leading-[1.5] tracking-normal">
              {translations.loadErrorHint}
            </p>
          </div>
        </div>
      )}

      {data && (
        <>
          {data.totalClicks === 0 ? (
            <div className="border-hairline-strong bg-surface-1 rounded-3xl border px-8 py-16 text-center">
              <MousePointerClick className="text-ink-tertiary mx-auto h-10 w-10" />
              <h2 className="text-ink mt-4 font-sans text-[30px] font-semibold tracking-[-.04em] md:text-[36px]">
                {translations.noClicksPeriod}
              </h2>
              <p className="text-ink-subtle mt-2">
                {translations.noClicksPeriodDescription}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <KPICard
                  locale={locale}
                  title={translations.totalClicks}
                  value={data.totalClicks}
                  previousValue={
                    data.percentageChange !== 0
                      ? Math.round(
                          data.totalClicks / (1 + data.percentageChange / 100),
                        )
                      : data.totalClicks
                  }
                  icon={MousePointerClick}
                  accentColor="border-primary/20 bg-product-accent/10 text-primary"
                />
                <KPICard
                  locale={locale}
                  title={translations.uniqueVisitors}
                  value={data.uniqueVisitors}
                  previousValue={data.uniqueVisitorsPrevious}
                  icon={Users}
                  accentColor="border-primary/20 bg-product-accent/10 text-primary"
                />
              </div>

              <ViewsChart
                locale={locale}
                data={data.timeSeries.map((d) => ({
                  date: d.date,
                  count: d.clicks,
                  previousCount: undefined,
                }))}
                translations={translations}
              />

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <DeviceChart
                  data={data.devices}
                  translations={translations}
                  locale={locale}
                />

                <LocationChart
                  locale={locale}
                  countries={data.countries.map((c) => ({
                    country: c.country,
                    countryName: c.country,
                    count: c.count,
                    percentage: c.percentage,
                  }))}
                  regions={data.regions}
                  cities={data.cities}
                  translations={translations}
                />

                <ReferrerList
                  locale={locale}
                  data={data.referrers.map((r) => ({
                    referrer: r.referrer,
                    count: r.count,
                    percentage: r.percentage,
                  }))}
                  translations={translations}
                />
              </div>

              {data.hasEnoughData && data.insights.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-primary h-4 w-4" />
                    <h2 className="text-ink text-sm leading-[1.5] font-medium">
                      {translations.insights}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {data.insights.map((insight) => (
                      <InsightCard
                        key={insight.id}
                        insight={{
                          ...insight,
                          type: insight.type as
                            "growth" | "decline" | "peak" | "recommendation",
                          generatedAt: new Date(insight.generatedAt),
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!data.hasEnoughData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-primary h-4 w-4" />
                    <h2 className="text-ink text-sm leading-[1.5] font-medium">
                      {translations.insights}
                    </h2>
                  </div>
                  <div className="border-hairline-strong bg-surface-1 rounded-3xl border p-8 text-center">
                    <Activity className="text-ink-tertiary mx-auto mb-3 h-8 w-8" />
                    <p className="text-ink text-sm leading-[1.5]">
                      {translations.insightsSoon}
                    </p>
                    <p className="text-ink-subtle mt-1 text-xs leading-[1.5] tracking-normal">
                      {translations.insightsSoonDescriptionShort}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="border-hairline-strong bg-surface-1 rounded-3xl border p-6"
          >
            <div className="flex items-center gap-2">
              <div className="bg-surface-3 h-8 w-8 animate-pulse rounded-xl" />
              <div className="bg-surface-3 h-3.5 w-24 animate-pulse rounded-xl" />
            </div>
            <div className="bg-surface-3 mt-4 h-8 w-20 animate-pulse rounded-xl" />
          </div>
        ))}
      </div>

      <div className="border-hairline-strong bg-surface-1 rounded-3xl border p-6">
        <div className="space-y-2">
          <div className="bg-surface-3 h-4 w-48 animate-pulse rounded-xl" />
          <div className="bg-surface-3 h-6 w-24 animate-pulse rounded-xl" />
        </div>
        <div className="bg-surface-3 mt-6 h-56 w-full animate-pulse rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border-hairline-strong bg-surface-1 rounded-3xl border p-6"
          >
            <div className="bg-surface-3 h-4 w-24 animate-pulse rounded-xl" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="bg-surface-3 h-3.5 w-20 animate-pulse rounded-xl" />
                    <div className="bg-surface-3 h-3.5 w-12 animate-pulse rounded-xl" />
                  </div>
                  <div className="bg-surface-3 h-1 w-full animate-pulse rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
