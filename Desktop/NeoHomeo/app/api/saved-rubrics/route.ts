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

export async function GET(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("saved_rubrics")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rubrics: data ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rubric_path, chapter, grade, source_abbrev, remedies } = await req.json();
  if (!rubric_path) return NextResponse.json({ error: "rubric_path required" }, { status: 400 });

  // Check if already saved (avoid duplicates)
  const { data: existing } = await supabase
    .from("saved_rubrics")
    .select("id")
    .eq("user_id", user.id)
    .eq("rubric_path", rubric_path)
    .maybeSingle();

  if (existing) return NextResponse.json({ rubric: existing, alreadySaved: true });

  const { data, error } = await supabase
    .from("saved_rubrics")
    .insert({
      user_id: user.id,
      rubric_path,
      chapter: chapter ?? "",
      grade: grade ?? 1,
      source: source_abbrev ?? "publicum",
      remedies: remedies ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ rubric: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await supabase
    .from("saved_rubrics")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
