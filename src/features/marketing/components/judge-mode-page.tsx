"use client";

import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Globe2,
  HeartPulse,
  Laptop,
  LockKeyhole,
  Network,
  PlayCircle,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/features/language/language-context";
import { LanguageToggle } from "@/features/language/language-toggle";
import { BrandMark } from "./brand-mark";

const demoRoute = [
  {
    detail:
      "Click Judge demo on /clinic/copilot. It loads a pregnancy fever case with prescription text, lab report facts, mixed Bangla-English intake, and safety blockers.",
    icon: PlayCircle,
    title: "1. One-click agentic run",
  },
  {
    detail:
      "Show how the command maps to document extraction, intake cleanup, draft generation, medicine safety, risk explanation, handoff, referral, follow-up, closeout, and queue briefing.",
    icon: Bot,
    title: "2. Multi-tool workflow",
  },
  {
    detail:
      "Open Case to show intake, draft support, clinical safety gates, approval readiness, visit closeout, patient handout, and print packet.",
    icon: HeartPulse,
    title: "3. Clinical review surface",
  },
  {
    detail:
      "Open Queue to show red-flag lane, status filters, owners, follow-up clocks, operations pulse, and clinic briefing.",
    icon: Activity,
    title: "4. Operations proof",
  },
  {
    detail:
      "Mention local LM Studio, cloud Gemini, deterministic fallback, /api/mcp, stdio MCP server, and human review as the safety boundary.",
    icon: Network,
    title: "5. Platform proof",
  },
] as const;

const reportStats = [
  ["Bangladesh population", "173.6M", "Large frontline-care impact surface."],
  ["Physicians", "0.722 / 1,000", "Staff need support before doctor review."],
  [
    "Out-of-pocket share",
    "79.3%",
    "Avoidable revisits are costly for families.",
  ],
  ["MCP tools", "12", "External agents can call bounded workflows."],
  [
    "Autonomous clinical decisions",
    "0",
    "The product drafts; clinicians decide.",
  ],
] as const;

const painResponse = [
  [
    "Reception captures incomplete information",
    "Bangla/English intake cleanup, missing question finder, and safety gate prompts.",
  ],
  [
    "Doctor is overloaded",
    "Queue risk summary, red-flag lane, concise handoff, and clinician-review drafts.",
  ],
  [
    "Nurses juggle safety and coordination",
    "Vitals/allergy blockers, staff task list, approval readiness, and closeout checklist.",
  ],
  [
    "Patient instructions are unclear",
    "Simple Bangla handout, teach-back checklist, urgent return warnings, and follow-up message.",
  ],
  [
    "Follow-up falls through the cracks",
    "Follow-up due panel, call ownership, reply triage, and queue briefing.",
  ],
  [
    "Clinic owner lacks quality visibility",
    "Run receipts, operations pulse, trends, MCP resources, and audit-ready workflow output.",
  ],
] as const;

const safetyRules = [
  "Summarize intake, suggest missing questions, draft handoff, draft education, flag blockers, and prepare review packets.",
  "Do not diagnose, prescribe, approve final care, dismiss urgent symptoms, or finalize patient-facing instructions.",
  "Patient-facing, printable, referral, and clinical outputs stay draft-only until a human reviews them.",
  "Provider failure falls back to deterministic safe output so demos and training do not depend on fragile API state.",
] as const;

const mcpTools = [
  "clinic.demo_manifest",
  "clinic.list_demo_scenarios",
  "clinic.workflow_brief",
  "clinic.tools.list",
  "clinic.tools.describe",
  "clinic.queue.snapshot",
  "clinic.safety.get_blockers",
  "clinic.print.prepare_packet",
  "clinic.literacy.prepare",
  "clinic.sync.preview_queue",
  "clinic.approval.request",
  "clinic.demo.score_scenario",
] as const;

const stackRows = [
  ["Frontend", "Next.js App Router, React, TypeScript, Tailwind CSS"],
  ["Backend", "Convex realtime data plus Next.js API routes"],
  [
    "AI",
    "Vercel AI SDK, Google Gemini, LM Studio via OpenAI-compatible provider",
  ],
  ["MCP", "@modelcontextprotocol/sdk, stdio server, JSON-RPC HTTP demo route"],
  ["Validation", "Zod schemas, deterministic fallbacks, Bun tests, Biome"],
] as const;

const milestones = [
  "Add explicit provider status: local live, cloud live, fallback, timeout.",
  "Build offline-first Android wrapper or PWA field mode.",
  "Add maternal, child, and NCD-specific field protocols.",
  "Add supervisor dashboard for CHW and small-hospital programs.",
  "Add exportable program reports and privacy-hardened production authentication.",
  "Pilot with synthetic or anonymized workflows before any real patient use.",
] as const;

const sourceNotes = [
  "Report source: reports/clinic-copilot-bd-health-worker-report.pdf and companion TeX source.",
  "World Bank Bangladesh population, physician density, and out-of-pocket expenditure indicators.",
  "WHO universal health coverage and health workforce reporting.",
  "Bangladesh Digital Health Strategy 2023-2027 alignment with mHealth, AI, privacy, and interoperability.",
  "Community clinic and CHW evidence from WHO, CHW Central, and frontline health worker references listed in the report.",
] as const;

export function JudgeModePage() {
  const { language, setLanguage } = useLanguage();

  return (
    <main className="min-h-screen bg-[#fbfaf6] text-slate-950">
      <header className="sticky top-0 z-40 border-slate-200 border-b bg-[#fbfaf6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Clinic Copilot BD home">
            <BrandMark />
          </Link>
          <div className="flex flex-wrap justify-end gap-2">
            <LanguageToggle
              className="hidden min-w-52 sm:grid"
              value={language}
              onChange={setLanguage}
            />
            <Button asChild variant="secondary">
              <Link href="/clinic/copilot">
                <PlayCircle size={17} aria-hidden="true" />
                Launch Judge demo
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">Docs</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-[#12332c] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div>
            <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
              Judge mode
            </p>
            <h1 className="mt-4 font-black text-4xl tracking-normal sm:text-6xl">
              Everything judges need to understand Clinic Copilot BD.
            </h1>
            <p className="mt-5 max-w-3xl text-lg text-white/82 leading-8">
              A Bangla-first health worker assistant for overloaded clinics. It
              turns messy patient stories into draft support, safety blockers,
              handoff tasks, print packets, follow-up ownership, and MCP-ready
              tool calls while keeping clinicians in control.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/clinic/copilot">
                  Click the Judge demo button
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                className="border-white/35 bg-white/10 text-white hover:bg-white/20"
                size="lg"
                variant="outline"
              >
                <Link href="/docs">Review MCP and AI docs</Link>
              </Button>
            </div>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-2">
            {reportStats.map(([label, value, detail]) => (
              <article
                className="border border-white/18 bg-white/10 p-4"
                key={label}
              >
                <p className="font-black text-3xl text-[#f2c14e]">{value}</p>
                <h2 className="mt-2 font-bold">{label}</h2>
                <p className="mt-1 text-white/72 text-sm leading-6">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PageSection
        eyebrow="3 minute script"
        title="Show the one-click workflow first, then prove the system around it."
        intro="Use this exact route when judges arrive. It is grounded in the current app: Copilot, Case, Queue, local/cloud AI, deterministic fallback, and MCP."
      >
        <div className="grid gap-3 lg:grid-cols-5">
          {demoRoute.map((step) => {
            const Icon = step.icon;
            return (
              <article
                className="border border-border bg-white p-4"
                key={step.title}
              >
                <Icon className="text-primary" size={22} aria-hidden="true" />
                <h3 className="mt-3 font-bold text-lg">{step.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-6">
                  {step.detail}
                </p>
              </article>
            );
          })}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Executive summary"
        title="The product thesis from the report."
        intro="The best health-worker AI for Bangladesh is not the most medically aggressive chatbot. It is the one that reduces workload, catches missing checks, keeps outputs draft-only, works with local or cloud models, and makes human review auditable."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <InfoCard
            icon={Stethoscope}
            title="Primary wedge"
            body="Smaller hospitals, local private clinics, diagnostic-linked clinics, NGO clinics, community clinics, and busy outpatient desks where staff are stretched and workflows are paper-heavy."
          />
          <InfoCard
            icon={Building2}
            title="Larger hospital path"
            body="OPD throughput, emergency intake, nursing handoff, discharge education, quality review, training, audit, and research evaluation."
          />
          <InfoCard
            icon={Globe2}
            title="Global relevance"
            body="Frontline delivery pressure, physician scarcity, essential service gaps, and out-of-pocket burden create demand for practical support instead of generic chat."
          />
        </div>
      </PageSection>

      <PageSection
        eyebrow="Market and operations"
        title="Why small clinics feel the pain first."
        intro="The report positions smaller facilities as the highest-probability first buyer because they need immediate workload relief without buying a heavy hospital information system."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {painResponse.map(([pain, response]) => (
            <article className="border border-border bg-white p-5" key={pain}>
              <h3 className="font-bold text-lg">{pain}</h3>
              <p className="mt-2 text-muted-foreground leading-7">{response}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
              Workflow design
            </p>
            <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
              Field story to clinic action, without bypassing humans.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-8">
              Patient story goes through intake cleanup, safety blockers,
              missing questions, draft support, human review, patient education,
              follow-up, and audit receipts.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Reception captures story quickly.",
              "Community health worker asks what matters next.",
              "Nurse confirms vitals, allergies, return warnings, and escalation.",
              "Doctor reviews concise draft support and risk explanation.",
              "Follow-up desk owns callback and reply triage.",
              "External agents call bounded MCP tools.",
            ].map((item) => (
              <div
                className="flex gap-3 border border-border bg-[#fbfaf6] p-4"
                key={item}
              >
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-primary"
                  size={18}
                  aria-hidden="true"
                />
                <p className="text-muted-foreground leading-7">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageSection
        eyebrow="Safety architecture"
        title="Safety is the product, not an afterthought."
        intro="Clinic Copilot BD sells decision support, documentation acceleration, safety checks, and human-reviewed patient communication. It does not sell autonomous diagnosis."
      >
        <div className="grid gap-3 lg:grid-cols-4">
          {safetyRules.map((rule) => (
            <article
              className="border border-amber-200 bg-amber-50 p-4"
              key={rule}
            >
              <ShieldCheck
                className="text-amber-700"
                size={21}
                aria-hidden="true"
              />
              <p className="mt-3 text-sm leading-6">{rule}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <section className="bg-[#071f1a] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
          <div>
            <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
              Agentic and MCP layer
            </p>
            <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
              The app is also a safe tool layer for other agents.
            </h2>
            <p className="mt-4 text-white/76 text-lg leading-8">
              MCP turns the standalone app into an agent-ready health workflow
              layer. LM Studio, Claude, Codex, Cursor-style clients, and HTTP
              demos can inspect schemas and call bounded tools.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Local" value="LM Studio" />
              <MiniStat label="Cloud" value="Gemini" />
              <MiniStat label="No key" value="Fallback" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {mcpTools.map((tool) => (
              <div
                className="border border-white/14 bg-white/10 p-3 font-mono text-sm"
                key={tool}
              >
                {tool}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageSection
        eyebrow="Security and production hardening"
        title="Prototype boundaries are explicit."
        intro="The current demo uses synthetic data and temporary demo authentication. The production model is designed around privacy, role boundaries, model governance, MCP allowlists, and auditability."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <InfoCard
            icon={LockKeyhole}
            title="Production controls"
            body="Organization accounts, SSO/OIDC, role-based access, server-side authorization, encryption, tenant isolation, retention controls, and consent flow."
          />
          <InfoCard
            icon={Laptop}
            title="Model governance"
            body="Local LM Studio inside clinic networks, cloud Gemini with minimum necessary context, provider allowlist, timeout, schema validation, and audit logging."
          />
          <InfoCard
            icon={ClipboardCheck}
            title="MCP safety"
            body="Tool allowlist, role-scoped outputs, server-side validation, safety envelopes, and no MCP bypass of clinic permissions."
          />
        </div>
      </PageSection>

      <PageSection
        eyebrow="Technology stack"
        title="Built as a real app, not a slide-only concept."
        intro="The report documents the current implementation stack and the verification path used for the prototype."
      >
        <div className="overflow-hidden border border-border bg-white">
          {stackRows.map(([label, value]) => (
            <div
              className="grid gap-2 border-border border-b p-4 last:border-b-0 md:grid-cols-[12rem_1fr]"
              key={label}
            >
              <p className="font-bold text-primary">{label}</p>
              <p className="text-muted-foreground">{value}</p>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection
        eyebrow="Milestones and limitations"
        title="Honest next steps after the hackathon."
        intro="The report is clear that real deployment requires usability testing, privacy hardening, production authentication, and supervised pilots before real patient use."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {milestones.map((item) => (
            <div
              className="flex gap-3 border border-border bg-white p-4"
              key={item}
            >
              <BadgeCheck className="mt-0.5 shrink-0 text-primary" size={18} />
              <p className="text-muted-foreground leading-7">{item}</p>
            </div>
          ))}
        </div>
      </PageSection>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
              Source notes
            </p>
            <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
              Report-backed claims.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-8">
              This page condenses the local health worker assistant report into
              one long judge-facing page.
            </p>
          </div>
          <ul className="space-y-3">
            {sourceNotes.map((note) => (
              <li
                className="flex gap-3 text-muted-foreground leading-7"
                key={note}
              >
                <FileText className="mt-1 shrink-0 text-primary" size={17} />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-[#f2c14e]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="font-black text-3xl tracking-normal">
              Ready for judges: run the demo from Copilot.
            </p>
            <p className="mt-2 max-w-3xl text-slate-800 leading-7">
              The one-click workflow uses the pregnancy fever case from the demo
              assets and shows safe agentic orchestration without claiming
              autonomous medical authority.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/clinic/copilot">
              Open Copilot
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function PageSection({
  children,
  eyebrow,
  intro,
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  intro: string;
  title: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-4xl">
        <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground text-lg leading-8">{intro}</p>
      </div>
      {children}
    </section>
  );
}

function InfoCard({
  body,
  icon: Icon,
  title,
}: {
  body: string;
  icon: typeof ShieldCheck;
  title: string;
}) {
  return (
    <article className="border border-border bg-white p-5">
      <Icon className="text-primary" size={24} aria-hidden="true" />
      <h3 className="mt-4 font-bold text-xl">{title}</h3>
      <p className="mt-2 text-muted-foreground leading-7">{body}</p>
    </article>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/14 bg-white/10 p-4">
      <p className="font-semibold text-[#f2c14e] text-xs uppercase tracking-[0.14em]">
        {label}
      </p>
      <p className="mt-2 font-black text-xl">{value}</p>
    </div>
  );
}
