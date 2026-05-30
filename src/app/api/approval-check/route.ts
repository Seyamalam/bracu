import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoApprovalReadiness, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const approvalReadinessSchema = z.object({
  readiness: z.enum(["ready", "needs_review", "blocked"]),
  riskLevel: z.enum(["low", "medium", "high"]),
  headline: z.string(),
  blockers: z.array(z.string()),
  missingChecks: z.array(z.string()),
  readySignals: z.array(z.string()),
  clinicianSignoffChecklist: z.array(z.string()),
  suggestedCommands: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const draft = body.draft;
  const instruction = String(body.instruction ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (!draft?.summary) {
    return Response.json(
      { error: "Generate or select a draft before checking approval." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoApprovalReadiness, mode: "demo" });
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
      output: Output.object({ schema: approvalReadinessSchema }),
      temperature: 0.1,
      system:
        "You review whether an AI-generated clinic documentation draft is operationally ready for clinician signoff. Do not approve care, diagnose, or prescribe. Identify blockers, missing checks, ready signals, a signoff checklist, and short suggested Clinic Copilot commands. Be conservative: high-risk, unclear medicine, missing vitals, or unresolved red flags should require review or block approval.",
      prompt: `Draft JSON for approval-readiness review:
${JSON.stringify(draft, null, 2)}

Operator instruction:
${instruction || "Use standard approval-readiness review."}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({ output: demoApprovalReadiness, mode: "fallback" });
  }
}
