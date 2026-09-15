import { NextResponse } from "next/server";
import { getPostComments } from "@/lib/data/feed";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const comments = await getPostComments(id);
  return NextResponse.json({ comments });
}
