"use client";

import { ArrowRight, CheckCircle2, LogIn, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/features/language/language-context";
import { LanguageToggle } from "@/features/language/language-toggle";
import { cn } from "@/lib/utils";
import {
  audienceCards,
  brand,
  demoRunbook,
  docsAiPractices,
  docsMcpClientSetup,
  docsMcpMethods,
  docsMcpToolGroups,
  docsModelProviderNotes,
  docsPromptLibrary,
  docsQuickLinks,
  docsTesterChecklist,
  docsTesterWalkthrough,
  featureCatalog,
  featurePillars,
  homepageHighlights,
  interactionModes,
  marketingImages,
  mcpPublicCards,
  missionPoints,
  pitchBeats,
  pitchDifferentiators,
  pitchScorecards,
  productScreenshots,
  productShots,
  proofStats,
  publicNav,
  trustPoints,
  workflowSteps,
} from "../data";
import { BrandMark } from "./brand-mark";

type PublicPage = "docs" | "features" | "home" | "login" | "mission" | "pitch";

export function PublicSite({
  page = "home",
  authSlot,
}: {
  authSlot?: React.ReactNode;
  page?: PublicPage;
}) {
  const { language } = useLanguage();
  usePublicDomLocalization(language);

  return (
    <main
      className="min-h-screen bg-[#fbfaf6] text-slate-950"
      data-public-language={language}
    >
      <PublicHeader activePage={page} />
      {page === "docs" ? <DocsPage /> : null}
      {page === "features" ? <FeaturesPage /> : null}
      {page === "mission" ? <MissionPage /> : null}
      {page === "pitch" ? <PitchPage /> : null}
      {page === "login" ? <LoginPage authSlot={authSlot} /> : null}
      {page === "home" ? <HomePage authSlot={authSlot} /> : null}
      <PublicFooter />
    </main>
  );
}

function PublicHeader({ activePage }: { activePage: PublicPage }) {
  const { language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-40 border-slate-200 border-b bg-[#fbfaf6]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${brand.name} home`}>
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Public">
          {publicNav.map((item) => {
            const isActive =
              item.href === "/"
                ? activePage === "home"
                : item.href.includes(activePage);
            return (
              <Link
                className={cn(
                  "rounded-md px-3 py-2 font-semibold text-sm transition hover:bg-[#eaf6f1]",
                  isActive && "bg-[#eaf6f1] text-primary",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle
            className="hidden min-w-52 sm:grid"
            value={language}
            onChange={setLanguage}
          />
          <Button asChild>
            <Link href="/clinic/queue">
              <LogIn size={17} aria-hidden="true" />
              Start demo
            </Link>
          </Button>
        </div>
      </div>
      <div className="border-slate-200 border-t px-4 py-2 sm:hidden">
        <LanguageToggle value={language} onChange={setLanguage} />
      </div>
    </header>
  );
}

function HomePage({ authSlot }: { authSlot?: React.ReactNode }) {
  return (
    <>
      <section className="relative min-h-[calc(100svh-120px)] overflow-hidden bg-[#12332c] text-white">
        <Image
          alt="Bangladesh clinic staff using a tablet workflow at a reception desk"
          className="absolute inset-0 h-full w-full object-cover"
          fill
          priority
          src={marketingImages.hero}
        />
        <div className="absolute inset-0 bg-[#12332c]/72" />
        <div className="relative mx-auto grid min-h-[calc(100svh-120px)] max-w-7xl content-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.75fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
              Built for Bangla-first clinic teams
            </p>
            <h1 className="mt-4 max-w-4xl font-black text-4xl leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              The AI clinic cockpit for Bangla-first care, local or cloud.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/86 leading-8">
              {brand.name} turns messy reception notes into safer clinic
              workflow: structured drafts, red-flag review, handouts,
              teach-back, follow-up, operations visibility, and MCP tools that
              work with local or cloud AI.
            </p>
            <div className="mt-5 inline-flex max-w-full flex-wrap items-center gap-2 border border-[#f2c14e]/45 bg-slate-950/35 px-3 py-2 text-sm">
              <span className="font-semibold text-[#f2c14e]">
                MCP + model choice
              </span>
              <span className="font-mono text-white/88">stdio + /api/mcp</span>
              <span className="text-white/62">LM Studio or Gemini</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/clinic/queue">
                  <PlayCircle size={19} aria-hidden="true" />
                  Launch clinic demo
                </Link>
              </Button>
              <Button
                asChild
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                size="lg"
                variant="outline"
              >
                <Link href="/pitch">
                  See the pitch
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
              {proofStats.map((stat) => (
                <div
                  className="border border-white/20 bg-white/10 p-3"
                  key={stat.label}
                >
                  <p className="font-black text-2xl text-[#f2c14e]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-white/72 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="self-end lg:pl-6">{authSlot}</div>
        </div>
      </section>
      <McpFrontDoor />
      <FeatureOverview />
      <CommandPreview />
      <HomepageHighlights />
      <FullFeatureCatalog compact />
      <ShowcaseStories />
      <MissionBand />
      <TrustBand />
      <ProductImageBand />
    </>
  );
}

function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Complete workflow"
        title="From waiting room notes to follow-up ownership, with any model path."
        body="A clinic does not need one more isolated AI textbox. It needs a connected workflow across reception, clinician review, patient education, operations, MCP clients, and local or cloud AI providers."
      />
      <FeatureGrid />
      <FullFeatureCatalog />
      <InteractionBand />
      <WorkflowBand />
      <ShowcaseStories />
    </>
  );
}

function DocsPage() {
  return (
    <>
      <PageHero
        eyebrow="Product docs"
        title="AI providers, MCP setup, and clinic workflow details reviewers can verify."
        body="A compact documentation hub for the submitted demo: how local and cloud models are selected, which AI surfaces exist, how MCP clients connect, what MCP exposes, and how the build is deployed."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-3">
          {docsQuickLinks.map((item) => (
            <article
              className="border border-border bg-white p-5"
              key={item.title}
            >
              <p className="font-semibold text-primary text-xs uppercase tracking-[0.14em]">
                {item.label}
              </p>
              <h2 className="mt-3 font-bold text-xl">{item.title}</h2>
              <p className="mt-2 text-muted-foreground leading-7">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>
      <DocsTesterSection />
      <DocsCopilotSection />
      <DocsMcpSection />
      <DocsAiSection />
      <DocsBuildSection />
    </>
  );
}

function DocsTesterSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div>
            <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
              Tester walkthrough
            </p>
            <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
              Step-by-step proof path for the full clinic demo.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-8">
              Use this route when validating the hackathon build locally or
              preparing a judge-facing product report. It covers setup, role
              workspaces, agent tools, clinical safety gates, print workflows,
              and low-connectivity behavior.
            </p>
            <div className="mt-6 border border-border bg-[#fbfaf6] p-5">
              <h3 className="font-bold text-xl">Acceptance checklist</h3>
              <ul className="mt-4 space-y-3">
                {docsTesterChecklist.map((item) => (
                  <li
                    className="flex gap-3 text-muted-foreground text-sm leading-6"
                    key={item}
                  >
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-primary"
                      size={18}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="grid gap-3">
            {docsTesterWalkthrough.map((group) => (
              <article
                className="border border-border bg-[#fffdf8] p-5"
                key={group.title}
              >
                <h3 className="font-bold text-xl">{group.title}</h3>
                <ol className="mt-4 space-y-3">
                  {group.steps.map((step, stepIndex) => (
                    <li
                      className="grid grid-cols-[2rem_1fr] gap-3 text-muted-foreground text-sm leading-6"
                      key={step}
                    >
                      <span className="flex size-7 items-center justify-center border border-border bg-white font-bold text-primary text-xs">
                        {stepIndex + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const docsCopilotTools = [
  {
    group: "Clinical safety",
    items: [
      "detect_missing_vitals",
      "detect_allergy_gap",
      "detect_pregnancy_child_chest_pain",
      "audit_case_safety",
    ],
  },
  {
    group: "Patient communication",
    items: [
      "rewrite_for_low_literacy",
      "translate_bn_en",
      "generate_patient_audio_script",
      "generate_pictogram_plan",
    ],
  },
  {
    group: "Print and documents",
    items: [
      "prepare_referral_packet",
      "compare_before_after_draft",
      "create_visit_summary",
      "prepare_followup_call_sheet",
    ],
  },
  {
    group: "Operations",
    items: [
      "summarize_queue_pressure",
      "predict_followup_risk",
      "generate_staff_tasks",
      "recommend_next_agent_action",
    ],
  },
] as const;

const docsShortcuts = [
  "Cmd/Ctrl+K opens Copilot",
  "Cmd/Ctrl+G generates a draft",
  "Cmd/Ctrl+P opens presentation mode",
  "Esc closes presentation mode",
] as const;

function DocsCopilotSection() {
  return (
    <section className="bg-[#fbfaf6]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
        <div>
          <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
            Copilot and tools
          </p>
          <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
            The app stays simple; the tool catalog lives here.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-8">
            Healthcare workers see a chat-first Copilot with threads, patient
            context, safety blockers, and inline tool results. Detailed tool
            names, shortcuts, and external-agent capabilities are documented
            here for testers, admins, and judges.
          </p>
          <div className="mt-6 border border-border bg-white p-5">
            <h3 className="font-bold text-xl">Keyboard shortcuts</h3>
            <ul className="mt-4 space-y-3 text-muted-foreground text-sm leading-6">
              {docsShortcuts.map((shortcut) => (
                <li key={shortcut}>{shortcut}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {docsCopilotTools.map((group) => (
            <article
              className="border border-border bg-white p-5"
              key={group.group}
            >
              <h3 className="font-bold text-xl">{group.group}</h3>
              <ul className="mt-4 space-y-2">
                {group.items.map((item) => (
                  <li className="font-mono text-primary text-sm" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocsMcpSection() {
  return (
    <section className="bg-[#071f1a] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
            MCP usage
          </p>
          <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
            Agent-readable clinic context for HTTP demos and real MCP clients.
          </h2>
          <p className="mt-4 text-white/76 text-lg leading-8">
            The app exposes a curl-friendly JSON-RPC demo endpoint at{" "}
            <span className="font-mono text-[#f2c14e]">/api/mcp</span> and a
            real stdio MCP server at{" "}
            <span className="font-mono text-[#f2c14e]">
              scripts/mcp-stdio.ts
            </span>
            . External clients can inspect synthetic scenarios, capability
            metadata, safety gates, and workflow tools without touching real
            patient records.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <article className="border border-white/16 bg-white/10 p-5">
            <h3 className="font-bold text-xl">Methods</h3>
            <ul className="mt-4 space-y-2">
              {docsMcpMethods.map((method) => (
                <li className="font-mono text-[#f2c14e] text-sm" key={method}>
                  {method}
                </li>
              ))}
            </ul>
          </article>
          <article className="border border-white/16 bg-white/10 p-5">
            <h3 className="font-bold text-xl">Tools</h3>
            <ul className="mt-4 space-y-2 text-white/76 text-sm leading-6">
              {docsMcpToolGroups.map((toolGroup) => (
                <li key={toolGroup}>{toolGroup}</li>
              ))}
            </ul>
          </article>
          <article className="border border-white/16 bg-white/10 p-5 md:col-span-2">
            <h3 className="font-bold text-xl">Client setup</h3>
            <div className="mt-4 grid gap-3">
              {docsMcpClientSetup.map((setup) => (
                <div
                  className="border border-white/12 bg-slate-950/40 p-4"
                  key={setup.title}
                >
                  <p className="font-bold text-[#f2c14e]">{setup.title}</p>
                  <p className="mt-2 text-sm text-white/72 leading-6">
                    {setup.body}
                  </p>
                  <pre className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-words bg-slate-950 p-3 text-white/82 text-xs leading-6">
                    <code className="break-words">{setup.command}</code>
                  </pre>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function DocsAiSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
            Data and AI provenance
          </p>
          <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
            Synthetic data, local or cloud AI, human review.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-8">
            Clinic Copilot BD uses the AI SDK as a provider layer: LM Studio for
            local models, Gemini for cloud generation, and deterministic
            fallback output for demos without a model. The product constrains
            outputs with schemas, safety prompts, and review boundaries.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {docsAiPractices.map((practice) => (
            <article
              className="border border-border bg-[#fbfaf6] p-4"
              key={practice}
            >
              <CheckCircle2
                className="text-primary"
                size={20}
                aria-hidden="true"
              />
              <p className="mt-3 text-muted-foreground text-sm leading-6">
                {practice}
              </p>
            </article>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-3 pb-8 md:grid-cols-3">
          {docsModelProviderNotes.map((provider) => (
            <article
              className="border border-border bg-[#fbfaf6] p-5"
              key={provider.title}
            >
              <p className="font-semibold text-primary text-xs uppercase tracking-[0.14em]">
                {provider.label}
              </p>
              <h3 className="mt-3 font-bold text-xl">{provider.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-6">
                {provider.body}
              </p>
            </article>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {docsPromptLibrary.map((prompt) => (
            <article
              className="border border-border bg-white p-5"
              key={prompt.title}
            >
              <p className="font-semibold text-primary text-xs uppercase tracking-[0.14em]">
                {prompt.category}
              </p>
              <h3 className="mt-3 font-bold text-xl">{prompt.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-6">
                {prompt.output}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocsBuildSection() {
  return (
    <section className="bg-[#fffdf8]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
          Build and deployment
        </p>
        <h2 className="mt-3 max-w-4xl font-black text-3xl tracking-normal sm:text-5xl">
          A deployable stack with live AI, realtime data, and verifiable docs.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Frontend", "Next.js 16, React 19, TypeScript, Tailwind CSS 4"],
            ["Backend", "Convex realtime data, Next.js API routes"],
            [
              "AI",
              "Vercel AI SDK, LM Studio local models, Google Gemini, structured outputs",
            ],
            [
              "MCP",
              "Stdio MCP server, mcp.json, HTTP JSON-RPC demo endpoint, 12 tools",
            ],
            [
              "Quality",
              "Biome, production build checks, local/cloud/fallback tests",
            ],
          ].map(([label, body]) => (
            <article className="border border-border bg-white p-5" key={label}>
              <h3 className="font-bold text-xl">{label}</h3>
              <p className="mt-2 text-muted-foreground leading-7">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissionPage() {
  return (
    <>
      <PageHero
        eyebrow="Mission and vision"
        title="Practical AI for the clinics that need time back."
        body="The product is designed for low-resource, Bangla-first care settings where staff need speed, clarity, and safety framing more than generic automation."
      />
      <MissionBand />
      <TrustBand />
      <ImageStory
        image={marketingImages.teachBack}
        kicker="Human understanding"
        title="Patient communication ends with teach-back, not a PDF."
        body="The product helps staff confirm that families can repeat care steps, medicine instructions, return warnings, and follow-up timing."
      />
    </>
  );
}

function PitchPage() {
  return (
    <>
      <PageHero
        eyebrow="Product pitch"
        title="A real product story in one clinic workflow."
        body="The demo starts with a locally relevant case and ends with a safer handoff, printable instruction, and operational proof."
      />
      <ProductScreenshotBand />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {pitchBeats.map((beat, index) => (
            <div className="border border-border bg-white p-5" key={beat}>
              <p className="font-black text-3xl text-primary">{index + 1}</p>
              <p className="mt-3 text-muted-foreground leading-7">{beat}</p>
            </div>
          ))}
        </div>
      </section>
      <PitchScoreboard />
      <PitchDifferentiators />
      <DemoRunbook />
      <WorkflowBand />
      <ImageStory
        image={marketingImages.operations}
        kicker="Final proof"
        title="Close the demo on operational evidence."
        body="After the AI draft, the team can see queue state, follow-up ownership, trend signals, audit history, and readiness scoring. That is the difference between a clever prompt and a viable product."
      />
    </>
  );
}

function LoginPage({ authSlot }: { authSlot?: React.ReactNode }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
      <div className="self-center">
        <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
          Demo access
        </p>
        <h1 className="mt-4 font-black text-4xl tracking-normal sm:text-5xl">
          Enter the clinic workspace.
        </h1>
        <p className="mt-4 text-muted-foreground text-lg leading-8">
          Create a temporary clinic session or sign into the seeded demo
          account. The live product stays behind authentication while the public
          site explains the mission and pitch.
        </p>
      </div>
      <div>{authSlot}</div>
    </section>
  );
}

function McpFrontDoor() {
  return (
    <section className="border-slate-200 border-b bg-[#071f1a] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <div className="self-center">
          <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
            MCP-ready data layer
          </p>
          <h2 className="mt-3 max-w-3xl font-black text-3xl tracking-normal sm:text-5xl">
            Clinic context is agent-readable from day one.
          </h2>
          <p className="mt-4 text-lg text-white/78 leading-8">
            The demo exposes a stdio MCP server for LM Studio, Claude, Codex,
            Cursor, and similar clients, plus an HTTP JSON-RPC endpoint for fast
            browser and curl demos. Both expose safe clinic workflow context:
            tools, resources, scenario data, and draft-support boundaries.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link href="/docs">
                Read MCP setup
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              size="lg"
              variant="outline"
            >
              <Link href="/pitch">See product proof</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mcpPublicCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                className="border border-white/16 bg-white/10 p-5"
                key={card.title}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-[#f2c14e] text-slate-950">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <p className="font-semibold text-[#f2c14e] text-xs uppercase tracking-[0.14em]">
                    {card.label}
                  </p>
                </div>
                <h3 className="mt-4 font-bold text-xl">{card.title}</h3>
                <p className="mt-2 text-white/72 text-sm leading-6">
                  {card.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden border border-white/16 bg-slate-950">
          <div className="border-white/10 border-b px-4 py-3 font-semibold text-[#f2c14e] text-sm">
            MCP quick test
          </div>
          <pre className="overflow-x-auto p-4 text-white/82 text-xs leading-6">
            <code>{`bun run mcp:smoke

POST /api/mcp
{ "jsonrpc": "2.0", "id": 1, "method": "tools/list" }`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function CommandPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMode = interactionModes[activeIndex] ?? interactionModes[0];
  const ActiveIcon = activeMode.icon;

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="self-center">
          <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
            Interactive demo layer
          </p>
          <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
            The public pitch hints at the product magic.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-8">
            Reviewers should understand before logging in that this is a
            commandable workflow. The real app lets staff operate major clinic
            actions through natural language while keeping review boundaries
            visible.
          </p>
        </div>

        <div className="border border-border bg-[#12332c] p-4 text-white">
          <div className="flex flex-wrap gap-2">
            {interactionModes.map((mode, index) => {
              const Icon = mode.icon;
              return (
                <Button
                  className={cn(
                    "border-white/20 bg-white/10 text-white hover:bg-white/20",
                    index === activeIndex && "bg-[#f2c14e] text-slate-950",
                  )}
                  key={mode.label}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => setActiveIndex(index)}
                >
                  <Icon size={16} aria-hidden="true" />
                  {mode.label}
                </Button>
              );
            })}
          </div>
          <div className="mt-5 border border-white/20 bg-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-[#f2c14e] text-slate-950">
                <ActiveIcon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-semibold text-white/70 text-xs uppercase tracking-[0.14em]">
                  Command
                </p>
                <p className="font-semibold">{activeMode.command}</p>
              </div>
            </div>
            <div className="mt-5 bg-slate-950/50 p-4 font-mono text-sm text-[#f2c14e]">
              {">"} {activeMode.command}
            </div>
            <p className="mt-4 text-white/82 leading-7">{activeMode.result}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureOverview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
            Main pitch
          </p>
          <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
            Not diagnosis. Clinic workflow acceleration.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {audienceCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                className="border border-border bg-white p-5"
                key={card.title}
              >
                <Icon className="text-primary" size={24} aria-hidden="true" />
                <h3 className="mt-4 font-bold text-xl">{card.title}</h3>
                <p className="mt-2 text-muted-foreground leading-7">
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HomepageHighlights() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {homepageHighlights.map((highlight) => {
          const Icon = highlight.icon;
          return (
            <article
              className="border border-border bg-white p-5"
              key={highlight.title}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-[#eaf6f1]">
                  <Icon className="text-primary" size={20} aria-hidden="true" />
                </span>
                <p className="font-semibold text-primary text-xs uppercase tracking-[0.14em]">
                  {highlight.label}
                </p>
              </div>
              <h3 className="mt-4 font-bold text-xl">{highlight.title}</h3>
              <p className="mt-2 text-muted-foreground leading-7">
                {highlight.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {featurePillars.map((feature) => {
          const Icon = feature.icon;
          return (
            <article
              className="border border-border bg-white p-5"
              key={feature.title}
            >
              <Icon className="text-primary" size={24} aria-hidden="true" />
              <h2 className="mt-4 font-bold text-xl">{feature.title}</h2>
              <p className="mt-2 text-muted-foreground leading-7">
                {feature.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FullFeatureCatalog({ compact = false }: { compact?: boolean }) {
  const visibleCatalog = compact ? featureCatalog.slice(0, 4) : featureCatalog;

  return (
    <section className="bg-[#fffdf8]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
              Everything included
            </p>
            <h2 className="mt-3 max-w-3xl font-black text-3xl tracking-normal sm:text-5xl">
              The demo is loaded because the product story is loaded.
            </h2>
          </div>
          {compact ? (
            <Button asChild variant="outline">
              <Link href="/features">
                Full feature list
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCatalog.map((group) => {
            const Icon = group.icon;
            return (
              <article
                className="border border-border bg-white p-5"
                key={group.group}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-[#eaf6f1]">
                    <Icon
                      className="text-primary"
                      size={21}
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="font-bold text-xl">{group.group}</h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {group.items.map((item) => (
                    <li
                      className="flex gap-2 text-muted-foreground text-sm leading-6"
                      key={item}
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-primary"
                        size={16}
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InteractionBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.65fr_1.35fr]">
        <div>
          <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
            Interactions reviewers can feel
          </p>
          <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
            Every click moves the clinic forward.
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {interactionModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <article
                className="border border-border bg-white p-5"
                key={mode.label}
              >
                <Icon className="text-primary" size={24} aria-hidden="true" />
                <h3 className="mt-4 font-bold text-xl">{mode.label}</h3>
                <p className="mt-2 font-mono text-primary text-sm">
                  {mode.command}
                </p>
                <p className="mt-3 text-muted-foreground leading-7">
                  {mode.result}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MissionBand() {
  return (
    <section className="bg-[#eaf6f1]">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        {missionPoints.map((point) => (
          <article
            className="border border-[#cfe7dc] bg-white p-5"
            key={point.title}
          >
            <h2 className="font-black text-2xl text-primary">{point.title}</h2>
            <p className="mt-3 text-muted-foreground leading-7">{point.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {trustPoints.map((point) => {
          const Icon = point.icon;
          return (
            <article
              className="border border-border bg-white p-5"
              key={point.title}
            >
              <Icon className="text-primary" size={24} aria-hidden="true" />
              <h2 className="mt-4 font-bold text-xl">{point.title}</h2>
              <p className="mt-2 text-muted-foreground leading-7">
                {point.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ShowcaseStories() {
  return (
    <>
      {productShots.map((shot, index) => (
        <ImageStory
          body={shot.body}
          image={shot.image}
          key={shot.title}
          kicker={shot.kicker}
          reverse={index % 2 === 1}
          title={shot.title}
        />
      ))}
    </>
  );
}

function ProductImageBand() {
  return (
    <ImageStory
      image={marketingImages.product}
      kicker="Responsive clinic OS"
      title="Dense enough for staff. Clear enough for review."
      body="The authenticated app combines queue pressure, visit progress, safety review, handout, teach-back, referral, follow-up, and audit surfaces in one operational workspace."
    />
  );
}

function ProductScreenshotBand() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
              Real product screens
            </p>
            <h2 className="mt-3 max-w-4xl font-black text-3xl tracking-normal sm:text-5xl">
              Screenshots from the working app, not mockups.
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/clinic/queue">
              Open demo
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6">
          {productScreenshots.map((shot) => (
            <article
              className="border border-border bg-[#fbfaf6]"
              key={shot.title}
            >
              <div className="relative aspect-[16/9] border-border border-b bg-white">
                <Image
                  alt={`${shot.label} workspace screenshot`}
                  className="object-cover"
                  fill
                  sizes="(min-width: 1024px) 1152px, 100vw"
                  src={shot.image}
                />
              </div>
              <div className="p-5">
                <p className="font-semibold text-primary text-sm uppercase tracking-[0.14em]">
                  {shot.label}
                </p>
                <h3 className="mt-2 font-bold text-2xl">{shot.title}</h3>
                <p className="mt-2 text-muted-foreground leading-7">
                  {shot.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowBand() {
  return (
    <section className="bg-[#12332c] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
          Workflow
        </p>
        <h2 className="mt-3 max-w-3xl font-black text-3xl tracking-normal sm:text-5xl">
          One visit, one visible path.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <div className="border border-white/20 bg-white/10 p-4" key={step}>
              <p className="font-black text-2xl text-[#f2c14e]">{index + 1}</p>
              <p className="mt-3 font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PitchScoreboard() {
  return (
    <section className="bg-[#12332c] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
          Product score map
        </p>
        <h2 className="mt-3 max-w-3xl font-black text-3xl tracking-normal sm:text-5xl">
          The pitch is built around proof, not vibes.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {pitchScorecards.map((card) => (
            <article
              className="border border-white/20 bg-white/10 p-4"
              key={card.label}
            >
              <p className="font-semibold text-[#f2c14e] text-sm">
                {card.label}
              </p>
              <h3 className="mt-3 font-bold text-xl">{card.value}</h3>
              <p className="mt-3 text-white/76 text-sm leading-6">
                {card.proof}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PitchDifferentiators() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pitchDifferentiators.map((item) => {
          const Icon = item.icon;
          return (
            <article
              className="border border-border bg-white p-5"
              key={item.title}
            >
              <Icon className="text-primary" size={24} aria-hidden="true" />
              <h2 className="mt-4 font-bold text-xl">{item.title}</h2>
              <p className="mt-2 text-muted-foreground leading-7">
                {item.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function DemoRunbook() {
  return (
    <section className="bg-[#eaf6f1]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
          Demo runbook
        </p>
        <h2 className="mt-3 max-w-3xl font-black text-3xl tracking-normal sm:text-5xl">
          A crisp three-minute story the team can follow.
        </h2>
        <div className="mt-8 grid gap-3 lg:grid-cols-5">
          {demoRunbook.map((step) => {
            const Icon = step.icon;
            return (
              <article
                className="border border-[#cfe7dc] bg-white p-4"
                key={step.title}
              >
                <div className="flex items-center justify-between gap-3">
                  <Icon className="text-primary" size={22} aria-hidden="true" />
                  <p className="font-black text-primary">{step.time}</p>
                </div>
                <h3 className="mt-4 font-bold text-lg">{step.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-6">
                  {step.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ImageStory({
  body,
  image,
  kicker,
  reverse = false,
  title,
}: {
  body: string;
  image: string;
  kicker: string;
  reverse?: boolean;
  title: string;
}) {
  return (
    <section
      className={cn(
        "mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8",
        reverse && "lg:grid-cols-[0.9fr_1fr]",
      )}
    >
      <div className="relative min-h-80 overflow-hidden border border-border bg-white">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          src={image}
        />
      </div>
      <div className={cn("self-center", reverse && "lg:order-first")}>
        <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
          {kicker}
        </p>
        <h2 className="mt-3 font-black text-3xl tracking-normal sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground text-lg leading-8">{body}</p>
      </div>
    </section>
  );
}

function PageHero({
  body,
  eyebrow,
  title,
}: {
  body: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="border-slate-200 border-b bg-[#fffdf8]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="font-semibold text-primary text-sm uppercase tracking-[0.16em]">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-4xl font-black text-4xl tracking-normal sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-muted-foreground text-lg leading-8">
          {body}
        </p>
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className="border-slate-200 border-t bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <BrandMark />
        <div className="flex flex-wrap gap-3 text-muted-foreground text-sm">
          <Link href="/features">Features</Link>
          <Link href="/mission">Mission</Link>
          <Link href="/pitch">Pitch</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </footer>
  );
}

const publicBnTextMap = new Map<string, string>(
  Object.entries({
    Home: "হোম",
    Features: "ফিচার",
    Docs: "ডকস",
    Judge: "জাজ",
    Mission: "মিশন",
    Pitch: "পিচ",
    Login: "লগইন",
    "Start demo": "ডেমো শুরু করুন",
    "Launch clinic demo": "ক্লিনিক ডেমো চালু করুন",
    "See the pitch": "পিচ দেখুন",
    "Built for Bangla-first clinic teams": "বাংলা-প্রথম ক্লিনিক টিমের জন্য তৈরি",
    "The AI clinic cockpit for Bangla-first care, local or cloud.":
      "বাংলা-প্রথম সেবার জন্য AI ক্লিনিক ককপিট, লোকাল বা ক্লাউড।",
    "Clinic Copilot BD turns messy reception notes into safer clinic workflow: structured drafts, red-flag review, handouts, teach-back, follow-up, operations visibility, and MCP tools that work with local or cloud AI.":
      "Clinic Copilot BD এলোমেলো রিসেপশন নোটকে নিরাপদ ক্লিনিক ওয়ার্কফ্লোতে বদলায়: স্ট্রাকচার্ড ড্রাফট, রেড-ফ্ল্যাগ রিভিউ, হ্যান্ডআউট, টিচ-ব্যাক, ফলো-আপ, অপারেশনস দৃশ্যমানতা এবং লোকাল বা ক্লাউড AI-তে চলা MCP টুল।",
    "MCP + model choice": "MCP + মডেল পছন্দ",
    "LM Studio or Gemini": "LM Studio বা Gemini",
    "AI + agent workflows": "AI + এজেন্ট ওয়ার্কফ্লো",
    "MCP tools": "MCP টুল",
    "Model modes": "মডেল মোড",
    "Local + cloud": "লোকাল + ক্লাউড",
    "Complete workflow": "সম্পূর্ণ ওয়ার্কফ্লো",
    "From waiting room notes to follow-up ownership, with any model path.":
      "ওয়েটিং রুম নোট থেকে ফলো-আপ দায়িত্ব পর্যন্ত, যেকোনো মডেল পথে।",
    "A clinic does not need one more isolated AI textbox. It needs a connected workflow across reception, clinician review, patient education, operations, MCP clients, and local or cloud AI providers.":
      "একটি ক্লিনিকের আরেকটি আলাদা AI টেক্সটবক্স দরকার নেই। দরকার রিসেপশন, ক্লিনিশিয়ান রিভিউ, রোগী শিক্ষা, অপারেশনস, MCP ক্লায়েন্ট এবং লোকাল বা ক্লাউড AI প্রোভাইডারের মধ্যে সংযুক্ত ওয়ার্কফ্লো।",
    "Product docs": "প্রোডাক্ট ডকস",
    "AI providers, MCP setup, and clinic workflow details reviewers can verify.":
      "AI প্রোভাইডার, MCP সেটআপ এবং ক্লিনিক ওয়ার্কফ্লো ডিটেইলস যা রিভিউয়াররা যাচাই করতে পারেন।",
    "A compact documentation hub for the submitted demo: how local and cloud models are selected, which AI surfaces exist, how MCP clients connect, what MCP exposes, and how the build is deployed.":
      "সাবমিট করা ডেমোর জন্য সংক্ষিপ্ত ডকুমেন্টেশন হাব: লোকাল ও ক্লাউড মডেল কীভাবে বাছাই হয়, কোন AI সারফেস আছে, MCP ক্লায়েন্ট কীভাবে যুক্ত হয়, MCP কী দেয় এবং বিল্ড কীভাবে ডিপ্লয় হয়।",
    Protocol: "প্রোটোকল",
    "MCP server and clients": "MCP সার্ভার ও ক্লায়েন্ট",
    "AI depth": "AI গভীরতা",
    "Model providers": "মডেল প্রোভাইডার",
    Build: "বিল্ড",
    "Engineering notes": "ইঞ্জিনিয়ারিং নোট",
    "Tester walkthrough": "টেস্টার ওয়াকথ্রু",
    "Step-by-step proof path for the full clinic demo.":
      "পূর্ণ ক্লিনিক ডেমোর ধাপে ধাপে প্রমাণের পথ।",
    "Acceptance checklist": "অ্যাকসেপ্টেন্স চেকলিস্ট",
    "Keyboard shortcuts": "কিবোর্ড শর্টকাট",
    "Copilot and tools": "কোপাইলট ও টুল",
    "The app stays simple; the tool catalog lives here.":
      "অ্যাপ সহজ থাকে; টুল ক্যাটালগ এখানে থাকে।",
    "Healthcare workers see a chat-first Copilot with threads, patient context, safety blockers, and inline tool results. Detailed tool names, shortcuts, and external-agent capabilities are documented here for testers, admins, and judges.":
      "হেলথকেয়ার কর্মীরা থ্রেড, রোগী কনটেক্সট, সেফটি ব্লকার ও ইনলাইন টুল রেজাল্টসহ চ্যাট-ফার্স্ট কোপাইলট দেখেন। টেস্টার, অ্যাডমিন ও জাজদের জন্য ডিটেইলড টুল নাম, শর্টকাট ও এক্সটার্নাল-এজেন্ট সক্ষমতা এখানে ডকুমেন্ট করা আছে।",
    "Cmd/Ctrl+K opens Copilot": "Cmd/Ctrl+K কোপাইলট খোলে",
    "Cmd/Ctrl+G generates a draft": "Cmd/Ctrl+G ড্রাফট তৈরি করে",
    "Cmd/Ctrl+P opens presentation mode": "Cmd/Ctrl+P প্রেজেন্টেশন মোড খোলে",
    "Esc closes presentation mode": "Esc প্রেজেন্টেশন মোড বন্ধ করে",
    "MCP usage": "MCP ব্যবহার",
    "Agent-readable clinic context for HTTP demos and real MCP clients.":
      "HTTP ডেমো ও বাস্তব MCP ক্লায়েন্টের জন্য এজেন্ট-পাঠযোগ্য ক্লিনিক কনটেক্সট।",
    "The app exposes a curl-friendly JSON-RPC demo endpoint at":
      "অ্যাপটি curl-ফ্রেন্ডলি JSON-RPC ডেমো এন্ডপয়েন্ট দেয়",
    "and a real stdio MCP server at": "এবং বাস্তব stdio MCP সার্ভার দেয়",
    ". External clients can inspect synthetic scenarios, capability metadata, safety gates, and workflow tools without touching real patient records.":
      "। বাস্তব রোগী রেকর্ডে হাত না দিয়েই এক্সটার্নাল ক্লায়েন্ট সিনথেটিক সিনারিও, সক্ষমতা মেটাডেটা, সেফটি গেট ও ওয়ার্কফ্লো টুল দেখতে পারে।",
    Methods: "মেথড",
    Tools: "টুল",
    Public: "পাবলিক",
    "Practical AI for the clinics that need time back.":
      "যেসব ক্লিনিকের সময় ফেরত দরকার, তাদের জন্য বাস্তবসম্মত AI।",
    "Mission and vision": "মিশন ও ভিশন",
    "The product is designed for low-resource, Bangla-first care settings where staff need speed, clarity, and safety framing more than generic automation.":
      "প্রোডাক্টটি কম-রিসোর্স, বাংলা-প্রথম কেয়ার সেটিংসের জন্য ডিজাইন করা, যেখানে স্টাফদের জেনেরিক অটোমেশনের চেয়ে গতি, স্পষ্টতা ও সেফটি ফ্রেমিং বেশি দরকার।",
    "Human understanding": "মানব বোঝাপড়া",
    "Patient communication ends with teach-back, not a PDF.":
      "রোগী যোগাযোগ PDF-এ নয়, টিচ-ব্যাকে শেষ হয়।",
    "The product helps staff confirm that families can repeat care steps, medicine instructions, return warnings, and follow-up timing.":
      "প্রোডাক্টটি স্টাফকে নিশ্চিত করতে সাহায্য করে যে পরিবার যত্নের ধাপ, ওষুধ নির্দেশনা, রিটার্ন সতর্কতা ও ফলো-আপ টাইমিং পুনরাবৃত্তি করতে পারে।",
    "Product mission": "প্রোডাক্ট মিশন",
    "Make safe clinic workflow support accessible to Bangla-first care teams.":
      "বাংলা-প্রথম কেয়ার টিমের জন্য নিরাপদ ক্লিনিক ওয়ার্কফ্লো সহায়তা সহজলভ্য করা।",
    "Product pitch": "প্রোডাক্ট পিচ",
    "A real product story in one clinic workflow.":
      "একটি ক্লিনিক ওয়ার্কফ্লোতে বাস্তব প্রোডাক্ট গল্প।",
    "The demo starts with a locally relevant case and ends with a safer handoff, printable instruction, and operational proof.":
      "ডেমো স্থানীয়ভাবে প্রাসঙ্গিক কেস দিয়ে শুরু হয় এবং নিরাপদ হ্যান্ডঅফ, প্রিন্টযোগ্য নির্দেশনা ও অপারেশনাল প্রমাণ দিয়ে শেষ হয়।",
    "Demo access": "ডেমো অ্যাক্সেস",
    "Enter the clinic workspace.": "ক্লিনিক ওয়ার্কস্পেসে প্রবেশ করুন।",
    "Create a temporary clinic session or sign into the seeded demo account. The live product stays behind authentication while the public site explains the mission and pitch.":
      "অস্থায়ী ক্লিনিক সেশন তৈরি করুন বা সিডেড ডেমো অ্যাকাউন্টে সাইন ইন করুন। লাইভ প্রোডাক্ট অথেন্টিকেশনের পেছনে থাকে, আর পাবলিক সাইট মিশন ও পিচ ব্যাখ্যা করে।",
    "MCP-ready data layer": "MCP-প্রস্তুত ডেটা লেয়ার",
    "Clinic context is agent-readable from day one.":
      "প্রথম দিন থেকেই ক্লিনিক প্রসঙ্গ এজেন্ট-পড়তে পারে।",
    "Read MCP setup": "MCP সেটআপ পড়ুন",
    "See product proof": "প্রোডাক্ট প্রমাণ দেখুন",
    Transports: "ট্রান্সপোর্ট",
    Resources: "রিসোর্স",
    "Client setup": "ক্লায়েন্ট সেটআপ",
    "Model policy": "মডেল নীতি",
    "MCP quick test": "MCP দ্রুত টেস্ট",
    "Interactive demo layer": "ইন্টারঅ্যাকটিভ ডেমো লেয়ার",
    "The public pitch hints at the product magic.":
      "পাবলিক পিচ প্রোডাক্টের শক্তির ইঙ্গিত দেয়।",
    "Reviewers should understand before logging in that this is a commandable workflow. The real app lets staff operate major clinic actions through natural language while keeping review boundaries visible.":
      "লগইন করার আগেই রিভিউয়ারদের বোঝা উচিত এটি কমান্ডে চালানো যায় এমন ওয়ার্কফ্লো। বাস্তব অ্যাপে স্টাফরা ন্যাচারাল ল্যাঙ্গুয়েজে বড় ক্লিনিক কাজ চালাতে পারে, রিভিউ সীমা দৃশ্যমান রেখেই।",
    Command: "কমান্ড",
    "Main pitch": "মূল পিচ",
    "Not diagnosis. Clinic workflow acceleration.":
      "রোগ নির্ণয় নয়। ক্লিনিক ওয়ার্কফ্লো দ্রুত করা।",
    "Everything included": "সবকিছু অন্তর্ভুক্ত",
    "The demo is loaded because the product story is loaded.":
      "ডেমো সমৃদ্ধ, কারণ প্রোডাক্ট গল্পটিও সমৃদ্ধ।",
    "Full feature list": "পূর্ণ ফিচার তালিকা",
    "Interactions reviewers can feel": "রিভিউয়াররা যে ইন্টারঅ্যাকশন অনুভব করতে পারেন",
    "Every click moves the clinic forward.": "প্রতিটি ক্লিক ক্লিনিককে এগিয়ে নেয়।",
    Workflow: "ওয়ার্কফ্লো",
    "One visit, one visible path.": "একটি ভিজিট, একটি দৃশ্যমান পথ।",
    "Product score map": "প্রোডাক্ট স্কোর ম্যাপ",
    "The pitch is built around proof, not vibes.":
      "পিচটি অনুভূতির উপর নয়, প্রমাণের উপর তৈরি।",
    "Demo runbook": "ডেমো রানবুক",
    "A crisp three-minute story the team can follow.":
      "টিম অনুসরণ করতে পারে এমন পরিষ্কার তিন মিনিটের গল্প।",
    "Final proof": "চূড়ান্ত প্রমাণ",
    "Close the demo on operational evidence.":
      "অপারেশনাল প্রমাণ দিয়ে ডেমো শেষ করুন।",
    "After the AI draft, the team can see queue state, follow-up ownership, trend signals, audit history, and readiness scoring. That is the difference between a clever prompt and a viable product.":
      "AI ড্রাফটের পরে টিম কিউ স্টেট, ফলো-আপ মালিকানা, ট্রেন্ড সিগনাল, অডিট হিস্ট্রি ও রেডিনেস স্কোরিং দেখতে পারে। এটাই চতুর প্রম্পট আর কার্যকর প্রোডাক্টের পার্থক্য।",
    "Responsive clinic OS": "রেসপনসিভ ক্লিনিক OS",
    "Dense enough for staff. Clear enough for review.":
      "স্টাফের জন্য যথেষ্ট ঘন। রিভিউয়ের জন্য যথেষ্ট পরিষ্কার।",
    "The authenticated app combines queue pressure, visit progress, safety review, handout, teach-back, referral, follow-up, and audit surfaces in one operational workspace.":
      "অথেন্টিকেটেড অ্যাপ কিউ চাপ, ভিজিট প্রগ্রেস, সেফটি রিভিউ, হ্যান্ডআউট, টিচ-ব্যাক, রেফারাল, ফলো-আপ ও অডিট সারফেসকে এক অপারেশনাল ওয়ার্কস্পেসে আনে।",
    "Real product screens": "বাস্তব প্রোডাক্ট স্ক্রিন",
    "Screenshots from the working app, not mockups.":
      "ওয়ার্কিং অ্যাপের স্ক্রিনশট, মকআপ নয়।",
    "Open demo": "ডেমো খুলুন",
    "Open the live Queue workspace and show red-flag lane, wait time, owner badges, and follow-up due state.":
      "লাইভ কিউ ওয়ার্কস্পেস খুলুন এবং রেড-ফ্ল্যাগ লেন, অপেক্ষার সময়, দায়িত্ব ব্যাজ ও ফলো-আপ ডিউ স্টেট দেখান।",
    "Open the selected patient Case page and review intake, vitals, safety gates, draft, handout, and follow-up.":
      "নির্বাচিত রোগীর কেস পেজ খুলে ইনটেক, ভাইটাল, সেফটি গেট, ড্রাফট, হ্যান্ডআউট ও ফলো-আপ রিভিউ করুন।",
    "Run or show the Copilot Console with chat, command palette, tool stream, run receipts, approvals, memory, and timeline.":
      "চ্যাট, কমান্ড প্যালেট, টুল স্ট্রিম, রান রিসিট, অনুমোদন, মেমরি ও টাইমলাইনসহ কোপাইলট কনসোল চালান বা দেখান।",
    "Open Builder and show the Workflow Studio: Canvas, Governor, Journey, Protocols, Shift, Simulation, Marketplace.":
      "Builder খুলে Workflow Studio দেখান: Canvas, Governor, Journey, Protocols, Shift, Simulation, Marketplace।",
    "Use Admin MCP Explorer to run tools/list or safety blockers and prove external-agent readiness.":
      "Admin MCP Explorer দিয়ে tools/list বা safety blockers চালিয়ে external-agent readiness প্রমাণ করুন।",
    "End with print preview, safety guardrails, impact metrics, and the clinician-review boundary.":
      "প্রিন্ট প্রিভিউ, সেফটি গার্ডরেইল, ইমপ্যাক্ট মেট্রিক এবং ক্লিনিশিয়ান-রিভিউ সীমা দিয়ে শেষ করুন।",
    "Launch demo": "ডেমো চালু করুন",
    workspaces: "ওয়ার্কস্পেস",
    "autonomous clinical decisions": "স্বয়ংক্রিয় ক্লিনিক্যাল সিদ্ধান্ত",
  }),
);

const publicOriginalTextNodes = new WeakMap<Text, string>();

function usePublicDomLocalization(language: "en" | "bn") {
  useEffect(() => {
    const root = document.querySelector("[data-public-language]");
    if (!root) {
      return;
    }
    const rootElement = root;

    function translateTextNode(node: Text) {
      const parent = node.parentElement;
      if (!parent) {
        return;
      }
      if (
        [
          "SCRIPT",
          "STYLE",
          "TEXTAREA",
          "INPUT",
          "OPTION",
          "CODE",
          "PRE",
        ].includes(parent.tagName) ||
        parent.isContentEditable
      ) {
        return;
      }
      const original =
        publicOriginalTextNodes.get(node) ?? node.nodeValue ?? "";
      if (!publicOriginalTextNodes.has(node)) {
        publicOriginalTextNodes.set(node, original);
      }
      const trimmed = original.trim();
      const translated = publicBnTextMap.get(trimmed);
      const nextValue =
        language === "bn" && translated
          ? original.replace(trimmed, translated)
          : original;
      if (node.nodeValue !== nextValue) {
        node.nodeValue = nextValue;
      }
    }

    function translateAttributes(element: Element) {
      for (const attribute of ["alt", "aria-label", "title"]) {
        const value = element.getAttribute(attribute);
        if (!value) {
          continue;
        }
        const originalAttribute = `data-original-${attribute}`;
        const original = element.getAttribute(originalAttribute) ?? value;
        if (!element.hasAttribute(originalAttribute)) {
          element.setAttribute(originalAttribute, original);
        }
        const nextValue =
          language === "bn"
            ? (publicBnTextMap.get(original) ?? original)
            : original;
        if (element.getAttribute(attribute) !== nextValue) {
          element.setAttribute(attribute, nextValue);
        }
      }
    }

    function translateTree() {
      const walker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
      );
      let node = walker.nextNode();
      while (node) {
        translateTextNode(node as Text);
        node = walker.nextNode();
      }
      for (const element of rootElement.querySelectorAll("*")) {
        translateAttributes(element);
      }
    }

    translateTree();
    const observer = new MutationObserver(() => translateTree());
    observer.observe(rootElement, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [language]);
}
