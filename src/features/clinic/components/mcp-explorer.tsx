import { Code2, Database, Play, Server } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

const explorerTools = [
  {
    body: {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    },
    description: "Discover all external-agent tools.",
    name: "tools/list",
  },
  {
    body: {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "clinic.safety.get_blockers",
        arguments: {
          intake: "Patient has chest tightness and sweating",
          allergiesKnown: false,
          returnWarningsConfirmed: false,
        },
      },
    },
    description: "Run the safety blocker check.",
    name: "clinic.safety.get_blockers",
  },
  {
    body: {
      jsonrpc: "2.0",
      id: 3,
      method: "resources/read",
      params: { uri: "clinic://agents/tool-registry" },
    },
    description: "Inspect the role-aware tool registry.",
    name: "tool registry resource",
  },
] as const;

type ExplorerToolName = (typeof explorerTools)[number]["name"];

export function McpExplorer() {
  const t = useClinicText();
  const [selectedName, setSelectedName] = useState<ExplorerToolName>(
    explorerTools[0].name,
  );
  const [response, setResponse] = useState(t("Run an MCP call."));
  const [isRunning, setIsRunning] = useState(false);
  const selectedTool = useMemo(
    () =>
      explorerTools.find((tool) => tool.name === selectedName) ??
      explorerTools[0],
    [selectedName],
  );

  async function runCall() {
    setIsRunning(true);
    setResponse(t("Running..."));
    try {
      const result = await fetch("/api/mcp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(selectedTool.body),
      });
      const json = await result.json();
      setResponse(JSON.stringify(json, null, 2));
    } catch (caught) {
      setResponse(
        caught instanceof Error ? caught.message : t("MCP call failed."),
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Server size={18} aria-hidden="true" />}
          title={t("MCP Explorer")}
          subtitle={t(
            "Inspect tools, copy payloads, and run demo-safe external-agent calls",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-2">
            {explorerTools.map((tool) => (
              <button
                className="w-full rounded-md border border-border bg-background p-3 text-left transition hover:border-primary"
                key={tool.name}
                type="button"
                onClick={() => setSelectedName(tool.name)}
              >
                <div className="flex items-center gap-2">
                  <Database size={16} aria-hidden="true" />
                  <p className="font-bold text-sm">{tool.name}</p>
                </div>
                <p className="mt-1 text-muted-foreground text-xs leading-5">
                  {t(tool.description)}
                </p>
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Code2 size={16} aria-hidden="true" />
                  <p className="font-bold text-sm">POST /api/mcp</p>
                </div>
                <Badge variant="outline">JSON-RPC 2.0</Badge>
              </div>
              <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-6">
                <code>{JSON.stringify(selectedTool.body, null, 2)}</code>
              </pre>
            </div>
            <Button type="button" disabled={isRunning} onClick={runCall}>
              <Play size={16} aria-hidden="true" />
              {isRunning ? t("Running MCP call") : t("Run MCP call")}
            </Button>
            <Textarea
              aria-label={t("MCP explorer response")}
              className="min-h-72 font-mono text-xs"
              readOnly
              value={response}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
