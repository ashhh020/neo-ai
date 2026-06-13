/**
 * Next.js instrumentation hook — runs once on server startup (Node.js runtime only).
 * We use it to kick off the homeoint.org page-cache warm-up so the first user
 * search hits cached HTML instead of cold-fetching pages live.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmupCache } = await import("@/lib/homeoint-scraper");
    warmupCache();
  }
}
