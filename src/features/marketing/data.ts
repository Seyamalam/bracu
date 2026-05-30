import {
  Activity,
  AlarmClockCheck,
  BadgeCheck,
  BellRing,
  ClipboardCheck,
  ClipboardList,
  Command,
  FileCheck2,
  FileText,
  HandHeart,
  HeartPulse,
  History,
  Languages,
  Laptop,
  ListChecks,
  MessageSquareText,
  Mic,
  PhoneCall,
  PlayCircle,
  Printer,
  Radar,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  TabletSmartphone,
  Users,
  Workflow,
} from "lucide-react";

export const brand = {
  name: "Clinic Copilot BD",
  shortName: "Copilot BD",
  tagline: "Bangla-first clinic operations, not another generic chatbot.",
  logo: "/clinic-copilot-logo.svg",
} as const;

export const marketingImages = {
  family: "/images/clinic-copilot-family.png",
  hero: "/images/clinic-copilot-hero.png",
  operations: "/images/clinic-copilot-ops.png",
  product: "/images/clinic-copilot-product.png",
  teachBack: "/images/clinic-copilot-teachback.png",
} as const;

export const publicNav = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/mission", label: "Mission" },
  { href: "/pitch", label: "Pitch" },
  { href: "/login", label: "Login" },
] as const;

export const proofStats = [
  { label: "Core AI workflows", value: "20+" },
  { label: "BD demo cases", value: "6" },
  { label: "Languages", value: "BN/EN" },
] as const;

export const featurePillars = [
  {
    icon: FileText,
    title: "Intake to draft",
    body: "Turns messy Bangla, English, or mixed intake notes into clinician-reviewable summaries, SOAP support, missing questions, and red flags.",
  },
  {
    icon: ShieldCheck,
    title: "Safety guardrails",
    body: "Approval checks, medicine clarity review, risk explanations, audit trail, and visit closeout keep the AI framed as support.",
  },
  {
    icon: MessageSquareText,
    title: "Patient communication",
    body: "Creates printable handouts, follow-up messages, patient question answers, reply triage, and teach-back prompts.",
  },
  {
    icon: Activity,
    title: "Clinic operations",
    body: "Queue board, Operations Pulse, follow-up panel, trends, visit journey, and staffing focus turn the demo into a clinic cockpit.",
  },
  {
    icon: Languages,
    title: "Bangla-first care",
    body: "Built around Bangla-first workflows, low-literacy explanations, mixed-language intake, and printable family instructions.",
  },
  {
    icon: Smartphone,
    title: "Mobile desk ready",
    body: "Responsive layouts, accessibility display controls, print slips, and touch-friendly workflows for front desks and phones.",
  },
] as const;

export const missionPoints = [
  {
    title: "Mission",
    body: "Help small clinics in Bangladesh document faster, communicate clearly, and catch safety gaps without pretending AI replaces clinicians.",
  },
  {
    title: "Vision",
    body: "A practical operating layer for low-resource clinics where reception, nurses, doctors, and follow-up staff share one safer workflow.",
  },
  {
    title: "Principle",
    body: "AI drafts, staff verify, clinicians decide. Every patient-facing output is framed for review, teach-back, and follow-up ownership.",
  },
] as const;

export const pitchBeats = [
  "Small clinics lose time translating messy intake into safe clinical documentation.",
  "Clinic Copilot BD converts intake into structured workflow: draft, safety review, handout, follow-up, and closeout.",
  "The product is Bangladesh-native: Bangla-first, mobile-friendly, printable, low-literacy aware, and built for follow-up calls.",
  "The demo proves viability with seed cases, audit logs, queue operations, safety guardrails, and judge-ready progress surfaces.",
] as const;

export const pitchScorecards = [
  {
    label: "Problem clarity",
    value: "Bangla-first clinic bottleneck",
    proof: "Messy mixed-language intake becomes structured work in seconds.",
  },
  {
    label: "Technical depth",
    value: "AI SDK + Convex workflow",
    proof:
      "Live generation, persisted cases, audit trail, and realtime boards.",
  },
  {
    label: "Demo confidence",
    value: "3-minute judge rail",
    proof:
      "Scripted cases, command copilot, safety review, handout, follow-up.",
  },
  {
    label: "Real-world path",
    value: "Clinic operating layer",
    proof:
      "Roles, print slips, accessibility controls, and follow-up ownership.",
  },
] as const;

export const workflowSteps = [
  "Reception captures the story",
  "AI structures the visit",
  "Clinician reviews safety",
  "Family receives plain instructions",
  "Staff confirms teach-back",
  "Follow-up loop is owned",
] as const;

export const audienceCards = [
  {
    icon: Users,
    title: "For clinic teams",
    body: "One workspace for reception, nurse handoff, clinician review, patient education, and follow-up ownership.",
  },
  {
    icon: ClipboardCheck,
    title: "For judges",
    body: "A complete product story: public site, auth, live AI, Convex persistence, operational dashboard, and safety framing.",
  },
] as const;

export const interactionModes = [
  {
    command: "Load dengue watch and generate draft",
    icon: ClipboardList,
    label: "Reception",
    result:
      "Imports a Bangladesh-native case, fills intake, and creates the first AI draft.",
  },
  {
    command: "Explain red flags for the doctor",
    icon: Stethoscope,
    label: "Clinical review",
    result:
      "Surfaces missing questions, risk notes, and review-ready safety framing.",
  },
  {
    command: "Create Bangla handout and teach-back",
    icon: HandHeart,
    label: "Patient education",
    result:
      "Produces plain family instructions and a checklist staff can confirm aloud.",
  },
  {
    command: "Move to follow-up and brief the clinic",
    icon: Activity,
    label: "Operations",
    result:
      "Updates queue status, follow-up ownership, and the clinic briefing panel.",
  },
] as const;

export const featureCatalog = [
  {
    group: "AI workflow",
    icon: Sparkles,
    items: [
      "Mixed Bangla/English intake cleanup",
      "SOAP-style clinical draft",
      "Current-case AI Q&A",
      "Natural-language Command Copilot",
      "AI document extraction for OCR text",
      "Draft edit support with clinician review",
    ],
  },
  {
    group: "Safety",
    icon: ShieldCheck,
    items: [
      "Red-flag summary",
      "Missing question finder",
      "Medicine clarity checker",
      "Approval readiness guard",
      "Visit closeout checklist",
      "Safety frame that avoids diagnosis claims",
    ],
  },
  {
    group: "Patient communication",
    icon: MessageSquareText,
    items: [
      "Bangla/English patient handout",
      "Printable clinic slip",
      "Teach-back confirmation",
      "Patient question answer assistant",
      "Follow-up message composer",
      "Reply triage for incoming patient messages",
    ],
  },
  {
    group: "Operations",
    icon: Workflow,
    items: [
      "Realtime Convex case board",
      "Status transitions across the visit",
      "Operations Pulse",
      "Follow-up due panel",
      "Trend dashboard",
      "Clinic briefing for shift handoff",
    ],
  },
  {
    group: "Demo polish",
    icon: BadgeCheck,
    items: [
      "3-minute judge demo mode",
      "Six seeded Bangladesh case stories",
      "Win Readiness scorecard",
      "Presentation mode",
      "Impact snapshot",
      "Audit log viewer",
    ],
  },
  {
    group: "Access",
    icon: TabletSmartphone,
    items: [
      "Desktop sidebar workspace",
      "Mobile workspace rail",
      "Large text mode",
      "High contrast mode",
      "Calm motion mode",
      "Bangla-first copy surfaces",
    ],
  },
] as const;

export const homepageHighlights = [
  {
    icon: Mic,
    label: "Voice-ready intake",
    title: "Reception can talk, type, or paste.",
    body: "The demo supports fast intake entry and browser speech recognition where available.",
  },
  {
    icon: Radar,
    label: "Safety signal",
    title: "Red flags are visible early.",
    body: "The AI draft calls out urgent return warnings, missing details, and review needs.",
  },
  {
    icon: Printer,
    label: "Clinic slip",
    title: "Families leave with plain instructions.",
    body: "Patient-facing handouts are printable, bilingual, and designed for teach-back.",
  },
  {
    icon: BellRing,
    label: "Follow-up",
    title: "The loop does not vanish after checkout.",
    body: "Follow-up panels and schedulers help staff own the next patient touchpoint.",
  },
] as const;

export const demoRunbook = [
  {
    icon: PlayCircle,
    time: "0:00",
    title: "Open the judge rail",
    body: "Load a dengue-watch or child-dehydration case and show the mixed-language intake.",
  },
  {
    icon: Sparkles,
    time: "0:35",
    title: "Generate the draft",
    body: "Show chief complaint, timeline, missing questions, red flags, and SOAP support.",
  },
  {
    icon: ShieldCheck,
    time: "1:15",
    title: "Clinician review",
    body: "Run safety explanation, approval readiness, medicine clarity, and visit closeout.",
  },
  {
    icon: Printer,
    time: "2:05",
    title: "Patient handout",
    body: "Switch Bangla/English, print the slip, and complete teach-back.",
  },
  {
    icon: Activity,
    time: "2:45",
    title: "Operations proof",
    body: "Move the case to follow-up and show trends, audit log, and readiness score.",
  },
] as const;

export const trustPoints = [
  {
    icon: FileCheck2,
    title: "AI drafts, clinicians decide",
    body: "Every clinical output is positioned as review material, not an autonomous diagnosis.",
  },
  {
    icon: History,
    title: "Traceable workflow",
    body: "Case changes and important actions appear in the audit log for the demo story.",
  },
  {
    icon: Languages,
    title: "Bangla-first communication",
    body: "The product respects mixed-language clinic reality instead of forcing English-only workflows.",
  },
] as const;

export const productShots = [
  {
    body: "Queue pressure, status changes, and shift briefings help the clinic see what needs attention.",
    image: marketingImages.operations,
    kicker: "Operations cockpit",
    title: "The team sees the whole day, not one isolated chat.",
  },
  {
    body: "Handouts, teach-back, and follow-up messaging turn clinical notes into patient understanding.",
    image: marketingImages.family,
    kicker: "Patient clarity",
    title: "The last mile is designed for families.",
  },
] as const;

export const pitchDifferentiators = [
  {
    icon: Laptop,
    title: "Not a chatbot wrapper",
    body: "The UI is a full clinic operating surface with status, roles, actions, and accountability.",
  },
  {
    icon: HeartPulse,
    title: "Safety is the product",
    body: "Red flags, missing questions, medicine clarity, and approvals are first-class flows.",
  },
  {
    icon: PhoneCall,
    title: "Built after the visit too",
    body: "Follow-up composer, scheduler, reply triage, and due panels make continuity visible.",
  },
  {
    icon: AlarmClockCheck,
    title: "Judge-ready story",
    body: "A three-minute guided route proves the product without needing perfect live data.",
  },
  {
    icon: ListChecks,
    title: "Every feature has a job",
    body: "Each surface maps to intake, review, education, follow-up, operations, or proof.",
  },
  {
    icon: Command,
    title: "Commandable workflow",
    body: "The natural-language command layer can operate the demo like a power tool.",
  },
] as const;
