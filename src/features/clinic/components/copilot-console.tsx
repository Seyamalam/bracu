import {
  Clock3,
  FileText,
  MessageSquareText,
  Mic,
  MicOff,
  Paperclip,
  Play,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Volume2,
} from "lucide-react";
import { useRef, useState } from "react";
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
import { useSpeechTranscription } from "../use-speech-transcription";
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

const judgeDemoPrompt = `Run the full clinic workflow for a judge demo.

Patient: Nusrat Akter, 29-year-old female, 18 weeks pregnant.
Complaint: fever for 2 days, urinary burning, back pain, lower abdominal discomfort, nausea, and reduced urine overnight.
Mixed Bangla intake: "Ami 18 week pregnant. Jor 102, prosrab e jala, kamar betha, pet e halka betha. Baby movement niye sure na. Kal raat e kom prosrab hoyeche."

Attached prescription says paracetamol 500 mg every 6 hours if fever, cefixime 200 mg twice daily for 5 days, ORS as needed. It does not document allergy status, blood pressure, fetal movement, or clinician approval.

Attached lab report: WBC 15,800, neutrophils 84%, Hb 10.1, platelets 182,000. Urine R/E: pus cells 20-25/HPF, RBC 4-6/HPF, nitrite positive, protein trace. Vitals on slip: temperature 102.2 F, pulse 112/min, BP not written, SpO2 not written.

Act like a clinic copilot, not a doctor. Do not diagnose or prescribe. Run safe draft-support workflow steps: extract document facts, clean intake, generate draft, check medicine safety, list pregnancy/vitals/allergy/approval blockers, explain risk, prepare staff handoff, prepare referral or visit summary, prepare Bangla patient explanation and follow-up WhatsApp message, check if safe to print or close out, and brief queue pressure. Keep every output draft-only and list exactly what still needs clinician approval.`;

const primaryActions = [
  {
    command: judgeDemoPrompt,
    icon: Sparkles,
    label: "Judge demo",
  },
  {
    command: "Run the full clinic workflow for this case",
    icon: Play,
    label: "Full workflow",
  },
  {
    command: "Check clinical blockers before print or closeout",
    icon: ShieldCheck,
    label: "Safety check",
  },
  {
    command:
      "Prepare the print packet for handout, referral, medicines, and follow-up",
    icon: FileText,
    label: "Print packet",
  },
  {
    command: "Brief me on today's queue pressure and red flags",
    icon: Users,
    label: "Queue brief",
  },
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
  const voiceBasePromptRef = useRef("");
  const [threadMessages, setThreadMessages] = useState<ThreadMessage[]>([]);
  const [activeThread, setActiveThread] =
    useState<(typeof threadTemplates)[number]["id"]>("patient");
  const t = useClinicText();
  const voiceInput = useSpeechTranscription({
    stoppedMessage: t("Voice transcription stopped. Please try again."),
    unsupportedMessage: t(
      "Voice transcription is not supported in this browser.",
    ),
  });
  const openSafetyGates = safetyGates.filter((gate) => !gate.passed);
  const currentThread = threadTemplates.find(
    (thread) => thread.id === activeThread,
  );

  function setTranscript(transcript: string) {
    const normalizedTranscript = transcript.trim();
    const basePrompt = voiceBasePromptRef.current.trim();
    setPrompt(
      [basePrompt, normalizedTranscript].filter(Boolean).join(" ").trim(),
    );
  }

  function toggleVoiceInput() {
    voiceBasePromptRef.current = prompt;
    voiceInput.toggle(setTranscript);
  }

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
      className="flex min-h-[calc(100svh-220px)] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
      aria-label={t("Copilot command room")}
    >
      <div className="space-y-3 border-slate-200 border-b bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
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
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{model}</Badge>
            <Badge
              variant={runningAction || isSubmitting ? "default" : "secondary"}
            >
              {runningAction || isSubmitting ? t("running") : t("ready")}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {threadTemplates.map((thread) => (
            <Button
              aria-pressed={activeThread === thread.id}
              disabled={isSubmitting}
              key={thread.id}
              size="sm"
              type="button"
              variant={activeThread === thread.id ? "default" : "outline"}
              onClick={() => setActiveThread(thread.id)}
            >
              {t(thread.label)}
            </Button>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {primaryActions.map((action) => {
            const Icon = action.icon;
            const isJudgeDemo = action.label === "Judge demo";
            return (
              <Button
                className={
                  isJudgeDemo
                    ? "min-h-12 justify-start whitespace-normal bg-[#f2c14e] text-left text-slate-950 hover:bg-[#e2b243]"
                    : "min-h-12 justify-start whitespace-normal text-left"
                }
                disabled={isSubmitting}
                key={action.label}
                type="button"
                variant={isJudgeDemo ? "default" : "outline"}
                onClick={() => submitPrompt(action.command)}
              >
                <Icon size={16} aria-hidden="true" />
                {t(action.label)}
              </Button>
            );
          })}
        </div>

        {commandHistory.length ? (
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-[#fbfaf6] px-3 py-2 text-xs">
            <span className="flex items-center gap-1 font-bold">
              <Clock3 size={14} aria-hidden="true" />
              {t("Recent runs")}
            </span>
            {commandHistory.slice(0, 3).map((entry) => (
              <button
                className="rounded-full border border-border bg-white px-2 py-1 text-left font-semibold hover:border-primary hover:bg-[#eaf6f1]"
                key={entry.id}
                type="button"
                onClick={() => void submitPrompt(entry.command)}
              >
                {entry.summary}
              </button>
            ))}
          </div>
        ) : null}
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

        <div className="grid gap-2 sm:grid-cols-2">
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
          <Button
            size="sm"
            disabled={isSubmitting || !voiceInput.isSupported}
            type="button"
            variant={voiceInput.isListening ? "default" : "outline"}
            onClick={toggleVoiceInput}
          >
            {voiceInput.isListening ? (
              <MicOff size={15} aria-hidden="true" />
            ) : (
              <Mic size={15} aria-hidden="true" />
            )}
            {voiceInput.isListening ? t("Stop dictation") : t("Dictate")}
          </Button>
        </div>
        {voiceInput.error ? (
          <p className="mb-2 text-red-700 text-xs">{voiceInput.error}</p>
        ) : null}
        <PromptInput
          disabled={isSubmitting}
          placeholder={t("Ask Copilot...")}
          value={prompt}
          onChange={setPrompt}
          onSubmit={submitPrompt}
        />
      </div>
    </section>
  );
}
