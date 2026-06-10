import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { searchLiveRepertory, LIVE_REPERTORIES, warmupCache } from "@/lib/homeoint-scraper";

// Pre-warm the page cache in the background on first module load
warmupCache();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── In-process response cache (5-minute TTL) ─────────────────────────────────
const RESP_CACHE = new Map<string, { data: unknown; ts: number }>();
const RESP_TTL_MS = 5 * 60 * 1000; // 5 min
const MAX_RESP_CACHE = 200;

function cacheGet(key: string) {
  const entry = RESP_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > RESP_TTL_MS) { RESP_CACHE.delete(key); return null; }
  return entry.data;
}
function cacheSet(key: string, data: unknown) {
  if (RESP_CACHE.size >= MAX_RESP_CACHE) {
    const oldest = RESP_CACHE.keys().next().value;
    if (oldest) RESP_CACHE.delete(oldest);
  }
  RESP_CACHE.set(key, { data, ts: Date.now() });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q           = searchParams.get("q")?.trim() ?? "";
  const chapter     = searchParams.get("chapter") ?? "";
  const remedy      = searchParams.get("remedy")?.trim() ?? "";
  const abbrev      = searchParams.get("abbrev") ?? "publicum";
  const minWeight   = parseInt(searchParams.get("minWeight") ?? "1", 10);
  const page        = parseInt(searchParams.get("page") ?? "0", 10);
  const limit       = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);

  if (!q && !chapter && !remedy) {
    return NextResponse.json({ results: [], total: 0 });
  }

  // Build cache key
  const cacheKey = `${abbrev}|${q}|${chapter}|${remedy}|${minWeight}|${page}|${limit}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
  }

  // For non-publicum repertories, use live homeoint.org scraper
  if (abbrev !== "publicum" && LIVE_REPERTORIES[abbrev]) {
    try {
      const results = await searchLiveRepertory(abbrev, q, chapter || undefined, minWeight, remedy || undefined, limit);
      const payload = { results, total: results.length, filtered: results.length, page, limit, source: "live" };
      cacheSet(cacheKey, payload);
      return NextResponse.json(payload);
    } catch (err) {
      return NextResponse.json({ error: "Live fetch failed", results: [], total: 0 }, { status: 500 });
    }
  }

  let qb = supabase
    .from("repertory_rubrics" as never)
    .select("id,chapter,fullpath,path,is_mother,remedies", { count: "exact" });

  // Filter by repertory abbreviation
  qb = (qb as any).eq("abbrev", abbrev);

  // Split query into individual words and AND-match each one so "burning urine"
  // matches "Urine, burning" or "Burning, urine" regardless of word order
  if (q) {
    const words = q.split(/\s+/).filter(Boolean);
    for (const word of words) {
      qb = (qb as any).ilike("fullpath", `%${word}%`);
    }
  }
  if (chapter) qb = (qb as any).eq("chapter", chapter);

  // remedy filter — check if remedies JSONB array contains an element whose first value (abbrev) matches
  // We use a Postgres function via RPC, or filter client-side after fetch.
  // For simplicity: fetch with text/chapter filter first, then post-filter by remedy+minWeight
  const { data: rawData, error, count } = await qb
    .order("fullpath")
    .range(page * limit, (page + 1) * limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  type RubricRow = { id: string; chapter: string; fullpath: string; path: string; is_mother: boolean; remedies: [string, string, number][] };
  let results = (rawData ?? []) as RubricRow[];

  // Post-filter by remedy abbrev and minWeight
  if (remedy || minWeight > 1) {
    results = results.filter((r) => {
      const remedies = r.remedies ?? [];
      if (remedy) {
        const found = remedies.find(
          (rem) => rem[0]?.toLowerCase() === remedy.toLowerCase()
        );
        if (!found) return false;
        if (minWeight > 1 && found[2] < minWeight) return false;
      } else if (minWeight > 1) {
        // At least one remedy with grade >= minWeight
        if (!remedies.some((rem) => rem[2] >= minWeight)) return false;
      }
      return true;
    });
  }

  const payload = {
    results,
    total: count ?? 0,
    filtered: results.length,
    page,
    limit,
  };
  cacheSet(cacheKey, payload);
  return NextResponse.json(payload);
}
