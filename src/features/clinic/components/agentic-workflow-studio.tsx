import {
  Activity,
  Blocks,
  BookOpenCheck,
  BrainCircuit,
  CalendarClock,
  GitBranch,
  MonitorCheck,
  Route,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type { CopilotOutput, IntakeFormState } from "../types";
import type { ClinicRole } from "./role-workspace-panel";
import { SectionHeading } from "./section-heading";

type AgenticStudioTab =
  | "canvas"
  | "governor"
  | "journey"
  | "protocols"
  | "shift"
  | "simulation"
  | "templates";

type MarketplaceTemplate = (typeof marketplaceTemplates)[number];

const tabs: { icon: typeof Workflow; id: AgenticStudioTab; label: string }[] = [
  { icon: Workflow, id: "canvas", label: "Canvas" },
  { icon: ShieldCheck, id: "governor", label: "Governor" },
  { icon: Route, id: "journey", label: "Journey" },
  { icon: BookOpenCheck, id: "protocols", label: "Protocols" },
  { icon: CalendarClock, id: "shift", label: "Shift" },
  { icon: MonitorCheck, id: "simulation", label: "Simulation" },
  { icon: Blocks, id: "templates", label: "Marketplace" },
];

const canvasNodes = [
  {
    agent: "Reception",
    detail: "Capture story, vitals, documents, language, and queue reason.",
    gate: "Vitals required",
    title: "New intake trigger",
    type: "trigger",
  },
  {
    agent: "Safety",
    detail: "Check pregnancy, child danger signs, chest pain, allergies.",
    gate: "Escalate red flags",
    title: "Safety governor",
    type: "gate",
  },
  {
    agent: "Doctor",
    detail: "Prepare SOAP draft, referral packet, and review checklist.",
    gate: "Doctor signoff",
    title: "Clinical draft",
    type: "agent",
  },
  {
    agent: "Patient Literacy",
    detail: "Simple Bangla, pictograms, audio script, teach-back checklist.",
    gate: "Return warnings confirmed",
    title: "Patient understanding",
    type: "agent",
  },
  {
    agent: "Follow-up",
    detail: "Create call sheet, owner, timing, and escalation rule.",
    gate: "Owner assigned",
    title: "Continuity task",
    type: "output",
  },
] as const;

const protocolLibrary = [
  {
    checks: ["duration", "temperature", "rash", "hydration", "danger signs"],
    name: "Bangla fever desk",
    owner: "Nurse",
    status: "Active",
  },
  {
    checks: ["chest pain", "sweating", "diabetes", "shortness of breath"],
    name: "Chest pain escalation",
    owner: "Doctor",
    status: "Always escalate",
  },
  {
    checks: ["weeks pregnant", "bleeding", "fever", "urinary symptoms"],
    name: "Pregnancy warning lane",
    owner: "Doctor",
    status: "Protected",
  },
  {
    checks: ["age", "vomiting", "lethargy", "dehydration", "feeding"],
    name: "Child hydration pathway",
    owner: "Nurse",
    status: "Active",
  },
] as const;

const marketplaceTemplates = [
  "Rural clinic day",
  "Maternal care desk",
  "Diabetes follow-up camp",
  "School health camp",
  "Dengue triage week",
  "Medicine refill queue",
] as const;

export function AgenticWorkflowStudio({
  activeRole,
  cases,
  form,
  onCommand,
  output,
}: {
  activeRole: ClinicRole;
  cases: Doc<"cases">[] | undefined;
  form: IntakeFormState;
  onCommand: (command: string) => void;
  output: CopilotOutput | null;
}) {
  const [activeTab, setActiveTab] = useState<AgenticStudioTab>("canvas");
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate>(
    marketplaceTemplates[0],
  );
  const studioSignals = useMemo(
    () => buildStudioSignals({ cases, form, output }),
    [cases, form, output],
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading
            icon={<BrainCircuit size={18} aria-hidden="true" />}
            title="Agentic Workflow Studio"
            subtitle="Canvas builder, protocols, simulation lab, journey map, safety governor, and workflow marketplace"
          />
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  aria-label={`Open ${tab.label} workflow studio tab`}
                  key={tab.id}
                  size="sm"
                  type="button"
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} aria-hidden="true" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === "canvas" ? (
          <WorkflowCanvas
            activeRole={activeRole}
            onCommand={onCommand}
            signals={studioSignals}
          />
        ) : null}
        {activeTab === "governor" ? (
          <SafetyGovernor signals={studioSignals} onCommand={onCommand} />
        ) : null}
        {activeTab === "journey" ? (
          <PatientJourneyMap output={output} signals={studioSignals} />
        ) : null}
        {activeTab === "protocols" ? (
          <ProtocolLibrary onCommand={onCommand} />
        ) : null}
        {activeTab === "shift" ? (
          <ShiftCopilot cases={cases} signals={studioSignals} />
        ) : null}
        {activeTab === "simulation" ? (
          <SimulationLab onCommand={onCommand} signals={studioSignals} />
        ) : null}
        {activeTab === "templates" ? (
          <WorkflowMarketplace
            selectedTemplate={selectedTemplate}
            onCommand={onCommand}
            onSelect={setSelectedTemplate}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function WorkflowCanvas({
  activeRole,
  onCommand,
  signals,
}: {
  activeRole: ClinicRole;
  onCommand: (command: string) => void;
  signals: ReturnType<typeof buildStudioSignals>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-5">
        {canvasNodes.map((node, index) => (
          <div
            className={cn(
              "relative min-h-48 rounded-md border border-border bg-[#fffdf8] p-4",
              node.type === "gate" && "border-amber-200 bg-amber-50",
              node.type === "output" && "border-emerald-200 bg-emerald-50",
            )}
            key={node.title}
          >
            {index < canvasNodes.length - 1 ? (
              <div className="absolute top-1/2 right-[-18px] hidden h-px w-9 bg-border lg:block" />
            ) : null}
            <Badge variant="outline">{node.agent}</Badge>
            <h3 className="mt-3 font-bold text-sm">{node.title}</h3>
            <p className="mt-2 text-muted-foreground text-xs leading-5">
              {node.detail}
            </p>
            <div className="mt-3 rounded-md border border-border bg-white p-2">
              <p className="font-semibold text-[11px] text-primary uppercase">
                Gate
              </p>
              <p className="text-muted-foreground text-xs">{node.gate}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <StudioMetric
          label="Current role"
          value={activeRole.replace("_", " ")}
        />
        <StudioMetric
          label="Blocked gates"
          value={`${signals.blockers.length}`}
        />
        <StudioMetric label="Automation status" value="Ready to run" />
      </div>
      <Button
        type="button"
        onClick={() =>
          onCommand(
            "Plan next steps for this case and check approval readiness before print",
          )
        }
      >
        <GitBranch size={16} aria-hidden="true" />
        Run canvas preview
      </Button>
    </div>
  );
}

function SafetyGovernor({
  onCommand,
  signals,
}: {
  onCommand: (command: string) => void;
  signals: ReturnType<typeof buildStudioSignals>;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
        <ShieldCheck className="text-amber-700" size={28} aria-hidden="true" />
        <h3 className="mt-3 font-black text-2xl">Safety Governor</h3>
        <p className="mt-2 text-muted-foreground leading-7">
          A supervising agent blocks unsafe finalization, watches every other
          agent, and keeps patient-facing outputs in draft until reviewed.
        </p>
        <Button
          className="mt-4"
          type="button"
          onClick={() =>
            onCommand(
              "Check if vitals, allergy, return warnings, and red flags are complete",
            )
          }
        >
          Run safety audit
        </Button>
      </div>
      <div className="grid gap-2">
        {signals.blockers.map((blocker) => (
          <div
            className="rounded-md border border-border bg-white p-3"
            key={blocker}
          >
            <Badge variant="destructive">blocked</Badge>
            <p className="mt-2 text-sm">{blocker}</p>
          </div>
        ))}
        {signals.blockers.length === 0 ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <Badge variant="outline">ready for review</Badge>
            <p className="mt-2 text-sm">
              No current blockers detected, but human approval is still required
              before clinical or patient-facing output.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PatientJourneyMap({
  output,
  signals,
}: {
  output: CopilotOutput | null;
  signals: ReturnType<typeof buildStudioSignals>;
}) {
  const steps = [
    ["Reception", "Story, language, vitals", true],
    ["Nurse", "Safety gates and missing questions", signals.hasIntake],
    ["Doctor", "Draft, review, signoff", Boolean(output)],
    ["Patient", "Handout, audio, teach-back", Boolean(output?.patientHandout)],
    ["Follow-up", "Call sheet and owner", Boolean(output?.followUp)],
  ] as const;

  return (
    <div className="grid gap-3 md:grid-cols-5">
      {steps.map(([label, detail, complete], index) => (
        <div
          className={cn(
            "rounded-md border border-border bg-background p-4",
            complete && "border-emerald-200 bg-emerald-50",
          )}
          key={label}
        >
          <Badge variant="outline">{index + 1}</Badge>
          <h3 className="mt-3 font-bold">{label}</h3>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            {detail}
          </p>
        </div>
      ))}
    </div>
  );
}

function ProtocolLibrary({
  onCommand,
}: {
  onCommand: (command: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {protocolLibrary.map((protocol) => (
        <div
          className="rounded-md border border-border bg-white p-4"
          key={protocol.name}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">{protocol.name}</h3>
              <p className="text-muted-foreground text-sm">
                Owner: {protocol.owner}
              </p>
            </div>
            <Badge variant="outline">{protocol.status}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {protocol.checks.map((check) => (
              <Badge key={check} variant="secondary">
                {check}
              </Badge>
            ))}
          </div>
          <Button
            className="mt-4"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onCommand(commandForProtocol(protocol.name))}
          >
            Apply protocol
          </Button>
        </div>
      ))}
    </div>
  );
}

function ShiftCopilot({
  cases,
  signals,
}: {
  cases: Doc<"cases">[] | undefined;
  signals: ReturnType<typeof buildStudioSignals>;
}) {
  const followUps =
    cases?.filter((caseItem) => caseItem.status === "followup").length ?? 0;
  const review =
    cases?.filter((caseItem) => caseItem.status === "review").length ?? 0;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StudioMetric label="Needs review" value={`${review}`} />
      <StudioMetric label="Follow-up due" value={`${followUps}`} />
      <StudioMetric
        label="Safety blockers"
        value={`${signals.blockers.length}`}
      />
      <div className="rounded-md border border-border bg-white p-4 md:col-span-3">
        <h3 className="font-bold">Shift brief</h3>
        <p className="mt-2 text-muted-foreground leading-7">
          Start with red-flag lane, resolve missing vitals/allergies, assign
          follow-up owners, then print patient packets for reviewed cases.
        </p>
      </div>
    </div>
  );
}

function SimulationLab({
  onCommand,
  signals,
}: {
  onCommand: (command: string) => void;
  signals: ReturnType<typeof buildStudioSignals>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[
        ["Workflow completeness", "93"],
        ["Safety misses", signals.blockers.length ? "Needs review" : "0"],
        ["Print readiness", "92"],
        ["Follow-up ownership", "88"],
      ].map(([label, value]) => (
        <StudioMetric key={label} label={label} value={value} />
      ))}
      <Button
        className="md:col-span-4"
        type="button"
        onClick={() => onCommand("Run the full clinic workflow")}
      >
        <Activity size={16} aria-hidden="true" />
        Run synthetic clinic day
      </Button>
    </div>
  );
}

function WorkflowMarketplace({
  onCommand,
  onSelect,
  selectedTemplate,
}: {
  onCommand: (command: string) => void;
  onSelect: (template: MarketplaceTemplate) => void;
  selectedTemplate: MarketplaceTemplate;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {marketplaceTemplates.map((template) => (
        <button
          className={cn(
            "rounded-md border border-border bg-white p-4 text-left transition hover:border-primary",
            selectedTemplate === template && "border-primary bg-[#eaf6f1]",
          )}
          key={template}
          type="button"
          onClick={() => onSelect(template)}
        >
          <Sparkles className="text-primary" size={20} aria-hidden="true" />
          <h3 className="mt-3 font-bold">{template}</h3>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            Installs triggers, agent steps, human gates, print outputs, and
            follow-up ownership for this workflow.
          </p>
        </button>
      ))}
      <Button
        className="md:col-span-3"
        type="button"
        onClick={() => onCommand(commandForTemplate(selectedTemplate))}
      >
        <Users size={16} aria-hidden="true" />
        Install selected template
      </Button>
    </div>
  );
}

function commandForProtocol(protocolName: string) {
  const normalized = protocolName.toLowerCase();
  if (normalized.includes("chest")) {
    return "Load cardiac risk and generate a draft";
  }
  if (normalized.includes("pregnancy")) {
    return "Load pregnancy fever and generate a draft";
  }
  if (normalized.includes("child")) {
    return "Load child hydration and generate a draft";
  }
  return "Clean this intake and extract vitals";
}

function commandForTemplate(template: MarketplaceTemplate) {
  const normalized = template.toLowerCase();
  if (normalized.includes("maternal")) {
    return "Run the full clinic workflow for pregnancy fever";
  }
  if (normalized.includes("diabetes")) {
    return "Load diabetes wound and generate a draft";
  }
  if (normalized.includes("dengue")) {
    return "Load dengue watch and generate a draft";
  }
  if (normalized.includes("medicine")) {
    return "Check medicine safety for paracetamol 500mg and antibiotic twice daily";
  }
  if (normalized.includes("school")) {
    return "Load child hydration and generate a draft";
  }
  return "Run the full clinic workflow";
}

function StudioMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <p className="font-semibold text-muted-foreground text-xs uppercase">
        {label}
      </p>
      <p className="mt-2 font-black text-2xl">{value}</p>
    </div>
  );
}

function buildStudioSignals({
  cases,
  form,
  output,
}: {
  cases: Doc<"cases">[] | undefined;
  form: IntakeFormState;
  output: CopilotOutput | null;
}) {
  const intake = form.intake.toLowerCase();
  const blockers = [
    /(bp|temp|pulse|spo2|প্রেশার|তাপমাত্রা)/i.test(form.intake)
      ? null
      : "Vitals are missing or not clearly marked unavailable.",
    /(allerg|অ্যালার্জি|reaction)/i.test(form.intake)
      ? null
      : "Medicine allergy status is unknown.",
    /chest|tightness|sweating|shortness|বুক|শ্বাস/.test(intake)
      ? "Chest-pain or breathing-risk language requires escalation."
      : null,
    /pregnan|গর্ভ|26 weeks/.test(intake)
      ? "Pregnancy pathway requires clinician escalation."
      : null,
    output?.redFlags.length
      ? `${output.redFlags.length} generated red flags need human resolution.`
      : null,
  ].filter(Boolean) as string[];

  return {
    blockers,
    followUps:
      cases?.filter((caseItem) => caseItem.status === "followup").length ?? 0,
    hasIntake: form.intake.trim().length > 20,
  };
}
