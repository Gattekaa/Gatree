import { db } from "@/lib/db";
import { resolveReferrer } from "@/lib/referrer-resolver";
import { UAParser } from "ua-parser-js";

export async function trackPageView(
  treeId: string,
  headersList: Headers,
  searchParams?: { utm_source?: string }
) {
  const userAgent = headersList.get("user-agent") || "";
  const refererHeader = headersList.get("referer") || null;
  const country = headersList.get("x-vercel-ip-country") || null;
  const region = headersList.get("x-vercel-ip-country-region") || null;
  const city = headersList.get("x-vercel-ip-city") || null;

  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type;
  const device = deviceType === "mobile" ? "mobile" : deviceType === "tablet" ? "tablet" : "desktop";
  const browser = parser.getBrowser().name || null;

  const referrer = resolveReferrer({
    refererHeader,
    userAgent,
    utmSource: searchParams?.utm_source,
  });

  await db.analyticsEvent.create({
    data: {
      sourceType: "tree_view",
      sourceId: treeId,
      country,
      region,
      city,
      device,
      browser,
      referrer,
    },
  });
}

export async function trackLinkClick(
  linkId: string,
  _treeId: string,
  headersList: Headers
) {
  const userAgent = headersList.get("user-agent") || "";
  const refererHeader = headersList.get("referer") || null;
  const country = headersList.get("x-vercel-ip-country") || null;
  const region = headersList.get("x-vercel-ip-country-region") || null;
  const city = headersList.get("x-vercel-ip-city") || null;

  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type;
  const device = deviceType === "mobile" ? "mobile" : deviceType === "tablet" ? "tablet" : "desktop";
  const browser = parser.getBrowser().name || null;

  const referrer = resolveReferrer({
    refererHeader,
    userAgent,
  });

  await db.analyticsEvent.create({
    data: {
      sourceType: "link_click",
      sourceId: linkId,
      country,
      region,
      city,
      device,
      browser,
      referrer,
    },
  });
}
