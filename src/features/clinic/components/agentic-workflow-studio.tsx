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
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLanguage } from "@/features/language/language-context";
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
  const t = useWorkflowStudioText();
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
            title={t("Agentic Workflow Studio")}
            subtitle={t(
              "Canvas builder, protocols, simulation lab, journey map, safety governor, and workflow marketplace",
            )}
          />
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  aria-label={`${t("Open workflow studio tab")}: ${t(tab.label)}`}
                  key={tab.id}
                  size="sm"
                  type="button"
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={15} aria-hidden="true" />
                  {t(tab.label)}
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
  const t = useWorkflowStudioText();
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
            <Badge variant="outline">{t(node.agent)}</Badge>
            <h3 className="mt-3 font-bold text-sm">{t(node.title)}</h3>
            <p className="mt-2 text-muted-foreground text-xs leading-5">
              {t(node.detail)}
            </p>
            <div className="mt-3 rounded-md border border-border bg-white p-2">
              <p className="font-semibold text-[11px] text-primary uppercase">
                {t("Gate")}
              </p>
              <p className="text-muted-foreground text-xs">{t(node.gate)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <StudioMetric
          label={t("Current role")}
          value={t(activeRole.replace("_", " "))}
        />
        <StudioMetric
          label={t("Blocked gates")}
          value={`${signals.blockers.length}`}
        />
        <StudioMetric
          label={t("Automation status")}
          value={t("Ready to run")}
        />
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
        {t("Run canvas preview")}
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
  const t = useWorkflowStudioText();
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-5">
        <ShieldCheck className="text-amber-700" size={28} aria-hidden="true" />
        <h3 className="mt-3 font-black text-2xl">{t("Safety Governor")}</h3>
        <p className="mt-2 text-muted-foreground leading-7">
          {t(
            "A supervising agent blocks unsafe finalization, watches every other agent, and keeps patient-facing outputs in draft until reviewed.",
          )}
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
          {t("Run safety audit")}
        </Button>
      </div>
      <div className="grid gap-2">
        {signals.blockers.map((blocker) => (
          <div
            className="rounded-md border border-border bg-white p-3"
            key={blocker}
          >
            <Badge variant="destructive">{t("blocked")}</Badge>
            <p className="mt-2 text-sm">{t(blocker)}</p>
          </div>
        ))}
        {signals.blockers.length === 0 ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
            <Badge variant="outline">{t("ready for review")}</Badge>
            <p className="mt-2 text-sm">
              {t(
                "No current blockers detected, but human approval is still required before clinical or patient-facing output.",
              )}
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
  const t = useWorkflowStudioText();
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
          <h3 className="mt-3 font-bold">{t(label)}</h3>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            {t(detail)}
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
  const t = useWorkflowStudioText();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {protocolLibrary.map((protocol) => (
        <div
          className="rounded-md border border-border bg-white p-4"
          key={protocol.name}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">{t(protocol.name)}</h3>
              <p className="text-muted-foreground text-sm">
                {t("Owner")}: {t(protocol.owner)}
              </p>
            </div>
            <Badge variant="outline">{t(protocol.status)}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {protocol.checks.map((check) => (
              <Badge key={check} variant="secondary">
                {t(check)}
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
            {t("Apply protocol")}
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
  const t = useWorkflowStudioText();
  const followUps =
    cases?.filter((caseItem) => caseItem.status === "followup").length ?? 0;
  const review =
    cases?.filter((caseItem) => caseItem.status === "review").length ?? 0;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StudioMetric label={t("Needs review")} value={`${review}`} />
      <StudioMetric label={t("Follow-up due")} value={`${followUps}`} />
      <StudioMetric
        label={t("Safety blockers")}
        value={`${signals.blockers.length}`}
      />
      <div className="rounded-md border border-border bg-white p-4 md:col-span-3">
        <h3 className="font-bold">{t("Shift brief")}</h3>
        <p className="mt-2 text-muted-foreground leading-7">
          {t(
            "Start with red-flag lane, resolve missing vitals/allergies, assign follow-up owners, then print patient packets for reviewed cases.",
          )}
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
  const t = useWorkflowStudioText();
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {[
        ["Workflow completeness", "93"],
        ["Safety misses", signals.blockers.length ? "Needs review" : "0"],
        ["Print readiness", "92"],
        ["Follow-up ownership", "88"],
      ].map(([label, value]) => (
        <StudioMetric key={label} label={t(label)} value={t(value)} />
      ))}
      <Button
        className="md:col-span-4"
        type="button"
        onClick={() => onCommand("Run the full clinic workflow")}
      >
        <Activity size={16} aria-hidden="true" />
        {t("Run synthetic clinic day")}
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
  const t = useWorkflowStudioText();
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
          <h3 className="mt-3 font-bold">{t(template)}</h3>
          <p className="mt-2 text-muted-foreground text-sm leading-6">
            {t(
              "Installs triggers, agent steps, human gates, print outputs, and follow-up ownership for this workflow.",
            )}
          </p>
        </button>
      ))}
      <Button
        className="md:col-span-3"
        type="button"
        onClick={() => onCommand(commandForTemplate(selectedTemplate))}
      >
        <Users size={16} aria-hidden="true" />
        {t("Install selected template")}
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

function useWorkflowStudioText() {
  const { language } = useLanguage();
  return useCallback(
    (text: string) =>
      language === "bn" ? (workflowStudioBn[text] ?? text) : text,
    [language],
  );
}

const workflowStudioBn: Record<string, string> = {
  "0": "০",
  "88": "৮৮",
  "92": "৯২",
  "93": "৯৩",
  Active: "অ্যাকটিভ",
  "Agentic Workflow Studio": "এজেন্টিক ওয়ার্কফ্লো স্টুডিও",
  "Allergy status is unknown.": "অ্যালার্জি স্ট্যাটাস অজানা।",
  "Always escalate": "সবসময় এসকেলেট",
  "A supervising agent blocks unsafe finalization, watches every other agent, and keeps patient-facing outputs in draft until reviewed.":
    "একটি সুপারভাইজিং এজেন্ট অনিরাপদ ফাইনালাইজেশন ব্লক করে, অন্য এজেন্টগুলো নজরদারি করে, এবং রিভিউ না হওয়া পর্যন্ত রোগীমুখী আউটপুট ড্রাফট রাখে।",
  "Automation status": "অটোমেশন স্ট্যাটাস",
  "Bangla fever desk": "বাংলা জ্বর ডেস্ক",
  "Blocked gates": "ব্লকড গেট",
  Canvas: "ক্যানভাস",
  "Canvas builder, protocols, simulation lab, journey map, safety governor, and workflow marketplace":
    "ক্যানভাস বিল্ডার, প্রোটোকল, সিমুলেশন ল্যাব, জার্নি ম্যাপ, সেফটি গভর্নর ও ওয়ার্কফ্লো মার্কেটপ্লেস",
  "Call sheet and owner": "কল শিট ও দায়িত্বপ্রাপ্ত",
  "Capture story, vitals, documents, language, and queue reason.":
    "গল্প, ভাইটাল, ডকুমেন্ট, ভাষা ও কিউয়ের কারণ নিন।",
  "Chest pain escalation": "বুকব্যথা এসকেলেশন",
  "Chest-pain or breathing-risk language requires escalation.":
    "বুকব্যথা বা শ্বাসঝুঁকির ভাষায় এসকেলেশন প্রয়োজন।",
  "Check pregnancy, child danger signs, chest pain, allergies.":
    "গর্ভাবস্থা, শিশুর বিপদচিহ্ন, বুকব্যথা, অ্যালার্জি চেক করুন।",
  "Child hydration pathway": "শিশু হাইড্রেশন পথ",
  "Clinical draft": "ক্লিনিক্যাল ড্রাফট",
  "Continuity task": "কন্টিনিউটি টাস্ক",
  "Current role": "বর্তমান রোল",
  Doctor: "ডাক্তার",
  "Doctor signoff": "ডাক্তার সাইনঅফ",
  "Draft, review, signoff": "ড্রাফট, রিভিউ, সাইনঅফ",
  "Dengue triage week": "ডেঙ্গু ট্রায়াজ সপ্তাহ",
  "Diabetes follow-up camp": "ডায়াবেটিস ফলো-আপ ক্যাম্প",
  "Escalate red flags": "রেড ফ্ল্যাগ এসকেলেট করুন",
  "Follow-up": "ফলো-আপ",
  "Follow-up due": "ফলো-আপ বাকি",
  "Follow-up ownership": "ফলো-আপ দায়িত্ব",
  Gate: "গেট",
  Governor: "গভর্নর",
  "Install selected template": "নির্বাচিত টেমপ্লেট ইনস্টল করুন",
  "Installs triggers, agent steps, human gates, print outputs, and follow-up ownership for this workflow.":
    "এই ওয়ার্কফ্লোর জন্য ট্রিগার, এজেন্ট ধাপ, মানব গেট, প্রিন্ট আউটপুট ও ফলো-আপ দায়িত্ব ইনস্টল করে।",
  Journey: "জার্নি",
  Marketplace: "মার্কেটপ্লেস",
  "Maternal care desk": "মাতৃসেবা ডেস্ক",
  "Medicine allergy status is unknown.": "ওষুধ অ্যালার্জি স্ট্যাটাস অজানা।",
  "Medicine refill queue": "ওষুধ রিফিল কিউ",
  "Needs review": "রিভিউ প্রয়োজন",
  "New intake trigger": "নতুন ইনটেক ট্রিগার",
  "No current blockers detected, but human approval is still required before clinical or patient-facing output.":
    "বর্তমানে কোনো ব্লকার পাওয়া যায়নি, তবে ক্লিনিক্যাল বা রোগীমুখী আউটপুটের আগে মানব অনুমোদন এখনও প্রয়োজন।",
  Nurse: "নার্স",
  "Open workflow studio tab": "ওয়ার্কফ্লো স্টুডিও ট্যাব খুলুন",
  Owner: "দায়িত্বপ্রাপ্ত",
  "Owner assigned": "দায়িত্বপ্রাপ্ত নির্ধারিত",
  Patient: "রোগী",
  "Patient Literacy": "রোগী লিটারেসি",
  "Patient understanding": "রোগীর বোঝাপড়া",
  "Pregnancy pathway requires clinician escalation.":
    "গর্ভাবস্থা পথে ক্লিনিশিয়ান এসকেলেশন প্রয়োজন।",
  "Pregnancy warning lane": "গর্ভাবস্থা সতর্কতা লেন",
  "Prepare SOAP draft, referral packet, and review checklist.":
    "SOAP ড্রাফট, রেফারাল প্যাকেট ও রিভিউ চেকলিস্ট প্রস্তুত করুন।",
  Protected: "প্রটেক্টেড",
  Protocols: "প্রোটোকল",
  "Ready to run": "চালানোর জন্য প্রস্তুত",
  Reception: "রিসেপশন",
  "Return warnings confirmed": "রিটার্ন ওয়ার্নিং নিশ্চিত",
  "Run canvas preview": "ক্যানভাস প্রিভিউ চালান",
  "Run safety audit": "সেফটি অডিট চালান",
  "Run synthetic clinic day": "সিন্থেটিক ক্লিনিক দিন চালান",
  "Rural clinic day": "গ্রামীণ ক্লিনিক দিন",
  Safety: "সেফটি",
  "Safety blockers": "সেফটি ব্লকার",
  "Safety gates and missing questions": "সেফটি গেট ও মিসিং প্রশ্ন",
  "Safety governor": "সেফটি গভর্নর",
  "School health camp": "স্কুল স্বাস্থ্য ক্যাম্প",
  Shift: "শিফট",
  "Shift brief": "শিফট ব্রিফ",
  Simulation: "সিমুলেশন",
  "Simple Bangla, pictograms, audio script, teach-back checklist.":
    "সহজ বাংলা, পিক্টোগ্রাম, অডিও স্ক্রিপ্ট, টিচ-ব্যাক চেকলিস্ট।",
  "Start with red-flag lane, resolve missing vitals/allergies, assign follow-up owners, then print patient packets for reviewed cases.":
    "রেড-ফ্ল্যাগ লেন দিয়ে শুরু করুন, মিসিং ভাইটাল/অ্যালার্জি সমাধান করুন, ফলো-আপ দায়িত্বপ্রাপ্ত নির্ধারণ করুন, তারপর রিভিউড কেসের রোগী প্যাকেট প্রিন্ট করুন।",
  "Story, language, vitals": "গল্প, ভাষা, ভাইটাল",
  "Vitals are missing or not clearly marked unavailable.":
    "ভাইটাল মিসিং বা অনুপস্থিত হিসেবে পরিষ্কারভাবে চিহ্নিত নয়।",
  "Vitals required": "ভাইটাল প্রয়োজন",
  "Workflow completeness": "ওয়ার্কফ্লো পূর্ণতা",
  "Safety misses": "সেফটি মিস",
  "Print readiness": "প্রিন্ট রেডিনেস",
  age: "বয়স",
  bleeding: "রক্তপাত",
  "chest pain": "বুকব্যথা",
  "danger signs": "বিপদচিহ্ন",
  dehydration: "পানিশূন্যতা",
  diabetes: "ডায়াবেটিস",
  duration: "সময়কাল",
  feeding: "খাওয়ানো",
  fever: "জ্বর",
  hydration: "হাইড্রেশন",
  lethargy: "অলসতা",
  rash: "র‍্যাশ",
  "ready for review": "রিভিউয়ের জন্য প্রস্তুত",
  sweating: "ঘাম",
  "shortness of breath": "শ্বাসকষ্ট",
  temperature: "তাপমাত্রা",
  vomiting: "বমি",
  "weeks pregnant": "গর্ভাবস্থার সপ্তাহ",
};
