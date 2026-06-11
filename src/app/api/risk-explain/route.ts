import { generateText, Output } from "ai";
import { z } from "zod";
import { demoRiskExplanation, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

export const runtime = "nodejs";

const riskExplanationSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  plainReason: z.string(),
  evidenceForRisk: z.array(z.string()),
  evidenceAgainstRisk: z.array(z.string()),
  uncertainty: z.array(z.string()),
  clinicianActions: z.array(z.string()),
  patientSafetyNet: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const caseSummary = String(body.caseSummary ?? "").trim();
  const severity = String(body.severity ?? "medium");
  const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];
  const missingQuestions = Array.isArray(body.missingQuestions)
    ? body.missingQuestions
    : [];
  const instruction = String(body.instruction ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (!caseSummary) {
    return Response.json(
      { error: "Generate or select a case before explaining risk." },
      { status: 400 },
    );
  }

  if (!hasAiProvider()) {
    return Response.json({ output: demoRiskExplanation, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: riskExplanationSchema }),
      temperature: 0.1,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You explain the safety rationale behind an AI-generated clinic documentation draft. Do not diagnose, prescribe, or claim certainty. Separate evidence for risk, evidence against risk, uncertainty, clinician actions, and patient safety-net advice. Keep it concise and clinician-reviewable.",
        prompt: `Current severity: ${severity}
Case summary:
${caseSummary}

Red flags:
${redFlags.join("\n") || "None provided"}

Missing questions:
${missingQuestions.join("\n") || "None provided"}

Operator instruction:
${instruction || "No extra instruction"}`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/risk-explain", error);
    return Response.json({ output: demoRiskExplanation, mode: "fallback" });
  }
}
