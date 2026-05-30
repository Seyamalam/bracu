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
] as const;

export const mcpTools = [
  {
    description:
      "Return the public demo manifest, resources, tools, and safety posture for Clinic Copilot BD.",
    inputSchema: {
      additionalProperties: false,
      properties: {},
      type: "object",
    },
    name: "clinic.demo_manifest",
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
  },
] as const;

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
    "Patient handout",
    "Teach-back",
    "Follow-up planning",
    "Clinic briefing",
    "Audit-ready case operations",
  ],
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
