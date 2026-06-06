import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Supported author abbreviations
const VALID_AUTHORS = ["allen", "boericke", "kent", "clarke", "bogsk", "heringc"] as const;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";
  const author = searchParams.get("author") ?? "";
  const category = searchParams.get("category") ?? "";
  const id = searchParams.get("id") ?? "";
  const page = parseInt(searchParams.get("page") ?? "0", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "60", 10), 200);

  // Single remedy detail
  if (id) {
    const { data, error } = await supabase
      .from("mm_remedies" as never)
      .select("*")
      .eq("id", id)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ remedy: data });
  }

  // Author stats (counts per author)
  if (searchParams.get("stats") === "1") {
    const { data, error } = await supabase
      .from("mm_remedies" as never)
      .select("abbrev");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const counts: Record<string, number> = {};
    for (const row of (data as { abbrev: string }[])) {
      counts[row.abbrev] = (counts[row.abbrev] ?? 0) + 1;
    }
    return NextResponse.json({ counts });
  }

  // List / search
  let query = supabase
    .from("mm_remedies" as never)
    .select("id,abbrev,remedy_slug,remedy_abbrev,name,intro,category,year,author,title", { count: "exact" });

  if (author && VALID_AUTHORS.includes(author as typeof VALID_AUTHORS[number])) {
    query = query.eq("abbrev", author);
  }
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data, error, count } = await query
    .order("name")
    .range(page * limit, (page + 1) * limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    results: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}
