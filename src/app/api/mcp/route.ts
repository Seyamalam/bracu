import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
  demoManifestPayload,
  demoScenarioPayload,
  fallbackWorkflowBrief,
  mcpCapabilityMap,
  mcpInstructions,
  mcpResources,
  mcpServerInfo,
  mcpTools,
} from "@/features/mcp/data";

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

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return textContent(fallbackWorkflowBrief(parsed.data.intake, patientName));
  }

  const result = await generateText({
    model: google(process.env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.5-flash"),
    output: Output.object({ schema: workflowBriefSchema }),
    temperature: 0.2,
    system:
      "You are Clinic Copilot BD MCP, a safe Bangla-English clinic workflow assistant. Never diagnose, prescribe, or replace clinicians. Return operational draft support only.",
    prompt: `Patient name: ${patientName}
Raw intake:
${parsed.data.intake}

Create a short workflow brief for a Bangladesh clinic team. Include summary, missing questions, red flags, and follow-up ownership.`,
  });

  return textContent({ mode: "live", output: result.output });
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
