import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const component = await prisma.component.findUniqueOrThrow({
      where: {
        id: params.id,
      },
      include: {
        tree: true,
      }
    });

    const isTreeOwner = user.id === component.tree.userId;

    if (!isTreeOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, url, backgroundColor, textColor, outlined } =
      await req.json();

    const updatedComponent = await prisma.component.update({
      where: {
        id: params.id,
      },
      data: {
        label,
        url,
        backgroundColor,
        textColor,
        outlined,
      },
    });

    return NextResponse.json(updatedComponent, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const component = await prisma.component.findUniqueOrThrow({
      where: {
        id: params.id,
      },
      include: {
        tree: true,
      }
    });

    const isTreeOwner = user.id === component.tree.userId;

    if (!isTreeOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.component.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { status: "success", id: component.id },
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
