import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { demoScenarios, modelOptions } from "@/features/clinic/data";

export const runtime = "nodejs";

const commandPlanSchema = z.object({
  summary: z.string(),
  actions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("fill_intake"),
        patientName: z.string().optional(),
        age: z.string().optional(),
        sex: z.enum(["female", "male", "other", "unknown"]).optional(),
        intake: z.string().optional(),
      }),
      z.object({
        type: z.literal("load_scenario"),
        scenarioLabel: z.string(),
      }),
      z.object({ type: z.literal("generate_draft") }),
      z.object({
        type: z.literal("check_medicine"),
        medicines: z.string().optional(),
      }),
      z.object({
        type: z.literal("set_status"),
        status: z.enum(["handout", "followup"]),
      }),
      z.object({ type: z.literal("approve_case") }),
      z.object({
        type: z.literal("switch_language"),
        language: z.enum(["en", "bn"]),
      }),
      z.object({ type: z.literal("print_handout") }),
      z.object({
        type: z.literal("presentation_mode"),
        enabled: z.boolean(),
      }),
    ]),
  ),
});

export async function POST(request: Request) {
  const body = await request.json();
  const command = String(body.command ?? "").trim();
  const requestedModel = String(body.model ?? "env");

  if (command.length < 3) {
    return Response.json(
      { error: "Type a command for the clinic copilot." },
      { status: 400 },
    );
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ output: fallbackPlan(command), mode: "demo" });
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
      output: Output.object({ schema: commandPlanSchema }),
      temperature: 0,
      system:
        "You translate natural-language clinic operator commands into safe UI actions for Clinic Copilot BD. Only use these exact action type strings: fill_intake, load_scenario, generate_draft, check_medicine, set_status, approve_case, switch_language, print_handout, presentation_mode. For Bangla use switch_language with language bn. For scenarios use load_scenario with scenarioLabel. Never use language_switch, scenario_name, set_ui_mode, diagnosis, or prescribe actions. Keep the summary short.",
      prompt: `Available scenarios: ${demoScenarios.map((scenario) => scenario.label).join(", ")}

Command:
${command}`,
    });

    return Response.json({ output: result.output, mode: "live" });
  } catch {
    return Response.json({ output: fallbackPlan(command), mode: "fallback" });
  }
}

function fallbackPlan(command: string) {
  const normalized = command.toLowerCase();
  const actions = [];

  if (normalized.includes("bangla") || normalized.includes("বাংলা")) {
    actions.push({ type: "switch_language", language: "bn" });
  }
  if (normalized.includes("presentation")) {
    actions.push({ type: "presentation_mode", enabled: true });
  }
  if (normalized.includes("approve")) {
    actions.push({ type: "approve_case" });
  }
  if (normalized.includes("follow")) {
    actions.push({ type: "set_status", status: "followup" });
  }
  if (normalized.includes("medicine") || normalized.includes("med")) {
    actions.push({ type: "check_medicine" });
  }
  const scenario = demoScenarios.find((item) =>
    normalized.includes(item.label.toLowerCase().split(" ")[0]),
  );
  if (scenario) {
    actions.unshift({ type: "load_scenario", scenarioLabel: scenario.label });
  }
  if (normalized.includes("generate") || normalized.includes("draft")) {
    actions.push({ type: "generate_draft" });
  }

  if (actions.length > 0) {
    return {
      summary: "Running the requested clinic workflow actions.",
      actions,
    };
  }

  return {
    summary: "Filling intake with your instruction and generating a draft.",
    actions: [
      { type: "fill_intake", intake: command },
      { type: "generate_draft" },
    ],
  };
}
