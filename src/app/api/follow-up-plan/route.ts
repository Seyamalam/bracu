import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoFollowUpPlan, modelOptions } from "@/features/clinic/data";

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
  const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];
  const requestedModel = String(body.model ?? "env");

  if (!caseSummary) {
    return Response.json(
      { error: "Generate or select a case before scheduling follow-up." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoFollowUpPlan, mode: "demo" });
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
      output: Output.object({ schema: followUpPlanSchema }),
      temperature: 0.1,
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
${redFlags.join("\n") || "None provided"}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({ output: demoFollowUpPlan, mode: "fallback" });
  }
}
