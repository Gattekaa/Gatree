import prisma from "@/database/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const tree = await prisma.tree.findUnique({
      where: {
        path,
      },
    });

    if (tree) {
      return NextResponse.json({ available: false }, { status: 200 });
    }

    return NextResponse.json({ available: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
