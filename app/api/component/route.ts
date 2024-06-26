import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tree_id, label, url, backgroundColor, textColor, outlined } =
      await req.json();

    if (!tree_id || !label || !url) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const user = await getCurrentUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tree = await prisma.tree.findUnique({
      where: {
        id: tree_id,
      },
    });

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }

    const isTreeOwner = tree.userId === user.id;

    if (!isTreeOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const component = await prisma.component.create({
      data: {
        treeId: tree.id,
        label,
        url,
        backgroundColor,
        textColor,
        outlined,
      },
    });

    return NextResponse.json(component, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
