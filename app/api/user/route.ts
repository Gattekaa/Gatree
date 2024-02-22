import prisma from "@/database/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

interface RouteITD {
  req: NextApiRequest;
  res: NextApiResponse;
}

export function GET() {
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const bcrypt = require("bcrypt");

    const { username, avatar, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        avatar,
      },
    });
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
