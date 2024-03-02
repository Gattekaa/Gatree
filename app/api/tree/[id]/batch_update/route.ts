import prisma from "@/database/prisma";
import getCurrentUser from "@/helpers/getCurrentUser";
import type { Component } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const token = request.headers.get("Authorization");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { links } = await request.json();
    const user = await getCurrentUser(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tree = await prisma.tree.findUnique({
      where: {
        id: params.id,
      },
      include: {
        components: true,
        user: true,
      },
    });

    if (!tree) {
      return NextResponse.json({ error: "Tree not found" }, { status: 404 });
    }
    const updatedComponents = [];

    for (const component of tree.components) {
      const link = links.find((link: Component) => link.id === component.id);
      if (!link || link.id !== component.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const data = await prisma.component.update({
        where: {
          id: component.id,
        },
        data: {
          position: link.position,
        },
      });

      updatedComponents[link.position] = data;
    }

    return NextResponse.json(
      { components: updatedComponents },
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
