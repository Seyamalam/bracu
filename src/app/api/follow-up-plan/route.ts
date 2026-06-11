import { generateText, Output } from "ai";
import { z } from "zod";
import { demoFollowUpPlan, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

export const runtime = "nodejs";

const followUpPlanSchema = z.object({
  priority: z.enum(["low", "medium", "high"]),
  timing: z.string(),
  channel: z.enum(["sms", "whatsapp", "phone"]),
  staffOwner: z.string(),
  callbackScript: z.string(),
  reminders: z.array(z.string()),
  escalationRules: z.array(z.string()),
  closureCriteria: z.array(z.string()),
  suggestedCommands: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const patientName = String(body.patientName ?? "Patient").trim();
  const caseSummary = String(body.caseSummary ?? "").trim();
  const severity = String(body.severity ?? "medium");
  const followUpTiming = String(body.followUpTiming ?? "").trim();
  const followUpMessage = String(body.followUpMessage ?? "").trim();
  const instruction = String(body.instruction ?? "").trim();
  const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];
  const requestedModel = String(body.model ?? "env");

  if (!caseSummary) {
    return Response.json(
      { error: "Generate or select a case before scheduling follow-up." },
      { status: 400 },
    );
  }

  if (!hasAiProvider()) {
    return Response.json({ output: demoFollowUpPlan, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: followUpPlanSchema }),
      temperature: 0.1,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You create safe operational follow-up schedules for a Bangladesh primary-care clinic. Do not diagnose, prescribe, or make treatment decisions. Produce callback timing, preferred channel, staff owner, script, reminders, escalation rules, closure criteria, and short suggested Clinic Copilot commands.",
        prompt: `Patient: ${patientName}
Current priority: ${severity}
Case summary:
${caseSummary}

Follow-up timing from draft:
${followUpTiming || "Not specified"}

Follow-up message from draft:
${followUpMessage || "Not specified"}

Red flags:
${redFlags.join("\n") || "None provided"}

Operator instruction:
${instruction || "Use standard safe follow-up planning."}`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/follow-up-plan", error);
    return Response.json({ output: demoFollowUpPlan, mode: "fallback" });
  }
}
