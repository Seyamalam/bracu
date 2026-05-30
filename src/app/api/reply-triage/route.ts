import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  demoPatientReplyTriageOutput,
  modelOptions,
} from "@/features/clinic/data";

export const runtime = "nodejs";

const replyTriageSchema = z.object({
  urgency: z.enum(["low", "medium", "high"]),
  replySummary: z.string(),
  detectedLanguage: z.enum(["bn", "en", "mixed"]),
  concerningSignals: z.array(z.string()),
  reassuringSignals: z.array(z.string()),
  staffActions: z.array(z.string()),
  clinicianEscalation: z.string(),
  responseBn: z.string(),
  responseEn: z.string(),
  suggestedCommands: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const patientName = String(body.patientName ?? "Patient").trim();
  const replyText = String(body.replyText ?? "").trim();
  const caseSummary = String(body.caseSummary ?? "").trim();
  const followUpMessage = String(body.followUpMessage ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (replyText.length < 3) {
    return Response.json(
      { error: "Paste the patient's reply before triage." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({
      output: demoPatientReplyTriageOutput,
      mode: "demo",
    });
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
      output: Output.object({ schema: replyTriageSchema }),
      temperature: 0.1,
      system:
        "You triage incoming patient follow-up replies for a Bangladesh primary-care clinic. Do not diagnose, prescribe, or make treatment decisions. Identify urgency, concerning and reassuring signals, staff actions, clinician escalation wording, bilingual response drafts, and short suggested Clinic Copilot commands. Escalate for danger signs such as breathing difficulty, chest pain, fainting, bleeding, dehydration, very low urine, severe weakness, pregnancy concern, or worsening symptoms.",
      prompt: `Patient: ${patientName}
Case summary:
${caseSummary || "No case summary provided"}

Original follow-up message:
${followUpMessage || "No follow-up message provided"}

Patient reply:
${replyText}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({
      output: demoPatientReplyTriageOutput,
      mode: "fallback",
    });
  }
}
