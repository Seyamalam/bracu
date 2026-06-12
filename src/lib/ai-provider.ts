import { google } from "@ai-sdk/google";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

type PromptParts = {
  system: string;
  prompt: string;
};

type AiProvider = "google" | "lmstudio";

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
  if (requestedModel === "lmstudio") {
    return {
      model: lmStudio(process.env.LMSTUDIO_MODEL ?? "google/gemma-4-12b"),
      provider: "lmstudio",
    } as const;
  }

  if (requestedModel !== "env" && allowedModels.includes(requestedModel)) {
    return { model: google(requestedModel), provider: "google" } as const;
  }

  if (
    process.env.LMSTUDIO_ENABLED === "1" ||
    process.env.AI_PROVIDER === "lmstudio"
  ) {
    return {
      model: lmStudio(process.env.LMSTUDIO_MODEL ?? "google/gemma-4-12b"),
      provider: "lmstudio",
    } as const;
  }

  const model = process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash";

  return { model: google(model), provider: "google" } as const;
}

export function getAiProviderLabel(provider: AiProvider) {
  if (provider === "lmstudio") {
    return `LM Studio (${process.env.LMSTUDIO_MODEL ?? "google/gemma-4-12b"})`;
  }

  return `Google Gemini (${process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash"})`;
}

export function buildPromptForProvider(
  provider: AiProvider,
  { system, prompt }: PromptParts,
) {
  if (provider === "lmstudio") {
    return {
      maxOutputTokens: Number(process.env.LMSTUDIO_MAX_OUTPUT_TOKENS ?? 4096),
      maxRetries: 0,
      timeout: Number(process.env.LMSTUDIO_TIMEOUT_MS ?? 45_000),
      prompt: `Instructions:
${system}

Return only valid JSON matching the requested schema. Do not wrap JSON in markdown. Do not add commentary outside JSON.

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

export function describeAiProviderError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "The AI provider request failed before a response could be generated.";
}

export function aiProviderErrorResponse(
  scope: string,
  provider: AiProvider,
  error: unknown,
) {
  const detail = describeAiProviderError(error);
  logAiProviderError(scope, error);

  return Response.json(
    {
      detail,
      error: "AI provider request failed.",
      provider: getAiProviderLabel(provider),
    },
    { status: 502 },
  );
}
