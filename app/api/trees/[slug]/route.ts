import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const tree = await db.tree.findUnique({
    where: { slug },
    include: {
      links: { orderBy: { position: "asc" } },
    },
  });

  if (!tree) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (tree.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(tree);
}
