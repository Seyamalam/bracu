"use client";

import { ArrowRight, CheckCircle2, LogIn, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  audienceCards,
  brand,
  demoRunbook,
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

type PublicPage = "features" | "home" | "login" | "mission" | "pitch";

export function PublicSite({
  page = "home",
  authSlot,
}: {
  authSlot?: React.ReactNode;
  page?: PublicPage;
}) {
  return (
    <main className="min-h-screen bg-[#fbfaf6] text-slate-950">
      <PublicHeader activePage={page} />
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
        <Button asChild className="shrink-0">
          <Link href="/login">
            <LogIn size={17} aria-hidden="true" />
            Start demo
          </Link>
        </Button>
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
              The AI clinic cockpit for Bangla-first care.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/86 leading-8">
              {brand.name} turns messy reception notes into safer clinic
              workflow: structured drafts, red-flag review, handouts,
              teach-back, follow-up, and operations visibility.
            </p>
            <div className="mt-5 inline-flex max-w-full flex-wrap items-center gap-2 border border-[#f2c14e]/45 bg-slate-950/35 px-3 py-2 text-sm">
              <span className="font-semibold text-[#f2c14e]">
                MCP endpoint live
              </span>
              <span className="font-mono text-white/88">/api/mcp</span>
              <span className="text-white/62">tools/list + resources/read</span>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">
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
        title="From waiting room notes to follow-up ownership."
        body="A clinic does not need one more isolated AI textbox. It needs a connected workflow across reception, clinician review, patient education, and operations."
      />
      <FeatureGrid />
      <FullFeatureCatalog />
      <InteractionBand />
      <WorkflowBand />
      <ShowcaseStories />
    </>
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
            The demo now exposes a Model Context Protocol endpoint for safe
            clinic workflow context: tools, resources, scenario data, and an
            AI-powered intake brief that external agents can call.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <a href="/api/mcp">
                Inspect /api/mcp
                <ArrowRight size={18} aria-hidden="true" />
              </a>
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
            <code>{`POST /api/mcp
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}`}</code>
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
            <Link href="/login">
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
