import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, serviceClient as supabase } from "@/lib/supabase/api-auth";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await (supabase as any)
    .from("saved_remedies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ remedies: data ?? [] });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { remedy_name, abbrev, kingdom, miasm, thermal, keynotes = [] } = await req.json();
  if (!remedy_name) return NextResponse.json({ error: "remedy_name required" }, { status: 400 });

  const { data: existing } = await (supabase as any)
    .from("saved_remedies")
    .select("id")
    .eq("user_id", user.id)
    .eq("remedy_name", remedy_name)
    .maybeSingle();

  if (existing) return NextResponse.json({ remedy: existing, alreadySaved: true });

  const { data, error } = await (supabase as any)
    .from("saved_remedies")
    .insert({ user_id: user.id, remedy_name, abbrev: abbrev ?? remedy_name, kingdom: kingdom ?? "", miasm: miasm ?? "", thermal: thermal ?? "", keynotes })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ remedy: data });
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await (supabase as any)
    .from("saved_remedies")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
