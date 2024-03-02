import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import { deleteFile } from "@/services/firebase";
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
      include: {
        user: { select: { username: true, avatar: true } },
        components: {
          orderBy: {
            position: "asc",
          },
        },
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { title, status, backgroundColor, theme, path } = await request.json();
    const tree = await prisma.tree.update({
      where: { id: params.id },
      data: { title, status, backgroundColor, theme, path },
    });

    return NextResponse.json(tree, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const data = await prisma.tree.delete({ where: { id: params.id } });

    if (data.photo) {
      deleteFile("trees_photos", data.id);
    }

    return NextResponse.json(
      { status: "success", id: data.id },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
