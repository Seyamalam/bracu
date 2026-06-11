import { generateText, Output } from "ai";
import { z } from "zod";
import { demoCopilotOutput, modelOptions } from "@/features/clinic/data";
import {
  buildPromptForProvider,
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
  const instruction = String(body.instruction ?? "").trim();
  const draftResult = copilotSchema.safeParse(body.draft ?? demoCopilotOutput);
  const requestedModel = String(body.model ?? "env");

  if (instruction.length < 4) {
    return Response.json(
      { error: "Describe how to edit the selected draft." },
      { status: 400 },
    );
  }

  if (!draftResult.success) {
    return Response.json(
      { error: "Select or generate a valid draft before editing." },
      { status: 400 },
    );
  }

  const draft = draftResult.data;

  if (!hasAiProvider()) {
    return Response.json({
      output: fallbackDraftEdit(draft, instruction),
      mode: "demo",
    });
  }

  const allowedModels = modelOptions.map((option) => option.value);
  const resolvedModel = resolveAiModel(requestedModel, allowedModels);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: copilotSchema }),
      temperature: 0.1,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You safely edit an existing Clinic Copilot BD clinical documentation draft. Preserve the exact schema. Follow the user's edit instruction only when it improves documentation, missing questions, patient explanation, follow-up wording, or safety-net language. Do not diagnose, prescribe, remove clinician-review language, or invent certainty. If asked to simplify, make patient-facing wording clearer in Bangla and English as appropriate.",
        prompt: `Edit instruction:
${instruction}

Current draft JSON:
${JSON.stringify(draft)}`,
      }),
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch (error) {
    logAiProviderError("api/draft-edit", error);
    return Response.json({
      output: fallbackDraftEdit(draft, instruction),
      mode: "fallback",
    });
  }
}

function fallbackDraftEdit(
  draft: z.infer<typeof copilotSchema>,
  instruction: string,
) {
  const normalized = instruction.toLowerCase();
  const nextDraft = structuredClone(draft);

  if (
    normalized.includes("red flag") ||
    normalized.includes("bleeding") ||
    normalized.includes("danger")
  ) {
    nextDraft.redFlags = uniqueList([
      ...nextDraft.redFlags,
      "Return urgently for bleeding, fainting, breathing difficulty, chest pain, confusion, severe dehydration, or symptoms that are rapidly worsening.",
    ]);
    nextDraft.patientHandout.urgentReturnWarnings = uniqueList([
      ...nextDraft.patientHandout.urgentReturnWarnings,
      "রক্তপাত, অজ্ঞানভাব, শ্বাসকষ্ট, বুকব্যথা, প্রস্রাব কমে যাওয়া, বা দ্রুত অবস্থা খারাপ হলে জরুরি চিকিৎসা নিন।",
    ]);
  }

  if (
    normalized.includes("question") ||
    normalized.includes("ask") ||
    normalized.includes("missing")
  ) {
    nextDraft.missingQuestions = uniqueList([
      ...nextDraft.missingQuestions,
      "Ask when symptoms started, what changed today, current medicines, allergies, pregnancy status, and whether any danger sign is present.",
    ]);
  }

  if (
    normalized.includes("bangla") ||
    normalized.includes("simple") ||
    normalized.includes("handout")
  ) {
    nextDraft.patientHandout.plainSummary =
      "আপনার লক্ষণগুলো ডাক্তার রিভিউ করবেন। পানি পান করুন, বিশ্রাম নিন, এবং ডাক্তারের অনুমতি ছাড়া নতুন ওষুধ শুরু করবেন না। বিপদজনক লক্ষণ দেখা দিলে দ্রুত ক্লিনিক বা ইমার্জেন্সিতে যোগাযোগ করুন।";
    nextDraft.patientHandout.careSteps = uniqueList([
      "পর্যাপ্ত পানি পান করুন।",
      "লক্ষণ বাড়ছে কিনা খেয়াল করুন।",
      "ডাক্তারের নির্দেশনা ছাড়া অ্যান্টিবায়োটিক বা নতুন ওষুধ শুরু করবেন না।",
      ...nextDraft.patientHandout.careSteps,
    ]);
  }

  nextDraft.summary = `${nextDraft.summary} Edited note: ${instruction}`;
  nextDraft.doctorChecklist = uniqueList([
    ...nextDraft.doctorChecklist,
    "Clinician should review the AI-edited draft before sharing or storing it.",
  ]);

  return nextDraft;
}

function uniqueList(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}
