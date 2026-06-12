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
  tagline:
    "Bangla-first clinic operations with local or cloud AI and MCP-ready tools.",
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
  { label: "AI + agent workflows", value: "20+" },
  { label: "MCP tools", value: "12" },
  { label: "Model modes", value: "Local + cloud" },
] as const;

export const featurePillars = [
  {
    icon: FileText,
    title: "Intake to draft",
    body: "Turns messy Bangla, English, or mixed intake notes into clinician-reviewable summaries, SOAP support, missing questions, and red flags using local or cloud models.",
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
    body: "Queue board, Operations Pulse, follow-up panel, trends, visit journey, staffing focus, MCP tools, and audit receipts turn the demo into a clinic cockpit.",
  },
  {
    icon: Languages,
    title: "Bangla-first care",
    body: "Built around Bangla-first workflows, low-literacy explanations, mixed-language intake, and printable family instructions.",
  },
  {
    icon: Smartphone,
    title: "Local-first or cloud-ready",
    body: "Run with LM Studio on localhost, Google Gemini in the cloud, or deterministic fallbacks when no provider is configured.",
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
    value: "AI SDK + Convex + MCP",
    proof:
      "Local/cloud model switching, persisted cases, audit trail, MCP tools, and realtime boards.",
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
    body: "A complete product story: public site, auth, live AI, local-model support, Convex persistence, MCP server, operational dashboard, and safety framing.",
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
      "Local LM Studio provider through AI SDK OpenAI-compatible adapter",
      "Cloud Google Gemini provider through AI SDK",
      "Mixed Bangla/English intake cleanup",
      "SOAP-style clinical draft",
      "Current-case AI Q&A",
      "Natural-language Command Copilot",
      "One-click judge demo workflow",
      "Chat-first Copilot with patient, queue, safety, and follow-up threads",
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
      "Stdio MCP server for LM Studio, Claude, Codex, Cursor, and desktop clients",
      "mcp.json config for local MCP hosts",
      "Demo scenario resource",
      "Workflow capability resource",
      "AI workflow brief tool",
      "Role-aware tool registry for external agents",
      "Docs and API-callable MCP evidence path",
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
    body: "External agents can discover the product's tools, resources, server instructions, and demo-safe workflow boundaries through HTTP or stdio.",
    icon: Server,
    label: "Transports",
    title: "HTTP demo + stdio MCP",
  },
  {
    body: "The MCP server exposes synthetic clinic scenarios, safety gates, the tool registry, and workflow capabilities as readable resources.",
    icon: Database,
    label: "Resources",
    title: "Clinic context, safely scoped",
  },
  {
    body: "LM Studio, Claude, Codex, Cursor, and similar clients can spawn the stdio server from mcp.json and call clinic tools.",
    icon: Command,
    label: "Client setup",
    title: "mcp.json ready",
  },
  {
    body: "The AI layer supports LM Studio locally, Gemini in the cloud, and deterministic fallback output when a model is unavailable.",
    icon: ShieldCheck,
    label: "Model policy",
    title: "Local or cloud AI",
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
    title: "MCP server and clients",
  },
  {
    body: "Local LM Studio, cloud Gemini, prompt patterns, safety rules, fallbacks, and synthetic-data boundaries.",
    label: "AI depth",
    title: "Model providers",
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
      "For local AI, start LM Studio on http://127.0.0.1:1234 and run AI_PROVIDER=lmstudio LMSTUDIO_MODEL='google/gemma-4-12b' bun run dev.",
      "For cloud AI, set GOOGLE_GENERATIVE_AI_API_KEY. With neither provider, verify the demo fallback still returns safe draft output.",
      "Run bun run mcp:smoke to prove the stdio MCP server lists tools and calls safety blockers.",
    ],
    title: "1. Local setup",
  },
  {
    steps: [
      "Open /clinic/copilot and sign in or create a demo session, then click Judge demo for the full agentic workflow.",
      "Open /judge first if presenting to judges; it gives the full project story, report facts, and demo route.",
      "Use the three current workspaces: Copilot, Case, and Queue.",
      "Confirm Copilot can switch between patient, queue, safety, and follow-up threads.",
      "Open Queue to check the red-flag lane, waiting-time labels, follow-up due clock, and staff owner badges on the case board.",
    ],
    title: "2. Judge and queue pass",
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
      "Use Copilot to ask for a doctor summary, medicine slip, referral, follow-up call sheet, or simple Bangla handout.",
      "Click Judge demo to run the pregnancy fever workflow across draft generation, document extraction, safety blockers, medicine review, handoff, closeout, and queue briefing.",
      "Open the Copilot workspace for chat, tool runs, approvals, and MCP-style commands.",
      "Use Ask Copilot from Case or Queue to confirm page-aware help is available outside the main chat.",
      "Check AI Run Receipts and Approvals Inbox for safety status, role, timestamp, and human-review boundaries.",
      "Review recent runs and agent messages for clear status and human approval boundaries.",
    ],
    title: "4. Agentic Copilot pass",
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
      "Call /api/mcp or run bun run mcp:smoke for tools/list or safety blocker calls.",
      "Paste mcp.json into LM Studio or another MCP host and enable the host's permission to call configured MCP servers.",
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
  "stdio MCP server: scripts/mcp-stdio.ts",
  "mcp.json: clinic-copilot-bd",
  "initialize",
  "tools/list",
  "tools/call",
  "resources/list",
  "resources/read",
] as const;

export const docsMcpToolGroups = [
  "clinic.demo_manifest / clinic.list_demo_scenarios",
  "clinic.workflow_brief",
  "clinic.tools.list / clinic.tools.describe",
  "clinic.queue.snapshot",
  "clinic.safety.get_blockers",
  "clinic.print.prepare_packet",
  "clinic.literacy.prepare",
  "clinic.sync.preview_queue",
  "clinic.approval.request",
  "clinic.demo.score_scenario",
] as const;

export const docsMcpClientSetup = [
  {
    body: 'Paste mcp.json into LM Studio, enable Allow calling servers from mcp.json in Server Settings, then call /api/v1/chat with integrations: ["mcp/clinic-copilot-bd"].',
    command:
      'curl -s http://127.0.0.1:1234/api/v1/chat -H \'content-type: application/json\' -d \'{"model":"google/gemma-4-12b","input":"Use clinic-copilot-bd to list tools","integrations":["mcp/clinic-copilot-bd"]}\'',
    title: "LM Studio",
  },
  {
    body: "Use the mcpServers entry from mcp.json. The client spawns bun and talks to scripts/mcp-stdio.ts over stdio.",
    command: "bun run mcp:smoke",
    title: "Claude, Codex, Cursor",
  },
  {
    body: "For quick browser or curl demos, keep using /api/mcp. It speaks JSON-RPC over POST and mirrors the tool/resource catalog for reviewers.",
    command:
      'curl -s http://localhost:3000/api/mcp -H \'content-type: application/json\' -d \'{"jsonrpc":"2.0","id":1,"method":"tools/list"}\'',
    title: "HTTP demo endpoint",
  },
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
      "MCP-callable workflow briefs with summary, missing questions, red flags, and follow-up ownership over stdio or HTTP demo calls.",
    title: "MCP Workflow Brief",
  },
] as const;

export const docsAiPractices = [
  "Synthetic demo cases only; no real patient data in the submitted demo.",
  "Local LM Studio models run through the AI SDK OpenAI-compatible provider.",
  "Cloud Gemini models run through @ai-sdk/google for structured workflow generation.",
  "Zod schemas validate AI outputs, MCP JSON-RPC payloads, and tool arguments.",
  "Prompts explicitly block diagnosis, prescription, and autonomous clinical decisions.",
  "Every patient-facing and clinical output is framed as draft support for clinician review.",
  "Provider failure and no-key fallback responses keep the product testable when models are unavailable.",
] as const;

export const docsModelProviderNotes = [
  {
    label: "Local",
    title: "LM Studio",
    body: "Set AI_PROVIDER=lmstudio and LMSTUDIO_MODEL=google/gemma-4-12b. System instructions are folded into the user prompt for local models that do not support system messages.",
  },
  {
    label: "Cloud",
    title: "Google Gemini",
    body: "Set GOOGLE_GENERATIVE_AI_API_KEY and optionally GOOGLE_GENERATIVE_AI_MODEL. The same routes use structured AI SDK outputs with provider-failure fallback.",
  },
  {
    label: "No key",
    title: "Deterministic fallback",
    body: "When no provider is configured, every AI route still returns safe demo output so the public demo, browser QA, and MCP smoke path remain usable.",
  },
] as const;
