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
      z.object({
        type: z.literal("search_cases"),
        query: z.string(),
      }),
      z.object({
        type: z.literal("filter_cases"),
        status: z
          .enum(["all", "waiting", "review", "handout", "followup"])
          .optional(),
        severity: z.enum(["all", "low", "medium", "high"]).optional(),
      }),
      z.object({
        type: z.literal("select_case"),
        patientName: z.string(),
      }),
      z.object({
        type: z.literal("set_model"),
        model: z.enum(["gemini-2.5-flash", "gemini-2.5-flash-lite", "env"]),
      }),
      z.object({
        type: z.literal("reset_workspace"),
        scope: z.enum(["filters", "intake", "all"]),
      }),
      z.object({
        type: z.literal("run_judge_demo"),
        scenarioLabel: z.string().optional(),
      }),
      z.object({
        type: z.literal("compose_followup"),
        channel: z.enum(["sms", "whatsapp"]),
      }),
      z.object({
        type: z.literal("edit_draft"),
        instruction: z.string(),
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
        "You translate natural-language clinic operator commands into safe UI actions for Clinic Copilot BD. Only use these exact action type strings: fill_intake, load_scenario, generate_draft, check_medicine, set_status, approve_case, switch_language, print_handout, presentation_mode, search_cases, filter_cases, select_case, set_model, reset_workspace, run_judge_demo, compose_followup, edit_draft. For Bangla use switch_language with language bn. For scenarios use load_scenario with scenarioLabel. For a request to run a judge demo, winning demo, pitch flow, or full demo, prefer run_judge_demo. For SMS, WhatsApp, callback, or patient follow-up message requests use compose_followup. For commands that ask to change, rewrite, simplify, add, remove, improve, or edit the selected generated clinical note or handout, use edit_draft with the original command as instruction. Never use language_switch, scenario_name, set_ui_mode, diagnosis, or prescribe actions. Keep the summary short.",
      prompt: `Available scenarios: ${demoScenarios.map((scenario) => scenario.label).join(", ")}

Command:
${command}`,
    });

    return Response.json({ output: sanitizePlan(result.output), mode: "live" });
  } catch {
    return Response.json({ output: fallbackPlan(command), mode: "fallback" });
  }
}

function sanitizePlan(plan: z.infer<typeof commandPlanSchema>) {
  const seenSingleRunActions = new Set<string>();
  const actions = plan.actions.filter((action) => {
    if (
      !["edit_draft", "run_judge_demo", "compose_followup"].includes(
        action.type,
      )
    ) {
      return true;
    }

    if (seenSingleRunActions.has(action.type)) {
      return false;
    }
    seenSingleRunActions.add(action.type);
    return true;
  });

  return { ...plan, actions };
}

function fallbackPlan(command: string) {
  const normalized = command.toLowerCase();
  const actions = [];

  if (
    normalized.includes("judge demo") ||
    normalized.includes("winning demo") ||
    normalized.includes("pitch flow") ||
    normalized.includes("full demo")
  ) {
    actions.push({ type: "run_judge_demo", scenarioLabel: "Pregnancy fever" });
  }
  if (normalized.includes("bangla") || normalized.includes("বাংলা")) {
    actions.push({ type: "switch_language", language: "bn" });
  }
  if (
    normalized.includes("fastest model") ||
    normalized.includes("flash lite") ||
    normalized.includes("low cost")
  ) {
    actions.push({ type: "set_model", model: "gemini-2.5-flash-lite" });
  }
  if (
    normalized.includes("best model") ||
    normalized.includes("flash model") ||
    normalized.includes("balanced model")
  ) {
    actions.push({ type: "set_model", model: "gemini-2.5-flash" });
  }
  if (normalized.includes("presentation")) {
    actions.push({ type: "presentation_mode", enabled: true });
  }
  if (normalized.includes("search")) {
    const query = command
      .replace(/search for/i, "")
      .replace(/search/i, "")
      .replace(/show high priority cases/i, "")
      .trim();
    actions.push({ type: "search_cases", query: query || command });
  }
  if (
    normalized.includes("high priority") ||
    normalized.includes("high risk")
  ) {
    actions.push({ type: "filter_cases", severity: "high" });
  }
  if (normalized.includes("medium priority")) {
    actions.push({ type: "filter_cases", severity: "medium" });
  }
  if (normalized.includes("low priority")) {
    actions.push({ type: "filter_cases", severity: "low" });
  }
  if (
    normalized.includes("clear filter") ||
    normalized.includes("reset filter") ||
    normalized.includes("all cases")
  ) {
    actions.push({ type: "filter_cases", severity: "all", status: "all" });
    actions.push({ type: "reset_workspace", scope: "filters" });
  }
  if (
    normalized.includes("reset intake") ||
    normalized.includes("clear form")
  ) {
    actions.push({ type: "reset_workspace", scope: "intake" });
  }
  if (normalized.includes("approve")) {
    actions.push({ type: "approve_case" });
  }
  if (normalized.includes("follow")) {
    actions.push({ type: "set_status", status: "followup" });
  }
  if (
    normalized.includes("whatsapp") ||
    normalized.includes("sms") ||
    normalized.includes("callback") ||
    normalized.includes("follow-up message") ||
    normalized.includes("follow up message")
  ) {
    actions.push({
      type: "compose_followup",
      channel: normalized.includes("sms") ? "sms" : "whatsapp",
    });
  }
  if (
    normalized.includes("edit") ||
    normalized.includes("rewrite") ||
    normalized.includes("simplify") ||
    normalized.includes("red flag") ||
    normalized.includes("add a red flag") ||
    normalized.includes("add red flag") ||
    normalized.includes("add a question") ||
    normalized.includes("improve handout")
  ) {
    actions.push({ type: "edit_draft", instruction: command });
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
