import {
  Bot,
  Clock3,
  MessageSquareText,
  Paperclip,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import {
  Message,
  PromptInput,
} from "@/components/ai-elements/agentic-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  CommandHistoryEntry,
  CopilotOutput,
  IntakeFormState,
} from "../types";
import { useClinicText } from "../use-clinic-text";
import type { SafetyGate } from "./clinical-safety-gates";
import type { ClinicRole } from "./role-workspace-panel";

type ThreadMessage = {
  body: string;
  from: "agent" | "clinic";
  id: string;
  meta?: string;
};

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
  commandHistory,
  form,
  model,
  onCommand,
  onOpenCase,
  output,
  runningAction,
  safetyGates,
}: {
  activeRole: ClinicRole;
  commandHistory: CommandHistoryEntry[];
  form: IntakeFormState;
  model: string;
  onCommand: (
    command: string,
  ) => Promise<CommandHistoryEntry | null> | undefined;
  onOpenCase: () => void;
  output: CopilotOutput | null;
  runningAction: string | null;
  safetyGates: SafetyGate[];
}) {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [activeThread, setActiveThread] =
    useState<(typeof threadTemplates)[number]["id"]>("patient");
  const t = useClinicText();
  const openSafetyGates = safetyGates.filter((gate) => !gate.passed);
  const currentThread = threadTemplates.find(
    (thread) => thread.id === activeThread,
  );

  async function submitPrompt(nextPrompt?: string) {
    const command =
      (nextPrompt ?? prompt).trim() ||
      currentThread?.prompt ||
      t("Review this case and suggest the next safest action");
    setThreadMessages((messages) => [
      ...messages,
      { id: crypto.randomUUID(), from: "clinic", body: command },
    ]);
    setPrompt("");
    setIsSubmitting(true);

    try {
      const result = await onCommand(command);
      const summary =
        result?.summary ??
        t(
          "I received the command, but no visible workflow action was returned.",
        );
      const actions = result?.actions.length
        ? ` ${t("Actions")}: ${result.actions.join(", ")}.`
        : "";
      setThreadMessages((messages) => [
        ...messages,
        {
          id: crypto.randomUUID(),
          from: "agent",
          body: `${summary}${actions}`,
          meta: t(result?.mode ?? "done"),
        },
      ]);
    } catch (caught) {
      setThreadMessages((messages) => [
        ...messages,
        {
          id: crypto.randomUUID(),
          from: "agent",
          body:
            caught instanceof Error
              ? caught.message
              : t("The command could not be completed."),
          meta: t("error"),
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      className="grid min-h-[calc(100svh-220px)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:grid-cols-[300px_minmax(0,1fr)]"
      aria-label={t("Copilot command room")}
    >
      <aside className="border-slate-200 border-b bg-[#fbfaf6] p-3 xl:border-r xl:border-b-0">
        <div className="flex items-center justify-between gap-2 px-2 py-1">
          <div className="flex items-center gap-2">
            <Bot className="text-primary" size={18} aria-hidden="true" />
            <div>
              <p className="font-black text-sm">{t("Copilot")}</p>
              <p className="text-muted-foreground text-xs">{model}</p>
            </div>
          </div>
          <Badge
            variant={runningAction || isSubmitting ? "default" : "secondary"}
          >
            {runningAction || isSubmitting ? t("run") : t("idle")}
          </Badge>
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
              <span className="block font-bold">{t(thread.label)}</span>
              <span
                className={`mt-1 block text-xs leading-4 ${
                  activeThread === thread.id
                    ? "text-primary-foreground/78"
                    : "text-muted-foreground"
                }`}
              >
                {t(thread.prompt)}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-border bg-white p-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock3 size={15} aria-hidden="true" />
            {t("Recent runs")}
          </div>
          <div className="mt-2 space-y-2">
            {commandHistory.slice(0, 3).map((entry) => (
              <button
                className="block w-full rounded-md border border-transparent px-2 py-2 text-left text-xs leading-5 hover:border-primary/20 hover:bg-[#eaf6f1]"
                key={entry.id}
                type="button"
                onClick={() => void submitPrompt(entry.command)}
              >
                <span className="block font-semibold">{entry.summary}</span>
                <span className="text-muted-foreground">{entry.command}</span>
              </button>
            ))}
            {!commandHistory.length ? (
              <p className="text-muted-foreground text-xs leading-5">
                {t("Agent actions will appear here after you run a command.")}
              </p>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="flex min-h-[560px] flex-col">
        <div className="flex items-start justify-between gap-3 border-slate-200 border-b bg-white p-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary" size={20} aria-hidden="true" />
              <h2 className="font-black text-2xl tracking-normal">
                {t(currentThread?.label ?? "Patient thread")}
              </h2>
            </div>
            <p className="mt-1 text-muted-foreground text-sm">
              {t(
                "Ask for the next action, a draft, a safety check, or a patient explanation. Tools run inline and remain draft-only.",
              )}
            </p>
          </div>
          <Badge
            variant={runningAction || isSubmitting ? "default" : "secondary"}
          >
            {runningAction || isSubmitting ? t("running") : t("ready")}
          </Badge>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-[#fbfaf6] p-4">
          <Message from="clinic" meta="context">
            <p>
              {form.patientName
                ? `${form.patientName}, ${t("age")} ${form.age || t("unknown")}. ${t("Role")}: ${t(activeRole)}.`
                : `${t("No active patient selected.")} ${t("Role")}: ${t(activeRole)}.`}
            </p>
          </Message>
          <Message from="agent" meta={output ? "case-aware" : "ready"}>
            <p>
              {output
                ? `${output.chiefComplaint}. ${t("I found")} ${output.redFlags.length} ${t("red flags")}, ${output.missingQuestions.length} ${t("missing questions")}, ${t("and")} ${openSafetyGates.length} ${t("open safety gates")}.`
                : t(
                    "I can help with queue triage, missing clinical details, patient-friendly Bangla, follow-up ownership, and print-ready drafts.",
                  )}
            </p>
          </Message>
          {threadMessages.map((message) => (
            <Message from={message.from} key={message.id} meta={message.meta}>
              <p>{message.body}</p>
            </Message>
          ))}

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
                    {t("Clinical review stays required")}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs leading-5">
                    {t(
                      "Copilot can draft, summarize, and route work. It should not diagnose, prescribe, or bypass clinician approval.",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {quickPrompts.map((item) => (
              <Button
                className="min-h-11 justify-start whitespace-normal text-left text-sm leading-5"
                disabled={isSubmitting}
                key={item}
                type="button"
                variant="outline"
                onClick={() => submitPrompt(item)}
              >
                <MessageSquareText size={16} aria-hidden="true" />
                {t(item)}
              </Button>
            ))}
          </div>
        </div>

        <div className="border-slate-200 border-t bg-white p-3">
          <div className="mb-2 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={onOpenCase}
            >
              <Stethoscope size={15} aria-hidden="true" />
              {t("Open case")}
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={() =>
                void submitPrompt(t("Extract this prescription and lab report"))
              }
            >
              <Paperclip size={15} aria-hidden="true" />
              {t("Attach note")}
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              type="button"
              variant="outline"
              onClick={() =>
                void submitPrompt(t("Answer this patient question in Bangla"))
              }
            >
              <Volume2 size={15} aria-hidden="true" />
              {t("Audio/Bangla")}
            </Button>
          </div>
          <PromptInput
            disabled={isSubmitting}
            placeholder={t("Ask Copilot...")}
            value={prompt}
            onChange={setPrompt}
            onSubmit={submitPrompt}
          />
        </div>
      </div>
    </section>
  );
}
