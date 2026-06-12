import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
  agentCommandAliases,
  normalizeAgentCommand,
} from "@/features/clinic/agent-commands";
import { demoCopilotOutput } from "@/features/clinic/data";
import { buildPromptForProvider, hasAiProvider } from "@/lib/ai-provider";

const originalGoogleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const originalGoogleModel = process.env.GOOGLE_GENERATIVE_AI_MODEL;
const originalAiProvider = process.env.AI_PROVIDER;
const originalLmStudioEnabled = process.env.LMSTUDIO_ENABLED;
const originalLmStudioModel = process.env.LMSTUDIO_MODEL;

type RouteModule = {
  POST: (request: Request) => Promise<Response>;
};

type RouteCase = {
  body: Record<string, unknown>;
  mode?: "demo" | "fallback";
  name: string;
  outputKey?: string;
  path: string;
  validate?: (payload: Record<string, unknown>) => void;
};

function requestFor(path: string, body: Record<string, unknown>) {
  return new Request(`http://clinic.test${path}`, {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

async function postRoute(path: string, body: Record<string, unknown>) {
  const route = (await import(`../src/app${path}/route.ts`)) as RouteModule;
  const response = await route.POST(requestFor(path, body));
  const payload = (await response.json()) as Record<string, unknown>;
  return { payload, response };
}

const draft = demoCopilotOutput;
const intake =
  "Patient has fever for three days, body ache, poor appetite, and unknown allergy status.";

const routeCases: RouteCase[] = [
  {
    body: { draft, instruction: "Check signoff blockers." },
    name: "approval readiness",
    outputKey: "readiness",
    path: "/api/approval-check",
  },
  {
    body: { question: "What should reception ask next?", ...caseContext() },
    name: "case assistant",
    path: "/api/case-assistant",
    validate: (payload) => expect(typeof payload.answer).toBe("string"),
  },
  {
    body: { queueSummary: "Three waiting cases, one red-flag review." },
    name: "clinic briefing",
    outputKey: "headline",
    path: "/api/clinic-brief",
  },
  {
    body: { command: "Run the full clinic workflow in Bangla" },
    name: "command planner",
    outputKey: "actions",
    path: "/api/command",
    validate: (payload) => {
      const output = payload.output as { actions: { type: string }[] };
      expect(
        output.actions.some((action) => action.type === "run_full_workflow"),
      ).toBe(true);
      expect(
        output.actions.some((action) => action.type === "switch_language"),
      ).toBe(true);
    },
  },
  {
    body: { age: "29", intake, patientName: "Nusrat", sex: "female" },
    name: "copilot draft",
    outputKey: "summary",
    path: "/api/copilot",
  },
  {
    body: {
      documentText:
        "CBC report: platelet 110000, fever history. Prescription text says paracetamol 500 mg.",
    },
    name: "document extraction",
    outputKey: "intakeAddendum",
    path: "/api/document-extract",
  },
  {
    body: { draft, instruction: "Make the handout simpler." },
    name: "draft edit",
    outputKey: "patientHandout",
    path: "/api/draft-edit",
  },
  {
    body: {
      caseSummary: draft.summary,
      instruction: "Schedule a callback tomorrow.",
    },
    name: "follow-up plan",
    outputKey: "callbackScript",
    path: "/api/follow-up-plan",
  },
  {
    body: {
      caseSummary: draft.summary,
      channel: "sms",
      followUpMessage: draft.followUp.message,
      followUpTiming: draft.followUp.timing,
      patientName: "Nusrat",
    },
    name: "follow-up message",
    outputKey: "messageBn",
    path: "/api/follow-up",
    validate: (payload) => {
      const output = payload.output as { channel: string };
      expect(output.channel).toBe("sms");
    },
  },
  {
    body: { intake: "pt fever 3d, body ache, no sob, allergy unknown" },
    name: "intake cleanup",
    outputKey: "cleanedIntake",
    path: "/api/intake-cleanup",
  },
  {
    body: {
      caseSummary: draft.summary,
      medicines: "Paracetamol 500 mg twice daily",
    },
    name: "medicine safety",
    outputKey: "issues",
    path: "/api/medicine-safety",
  },
  {
    body: { caseSummary: draft.summary, currentStatus: "review" },
    name: "next steps",
    outputKey: "suggestedCommands",
    path: "/api/next-steps",
  },
  {
    body: {
      caseSummary: draft.summary,
      handoutSummary: draft.patientHandout.plainSummary,
      patientName: "Nusrat",
      question: "Can I take this medicine if fever returns?",
      redFlags: draft.redFlags,
    },
    name: "patient question",
    outputKey: "plainAnswerBn",
    path: "/api/patient-question",
  },
  {
    body: { caseSummary: draft.summary, documentType: "visit_summary" },
    name: "referral",
    outputKey: "clinicalSummary",
    path: "/api/referral",
    validate: (payload) => {
      const output = payload.output as { documentType: string };
      expect(output.documentType).toBe("visit_summary");
    },
  },
  {
    body: {
      caseSummary: draft.summary,
      replyText: "Fever came back and patient is very weak.",
    },
    name: "reply triage",
    outputKey: "replySummary",
    path: "/api/reply-triage",
  },
  {
    body: { caseSummary: draft.summary, instruction: "Explain for staff." },
    name: "risk explanation",
    outputKey: "plainReason",
    path: "/api/risk-explain",
  },
  {
    body: { caseSummary: draft.summary, instruction: "Make shift tasks." },
    name: "staff handoff",
    outputKey: "handoffScript",
    path: "/api/staff-handoff",
  },
  {
    body: {
      caseSummary: draft.summary,
      followUp: `${draft.followUp.timing}: ${draft.followUp.message}`,
      instruction: "Prepare final packet.",
      missingQuestions: draft.missingQuestions,
      patientName: "Nusrat",
      redFlags: draft.redFlags,
      severity: draft.severity,
    },
    name: "visit closeout",
    outputKey: "staffCloseoutSteps",
    path: "/api/visit-closeout",
  },
];

describe("AI and agent routes without provider keys", () => {
  beforeAll(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "";
    process.env.GOOGLE_GENERATIVE_AI_MODEL = "";
    process.env.AI_PROVIDER = "";
    process.env.LMSTUDIO_ENABLED = "";
    process.env.LMSTUDIO_MODEL = "";
  });

  afterAll(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalGoogleKey;
    process.env.GOOGLE_GENERATIVE_AI_MODEL = originalGoogleModel;
    process.env.AI_PROVIDER = originalAiProvider;
    process.env.LMSTUDIO_ENABLED = originalLmStudioEnabled;
    process.env.LMSTUDIO_MODEL = originalLmStudioModel;
  });

  for (const routeCase of routeCases) {
    test(`${routeCase.name} returns usable ${routeCase.mode ?? "demo"} output`, async () => {
      const { payload, response } = await postRoute(
        routeCase.path,
        routeCase.body,
      );

      expect(response.status).toBe(200);
      expect(payload.mode).toBe(routeCase.mode ?? "demo");

      if (routeCase.outputKey) {
        const output = payload.output as Record<string, unknown>;
        expect(typeof output).toBe("object");
        expect(output).not.toBeNull();
        expect(output[routeCase.outputKey]).toBeDefined();
      }

      routeCase.validate?.(payload);
    });
  }

  test("MCP workflow brief returns fallback content", async () => {
    const { payload, response } = await postRoute("/api/mcp", {
      id: "brief-1",
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        arguments: {
          intake,
          patientName: "Nusrat",
        },
        name: "clinic.workflow_brief",
      },
    });

    expect(response.status).toBe(200);
    const result = payload.result as {
      content: { text: string; type: string }[];
    };
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].text).toContain("Nusrat");
  });

  test("LM Studio can be enabled without a Google API key", () => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "";
    process.env.AI_PROVIDER = "lmstudio";

    expect(hasAiProvider()).toBe(true);

    process.env.AI_PROVIDER = "";
  });

  test("LM Studio prompt support folds system instructions into user prompt", () => {
    const prompt = buildPromptForProvider("lmstudio", {
      prompt: "Return JSON only.",
      system: "You are a safe clinic assistant.",
    });

    expect(prompt).toMatchObject({
      maxOutputTokens: 4096,
      maxRetries: 0,
      prompt:
        "Instructions:\nYou are a safe clinic assistant.\n\nReturn only valid JSON matching the requested schema. Do not wrap JSON in markdown. Do not add commentary outside JSON.\n\nTask:\nReturn JSON only.",
      timeout: 45_000,
    });
    expect("system" in prompt).toBe(false);
  });

  test("MCP tool registry exposes callable agent tools", async () => {
    const { payload, response } = await postRoute("/api/mcp", {
      id: "tools-1",
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        arguments: { role: "doctor" },
        name: "clinic.tools.list",
      },
    });

    expect(response.status).toBe(200);
    const result = payload.result as { content: { text: string }[] };
    const registry = JSON.parse(result.content[0].text) as { count: number };
    expect(registry.count).toBeGreaterThan(0);
  });

  test("MCP sync queue returns review status, not preview-only action", async () => {
    const { payload, response } = await postRoute("/api/mcp", {
      id: "sync-1",
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        arguments: {
          drafts: [
            {
              caseId: "case-1",
              content:
                "Reviewed follow-up draft with return warnings and owner.",
              owner: "follow-up desk",
            },
          ],
        },
        name: "clinic.sync.preview_queue",
      },
    });

    expect(response.status).toBe(200);
    const result = payload.result as { content: { text: string }[] };
    const body = JSON.parse(result.content[0].text) as {
      drafts: { requiresHumanReview: boolean; syncAction: string }[];
    };
    expect(body.drafts[0].syncAction).toBe("queued_for_review");
    expect(body.drafts[0].requiresHumanReview).toBe(true);
  });

  test.each([
    {
      command:
        "Plan next steps for this case and check approval readiness before print",
      expectedActions: ["plan_next_steps", "check_approval_readiness"],
    },
    {
      command:
        "Check if vitals, allergy, return warnings, and red flags are complete",
      expectedActions: ["check_approval_readiness", "explain_risk"],
      forbiddenActions: ["edit_draft"],
    },
    {
      command: "Load cardiac risk and generate a draft",
      expectedActions: ["load_scenario", "generate_draft"],
    },
    {
      command: "Run the full clinic workflow for pregnancy fever",
      expectedActions: ["run_full_workflow"],
    },
    {
      command:
        "Run the full clinic workflow for a judge demo with attached prescription, lab report, medicine safety, risk explanation, staff handoff, referral, follow-up WhatsApp, safe to print closeout, and queue brief",
      expectedActions: [
        "run_full_workflow",
        "extract_document",
        "check_medicine",
        "explain_risk",
        "compose_handoff",
        "compose_referral",
        "compose_followup",
        "close_visit",
        "compose_briefing",
      ],
    },
    {
      command:
        "Check medicine safety for paracetamol 500mg and antibiotic twice daily",
      expectedActions: ["check_medicine"],
    },
    {
      command: "Create a doctor summary for the chart",
      expectedActions: ["compose_referral"],
    },
    {
      command:
        "Prepare the print packet for handout, referral, medicines, and follow-up",
      expectedActions: ["close_visit", "compose_referral", "check_medicine"],
    },
    {
      command: "Move this patient to handout",
      expectedActions: ["set_status"],
    },
    {
      command: "Use Gemini model",
      expectedActions: ["set_model"],
      forbiddenActions: ["fill_intake", "generate_draft"],
    },
    {
      command: "Use local LM Studio model",
      expectedActions: ["set_model"],
      forbiddenActions: ["fill_intake", "generate_draft"],
    },
  ])(
    "agent command '$command' maps to concrete actions",
    async ({ command, expectedActions, forbiddenActions = [] }) => {
      const { payload, response } = await postRoute("/api/command", {
        command,
      });

      expect(response.status).toBe(200);
      const output = payload.output as { actions: { type: string }[] };
      const actionTypes = output.actions.map((action) => action.type);

      for (const expectedAction of expectedActions) {
        expect(actionTypes).toContain(expectedAction);
      }
      for (const forbiddenAction of forbiddenActions) {
        expect(actionTypes).not.toContain(forbiddenAction);
      }
      expect(actionTypes).not.toEqual(["fill_intake", "generate_draft"]);
    },
  );

  test.each([
    { alias: "auto_triage_case", expectedActions: ["plan_next_steps"] },
    { alias: "detect_missing_vitals", expectedActions: ["cleanup_intake"] },
    { alias: "detect_allergy_gap", expectedActions: ["check_medicine"] },
    {
      alias: "detect_pregnancy_child_chest_pain",
      expectedActions: ["explain_risk"],
    },
    { alias: "generate_staff_tasks", expectedActions: ["compose_handoff"] },
    {
      alias: "generate_patient_audio_script",
      expectedActions: ["answer_patient_question", "switch_language"],
    },
    { alias: "generate_pictogram_plan", expectedActions: ["edit_draft"] },
    {
      alias: "prepare_referral_packet",
      expectedActions: ["close_visit", "compose_referral", "check_medicine"],
    },
    {
      alias: "summarize_queue_pressure",
      expectedActions: ["compose_briefing"],
    },
    { alias: "predict_followup_risk", expectedActions: ["schedule_followup"] },
    { alias: "rewrite_for_low_literacy", expectedActions: ["edit_draft"] },
    {
      alias: "translate_bn_en",
      expectedActions: ["switch_language", "presentation_mode"],
    },
    {
      alias: "audit_case_safety",
      expectedActions: ["check_approval_readiness", "explain_risk"],
    },
    { alias: "compare_before_after_draft", expectedActions: ["edit_draft"] },
    {
      alias: "recommend_next_agent_action",
      expectedActions: ["plan_next_steps"],
    },
  ])(
    "named agent tool '$alias' normalizes to concrete actions",
    async ({ alias, expectedActions }) => {
      const normalizedCommand = normalizeAgentCommand(alias);
      expect(normalizedCommand).toBe(agentCommandAliases[alias]);

      const { payload, response } = await postRoute("/api/command", {
        command: normalizedCommand,
      });

      expect(response.status).toBe(200);
      const output = payload.output as { actions: { type: string }[] };
      const actionTypes = output.actions.map((action) => action.type);

      for (const expectedAction of expectedActions) {
        expect(actionTypes).toContain(expectedAction);
      }
      expect(actionTypes).not.toEqual(["fill_intake", "generate_draft"]);
    },
  );
});

function caseContext() {
  return {
    caseSummary: draft.summary,
    patientHandout: draft.patientHandout.plainSummary,
  };
}
