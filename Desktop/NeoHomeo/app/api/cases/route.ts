import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function makeClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
}

// GET /api/cases — list files+cases for current user
// GET /api/cases?fileId=x — get cases in file
// GET /api/cases?caseId=x — get case with rubrics
export async function GET(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const caseId = searchParams.get("caseId");
  const fileId = searchParams.get("fileId");

  // Full case with rubrics
  if (caseId) {
    const { data: caze, error: e1 } = await supabase
      .from("cases" as never).select("*").eq("id", caseId).eq("user_id", user.id).single();
    if (e1) return NextResponse.json({ error: e1.message }, { status: 404 });

    const { data: rubrics } = await supabase
      .from("case_rubrics" as never).select("*").eq("case_id", caseId).order("created_at");

    return NextResponse.json({ case: caze, rubrics: rubrics ?? [] });
  }

  // Cases in a file
  if (fileId) {
    const { data, error } = await supabase
      .from("cases" as never).select("*").eq("file_id", fileId).eq("user_id", user.id).order("created_at");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ cases: data ?? [] });
  }

  // All files for user
  const { data: files, error } = await supabase
    .from("case_files" as never).select("*, cases(id, name, created_at)")
    .eq("user_id", user.id).order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ files: files ?? [] });
}

// POST /api/cases — create file or case or add rubric
export async function POST(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type } = body;

  if (type === "file") {
    const { data, error } = await supabase
      .from("case_files" as never)
      .insert({ user_id: user.id, name: body.name, description: body.description ?? "" })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ file: data });
  }

  if (type === "case") {
    const { data, error } = await supabase
      .from("cases" as never)
      .insert({ file_id: body.fileId, user_id: user.id, name: body.name, description: body.description ?? "" })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ case: data });
  }

  if (type === "rubric") {
    const { data, error } = await supabase
      .from("case_rubrics" as never)
      .insert({
        case_id: body.caseId,
        rubric_id: body.rubricId,
        rubric_fullpath: body.rubricFullpath,
        rubric_chapter: body.rubricChapter,
        rubric_remedies: body.rubricRemedies ?? [],
        repertory_abbrev: body.repertoryAbbrev ?? "publicum",
        weight: body.weight ?? 1,
        label: body.label ?? null,
      })
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rubric: data });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

// PATCH /api/cases — update weight/label on a rubric
export async function PATCH(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  if (body.type === "rubric") {
    const { data, error } = await supabase
      .from("case_rubrics" as never)
      .update({ weight: body.weight, label: body.label, updated_at: new Date().toISOString() })
      .eq("id", body.id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rubric: data });
  }

  if (body.type === "case") {
    const { data, error } = await supabase
      .from("cases" as never)
      .update({ name: body.name, description: body.description, updated_at: new Date().toISOString() })
      .eq("id", body.id).eq("user_id", user.id)
      .select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ case: data });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

// DELETE /api/cases — delete file, case, or rubric
export async function DELETE(req: NextRequest) {
  const supabase = await makeClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "No id" }, { status: 400 });

  const tableMap: Record<string, string> = {
    file: "case_files",
    case: "cases",
    rubric: "case_rubrics",
  };
  const table = tableMap[type ?? ""];
  if (!table) return NextResponse.json({ error: "Unknown type" }, { status: 400 });

  const { error } = await supabase.from(table as never).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
