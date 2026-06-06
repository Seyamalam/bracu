import {
  AlertTriangle,
  Bot,
  FileText,
  MessageSquareText,
  Paperclip,
  ShieldCheck,
  Stethoscope,
  Volume2,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Message,
  PromptInput,
} from "@/components/ai-elements/agentic-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type {
  CommandHistoryEntry,
  CopilotOutput,
  IntakeFormState,
} from "../types";
import type { AgentTimelineEvent } from "./agent-operating-system";
import type { SafetyGate } from "./clinical-safety-gates";
import type { ClinicRole } from "./role-workspace-panel";

const threadTemplates = [
  {
    id: "patient",
    label: "Patient thread",
    prompt: "Review this patient and tell me the next safest action",
  },
  {
    id: "queue",
    label: "Queue ops",
    prompt: "Brief me on today's queue pressure and red flags",
  },
  {
    id: "safety",
    label: "Safety review",
    prompt: "List clinical blockers before print or closeout",
  },
  {
    id: "follow-up",
    label: "Follow-up",
    prompt: "Prepare follow-up ownership and patient communication",
  },
] as const;

const quickPrompts = [
  "What should I do next?",
  "Is this safe to print?",
  "What is missing?",
  "Explain this in simple Bangla",
] as const;

export function CopilotConsole({
  activeRole,
  cases,
  commandHistory,
  form,
  model,
  onCommand,
  onOpenCase,
  output,
  runningAction,
  safetyGates,
  timeline,
}: {
  activeRole: ClinicRole;
  cases: Doc<"cases">[] | undefined;
  commandHistory: CommandHistoryEntry[];
  form: IntakeFormState;
  model: string;
  onCommand: (command: string) => void;
  onOpenCase: () => void;
  output: CopilotOutput | null;
  runningAction: string | null;
  safetyGates: SafetyGate[];
  timeline: AgentTimelineEvent[];
}) {
  const [prompt, setPrompt] = useState("");
  const [activeThread, setActiveThread] =
    useState<(typeof threadTemplates)[number]["id"]>("patient");
  const openSafetyGates = safetyGates.filter((gate) => !gate.passed);
  const currentThread = threadTemplates.find(
    (thread) => thread.id === activeThread,
  );
  const recentActivity = useMemo(() => timeline.slice(0, 4), [timeline]);

  function submitPrompt(nextPrompt = prompt) {
    const command =
      nextPrompt.trim() ||
      currentThread?.prompt ||
      "Review this case and suggest the next safest action";
    onCommand(command);
    setPrompt("");
  }

  return (
    <section
      className="grid min-h-[calc(100svh-220px)] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm xl:grid-cols-[280px_minmax(0,1fr)_340px]"
      aria-label="Copilot command room"
    >
      <aside className="border-slate-200 border-b bg-[#fbfaf6] p-3 xl:border-r xl:border-b-0">
        <div className="flex items-center gap-2 px-2 py-1">
          <Bot className="text-primary" size={18} aria-hidden="true" />
          <div>
            <p className="font-black text-sm">Copilot</p>
            <p className="text-muted-foreground text-xs">{model}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-1">
          {threadTemplates.map((thread) => (
            <button
              aria-current={activeThread === thread.id ? "page" : undefined}
              className={`rounded-md px-3 py-3 text-left text-sm transition ${
                activeThread === thread.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-[#eaf6f1]"
              }`}
              key={thread.id}
              type="button"
              onClick={() => setActiveThread(thread.id)}
            >
              <span className="block font-bold">{thread.label}</span>
              <span
                className={`mt-1 block text-xs leading-4 ${
                  activeThread === thread.id
                    ? "text-primary-foreground/78"
                    : "text-muted-foreground"
                }`}
              >
                {thread.prompt}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-border bg-white p-3">
          <p className="font-bold text-sm">Recent runs</p>
          <div className="mt-2 space-y-2">
            {commandHistory.slice(0, 3).map((entry) => (
              <button
                className="block w-full rounded-md border border-transparent px-2 py-2 text-left text-xs leading-5 hover:border-primary/20 hover:bg-[#eaf6f1]"
                key={entry.id}
                type="button"
                onClick={() => onCommand(entry.command)}
              >
                <span className="block font-semibold">{entry.summary}</span>
                <span className="text-muted-foreground">{entry.command}</span>
              </button>
            ))}
            {!commandHistory.length ? (
              <p className="text-muted-foreground text-xs leading-5">
                Agent actions will appear here after you run a command.
              </p>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="flex min-h-[560px] flex-col">
        <div className="flex items-start justify-between gap-3 border-slate-200 border-b p-4">
          <div>
            <h2 className="font-black text-2xl tracking-normal">
              {currentThread?.label ?? "Patient thread"}
            </h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Ask for the next action, a draft, a safety check, or a patient
              explanation. Tools run inline and remain draft-only.
            </p>
          </div>
          <Badge variant={runningAction ? "default" : "secondary"}>
            {runningAction ? `running ${runningAction}` : "ready"}
          </Badge>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-[#fbfaf6] p-4">
          <Message from="clinic">
            {form.patientName
              ? `${form.patientName}, age ${form.age || "unknown"}. Role: ${activeRole}.`
              : `No active patient selected. Role: ${activeRole}.`}
          </Message>
          <Message from="agent">
            {output
              ? `${output.chiefComplaint}. I found ${output.redFlags.length} red flags, ${output.missingQuestions.length} missing questions, and ${openSafetyGates.length} open safety gates.`
              : "I can help with queue triage, missing clinical details, patient-friendly Bangla, follow-up ownership, and print-ready drafts."}
          </Message>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck
                  className="mt-0.5 text-amber-700"
                  size={17}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-bold text-sm">
                    Clinical review stays required
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs leading-5">
                    Copilot can draft, summarize, and route work. It should not
                    diagnose, prescribe, or bypass clinician approval.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {quickPrompts.map((item) => (
              <Button
                className="min-h-11 justify-start whitespace-normal text-left text-sm leading-5"
                key={item}
                type="button"
                variant="outline"
                onClick={() => submitPrompt(item)}
              >
                <MessageSquareText size={16} aria-hidden="true" />
                {item}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-slate-200 border-t bg-white p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={onOpenCase}
            >
              <Stethoscope size={15} aria-hidden="true" />
              Open case
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() =>
                onCommand("Extract this prescription and lab report")
              }
            >
              <Paperclip size={15} aria-hidden="true" />
              Attach note
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() =>
                onCommand("Answer this patient question in Bangla")
              }
            >
              <Volume2 size={15} aria-hidden="true" />
              Audio/Bangla
            </Button>
          </div>
          <PromptInput
            placeholder="Ask Copilot..."
            value={prompt}
            onChange={setPrompt}
            onSubmit={submitPrompt}
          />
        </div>
      </div>

      <aside className="border-slate-200 border-t bg-white p-4 xl:border-t-0 xl:border-l">
        <h3 className="font-black text-lg">Context</h3>
        <div className="mt-3 grid gap-3">
          <ContextItem
            icon={Stethoscope}
            label="Active patient"
            value={form.patientName || "No patient selected"}
          />
          <ContextItem
            icon={AlertTriangle}
            label="Safety gates"
            value={
              openSafetyGates.length
                ? `${openSafetyGates.length} open`
                : "All clear"
            }
          />
          <ContextItem
            icon={FileText}
            label="Cases in queue"
            value={`${cases?.length ?? 0}`}
          />
        </div>

        <div className="mt-5">
          <p className="font-bold text-sm">Open blockers</p>
          <div className="mt-2 space-y-2">
            {openSafetyGates.slice(0, 4).map((gate) => (
              <div
                className="rounded-md border border-amber-200 bg-amber-50 p-3"
                key={gate.id}
              >
                <p className="font-semibold text-sm">{gate.label}</p>
                <p className="mt-1 text-muted-foreground text-xs leading-5">
                  {gate.detail}
                </p>
              </div>
            ))}
            {!openSafetyGates.length ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 text-sm">
                No open safety blockers in the current context.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <p className="font-bold text-sm">Activity</p>
          <div className="mt-2 space-y-2">
            {recentActivity.map((event) => (
              <div
                className="rounded-md border border-border p-3"
                key={event.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-xs">{event.agent}</p>
                  <Badge variant="outline">{event.status}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground text-xs leading-5">
                  {event.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

function ContextItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Stethoscope;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-[#fbfaf6] p-3">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <Icon size={15} aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 font-black text-lg">{value}</p>
    </div>
  );
}
