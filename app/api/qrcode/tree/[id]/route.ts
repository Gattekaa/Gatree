import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const QRCode = require("qrcode");
    const base_url = process.env.FRONTEND_BASE_URL;

    const token = request.headers.get("Authorization");

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getCurrentUser(token);

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tree = await prisma.tree.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true } },
      },
    });

    if (!tree) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    if (tree.user.id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = `${base_url}/tree/${tree.path}`;

    const qrcode = await QRCode.toDataURL(url, { errorCorrectionLevel: "H" });
    return NextResponse.json(qrcode, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
