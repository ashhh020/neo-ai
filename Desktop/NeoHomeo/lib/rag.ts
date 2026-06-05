import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SOURCE_MAP: Record<string, string | null> = {
  general: null,
  "materia-medica": "materia_medica",
  organon: "organon",
  repertory: "repertory",
  clinical: "materia_medica",
  research: null,
};

export async function searchKnowledge(
  query: string,
  mode: string,
  topK = 5
): Promise<string> {
  try {
    const source = SOURCE_MAP[mode] ?? null;

    const { data, error } = await supabase.rpc("search_knowledge_fts", {
      search_query: query,
      match_count: topK,
      filter_source: source,
    });

    if (error || !data || data.length === 0) return "";

    const context = (data as Array<{ title: string; content: string; rank: number }>)
      .map((d) => `[${d.title}]\n${d.content}`)
      .join("\n\n---\n\n");

    return `KNOWLEDGE BASE CONTEXT (from NeoHomeo database):\n\n${context}\n\n---\nUse the above verified homeopathic knowledge to answer. Cite sources.`;
  } catch {
    return "";
  }
}
