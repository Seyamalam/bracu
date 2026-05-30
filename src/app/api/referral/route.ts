import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoReferralOutput, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const referralSchema = z.object({
  documentType: z.enum(["referral", "visit_summary"]),
  urgency: z.enum(["low", "medium", "high"]),
  title: z.string(),
  recipient: z.string(),
  reason: z.string(),
  clinicalSummary: z.string(),
  keyFindings: z.array(z.string()),
  redFlags: z.array(z.string()),
  requestedAction: z.string(),
  patientInstructions: z.string(),
  clinicianChecklist: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const patientName = String(body.patientName ?? "Patient").trim();
  const documentType =
    body.documentType === "visit_summary" ? "visit_summary" : "referral";
  const caseSummary = String(body.caseSummary ?? "").trim();
  const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];
  const missingQuestions = Array.isArray(body.missingQuestions)
    ? body.missingQuestions
    : [];
  const followUp = String(body.followUp ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (!caseSummary) {
    return Response.json(
      { error: "Generate or select a case before creating paperwork." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({
      output: { ...demoReferralOutput, documentType },
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
    output: Output.object({ schema: referralSchema }),
    temperature: 0.1,
    system:
      "You create clinician-reviewable clinic paperwork for Bangladesh primary care. You may draft referral letters and visit summaries. Do not diagnose, prescribe, or claim a final treatment plan. Use cautious clinical documentation language, include red flags, and clearly require clinician review.",
    prompt: `Patient: ${patientName}
Document type: ${documentType}
Case summary:
${caseSummary}

Known red flags:
${redFlags.join("\n") || "None documented"}

Missing questions:
${missingQuestions.join("\n") || "None documented"}

Follow-up:
${followUp || "Not specified"}`,
  });

  return Response.json({ output: result.output, mode: "live" });
}
