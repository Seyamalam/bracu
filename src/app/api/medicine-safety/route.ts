import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoMedicineSafetyOutput, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const medicineSafetySchema = z.object({
  riskLevel: z.enum(["low", "medium", "high"]),
  issues: z.array(z.string()),
  clarifyingQuestions: z.array(z.string()),
  patientInstructions: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const medicines = String(body.medicines ?? "").trim();
  const caseSummary = String(body.caseSummary ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (medicines.length < 3) {
    return Response.json(
      { error: "Add at least one medicine or instruction to check." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: demoMedicineSafetyOutput, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const model =
    requestedModel !== "env" &&
    (allowedModels as readonly string[]).includes(requestedModel)
      ? requestedModel
      : (process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash");
  const result = await generateText({
    model: google(model),
    output: Output.object({ schema: medicineSafetySchema }),
    temperature: 0.1,
    system:
      "You are a medication safety documentation assistant. You never prescribe or approve medication. Identify unclear dose/frequency, allergy questions, duplicate categories, and patient-friendly safety instructions. Be concise and always tell clinicians to verify.",
    prompt: `Case summary:
${caseSummary || "No case summary provided."}

Medicine text to check:
${medicines}`,
  });

  return Response.json({ output: result.output, mode: "live" });
}
