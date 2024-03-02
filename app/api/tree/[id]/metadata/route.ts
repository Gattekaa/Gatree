import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import type { User } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.headers.get("Authorization");
    let user: User | null = null;
    if (token) {
      user = (await getCurrentUser(token)) || null;
    }

    const trees = await prisma.tree.findUniqueOrThrow({
      where: { path: params.id },
      select: {
        title: true,
        photo: true,
        status: true,
        userId: true,
        user: { select: { username: true } },
      },
    });

    if (trees.status === "inactive" && trees.userId !== user?.id) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    return NextResponse.json(trees, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
