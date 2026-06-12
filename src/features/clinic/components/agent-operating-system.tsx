import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Command,
  GitBranch,
  History,
  Inbox,
  Mic,
  Play,
  Printer,
  Radio,
  UserCog,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  Message,
  Plan,
  Suggestion,
  ToolCard,
} from "@/components/ai-elements/agentic-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/features/language/language-context";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type { CopilotOutput, IntakeFormState } from "../types";
import type { ClinicRole } from "./role-workspace-panel";
import { SectionHeading } from "./section-heading";

export type AutopilotMode = "assisted" | "demo" | "emergency" | "safe";

export type AgentTimelineEvent = {
  id: string;
  agent: "Doctor" | "Follow-up" | "Ops" | "Reception" | "Safety";
  detail: string;
  status: "blocked" | "complete" | "running";
  timestamp: number;
};

export type AgentMemory = {
  commonMedicines: string;
  doctorStyle: string;
  followUpTemplates: string;
  openingHours: string;
  preferredLanguage: "Bangla-first" | "Bilingual" | "English-first";
  referralHospitals: string;
};

export type StreamingStep = {
  id: string;
  label: string;
  status: "complete" | "idle" | "running";
};

type SpeechRecognitionLike = {
  lang: string;
  onresult:
    | ((event: {
        results: {
          length: number;
          [index: number]: {
            [index: number]: {
              transcript: string;
            };
          };
        };
      }) => void)
    | null;
  start: () => void;
};

const rolePermissions: Record<ClinicRole, string[]> = {
  admin: ["audit", "queue brief", "model", "assign owners", "readiness"],
  doctor: ["approve", "close visit", "edit draft", "risk", "referral"],
  follow_up: ["message", "schedule", "reply triage", "call sheet"],
  nurse: ["triage", "handoff", "vitals", "red flags", "medicine clarity"],
  reception: ["clean intake", "extract docs", "queue local draft", "vitals"],
};

const namedAgentTools = [
  "auto_triage_case",
  "detect_missing_vitals",
  "detect_allergy_gap",
  "detect_pregnancy_child_chest_pain",
  "generate_staff_tasks",
  "generate_patient_audio_script",
  "generate_pictogram_plan",
  "prepare_referral_packet",
  "summarize_queue_pressure",
  "predict_followup_risk",
  "rewrite_for_low_literacy",
  "translate_bn_en",
  "audit_case_safety",
  "compare_before_after_draft",
  "recommend_next_agent_action",
];

export function defaultAgentMemory(): AgentMemory {
  return {
    commonMedicines: "Paracetamol, ORS, salbutamol, antihistamine",
    doctorStyle: "Concise SOAP, conservative safety wording",
    followUpTemplates:
      "24h high-risk call, 3-day fever check, 7-day wound check",
    openingHours: "9:00 AM - 8:00 PM",
    preferredLanguage: "Bangla-first",
    referralHospitals: "DMCH, BSMMU, nearest emergency department",
  };
}

export function initialTimeline(): AgentTimelineEvent[] {
  return [
    {
      id: "boot-reception",
      agent: "Reception",
      detail: "Reception Agent is ready to extract vitals and documents.",
      status: "complete",
      timestamp: Date.now() - 90_000,
    },
    {
      id: "boot-safety",
      agent: "Safety",
      detail: "Safety Agent is watching vitals, allergy, and escalation gates.",
      status: "complete",
      timestamp: Date.now() - 60_000,
    },
  ];
}

export function AgentOperatingSystem({
  activeRole,
  autopilotMode,
  cases,
  commandHistory,
  form,
  isJudgeMode,
  memory,
  onAutopilotModeChange,
  onCommand,
  onJudgeModeChange,
  onMemoryChange,
  onPrintPreview,
  output,
  runningAction,
  streamingSteps,
  timeline,
}: {
  activeRole: ClinicRole;
  autopilotMode: AutopilotMode;
  cases: Doc<"cases">[] | undefined;
  commandHistory: { command: string; summary: string }[];
  form: IntakeFormState;
  isJudgeMode: boolean;
  memory: AgentMemory;
  onAutopilotModeChange: (mode: AutopilotMode) => void;
  onCommand: (command: string) => void;
  onJudgeModeChange: (enabled: boolean) => void;
  onMemoryChange: (memory: AgentMemory) => void;
  onPrintPreview: () => void;
  output: CopilotOutput | null;
  runningAction: string | null;
  streamingSteps: StreamingStep[];
  timeline: AgentTimelineEvent[];
}) {
  const t = useAgentOperatingText();
  const [paletteQuery, setPaletteQuery] = useState("");
  const [voiceDraft, setVoiceDraft] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);

  const inboxItems = useMemo(
    () =>
      buildInbox({ cases, form, output }).map((item) => ({
        ...item,
        detail: t(item.detail),
        label: t(item.label),
        severity: t(item.severity),
      })),
    [cases, form, output, t],
  );
  const healthScore = useMemo(
    () => calculateHealthScore({ form, inboxCount: inboxItems.length, output }),
    [form, inboxItems.length, output],
  );
  const paletteCommands = useMemo(
    () =>
      namedAgentTools
        .filter((tool) =>
          tool.toLowerCase().includes(paletteQuery.trim().toLowerCase()),
        )
        .slice(0, 8),
    [paletteQuery],
  );

  return (
    <div className="space-y-4">
      <AgentCommandBar
        autopilotMode={autopilotMode}
        healthScore={healthScore}
        isJudgeMode={isJudgeMode}
        onCommand={onCommand}
        onJudgeModeChange={onJudgeModeChange}
        onModeChange={onAutopilotModeChange}
        runningAction={runningAction}
      />

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <AgentTimeline timeline={timeline} />
          <AgentInbox items={inboxItems} onCommand={onCommand} />
          <AgentPermissions activeRole={activeRole} />
        </div>

        <div className="space-y-4">
          <LiveToolStreaming steps={streamingSteps} />
          <CaseIntelligenceGraph form={form} output={output} />
          <CommandPalette
            commands={paletteCommands}
            query={paletteQuery}
            onCommand={onCommand}
            onQueryChange={setPaletteQuery}
          />
          <AgentToolManifest onCommand={onCommand} />
        </div>

        <div className="space-y-4">
          <JudgeModePanel
            enabled={isJudgeMode}
            onCommand={onCommand}
            onToggle={onJudgeModeChange}
          />
          <VoiceAgent
            draft={voiceDraft}
            onCommand={onCommand}
            onDraftChange={setVoiceDraft}
          />
          <AgentMemoryPanel
            memory={memory}
            open={memoryOpen}
            onChange={onMemoryChange}
            onToggle={() => setMemoryOpen((current) => !current)}
          />
          <CommandReplay history={commandHistory} onCommand={onCommand} />
          <DraftComparison output={output} />
          <PrintPreviewLauncher onOpen={onPrintPreview} />
        </div>
      </div>
    </div>
  );
}

function AgentCommandBar({
  autopilotMode,
  healthScore,
  isJudgeMode,
  onCommand,
  onJudgeModeChange,
  onModeChange,
  runningAction,
}: {
  autopilotMode: AutopilotMode;
  healthScore: number;
  isJudgeMode: boolean;
  onCommand: (command: string) => void;
  onJudgeModeChange: (enabled: boolean) => void;
  onModeChange: (mode: AutopilotMode) => void;
  runningAction: string | null;
}) {
  const t = useAgentOperatingText();
  return (
    <section className="sticky top-0 z-20 rounded-lg border border-primary/20 bg-white/95 p-3 shadow-sm backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="font-black text-lg">{t("Agent Command Bar")}</p>
            <p className="text-muted-foreground text-xs">
              {t("Cmd+K palette · voice · autopilot · audit trail")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(
            [
              ["safe", "Safe Autopilot"],
              ["assisted", "Assisted Autopilot"],
              ["demo", "Demo Autopilot"],
              ["emergency", "Emergency Assist"],
            ] as const
          ).map(([mode, label]) => (
            <Button
              aria-label={`${t("Set")} ${t(label)}`}
              className="h-auto px-2 py-2 text-xs"
              key={mode}
              type="button"
              variant={autopilotMode === mode ? "default" : "outline"}
              onClick={() => onModeChange(mode)}
            >
              {t(label)}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CaseHealthScore value={healthScore} />
          <Button
            type="button"
            variant={isJudgeMode ? "default" : "outline"}
            onClick={() => onJudgeModeChange(!isJudgeMode)}
          >
            <Play size={16} aria-hidden="true" />
            {t("Judge")}
          </Button>
          <Button
            type="button"
            onClick={() => onCommand("recommend_next_agent_action")}
          >
            <Command size={16} aria-hidden="true" />
            {t("Cmd+K")}
          </Button>
        </div>
      </div>
      {runningAction ? (
        <p className="mt-2 text-muted-foreground text-xs">
          {t("Live tool stream")}: {t(runningAction)}
        </p>
      ) : null}
    </section>
  );
}

function AgentTimeline({ timeline }: { timeline: AgentTimelineEvent[] }) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Clock size={18} aria-hidden="true" />}
          title={t("Agent Timeline")}
          subtitle={t("Every AI action stays accountable")}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {timeline.slice(0, 8).map((event) => (
            <div
              className="rounded-md border border-border bg-background p-3"
              key={event.id}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant={
                    event.status === "blocked" ? "destructive" : "outline"
                  }
                >
                  {t(event.agent)} {t("Agent")}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-2 text-sm leading-5">{t(event.detail)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LiveToolStreaming({ steps }: { steps: StreamingStep[] }) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Radio size={18} aria-hidden="true" />}
          title={t("Live Tool Streaming")}
          subtitle={t("Reading intake -> checking gates -> drafting outputs")}
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-5">
          {steps.map((step) => (
            <div
              className={cn(
                "rounded-md border border-border bg-background p-3",
                step.status === "running" && "border-sky-200 bg-sky-50",
                step.status === "complete" &&
                  "border-emerald-200 bg-emerald-50",
              )}
              key={step.id}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={
                    step.status === "complete"
                      ? "text-emerald-700"
                      : "text-muted-foreground"
                  }
                  size={15}
                  aria-hidden="true"
                />
                <p className="font-semibold text-xs">{t(step.label)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentPermissions({ activeRole }: { activeRole: ClinicRole }) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<UserCog size={18} aria-hidden="true" />}
          title={t("Agent Permissions")}
          subtitle={`${t(activeRole.replace("_", " "))} ${t("allowed tools")}`}
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {rolePermissions[activeRole].map((permission) => (
            <Badge key={permission} variant="secondary">
              {t(permission)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentInbox({
  items,
  onCommand,
}: {
  items: { command: string; detail: string; label: string; severity: string }[];
  onCommand: (command: string) => void;
}) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Inbox size={18} aria-hidden="true" />}
          title={t("Agent Inbox")}
          subtitle={t("Human-resolution tasks")}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => (
            <button
              className="w-full rounded-md border border-border bg-background p-3 text-left transition hover:border-primary"
              key={item.label}
              type="button"
              onClick={() => onCommand(item.command)}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{item.label}</p>
                <Badge
                  variant={item.severity === "high" ? "destructive" : "outline"}
                >
                  {item.severity}
                </Badge>
              </div>
              <p className="mt-1 text-muted-foreground text-xs leading-5">
                {item.detail}
              </p>
            </button>
          ))}
          {items.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("No unresolved agent inbox items.")}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function CaseIntelligenceGraph({
  form,
  output,
}: {
  form: IntakeFormState;
  output: CopilotOutput | null;
}) {
  const t = useAgentOperatingText();
  const nodes = [
    ["Intake", form.intake ? "complete" : "idle"],
    ["Symptoms", output?.chiefComplaint ? "complete" : "idle"],
    [
      "Vitals",
      /bp|temp|pulse|spo2|প্রেশার|তাপমাত্রা/i.test(form.intake) ? "complete" : "idle",
    ],
    [
      "Red flags",
      output?.redFlags.length ? "blocked" : output ? "complete" : "idle",
    ],
    [
      "Missing Qs",
      output?.missingQuestions.length
        ? "blocked"
        : output
          ? "complete"
          : "idle",
    ],
    ["Safety gates", output ? "blocked" : "idle"],
    ["Staff tasks", output ? "complete" : "idle"],
    ["Print packet", output ? "complete" : "idle"],
    ["Follow-up", output?.followUp ? "complete" : "idle"],
  ];

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<GitBranch size={18} aria-hidden="true" />}
          title={t("Case Intelligence Graph")}
          subtitle={t("Intake -> safety -> tasks -> print -> follow-up")}
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {nodes.map(([node, state], index) => (
            <div
              className={cn(
                "rounded-md border border-border bg-background p-3 text-center",
                state === "complete" && "border-emerald-200 bg-emerald-50",
                state === "blocked" && "border-amber-200 bg-amber-50",
              )}
              key={node}
            >
              <Badge variant="outline">{index + 1}</Badge>
              <p className="mt-2 font-semibold text-xs">{t(String(node))}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CommandPalette({
  commands,
  onCommand,
  onQueryChange,
  query,
}: {
  commands: string[];
  onCommand: (command: string) => void;
  onQueryChange: (query: string) => void;
  query: string;
}) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Command size={18} aria-hidden="true" />}
          title={t("Cmd+K Command Palette")}
          subtitle={t(
            "Search agent tools, recent commands, role and patient actions",
          )}
        />
      </CardHeader>
      <CardContent>
        <Input
          aria-label={t("Search agent command palette")}
          placeholder={t("Search tools like allergy, triage, RAG, print...")}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {commands.map((command) => (
            <Suggestion command={command} key={command} onRun={onCommand}>
              {t(command)}
            </Suggestion>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentToolManifest({
  onCommand,
}: {
  onCommand: (command: string) => void;
}) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Brain size={18} aria-hidden="true" />}
          title={t("Named Agent Tools")}
          subtitle={t("Explicit tool surface requested for the agent layer")}
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-3">
          {namedAgentTools.map((tool) => (
            <ToolCard
              command={tool}
              description={t(tool.replaceAll("_", " "))}
              key={tool}
              label={t(tool)}
              onRun={onCommand}
              tone={
                tool.includes("risk") || tool.includes("safety")
                  ? "danger"
                  : "neutral"
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function JudgeModePanel({
  enabled,
  onCommand,
  onToggle,
}: {
  enabled: boolean;
  onCommand: (command: string) => void;
  onToggle: (enabled: boolean) => void;
}) {
  const t = useAgentOperatingText();
  const steps = [
    "0:00 Load Bangladesh-native case",
    "0:30 Generate draft and red flags",
    "1:15 Show safety gates and handout",
    "2:00 Queue, audit, follow-up proof",
    "2:45 Impact snapshot and close",
  ];

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Play size={18} aria-hidden="true" />}
          title={t("Simulation Mode")}
          subtitle={t("3-minute judging autopilot")}
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          type="button"
          variant={enabled ? "default" : "outline"}
          onClick={() => {
            onToggle(!enabled);
            if (!enabled) {
              onCommand("Run the full clinic workflow");
            }
          }}
        >
          {enabled ? t("Judge mode running") : t("Start judge mode")}
        </Button>
        <Plan steps={steps.slice(0, 3).map(t)} />
        <p className="mt-2 text-muted-foreground text-xs">
          {steps.slice(3).map(t).join(" -> ")}
        </p>
      </CardContent>
    </Card>
  );
}

function VoiceAgent({
  draft,
  onCommand,
  onDraftChange,
}: {
  draft: string;
  onCommand: (command: string) => void;
  onDraftChange: (draft: string) => void;
}) {
  const t = useAgentOperatingText();
  function startVoice() {
    const speechWindow = window as Window &
      typeof globalThis & {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      };
    const SpeechRecognitionConstructor =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      onDraftChange(t("Load dengue case and generate draft"));
      return;
    }
    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "en-BD";
    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1]?.[0]?.transcript;
      if (text) {
        onDraftChange(text);
      }
    };
    recognition.start();
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Mic size={18} aria-hidden="true" />}
          title={t("Voice Agent")}
          subtitle={t("Push-to-talk clinic commands")}
        />
      </CardHeader>
      <CardContent>
        <Textarea
          aria-label={t("Voice agent command")}
          className="min-h-20 resize-none"
          placeholder={t("Load dengue case and generate draft...")}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={startVoice}>
            <Mic size={16} aria-hidden="true" />
            {t("Listen")}
          </Button>
          <Button type="button" onClick={() => onCommand(draft)}>
            {t("Run voice")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentMemoryPanel({
  memory,
  onChange,
  onToggle,
  open,
}: {
  memory: AgentMemory;
  onChange: (memory: AgentMemory) => void;
  onToggle: () => void;
  open: boolean;
}) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Brain size={18} aria-hidden="true" />}
          title={t("Agent Memory")}
          subtitle={t("Clinic preferences stored locally")}
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={onToggle}
        >
          {open ? t("Hide memory") : t("Edit memory")}
        </Button>
        {open ? (
          <div className="mt-3 space-y-2">
            <MemoryField
              label={t("Common medicines")}
              value={memory.commonMedicines}
              onChange={(value) =>
                onChange({ ...memory, commonMedicines: value })
              }
            />
            <MemoryField
              label={t("Doctor style")}
              value={memory.doctorStyle}
              onChange={(value) => onChange({ ...memory, doctorStyle: value })}
            />
            <MemoryField
              label={t("Opening hours")}
              value={memory.openingHours}
              onChange={(value) => onChange({ ...memory, openingHours: value })}
            />
            <MemoryField
              label={t("Follow-up templates")}
              value={memory.followUpTemplates}
              onChange={(value) =>
                onChange({ ...memory, followUpTemplates: value })
              }
            />
            <MemoryField
              label={t("Referral hospitals")}
              value={memory.referralHospitals}
              onChange={(value) =>
                onChange({ ...memory, referralHospitals: value })
              }
            />
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-xs leading-5">
            {t(memory.preferredLanguage)} · {memory.openingHours} ·{" "}
            {t(memory.doctorStyle)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MemoryField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = `agent-memory-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        className="mt-1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function CommandReplay({
  history,
  onCommand,
}: {
  history: { command: string; summary: string }[];
  onCommand: (command: string) => void;
}) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<History size={18} aria-hidden="true" />}
          title={t("Command History")}
          subtitle={t("Undo and replay agent actions")}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.slice(0, 4).map((entry) => (
            <div
              className="rounded-md border border-border p-3"
              key={entry.command}
            >
              <p className="font-semibold text-xs">{t(entry.summary)}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onCommand("Undo last command")}
                >
                  {t("Undo")}
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => onCommand(entry.command)}
                >
                  {t("Replay")}
                </Button>
              </div>
            </div>
          ))}
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("Agent commands will appear here.")}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function DraftComparison({ output }: { output: CopilotOutput | null }) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Activity size={18} aria-hidden="true" />}
          title={t("AI Draft vs Clinician Edits")}
          subtitle={t("Side-by-side review surface")}
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2">
          <Message from="agent">
            {output?.summary ?? t("AI draft will appear after generation.")}
          </Message>
          <Message from="clinic">
            {t(
              "Clinician edits remain the source of truth before print, referral, or closeout.",
            )}
          </Message>
        </div>
      </CardContent>
    </Card>
  );
}

function PrintPreviewLauncher({ onOpen }: { onOpen: () => void }) {
  const t = useAgentOperatingText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Printer size={18} aria-hidden="true" />}
          title={t("Print Preview")}
          subtitle={t("Review before window.print")}
        />
      </CardHeader>
      <CardContent>
        <Button className="w-full" type="button" onClick={onOpen}>
          {t("Open print preview")}
        </Button>
      </CardContent>
    </Card>
  );
}

function CaseHealthScore({ value }: { value: number }) {
  const t = useAgentOperatingText();
  return (
    <div
      role="img"
      className="grid size-14 place-items-center rounded-full border-4 border-primary bg-[#eaf6f1]"
      aria-label={`${t("Case health score")} ${value} ${t("percent")}`}
    >
      <span className="font-black text-sm">{value}%</span>
    </div>
  );
}

function buildInbox({
  cases,
  form,
  output,
}: {
  cases: Doc<"cases">[] | undefined;
  form: IntakeFormState;
  output: CopilotOutput | null;
}) {
  const items: {
    command: string;
    detail: string;
    label: string;
    severity: string;
  }[] = [];
  if (!/(bp|temp|pulse|spo2|প্রেশার|তাপমাত্রা)/i.test(form.intake)) {
    items.push({
      command: "detect_missing_vitals",
      detail: "Vitals are not clearly documented.",
      label: "Missing vitals",
      severity: "high",
    });
  }
  if (!/(allerg|অ্যালার্জি|reaction)/i.test(form.intake)) {
    items.push({
      command: "detect_allergy_gap",
      detail: "Allergy status is unknown.",
      label: "Allergy unknown",
      severity: "medium",
    });
  }
  if (output?.redFlags.length) {
    items.push({
      command: "audit_case_safety",
      detail: `${output.redFlags.length} red flags need clinician resolution.`,
      label: "Red flag unresolved",
      severity: "high",
    });
  }
  if (cases?.some((caseItem) => caseItem.status === "followup")) {
    items.push({
      command: "summarize_queue_pressure",
      detail: "One or more follow-up cases need closure.",
      label: "Follow-up due",
      severity: "medium",
    });
  }
  if (output && output.severity === "high") {
    items.push({
      command: "Check if this case is ready to approve",
      detail: "High-priority cases require approval guard review.",
      label: "Approval blocked",
      severity: "high",
    });
  }
  return items;
}

function calculateHealthScore({
  form,
  inboxCount,
  output,
}: {
  form: IntakeFormState;
  inboxCount: number;
  output: CopilotOutput | null;
}) {
  let score = 35;
  if (form.patientName) score += 10;
  if (form.intake.length > 60) score += 15;
  if (/(bp|temp|pulse|spo2)/i.test(form.intake)) score += 15;
  if (/(allerg|reaction)/i.test(form.intake)) score += 10;
  if (output) score += 15;
  return Math.max(0, Math.min(100, score - inboxCount * 8));
}

function useAgentOperatingText() {
  const { language } = useLanguage();
  return useCallback(
    (text: string) =>
      language === "bn" ? (agentOperatingBn[text] ?? text) : text,
    [language],
  );
}

const agentOperatingBn: Record<string, string> = {
  admin: "অ্যাডমিন",
  assisted: "সহায়ক",
  audit: "অডিট",
  blocked: "ব্লকড",
  complete: "সম্পন্ন",
  doctor: "ডাক্তার",
  emergency: "জরুরি",
  follow_up: "ফলো-আপ",
  high: "উচ্চ",
  idle: "অপেক্ষমাণ",
  medium: "মাঝারি",
  model: "মডেল",
  nurse: "নার্স",
  reception: "রিসেপশন",
  running: "চলছে",
  safe: "নিরাপদ",
  "3-minute judging autopilot": "৩ মিনিটের জাজিং অটোপাইলট",
  "0:00 Load Bangladesh-native case": "০:০০ বাংলাদেশ-প্রাসঙ্গিক কেস লোড",
  "0:30 Generate draft and red flags": "০:৩০ ড্রাফট ও রেড ফ্ল্যাগ তৈরি",
  "1:15 Show safety gates and handout": "১:১৫ সেফটি গেট ও হ্যান্ডআউট দেখান",
  "2:00 Queue, audit, follow-up proof": "২:০০ কিউ, অডিট, ফলো-আপ প্রমাণ",
  "2:45 Impact snapshot and close": "২:৪৫ ইমপ্যাক্ট স্ন্যাপশট ও ক্লোজ",
  "9:00 AM - 8:00 PM": "সকাল ৯টা - রাত ৮টা",
  "AI Draft vs Clinician Edits": "AI ড্রাফট বনাম ক্লিনিশিয়ান এডিট",
  "AI draft will appear after generation.": "জেনারেশনের পর AI ড্রাফট দেখা যাবে।",
  Agent: "এজেন্ট",
  "Agent Command Bar": "এজেন্ট কমান্ড বার",
  "Agent Inbox": "এজেন্ট ইনবক্স",
  "Agent Memory": "এজেন্ট মেমরি",
  "Agent Permissions": "এজেন্ট পারমিশন",
  "Agent Timeline": "এজেন্ট টাইমলাইন",
  "Agent commands will appear here.": "এজেন্ট কমান্ড এখানে দেখা যাবে।",
  "Allergy status is unknown.": "অ্যালার্জি স্ট্যাটাস অজানা।",
  "Allergy unknown": "অ্যালার্জি অজানা",
  "Approval blocked": "অনুমোদন ব্লকড",
  "Bangla-first": "বাংলা-প্রথম",
  Bilingual: "দ্বিভাষিক",
  "Case Health Score": "কেস হেলথ স্কোর",
  "Case Intelligence Graph": "কেস ইন্টেলিজেন্স গ্রাফ",
  "Case health score": "কেস হেলথ স্কোর",
  "Check if this case is ready to approve":
    "এই কেস অনুমোদনের জন্য প্রস্তুত কিনা চেক করুন",
  "Clinic preferences stored locally": "ক্লিনিক পছন্দ লোকালি সংরক্ষিত",
  "Clinician edits remain the source of truth before print, referral, or closeout.":
    "প্রিন্ট, রেফারাল বা ক্লোজআউটের আগে ক্লিনিশিয়ান এডিটই সত্যের উৎস।",
  "Cmd+K": "Cmd+K",
  "Cmd+K Command Palette": "Cmd+K কমান্ড প্যালেট",
  "Cmd+K palette · voice · autopilot · audit trail":
    "Cmd+K প্যালেট · ভয়েস · অটোপাইলট · অডিট ট্রেইল",
  "Command History": "কমান্ড হিস্ট্রি",
  "Common medicines": "সাধারণ ওষুধ",
  "Concise SOAP, conservative safety wording": "সংক্ষিপ্ত SOAP, সতর্ক সেফটি ভাষা",
  "DMCH, BSMMU, nearest emergency department": "DMCH, BSMMU, নিকটতম জরুরি বিভাগ",
  Doctor: "ডাক্তার",
  "Doctor style": "ডাক্তারের স্টাইল",
  "Edit memory": "মেমরি এডিট করুন",
  "Emergency Assist": "জরুরি সহায়তা",
  "English-first": "ইংরেজি-প্রথম",
  "Every AI action stays accountable": "প্রতিটি AI অ্যাকশন জবাবদিহির মধ্যে থাকে",
  "Explicit tool surface requested for the agent layer":
    "এজেন্ট লেয়ারের জন্য চাওয়া স্পষ্ট টুল সারফেস",
  "Follow-up": "ফলো-আপ",
  "Follow-up due": "ফলো-আপ বাকি",
  "Follow-up templates": "ফলো-আপ টেমপ্লেট",
  "Hide memory": "মেমরি লুকান",
  "High-priority cases require approval guard review.":
    "উচ্চ অগ্রাধিকার কেসে অ্যাপ্রুভাল গার্ড রিভিউ প্রয়োজন।",
  "Human-resolution tasks": "মানুষের সমাধানযোগ্য টাস্ক",
  Intake: "ইনটেক",
  "Intake -> safety -> tasks -> print -> follow-up":
    "ইনটেক -> সেফটি -> টাস্ক -> প্রিন্ট -> ফলো-আপ",
  Judge: "জাজ",
  "Judge mode running": "জাজ মোড চলছে",
  "Live Tool Streaming": "লাইভ টুল স্ট্রিমিং",
  "Live tool stream": "লাইভ টুল স্ট্রিম",
  "Load dengue case and generate draft": "ডেঙ্গু কেস লোড করে ড্রাফট তৈরি করুন",
  "Load dengue case and generate draft...": "ডেঙ্গু কেস লোড করে ড্রাফট তৈরি করুন...",
  "Missing Qs": "মিসিং প্রশ্ন",
  "Missing vitals": "ভাইটাল মিসিং",
  "Named Agent Tools": "নেমড এজেন্ট টুল",
  "No unresolved agent inbox items.": "অসমাধিত এজেন্ট ইনবক্স আইটেম নেই।",
  "One or more follow-up cases need closure.":
    "এক বা একাধিক ফলো-আপ কেস ক্লোজার প্রয়োজন।",
  "Open print preview": "প্রিন্ট প্রিভিউ খুলুন",
  "Opening hours": "খোলার সময়",
  Ops: "অপস",
  "Paracetamol, ORS, salbutamol, antihistamine":
    "প্যারাসিটামল, ORS, সালবিউটামল, অ্যান্টিহিস্টামিন",
  "Print Preview": "প্রিন্ট প্রিভিউ",
  "Print packet": "প্রিন্ট প্যাকেট",
  "Push-to-talk clinic commands": "পুশ-টু-টক ক্লিনিক কমান্ড",
  "Reading intake -> checking gates -> drafting outputs":
    "ইনটেক পড়া -> গেট চেক -> আউটপুট ড্রাফট",
  Reception: "রিসেপশন",
  "Reception Agent is ready to extract vitals and documents.":
    "রিসেপশন এজেন্ট ভাইটাল ও ডকুমেন্ট এক্সট্র্যাক্ট করতে প্রস্তুত।",
  "Red flag unresolved": "রেড ফ্ল্যাগ অসমাধিত",
  "Red flags": "রেড ফ্ল্যাগ",
  "Referral hospitals": "রেফারাল হাসপাতাল",
  Replay: "রিপ্লে",
  "Review before window.print": "window.print-এর আগে রিভিউ করুন",
  "Run voice": "ভয়েস চালান",
  "Safe Autopilot": "নিরাপদ অটোপাইলট",
  Safety: "সেফটি",
  "Safety Agent is watching vitals, allergy, and escalation gates.":
    "সেফটি এজেন্ট ভাইটাল, অ্যালার্জি ও এসকেলেশন গেট দেখছে।",
  "Safety gates": "সেফটি গেট",
  "Search agent command palette": "এজেন্ট কমান্ড প্যালেট সার্চ করুন",
  "Search agent tools, recent commands, role and patient actions":
    "এজেন্ট টুল, সাম্প্রতিক কমান্ড, রোল ও রোগী অ্যাকশন সার্চ করুন",
  "Search tools like allergy, triage, RAG, print...":
    "allergy, triage, RAG, print-এর মতো টুল সার্চ করুন...",
  Set: "সেট করুন",
  "Side-by-side review surface": "পাশাপাশি রিভিউ সারফেস",
  "Simulation Mode": "সিমুলেশন মোড",
  "Staff tasks": "স্টাফ টাস্ক",
  "Start judge mode": "জাজ মোড শুরু করুন",
  Symptoms: "লক্ষণ",
  Undo: "আনডু",
  "Undo last command": "শেষ কমান্ড আনডু করুন",
  "Undo and replay agent actions": "এজেন্ট অ্যাকশন আনডু ও রিপ্লে করুন",
  "Vitals are not clearly documented.": "ভাইটাল পরিষ্কারভাবে ডকুমেন্টেড নয়।",
  "Voice Agent": "ভয়েস এজেন্ট",
  "Voice agent command": "ভয়েস এজেন্ট কমান্ড",
  "allowed tools": "অনুমোদিত টুল",
  "assign owners": "দায়িত্বপ্রাপ্ত নির্ধারণ",
  audit_case_safety: "কেস সেফটি অডিট",
  auto_triage_case: "অটো ট্রায়াজ কেস",
  "clean intake": "ইনটেক পরিষ্কার",
  "close visit": "ভিজিট ক্লোজ",
  compare_before_after_draft: "ড্রাফটের আগে-পরে তুলনা",
  detect_allergy_gap: "অ্যালার্জি গ্যাপ শনাক্ত",
  detect_missing_vitals: "মিসিং ভাইটাল শনাক্ত",
  detect_pregnancy_child_chest_pain: "গর্ভাবস্থা/শিশু/বুকব্যথা শনাক্ত",
  "edit draft": "ড্রাফট এডিট",
  "extract docs": "ডকুমেন্ট এক্সট্র্যাক্ট",
  generate_patient_audio_script: "রোগীর অডিও স্ক্রিপ্ট তৈরি",
  generate_pictogram_plan: "পিক্টোগ্রাম প্ল্যান তৈরি",
  generate_staff_tasks: "স্টাফ টাস্ক তৈরি",
  "medicine clarity": "ওষুধ ক্ল্যারিটি",
  message: "মেসেজ",
  percent: "শতাংশ",
  predict_followup_risk: "ফলো-আপ রিস্ক অনুমান",
  prepare_referral_packet: "রেফারাল প্যাকেট প্রস্তুত",
  "queue brief": "কিউ ব্রিফ",
  "queue local draft": "লোকাল ড্রাফট কিউ",
  recommend_next_agent_action: "পরবর্তী এজেন্ট অ্যাকশন সাজেস্ট",
  referral: "রেফারাল",
  "referral hospitals": "রেফারাল হাসপাতাল",
  "reply triage": "রিপ্লাই ট্রায়াজ",
  rewrite_for_low_literacy: "কম লিটারেসির জন্য রিরাইট",
  risk: "রিস্ক",
  schedule: "শিডিউল",
  summarize_queue_pressure: "কিউ চাপ সারাংশ",
  triage: "ট্রায়াজ",
  translate_bn_en: "বাংলা-ইংরেজি অনুবাদ",
  vitals: "ভাইটাল",
};
