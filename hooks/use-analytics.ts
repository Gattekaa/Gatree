"use client";

import { BASE_QUERY_KEYS } from "@/lib/query-keys";
import type {
    AnalyticsOverview,
    CountryData,
    DeviceData,
    Insight,
    LinkClickData,
    LocationData,
    Period,
    ReferrerData,
    TimeSeriesData,
} from "@/types";
import { useQuery } from "@tanstack/react-query";

interface FullAnalyticsData {
  overview: AnalyticsOverview;
  timeSeries: TimeSeriesData[];
  clicksByLink: LinkClickData[];
  devices: DeviceData[];
  countries: CountryData[];
  regions: LocationData[];
  cities: LocationData[];
  referrers: ReferrerData[];
  insights: Insight[];
  hasEnoughData: boolean;
}

async function fetchAnalytics(slug: string, period: Period): Promise<FullAnalyticsData> {
  const res = await fetch(`/api/trees/${slug}/analytics?period=${period}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

async function fetchAnalyticsMetric<T>(slug: string, period: Period, metric: string): Promise<T> {
  const res = await fetch(`/api/trees/${slug}/analytics?period=${period}&metric=${metric}`);
  if (!res.ok) throw new Error(`Failed to fetch ${metric}`);
  return res.json();
}

export function useAnalytics(slug: string, period: Period) {
  return useQuery({
    queryKey: [...BASE_QUERY_KEYS.analytics.byTree(slug), period],
    queryFn: () => fetchAnalytics(slug, period),
    enabled: !!slug,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useAnalyticsOverview(slug: string, treeId: string, period: Period) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.analytics.overview(treeId, period),
    queryFn: () => fetchAnalyticsMetric<AnalyticsOverview>(slug, period, "overview"),
    enabled: !!slug && !!treeId,
    staleTime: 30 * 1000,
  });
}

export function useViewsTimeSeries(slug: string, treeId: string, period: Period) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.analytics.viewsTimeSeries(treeId, period),
    queryFn: () => fetchAnalyticsMetric<TimeSeriesData[]>(slug, period, "views"),
    enabled: !!slug && !!treeId,
    staleTime: 30 * 1000,
  });
}

export function useClicksByLink(slug: string, treeId: string, period: Period) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.analytics.clicksByLink(treeId, period),
    queryFn: () => fetchAnalyticsMetric<LinkClickData[]>(slug, period, "clicks"),
    enabled: !!slug && !!treeId,
    staleTime: 30 * 1000,
  });
}

export function useDeviceBreakdown(slug: string, treeId: string, period: Period) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.analytics.devices(treeId, period),
    queryFn: () => fetchAnalyticsMetric<DeviceData[]>(slug, period, "devices"),
    enabled: !!slug && !!treeId,
    staleTime: 60 * 1000,
  });
}

export function useCountryBreakdown(slug: string, treeId: string, period: Period) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.analytics.countries(treeId, period),
    queryFn: () => fetchAnalyticsMetric<CountryData[]>(slug, period, "countries"),
    enabled: !!slug && !!treeId,
    staleTime: 60 * 1000,
  });
}

export function useReferrers(slug: string, treeId: string, period: Period) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.analytics.referrers(treeId, period),
    queryFn: () => fetchAnalyticsMetric<ReferrerData[]>(slug, period, "referrers"),
    enabled: !!slug && !!treeId,
    staleTime: 60 * 1000,
  });
}

export function useSlugAvailability(slug: string) {
  return useQuery({
    queryKey: BASE_QUERY_KEYS.trees.slugAvailability(slug),
    queryFn: async () => {
      if (slug.length < 2) return { available: false };
      const res = await fetch(`/api/trees/slug-check?slug=${slug}`);
      if (!res.ok) return { available: false };
      return res.json() as Promise<{ available: boolean }>;
    },
    enabled: slug.length >= 2,
    staleTime: 10 * 1000,
  });
}
