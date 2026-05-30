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
        type: z.literal("run_full_workflow"),
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
      z.object({
        type: z.literal("compose_referral"),
        documentType: z.enum(["referral", "visit_summary"]),
      }),
      z.object({ type: z.literal("compose_briefing") }),
      z.object({ type: z.literal("cleanup_intake") }),
      z.object({ type: z.literal("explain_risk") }),
      z.object({ type: z.literal("compose_handoff") }),
      z.object({ type: z.literal("plan_next_steps") }),
      z.object({
        type: z.literal("extract_document"),
        documentText: z.string().optional(),
      }),
      z.object({
        type: z.literal("triage_reply"),
        replyText: z.string().optional(),
      }),
      z.object({ type: z.literal("schedule_followup") }),
      z.object({
        type: z.literal("answer_patient_question"),
        question: z.string().optional(),
      }),
      z.object({ type: z.literal("check_approval_readiness") }),
      z.object({ type: z.literal("close_visit") }),
      z.object({ type: z.literal("undo_last_command") }),
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
        "You translate natural-language clinic operator commands into safe UI actions for Clinic Copilot BD. Only use these exact action type strings: fill_intake, load_scenario, generate_draft, check_medicine, set_status, approve_case, switch_language, print_handout, presentation_mode, search_cases, filter_cases, select_case, set_model, reset_workspace, run_judge_demo, run_full_workflow, compose_followup, edit_draft, compose_referral, compose_briefing, cleanup_intake, explain_risk, compose_handoff, plan_next_steps, extract_document, triage_reply, schedule_followup, answer_patient_question, check_approval_readiness, close_visit, undo_last_command. For undo, revert, go back, restore previous state, cancel last command, or undo last command requests use only undo_last_command. For Bangla use switch_language with language bn. For scenarios use load_scenario with scenarioLabel. For a request to run everything, full workflow, full clinic workflow, complete workflow, winning clinic workflow, or end-to-end demo, use run_full_workflow. For a request to run only a judge demo, winning demo, or pitch flow, use run_judge_demo. For close visit, finish visit, discharge packet, final packet, wrap up case, checkout, ready to leave, or visit closeout requests use close_visit. For approval readiness, ready to approve, safe to approve, signoff check, approval check, ready to print, or before approve requests use check_approval_readiness. For SMS, WhatsApp, callback, or patient follow-up message requests use compose_followup. For schedule follow-up, plan callback, callback schedule, reminder plan, close the loop, follow-up plan, or due follow-up workflow requests use schedule_followup. For patient question, family question, answer patient, explain to patient, can I take, can patient take, or medicine question requests use answer_patient_question and put the exact patient/family question text in question when present. For patient reply, incoming WhatsApp reply, response from patient, triage reply, callback reply, or follow-up response requests use triage_reply and put the exact reply text in replyText when present. For lab report, prescription, attached document, OCR, photo text, extract report, extract prescription, medicine list from document, or parse document requests use extract_document and put the exact document/OCR/report text in documentText when present. For referral letter, referral note, paperwork, family visit summary, or visit summary requests use compose_referral. For staff handoff, nurse handoff, doctor handoff, receptionist tasks, team task list, handover tasks, shift handoff, or workflow assignment requests use compose_handoff. For next steps for the selected case, what should I do next for this patient, recommended commands, command suggestions, action plan for this case, or guide me through this case use plan_next_steps. For clinic briefing, queue briefing, daily summary, today's clinic, priorities, or operational summary requests use compose_briefing. For messy notes, clean intake, extract vitals, normalize intake, or receptionist cleanup requests use cleanup_intake. For explain risk, why high/medium/low priority, safety rationale, evidence, uncertainty, or why this is risky requests use explain_risk. For commands that ask to change, rewrite, simplify, add, remove, improve, or edit the selected generated clinical note or handout, use edit_draft with the original command as instruction. Never use language_switch, scenario_name, set_ui_mode, diagnosis, or prescribe actions. Keep the summary short.",
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
      ![
        "edit_draft",
        "run_judge_demo",
        "run_full_workflow",
        "compose_followup",
        "compose_referral",
        "compose_briefing",
        "cleanup_intake",
        "explain_risk",
        "compose_handoff",
        "plan_next_steps",
        "extract_document",
        "triage_reply",
        "schedule_followup",
        "answer_patient_question",
        "check_approval_readiness",
        "close_visit",
        "undo_last_command",
      ].includes(action.type)
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
    normalized.includes("undo") ||
    normalized.includes("go back") ||
    normalized.includes("revert") ||
    normalized.includes("restore previous") ||
    normalized.includes("cancel last command")
  ) {
    return {
      summary: "Restoring the previous workspace state.",
      actions: [{ type: "undo_last_command" }],
    };
  }

  if (
    normalized.includes("run everything") ||
    normalized.includes("do everything") ||
    normalized.includes("full workflow") ||
    normalized.includes("full clinic workflow") ||
    normalized.includes("complete workflow") ||
    normalized.includes("winning clinic workflow") ||
    normalized.includes("end-to-end demo") ||
    normalized.includes("end to end demo")
  ) {
    actions.push({
      type: "run_full_workflow",
      scenarioLabel: "Pregnancy fever",
    });
  } else if (
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
  const asksForApprovalReadiness =
    normalized.includes("ready to approve") ||
    normalized.includes("safe to approve") ||
    normalized.includes("approval check") ||
    normalized.includes("signoff check") ||
    normalized.includes("ready to print") ||
    normalized.includes("before approve");

  if (normalized.includes("approve") && !asksForApprovalReadiness) {
    actions.push({ type: "approve_case" });
  }
  if (asksForApprovalReadiness) {
    actions.push({ type: "check_approval_readiness" });
  }
  if (
    normalized.includes("close visit") ||
    normalized.includes("finish visit") ||
    normalized.includes("discharge packet") ||
    normalized.includes("final packet") ||
    normalized.includes("wrap up") ||
    normalized.includes("checkout") ||
    normalized.includes("ready to leave") ||
    normalized.includes("visit closeout")
  ) {
    actions.push({ type: "close_visit" });
  }
  if (normalized.includes("follow")) {
    actions.push({ type: "set_status", status: "followup" });
  }
  if (
    normalized.includes("schedule follow") ||
    normalized.includes("follow-up plan") ||
    normalized.includes("follow up plan") ||
    normalized.includes("plan callback") ||
    normalized.includes("callback schedule") ||
    normalized.includes("reminder plan") ||
    normalized.includes("close the loop") ||
    normalized.includes("due follow-up")
  ) {
    actions.push({ type: "schedule_followup" });
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
    normalized.includes("triage reply") ||
    normalized.includes("patient reply") ||
    normalized.includes("patient response") ||
    normalized.includes("follow-up response") ||
    normalized.includes("follow up response") ||
    normalized.includes("callback reply") ||
    normalized.includes("incoming whatsapp")
  ) {
    actions.push({
      type: "triage_reply",
      replyText: extractPayload(command),
    });
  }
  if (
    normalized.includes("patient question") ||
    normalized.includes("family question") ||
    normalized.includes("answer patient") ||
    normalized.includes("explain to patient") ||
    normalized.includes("can i take") ||
    normalized.includes("can patient take") ||
    normalized.includes("medicine question")
  ) {
    actions.push({
      type: "answer_patient_question",
      question: extractPayload(command),
    });
  }
  if (
    normalized.includes("referral") ||
    normalized.includes("paperwork") ||
    normalized.includes("visit summary") ||
    normalized.includes("family summary")
  ) {
    actions.push({
      type: "compose_referral",
      documentType:
        normalized.includes("summary") || normalized.includes("family")
          ? "visit_summary"
          : "referral",
    });
  }
  if (
    normalized.includes("handoff") ||
    normalized.includes("handover") ||
    normalized.includes("nurse task") ||
    normalized.includes("doctor task") ||
    normalized.includes("receptionist task") ||
    normalized.includes("team task") ||
    normalized.includes("shift handoff")
  ) {
    actions.push({ type: "compose_handoff" });
  }
  if (
    normalized.includes("brief") ||
    normalized.includes("clinic queue") ||
    normalized.includes("today's clinic") ||
    normalized.includes("todays clinic") ||
    normalized.includes("daily summary") ||
    normalized.includes("operational summary") ||
    normalized.includes("what to do next")
  ) {
    actions.push({ type: "compose_briefing" });
  }
  if (
    normalized.includes("next step") ||
    normalized.includes("what should i do next") ||
    normalized.includes("what to do next for this") ||
    normalized.includes("guide me through") ||
    normalized.includes("recommended command") ||
    normalized.includes("command suggestion") ||
    normalized.includes("action plan for this case")
  ) {
    actions.push({ type: "plan_next_steps" });
  }
  if (
    normalized.includes("extract document") ||
    normalized.includes("parse document") ||
    normalized.includes("attached document") ||
    normalized.includes("lab report") ||
    normalized.includes("prescription") ||
    normalized.includes("extract report") ||
    normalized.includes("extract prescription") ||
    normalized.includes("photo text")
  ) {
    actions.push({
      type: "extract_document",
      documentText: extractPayload(command),
    });
  }
  if (
    normalized.includes("clean intake") ||
    normalized.includes("cleanup intake") ||
    normalized.includes("normalize intake") ||
    normalized.includes("extract vitals") ||
    normalized.includes("messy notes") ||
    normalized.includes("ocr")
  ) {
    actions.push({ type: "cleanup_intake" });
  }
  if (
    normalized.includes("explain risk") ||
    normalized.includes("why risky") ||
    normalized.includes("why this is risky") ||
    normalized.includes("why high") ||
    normalized.includes("why medium") ||
    normalized.includes("safety rationale") ||
    normalized.includes("risk rationale") ||
    normalized.includes("evidence") ||
    normalized.includes("uncertainty")
  ) {
    actions.push({ type: "explain_risk" });
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

function extractPayload(command: string) {
  const colonIndex = command.indexOf(":");
  const payload = colonIndex >= 0 ? command.slice(colonIndex + 1) : "";
  return payload?.trim() || undefined;
}
