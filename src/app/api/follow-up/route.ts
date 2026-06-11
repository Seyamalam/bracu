import { generateText, Output } from "ai";
import { z } from "zod";
import { demoFollowUpMessage, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

export const runtime = "nodejs";

const followUpMessageSchema = z.object({
  channel: z.enum(["sms", "whatsapp"]),
  messageBn: z.string(),
  messageEn: z.string(),
  checklist: z.array(z.string()),
  urgency: z.enum(["low", "medium", "high"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const patientName = String(body.patientName ?? "Patient").trim();
  const channel = body.channel === "sms" ? "sms" : "whatsapp";
  const caseSummary = String(body.caseSummary ?? "").trim();
  const followUpTiming = String(body.followUpTiming ?? "").trim();
  const followUpMessage = String(body.followUpMessage ?? "").trim();
  const instruction = String(body.instruction ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (!caseSummary) {
    return Response.json(
      { error: "Generate or select a case before composing follow-up." },
      { status: 400 },
    );
  }

  if (!hasAiProvider()) {
    return Response.json({
      output: { ...demoFollowUpMessage, channel },
      mode: "demo",
    });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: followUpMessageSchema }),
      temperature: 0.1,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You compose safe clinic follow-up messages for Bangladesh primary care. Produce Bangla and English versions. Do not diagnose, prescribe, or make treatment promises. Keep messages short enough for patient messaging, include urgent return signs, and remind that clinicians approve care decisions.",
        prompt: `Patient: ${patientName}
Channel: ${channel}
Case summary:
${caseSummary}

Follow-up timing:
${followUpTiming || "Not specified"}

Existing follow-up instruction:
${followUpMessage || "Not specified"}

Operator instruction:
${instruction || "No extra instruction"}`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/follow-up", error);
    return Response.json({
      output: { ...demoFollowUpMessage, channel },
      mode: "fallback",
    });
  }
}
