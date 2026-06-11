import { generateText, Output } from "ai";
import { z } from "zod";
import {
  demoManifestPayload,
  demoScenarioPayload,
  fallbackWorkflowBrief,
  mcpAgentToolRegistry,
  mcpCapabilityMap,
  mcpInstructions,
  mcpResources,
  mcpSafetyGateContract,
  mcpServerInfo,
  mcpTools,
} from "@/features/mcp/data";
import {
  buildPromptForProvider,
  hasAiProvider,
  logAiProviderError,
  resolveAiModel,
} from "@/lib/ai-provider";

export const runtime = "nodejs";

const jsonRpcRequestSchema = z.object({
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  jsonrpc: z.literal("2.0"),
  method: z.string(),
  params: z.unknown().optional(),
});

const workflowBriefSchema = z.object({
  followUp: z.string(),
  missingQuestions: z.array(z.string()),
  patientName: z.string(),
  redFlags: z.array(z.string()),
  summary: z.string(),
});

type JsonRpcId = string | number | null | undefined;
type McpRole =
  | "admin"
  | "auditor"
  | "doctor"
  | "follow_up"
  | "nurse"
  | "reception";

const roleSchema = z.enum([
  "admin",
  "auditor",
  "doctor",
  "follow_up",
  "nurse",
  "reception",
]);

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
    child:
      Number.isFinite(numericAge) && numericAge < 12
        ? true
        : /child|শিশু|baby|বাচ্চা|৮|8/.test(normalized),
    chestPain: /chest|tightness|বুক|sweating|ঘাম|shortness|শ্বাস/.test(normalized),
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

function jsonRpcResult(id: JsonRpcId, result: unknown) {
  return Response.json({ id: id ?? null, jsonrpc: "2.0", result });
}

function jsonRpcError(id: JsonRpcId, code: number, message: string) {
  return Response.json(
    { error: { code, message }, id: id ?? null, jsonrpc: "2.0" },
    { status: code === -32600 ? 400 : 200 },
  );
}

function textContent(payload: unknown) {
  return {
    content: [
      {
        text: JSON.stringify(payload, null, 2),
        type: "text",
      },
    ],
  };
}

function getOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

async function callWorkflowBrief(args: unknown) {
  const parsed = z
    .object({
      intake: z.string().min(12),
      patientName: z.string().optional(),
    })
    .safeParse(args);

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({
        error:
          "clinic.workflow_brief requires an intake string with at least 12 characters.",
      }),
    };
  }

  const patientName = parsed.data.patientName?.trim() || "Patient";

  if (!hasAiProvider()) {
    return textContent(fallbackWorkflowBrief(parsed.data.intake, patientName));
  }

  const resolvedModel = resolveAiModel("env", []);

  try {
    const result = await generateText({
      model: resolvedModel.model,
      output: Output.object({ schema: workflowBriefSchema }),
      temperature: 0.2,
      ...buildPromptForProvider(resolvedModel.provider, {
        system:
          "You are Clinic Copilot BD MCP, a safe Bangla-English clinic workflow assistant. Never diagnose, prescribe, or replace clinicians. Return operational draft support only.",
        prompt: `Patient name: ${patientName}
Raw intake:
${parsed.data.intake}

Create a short workflow brief for a Bangladesh clinic team. Include summary, missing questions, red flags, and follow-up ownership.`,
      }),
    });

    return textContent({ mode: "live", output: result.output });
  } catch (error) {
    logAiProviderError("api/mcp", error);
    return textContent(fallbackWorkflowBrief(parsed.data.intake, patientName));
  }
}

function callToolsList(args: unknown) {
  const parsed = z
    .object({ role: roleSchema.optional() })
    .safeParse(args ?? {});
  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({ error: "clinic.tools.list received an invalid role." }),
    };
  }

  return textContent({
    ...getToolRegistry(parsed.data.role),
    safety: safetyEnvelope("clinic.tools.list", "low", parsed.data.role),
  });
}

function callToolsDescribe(args: unknown) {
  const parsed = z.object({ name: z.string() }).safeParse(args);
  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({ error: "clinic.tools.describe requires name." }),
    };
  }

  const tool = mcpAgentToolRegistry.find(
    (candidate) => candidate.name === parsed.data.name,
  );

  if (!tool) {
    return {
      isError: true,
      ...textContent({ error: `Unknown MCP tool: ${parsed.data.name}` }),
    };
  }

  return textContent({
    tool,
    usageNotes: [
      "Treat outputs as draft operational support.",
      "Store the safety envelope in external audit logs.",
      "Do not use MCP output to bypass clinic role permissions.",
    ],
    safety: safetyEnvelope(tool.name, tool.riskLevel),
  });
}

function callQueueSnapshot(args: unknown) {
  const parsed = z
    .object({ role: roleSchema.optional() })
    .safeParse(args ?? {});
  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({
        error: "clinic.queue.snapshot received an invalid role.",
      }),
    };
  }

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

  return textContent({
    queue,
    summary: {
      followUpsDue: queue.filter((item) => item.followUpDueInMinutes <= 30)
        .length,
      redFlagLane: queue.filter((item) => item.redFlagLane).length,
      totalWaitingMinutes: queue.reduce(
        (sum, item) => sum + item.waitingMinutes,
        0,
      ),
    },
    safety: safetyEnvelope("clinic.queue.snapshot", "low", parsed.data.role),
  });
}

function callSafetyBlockers(args: unknown) {
  const parsed = z
    .object({
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
    })
    .safeParse(args);

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({ error: "clinic.safety.get_blockers requires intake." }),
    };
  }

  const signals = detectSafetySignals(parsed.data.intake, parsed.data.age);
  const vitalValues = Object.values(parsed.data.vitals ?? {}).filter(Boolean);
  const blockers = [
    vitalValues.length === 0
      ? "Vitals are required or must be marked unavailable."
      : null,
    parsed.data.allergiesKnown
      ? null
      : "Medicine allergy check must be completed before medicine-facing output.",
    parsed.data.returnWarningsConfirmed
      ? null
      : "Return warnings must be confirmed before sharing patient-facing instructions.",
    signals.pregnancy
      ? "Pregnancy-related symptoms require clinician escalation."
      : null,
    signals.child ? "Child case requires pediatric danger-sign review." : null,
    signals.chestPain
      ? "Chest pain or cardiac-risk language requires urgent clinician review."
      : null,
    signals.severe
      ? "Severe symptom language requires immediate escalation review."
      : null,
  ].filter(Boolean);

  return textContent({
    blockers,
    canPrepareDraft: blockers.length === 0,
    escalationSignals: signals,
    safety: safetyEnvelope("clinic.safety.get_blockers", "high", "nurse"),
  });
}

function callPrintPacket(args: unknown) {
  const parsed = z
    .object({
      caseSummary: z.string().min(6),
      patientName: z.string().optional(),
      type: z.enum([
        "doctor_summary",
        "followup_call_sheet",
        "handout",
        "medicine_slip",
        "referral",
      ]),
    })
    .safeParse(args);

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({
        error: "clinic.print.prepare_packet requires caseSummary and type.",
      }),
    };
  }

  const patientName = parsed.data.patientName?.trim() || "Patient";

  return textContent({
    packet: {
      footer: "Draft only. Review and sign by clinic staff before use.",
      patientName,
      sections: [
        "Reason for visit",
        "Key facts staff confirmed",
        "Missing items to review",
        "Return warnings",
        "Owner and follow-up timing",
      ],
      title: `${parsed.data.type.replaceAll("_", " ")} for ${patientName}`,
      type: parsed.data.type,
    },
    sourceSummary: parsed.data.caseSummary,
    safety: safetyEnvelope("clinic.print.prepare_packet", "medium", "doctor"),
  });
}

function callLiteracyPrepare(args: unknown) {
  const parsed = z
    .object({
      caseSummary: z.string().min(6),
      mode: z.enum([
        "audio_script",
        "pictogram",
        "simple_bangla",
        "teach_back",
      ]),
    })
    .safeParse(args);

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({
        error: "clinic.literacy.prepare requires caseSummary and mode.",
      }),
    };
  }

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

  return textContent({
    mode: parsed.data.mode,
    output: outputs[parsed.data.mode],
    sourceSummary: parsed.data.caseSummary,
    safety: safetyEnvelope("clinic.literacy.prepare", "medium", "nurse"),
  });
}

function callSyncPreview(args: unknown) {
  const parsed = z
    .object({
      drafts: z.array(
        z.object({
          caseId: z.string(),
          content: z.string(),
          owner: z.string().optional(),
          updatedAt: z.string().optional(),
        }),
      ),
    })
    .safeParse(args);

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({ error: "clinic.sync.preview_queue requires drafts." }),
    };
  }

  return textContent({
    drafts: parsed.data.drafts.map((draft) => ({
      caseId: draft.caseId,
      conflicts: draft.content.length < 20 ? ["Draft is very short."] : [],
      owner: draft.owner ?? "unassigned",
      readyForReview: draft.content.length >= 20,
      requiresHumanReview: true,
      syncAction:
        draft.content.length >= 20 ? "queued_for_review" : "needs_more_detail",
      updatedAt: draft.updatedAt ?? null,
    })),
    safety: safetyEnvelope("clinic.sync.preview_queue", "medium", "admin"),
  });
}

function callApprovalRequest(args: unknown) {
  const parsed = z
    .object({
      caseId: z.string().optional(),
      reason: z.string().min(6),
      requestedAction: z.string().min(4),
      role: roleSchema.exclude(["auditor"]),
    })
    .safeParse(args);

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({
        error:
          "clinic.approval.request requires role, requestedAction, and reason.",
      }),
    };
  }

  return textContent({
    approvalRequest: {
      caseId: parsed.data.caseId ?? null,
      createdAt: new Date().toISOString(),
      reason: parsed.data.reason,
      requestedAction: parsed.data.requestedAction,
      reviewerRole:
        parsed.data.role === "reception" ? "nurse" : parsed.data.role,
      status: "pending_human_review",
    },
    safety: safetyEnvelope(
      "clinic.approval.request",
      "medium",
      parsed.data.role,
    ),
  });
}

function callDemoScore(args: unknown) {
  const parsed = z
    .object({ scenarioLabel: z.string().optional() })
    .safeParse(args ?? {});

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({
        error: "clinic.demo.score_scenario received invalid input.",
      }),
    };
  }

  const scenario =
    demoScenarioPayload().find((item) =>
      item.label
        .toLowerCase()
        .includes(parsed.data.scenarioLabel?.toLowerCase() ?? ""),
    ) ?? demoScenarioPayload()[0];
  const signals = detectSafetySignals(scenario.intake, scenario.age);

  return textContent({
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
    safety: safetyEnvelope("clinic.demo.score_scenario", "low", "auditor"),
  });
}

async function handleToolCall(params: unknown, request: Request) {
  const parsed = z
    .object({
      arguments: z.unknown().optional(),
      name: z.string(),
    })
    .safeParse(params);

  if (!parsed.success) {
    return {
      isError: true,
      ...textContent({ error: "tools/call requires name and arguments." }),
    };
  }

  switch (parsed.data.name) {
    case "clinic.demo_manifest":
      return textContent(demoManifestPayload(getOrigin(request)));
    case "clinic.list_demo_scenarios":
      return textContent({ scenarios: demoScenarioPayload() });
    case "clinic.workflow_brief":
      return callWorkflowBrief(parsed.data.arguments);
    case "clinic.tools.list":
      return callToolsList(parsed.data.arguments);
    case "clinic.tools.describe":
      return callToolsDescribe(parsed.data.arguments);
    case "clinic.queue.snapshot":
      return callQueueSnapshot(parsed.data.arguments);
    case "clinic.safety.get_blockers":
      return callSafetyBlockers(parsed.data.arguments);
    case "clinic.print.prepare_packet":
      return callPrintPacket(parsed.data.arguments);
    case "clinic.literacy.prepare":
      return callLiteracyPrepare(parsed.data.arguments);
    case "clinic.sync.preview_queue":
      return callSyncPreview(parsed.data.arguments);
    case "clinic.approval.request":
      return callApprovalRequest(parsed.data.arguments);
    case "clinic.demo.score_scenario":
      return callDemoScore(parsed.data.arguments);
    default:
      return {
        isError: true,
        ...textContent({ error: `Unknown MCP tool: ${parsed.data.name}` }),
      };
  }
}

function readResource(uri: string, request: Request) {
  switch (uri) {
    case "clinic://demo/scenarios":
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify({ scenarios: demoScenarioPayload() }, null, 2),
            uri,
          },
        ],
      };
    case "clinic://demo/capabilities":
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify(
              {
                ...mcpCapabilityMap,
                endpoint: `${getOrigin(request)}/api/mcp`,
              },
              null,
              2,
            ),
            uri,
          },
        ],
      };
    case "clinic://agents/tool-registry":
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify(getToolRegistry(), null, 2),
            uri,
          },
        ],
      };
    case "clinic://safety/gates":
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify(mcpSafetyGateContract, null, 2),
            uri,
          },
        ],
      };
    default:
      return {
        contents: [
          {
            mimeType: "application/json",
            text: JSON.stringify({ error: `Unknown resource: ${uri}` }),
            uri,
          },
        ],
      };
  }
}

export function GET(request: Request) {
  return Response.json({
    ...demoManifestPayload(getOrigin(request)),
    transport: "JSON-RPC 2.0 over POST",
    usage: {
      initialize: {
        id: 1,
        jsonrpc: "2.0",
        method: "initialize",
        params: {
          clientInfo: { name: "demo-client", version: "0.1.0" },
          protocolVersion: "2024-11-05",
        },
      },
      listTools: { id: 2, jsonrpc: "2.0", method: "tools/list" },
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: {
      Allow: "GET, POST, OPTIONS",
    },
    status: 204,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = jsonRpcRequestSchema.safeParse(body);

  if (!parsed.success) {
    return jsonRpcError(null, -32600, "Invalid JSON-RPC 2.0 request.");
  }

  const { id, method, params } = parsed.data;

  if (id === undefined) {
    return new Response(null, { status: 204 });
  }

  switch (method) {
    case "initialize":
      return jsonRpcResult(id, {
        capabilities: {
          resources: {},
          tools: {},
        },
        instructions: mcpInstructions,
        protocolVersion: "2024-11-05",
        serverInfo: mcpServerInfo,
      });
    case "tools/list":
      return jsonRpcResult(id, { tools: mcpTools });
    case "tools/call":
      return jsonRpcResult(id, await handleToolCall(params, request));
    case "resources/list":
      return jsonRpcResult(id, { resources: mcpResources });
    case "resources/read": {
      const parsedParams = z.object({ uri: z.string() }).safeParse(params);
      if (!parsedParams.success) {
        return jsonRpcError(id, -32602, "resources/read requires uri.");
      }
      return jsonRpcResult(id, readResource(parsedParams.data.uri, request));
    }
    default:
      return jsonRpcError(id, -32601, `Unsupported MCP method: ${method}`);
  }
}
