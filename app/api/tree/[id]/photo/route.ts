import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import prisma from "@/database/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename || !request.body) {
      return NextResponse.json(
        { error: "No filename or body provided" },
        { status: 400 },
      );
    }

    const tree = await prisma.tree.findUnique({
      where: { id: params.id },
    });

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    const blob = await put(filename, request.body, {
      access: "public",
    });

    const updatedTree = await prisma.tree.update({
      where: { id: params.id },
      data: { photo: blob.url },
    });

    return NextResponse.json(
      { message: "Photo uploaded successfully", tree: updatedTree },
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
