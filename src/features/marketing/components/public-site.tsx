"use client";

import { ArrowRight, LogIn, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  audienceCards,
  brand,
  featurePillars,
  marketingImages,
  missionPoints,
  pitchBeats,
  proofStats,
  publicNav,
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
              Built for CloudCamp Infinity AI BuildFest
            </p>
            <h1 className="mt-4 max-w-4xl font-black text-4xl leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              The AI clinic cockpit for Bangla-first care.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/86 leading-8">
              {brand.name} turns messy reception notes into safer clinic
              workflow: structured drafts, red-flag review, handouts,
              teach-back, follow-up, and operations visibility.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">
                  <PlayCircle size={19} aria-hidden="true" />
                  Launch hackathon demo
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
      <FeatureOverview />
      <MissionBand />
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
      <WorkflowBand />
      <ProductImageBand />
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
        eyebrow="Winning pitch"
        title="A real product story in one clinic workflow."
        body="The demo starts with a locally relevant case and ends with a safer handoff, printable instruction, and operational proof."
      />
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
      <WorkflowBand />
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

function ProductImageBand() {
  return (
    <ImageStory
      image={marketingImages.product}
      kicker="Responsive clinic OS"
      title="Dense enough for staff. Clear enough for judges."
      body="The authenticated app combines queue pressure, visit progress, safety review, handout, teach-back, referral, follow-up, and audit surfaces in one operational workspace."
    />
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

function ImageStory({
  body,
  image,
  kicker,
  title,
}: {
  body: string;
  image: string;
  kicker: string;
  title: string;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
      <div className="relative min-h-80 overflow-hidden border border-border bg-white">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          src={image}
        />
      </div>
      <div className="self-center">
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
