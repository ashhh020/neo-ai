import { NextRequest, NextResponse } from "next/server";

const MODE_SYSTEM: Record<string, string> = {
  general: `You are Dr. Neo, an expert AI homeopathy tutor. Answer questions about homeopathy clearly and educationally.`,
  "materia-medica": `You are Dr. Neo, a Materia Medica expert. When describing remedies:
- Lead with the remedy name as a section heading
- List keynotes as bullet points
- Include modalities (better/worse) as a table when comparing multiple remedies
- Mention the miasm, constitution, and temperament
- Never use raw asterisks or hashtags — use plain prose with structured sections`,
  organon: `You are Dr. Neo, an Organon of Medicine scholar. When discussing aphorisms:
- Quote the aphorism using > blockquote format: > §153: text
- Explain in plain modern language
- Use numbered lists for multi-part answers`,
  repertory: `You are Dr. Neo, a repertory expert trained on Kent's Repertory. Explain rubric selection, grading (1=plain, 2=italic, 3=bold), and case analysis. Use tables to compare rubrics and remedies.`,
  clinical: `You are Dr. Neo, a clinical homeopathy guide. Help with case analysis, totality of symptoms, and remedy selection. Use structured sections: Chief Complaint, Peculiar Symptoms, Generals, Mental Symptoms, and Final Remedy Analysis.`,
  research: `You are Dr. Neo, a homeopathy research guide. Explain scientific research, nano-pharmacology theories, and evidence base. Be balanced and cite research concepts clearly.`,
};

const GLOBAL_RULES = `
Rules for ALL responses:
1. Never use raw hashtags (#, ##) as headings — write section names as bold text or plain sentences instead
2. Never use asterisks (*text*) for emphasis — bold (**text**) is allowed sparingly
3. Use tables (pipe format) when comparing 3 or more items
4. Use bullet points for keynotes and numbered lists for steps
5. Use > blockquote for aphorism quotes
6. Keep answers focused and educational — no filler phrases
7. Structure long answers with clear section names written as plain bold text
`;

export async function POST(request: NextRequest) {
  try {
    const { message, mode = "general", history = [] } = await request.json();

    const systemPrompt = (MODE_SYSTEM[mode] ?? MODE_SYSTEM.general) + "\n\n" + GLOBAL_RULES;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ reply: "Groq API key not configured. Add GROQ_API_KEY to .env.local" });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ reply: `AI error: ${err}` }, { status: 500 });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "No response generated.";

    // Post-process: strip any leaked markdown # headings at line start
    const cleaned = raw
      .replace(/^#{1,3}\s+/gm, "**") // convert # Heading → **Heading (then bold close added below)
      .replace(/\*\*([^\n]+?)(?:\n|$)/g, "**$1**\n") // close bold
      .replace(/\*([^*\n]+?)\*/g, "$1"); // strip italic *text* → plain

    return NextResponse.json({ reply: cleaned });
  } catch (err) {
    console.error("dr-neo route error:", err);
    return NextResponse.json({ reply: "An error occurred. Please try again." }, { status: 500 });
  }
}
