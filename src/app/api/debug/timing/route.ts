import { NextResponse } from "next/server";
import { getDefaultResultOrder } from "node:dns";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const marks: Record<string, number> = {};
  const diag = {
    runtime: process.env.NEXT_RUNTIME,
    dnsOrder: getDefaultResultOrder(),
    nodeVersion: process.version,
  };
  const t0 = Date.now();

  const supabase = await createClient();
  marks.createClient = Date.now() - t0;

  if (!supabase) {
    return NextResponse.json({ error: "no supabase client", marks });
  }

  const t1 = Date.now();
  await supabase.from("clubs").select("*");
  marks.clubsQuery = Date.now() - t1;

  const t2 = Date.now();
  await supabase.from("club_members").select("club_id");
  marks.clubMembersQuery = Date.now() - t2;

  const t3 = Date.now();
  await Promise.all([supabase.from("clubs").select("*"), supabase.from("club_members").select("club_id")]);
  marks.parallelBoth = Date.now() - t3;

  marks.total = Date.now() - t0;

  return NextResponse.json({ marks, diag });
}
