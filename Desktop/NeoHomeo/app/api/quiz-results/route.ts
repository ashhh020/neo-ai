import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, serviceClient as supabase } from "@/lib/supabase/api-auth";

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  const { data, error } = await (supabase as any)
    .from("quiz_results")
    .select("id, topic, score, total, completed_at")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute per-topic averages
  const byTopic: Record<string, { total: number; sum: number; count: number }> = {};
  (data ?? []).forEach((r: { topic?: string; score: number; total: number }) => {
    const t = r.topic ?? "general";
    if (!byTopic[t]) byTopic[t] = { total: 0, sum: 0, count: 0 };
    byTopic[t].sum += (r.score / r.total) * 100;
    byTopic[t].count += 1;
  });

  const topicAverages = Object.entries(byTopic).map(([topic, v]) => ({
    topic,
    average: Math.round(v.sum / v.count),
    count: v.count,
  }));

  return NextResponse.json({ results: data ?? [], topicAverages });
}

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topic, score, total, answers = [] } = await req.json();
  if (score === undefined || !total) {
    return NextResponse.json({ error: "score and total required" }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from("quiz_results")
    .insert({ user_id: user.id, topic: topic ?? "general", score, total, answers })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ result: data });
}
