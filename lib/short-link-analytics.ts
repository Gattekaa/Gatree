import { db } from "@/lib/db";
import { decodeCityName } from "@/lib/geolocation";
import { resolveReferrer } from "@/lib/referrer-resolver";
import { UAParser } from "ua-parser-js";

export async function trackShortLinkClick(
  shortLinkId: string,
  headersList: Headers
) {
  const userAgent = headersList.get("user-agent") || "";
  const refererHeader = headersList.get("referer") || null;
  const country = headersList.get("x-vercel-ip-country") || null;
  const region = headersList.get("x-vercel-ip-country-region") || null;
  const city = decodeCityName(headersList.get("x-vercel-ip-city"));

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
      sourceType: "short_link_click",
      sourceId: shortLinkId,
      country,
      region,
      city,
      device,
      browser,
      referrer,
    },
  });
}
