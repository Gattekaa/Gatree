import { auth } from "@/lib/auth";
import { getShortLinkUrl } from "@/lib/constants";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import QRCode from "qrcode";

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
  const format = searchParams.get("format") || "png";

  const shortLink = await db.shortLink.findUnique({
    where: { slug },
    select: { id: true, userId: true },
  });

  if (!shortLink) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (shortLink.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = getShortLinkUrl(slug);

  if (format === "svg") {
    const svg = await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "H",
      width: 1024,
      color: {
        dark: "#5e6ad2",
        light: "#00000000",
      },
    });

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${slug}.svg"`,
      },
    });
  }

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    errorCorrectionLevel: "H",
    width: 1024,
    color: {
      dark: "#5e6ad2",
      light: "#00000000",
    },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${slug}.png"`,
    },
  });
}
