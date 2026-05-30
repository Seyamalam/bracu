import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  demoDocumentExtractionOutput,
  modelOptions,
} from "@/features/clinic/data";

export const runtime = "nodejs";

const documentExtractionSchema = z.object({
  documentType: z.enum(["prescription", "lab_report", "mixed", "unknown"]),
  confidence: z.enum(["low", "medium", "high"]),
  extractedVitals: z.array(z.string()),
  extractedLabs: z.array(z.string()),
  extractedMedicines: z.array(z.string()),
  possibleSafetyIssues: z.array(z.string()),
  missingClarifications: z.array(z.string()),
  intakeAddendum: z.string(),
  suggestedCommands: z.array(z.string()),
});

export async function POST(request: Request) {
  const body = await request.json();
  const documentText = String(body.documentText ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (documentText.length < 8) {
    return Response.json(
      { error: "Paste or attach lab, prescription, or OCR text first." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({
      output: demoDocumentExtractionOutput,
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
      output: Output.object({ schema: documentExtractionSchema }),
      temperature: 0.1,
      system:
        "You extract structured facts from clinic prescription, lab report, OCR, or attached document text for Clinic Copilot BD. Do not diagnose, prescribe, or invent values. Preserve uncertainty. Extract vitals, lab values with units when present, medicines with dose/frequency when present, safety issues, clarifications, a concise intake addendum, and short suggested Clinic Copilot commands.",
      prompt: `Attached clinic document text:
${documentText}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({
      output: fallbackExtraction(documentText),
      mode: "fallback",
    });
  }
}

function fallbackExtraction(documentText: string) {
  return {
    ...demoDocumentExtractionOutput,
    intakeAddendum: `Attached document text for clinician review:\n${documentText.slice(0, 900)}`,
  };
}
