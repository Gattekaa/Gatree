import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import prisma from "@/database/prisma";
import sharp from "sharp";
import { File } from "buffer";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const formData = await request.formData();
    const file = formData.get("file");

    if (!filename || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No filename or file provided" },
        { status: 400 },
      );
    }

    const tree = await prisma.tree.findUnique({
      where: { id: params.id },
    });

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    const blob = new Blob([file], { type: file.type });

    const treatedImage = await sharp(await blob.arrayBuffer())
      .resize(256, 256)
      .webp()
      .toBuffer();

    const imageData = await put(filename, treatedImage, {
      access: "public",
    });

    const updatedTree = await prisma.tree.update({
      where: { id: params.id },
      data: { photo: imageData.url },
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
