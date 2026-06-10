import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, serviceClient as supabase } from "@/lib/supabase/api-auth";

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
  const deck = searchParams.get("deck");

  let query = (supabase as any)
    .from("flashcard_reviews")
    .select("card_id, deck, ease_factor, interval_days, repetitions, next_review_at, last_grade, updated_at")
    .eq("user_id", user.id);

  if (deck) query = query.eq("deck", deck);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
  const { card_id, deck, grade, ease_factor, interval_days, repetitions, next_review_at } = body;

  if (!card_id) return NextResponse.json({ error: "card_id required" }, { status: 400 });

  // Upsert by (user_id, card_id)
  const { data, error } = await (supabase as any)
    .from("flashcard_reviews")
    .upsert({
      user_id: user.id,
      card_id,
      deck: deck ?? "materia-medica",
      ease_factor: ease_factor ?? 2.5,
      interval_days: interval_days ?? 1,
      repetitions: repetitions ?? 0,
      next_review_at: next_review_at ?? new Date().toISOString(),
      last_grade: grade ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,card_id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data });
}
