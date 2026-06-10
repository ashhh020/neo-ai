"use client";
/**
 * authedFetch — wraps fetch() and automatically attaches the Supabase
 * access token as an Authorization: Bearer header.
 *
 * Use this instead of plain fetch() for ALL /api/* calls that require auth.
 */
import { createClient } from "@/lib/supabase/client";

export async function authedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.headers as Record<string, string>)?.["Content-Type"]
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });
}
