import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  Clock3,
  Play,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TerminalSquare,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  Agent,
  AgentContent,
  AgentHeader,
  Message,
  Plan,
  PromptInput,
  Reasoning,
  Suggestion,
  TaskQueue,
  ToolCard,
} from "@/components/ai-elements/agentic-primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/features/language/language-context";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type { CommandHistoryEntry, CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";

type AgentTool = {
  category:
    | "automation"
    | "communication"
    | "documents"
    | "intake"
    | "operations"
    | "safety";
  command: string;
  description: string;
  label: string;
  priority: "critical" | "normal" | "speed";
};

const agentTools: AgentTool[] = [
  {
    category: "automation",
    command: "Run the full clinic workflow",
    description:
      "Draft, risk, handoff, closeout, referral, follow-up, briefing.",
    label: "Full autopilot",
    priority: "speed",
  },
  {
    category: "automation",
    command: "Run the guided clinic workflow",
    description:
      "Judge-friendly demo path with scenario, draft, and presentation.",
    label: "Guided demo",
    priority: "speed",
  },
  {
    category: "automation",
    command: "Tell me what to do next for this case",
    description: "Agent chooses the next safest workflow commands.",
    label: "Next best actions",
    priority: "speed",
  },
  {
    category: "automation",
    command: "Undo last command",
    description: "Restore the previous workspace snapshot.",
    label: "Undo agent move",
    priority: "normal",
  },
  {
    category: "automation",
    command: "Switch to Bangla and open presentation mode",
    description: "Make the demo patient-facing and judge-ready immediately.",
    label: "Bangla presentation",
    priority: "speed",
  },
  {
    category: "automation",
    command: "Use the fastest model and clear filters",
    description:
      "Reset the operating board and bias the app toward low latency.",
    label: "Speed reset",
    priority: "speed",
  },
  {
    category: "intake",
    command: "Clean this intake and extract vitals",
    description: "Normalize messy Bangla-English notes into structured intake.",
    label: "Clean intake",
    priority: "speed",
  },
  {
    category: "intake",
    command: "Extract this prescription and lab report",
    description: "Pull labs, medicines, missing clarifications, and addendum.",
    label: "Extract document",
    priority: "speed",
  },
  {
    category: "intake",
    command: "Create a 52 year old male chest pain intake",
    description:
      "Generate a high-priority red-flag intake for testing escalation.",
    label: "Chest pain scenario",
    priority: "critical",
  },
  {
    category: "intake",
    command: "Load dengue watch and generate a draft",
    description: "Load outbreak-aware dengue case and create a review draft.",
    label: "Dengue draft",
    priority: "normal",
  },
  {
    category: "intake",
    command: "Load pregnancy fever and generate a draft",
    description:
      "Pregnancy-sensitive escalation, return warnings, and handout.",
    label: "Pregnancy draft",
    priority: "critical",
  },
  {
    category: "intake",
    command: "Load diabetes wound and generate a draft",
    description:
      "Chronic-care follow-up with wound safety and callback ownership.",
    label: "Diabetes wound",
    priority: "normal",
  },
  {
    category: "intake",
    command: "Create a child dehydration intake and generate a draft",
    description: "Pediatric hydration, caregiver instructions, and escalation.",
    label: "Child dehydration",
    priority: "critical",
  },
  {
    category: "intake",
    command: "Extract vitals and medicines from this note",
    description: "Fast receptionist cleanup for vitals and medication clarity.",
    label: "Vitals + meds",
    priority: "speed",
  },
  {
    category: "safety",
    command: "Explain why this case is risky",
    description:
      "Separate risk evidence, uncertainty, and patient safety-net advice.",
    label: "Risk rationale",
    priority: "critical",
  },
  {
    category: "safety",
    command: "Check if this case is ready to approve",
    description:
      "Approval guard for blockers, missing checks, and signoff list.",
    label: "Approval guard",
    priority: "critical",
  },
  {
    category: "safety",
    command:
      "Check medicine safety for paracetamol 500mg and antibiotic twice daily",
    description:
      "Find unclear dose, allergy, duplicated ingredient, and patient wording.",
    label: "Medicine safety",
    priority: "critical",
  },
  {
    category: "safety",
    command: "Close this visit safely",
    description:
      "Generate final closeout packet, audit notes, and unresolved blockers.",
    label: "Safe closeout",
    priority: "critical",
  },
  {
    category: "safety",
    command: "Check allergy status and medicine clarity",
    description: "Force medicine safety questions before print or signoff.",
    label: "Allergy clarity",
    priority: "critical",
  },
  {
    category: "safety",
    command: "Add chest pain escalation and urgent return warnings",
    description: "Escalation edit for cardiac-risk cases.",
    label: "Chest escalation",
    priority: "critical",
  },
  {
    category: "safety",
    command: "Add pregnancy red flags and simplify the Bangla handout",
    description:
      "Pregnancy-specific safety wording for low-literacy family review.",
    label: "Pregnancy guard",
    priority: "critical",
  },
  {
    category: "safety",
    command: "Check if vitals, allergy, and return warnings are complete",
    description: "Audit gate completeness before moving forward.",
    label: "Gate audit",
    priority: "critical",
  },
  {
    category: "communication",
    command: "Answer this patient question in Bangla",
    description: "Draft low-literacy patient answer with red-flag reminder.",
    label: "Patient Q&A",
    priority: "normal",
  },
  {
    category: "communication",
    command: "Compose a WhatsApp follow-up for this patient",
    description: "Create bilingual callback wording for staff review.",
    label: "WhatsApp follow-up",
    priority: "speed",
  },
  {
    category: "communication",
    command: "Triage this patient reply",
    description: "Classify incoming reply urgency and suggested staff action.",
    label: "Reply triage",
    priority: "critical",
  },
  {
    category: "communication",
    command: "Schedule follow-up for this patient",
    description:
      "Plan timing, owner, reminders, escalation, and closure criteria.",
    label: "Follow-up plan",
    priority: "normal",
  },
  {
    category: "communication",
    command: "Answer the family in simple Bangla with teach-back",
    description: "Plain-language answer plus one verification question.",
    label: "Family answer",
    priority: "normal",
  },
  {
    category: "communication",
    command: "Create a phone call script for follow-up desk",
    description:
      "Callback script with red flags, closure criteria, and escalation.",
    label: "Phone script",
    priority: "speed",
  },
  {
    category: "communication",
    command: "Triage worsening symptoms from a WhatsApp reply",
    description: "Escalate concerning replies quickly.",
    label: "Worse reply triage",
    priority: "critical",
  },
  {
    category: "communication",
    command: "Simplify the patient handout for low literacy",
    description: "Make patient-facing wording shorter and safer.",
    label: "Low-literacy rewrite",
    priority: "normal",
  },
  {
    category: "documents",
    command: "Write a referral letter for this patient",
    description:
      "Referral note with reason, summary, red flags, requested action.",
    label: "Referral letter",
    priority: "normal",
  },
  {
    category: "documents",
    command: "Create a visit summary for the family",
    description: "Family-facing visit summary for print or handoff.",
    label: "Family summary",
    priority: "normal",
  },
  {
    category: "documents",
    command: "Add a bleeding red flag and simplify the Bangla handout",
    description:
      "Edit the current draft and patient wording with clinician review.",
    label: "Edit draft",
    priority: "critical",
  },
  {
    category: "documents",
    command: "Create a medicine slip for the family",
    description: "Printable medicine-only instructions for clinician review.",
    label: "Medicine slip",
    priority: "normal",
  },
  {
    category: "documents",
    command: "Create a doctor summary for the chart",
    description: "Compact SOAP-focused chart summary.",
    label: "Doctor summary",
    priority: "normal",
  },
  {
    category: "documents",
    command: "Create a follow-up call sheet",
    description: "Owner, timing, callback script, escalation, and closure.",
    label: "Call sheet",
    priority: "speed",
  },
  {
    category: "documents",
    command:
      "Prepare the print packet for handout, referral, medicines, and follow-up",
    description: "Agent prepares the set of print-first clinic artifacts.",
    label: "Print packet",
    priority: "speed",
  },
  {
    category: "operations",
    command: "Brief me on today's clinic queue",
    description:
      "Operational summary, queue risks, paperwork gaps, next actions.",
    label: "Queue briefing",
    priority: "speed",
  },
  {
    category: "operations",
    command: "Search for Farzana and show high priority cases",
    description: "Find patient and focus the queue on urgent work.",
    label: "Search urgent",
    priority: "speed",
  },
  {
    category: "operations",
    command: "Use the fastest model and clear filters",
    description: "Optimize demo responsiveness and reset the board.",
    label: "Fast mode",
    priority: "speed",
  },
  {
    category: "operations",
    command: "Mark this patient for follow-up",
    description: "Move selected case into callback ownership.",
    label: "Follow-up status",
    priority: "normal",
  },
  {
    category: "operations",
    command: "Create a nurse handoff and receptionist task list",
    description:
      "Split work across receptionist, nurse, doctor, follow-up desk.",
    label: "Staff handoff",
    priority: "speed",
  },
  {
    category: "operations",
    command: "Show high priority cases and brief the clinic queue",
    description: "Urgent queue focus plus operational summary.",
    label: "Urgent queue brief",
    priority: "critical",
  },
  {
    category: "operations",
    command: "Move this patient to handout",
    description:
      "Route selected case toward patient education when gates allow.",
    label: "Move handout",
    priority: "normal",
  },
  {
    category: "operations",
    command: "Move this patient to follow-up",
    description: "Put the selected case under callback ownership.",
    label: "Move follow-up",
    priority: "normal",
  },
  {
    category: "operations",
    command: "Create receptionist, nurse, doctor, and follow-up desk tasks",
    description: "Split the work across clinic roles.",
    label: "Role task split",
    priority: "speed",
  },
  {
    category: "operations",
    command: "Search cases, clear filters, and brief today's clinic",
    description: "Reset the board and create a clean operating brief.",
    label: "Ops reset brief",
    priority: "speed",
  },
  {
    category: "operations",
    command: "Schedule follow-up and assign follow-up desk owner",
    description: "Close-loop ownership for callbacks.",
    label: "Assign callback",
    priority: "normal",
  },
];

const categories = [
  "automation",
  "intake",
  "safety",
  "communication",
  "documents",
  "operations",
] as const;

type AgentTranscriptMessage = {
  id: string;
  from: "agent" | "clinic";
  body: string;
  meta?: string;
};

export function AgentCommandCenter({
  cases,
  model,
  onRunCommand,
  output,
  selectedPatient,
}: {
  cases: Doc<"cases">[] | undefined;
  model: string;
  onRunCommand: (
    command: string,
  ) => Promise<CommandHistoryEntry | null | undefined>;
  output: CopilotOutput | null;
  selectedPatient: string;
}) {
  const { language } = useLanguage();
  const t = useCallback(
    (text: string) =>
      language === "bn" ? (agentCommandBn[text] ?? text) : text,
    [language],
  );
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("automation");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [lastCommand, setLastCommand] = useState(
    "No agent command has run yet.",
  );
  const [isRunning, setIsRunning] = useState(false);
  const [transcript, setTranscript] = useState<AgentTranscriptMessage[]>([
    {
      id: "agent-ready",
      from: "agent",
      body: "Tell me the outcome you want. I can choose tools, run the workflow, and report what changed.",
      meta: "ready",
    },
  ]);

  const visibleTools = agentTools.filter(
    (tool) => tool.category === activeCategory,
  );
  const criticalCount = agentTools.filter(
    (tool) => tool.priority === "critical",
  ).length;
  const providerLabel = model === "lmstudio" ? "LM Studio" : "Gemini";
  const queueItems = useMemo(
    () => [
      {
        command: "Clean this intake and extract vitals",
        label: t("Normalize intake"),
        owner: t("Reception agent"),
        priority: "speed",
      },
      {
        command: "Explain why this case is risky",
        label: t("Explain risk"),
        owner: t("Safety agent"),
        priority: "critical",
      },
      {
        command: "Create a nurse handoff and receptionist task list",
        label: t("Split staff tasks"),
        owner: t("Ops agent"),
        priority: "speed",
      },
      {
        command: "Compose a WhatsApp follow-up for this patient",
        label: t("Prepare callback"),
        owner: t("Follow-up agent"),
        priority: "normal",
      },
    ],
    [t],
  );

  function appendMessage(message: Omit<AgentTranscriptMessage, "id">) {
    setTranscript((messages) =>
      [...messages, { ...message, id: crypto.randomUUID() }].slice(-8),
    );
  }

  async function run(command: string) {
    setIsRunning(true);
    setLastCommand(command);
    appendMessage({ from: "clinic", body: command, meta: "command" });
    try {
      const result = await onRunCommand(command);
      appendMessage({
        from: "agent",
        body:
          result?.summary ??
          "Command completed. I updated the workspace or opened the matching tool.",
        meta: result?.actions?.length ? result.actions.join(", ") : "completed",
      });
    } catch (caught) {
      appendMessage({
        from: "agent",
        body:
          caught instanceof Error
            ? caught.message
            : "The command could not be completed.",
        meta: "error",
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function runPrompt(submittedPrompt = agentPrompt) {
    const command = submittedPrompt.trim();
    if (!command) {
      return;
    }
    setAgentPrompt("");
    await run(command);
  }

  async function runBurst() {
    for (const item of queueItems) {
      await run(item.command);
    }
  }

  return (
    <Agent>
      <AgentHeader
        detail={t("Codex-style command loop for clinic workflows")}
        name={t("Clinic Agent")}
        model={model}
        status={isRunning ? t("running tools") : t("ready")}
      />
      <AgentContent>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3 rounded-lg border border-border bg-[#f7f4ee] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bot className="text-primary" size={18} aria-hidden="true" />
                <div>
                  <p className="font-black text-sm">{t("Agent thread")}</p>
                  <p className="text-muted-foreground text-xs">
                    {selectedPatient || t("the selected patient")}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Activity size={13} aria-hidden="true" />
                  {isRunning ? t("running") : t("idle")}
                </Badge>
                <Badge variant="outline">
                  <ShieldCheck size={13} aria-hidden="true" />
                  {t("draft-only")}
                </Badge>
              </div>
            </div>
            <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1">
              {transcript.map((message) => (
                <Message
                  from={message.from}
                  key={message.id}
                  meta={message.meta}
                >
                  <p>{t(message.body)}</p>
                </Message>
              ))}
            </div>
            <PromptInput
              disabled={isRunning}
              placeholder={t("Ask the agent to run any clinic workflow...")}
              value={agentPrompt}
              onChange={setAgentPrompt}
              onSubmit={(value) => void runPrompt(value)}
            />
            <div className="flex flex-wrap gap-2">
              <Suggestion
                command="Run the full clinic workflow"
                onRun={(command) => void run(command)}
              >
                <Play size={14} aria-hidden="true" />
                {t("Full workflow")}
              </Suggestion>
              <Suggestion
                command="Check if this case is ready to approve"
                onRun={(command) => void run(command)}
              >
                <ShieldCheck size={14} aria-hidden="true" />
                {t("Safety signoff")}
              </Suggestion>
              <Suggestion
                command="Brief me on today's clinic queue"
                onRun={(command) => void run(command)}
              >
                <TerminalSquare size={14} aria-hidden="true" />
                {t("Queue brief")}
              </Suggestion>
              <Button
                disabled={isRunning}
                type="button"
                onClick={() => void runBurst()}
              >
                <Zap size={16} aria-hidden="true" />
                {t("Run tool burst")}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader>
                <SectionHeading
                  icon={<Bot size={18} aria-hidden="true" />}
                  title={t("Agent Capacity")}
                  subtitle={t("Ridiculous tool coverage, one click away")}
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Metric label={t("Tools")} value={agentTools.length} />
                  <Metric label={t("Critical")} value={criticalCount} />
                  <Metric label={t("Cases")} value={cases?.length ?? 0} />
                </div>
                <p className="mt-3 text-muted-foreground text-xs leading-5">
                  {t("Last command")}: {t(lastCommand)}
                </p>
              </CardContent>
            </Card>
            <div className="grid gap-2 rounded-lg border border-border bg-white p-3">
              <MiniAgent
                icon={<Clock3 size={17} aria-hidden="true" />}
                title={t("Run state")}
                body={
                  isRunning
                    ? t("Working through the selected tool chain.")
                    : t("Waiting for your next command.")
                }
              />
              <MiniAgent
                icon={<CheckCircle2 size={17} aria-hidden="true" />}
                title={t("Provider")}
                body={`${providerLabel}: ${model}`}
              />
            </div>
            <TaskQueue
              items={queueItems}
              onRun={(command) => void run(command)}
            />
          </div>
        </div>

        <Reasoning title={t("Agent routing logic")}>
          {t(
            "The agent translates natural language into the smallest safe clinic command chain, opens the right workspace when needed, and keeps outputs draft-only. Critical tools emphasize vitals, allergy, red flags, escalation, and clinician approval.",
          )}
        </Reasoning>
        <Plan
          steps={[
            t("Understand the active patient and queue"),
            t("Run the safest matching tool chain"),
            t("Report changes, blockers, and next commands"),
          ]}
        />

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                aria-label={`${t("Show agent tools")}: ${t(category)}`}
                className="capitalize"
                key={category}
                size="sm"
                type="button"
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
              >
                {t(category)}
              </Button>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {visibleTools.map((tool) => (
              <ToolCard
                command={tool.command}
                description={t(tool.description)}
                displayCommand={t(tool.command)}
                key={tool.command}
                label={t(tool.label)}
                tone={
                  tool.priority === "critical"
                    ? "danger"
                    : tool.priority === "speed"
                      ? "success"
                      : "neutral"
                }
                onRun={(command) => void run(command)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <MiniAgent
            icon={<Stethoscope size={17} aria-hidden="true" />}
            title={t("Safety Agent")}
            body={
              output
                ? `${output.redFlags.length} ${t("red flags")}, ${output.missingQuestions.length} ${t("missing questions")}.`
                : t("Waiting for a draft.")
            }
          />
          <MiniAgent
            icon={<Brain size={17} aria-hidden="true" />}
            title={t("Documentation Agent")}
            body={t(
              "Maintains SOAP, referral, handout, medicine slip, and family summary.",
            )}
          />
          <MiniAgent
            icon={<Sparkles size={17} aria-hidden="true" />}
            title={t("Operations Agent")}
            body={t(
              "Routes queue pressure, follow-up ownership, and staff handoffs.",
            )}
          />
        </div>
      </AgentContent>
    </Agent>
  );
}

const agentCommandBn: Record<string, string> = {
  automation: "অটোমেশন",
  communication: "যোগাযোগ",
  documents: "ডকুমেন্ট",
  intake: "ইনটেক",
  operations: "অপারেশনস",
  safety: "সেফটি",
  ready: "প্রস্তুত",
  "running tools": "টুল চলছে",
  "the selected patient": "নির্বাচিত রোগী",
  "Clinic Agent Swarm": "ক্লিনিক এজেন্ট স্বার্ম",
  "I can operate intake, safety, patient communication, documents, queue ops, and demo automation for":
    "আমি ইনটেক, সেফটি, রোগী যোগাযোগ, ডকুমেন্ট, কিউ অপারেশনস এবং ডেমো অটোমেশন চালাতে পারি",
  "Ask the agent to run any clinic workflow...":
    "যেকোনো ক্লিনিক ওয়ার্কফ্লো চালাতে এজেন্টকে বলুন...",
  "Full workflow": "পূর্ণ ওয়ার্কফ্লো",
  "Safety signoff": "সেফটি সাইনঅফ",
  "Queue brief": "কিউ ব্রিফ",
  "Run tool burst": "টুল বার্স্ট চালান",
  "Agent routing logic": "এজেন্ট রাউটিং লজিক",
  "The swarm chooses the fastest existing clinic command, opens the right workspace when needed, and keeps outputs draft-only. Critical tools emphasize vitals, allergy, red flags, escalation, and clinician approval.":
    "স্বার্ম দ্রুততম বিদ্যমান ক্লিনিক কমান্ড বেছে নেয়, দরকার হলে সঠিক ওয়ার্কস্পেস খোলে, এবং আউটপুট ড্রাফট-অনলি রাখে। গুরুত্বপূর্ণ টুল ভাইটাল, অ্যালার্জি, রেড ফ্ল্যাগ, এসকেলেশন ও ক্লিনিশিয়ান অনুমোদনে জোর দেয়।",
  "Sense active case and queue pressure": "সক্রিয় কেস ও কিউ চাপ বোঝা",
  "Run smallest safe tool chain": "সবচেয়ে ছোট নিরাপদ টুল চেইন চালানো",
  "Surface print, follow-up, and audit-ready outputs":
    "প্রিন্ট, ফলো-আপ ও অডিট-রেডি আউটপুট দেখানো",
  "Agent Capacity": "এজেন্ট সক্ষমতা",
  "Ridiculous tool coverage, one click away": "বিস্তৃত টুল কাভারেজ, এক ক্লিক দূরে",
  Tools: "টুল",
  Critical: "গুরুত্বপূর্ণ",
  Cases: "কেস",
  "Last command": "শেষ কমান্ড",
  "No agent command has run yet.": "এখনও কোনো এজেন্ট কমান্ড চালানো হয়নি।",
  "Show agent tools": "এজেন্ট টুল দেখান",
  "Safety Agent": "সেফটি এজেন্ট",
  "Documentation Agent": "ডকুমেন্টেশন এজেন্ট",
  "Operations Agent": "অপারেশনস এজেন্ট",
  "Waiting for a draft.": "ড্রাফটের অপেক্ষায়।",
  "red flags": "রেড ফ্ল্যাগ",
  "missing questions": "মিসিং প্রশ্ন",
  "Maintains SOAP, referral, handout, medicine slip, and family summary.":
    "SOAP, রেফারাল, হ্যান্ডআউট, মেডিসিন স্লিপ ও পরিবার সারাংশ ধরে রাখে।",
  "Routes queue pressure, follow-up ownership, and staff handoffs.":
    "কিউ চাপ, ফলো-আপ দায়িত্ব ও স্টাফ হ্যান্ডঅফ রাউট করে।",
  "Run the full clinic workflow": "পূর্ণ ক্লিনিক ওয়ার্কফ্লো চালান",
  "Draft, risk, handoff, closeout, referral, follow-up, briefing.":
    "ড্রাফট, রিস্ক, হ্যান্ডঅফ, ক্লোজআউট, রেফারাল, ফলো-আপ, ব্রিফিং।",
  "Full autopilot": "পূর্ণ অটোপাইলট",
  "Run the guided clinic workflow": "গাইডেড ক্লিনিক ওয়ার্কফ্লো চালান",
  "Judge-friendly demo path with scenario, draft, and presentation.":
    "সিনারিও, ড্রাফট ও প্রেজেন্টেশনসহ জাজ-ফ্রেন্ডলি ডেমো পথ।",
  "Guided demo": "গাইডেড ডেমো",
  "Tell me what to do next for this case": "এই কেসে এরপর কী করব বলুন",
  "Agent chooses the next safest workflow commands.":
    "এজেন্ট পরবর্তী সবচেয়ে নিরাপদ ওয়ার্কফ্লো কমান্ড বেছে নেয়।",
  "Next best actions": "নেক্সট বেস্ট অ্যাকশন",
  "Undo last command": "শেষ কমান্ড আনডু করুন",
  "Restore the previous workspace snapshot.": "আগের ওয়ার্কস্পেস স্ন্যাপশট ফেরান।",
  "Undo agent move": "এজেন্ট মুভ আনডু",
  "Switch to Bangla and open presentation mode":
    "বাংলায় যান এবং প্রেজেন্টেশন মোড খুলুন",
  "Make the demo patient-facing and judge-ready immediately.":
    "ডেমোকে সঙ্গে সঙ্গে রোগীমুখী ও জাজ-রেডি করুন।",
  "Bangla presentation": "বাংলা প্রেজেন্টেশন",
  "Use the fastest model and clear filters":
    "দ্রুততম মডেল ব্যবহার করুন এবং ফিল্টার পরিষ্কার করুন",
  "Reset the operating board and bias the app toward low latency.":
    "অপারেটিং বোর্ড রিসেট করে অ্যাপকে কম লেটেন্সির দিকে নিন।",
  "Speed reset": "স্পিড রিসেট",
  "Clean this intake and extract vitals": "এই ইনটেক পরিষ্কার করে ভাইটাল বের করুন",
  "Normalize messy Bangla-English notes into structured intake.":
    "এলোমেলো বাংলা-ইংরেজি নোটকে স্ট্রাকচার্ড ইনটেকে নিন।",
  "Clean intake": "ইনটেক পরিষ্কার",
  "Extract this prescription and lab report":
    "এই প্রেসক্রিপশন ও ল্যাব রিপোর্ট এক্সট্র্যাক্ট করুন",
  "Pull labs, medicines, missing clarifications, and addendum.":
    "ল্যাব, ওষুধ, মিসিং ক্ল্যারিফিকেশন ও অ্যাডেন্ডাম বের করুন।",
  "Extract document": "ডকুমেন্ট এক্সট্র্যাক্ট",
  "Explain why this case is risky": "এই কেস কেন ঝুঁকিপূর্ণ ব্যাখ্যা করুন",
  "Separate risk evidence, uncertainty, and patient safety-net advice.":
    "রিস্ক প্রমাণ, অনিশ্চয়তা ও রোগীর সেফটি-নেট পরামর্শ আলাদা করুন।",
  "Risk rationale": "রিস্ক র‍্যাশনাল",
  "Check if this case is ready to approve":
    "এই কেস অনুমোদনের জন্য প্রস্তুত কিনা চেক করুন",
  "Approval guard for blockers, missing checks, and signoff list.":
    "ব্লকার, মিসিং চেক ও সাইনঅফ লিস্টের অনুমোদন গার্ড।",
  "Approval guard": "অ্যাপ্রুভাল গার্ড",
  "Compose a WhatsApp follow-up for this patient":
    "এই রোগীর জন্য WhatsApp ফলো-আপ লিখুন",
  "Create bilingual callback wording for staff review.":
    "স্টাফ রিভিউয়ের জন্য দ্বিভাষিক কলব্যাক ভাষা তৈরি করুন।",
  "WhatsApp follow-up": "WhatsApp ফলো-আপ",
  "Schedule follow-up for this patient": "এই রোগীর ফলো-আপ শিডিউল করুন",
  "Plan timing, owner, reminders, escalation, and closure criteria.":
    "সময়, দায়িত্বপ্রাপ্ত, রিমাইন্ডার, এসকেলেশন ও ক্লোজার মানদণ্ড পরিকল্পনা করুন।",
  "Follow-up plan": "ফলো-আপ প্ল্যান",
  "Write a referral letter for this patient": "এই রোগীর জন্য রেফারাল লেটার লিখুন",
  "Referral note with reason, summary, red flags, requested action.":
    "কারণ, সারাংশ, রেড ফ্ল্যাগ ও অনুরোধকৃত অ্যাকশনসহ রেফারাল নোট।",
  "Referral letter": "রেফারাল লেটার",
  "Brief me on today's clinic queue": "আজকের ক্লিনিক কিউ ব্রিফ করুন",
  "Operational summary, queue risks, paperwork gaps, next actions.":
    "অপারেশনাল সারাংশ, কিউ রিস্ক, পেপারওয়ার্ক গ্যাপ, পরবর্তী অ্যাকশন।",
  "Queue briefing": "কিউ ব্রিফিং",
  "Normalize intake": "ইনটেক নরমালাইজ",
  "Reception agent": "রিসেপশন এজেন্ট",
  "Explain risk": "রিস্ক ব্যাখ্যা",
  "Safety agent": "সেফটি এজেন্ট",
  "Split staff tasks": "স্টাফ টাস্ক ভাগ",
  "Ops agent": "অপস এজেন্ট",
  "Prepare callback": "কলব্যাক প্রস্তুত",
  "Follow-up agent": "ফলো-আপ এজেন্ট",
};

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-[#f7f4ee] p-3 text-center">
      <p className="font-black text-xl">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}

function MiniAgent({
  body,
  icon,
  title,
}: {
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background p-3",
        title.includes("Safety") && "border-red-200 bg-red-50",
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <p className="mt-2 text-muted-foreground text-xs leading-5">{body}</p>
    </div>
  );
}
