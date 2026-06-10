import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/student";

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      const u = session.user;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      // Ensure a profile row exists for first-time (e.g. Google) sign-ins.
      const { data: existing } = await sb
        .from("profiles").select("id").eq("id", u.id).maybeSingle();
      if (!existing) {
        await sb.from("profiles").insert({
          id: u.id,
          email: u.email,
          name:
            u.user_metadata?.full_name ??
            u.user_metadata?.name ??
            u.email?.split("@")[0] ??
            "Student",
          role: "student",
          avatar_url: u.user_metadata?.avatar_url ?? null,
        });
      }
      // Every account is a student in this build.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
