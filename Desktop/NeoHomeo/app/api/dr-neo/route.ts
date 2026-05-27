import { NextRequest } from "next/server";
import { getModel } from "@/lib/gemini";
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
};

export async function POST(req: NextRequest) {
  try {
    const { messages, mode = "patient", caseData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.patient;

    let fullSystemPrompt = systemPrompt;
    if (mode === "doctor" && caseData) {
      fullSystemPrompt += `\n\nPATIENT CASE DATA:\n${JSON.stringify(caseData, null, 2)}`;
    }

    const model = getModel();
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: `[SYSTEM INSTRUCTIONS]\n${fullSystemPrompt}\n[END SYSTEM INSTRUCTIONS]\n\nAcknowledge you are ready.` }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am Dr. Neo, ready to assist." }],
        },
        ...messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        })),
      ],
      generationConfig: {
        temperature: mode === "doctor" ? 0.3 : 0.7,
        maxOutputTokens: 1024,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Dr. Neo API error:", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return new Response(
        JSON.stringify({
          error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Dr. Neo is temporarily unavailable. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
