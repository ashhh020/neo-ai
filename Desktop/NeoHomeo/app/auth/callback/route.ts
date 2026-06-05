import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ROLE_REDIRECTS: Record<string, string> = {
  student: "/student",
  practitioner: "/doctor",
  educator: "/patient",
  admin: "/admin",
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/student";

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase as any).from("profiles").select("role").eq("id", session.user.id).single();
      const role = (profile?.role as string) ?? "student";
      const redirect = ROLE_REDIRECTS[role] ?? next;
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
