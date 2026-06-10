import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ── Supabase service client for RAG queries ────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Mode-specific system prompts ───────────────────────────────────────────
const MODE_SYSTEM: Record<string, string> = {
  general: `You are Hahnemann AI, a world-class classical homeopathy expert and educator. You have mastered the Organon of Medicine, Materia Medica (Boericke, Kent, Clarke, Allen, Phatak, Murphy), Kent's Repertory, and all major homeopathic philosophy texts. Answer with depth, cite aphorism numbers and author names, and teach in the tradition of Kent and Hahnemann.

CRITICAL ACCURACY RULES — never violate:
- §-numbers (§1, §153, etc.) refer ONLY to the Organon of Medicine. Never cite a §-number from Kent's Repertory, Lectures, or any other work — those use page/chapter references.
- THERMAL STATES must always be accurate: Sulphur = WARM/HOT patient (worse from heat and bathing, uncovers at night, burning hot feet, better in open cool air). Arsenicum Album = CHILLY (craves warmth). Pulsatilla = warm-blooded, desires open cool air. Never reverse these.
- CONSOLATION rubrics: "Mind: Consolation, aggravation" = Nat-m (3), Ign (3), Sep (2), Lil-t, Nit-ac. "Mind: Consolation, desires" (wants sympathy) = Puls, Phos. These are opposite rubrics.
- If uncertain of an exact quote or reference, say "approximately" or omit the citation rather than fabricate.`,

  "materia-medica": `You are Hahnemann AI, a Materia Medica scholar with mastery of Boericke, Kent, Clarke, Allen, Phatak, Murphy, Patil, Choudhuri, and Boger. When answering about a remedy, always structure your response with these headings in order:

**Overview**
**Keynote Symptoms**
**Mind & Constitution**
**Modalities**
**Clinical Uses**
**Comparison** (only if comparing remedies — use a table)

Use the SOURCE TEXT provided in the context (if any) as your primary reference. Quote it accurately.

CRITICAL ACCURACY RULES — never violate:
- THERMAL STATES: Always verify before writing. Sulphur = HOT (worse warmth/heat, burning soles, uncovers, worse bathing). Pulsatilla = warm-blooded (craves open air, thirstless). Arsenicum = CHILLY. Nux Vomica = CHILLY. Calcarea Carb = CHILLY. Phosphorus = chilly but desires cold drinks.
- MODALITIES TABLE: Always reflect the correct remedy. Sulphur modalities: Worse = heat, warm room, washing/bathing, standing, 11am. Better = open air, dry weather, lying on right side.
- NEVER fabricate page numbers, section references, or quotes. If unsure, paraphrase with "according to Kent" / "Boericke notes".`,

  organon: `You are Hahnemann AI, the foremost scholar of Hahnemann's Organon of Medicine. You teach from the 6th and 5th editions, Kent's Lectures on Homeopathic Philosophy, and Roberts' Art of Cure.

When an aphorism is provided in the SOURCE TEXT below, quote it exactly, then explain:

**The Aphorism** (blockquote: > §N: exact text)
**Plain Meaning** — modern clinical language, 2-3 sentences
**Clinical Relevance** — how it applies in practice today
**Related Aphorisms** — which other §§ connect to this principle

When no source text is provided, draw from your deep knowledge of all 291 aphorisms.

CRITICAL ACCURACY RULES:
- §-numbers cite ONLY the Organon of Medicine — never any other book.
- Kent's Lectures on Homeopathic Philosophy has chapters, not §-numbers.
- If citing Kent's Repertory rubrics, use the format: "Mind > [Rubric] — remedy (grade)".`,

  repertory: `You are Hahnemann AI, a repertory master trained on Kent's Repertory, Boericke's Repertory, and Boger's Synoptic Key. Structure answers with **Rubric Analysis**, **Key Remedies** (table with grades), and **Case Approach** sections. Always explain rubric grading: 3=bold (highest), 2=italic, 1=plain.

IMPORTANT: "Mind: Consolation, aggravation" (Nat-m 3, Ign 3, Sep 2, Lil-t 2, Nit-ac 2) is a famous aggravation rubric — consolation WORSENS these patients. "Mind: Company, desire for" and "Mind: Sympathy, desires" are separate rubrics. Always distinguish aggravation from amelioration in modality rubrics.`,

  clinical: `You are Hahnemann AI, a classical homeopathy clinician. Structure case analysis with: **Chief Complaint**, **Characteristic Symptoms**, **Mental Picture**, **Generals**, **Rubric Selection** (table), **Remedy Analysis**, and **Potency & Repetition** guidance.`,

  research: `You are Hahnemann AI, a homeopathy research expert. Cover the scientific evidence base, nano-pharmacology theories, and clinical trial data in a balanced, academically rigorous way. Use **Background**, **Current Evidence**, **Mechanisms Proposed**, and **Takeaway** sections.`,

  student: `You are Hahnemann AI, a Socratic homeopathy tutor. Guide learning through questions and classical references. Cover any topic: remedies, Organon principles, repertory, miasms, case-taking. Always cite sources accurately.`,
};

// ── Strict formatting rules injected into every prompt ────────────────────
const GLOBAL_RULES = `
STRICT FORMATTING RULES — follow every rule exactly:

1. HEADINGS: Write section headings as a standalone line: **Heading**
   Never use # symbols. Never embed ** mid-sentence for decoration.

2. BULLETS: Use "- " for lists. One item per line.

3. NUMBERED STEPS: Use "1. " "2. " for sequences.

4. TABLES: Use Markdown pipe tables for comparisons and modalities.
   | Worse | Better |
   |-------|--------|
   | Cold  | Heat   |

5. APHORISMS: Quote with "> §N: exact text" blockquote.

6. NO raw asterisks: never write *word* with single asterisks. Use **word** (bold) or plain text.

7. Keep paragraphs to 2-3 sentences. Prefer structured sections over long prose.

8. Be clinically precise. Cite aphorism numbers, author names, edition numbers.
`;

// ── RAG: fetch relevant source text from DB based on mode + question ───────
async function fetchContext(mode: string, message: string): Promise<string> {
  try {
    const query = message.slice(0, 200).toLowerCase();

    // ── Organon mode: find matching aphorisms ──────────────────────────────
    if (mode === "organon") {
      // Check if user is asking about a specific aphorism number
      const aphMatch = message.match(/§\s*(\d+)|aphorism\s+(\d+)|section\s+(\d+)/i);
      if (aphMatch) {
        const num = parseInt(aphMatch[1] ?? aphMatch[2] ?? aphMatch[3]);
        const { data } = await (supabase as any)
          .from("organon_aphorisms")
          .select("aphorism_num, title, content, footnotes, source_abbrev")
          .eq("aphorism_num", num)
          .in("source_abbrev", ["hahnemann6", "hahnemann5"])
          .order("source_abbrev");

        if (data?.length) {
          return data.map((r: { source_abbrev: string; aphorism_num: number; content: string; footnotes?: string }) =>
            `[SOURCE: ${r.source_abbrev === "hahnemann6" ? "Organon 6th Ed." : "Organon 5th Ed."} §${r.aphorism_num}]\n${r.content}${r.footnotes ? "\n\nFootnote: " + r.footnotes : ""}`
          ).join("\n\n---\n\n");
        }
      }

      // Otherwise full-text search
      const words = query.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
      if (words.length) {
        let q = (supabase as any)
          .from("organon_aphorisms")
          .select("aphorism_num, content, source_abbrev")
          .eq("source_abbrev", "hahnemann6")
          .order("aphorism_num");
        for (const w of words) q = q.ilike("content", `%${w}%`);
        const { data } = await q.limit(3);
        if (data?.length) {
          return data.map((r: { source_abbrev: string; aphorism_num: number; content: string }) =>
            `[SOURCE: Organon 6th Ed. §${r.aphorism_num}]\n${r.content}`
          ).join("\n\n---\n\n");
        }
      }
    }

    // ── Materia Medica mode: find matching remedy ──────────────────────────
    if (mode === "materia-medica" || mode === "general") {
      // Extract remedy name from query (common remedies)
      const remedyMatch = message.match(
        /\b(sulphur|pulsatilla|arsenicum|lycopodium|natrum\s*mur|calcarea|phosphorus|lachesis|nux\s*vomica|belladonna|sepia|ignatia|apis|bryonia|rhus\s*tox|silica|silicea|thuja|mercurius|causticum|graphites|hepar\s*sulph|chamomilla|aconite|gelsemium|veratrum|china|carbo\s*veg|platina|staphysagria|medorrhinum|tuberculinum|syphilinum|psorinum)\b/i
      );
      if (remedyMatch) {
        const remedyName = remedyMatch[1].replace(/\s+/g, " ").trim();
        const { data } = await (supabase as any)
          .from("mm_remedies")
          .select("remedy_name, source_abbrev, section, content")
          .ilike("remedy_name", `%${remedyName}%`)
          .order("source_abbrev")
          .limit(4);
        if (data?.length) {
          // Group by source, take top sections
          const grouped: Record<string, string[]> = {};
          for (const r of data as { remedy_name: string; source_abbrev: string; section: string; content: string }[]) {
            if (!grouped[r.source_abbrev]) grouped[r.source_abbrev] = [];
            if (grouped[r.source_abbrev].length < 2) {
              grouped[r.source_abbrev].push(`${r.section}:\n${r.content.slice(0, 400)}`);
            }
          }
          const parts = Object.entries(grouped).map(([src, sections]) =>
            `[SOURCE: ${src.toUpperCase()}]\n${sections.join("\n\n")}`
          );
          return parts.join("\n\n---\n\n");
        }
      }
    }

    // ── Philosophy / general Organon questions ─────────────────────────────
    if (mode === "organon") {
      const keywords = ["vital force", "miasm", "similar", "potency", "dose", "cure", "disease", "symptom", "proving", "chronic"];
      const matched = keywords.filter(k => query.includes(k));
      if (matched.length) {
        const { data } = await (supabase as any)
          .from("organon_aphorisms")
          .select("aphorism_num, content, source_abbrev")
          .eq("source_abbrev", "hahnemann6")
          .ilike("content", `%${matched[0]}%`)
          .order("aphorism_num")
          .limit(3);
        if (data?.length) {
          return data.map((r: { aphorism_num: number; content: string }) =>
            `[SOURCE: Organon 6th Ed. §${r.aphorism_num}]\n${r.content}`
          ).join("\n\n---\n\n");
        }
      }
    }
  } catch (e) {
    console.error("RAG fetch error:", e);
  }
  return "";
}

// ── Main handler ───────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { message, mode = "general", history = [], caseData } = await request.json();

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ reply: "Groq API key not configured. Add GROQ_API_KEY to .env.local" });
    }

    // ── Step 1: RAG — fetch relevant source text from DB ──────────────────
    const context = await fetchContext(mode, message ?? "");

    // ── Step 2: Build system prompt with injected context ─────────────────
    const modePrompt = MODE_SYSTEM[mode] ?? MODE_SYSTEM.general;
    const contextBlock = context
      ? `\n\nSOURCE TEXT FROM YOUR KNOWLEDGE BASE (use this as primary reference — quote it accurately):\n\n${context}\n\nEND OF SOURCE TEXT\n`
      : "";

    const systemPrompt = modePrompt + contextBlock + "\n\n" + GLOBAL_RULES;

    // ── Step 3: Build message array ────────────────────────────────────────
    const chatHistory = (history ?? [])
      .filter((m: { role: string; content: string }) => m.content?.trim())
      .slice(-8)
      .map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const caseContext = caseData
      ? `\n\n[Case context: ${JSON.stringify(caseData)}]`
      : "";

    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory,
      { role: "user", content: (message ?? "") + caseContext },
    ];

    // ── Step 4: Call Qwen3 32B (reasoning model) on Groq ─────────────────
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "qwen/qwen3-32b",
        messages,
        temperature: 0.6,
        max_tokens: 1800,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      // Fallback to LLaMA 3.3 70B if Qwen3 is rate-limited
      if (res.status === 429 || res.status === 503 || res.status === 400) {
        return callFallback(messages, groqKey);
      }
      return NextResponse.json({ reply: `AI error (${res.status}): ${err}` }, { status: 500 });
    }

    const data = await res.json();
    let raw: string = data.choices?.[0]?.message?.content ?? "No response generated.";

    // Strip any internal thinking tags if present
    raw = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    // Normalise markdown
    const cleaned = raw
      .replace(/^#{1,6}\s+(.+?)\s*$/gm, "**$1**")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return NextResponse.json({ reply: cleaned, model: "qwen3-32b", hasContext: !!context });
  } catch (err) {
    console.error("dr-neo route error:", err);
    return NextResponse.json({ reply: "An error occurred. Please try again." }, { status: 500 });
  }
}

// ── Fallback to LLaMA 3.3 70B if DeepSeek is rate-limited ────────────────
async function callFallback(
  messages: { role: string; content: string }[],
  groqKey: string
): Promise<NextResponse> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.6,
        max_tokens: 1800,
      }),
    });
    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "No response generated.";
    const cleaned = raw.replace(/^#{1,6}\s+(.+?)\s*$/gm, "**$1**").replace(/\n{3,}/g, "\n\n").trim();
    return NextResponse.json({ reply: cleaned, model: "llama-fallback" });
  } catch {
    return NextResponse.json({ reply: "Service temporarily unavailable. Please try again in a moment." });
  }
}
