import "server-only";

import { db } from "@/lib/db";
import type {
  CountryData,
  DeviceData,
  LocationData,
  Period,
  PeriodRange,
  ReferrerData,
  TimeSeriesData,
} from "@/types";
import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";

export function getPeriodRange(period: Period, customRange?: PeriodRange): {
  current: PeriodRange;
  previous: PeriodRange;
} {
  const now = new Date();

  let days: number;
  switch (period) {
    case "today":
      days = 1;
      break;
    case "7d":
      days = 7;
      break;
    case "30d":
      days = 30;
      break;
    case "90d":
      days = 90;
      break;
    case "custom":
      if (customRange) {
        const diff = Math.ceil(
          (customRange.end.getTime() - customRange.start.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return {
          current: customRange,
          previous: {
            start: subDays(customRange.start, diff),
            end: subDays(customRange.end, diff),
          },
        };
      }
      days = 7;
      break;
    default:
      days = 7;
  }

  const currentStart = startOfDay(subDays(now, days));
  const currentEnd = endOfDay(now);
  const previousStart = startOfDay(subDays(currentStart, days));
  const previousEnd = endOfDay(subDays(currentEnd, days));

  return {
    current: { start: currentStart, end: currentEnd },
    previous: { start: previousStart, end: previousEnd },
  };
}

export async function getDeviceBreakdown(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<DeviceData[]> {
  const { current } = getPeriodRange(period);

  const devices = await db.analyticsEvent.groupBy({
    by: ["device"],
    where: {
      sourceType,
      sourceId,
      createdAt: { gte: current.start, lte: current.end },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const total = devices.reduce((sum, d) => sum + d._count.id, 0);

  return devices.map((d) => ({
    device: d.device || "unknown",
    count: d._count.id,
    percentage: total > 0 ? Math.round((d._count.id / total) * 1000) / 10 : 0,
  }));
}

export async function getCountryBreakdown(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<CountryData[]> {
  const { current } = getPeriodRange(period);

  const countries = await db.analyticsEvent.groupBy({
    by: ["country"],
    where: {
      sourceType,
      sourceId,
      createdAt: { gte: current.start, lte: current.end },
      country: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const total = countries.reduce((sum, c) => sum + c._count.id, 0);

  return countries.map((c) => ({
    country: c.country || "unknown",
    countryName: c.country || "Desconhecido",
    count: c._count.id,
    percentage: total > 0 ? Math.round((c._count.id / total) * 1000) / 10 : 0,
  }));
}

export async function getRegionBreakdown(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<LocationData[]> {
  const { current } = getPeriodRange(period);

  const regions = await db.analyticsEvent.groupBy({
    by: ["region", "country"],
    where: {
      sourceType,
      sourceId,
      createdAt: { gte: current.start, lte: current.end },
      region: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 50,
  });

  const total = regions.reduce((sum, r) => sum + r._count.id, 0);

  return regions.map((r) => ({
    name: r.region || "Desconhecido",
    parentName: r.country || undefined,
    count: r._count.id,
    percentage: total > 0 ? Math.round((r._count.id / total) * 1000) / 10 : 0,
  }));
}

export async function getCityBreakdown(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<LocationData[]> {
  const { current } = getPeriodRange(period);

  const cities = await db.analyticsEvent.groupBy({
    by: ["city", "region"],
    where: {
      sourceType,
      sourceId,
      createdAt: { gte: current.start, lte: current.end },
      city: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 50,
  });

  const total = cities.reduce((sum, c) => sum + c._count.id, 0);

  return cities.map((c) => ({
    name: c.city || "Desconhecido",
    parentName: c.region || undefined,
    count: c._count.id,
    percentage: total > 0 ? Math.round((c._count.id / total) * 1000) / 10 : 0,
  }));
}

export async function getReferrers(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<ReferrerData[]> {
  const { current } = getPeriodRange(period);

  const referrers = await db.analyticsEvent.groupBy({
    by: ["referrer"],
    where: {
      sourceType,
      sourceId,
      createdAt: { gte: current.start, lte: current.end },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 10,
  });

  const total = referrers.reduce((sum, r) => sum + r._count.id, 0);

  return referrers.map((r) => ({
    referrer: r.referrer || "Direto",
    count: r._count.id,
    percentage: total > 0 ? Math.round((r._count.id / total) * 1000) / 10 : 0,
  }));
}

export async function getTimeSeries(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<TimeSeriesData[]> {
  const { current, previous } = getPeriodRange(period);

  const [currentEvents, previousEvents] = await Promise.all([
    db.analyticsEvent.findMany({
      where: {
        sourceType,
        sourceId,
        createdAt: { gte: current.start, lte: current.end },
      },
      select: { createdAt: true },
    }),
    db.analyticsEvent.findMany({
      where: {
        sourceType,
        sourceId,
        createdAt: { gte: previous.start, lte: previous.end },
      },
      select: { createdAt: true },
    }),
  ]);

  const days = eachDayOfInterval({ start: current.start, end: current.end });
  const previousDays = eachDayOfInterval({ start: previous.start, end: previous.end });

  const currentCounts = new Map<string, number>();
  currentEvents.forEach((e) => {
    const key = format(e.createdAt, "yyyy-MM-dd");
    currentCounts.set(key, (currentCounts.get(key) || 0) + 1);
  });

  const previousCounts = new Map<string, number>();
  previousEvents.forEach((e) => {
    const key = format(e.createdAt, "yyyy-MM-dd");
    previousCounts.set(key, (previousCounts.get(key) || 0) + 1);
  });

  return days.map((day, index) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const prevDay = previousDays[index];
    const prevDateStr = prevDay ? format(prevDay, "yyyy-MM-dd") : "";

    return {
      date: dateStr,
      count: currentCounts.get(dateStr) || 0,
      previousCount: prevDateStr ? previousCounts.get(prevDateStr) || 0 : 0,
    };
  });
}

export async function getCount(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<number> {
  const { current } = getPeriodRange(period);

  return db.analyticsEvent.count({
    where: {
      sourceType,
      sourceId,
      createdAt: { gte: current.start, lte: current.end },
    },
  });
}

export async function getUniqueVisitors(
  sourceType: string,
  sourceId: string,
  period: Period
): Promise<number> {
  const { current } = getPeriodRange(period);

  const groups = await db.analyticsEvent.groupBy({
    by: ["country", "device", "browser"],
    where: {
      sourceType,
      sourceId,
      createdAt: { gte: current.start, lte: current.end },
    },
  });

  return groups.length;
}
