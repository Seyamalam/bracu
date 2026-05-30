import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoRiskExplanation, modelOptions } from "@/features/clinic/data";

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
  const requestedModel = String(body.model ?? "env");

  if (!caseSummary) {
    return Response.json(
      { error: "Generate or select a case before explaining risk." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoRiskExplanation, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const model =
    requestedModel !== "env" &&
    (allowedModels as readonly string[]).includes(requestedModel)
      ? requestedModel
      : (process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash");

  try {
    const result = await generateText({
      model: google(model),
      output: Output.object({ schema: riskExplanationSchema }),
      temperature: 0.1,
      system:
        "You explain the safety rationale behind an AI-generated clinic documentation draft. Do not diagnose, prescribe, or claim certainty. Separate evidence for risk, evidence against risk, uncertainty, clinician actions, and patient safety-net advice. Keep it concise and clinician-reviewable.",
      prompt: `Current severity: ${severity}
Case summary:
${caseSummary}

Red flags:
${redFlags.join("\n") || "None provided"}

Missing questions:
${missingQuestions.join("\n") || "None provided"}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({ output: demoRiskExplanation, mode: "fallback" });
  }
}
