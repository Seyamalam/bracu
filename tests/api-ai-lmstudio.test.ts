import { afterAll, beforeAll, describe, expect, test } from "bun:test";

const runLmStudioTests = process.env.RUN_LMSTUDIO_TESTS === "1";
const describeLmStudio = runLmStudioTests ? describe : describe.skip;

const originalGoogleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const originalAiProvider = process.env.AI_PROVIDER;
const originalLmStudioModel = process.env.LMSTUDIO_MODEL;

type RouteModule = {
  POST: (request: Request) => Promise<Response>;
};

type RouteCase = {
  body: Record<string, unknown>;
  expectMode?: boolean;
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

const localDraft = {
  chiefComplaint: "Fever and body ache",
  doctorChecklist: ["Check vitals", "Confirm allergy details"],
  followUp: {
    message: "Return if fever persists or danger signs appear.",
    timing: "24 hours",
  },
  languageDetected: "en",
  missingQuestions: ["pregnancy status", "temperature", "allergy details"],
  patientHandout: {
    careSteps: ["Drink fluids", "Rest", "Return for danger signs"],
    medicineInstructions: ["Use medicines only as clinician approved"],
    plainSummary: "Fever for three days needs clinician review.",
    title: "Fever care",
    urgentReturnWarnings: ["Breathing trouble", "Chest pain", "Fainting"],
  },
  redFlags: ["allergy unknown"],
  severity: "medium",
  soap: {
    assessmentSupport: "Fever requires clinician assessment.",
    objective: "Vitals not documented.",
    planSupport: "Review vitals and safety net.",
    subjective: "Fever and body ache for three days.",
  },
  summary: "Adult fever for three days with body ache and unknown allergy.",
};
const intake =
  "Patient has fever for three days, body ache, poor appetite, and unknown allergy status.";

const routeCases: RouteCase[] = [
  {
    body: { draft: localDraft, instruction: "Check signoff blockers." },
    name: "approval readiness",
    outputKey: "readiness",
    path: "/api/approval-check",
  },
  {
    body: {
      ...caseContext(),
      question: "What should reception ask next?",
    },
    name: "case assistant",
    path: "/api/case-assistant",
    validate: (payload) => expect(typeof payload.answer).toBe("string"),
  },
  {
    body: {
      cases: [
        {
          age: 29,
          chiefComplaint: "Fever",
          language: "en",
          patientName: "Nusrat",
          redFlagCount: 1,
          severity: "medium",
          status: "review",
        },
      ],
      clinicName: "Demo Clinic",
    },
    name: "clinic briefing",
    outputKey: "headline",
    path: "/api/clinic-brief",
  },
  {
    body: { command: "Run the full clinic workflow in Bangla" },
    name: "command planner",
    outputKey: "actions",
    path: "/api/command",
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
    body: { draft: localDraft, instruction: "Make the handout simpler." },
    name: "draft edit",
    outputKey: "patientHandout",
    path: "/api/draft-edit",
  },
  {
    body: {
      caseSummary: localDraft.summary,
      instruction: "Schedule a callback tomorrow.",
    },
    name: "follow-up plan",
    outputKey: "callbackScript",
    path: "/api/follow-up-plan",
  },
  {
    body: {
      caseSummary: localDraft.summary,
      channel: "sms",
      followUpMessage: localDraft.followUp.message,
      followUpTiming: localDraft.followUp.timing,
      patientName: "Nusrat",
    },
    name: "follow-up message",
    outputKey: "messageBn",
    path: "/api/follow-up",
  },
  {
    body: { intake: "pt fever 3d, body ache, no sob, allergy unknown" },
    name: "intake cleanup",
    outputKey: "cleanedIntake",
    path: "/api/intake-cleanup",
  },
  {
    body: {
      caseSummary: localDraft.summary,
      medicines: "Paracetamol 500 mg twice daily",
    },
    name: "medicine safety",
    outputKey: "issues",
    path: "/api/medicine-safety",
  },
  {
    body: { caseSummary: localDraft.summary, currentStatus: "review" },
    name: "next steps",
    outputKey: "suggestedCommands",
    path: "/api/next-steps",
  },
  {
    body: {
      caseSummary: localDraft.summary,
      handoutSummary: localDraft.patientHandout.plainSummary,
      patientName: "Nusrat",
      question: "Can I take this medicine if fever returns?",
      redFlags: localDraft.redFlags,
    },
    name: "patient question",
    outputKey: "plainAnswerBn",
    path: "/api/patient-question",
  },
  {
    body: { caseSummary: localDraft.summary, documentType: "visit_summary" },
    name: "referral",
    outputKey: "clinicalSummary",
    path: "/api/referral",
  },
  {
    body: {
      caseSummary: localDraft.summary,
      replyText: "Fever came back and patient is very weak.",
    },
    name: "reply triage",
    outputKey: "replySummary",
    path: "/api/reply-triage",
  },
  {
    body: {
      caseSummary: localDraft.summary,
      instruction: "Explain for staff.",
    },
    name: "risk explanation",
    outputKey: "plainReason",
    path: "/api/risk-explain",
  },
  {
    body: { caseSummary: localDraft.summary, instruction: "Make shift tasks." },
    name: "staff handoff",
    outputKey: "handoffScript",
    path: "/api/staff-handoff",
  },
  {
    body: {
      caseSummary: localDraft.summary,
      followUp: `${localDraft.followUp.timing}: ${localDraft.followUp.message}`,
      instruction: "Prepare final packet.",
      missingQuestions: localDraft.missingQuestions,
      patientName: "Nusrat",
      redFlags: localDraft.redFlags,
      severity: localDraft.severity,
    },
    name: "visit closeout",
    outputKey: "staffCloseoutSteps",
    path: "/api/visit-closeout",
  },
];

describeLmStudio("AI routes with LM Studio provider", () => {
  beforeAll(async () => {
    const response = await fetch("http://127.0.0.1:1234/v1/models");
    expect(response.status).toBe(200);

    process.env.GOOGLE_GENERATIVE_AI_API_KEY = "";
    process.env.AI_PROVIDER = "lmstudio";
    process.env.LMSTUDIO_MODEL =
      process.env.LMSTUDIO_MODEL || "google/gemma-4-12b";
  });

  afterAll(() => {
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = originalGoogleKey;
    process.env.AI_PROVIDER = originalAiProvider;
    process.env.LMSTUDIO_MODEL = originalLmStudioModel;
  });

  for (const routeCase of routeCases) {
    test(`${routeCase.name} returns local-provider output`, async () => {
      const { payload, response } = await postRoute(
        routeCase.path,
        routeCase.body,
      );

      expect(response.status).toBe(200);
      expect(["live", "fallback"]).toContain(payload.mode);
      console.info(`${routeCase.name}: ${payload.mode}`);

      if (routeCase.outputKey) {
        const output = payload.output as Record<string, unknown>;
        expect(typeof output).toBe("object");
        expect(output).not.toBeNull();
        expect(output[routeCase.outputKey]).toBeDefined();
      }

      routeCase.validate?.(payload);
    }, 60_000);
  }

  test("MCP workflow brief returns local-provider output", async () => {
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
    const brief = JSON.parse(result.content[0].text) as {
      mode: string;
      output: Record<string, unknown>;
    };
    expect(["live", "fallback", "demo"]).toContain(brief.mode);
    console.info(`MCP workflow brief: ${brief.mode}`);
    expect(brief.output.summary).toBeDefined();
  }, 60_000);
});

function caseContext() {
  return {
    age: "29",
    intake,
    missingQuestions: localDraft.missingQuestions,
    patientName: "Nusrat",
    redFlags: localDraft.redFlags,
    severity: localDraft.severity,
    sex: "female",
    summary: localDraft.summary,
  };
}
