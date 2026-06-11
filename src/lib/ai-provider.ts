import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type PromptParts = {
  system: string;
  prompt: string;
};

const lmStudio = createOpenAICompatible({
  name: "lmstudio",
  baseURL: process.env.LMSTUDIO_BASE_URL ?? "http://127.0.0.1:1234/v1",
  supportsStructuredOutputs: true,
});

export function hasAiProvider() {
  return Boolean(
    process.env.LMSTUDIO_ENABLED === "1" ||
      process.env.AI_PROVIDER === "lmstudio" ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  );
}

export function resolveAiModel(
  requestedModel: string,
  allowedModels: string[],
) {
  if (
    process.env.LMSTUDIO_ENABLED === "1" ||
    process.env.AI_PROVIDER === "lmstudio"
  ) {
    return {
      model: lmStudio(process.env.LMSTUDIO_MODEL ?? "google/gemma-4-12b"),
      provider: "lmstudio",
    } as const;
  }

  const model =
    requestedModel !== "env" && allowedModels.includes(requestedModel)
      ? requestedModel
      : (process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash");

  return { model: google(model), provider: "google" } as const;
}

export function buildPromptForProvider(
  provider: "google" | "lmstudio",
  { system, prompt }: PromptParts,
) {
  if (provider === "lmstudio") {
    return {
      maxOutputTokens: Number(process.env.LMSTUDIO_MAX_OUTPUT_TOKENS ?? 4096),
      maxRetries: 0,
      timeout: Number(process.env.LMSTUDIO_TIMEOUT_MS ?? 45_000),
      prompt: `Instructions:
${system}

Task:
${prompt}`,
    };
  }

  return { system, prompt };
}

export function logAiProviderError(scope: string, error: unknown) {
  if (process.env.AI_DEBUG_ERRORS !== "1") {
    return;
  }

  console.error(`[${scope}] AI provider error`, error);
}
