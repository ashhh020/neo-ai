import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ResultItem {
  id: string;
  title: string;
  source: "materia_medica" | "organon";
  excerpt: string;
  author: string;
  pages: string;
}

// GET /api/research?q=sulphur&filter=all|materia_medica|organon
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const filter = sp.get("filter") ?? "all";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results: ResultItem[] = [];
  const like = `%${q}%`;

  try {
    // ── Materia Medica search ──
    if (filter === "all" || filter === "materia_medica") {
      const { data } = await (supabase as any)
        .from("mm_remedies")
        .select("id, name, author, title, intro, sections")
        .or(`name.ilike.${like},intro.ilike.${like}`)
        .limit(filter === "materia_medica" ? 25 : 12);

      for (const r of (data ?? [])) {
        const fullText = r.sections && typeof r.sections === "object"
          ? Object.values(r.sections).join(" ")
          : "";
        const body = (r.intro || fullText || "").toString().replace(/\s+/g, " ").trim();
        results.push({
          id: `mm_${r.id}`,
          title: `${r.author || r.title || "Materia Medica"}: ${r.name}`,
          source: "materia_medica",
          excerpt: body.slice(0, 320) + (body.length > 320 ? "…" : ""),
          author: r.author || "Classical Materia Medica",
          pages: r.title || "",
        });
      }
    }

    // ── Organon aphorism search ──
    if (filter === "all" || filter === "organon") {
      const { data } = await (supabase as any)
        .from("organon_aphorisms")
        .select("id, aphorism_num, content, source_abbrev")
        .eq("source_abbrev", "hahnemann6")
        .ilike("content", like)
        .order("aphorism_num")
        .limit(filter === "organon" ? 25 : 12);

      for (const r of (data ?? [])) {
        const body = (r.content || "").toString();
        results.push({
          id: `org_${r.id}`,
          title: `Organon §${r.aphorism_num}`,
          source: "organon",
          excerpt: body.slice(0, 320) + (body.length > 320 ? "…" : ""),
          author: "Samuel Hahnemann",
          pages: `Aphorism ${r.aphorism_num}`,
        });
      }
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message, results: [] }, { status: 500 });
  }

  return NextResponse.json({ results });
}
