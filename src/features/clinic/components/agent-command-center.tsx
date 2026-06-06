import { Bot, Brain, Stethoscope, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type { CopilotOutput } from "../types";
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

export function AgentCommandCenter({
  cases,
  model,
  onRunCommand,
  output,
  selectedPatient,
}: {
  cases: Doc<"cases">[] | undefined;
  model: string;
  onRunCommand: (command: string) => Promise<void>;
  output: CopilotOutput | null;
  selectedPatient: string;
}) {
  const [activeCategory, setActiveCategory] =
    useState<(typeof categories)[number]>("automation");
  const [agentPrompt, setAgentPrompt] = useState("");
  const [lastCommand, setLastCommand] = useState(
    "No agent command has run yet.",
  );
  const [isRunning, setIsRunning] = useState(false);

  const visibleTools = agentTools.filter(
    (tool) => tool.category === activeCategory,
  );
  const criticalCount = agentTools.filter(
    (tool) => tool.priority === "critical",
  ).length;
  const queueItems = useMemo(
    () => [
      {
        command: "Clean this intake and extract vitals",
        label: "Normalize intake",
        owner: "Reception agent",
        priority: "speed",
      },
      {
        command: "Explain why this case is risky",
        label: "Explain risk",
        owner: "Safety agent",
        priority: "critical",
      },
      {
        command: "Create a nurse handoff and receptionist task list",
        label: "Split staff tasks",
        owner: "Ops agent",
        priority: "speed",
      },
      {
        command: "Compose a WhatsApp follow-up for this patient",
        label: "Prepare callback",
        owner: "Follow-up agent",
        priority: "normal",
      },
    ],
    [],
  );

  async function run(command: string) {
    setIsRunning(true);
    setLastCommand(command);
    try {
      await onRunCommand(command);
    } finally {
      setIsRunning(false);
    }
  }

  async function runPrompt() {
    const command = agentPrompt.trim();
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
    <Agent className="overflow-hidden">
      <AgentHeader
        name="Clinic Agent Swarm"
        model={model}
        status={isRunning ? "running tools" : "ready"}
      />
      <AgentContent>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-3">
            <Message from="agent">
              <p>
                I can operate intake, safety, patient communication, documents,
                queue ops, and demo automation for{" "}
                <strong>{selectedPatient || "the selected patient"}</strong>.
              </p>
            </Message>
            <PromptInput
              placeholder="Ask the agent to run any clinic workflow..."
              value={agentPrompt}
              onChange={setAgentPrompt}
              onSubmit={() => void runPrompt()}
            />
            <div className="flex flex-wrap gap-2">
              <Suggestion
                command="Run the full clinic workflow"
                onRun={(command) => void run(command)}
              >
                Full workflow
              </Suggestion>
              <Suggestion
                command="Check if this case is ready to approve"
                onRun={(command) => void run(command)}
              >
                Safety signoff
              </Suggestion>
              <Suggestion
                command="Brief me on today's clinic queue"
                onRun={(command) => void run(command)}
              >
                Queue brief
              </Suggestion>
              <Button type="button" onClick={() => void runBurst()}>
                <Zap size={16} aria-hidden="true" />
                Run tool burst
              </Button>
            </div>
            <Reasoning title="Agent routing logic">
              The swarm chooses the fastest existing clinic command, opens the
              right workspace when needed, and keeps outputs draft-only.
              Critical tools emphasize vitals, allergy, red flags, escalation,
              and clinician approval.
            </Reasoning>
            <Plan
              steps={[
                "Sense active case and queue pressure",
                "Run smallest safe tool chain",
                "Surface print, follow-up, and audit-ready outputs",
              ]}
            />
          </div>

          <div className="space-y-3">
            <Card>
              <CardHeader>
                <SectionHeading
                  icon={<Bot size={18} aria-hidden="true" />}
                  title="Agent Capacity"
                  subtitle="Ridiculous tool coverage, one click away"
                />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="Tools" value={agentTools.length} />
                  <Metric label="Critical" value={criticalCount} />
                  <Metric label="Cases" value={cases?.length ?? 0} />
                </div>
                <p className="mt-3 text-muted-foreground text-xs leading-5">
                  Last command: {lastCommand}
                </p>
              </CardContent>
            </Card>
            <TaskQueue
              items={queueItems}
              onRun={(command) => void run(command)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                aria-label={`Show ${category} agent tools`}
                className="capitalize"
                key={category}
                size="sm"
                type="button"
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {visibleTools.map((tool) => (
              <ToolCard
                command={tool.command}
                description={tool.description}
                key={tool.command}
                label={tool.label}
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
            title="Safety Agent"
            body={
              output
                ? `${output.redFlags.length} red flags, ${output.missingQuestions.length} missing questions.`
                : "Waiting for a draft."
            }
          />
          <MiniAgent
            icon={<Brain size={17} aria-hidden="true" />}
            title="Documentation Agent"
            body="Maintains SOAP, referral, handout, medicine slip, and family summary."
          />
          <MiniAgent
            icon={<Zap size={17} aria-hidden="true" />}
            title="Operations Agent"
            body="Routes queue pressure, follow-up ownership, and staff handoffs."
          />
        </div>
      </AgentContent>
    </Agent>
  );
}

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
