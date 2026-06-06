import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function makeClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

export async function GET() {
  const supabase = await makeClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, role, streak_days, xp_points, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  // Fallback to auth metadata if profile doesn't exist yet
  const result = {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Student",
    role: profile?.role ?? "student",
    streak_days: profile?.streak_days ?? 0,
    xp_points: profile?.xp_points ?? 0,
    avatar_url: profile?.avatar_url ?? null,
  };

  return NextResponse.json({ profile: result });
}

export async function PATCH(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.streak_days !== undefined) updates.streak_days = body.streak_days;
  if (body.xp_points !== undefined) updates.xp_points = body.xp_points;
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url;

  // Upsert profile
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email, ...updates }, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data });
}

// XP increment helper — called after activities (quiz, flashcards, case save)
export async function PUT(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_points, streak_days")
    .eq("id", user.id)
    .maybeSingle();

  const currentXp = profile?.xp_points ?? 0;
  const newXp = currentXp + xpGain;

  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, email: user.email, xp_points: newXp }, { onConflict: "id" })
    .select("xp_points, streak_days")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ xp_points: data.xp_points, xp_gained: xpGain });
}
