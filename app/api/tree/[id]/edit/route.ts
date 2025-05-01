import { NextResponse } from "next/server";
import { getTree } from "../../_getTree";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { getPrivateTree } = getTree({
      params,
      request,
    });

    return getPrivateTree();
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
