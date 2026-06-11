import { demoScenarios, sampleIntakes } from "@/features/clinic/data";

export const mcpServerInfo = {
  name: "clinic-copilot-bd",
  title: "Clinic Copilot BD MCP",
  version: "0.1.0",
} as const;

export const mcpInstructions =
  "Clinic Copilot BD exposes demo-safe clinic workflow context through MCP. Tools return operational support only: no diagnosis, prescription, or autonomous clinical decision-making.";

export const mcpResources = [
  {
    description:
      "Synthetic Bangladesh-style clinic cases used by the product demo.",
    mimeType: "application/json",
    name: "Demo clinic scenarios",
    uri: "clinic://demo/scenarios",
  },
  {
    description:
      "Supported AI clinic workflow surfaces and public product capabilities.",
    mimeType: "application/json",
    name: "Workflow capability map",
    uri: "clinic://demo/capabilities",
  },
  {
    description:
      "External-agent tool registry with roles, risk levels, approval rules, and workflow boundaries.",
    mimeType: "application/json",
    name: "Agent tool registry",
    uri: "clinic://agents/tool-registry",
  },
  {
    description:
      "Clinical safety gate contract used by MCP tools and UI workflows.",
    mimeType: "application/json",
    name: "Safety gate contract",
    uri: "clinic://safety/gates",
  },
] as const;

export const mcpAgentToolRegistry = [
  {
    description:
      "Return the public demo manifest, resources, tools, and safety posture for Clinic Copilot BD.",
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "clinic.demo_manifest",
    riskLevel: "low",
    roles: ["admin", "auditor", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: false,
  },
  {
    description:
      "List synthetic Bangladesh-native demo scenarios available in the clinic workspace.",
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "clinic.list_demo_scenarios",
    riskLevel: "low",
    roles: ["admin", "auditor", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: false,
  },
  {
    description:
      "Summarize messy Bangla-English intake notes into safe operational workflow support for a clinician to review.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        intake: {
          description: "Raw intake notes typed, pasted, transcribed, or OCR'd.",
          minLength: 12,
          type: "string",
        },
        patientName: {
          description: "Optional patient name for the brief.",
          type: "string",
        },
      },
      required: ["intake"],
      type: "object",
    },
    name: "clinic.workflow_brief",
    riskLevel: "medium",
    roles: ["doctor", "nurse"],
    requiresHumanApproval: true,
  },
  {
    description:
      "Return MCP-visible clinic tools with role, risk, approval, and schema metadata.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        role: {
          description: "Optional role filter.",
          enum: [
            "admin",
            "auditor",
            "doctor",
            "follow_up",
            "nurse",
            "reception",
          ],
          type: "string",
        },
      },
      type: "object",
    },
    name: "clinic.tools.list",
    riskLevel: "low",
    roles: ["admin", "auditor", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: false,
  },
  {
    description:
      "Describe one MCP tool, including safe usage notes and approval boundaries.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        name: { description: "Tool name to inspect.", type: "string" },
      },
      required: ["name"],
      type: "object",
    },
    name: "clinic.tools.describe",
    riskLevel: "low",
    roles: ["admin", "auditor", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: false,
  },
  {
    description:
      "Return queue pressure, red-flag lane, waiting-time risks, due follow-ups, and owner badges from demo cases.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        role: {
          enum: ["admin", "doctor", "follow_up", "nurse", "reception"],
          type: "string",
        },
      },
      type: "object",
    },
    name: "clinic.queue.snapshot",
    riskLevel: "low",
    roles: ["admin", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: false,
  },
  {
    description:
      "Inspect intake text for required vitals, allergies, escalation triggers, and return-warning confirmation blockers.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        age: { description: "Patient age, if known.", type: "string" },
        allergiesKnown: {
          description: "Whether medicine allergies have been checked.",
          type: "boolean",
        },
        intake: { minLength: 6, type: "string" },
        returnWarningsConfirmed: {
          description: "Whether staff confirmed return warnings.",
          type: "boolean",
        },
        vitals: {
          additionalProperties: false,
          properties: {
            bloodPressure: { type: "string" },
            oxygenSaturation: { type: "string" },
            pulse: { type: "string" },
            temperature: { type: "string" },
          },
          type: "object",
        },
      },
      required: ["intake"],
      type: "object",
    },
    name: "clinic.safety.get_blockers",
    riskLevel: "high",
    roles: ["doctor", "nurse"],
    requiresHumanApproval: true,
  },
  {
    description:
      "Prepare a draft printable packet: handout, referral, medicine slip, doctor summary, or follow-up call sheet.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        caseSummary: { minLength: 6, type: "string" },
        patientName: { type: "string" },
        type: {
          enum: [
            "doctor_summary",
            "followup_call_sheet",
            "handout",
            "medicine_slip",
            "referral",
          ],
          type: "string",
        },
      },
      required: ["caseSummary", "type"],
      type: "object",
    },
    name: "clinic.print.prepare_packet",
    riskLevel: "medium",
    roles: ["doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: true,
  },
  {
    description:
      "Create simple Bangla, pictogram, audio script, or teach-back checklist content for clinician-reviewed patient education.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        caseSummary: { minLength: 6, type: "string" },
        mode: {
          enum: ["audio_script", "pictogram", "simple_bangla", "teach_back"],
          type: "string",
        },
      },
      required: ["caseSummary", "mode"],
      type: "object",
    },
    name: "clinic.literacy.prepare",
    riskLevel: "medium",
    roles: ["doctor", "follow_up", "nurse"],
    requiresHumanApproval: true,
  },
  {
    description:
      "Validate local drafts before syncing and return merge risks, missing fields, and review-ready status.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        drafts: {
          items: {
            additionalProperties: false,
            properties: {
              caseId: { type: "string" },
              content: { type: "string" },
              owner: { type: "string" },
              updatedAt: { type: "string" },
            },
            required: ["caseId", "content"],
            type: "object",
          },
          type: "array",
        },
      },
      required: ["drafts"],
      type: "object",
    },
    name: "clinic.sync.preview_queue",
    riskLevel: "medium",
    roles: ["admin", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: true,
  },
  {
    description:
      "Create a non-mutating approval request envelope for a human reviewer.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        caseId: { type: "string" },
        reason: { minLength: 6, type: "string" },
        requestedAction: { minLength: 4, type: "string" },
        role: {
          enum: ["admin", "doctor", "follow_up", "nurse", "reception"],
          type: "string",
        },
      },
      required: ["reason", "requestedAction", "role"],
      type: "object",
    },
    name: "clinic.approval.request",
    riskLevel: "medium",
    roles: ["admin", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: true,
  },
  {
    description:
      "Run a synthetic scenario scorecard for demo judging, workflow completeness, and agent safety.",
    inputSchema: {
      additionalProperties: false,
      properties: {
        scenarioLabel: { type: "string" },
      },
      type: "object",
    },
    name: "clinic.demo.score_scenario",
    riskLevel: "low",
    roles: ["admin", "auditor", "doctor", "follow_up", "nurse", "reception"],
    requiresHumanApproval: false,
  },
] as const;

export const mcpTools = mcpAgentToolRegistry.map(
  ({ description, inputSchema, name }) => ({
    description,
    inputSchema,
    name,
  }),
);

export const mcpCapabilityMap = {
  dataSources: [
    "Internal Convex case data",
    "Synthetic demo cases",
    "User-entered intake notes",
    "Future OCR and uploaded clinic documents",
  ],
  guardrails: [
    "AI outputs are drafts",
    "Clinicians make care decisions",
    "Patient-facing copy is framed for review",
    "No diagnosis or prescription authority",
  ],
  workflows: [
    "Intake cleanup",
    "Red-flag review",
    "Missing question finder",
    "Role-based queue operations",
    "Agent tool registry",
    "Clinical safety blockers",
    "Print packet preparation",
    "Patient handout",
    "Teach-back",
    "Follow-up planning",
    "Low-connectivity review queue",
    "Approval request envelopes",
    "Simulation judge scoring",
    "Clinic briefing",
    "Audit-ready case operations",
  ],
} as const;

export const mcpSafetyGateContract = {
  blockedActions: [
    "diagnosis",
    "prescription",
    "case closure",
    "patient-facing finalization",
    "urgent symptom dismissal",
  ],
  requiredBeforeClinicalDraft: [
    "vitals captured or explicitly marked unavailable",
    "medicine allergies checked",
    "return warnings reviewed",
    "red flags escalated",
  ],
  escalationTriggers: [
    "pregnancy with fever, bleeding, severe pain, urinary symptoms, or reduced movement",
    "child with dehydration, repeated vomiting, lethargy, breathing difficulty, or danger signs",
    "chest pain, chest tightness, sweating, shortness of breath, diabetes, or older adult cardiac risk",
    "severe breathing difficulty, confusion, persistent bleeding, seizure, or very low oxygen saturation",
  ],
  outputContract: {
    approval:
      "Tools return draft support and set requiresHumanReview when clinical or patient-facing.",
    audit:
      "Every tool result includes a safety envelope that can be stored by a client audit log.",
  },
} as const;

export function demoScenarioPayload() {
  return demoScenarios.map((scenario) => ({
    age: scenario.age,
    focus: scenario.focus,
    intake: scenario.intake,
    label: scenario.label,
    patientName: scenario.patientName,
    sex: scenario.sex,
  }));
}

export function demoManifestPayload(origin?: string) {
  return {
    capabilities: mcpCapabilityMap,
    endpoint: origin ? `${origin}/api/mcp` : "/api/mcp",
    instructions: mcpInstructions,
    resources: mcpResources,
    safety:
      "Demo-safe MCP server for clinic workflow support. It never claims to diagnose, prescribe, or replace clinicians.",
    server: mcpServerInfo,
    tools: mcpTools,
  };
}

export function fallbackWorkflowBrief(intake: string, patientName = "Patient") {
  const matchedSample =
    sampleIntakes.find((sample) =>
      intake.toLowerCase().includes(sample.label.toLowerCase()),
    ) ?? sampleIntakes[0];

  return {
    mode: "demo",
    output: {
      followUp:
        "Assign staff owner for callback or return instruction after clinician review.",
      missingQuestions: [
        "Confirm vitals and duration.",
        "Ask about medicine allergies and current medicines.",
        "Ask whether symptoms are worsening or improving.",
      ],
      patientName,
      redFlags: [
        "Escalate urgent warning signs to a clinician immediately.",
        "Do not share patient-facing instructions until reviewed.",
      ],
      sourceHint: matchedSample.label,
      summary:
        "Mixed intake converted into a clinician-review workflow brief. This is draft support only.",
    },
  };
}
