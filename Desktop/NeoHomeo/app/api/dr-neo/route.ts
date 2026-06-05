import { NextRequest } from "next/server";
import { getGroqClient } from "@/lib/groq";
import { searchKnowledge } from "@/lib/rag";
import {
  PATIENT_ASSESSMENT_PROMPT,
  DOCTOR_PRESCRIPTION_PROMPT,
  STUDENT_TUTOR_PROMPT,
} from "@/lib/dr-neo-prompts";

export const runtime = "nodejs";

const SYSTEM_PROMPTS: Record<string, string> = {
  patient: PATIENT_ASSESSMENT_PROMPT,
  doctor: DOCTOR_PRESCRIPTION_PROMPT,
  student: STUDENT_TUTOR_PROMPT,
  general: STUDENT_TUTOR_PROMPT,
  "materia-medica": STUDENT_TUTOR_PROMPT,
  organon: STUDENT_TUTOR_PROMPT,
  repertory: STUDENT_TUTOR_PROMPT,
  clinical: DOCTOR_PRESCRIPTION_PROMPT,
  research: STUDENT_TUTOR_PROMPT,
};

export async function POST(req: NextRequest) {
  try {
    const { messages, mode = "student", caseData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // RAG: retrieve relevant knowledge from database
    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const ragContext = await searchKnowledge(lastUserMessage, mode, 5);

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.student;
    let fullSystemPrompt = systemPrompt;
    if (ragContext) fullSystemPrompt += `\n\n${ragContext}`;
    if (mode === "doctor" && caseData) {
      fullSystemPrompt += `\n\nPATIENT CASE DATA:\n${JSON.stringify(caseData, null, 2)}`;
    }

    const groq = getGroqClient();

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: fullSystemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      temperature: mode === "doctor" || mode === "clinical" ? 0.3 : 0.7,
      max_tokens: 1024,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Dr. Neo API error:", error);
    return new Response(
      JSON.stringify({ error: "Dr. Neo is temporarily unavailable. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
