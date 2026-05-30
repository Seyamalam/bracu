import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoCopilotOutput, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const copilotSchema = z.object({
  chiefComplaint: z.string(),
  summary: z.string(),
  languageDetected: z.enum(["bn", "en", "mixed"]),
  severity: z.enum(["low", "medium", "high"]),
  redFlags: z.array(z.string()),
  missingQuestions: z.array(z.string()),
  soap: z.object({
    subjective: z.string(),
    objective: z.string(),
    assessmentSupport: z.string(),
    planSupport: z.string(),
  }),
  doctorChecklist: z.array(z.string()),
  patientHandout: z.object({
    title: z.string(),
    plainSummary: z.string(),
    careSteps: z.array(z.string()),
    medicineInstructions: z.array(z.string()),
    urgentReturnWarnings: z.array(z.string()),
  }),
  followUp: z.object({
    timing: z.string(),
    message: z.string(),
  }),
});

export async function POST(request: Request) {
  const body = await request.json();
  const intake = String(body.intake ?? "").trim();
  const patientName = String(body.patientName ?? "Patient").trim();
  const age = Number(body.age ?? 0);
  const sex = String(body.sex ?? "unknown");
  const requestedModel = String(body.model ?? "env");

  if (intake.length < 12) {
    return Response.json(
      { error: "Please add more intake detail before generating." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoCopilotOutput, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const model =
    requestedModel !== "env" &&
    (allowedModels as readonly string[]).includes(requestedModel)
      ? requestedModel
      : (process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash");
  const result = await generateText({
    model: google(model),
    output: Output.object({ schema: copilotSchema }),
    temperature: 0.2,
    system:
      "You are Clinic Copilot BD, a bilingual Bangla-English clinical documentation assistant. You never diagnose, prescribe, or replace clinicians. You create draft notes, missing questions, patient-friendly instructions, and red-flag safety guidance for a licensed clinician to review. Keep outputs concise, practical, and locally appropriate for Bangladesh.",
    prompt: `Patient name: ${patientName}
Age: ${age || "unknown"}
Sex: ${sex}
Raw intake:
${intake}

Return safe clinical documentation support. Use Bangla for patient-facing handout when the intake contains Bangla, otherwise English. Mark uncertainty clearly.`,
  });

  return Response.json({ output: result.output, mode: "live" });
}
