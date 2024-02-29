import prisma from "@/database/prisma";
import { deleteFile } from "@/services/firebase";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const trees = await prisma.tree.findUniqueOrThrow({
      where: { id: params.id },
      include: {
        user: { select: { username: true, avatar: true } },
        components: true,
      },
    });

    if (trees.status === "inactive") {
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
    const { title, status, backgroundColor, theme } = await request.json();
    const tree = await prisma.tree.update({
      where: { id: params.id },
      data: { title, status, backgroundColor, theme },
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
