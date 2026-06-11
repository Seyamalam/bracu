import { generateText } from "ai";
import { demoCopilotOutput, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

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

  if (!hasAiProvider()) {
    return Response.json({
      answer:
        "Draft support only: ask the clinician to confirm vitals, danger signs, allergies, current medicines, and follow-up timing before sharing patient instructions.",
      mode: "demo",
    });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      temperature: 0.2,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You are a safe clinic workflow assistant. Answer questions about the selected case using only the provided summary and patient handout. Do not diagnose, prescribe, or replace clinicians. Prefer concise checklists, receptionist questions, patient explanations, and safety-net wording.",
        prompt: `Case summary:
${caseSummary}

Patient handout:
${patientHandout}

Question:
${question}`,
      }),
    });

    return Response.json({ answer: result.text, mode: "live" });
  } catch (error) {
    logAiProviderError("api/case-assistant", error);
    return Response.json({
      answer:
        "Fallback draft support: confirm vitals, red flags, allergies, current medicines, and follow-up timing with the clinician before sharing instructions.",
      mode: "fallback",
    });
  }
}
