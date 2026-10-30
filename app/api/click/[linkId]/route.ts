import { db } from "@/lib/db";
import { clickRateLimiter, getClientIp } from "@/lib/rate-limit";
import { isAllowedRedirectUrl } from "@/lib/security";
import { trackLinkClick } from "@/lib/tracking";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {

  const ip = getClientIp(request);
  const { success } = await clickRateLimiter.check(`click:${ip}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { linkId } = await params;
  const { searchParams } = new URL(request.url);
  const treeId = searchParams.get("tree");

  try {

    const link = await db.link.findUnique({
      where: { id: linkId },
      select: { url: true, treeId: true },
    });

    if (!link) {

      if (treeId) {
        const tree = await db.tree.findUnique({
          where: { id: treeId },
          select: { slug: true },
        });
        if (tree) {
          return NextResponse.redirect(
            new URL(`/${tree.slug}?link_not_found=true`, request.url)
          );
        }
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    const headersList = await headers();
    trackLinkClick(linkId, link.treeId, headersList).catch(() => {

    });

    let destinationUrl = link.url;
    if (!destinationUrl.startsWith("http://") && !destinationUrl.startsWith("https://")) {
      destinationUrl = `https://${destinationUrl}`;
    }

    if (!isAllowedRedirectUrl(destinationUrl)) {
      return NextResponse.json(
        { error: "URL de destino inválida" },
        { status: 400 }
      );
    }

    return NextResponse.redirect(destinationUrl, 302);
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
