import { generateText, Output } from "ai";
import { z } from "zod";
import { demoCopilotOutput, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
  describeAiProviderError,
  getAiProviderLabel,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

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
  const preferredLanguage = body.language === "bn" ? "bn" : "en";

  if (intake.length < 12) {
    return Response.json(
      { error: "Please add more intake detail before generating." },
      { status: 400 },
    );
  }

  if (!hasAiProvider()) {
    return Response.json({ output: demoCopilotOutput, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);
  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: copilotSchema }),
      temperature: 0.2,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You are Clinic Copilot BD, a bilingual Bangla-English clinical documentation assistant. You never diagnose, prescribe, or replace clinicians. You create draft notes, missing questions, patient-friendly instructions, and red-flag safety guidance for a licensed clinician to review. Keep outputs concise, practical, and locally appropriate for Bangladesh.",
        prompt: `Patient name: ${patientName}
Age: ${age || "unknown"}
Sex: ${sex}
Raw intake:
${intake}

Return safe clinical documentation support. ${
          preferredLanguage === "bn"
            ? "Write every returned string in Bangla, including clinician-facing fields, SOAP support, checklist items, patient handout, follow-up timing, and safety warnings. Keep common medical abbreviations only when they are standard in Bangladesh."
            : "Write every returned string in English, except preserve Bangla only when quoting patient words from the intake."
        } Mark uncertainty clearly.`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/copilot", error);
    return Response.json({
      output: demoCopilotOutput,
      mode: "fallback",
      providerError: {
        detail: describeAiProviderError(error),
        provider: getAiProviderLabel(resolvedModel.provider),
      },
    });
  }
}
