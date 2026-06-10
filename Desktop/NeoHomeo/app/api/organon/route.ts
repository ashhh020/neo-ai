import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/organon?type=aphorism&num=1&sources=hahnemann6,kent_lectures
// GET /api/organon?type=aphorism&search=vital+force
// GET /api/organon?type=philosophy&book=roberts
// GET /api/organon?type=stats
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") ?? "stats";

  if (type === "stats") {
    // Count per source + books
    const [aph, phi] = await Promise.all([
      (supabase as any).from("organon_aphorisms")
        .select("source_abbrev", { count: "exact" }),
      (supabase as any).from("philosophy_chapters")
        .select("book_abbrev", { count: "exact" }),
    ]);

    // Get per-source counts
    const aphSources: Record<string, number> = {};
    for (const row of (aph.data ?? [])) {
      aphSources[row.source_abbrev] = (aphSources[row.source_abbrev] ?? 0) + 1;
    }
    const phiBooks: Record<string, number> = {};
    for (const row of (phi.data ?? [])) {
      phiBooks[row.book_abbrev] = (phiBooks[row.book_abbrev] ?? 0) + 1;
    }

    return NextResponse.json({ aphSources, phiBooks });
  }

  if (type === "aphorism") {
    const num = sp.get("num");
    const search = sp.get("search");
    const sourcesParam = sp.get("sources");
    const sources = sourcesParam ? sourcesParam.split(",") : null;

    if (num !== null) {
      // Load all sources for one aphorism number
      let q = (supabase as any)
        .from("organon_aphorisms")
        .select("id,source_abbrev,aphorism_num,title,content,footnotes")
        .eq("aphorism_num", parseInt(num));
      if (sources?.length) q = q.in("source_abbrev", sources);
      const { data, error } = await q.order("source_abbrev");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ rows: data ?? [] });
    }

    if (search) {
      const { data, error } = await (supabase as any)
        .from("organon_aphorisms")
        .select("id,source_abbrev,aphorism_num,title,content")
        .textSearch("content", search, { type: "websearch" })
        .limit(30);
      if (error) {
        // Fallback to ilike
        const { data: d2 } = await (supabase as any)
          .from("organon_aphorisms")
          .select("id,source_abbrev,aphorism_num,title,content")
          .ilike("content", `%${search}%`)
          .limit(30);
        return NextResponse.json({ rows: d2 ?? [] });
      }
      return NextResponse.json({ rows: data ?? [] });
    }

    // List only DISTINCT aphorism numbers for hahnemann6 — fast indexed query
    // Returns a plain sorted array; the client builds its nav grid from this.
    const { data } = await (supabase as any)
      .from("organon_aphorisms")
      .select("aphorism_num")
      .eq("source_abbrev", "hahnemann6")
      .gt("aphorism_num", 0)
      .order("aphorism_num");

    const nums: number[] = [...new Set<number>((data ?? []).map((r: { aphorism_num: number }) => r.aphorism_num))];
    return NextResponse.json({ nums });
  }

  if (type === "philosophy") {
    const book = sp.get("book");
    const chapterId = sp.get("chapter");

    if (book && chapterId) {
      const { data } = await (supabase as any)
        .from("philosophy_chapters")
        .select("*")
        .eq("book_abbrev", book)
        .eq("chapter_num", parseInt(chapterId))
        .maybeSingle();
      return NextResponse.json({ chapter: data });
    }

    if (book) {
      const { data } = await (supabase as any)
        .from("philosophy_chapters")
        .select("id,book_abbrev,chapter_num,chapter_title")
        .eq("book_abbrev", book)
        .order("chapter_num");
      return NextResponse.json({ chapters: data ?? [] });
    }

    // All books list
    const { data } = await (supabase as any)
      .from("philosophy_chapters")
      .select("book_abbrev,chapter_num,chapter_title")
      .order("book_abbrev")
      .order("chapter_num");
    return NextResponse.json({ chapters: data ?? [] });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
