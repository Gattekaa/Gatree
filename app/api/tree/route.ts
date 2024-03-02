import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getCurrentUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trees = await prisma.tree.findMany({
      where: {
        userId: user.id,
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

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, path, status } = await request.json();

    if (!title || !path || !status) {
      return NextResponse.json(
        { error: "Title, path, and status are required" },
        { status: 400 },
      );
    }

    const pathExists = await prisma.tree.findUnique({
      where: {
        path,
      },
    });

    if (pathExists) {
      return NextResponse.json(
        { error: "Path is not available" },
        { status: 400 },
      );
    }

    const user = await getCurrentUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tree = await prisma.tree.create({
      data: {
        userId: user.id,
        title,
        path,
        status,
      },
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
