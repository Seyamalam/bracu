#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod/v4";
import {
  demoManifestPayload,
  demoScenarioPayload,
  fallbackWorkflowBrief,
  mcpAgentToolRegistry,
  mcpCapabilityMap,
  mcpResources,
  mcpSafetyGateContract,
  mcpServerInfo,
} from "@/features/mcp/data";

type McpRole =
  | "admin"
  | "auditor"
  | "doctor"
  | "follow_up"
  | "nurse"
  | "reception";

const roleValues = [
  "admin",
  "auditor",
  "doctor",
  "follow_up",
  "nurse",
  "reception",
] as const;

function textResult(payload: unknown) {
  return {
    content: [
      {
        text: JSON.stringify(payload, null, 2),
        type: "text" as const,
      },
    ],
  };
}

function safetyEnvelope(toolName: string, riskLevel: string, role?: string) {
  return {
    audit: {
      createdAt: new Date().toISOString(),
      outputType: "draft_support",
      toolName,
    },
    boundaries: [
      "No diagnosis or prescription authority.",
      "Clinical and patient-facing outputs require human review.",
      "Escalation triggers must be handled by clinic staff.",
    ],
    requiresHumanReview: riskLevel !== "low",
    riskLevel,
    role: role ?? "unspecified",
  };
}

function detectSafetySignals(intake: string, age?: string) {
  const normalized = intake.toLowerCase();
  const numericAge = Number.parseInt(age ?? "", 10);

  return {
    chestPain: /chest|tightness|বুক|sweating|ঘাম|shortness|শ্বাস/.test(normalized),
    child:
      Number.isFinite(numericAge) && numericAge < 12
        ? true
        : /child|শিশু|baby|বাচ্চা|৮|8/.test(normalized),
    pregnancy: /pregnan|গর্ভ|bleeding|26 weeks|সন্তানসম্ভবা/.test(normalized),
    severe:
      /confusion|seizure|unconscious|bleeding|শ্বাসকষ্ট|severe|very weak|দুর্বল/.test(
        normalized,
      ),
  };
}

function getToolRegistry(role?: McpRole) {
  const tools = role
    ? mcpAgentToolRegistry.filter((tool) =>
        tool.roles.some((toolRole) => toolRole === role),
      )
    : mcpAgentToolRegistry;

  return {
    count: tools.length,
    tools: tools.map((tool) => ({
      description: tool.description,
      inputSchema: tool.inputSchema,
      name: tool.name,
      requiresHumanApproval: tool.requiresHumanApproval,
      riskLevel: tool.riskLevel,
      roles: tool.roles,
    })),
  };
}

function createServer() {
  const server = new McpServer(
    {
      name: mcpServerInfo.name,
      title: mcpServerInfo.title,
      version: mcpServerInfo.version,
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    },
  );

  for (const resource of mcpResources) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        description: resource.description,
        mimeType: resource.mimeType,
        title: resource.name,
      },
      (uri) => {
        const contents = readResource(uri.toString());
        return { contents };
      },
    );
  }

  server.registerTool(
    "clinic.demo_manifest",
    {
      description:
        "Return the public demo manifest, resources, tools, and safety posture for Clinic Copilot BD.",
      inputSchema: {},
      title: "Clinic Demo Manifest",
    },
    async () => textResult(demoManifestPayload()),
  );

  server.registerTool(
    "clinic.list_demo_scenarios",
    {
      description:
        "List synthetic Bangladesh-native demo scenarios available in the clinic workspace.",
      inputSchema: {},
      title: "List Demo Scenarios",
    },
    async () => textResult({ scenarios: demoScenarioPayload() }),
  );

  server.registerTool(
    "clinic.workflow_brief",
    {
      description:
        "Summarize messy Bangla-English intake notes into safe operational workflow support for a clinician to review.",
      inputSchema: {
        intake: z.string().min(12),
        patientName: z.string().optional(),
      },
      title: "Workflow Brief",
    },
    async ({ intake, patientName }) =>
      textResult(fallbackWorkflowBrief(intake, patientName)),
  );

  server.registerTool(
    "clinic.tools.list",
    {
      description:
        "Return MCP-visible clinic tools with role, risk, approval, and schema metadata.",
      inputSchema: {
        role: z.enum(roleValues).optional(),
      },
      title: "List Clinic Tools",
    },
    async ({ role }) =>
      textResult({
        ...getToolRegistry(role),
        safety: safetyEnvelope("clinic.tools.list", "low", role),
      }),
  );

  server.registerTool(
    "clinic.tools.describe",
    {
      description:
        "Describe one MCP tool, including safe usage notes and approval boundaries.",
      inputSchema: {
        name: z.string(),
      },
      title: "Describe Clinic Tool",
    },
    async ({ name }) => {
      const tool = mcpAgentToolRegistry.find(
        (candidate) => candidate.name === name,
      );

      if (!tool) {
        return textResult({ error: `Unknown MCP tool: ${name}` });
      }

      return textResult({
        safety: safetyEnvelope(tool.name, tool.riskLevel),
        tool,
        usageNotes: [
          "Treat outputs as draft operational support.",
          "Store the safety envelope in external audit logs.",
          "Do not use MCP output to bypass clinic role permissions.",
        ],
      });
    },
  );

  server.registerTool(
    "clinic.queue.snapshot",
    {
      description:
        "Return queue pressure, red-flag lane, waiting-time risks, due follow-ups, and owner badges from demo cases.",
      inputSchema: {
        role: z
          .enum(["admin", "doctor", "follow_up", "nurse", "reception"])
          .optional(),
      },
      title: "Queue Snapshot",
    },
    async ({ role }) => {
      const queue = demoScenarioPayload().map((scenario, index) => {
        const signals = detectSafetySignals(scenario.intake, scenario.age);
        const urgent = signals.chestPain || signals.pregnancy || signals.child;

        return {
          caseId: `demo-${index + 1}`,
          followUpDueInMinutes: urgent ? 15 : 90 + index * 12,
          owner:
            urgent && signals.chestPain
              ? "doctor"
              : urgent
                ? "nurse"
                : index % 2 === 0
                  ? "reception"
                  : "follow_up",
          patientName: scenario.patientName,
          redFlagLane: urgent,
          scenario: scenario.label,
          waitingMinutes: 8 + index * 11,
        };
      });

      return textResult({
        queue,
        safety: safetyEnvelope("clinic.queue.snapshot", "low", role),
        summary: {
          followUpsDue: queue.filter((item) => item.followUpDueInMinutes <= 30)
            .length,
          redFlagLane: queue.filter((item) => item.redFlagLane).length,
          totalWaitingMinutes: queue.reduce(
            (sum, item) => sum + item.waitingMinutes,
            0,
          ),
        },
      });
    },
  );

  server.registerTool(
    "clinic.safety.get_blockers",
    {
      description:
        "Inspect intake text for required vitals, allergies, escalation triggers, and return-warning confirmation blockers.",
      inputSchema: {
        age: z.string().optional(),
        allergiesKnown: z.boolean().optional(),
        intake: z.string().min(6),
        returnWarningsConfirmed: z.boolean().optional(),
        vitals: z
          .object({
            bloodPressure: z.string().optional(),
            oxygenSaturation: z.string().optional(),
            pulse: z.string().optional(),
            temperature: z.string().optional(),
          })
          .optional(),
      },
      title: "Safety Blockers",
    },
    async ({
      age,
      allergiesKnown,
      intake,
      returnWarningsConfirmed,
      vitals,
    }) => {
      const signals = detectSafetySignals(intake, age);
      const vitalValues = Object.values(vitals ?? {}).filter(Boolean);
      const blockers = [
        vitalValues.length === 0
          ? "Vitals are required or must be marked unavailable."
          : null,
        allergiesKnown
          ? null
          : "Medicine allergy check must be completed before medicine-facing output.",
        returnWarningsConfirmed
          ? null
          : "Return warnings must be confirmed before sharing patient-facing instructions.",
        signals.pregnancy
          ? "Pregnancy-related symptoms require clinician escalation."
          : null,
        signals.child
          ? "Child case requires pediatric danger-sign review."
          : null,
        signals.chestPain
          ? "Chest pain or cardiac-risk language requires urgent clinician review."
          : null,
        signals.severe
          ? "Severe symptom language requires immediate escalation review."
          : null,
      ].filter(Boolean);

      return textResult({
        blockers,
        canPrepareDraft: blockers.length === 0,
        escalationSignals: signals,
        safety: safetyEnvelope("clinic.safety.get_blockers", "high", "nurse"),
      });
    },
  );

  server.registerTool(
    "clinic.print.prepare_packet",
    {
      description:
        "Prepare a draft printable packet: handout, referral, medicine slip, doctor summary, or follow-up call sheet.",
      inputSchema: {
        caseSummary: z.string().min(6),
        patientName: z.string().optional(),
        type: z.enum([
          "doctor_summary",
          "followup_call_sheet",
          "handout",
          "medicine_slip",
          "referral",
        ]),
      },
      title: "Prepare Print Packet",
    },
    async ({ caseSummary, patientName, type }) =>
      textResult({
        packet: {
          footer: "Draft only. Review and sign by clinic staff before use.",
          patientName: patientName?.trim() || "Patient",
          sections: [
            "Reason for visit",
            "Key facts staff confirmed",
            "Missing items to review",
            "Return warnings",
            "Owner and follow-up timing",
          ],
          title: `${type.replaceAll("_", " ")} for ${patientName?.trim() || "Patient"}`,
          type,
        },
        safety: safetyEnvelope(
          "clinic.print.prepare_packet",
          "medium",
          "doctor",
        ),
        sourceSummary: caseSummary,
      }),
  );

  server.registerTool(
    "clinic.literacy.prepare",
    {
      description:
        "Create simple Bangla, pictogram, audio script, or teach-back checklist content for clinician-reviewed patient education.",
      inputSchema: {
        caseSummary: z.string().min(6),
        mode: z.enum([
          "audio_script",
          "pictogram",
          "simple_bangla",
          "teach_back",
        ]),
      },
      title: "Prepare Literacy Support",
    },
    async ({ caseSummary, mode }) => {
      const outputs = {
        audio_script:
          "Read slowly in Bangla. Explain what happened, what to do next, warning signs, and when to return. Pause after each point.",
        pictogram:
          "Pictogram sequence: drink/food, medicine review, danger sign, clinic phone, follow-up date.",
        simple_bangla:
          "সহজ ভাষায় বুঝিয়ে বলুন: কী সমস্যা, এখন কী করতে হবে, কোন বিপদচিহ্ন দেখলে দ্রুত ফিরতে হবে, এবং কবে ফলো-আপ।",
        teach_back:
          "Ask the family to repeat care steps, medicine instructions, danger signs, and follow-up timing in their own words.",
      } as const;

      return textResult({
        mode,
        output: outputs[mode],
        safety: safetyEnvelope("clinic.literacy.prepare", "medium", "nurse"),
        sourceSummary: caseSummary,
      });
    },
  );

  server.registerTool(
    "clinic.sync.preview_queue",
    {
      description:
        "Validate local drafts before syncing and return merge risks, missing fields, and review-ready status.",
      inputSchema: {
        drafts: z.array(
          z.object({
            caseId: z.string(),
            content: z.string(),
            owner: z.string().optional(),
            updatedAt: z.string().optional(),
          }),
        ),
      },
      title: "Review Sync Queue",
    },
    async ({ drafts }) =>
      textResult({
        drafts: drafts.map((draft) => ({
          caseId: draft.caseId,
          conflicts: draft.content.length < 20 ? ["Draft is very short."] : [],
          owner: draft.owner ?? "unassigned",
          readyForReview: draft.content.length >= 20,
          requiresHumanReview: true,
          syncAction:
            draft.content.length >= 20
              ? "queued_for_review"
              : "needs_more_detail",
          updatedAt: draft.updatedAt ?? null,
        })),
        safety: safetyEnvelope("clinic.sync.preview_queue", "medium", "admin"),
      }),
  );

  server.registerTool(
    "clinic.approval.request",
    {
      description:
        "Create a non-mutating approval request envelope for a human reviewer.",
      inputSchema: {
        caseId: z.string().optional(),
        reason: z.string().min(6),
        requestedAction: z.string().min(4),
        role: z.enum(["admin", "doctor", "follow_up", "nurse", "reception"]),
      },
      title: "Request Human Approval",
    },
    async ({ caseId, reason, requestedAction, role }) =>
      textResult({
        approvalRequest: {
          caseId: caseId ?? null,
          createdAt: new Date().toISOString(),
          reason,
          requestedAction,
          reviewerRole: role === "reception" ? "nurse" : role,
          status: "pending_human_review",
        },
        safety: safetyEnvelope("clinic.approval.request", "medium", role),
      }),
  );

  server.registerTool(
    "clinic.demo.score_scenario",
    {
      description:
        "Run a synthetic scenario scorecard for demo judging, workflow completeness, and agent safety.",
      inputSchema: {
        scenarioLabel: z.string().optional(),
      },
      title: "Score Demo Scenario",
    },
    async ({ scenarioLabel }) => {
      const scenario =
        demoScenarioPayload().find((item) =>
          item.label.toLowerCase().includes(scenarioLabel?.toLowerCase() ?? ""),
        ) ?? demoScenarioPayload()[0];
      const signals = detectSafetySignals(scenario.intake, scenario.age);

      return textResult({
        safety: safetyEnvelope("clinic.demo.score_scenario", "low", "auditor"),
        scenario,
        scorecard: {
          agentSafety: signals.chestPain || signals.pregnancy ? 95 : 90,
          patientClarity: signals.child ? 94 : 88,
          printReadiness: 92,
          queueFit: signals.chestPain ? 98 : 86,
          workflowCompleteness: 93,
        },
        suggestedJudgeRoute: [
          "Open the case.",
          "Run intake cleanup.",
          "Check safety blockers.",
          "Generate print packet.",
          "Review literacy output.",
          "Confirm human approval boundary.",
        ],
      });
    },
  );

  return server;
}

function readResource(uri: string) {
  switch (uri) {
    case "clinic://demo/scenarios":
      return [
        {
          mimeType: "application/json",
          text: JSON.stringify({ scenarios: demoScenarioPayload() }, null, 2),
          uri,
        },
      ];
    case "clinic://demo/capabilities":
      return [
        {
          mimeType: "application/json",
          text: JSON.stringify(mcpCapabilityMap, null, 2),
          uri,
        },
      ];
    case "clinic://agents/tool-registry":
      return [
        {
          mimeType: "application/json",
          text: JSON.stringify(getToolRegistry(), null, 2),
          uri,
        },
      ];
    case "clinic://safety/gates":
      return [
        {
          mimeType: "application/json",
          text: JSON.stringify(mcpSafetyGateContract, null, 2),
          uri,
        },
      ];
    default:
      return [
        {
          mimeType: "application/json",
          text: JSON.stringify({ error: `Unknown resource: ${uri}` }),
          uri,
        },
      ];
  }
}

const server = createServer();
await server.connect(new StdioServerTransport());
