import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import { NextResponse } from "next/server";

type Props = {
  request: Request;
  params: { id: string };
};

export function getTree({ request, params }: Props) {
  async function getPublicTree() {
    try {
      const trees = await prisma.tree.findUniqueOrThrow({
        where: { path: params.id },
        include: {
          user: { select: { username: true, avatar: true } },
          components: {
            where: { disabled: false },
            orderBy: {
              position: "asc",
            },
          },
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

  async function getPrivateTree() {
    try {
      const token = request.headers.get("Authorization");

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const user = await getCurrentUser(token);

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      if (trees.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  return { getPublicTree, getPrivateTree };
}
