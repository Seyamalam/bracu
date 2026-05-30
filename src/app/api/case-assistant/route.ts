import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { demoCopilotOutput, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const question = String(body.question ?? "").trim();
  const caseSummary = String(body.caseSummary ?? demoCopilotOutput.summary);
  const patientHandout = String(
    body.patientHandout ?? demoCopilotOutput.patientHandout.plainSummary,
  );
  const requestedModel = String(body.model ?? "env");

  if (question.length < 3) {
    return Response.json(
      { error: "Ask a question about the selected case." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({
      answer:
        "Draft support only: ask the clinician to confirm vitals, danger signs, allergies, current medicines, and follow-up timing before sharing patient instructions.",
      mode: "demo",
    });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const model =
    requestedModel !== "env" &&
    (allowedModels as readonly string[]).includes(requestedModel)
      ? requestedModel
      : (process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash");

  const result = await generateText({
    model: google(model),
    temperature: 0.2,
    system:
      "You are a safe clinic workflow assistant. Answer questions about the selected case using only the provided summary and patient handout. Do not diagnose, prescribe, or replace clinicians. Prefer concise checklists, receptionist questions, patient explanations, and safety-net wording.",
    prompt: `Case summary:
${caseSummary}

Patient handout:
${patientHandout}

Question:
${question}`,
  });

  return Response.json({ answer: result.text, mode: "live" });
}
