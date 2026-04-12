import prisma from "@/database/prisma";
import { NextResponse } from "next/server";
import { getTree } from "../_getTree";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { getPublicTree } = getTree({
      params,
      request,
    });

    return getPublicTree();
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
    const { title, status, backgroundColor, theme, path } =
      await request.json();
    const tree = await prisma.tree.update({
      where: { path: params.id },
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
    const data = await prisma.tree.delete({
      where: { path: params.id },
    });

    if (data.photo) {
      deleteImage();
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
