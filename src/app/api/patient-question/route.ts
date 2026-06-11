import { generateText, Output } from "ai";
import { z } from "zod";
import {
  demoPatientQuestionAnswer,
  modelOptions,
} from "@/features/clinic/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

export const runtime = "nodejs";

const patientQuestionSchema = z.object({
  urgency: z.enum(["low", "medium", "high"]),
  detectedLanguage: z.enum(["bn", "en", "mixed"]),
  plainAnswerBn: z.string(),
  plainAnswerEn: z.string(),
  teachBackQuestion: z.string(),
  redFlagReminder: z.array(z.string()),
  clinicianReviewNeeded: z.array(z.string()),
  suggestedCommands: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const patientName = String(body.patientName ?? "Patient").trim();
  const question = String(body.question ?? "").trim();
  const caseSummary = String(body.caseSummary ?? "").trim();
  const handoutSummary = String(body.handoutSummary ?? "").trim();
  const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];
  const requestedModel = String(body.model ?? "env");

  if (question.length < 3) {
    return Response.json(
      { error: "Paste the patient or family question first." },
      { status: 400 },
    );
  }

  if (!hasAiProvider()) {
    return Response.json({ output: demoPatientQuestionAnswer, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: patientQuestionSchema }),
      temperature: 0.1,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You answer patient or family questions for a Bangladesh primary-care clinic using safe, plain Bangla and English. Do not diagnose, prescribe, promise outcomes, or approve medicine changes. Explain what the patient can safely understand, state when clinician review is needed, include urgent return warnings, and add a teach-back question.",
        prompt: `Patient: ${patientName}
Case summary:
${caseSummary || "No case summary provided"}

Patient handout summary:
${handoutSummary || "No handout summary provided"}

Known red flags:
${redFlags.join("\n") || "None provided"}

Patient or family question:
${question}`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/patient-question", error);
    return Response.json({
      output: demoPatientQuestionAnswer,
      mode: "fallback",
    });
  }
}
