"use client";

import { ClicksChart } from "@/components/analytics/clicks-chart";
import { LocationChart } from "@/components/analytics/country-chart";
import { DeviceChart } from "@/components/analytics/device-chart";
import { InsightCard } from "@/components/analytics/insight-card";
import { KPICard } from "@/components/analytics/kpi-card";
import { LinkRankingTable } from "@/components/analytics/link-ranking-table";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { ReferrerList } from "@/components/analytics/referrer-list";
import { TopLinks } from "@/components/analytics/top-links";
import { ViewsChart } from "@/components/analytics/views-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/use-analytics";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Period } from "@/types";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Download,
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocalePrefix } from "@/lib/i18n/paths";
import { useState } from "react";

interface AnalyticsClientProps {
  treeId: string;
  treeName: string;
  slug: string;
  translations: Dictionary["analytics"];
  commonTranslations: Dictionary["common"];
}

export function AnalyticsClient({
  treeId,
  treeName,
  slug,
  translations,
  commonTranslations,
}: AnalyticsClientProps) {
  const localePrefix = getLocalePrefix(usePathname());
  const locale = localePrefix ? "en-US" : "pt-BR";
  const kpiFormatting = {
    locale,
    previousLabel: translations.previousPeriodRef,
  };
  const [period, setPeriod] = useState<Period>("7d");
  const { data, isLoading, error } = useAnalytics(slug, period);

  return (
    <div className="mx-auto max-w-6xl min-w-0 space-y-7 overflow-hidden pb-12">
      {}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link
            href={`${localePrefix}/dashboard`}
            aria-label={commonTranslations.back}
            className="border-hairline/40 bg-surface-1 text-ink-subtle hover:border-hairline-strong hover:text-ink flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-ink break-words text-[28px] leading-[1.15] font-semibold tracking-[-.045em] md:text-[36px]">
              {treeName}
            </h1>
            <p className="text-ink-subtle text-xs leading-[1.5] tracking-normal">
              /{slug}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data && (
            <a
              href={`/api/export/${treeId}?format=csv&period=${period}`}
              download
              data-tour="analytics-export"
              aria-label={commonTranslations.export}
              className="border-hairline/40 bg-surface-1 text-ink-subtle hover:border-hairline-strong hover:text-ink flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-4 py-2 text-xs leading-[1.5] font-medium transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {commonTranslations.export}
              </span>
            </a>
          )}
          <PeriodSelector
            currentPeriod={period}
            onPeriodChange={setPeriod}
            translations={translations.periods}
          />
        </div>
      </div>

      {}
      {isLoading && <AnalyticsLoadingSkeleton />}

      {}
      {error && (
        <div className="border-error/25 bg-error/5 flex flex-col items-center gap-3 rounded-3xl border p-10 text-center">
          <Activity className="text-error h-10 w-10" />
          <div>
            <p className="text-ink text-sm leading-[1.5] font-semibold">
              {translations.loadError}
            </p>
            <p className="text-ink-subtle mt-1 text-xs leading-[1.5] tracking-normal">
              {translations.loadErrorHint}
            </p>
          </div>
        </div>
      )}

      {}
      {data && (
        <>
          {}
          <div
            data-tour="analytics-overview"
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            <KPICard
              {...kpiFormatting}
              title={translations.views}
              value={data.overview.totalViews}
              previousValue={data.overview.totalViewsPrevious}
              icon={Eye}
            />
            <KPICard
              {...kpiFormatting}
              title={translations.visitors}
              value={data.overview.uniqueVisitors}
              previousValue={data.overview.uniqueVisitorsPrevious}
              icon={Users}
            />
            <KPICard
              {...kpiFormatting}
              title={translations.clicks}
              value={data.overview.totalClicks}
              previousValue={data.overview.totalClicksPrevious}
              icon={MousePointerClick}
            />
            <KPICard
              {...kpiFormatting}
              title={translations.ctr}
              value={`${data.overview.avgCTR.toLocaleString(localePrefix ? "en" : "pt-BR")}%`}
              previousValue={data.overview.avgCTRPrevious}
              currentNumeric={data.overview.avgCTR}
              icon={TrendingUp}
              suffix="%"
            />
          </div>

          {}
          <ViewsChart
            data={data.timeSeries}
            translations={translations}
            locale={locale}
          />

          {}
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="min-w-0 lg:col-span-3">
              <TopLinks
                data={data.clicksByLink}
                totalViews={data.overview.totalViews}
                locale={locale}
              />
            </div>
            <div className="min-w-0 lg:col-span-2">
              <DeviceChart
                data={data.devices}
                translations={translations}
                locale={locale}
              />
            </div>
          </div>

          {}
          {data.clicksByLink.length > 3 && (
            <ClicksChart
              data={data.clicksByLink}
              translations={translations}
              locale={locale}
            />
          )}

          {}
          {data.clicksByLink.length > 0 && (
            <LinkRankingTable data={data.clicksByLink} locale={locale} />
          )}

          {}
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            <LocationChart
              countries={data.countries}
              regions={data.regions}
              cities={data.cities}
              locale={locale}
              translations={translations}
            />
            <ReferrerList
              data={data.referrers}
              translations={translations}
              locale={locale}
            />
          </div>

          {}
          {(data.insights.length > 0 || !data.hasEnoughData) && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-primary h-4.5 w-4.5" />
                <h2 className="text-ink text-sm leading-[1.5] font-semibold">
                  {translations.insights}
                </h2>
              </div>
              {!data.hasEnoughData ? (
                <div className="border-hairline bg-surface-1 rounded-3xl border p-8 text-center">
                  <Activity className="text-ink-tertiary mx-auto mb-3 h-8 w-8" />
                  <p className="text-ink text-sm leading-[1.5]">
                    {translations.insightsSoon}
                  </p>
                  <p className="text-ink-subtle mt-1 text-xs leading-[1.5] tracking-normal">
                    {translations.insightsSoonDescription}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {data.insights.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-hairline bg-surface-1 rounded-3xl border p-5"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3.5 w-16" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-5 w-14" />
              </div>
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        ))}
      </div>

      {}
      <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="mt-6 h-56 w-full" />
      </div>

      {}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
            <Skeleton className="h-4 w-32" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-3.5 w-32" />
                    </div>
                    <Skeleton className="h-3.5 w-12" />
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-5 h-3 w-full" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-2.5 w-2.5" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                  <Skeleton className="h-3.5 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
