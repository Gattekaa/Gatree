import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.headers.get("Authorization");
    const user = await getCurrentUser(token || "");

    const trees = await prisma.tree.findUniqueOrThrow({
      where: { id: params.id },
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
