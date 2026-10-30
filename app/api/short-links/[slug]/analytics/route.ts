import {
    getCityBreakdown,
    getCount,
    getCountryBreakdown,
    getDeviceBreakdown,
    getPeriodRange,
    getReferrers,
    getRegionBreakdown,
    getTimeSeries,
    getUniqueVisitors,
} from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Insight, Period } from "@/types";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") || "7d") as Period;

  const shortLink = await db.shortLink.findUnique({
    where: { slug },
    select: { id: true, userId: true, createdAt: true },
  });

  if (!shortLink) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (shortLink.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { current, previous } = getPeriodRange(period);

  const [
    totalClicks,
    previousClicks,
    uniqueVisitorsCurrent,
    uniqueVisitorsPrevious,
    timeSeries,
    devices,
    countries,
    regions,
    cities,
    referrers,
  ] = await Promise.all([
    getCount("short_link_click", shortLink.id, period),
    db.analyticsEvent.count({
      where: {
        sourceType: "short_link_click",
        sourceId: shortLink.id,
        createdAt: { gte: previous.start, lte: previous.end },
      },
    }),
    getUniqueVisitors("short_link_click", shortLink.id, period),
    db.analyticsEvent.groupBy({
      by: ["country", "device", "browser"],
      where: {
        sourceType: "short_link_click",
        sourceId: shortLink.id,
        createdAt: { gte: previous.start, lte: previous.end },
      },
    }).then((g) => g.length),
    getTimeSeries("short_link_click", shortLink.id, period),
    getDeviceBreakdown("short_link_click", shortLink.id, period),
    getCountryBreakdown("short_link_click", shortLink.id, period),
    getRegionBreakdown("short_link_click", shortLink.id, period),
    getCityBreakdown("short_link_click", shortLink.id, period),
    getReferrers("short_link_click", shortLink.id, period),
  ]);

  const timeSeriesMapped = timeSeries.map((d) => ({
    date: d.date,
    clicks: d.count,
  }));

  const percentageChange =
    previousClicks > 0
      ? Math.round(((totalClicks - previousClicks) / previousClicks) * 1000) / 10
      : totalClicks > 0
        ? 100
        : 0;

  const daysSinceCreation = Math.floor(
    (Date.now() - shortLink.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const hasEnoughData = daysSinceCreation >= 7 && totalClicks > 0;

  const insights: Insight[] = [];
  if (hasEnoughData) {

    if (referrers.length > 0 && referrers[0].referrer !== "Direto") {
      insights.push({
        id: "top-referrer",
        type: "growth",
        icon: "globe",
        title: `${referrers[0].referrer} é sua maior fonte`,
        description: `${referrers[0].percentage}% dos seus cliques vêm de ${referrers[0].referrer}. Invista mais nesse canal.`,
        value: referrers[0].count,
        generatedAt: new Date(),
      });
    }

    if (countries.length > 0) {
      insights.push({
        id: "top-region",
        type: "peak",
        icon: "map-pin",
        title: `Maior audiência: ${countries[0].country}`,
        description: `${countries[0].percentage}% dos cliques vêm de ${countries[0].country}. Considere adaptar conteúdo para essa região.`,
        value: countries[0].count,
        generatedAt: new Date(),
      });
    }
  }

  return NextResponse.json({
    totalClicks,
    uniqueVisitors: uniqueVisitorsCurrent,
    uniqueVisitorsPrevious,
    percentageChange,
    timeSeries: timeSeriesMapped,
    devices,
    countries,
    regions,
    cities,
    referrers,
    insights,
    hasEnoughData,
  });
}
