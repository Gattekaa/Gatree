"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CountryData, LocationData } from "@/types";
import { ArrowLeft, ChevronRight, Globe, MapPin } from "lucide-react";
import { useState } from "react";

type TabLevel = "countries" | "regions" | "cities";

interface DrillState {
  active: boolean;
  country?: string;
  region?: string;
  level: TabLevel;
}

interface LocationChartProps {
  countries: CountryData[];
  regions: LocationData[];
  cities: LocationData[];
  translations?: Dictionary["analytics"];
  locale?: string;
}

export function LocationChart({
  countries,
  regions,
  cities,
  translations,
  locale = "pt-BR",
}: LocationChartProps) {
  const [tab, setTab] = useState<TabLevel>("countries");
  const [drill, setDrill] = useState<DrillState>({
    active: false,
    level: "countries",
  });

  const TABS: { value: TabLevel; label: string }[] = [
    { value: "countries", label: translations?.countries ?? "Países" },
    { value: "regions", label: translations?.states ?? "Estados" },
    { value: "cities", label: translations?.cities ?? "Cidades" },
  ];

  function switchTab(t: TabLevel) {
    setTab(t);
    setDrill({ active: false, level: t });
  }

  function drillIntoCountry(country: string) {
    setDrill({ active: true, country, level: "regions" });
    setTab("regions");
  }

  function drillIntoRegion(region: string, country?: string) {
    const resolvedCountry = country || drill.country;
    setDrill({
      active: true,
      country: resolvedCountry,
      region,
      level: "cities",
    });
    setTab("cities");
  }

  function goBack() {
    if (drill.level === "cities" && drill.country) {
      setDrill({ active: true, country: drill.country, level: "regions" });
      setTab("regions");
    } else {
      setDrill({ active: false, level: "countries" });
      setTab("countries");
    }
  }

  function clearDrill() {
    setDrill({ active: false, level: tab });
  }

  let displayRegions = regions;
  let displayCities = cities;

  if (drill.active) {
    if (drill.country) {
      displayRegions = regions.filter((r) => r.parentName === drill.country);
    }
    if (drill.region) {
      displayCities = cities.filter((c) => c.parentName === drill.region);
    } else if (drill.country) {
      displayCities = cities.filter((c) =>
        regions
          .filter((r) => r.parentName === drill.country)
          .some((r) => r.name === c.parentName),
      );
    }
  }

  const recalc = (data: LocationData[]): LocationData[] => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    return data.map((d) => ({
      ...d,
      percentage: total > 0 ? Math.round((d.count / total) * 1000) / 10 : 0,
    }));
  };

  if (drill.active) {
    displayRegions = recalc(displayRegions);
    displayCities = recalc(displayCities);
  }

  const hasData =
    (tab === "countries" && countries.length > 0) ||
    (tab === "regions" && displayRegions.length > 0) ||
    (tab === "cities" && displayCities.length > 0);

  return (
    <div className="border-hairline bg-surface-1 rounded-3xl border p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-ink text-sm leading-[1.5] font-semibold">
            {translations?.location ?? "Localização"}
          </h2>
          <div className="border-hairline bg-surface-2 flex rounded-full border p-1">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => switchTab(t.value)}
                aria-pressed={tab === t.value}
                className={`min-h-9 rounded-full px-3 py-1.5 text-xs leading-[1.5] font-medium tracking-normal transition-colors ${
                  tab === t.value
                    ? "bg-product-accent text-on-primary"
                    : "text-ink-subtle hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {drill.active && (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            <button
              onClick={goBack}
              aria-label={locale.startsWith("en") ? "Back" : "Voltar"}
              className="border-hairline bg-surface-2 text-ink-subtle hover:bg-surface-3 hover:text-ink flex size-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
            >
              <ArrowLeft className="h-3 w-3" />
            </button>
            <div className="text-ink-tertiary flex items-center gap-1 text-xs leading-[1.5] tracking-normal">
              <button
                onClick={clearDrill}
                className="text-ink-subtle hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
              >
                {locale.startsWith("en") ? "All" : "Todos"}
              </button>
              {drill.country && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <button
                    onClick={() => {
                      setDrill({
                        active: true,
                        country: drill.country,
                        level: "regions",
                      });
                      setTab("regions");
                    }}
                    className={`transition-colors ${drill.level === "regions" ? "text-ink" : "text-ink-subtle hover:text-ink"}`}
                  >
                    {getCountryFlag(drill.country)} {drill.country}
                  </button>
                </>
              )}
              {drill.region && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-ink">{drill.region}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {!hasData ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2">
          <Globe className="text-ink-tertiary h-8 w-8" />
          <p className="text-ink-subtle text-sm leading-[1.5]">
            {translations?.noLocationData ?? "Sem dados de localização"}
          </p>
        </div>
      ) : (
        <>
          {tab === "countries" && (
            <CountryList
              data={countries}
              onDrill={drillIntoCountry}
              locale={locale}
            />
          )}
          {tab === "regions" && (
            <LocationList
              data={displayRegions}
              onDrill={drillIntoRegion}
              locale={locale}
            />
          )}
          {tab === "cities" && (
            <LocationList data={displayCities} locale={locale} />
          )}
        </>
      )}
    </div>
  );
}

function CountryList({
  data,
  onDrill,
  locale,
}: {
  data: CountryData[];
  onDrill: (country: string) => void;
  locale: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((d, index) => (
        <button
          key={d.country}
          onClick={() => onDrill(d.country)}
          className="group hover:bg-surface-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors"
        >
          <span className="text-ink-tertiary w-4 text-right text-xs leading-[1.5] tracking-normal">
            {index + 1}
          </span>
          <span className="w-7 text-center text-sm leading-[1.5]">
            {getCountryFlag(d.country)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                <span className="text-ink text-xs leading-[1.5] tracking-normal">
                  {d.country}
                </span>
                <ChevronRight className="text-ink-tertiary h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-ink text-xs leading-[1.5] font-medium tracking-normal tabular-nums">
                  {d.count.toLocaleString(locale)}
                </span>
                <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
                  {d.percentage.toLocaleString(locale)}%
                </span>
              </div>
            </div>
            <div className="bg-surface-3 mt-1.5 h-1 w-full overflow-hidden rounded-full">
              <div
                className="bg-product-accent/40 h-full"
                style={{
                  width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function LocationList({
  data,
  onDrill,
  locale,
}: {
  data: LocationData[];
  onDrill?: (name: string, parentName?: string) => void;
  locale: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((d, index) => {
        const content = (
          <>
            <span className="text-ink-tertiary w-4 text-right text-xs leading-[1.5] tracking-normal">
              {index + 1}
            </span>
            <MapPin className="text-ink-tertiary h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  <span className="text-ink text-xs leading-[1.5] tracking-normal">
                    {d.name}
                  </span>
                  {d.parentName && (
                    <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
                      · {d.parentName}
                    </span>
                  )}
                  {onDrill && (
                    <ChevronRight className="text-ink-tertiary h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-ink text-xs leading-[1.5] font-medium tracking-normal tabular-nums">
                    {d.count.toLocaleString(locale)}
                  </span>
                  <span className="text-ink-tertiary text-xs leading-[1.5] tracking-normal tabular-nums">
                    {d.percentage.toLocaleString(locale)}%
                  </span>
                </div>
              </div>
              <div className="bg-surface-3 mt-1.5 h-1 w-full overflow-hidden rounded-full">
                <div
                  className="bg-product-accent/40 h-full"
                  style={{
                    width: `${maxCount > 0 ? (d.count / maxCount) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </>
        );

        if (onDrill) {
          return (
            <button
              key={`${d.name}-${d.parentName}`}
              onClick={() => onDrill(d.name, d.parentName)}
              className="group hover:bg-surface-2 flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors"
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={`${d.name}-${d.parentName}`}
            className="flex items-center gap-3 px-1 py-0.5"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

function getCountryFlag(countryCode: string): string {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌍";
  }
}
