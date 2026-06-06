import { Brain, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  Agent,
  AgentContent,
  AgentHeader,
  Message,
  Plan,
  PromptInput,
  Reasoning,
  ToolCard,
} from "@/components/ai-elements/agentic-primitives";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, IntakeFormState } from "../types";
import { SectionHeading } from "./section-heading";

const copilotTools = [
  {
    command: "summarize_queue_pressure",
    description: "Prioritize queue, red flags, owners, and waiting risks.",
    label: "Queue brain",
  },
  {
    command: "audit_case_safety",
    description: "Check vitals, allergies, red flags, and review blockers.",
    label: "Safety audit",
  },
  {
    command: "prepare_referral_packet",
    description: "Prepare print-first referral, summary, and handout drafts.",
    label: "Print packet",
  },
] as const;

export function CopilotConsole({
  form,
  model,
  onCommand,
  output,
  runningAction,
}: {
  form: IntakeFormState;
  model: string;
  onCommand: (command: string) => void;
  output: CopilotOutput | null;
  runningAction: string | null;
}) {
  const [prompt, setPrompt] = useState("");

  function submitPrompt() {
    const command =
      prompt.trim() ||
      "Review this case, list blockers, and suggest the next safest action";
    onCommand(command);
    setPrompt("");
  }

  return (
    <Agent className="overflow-hidden border-primary/20 bg-gradient-to-br from-white via-[#fbfff9] to-[#fff8df] shadow-sm">
      <AgentHeader
        name="Copilot Command Room"
        model={model}
        status={runningAction ? `running ${runningAction}` : "ready"}
      />
      <AgentContent>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_380px]">
          <div className="space-y-3">
            <Message from="clinic">
              {form.patientName
                ? `Current patient context: ${form.patientName}, age ${form.age || "unknown"}.`
                : "No patient selected yet. Copilot can still help with queue, protocols, and admin tasks."}
            </Message>
            <Message from="agent">
              {output
                ? `${output.chiefComplaint}. I see ${output.redFlags.length} red flags and ${output.missingQuestions.length} missing questions. I will keep clinical and patient-facing output in draft until reviewed.`
                : "Ask me to prioritize the queue, prepare a case, inspect safety gates, draft a print packet, or explain what external agents can do through MCP."}
            </Message>
            <Reasoning title="Copilot thinking">
              <p>
                I combine the active workspace, selected patient, safety gates,
                recent tool runs, and role permissions before suggesting
                actions.
              </p>
            </Reasoning>
            <PromptInput
              placeholder="Ask Copilot to triage, prepare, explain, print, audit, or run a tool..."
              value={prompt}
              onChange={setPrompt}
              onSubmit={submitPrompt}
            />
          </div>
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <SectionHeading
                  icon={<Sparkles size={18} aria-hidden="true" />}
                  title="Agent Plan"
                  subtitle="Default safety-first route"
                />
              </CardHeader>
              <CardContent>
                <Plan
                  steps={[
                    "Read context",
                    "Check blockers",
                    "Draft output",
                    "Request review",
                    "Print or route",
                  ]}
                />
              </CardContent>
            </Card>
            <div className="grid gap-2">
              {copilotTools.map((tool) => (
                <ToolCard
                  command={tool.command}
                  description={tool.description}
                  key={tool.command}
                  label={tool.label}
                  tone={tool.command.includes("safety") ? "danger" : "success"}
                  onRun={onCommand}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CopilotSignal icon={ShieldCheck} label="Safe" value="Drafts" />
              <CopilotSignal icon={Brain} label="Agents" value="Active" />
              <CopilotSignal icon={FileText} label="MCP" value="Ready" />
            </div>
          </div>
        </div>
      </AgentContent>
    </Agent>
  );
}

function CopilotSignal({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <Icon className="text-primary" size={17} aria-hidden="true" />
      <p className="mt-2 font-bold text-sm">{value}</p>
      <Badge className="mt-2" variant="outline">
        {label}
      </Badge>
    </div>
  );
}
