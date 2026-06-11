import { generateText, Output } from "ai";
import { z } from "zod";
import { demoIntakeCleanupOutput, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

export const runtime = "nodejs";

const intakeCleanupSchema = z.object({
  patientName: z.string().optional(),
  age: z.string().optional(),
  sex: z.enum(["female", "male", "other", "unknown"]).optional(),
  cleanedIntake: z.string(),
  extractedVitals: z.array(z.string()),
  extractedMedicines: z.array(z.string()),
  possibleRedFlags: z.array(z.string()),
  missingInfo: z.array(z.string()),
  languageDetected: z.enum(["bn", "en", "mixed"]),
});

export async function POST(request: Request) {
  const body = await request.json();
  const intake = String(body.intake ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (intake.length < 8) {
    return Response.json(
      { error: "Add messy notes, lab text, or prescription text first." },
      { status: 400 },
    );
  }

  if (!hasAiProvider()) {
    return Response.json({ output: demoIntakeCleanupOutput, mode: "demo" });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: intakeCleanupSchema }),
      temperature: 0.1,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You clean messy primary-care intake notes for Clinic Copilot BD. Extract patient name, age, sex, vitals, medicines, red-flag possibilities, and missing information when present. Do not diagnose or prescribe. Preserve uncertainty and make the cleaned intake concise for a clinician to review.",
        prompt: `Messy intake, lab text, prescription text, or reception note:
${intake}`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/intake-cleanup", error);
    return Response.json({ output: fallbackCleanup(intake), mode: "fallback" });
  }
}

function fallbackCleanup(intake: string) {
  return {
    ...demoIntakeCleanupOutput,
    cleanedIntake: intake
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n"),
  };
}
