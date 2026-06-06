import {
  Activity,
  AlarmClockCheck,
  BadgeCheck,
  BellRing,
  ClipboardCheck,
  ClipboardList,
  Command,
  Database,
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
  Server,
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
  { href: "/docs", label: "Docs" },
  { href: "/judge", label: "Judge" },
  { href: "/mission", label: "Mission" },
  { href: "/pitch", label: "Pitch" },
  { href: "/login", label: "Login" },
] as const;

export const proofStats = [
  { label: "Core AI workflows", value: "20+" },
  { label: "BD demo cases", value: "6" },
  { label: "MCP endpoint", value: "/api/mcp" },
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
  "The demo proves viability with seed cases, audit logs, queue operations, safety guardrails, and product-ready progress surfaces.",
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
    value: "3-minute guided rail",
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
    title: "For product review",
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
      "Agent Command Center with named tools",
      "Agentic Workflow Studio",
      "Canvas-style automation preview",
      "AI Run Receipts",
      "Approvals Inbox",
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
      "Safety Governor supervising agent outputs",
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
      "Patient journey map across roles",
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
      "Shift Copilot for handoff briefings",
      "Protocol library for local workflows",
      "Simulation lab for judging and drills",
      "Workflow template marketplace",
    ],
  },
  {
    group: "MCP data layer",
    icon: Server,
    items: [
      "JSON-RPC MCP endpoint at /api/mcp",
      "Demo scenario resource",
      "Workflow capability resource",
      "AI workflow brief tool",
      "Role-aware tool registry for external agents",
      "In-app MCP Explorer",
      "Queue, safety, print, literacy, sync, approval, and simulation MCP tools",
      "Safety instructions in server metadata",
    ],
  },
  {
    group: "Demo polish",
    icon: BadgeCheck,
    items: [
      "3-minute guided workflow",
      "Six seeded Bangladesh case stories",
      "Readiness scorecard",
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

export const mcpPublicCards = [
  {
    body: "External agents can discover the product's tools, resources, server instructions, and demo-safe workflow boundaries.",
    icon: Server,
    label: "Endpoint",
    title: "/api/mcp",
  },
  {
    body: "The server exposes synthetic clinic scenarios and the workflow capability map as readable MCP resources.",
    icon: Database,
    label: "Resources",
    title: "Clinic context, safely scoped",
  },
  {
    body: "MCP clients can request an intake workflow brief powered by Gemini when a key is present, with demo fallback always available.",
    icon: Command,
    label: "Tool call",
    title: "clinic.workflow_brief",
  },
  {
    body: "The MCP instructions explicitly frame AI output as draft operational support, keeping clinicians in charge.",
    icon: ShieldCheck,
    label: "Governance",
    title: "Safety travels with the API",
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
    title: "Open the guided rail",
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

export const productScreenshots = [
  {
    body: "The first authenticated screen gives staff a clear guided-workflow start and quick jumps into intake, review, and operations.",
    image: "/screenshots/clinic-workspace-overview.png",
    label: "Overview",
    title: "Start the clinic workflow from one obvious command center.",
  },
  {
    body: "The review workspace keeps risk rationale, staff handoff, case Q&A, doctor notes, approval checks, and closeout work together.",
    image: "/screenshots/clinic-workspace-review.png",
    label: "Clinical review",
    title: "Clinician review is a focused workspace, not a scroll target.",
  },
  {
    body: "The operations workspace shows model settings, accessibility controls, readiness, live queue, follow-up, trends, briefing, and audit trail.",
    image: "/screenshots/clinic-workspace-ops.png",
    label: "Operations",
    title: "The clinic can see the whole day in one operational view.",
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
    title: "Presentation-ready story",
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

export const docsQuickLinks = [
  {
    body: "JSON-RPC endpoint, tools, resources, permissions, and test payloads for external agent clients.",
    label: "Protocol",
    title: "MCP server",
  },
  {
    body: "Data sources, Gemini usage, prompt patterns, safety rules, and synthetic-data boundaries.",
    label: "AI depth",
    title: "Provenance",
  },
  {
    body: "Frameworks, deployment, environment variables, and quality checks for reviewers and teammates.",
    label: "Build",
    title: "Engineering notes",
  },
] as const;

export const docsTesterWalkthrough = [
  {
    steps: [
      "Install packages with bun install, then run bun run dev and open http://localhost:3000.",
      "For the live backend path, run npx convex dev in a second terminal and confirm the app loads demo clinic data.",
      "Set GOOGLE_GENERATIVE_AI_API_KEY before testing live AI; without it, verify the demo fallback still returns safe draft output.",
    ],
    title: "1. Local setup",
  },
  {
    steps: [
      "Open /login and sign in or create a demo session, then enter the clinic workspace.",
      "Open /judge first if presenting to judges; it gives the clean three-minute route.",
      "Use the six main workspaces: Queue, Case, AI, Operations, Builder, and Admin.",
      "Switch between Reception, Nurse, Doctor, Follow-up desk, and Admin roles and confirm each role changes ownership context.",
      "Check the red-flag lane, waiting-time labels, follow-up due clock, and staff owner badges on the case board.",
    ],
    title: "2. Role and queue pass",
  },
  {
    steps: [
      "Create or select a patient case and run the intake AI action.",
      "Confirm step completion states move from queued to running to complete, and that toast/progress feedback appears during the action.",
      "Verify vitals are required before clinical draft completion and that pregnancy, child, chest-pain, and severe-symptom paths escalate instead of quietly passing.",
    ],
    title: "3. Intake and safety gates",
  },
  {
    steps: [
      "Use the agent command bar to ask for a doctor summary, medicine slip, referral, follow-up call sheet, or pictogram handout.",
      "Open the command palette and run named tools from the Clinic Agent Swarm.",
      "Open the Copilot workspace for chat, tool runs, approvals, memory, MCP-style commands, and agent timeline.",
      "Use Ask Copilot from Queue, Case, Operations, Builder, and Admin to confirm page-aware help is always available.",
      "Check AI Run Receipts and Approvals Inbox for safety status, role, timestamp, and human-review boundaries.",
      "Open Builder for Agentic Workflow Studio and click Canvas, Governor, Journey, Protocols, Shift, Simulation, and Marketplace.",
      "Review the live tool stream, agent memory, agent inbox, command replay, and simulation judge output for clear status and human approval boundaries.",
    ],
    title: "4. Agent operating system",
  },
  {
    steps: [
      "Generate the handout in simple Bangla mode, then check pictogram, audio readout, and family teach-back checklist states.",
      "Confirm the medicine allergy check and return-warning confirmation block unsafe finalization until acknowledged.",
      "Use print preview for handout, referral, medicine slip, doctor summary, and follow-up call sheet outputs.",
    ],
    title: "5. Patient-facing and print workflows",
  },
  {
    steps: [
      "Turn on low-connectivity mode, create local drafts, and confirm queued sync status is visible.",
      "Return online and verify sync status updates without losing draft content.",
      "Open Admin and run MCP Explorer for tools/list or safety blocker calls.",
      "Capture screenshots of the queue, AI progress, safety gate, print preview, and low-connectivity states for the judging report.",
    ],
    title: "6. Offline and evidence pass",
  },
] as const;

export const docsTesterChecklist = [
  "No AI output should be presented as diagnosis, prescription, or autonomous clinical decision.",
  "Every clinical, patient-facing, and printable output must remain a draft until a human reviews it.",
  "Buttons and icon actions should expose understandable labels for keyboard users, screen readers, and automation.",
  "Escalation states must be visually obvious and should name the reason for escalation.",
  "The app should remain usable when live AI or connectivity is unavailable.",
] as const;

export const docsMcpMethods = [
  "initialize",
  "tools/list",
  "tools/call",
  "resources/list",
  "resources/read",
] as const;

export const docsMcpToolGroups = [
  "clinic.tools.list / clinic.tools.describe",
  "clinic.queue.snapshot",
  "clinic.safety.get_blockers",
  "clinic.print.prepare_packet",
  "clinic.literacy.prepare",
  "clinic.sync.preview_queue",
  "clinic.approval.request",
  "clinic.demo.score_scenario",
] as const;

export const docsPromptLibrary = [
  {
    category: "Data Processing",
    output:
      "Structured intake summaries, missing question lists, red-flag notes, and clinician-reviewable workflow data.",
    title: "Safe Intake Cleanup",
  },
  {
    category: "Feature Generation",
    output:
      "Bilingual patient-facing handouts, care-step summaries, urgent return warnings, and teach-back prompts.",
    title: "Patient Handout Generator",
  },
  {
    category: "System Prompt",
    output:
      "MCP-callable workflow briefs with summary, missing questions, red flags, and follow-up ownership.",
    title: "MCP Workflow Brief",
  },
] as const;

export const docsAiPractices = [
  "Synthetic demo cases only; no real patient data in the submitted demo.",
  "Gemini 2.5 Flash through Vercel AI SDK for structured workflow generation.",
  "Zod schemas validate AI outputs, MCP JSON-RPC payloads, and tool arguments.",
  "Prompts explicitly block diagnosis, prescription, and autonomous clinical decisions.",
  "Every patient-facing and clinical output is framed as draft support for clinician review.",
  "Demo fallback responses keep the product testable when an AI key is unavailable.",
] as const;
