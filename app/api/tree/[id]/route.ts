import prisma from "@/database/prisma";
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
