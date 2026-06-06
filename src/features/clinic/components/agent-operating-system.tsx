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
import { useMemo, useState } from "react";
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
  const [paletteQuery, setPaletteQuery] = useState("");
  const [voiceDraft, setVoiceDraft] = useState("");
  const [memoryOpen, setMemoryOpen] = useState(false);

  const inboxItems = useMemo(
    () => buildInbox({ cases, form, output }),
    [cases, form, output],
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
  return (
    <section className="sticky top-0 z-20 rounded-lg border border-primary/20 bg-white/95 p-3 shadow-sm backdrop-blur">
      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Bot size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="font-black text-lg">Agent Command Bar</p>
            <p className="text-muted-foreground text-xs">
              Cmd+K palette · voice · autopilot · audit trail
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
              aria-label={`Set ${label}`}
              className="h-auto px-2 py-2 text-xs"
              key={mode}
              type="button"
              variant={autopilotMode === mode ? "default" : "outline"}
              onClick={() => onModeChange(mode)}
            >
              {label}
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
            Judge
          </Button>
          <Button
            type="button"
            onClick={() => onCommand("recommend_next_agent_action")}
          >
            <Command size={16} aria-hidden="true" />
            Cmd+K
          </Button>
        </div>
      </div>
      {runningAction ? (
        <p className="mt-2 text-muted-foreground text-xs">
          Live tool stream: {runningAction}
        </p>
      ) : null}
    </section>
  );
}

function AgentTimeline({ timeline }: { timeline: AgentTimelineEvent[] }) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Clock size={18} aria-hidden="true" />}
          title="Agent Timeline"
          subtitle="Every AI action stays accountable"
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
                  {event.agent} Agent
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-2 text-sm leading-5">{event.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LiveToolStreaming({ steps }: { steps: StreamingStep[] }) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Radio size={18} aria-hidden="true" />}
          title="Live Tool Streaming"
          subtitle="Reading intake -> checking gates -> drafting outputs"
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
                <p className="font-semibold text-xs">{step.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentPermissions({ activeRole }: { activeRole: ClinicRole }) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<UserCog size={18} aria-hidden="true" />}
          title="Agent Permissions"
          subtitle={`${activeRole.replace("_", " ")} allowed tools`}
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {rolePermissions[activeRole].map((permission) => (
            <Badge key={permission} variant="secondary">
              {permission}
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
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Inbox size={18} aria-hidden="true" />}
          title="Agent Inbox"
          subtitle="Human-resolution tasks"
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
              No unresolved agent inbox items.
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
          title="Case Intelligence Graph"
          subtitle="Intake -> safety -> tasks -> print -> follow-up"
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
              <p className="mt-2 font-semibold text-xs">{node}</p>
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
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Command size={18} aria-hidden="true" />}
          title="Cmd+K Command Palette"
          subtitle="Search agent tools, recent commands, role and patient actions"
        />
      </CardHeader>
      <CardContent>
        <Input
          aria-label="Search agent command palette"
          placeholder="Search tools like allergy, triage, RAG, print..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {commands.map((command) => (
            <Suggestion command={command} key={command} onRun={onCommand}>
              {command}
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
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Brain size={18} aria-hidden="true" />}
          title="Named Agent Tools"
          subtitle="Explicit tool surface requested for the agent layer"
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-3">
          {namedAgentTools.map((tool) => (
            <ToolCard
              command={tool}
              description={tool.replaceAll("_", " ")}
              key={tool}
              label={tool}
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
          title="Simulation Mode"
          subtitle="3-minute judging autopilot"
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
          {enabled ? "Judge mode running" : "Start judge mode"}
        </Button>
        <Plan steps={steps.slice(0, 3)} />
        <p className="mt-2 text-muted-foreground text-xs">
          {steps.slice(3).join(" -> ")}
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
  function startVoice() {
    const speechWindow = window as Window &
      typeof globalThis & {
        SpeechRecognition?: new () => SpeechRecognitionLike;
        webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      };
    const SpeechRecognitionConstructor =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionConstructor) {
      onDraftChange("Load dengue case and generate draft");
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
          title="Voice Agent"
          subtitle="Push-to-talk clinic commands"
        />
      </CardHeader>
      <CardContent>
        <Textarea
          aria-label="Voice agent command"
          className="min-h-20 resize-none"
          placeholder="Load dengue case and generate draft..."
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" onClick={startVoice}>
            <Mic size={16} aria-hidden="true" />
            Listen
          </Button>
          <Button type="button" onClick={() => onCommand(draft)}>
            Run voice
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
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Brain size={18} aria-hidden="true" />}
          title="Agent Memory"
          subtitle="Clinic preferences stored locally"
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          type="button"
          variant="outline"
          onClick={onToggle}
        >
          {open ? "Hide memory" : "Edit memory"}
        </Button>
        {open ? (
          <div className="mt-3 space-y-2">
            <MemoryField
              label="Common medicines"
              value={memory.commonMedicines}
              onChange={(value) =>
                onChange({ ...memory, commonMedicines: value })
              }
            />
            <MemoryField
              label="Doctor style"
              value={memory.doctorStyle}
              onChange={(value) => onChange({ ...memory, doctorStyle: value })}
            />
            <MemoryField
              label="Opening hours"
              value={memory.openingHours}
              onChange={(value) => onChange({ ...memory, openingHours: value })}
            />
            <MemoryField
              label="Follow-up templates"
              value={memory.followUpTemplates}
              onChange={(value) =>
                onChange({ ...memory, followUpTemplates: value })
              }
            />
            <MemoryField
              label="Referral hospitals"
              value={memory.referralHospitals}
              onChange={(value) =>
                onChange({ ...memory, referralHospitals: value })
              }
            />
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-xs leading-5">
            {memory.preferredLanguage} · {memory.openingHours} ·{" "}
            {memory.doctorStyle}
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
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<History size={18} aria-hidden="true" />}
          title="Command History"
          subtitle="Undo and replay agent actions"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {history.slice(0, 4).map((entry) => (
            <div
              className="rounded-md border border-border p-3"
              key={entry.command}
            >
              <p className="font-semibold text-xs">{entry.summary}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onCommand("Undo last command")}
                >
                  Undo
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => onCommand(entry.command)}
                >
                  Replay
                </Button>
              </div>
            </div>
          ))}
          {history.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Agent commands will appear here.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function DraftComparison({ output }: { output: CopilotOutput | null }) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Activity size={18} aria-hidden="true" />}
          title="AI Draft vs Clinician Edits"
          subtitle="Side-by-side review surface"
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2">
          <Message from="agent">
            {output?.summary ?? "AI draft will appear after generation."}
          </Message>
          <Message from="clinic">
            Clinician edits remain the source of truth before print, referral,
            or closeout.
          </Message>
        </div>
      </CardContent>
    </Card>
  );
}

function PrintPreviewLauncher({ onOpen }: { onOpen: () => void }) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Printer size={18} aria-hidden="true" />}
          title="Print Preview"
          subtitle="Review before window.print"
        />
      </CardHeader>
      <CardContent>
        <Button className="w-full" type="button" onClick={onOpen}>
          Open print preview
        </Button>
      </CardContent>
    </Card>
  );
}

function CaseHealthScore({ value }: { value: number }) {
  return (
    <div
      role="img"
      className="grid size-14 place-items-center rounded-full border-4 border-primary bg-[#eaf6f1]"
      aria-label={`Case health score ${value} percent`}
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
