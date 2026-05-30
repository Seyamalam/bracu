import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoClinicBriefing, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const briefingSchema = z.object({
  headline: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  queueSummary: z.string(),
  priorityPatients: z.array(z.string()),
  followUpActions: z.array(z.string()),
  paperworkGaps: z.array(z.string()),
  nextBestActions: z.array(z.string()),
  judgePitch: z.string(),
});

const clinicCaseSchema = z.object({
  patientName: z.string(),
  age: z.number(),
  language: z.enum(["bn", "en", "mixed"]),
  chiefComplaint: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  status: z.enum(["waiting", "review", "handout", "followup"]),
  redFlagCount: z.number(),
  approvedAt: z.number().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const clinicName = String(body.clinicName ?? "Clinic").trim();
  const requestedModel = String(body.model ?? "env");
  const cases = z.array(clinicCaseSchema).safeParse(body.cases ?? []);

  if (!cases.success) {
    return Response.json(
      { error: "Case queue could not be summarized." },
      { status: 400 },
    );
  }

  if (cases.data.length === 0) {
    return Response.json({
      output: {
        ...demoClinicBriefing,
        headline: "No active cases yet. Generate a draft to start the queue.",
      },
      mode: "demo",
    });
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoClinicBriefing, mode: "demo" });
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
      output: Output.object({ schema: briefingSchema }),
      temperature: 0.1,
      system:
        "You summarize a Bangladesh primary-care clinic queue for operational use. You do not diagnose or prescribe. Prioritize safety review, follow-up closure, paperwork gaps, and next actions. Keep it concise and useful for a hackathon judge demo.",
      prompt: `Clinic: ${clinicName}
Current queue JSON:
${JSON.stringify(cases.data)}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({ output: demoClinicBriefing, mode: "fallback" });
  }
}
