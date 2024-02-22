import getCurrentUser from "@/helpers/getCurrentUser";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await getCurrentUser(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(
      {
        user: userWithoutPassword,
      },
      { status: 200 },
    );
  } catch (err) {
    const errorMessage = (err as Error).message;
    if (errorMessage === "jwt expired") {
      return NextResponse.json({ error: "Expired token" }, { status: 401 });
    }
  }
}
