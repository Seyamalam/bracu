import { generateText, Output } from "ai";
import { z } from "zod";
import { demoNextStepOutput, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

export const runtime = "nodejs";

const nextStepSchema = z.object({
  priority: z.enum(["low", "medium", "high"]),
  headline: z.string(),
  immediateActions: z.array(z.string()),
  suggestedCommands: z.array(z.string()),
  accessibilityNotes: z.array(z.string()),
  patientCommunication: z.string(),
  demoNarration: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const patientName = String(body.patientName ?? "Selected patient").trim();
  const caseSummary = String(body.caseSummary ?? "").trim();
  const severity = String(body.severity ?? "medium");
  const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];
  const missingQuestions = Array.isArray(body.missingQuestions)
    ? body.missingQuestions
    : [];
  const followUp = String(body.followUp ?? "").trim();
  const instruction = String(body.instruction ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (!caseSummary) {
    return Response.json(
      { error: "Generate or select a case before planning next steps." },
      { status: 400 },
    );
  }

  if (!hasAiProvider()) {
    return Response.json({ output: demoNextStepOutput, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: nextStepSchema }),
      temperature: 0.1,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You are a safe clinic workflow navigator for a Bangla-English primary care demo. Recommend operational next steps and commands the clinic operator can type next. Do not diagnose, prescribe, or claim certainty. Include accessibility notes for low-literacy, Bangla-first, keyboard-only, or busy clinic contexts. Suggested commands must be short commands supported by Clinic Copilot BD, such as explain risk, create handoff, compose follow-up, write referral, switch Bangla, or open presentation mode.",
        prompt: `Patient: ${patientName}
Current priority: ${severity}
Case summary:
${caseSummary}

Red flags:
${redFlags.join("\n") || "None provided"}

Missing questions:
${missingQuestions.join("\n") || "None provided"}

Follow-up:
${followUp || "None provided"}

Operator instruction:
${instruction || "No extra instruction"}`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/next-steps", error);
    return Response.json({ output: demoNextStepOutput, mode: "fallback" });
  }
}
