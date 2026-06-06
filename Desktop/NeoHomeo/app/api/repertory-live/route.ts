import { NextRequest, NextResponse } from "next/server";
import { searchLiveRepertory } from "@/lib/homeoint-scraper";

export const runtime = "nodejs"; // needs Node.js fetch + TextDecoder latin-1

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q            = searchParams.get("q")?.trim() ?? "";
  const chapter      = searchParams.get("chapter") ?? "";
  const abbrev       = searchParams.get("abbrev") ?? "kent";
  const minWeight    = parseInt(searchParams.get("minWeight") ?? "1", 10);
  const remedyFilter = searchParams.get("remedy")?.trim() ?? "";
  const limit        = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);

  if (!q && !chapter) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    const results = await searchLiveRepertory(
      abbrev, q, chapter || undefined, minWeight, remedyFilter || undefined, limit
    );

    return NextResponse.json({
      results,
      total: results.length,
      filtered: results.length,
      page: 0,
      limit,
      source: "live",
      abbrev,
    });
  } catch (err) {
    console.error("Live repertory error:", err);
    return NextResponse.json(
      { error: "Failed to fetch from source", results: [], total: 0 },
      { status: 500 }
    );
  }
}
