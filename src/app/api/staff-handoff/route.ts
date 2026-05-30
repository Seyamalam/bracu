import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoStaffHandoff, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const staffHandoffSchema = z.object({
  urgency: z.enum(["low", "medium", "high"]),
  headline: z.string(),
  receptionistTasks: z.array(z.string()),
  nurseTasks: z.array(z.string()),
  doctorTasks: z.array(z.string()),
  followUpDeskTasks: z.array(z.string()),
  safetyNotes: z.array(z.string()),
  handoffScript: z.string(),
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
      { error: "Generate or select a case before creating a handoff." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoStaffHandoff, mode: "demo" });
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
      output: Output.object({ schema: staffHandoffSchema }),
      temperature: 0.1,
      system:
        "You create a safe clinic operations handoff for a Bangla-English primary care workflow. Split tasks by receptionist, nurse, doctor, and follow-up desk. Do not diagnose, prescribe, or imply autonomous care decisions. Make tasks specific, short, and ready for a busy clinic team. Include safety notes and a spoken handoff script.",
      prompt: `Patient: ${patientName}
Current priority: ${severity}
Case summary:
${caseSummary}

Red flags:
${redFlags.join("\n") || "None provided"}

Missing questions:
${missingQuestions.join("\n") || "None provided"}

Follow-up plan:
${followUp || "None provided"}

Operator instruction:
${instruction || "No extra instruction"}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({ output: demoStaffHandoff, mode: "fallback" });
  }
}
