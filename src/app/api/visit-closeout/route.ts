import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoVisitCloseout, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const visitCloseoutSchema = z.object({
  readiness: z.enum(["ready", "needs_review", "blocked"]),
  priority: z.enum(["low", "medium", "high"]),
  headline: z.string(),
  staffCloseoutSteps: z.array(z.string()),
  patientBeforeLeaving: z.array(z.string()),
  followUpClosure: z.array(z.string()),
  auditNotes: z.array(z.string()),
  printPacket: z.array(z.string()),
  suggestedCommands: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const patientName = String(body.patientName ?? "Selected patient").trim();
  const caseSummary = String(body.caseSummary ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (caseSummary.length < 10) {
    return Response.json(
      { error: "Generate or select a case before closing the visit." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoVisitCloseout, mode: "demo" });
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
      output: Output.object({ schema: visitCloseoutSchema }),
      temperature: 0.1,
      system:
        "You create a safe operational visit closeout for a Bangladesh primary-care clinic. Do not diagnose, prescribe, approve care, or imply the AI has authority. Package the case into staff closeout steps, patient-before-leaving checks, follow-up closure rules, audit notes, print packet items, and short suggested Clinic Copilot commands. Be conservative: unresolved red flags, unclear medicines, missing vitals, pregnancy, children, chest pain, diabetes wounds, dehydration, or worsening symptoms should require review or block closeout.",
      prompt: `Patient: ${patientName}
Case summary: ${caseSummary}
Severity: ${String(body.severity ?? "medium")}
Red flags: ${JSON.stringify(body.redFlags ?? [])}
Missing questions: ${JSON.stringify(body.missingQuestions ?? [])}
Follow-up: ${String(body.followUp ?? "")}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({ output: demoVisitCloseout, mode: "fallback" });
  }
}
