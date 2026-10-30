"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { TimeSeriesData } from "@/types";
import { format, parseISO } from "date-fns";
import { enUS, ptBR } from "date-fns/locale";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ViewsChartProps {
  data: TimeSeriesData[];
  translations?: Dictionary["analytics"];
  compact?: boolean;
  locale?: string;
}

export function ViewsChart({
  data,
  translations,
  compact = false,
  locale = "pt-BR",
}: ViewsChartProps) {
  const dateLocale = locale.startsWith("en") ? enUS : ptBR;
  if (
    data.length === 0 ||
    data.every((point) => point.count === 0 && !point.previousCount)
  ) {
    return (
      <div
        className={`border-hairline bg-surface-1 border ${compact ? "rounded-2xl p-3" : "rounded-3xl p-5 sm:p-6"}`}
      >
        <h2 className="text-ink text-sm leading-[1.5] font-semibold">
          {translations?.viewsOverTime ?? "Visualizações ao longo do tempo"}
        </h2>
        <div
          className={`flex flex-col items-center justify-center gap-2 ${compact ? "mt-4 h-40" : "mt-8 h-56"}`}
        >
          <TrendingUp className="text-ink-tertiary h-8 w-8" />
          <p className="text-ink-subtle text-sm leading-[1.5]">
            {translations?.noDataForPeriod ?? "Sem dados para este período"}
          </p>
          <p className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
            {translations?.viewsAppearHint ??
              "As views aparecerão aqui conforme visitantes acessarem sua página"}
          </p>
        </div>
      </div>
    );
  }

  const totalViews = data.reduce((sum, d) => sum + d.count, 0);
  const totalPrevious = data.reduce(
    (sum, d) => sum + (d.previousCount || 0),
    0,
  );
  const peakDay = data.reduce(
    (max, d) => (d.count > max.count ? d : max),
    data[0],
  );

  return (
    <div
      className={`border-hairline bg-surface-1 border ${compact ? "rounded-2xl p-3" : "rounded-3xl p-5 sm:p-6"}`}
    >
      {}
      <div
        className={`flex flex-col sm:flex-row sm:items-start sm:justify-between ${compact ? "mb-3 gap-2" : "mb-6 gap-4"}`}
      >
        <div>
          <h2 className="text-ink text-sm leading-[1.5] font-semibold">
            {translations?.viewsOverTime ?? "Visualizações ao longo do tempo"}
          </h2>
          <div className="mt-1 flex items-baseline gap-3">
            <span
              className={
                compact
                  ? "text-ink font-semibold tabular-nums"
                  : "text-ink text-2xl font-semibold tracking-[-.035em] tabular-nums"
              }
            >
              {totalViews.toLocaleString(locale)}
            </span>
            <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
              {translations
                ? translations.vsPrevious.replace(
                    "{{count}}",
                    totalPrevious.toLocaleString(locale),
                  )
                : `vs ${totalPrevious.toLocaleString(locale)} anterior`}
            </span>
          </div>
        </div>
        {peakDay && peakDay.count > 0 && (
          <div className="border-primary/20 bg-product-accent/5 rounded-xl border px-3 py-2">
            <p className="text-ink-subtle text-xs leading-[1.5] tracking-normal">
              {translations?.peak ?? "Pico"}
            </p>
            <p className="text-primary text-sm leading-[1.5] font-medium">
              {translations
                ? translations.peakStat
                    .replace("{{count}}", String(peakDay.count))
                    .replace(
                      "{{date}}",
                      format(parseISO(peakDay.date), "dd/MM", {
                        locale: dateLocale,
                      }),
                    )
                : `${peakDay.count} views em ${format(parseISO(peakDay.date), "dd/MM", { locale: dateLocale })}`}
            </p>
          </div>
        )}
      </div>

      {}
      <ResponsiveContainer
        width="100%"
        height={compact ? 120 : 260}
        className="font-sans tabular-nums"
      >
        <AreaChart data={data}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity={0.2}
              />
              <stop
                offset="95%"
                stopColor="var(--color-primary)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-hairline)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="var(--color-ink-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              format(parseISO(value), "dd/MM", { locale: dateLocale })
            }
          />
          <YAxis
            stroke="var(--color-ink-tertiary)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-2)",
              border: "1px solid var(--color-hairline-strong)",
              borderRadius: "12px",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            labelFormatter={(value) =>
              format(
                parseISO(value as string),
                locale.startsWith("en") ? "MMM dd" : "dd 'de' MMMM",
                {
                  locale: dateLocale,
                },
              )
            }
            formatter={(value, name) => [
              Number(value).toLocaleString(locale),
              name === "count"
                ? (translations?.currentPeriod ?? "Período atual")
                : (translations?.previousPeriod ?? "Período anterior"),
            ]}
          />
          <Area
            type="monotone"
            dataKey="previousCount"
            stroke="var(--color-ink-tertiary)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
            name="previousCount"
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--color-primary)"
            strokeWidth={2.5}
            fill="url(#viewsGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "var(--color-primary)",
              stroke: "var(--color-surface-1)",
              strokeWidth: 2,
            }}
            name="count"
          />
        </AreaChart>
      </ResponsiveContainer>

      {}
      <div className={compact ? "hidden" : "mt-4 flex items-center gap-4"}>
        <div className="flex items-center gap-2">
          <div className="bg-product-accent h-0.5 w-4 rounded-full" />
          <span className="text-ink-subtle text-xs leading-[1.5] tracking-normal">
            {translations?.currentPeriod ?? "Período atual"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="border-ink-tertiary h-0.5 w-4 rounded-full border-t border-dashed" />
          <span className="text-ink-subtle text-xs leading-[1.5] tracking-normal">
            {translations?.previousPeriod ?? "Período anterior"}
          </span>
        </div>
      </div>
    </div>
  );
}
