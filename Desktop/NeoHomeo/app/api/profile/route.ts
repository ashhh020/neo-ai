import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, serviceClient as supabase } from "@/lib/supabase/api-auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("name, email, role, streak_days, xp_points, avatar_url, last_active_date")
    .eq("id", user.id)
    .maybeSingle();

  // ── Daily streak maintenance ──────────────────────────────────────────
  // Bump the streak the first time the student loads their data each day.
  // Same day → no change. Exactly the next day → +1. Gap of 2+ days → reset to 1.
  const today = new Date().toISOString().split("T")[0];
  let streak = profile?.streak_days ?? 0;
  const last = profile?.last_active_date ?? null;

  if (last !== today) {
    if (!last) {
      streak = 1;
    } else {
      const dayMs = 86_400_000;
      const diff = Math.round(
        (new Date(today).getTime() - new Date(last).getTime()) / dayMs
      );
      streak = diff === 1 ? streak + 1 : 1;
    }
    await (supabase as any)
      .from("profiles")
      .upsert(
        { id: user.id, email: user.email, streak_days: streak, last_active_date: today },
        { onConflict: "id" }
      );
  }

  const result = {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Student",
    role: profile?.role ?? "student",
    streak_days: streak,
    xp_points: profile?.xp_points ?? 0,
    avatar_url: profile?.avatar_url ?? null,
  };

  return NextResponse.json({ profile: result });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.streak_days !== undefined) updates.streak_days = body.streak_days;
  if (body.xp_points !== undefined) updates.xp_points = body.xp_points;
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

  // Upsert profile
  const { data, error } = await (supabase as any)
    .from("profiles")
    .upsert({ id: user.id, email: user.email, ...updates }, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

// XP increment helper — called after activities (quiz, flashcards, case save)
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { activity } = await req.json();
  const XP_MAP: Record<string, number> = {
    quiz_complete: 10,
    flashcard_session: 5,
    case_saved: 20,
    note_created: 3,
    rubric_saved: 2,
  };

  const xpGain = XP_MAP[activity] ?? 5;

  // Get current XP
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("xp_points, streak_days")
    .eq("id", user.id)
    .maybeSingle();

  const currentXp = profile?.xp_points ?? 0;
  const newXp = currentXp + xpGain;

  const { data, error } = await (supabase as any)
    .from("profiles")
    .upsert({ id: user.id, email: user.email, xp_points: newXp }, { onConflict: "id" })
    .select("xp_points, streak_days")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ xp_points: data.xp_points, xp_gained: xpGain });
}
