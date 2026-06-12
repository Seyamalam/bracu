"use client";

import {
  Bot,
  FileText,
  GitBranch,
  HeartPulse,
  MonitorPlay,
  Printer,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/features/language/language-context";
import { LanguageToggle } from "@/features/language/language-toggle";
import { BrandMark } from "./brand-mark";

const judgeSteps = [
  {
    detail:
      "Open the live Queue workspace and show red-flag lane, wait time, owner badges, and follow-up due state.",
    icon: MonitorPlay,
    title: "1. Start in Queue",
  },
  {
    detail:
      "Open the selected patient Case page and review intake, vitals, safety gates, draft, handout, and follow-up.",
    icon: HeartPulse,
    title: "2. Open Case",
  },
  {
    detail:
      "Run or show the Copilot Console with chat, command palette, tool stream, run receipts, approvals, memory, and timeline.",
    icon: Bot,
    title: "3. Show Copilot",
  },
  {
    detail:
      "Open Builder and show the Workflow Studio: Canvas, Governor, Journey, Protocols, Shift, Simulation, Marketplace.",
    icon: GitBranch,
    title: "4. Show Builder",
  },
  {
    detail:
      "Use Admin MCP Explorer to run tools/list or safety blockers and prove external-agent readiness.",
    icon: FileText,
    title: "5. Prove MCP",
  },
  {
    detail:
      "End with print preview, safety guardrails, impact metrics, and the clinician-review boundary.",
    icon: Printer,
    title: "6. Close Strong",
  },
] as const;

export function JudgeModePage() {
  const { language, setLanguage } = useLanguage();
  const copy = judgeCopy[language];

  return (
    <main className="min-h-screen bg-[#071f1a] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <BrandMark />
        <div className="flex flex-wrap justify-end gap-2">
          <LanguageToggle
            className="min-w-52"
            value={language}
            onChange={setLanguage}
          />
          <Button asChild variant="secondary">
            <Link href="/clinic/queue">{copy.launchDemo}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">{copy.docs}</Link>
          </Button>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 font-black text-4xl tracking-normal sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 text-lg text-white/76 leading-8">{copy.body}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["6", copy.workspaces],
              ["10+", copy.mcpTools],
              ["0", copy.autonomousDecisions],
            ].map(([value, label]) => (
              <div
                className="border border-white/16 bg-white/10 p-4"
                key={label}
              >
                <p className="font-black text-3xl">{value}</p>
                <p className="text-white/70 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {copy.steps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                className="border border-white/16 bg-white/10 p-5"
                key={step.title}
              >
                <div className="flex gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center bg-[#f2c14e] text-slate-950">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="font-bold text-xl">{step.title}</h2>
                    <p className="mt-1 text-white/76 leading-7">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
          <div className="border border-emerald-300/30 bg-emerald-300/10 p-5">
            <div className="flex gap-3">
              <ShieldCheck className="text-emerald-200" aria-hidden="true" />
              <p className="text-emerald-50 leading-7">{copy.safetyLine}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const judgeCopy = {
  en: {
    autonomousDecisions: "autonomous clinical decisions",
    body: "Use this page as the judging script. It highlights the calm clinic workflow first, then proves the agentic layer with receipts, approvals, Builder, MCP Explorer, global Ask Copilot, and print-first outputs.",
    docs: "Docs",
    eyebrow: "Judge Mode",
    launchDemo: "Launch demo",
    mcpTools: "MCP tools",
    safetyLine:
      "Say this clearly: the AI drafts, checks, explains, and prepares work. Humans approve clinical and patient-facing outputs.",
    steps: judgeSteps,
    title: "A clean 3-minute route through the whole clinic OS.",
    workspaces: "workspaces",
  },
  bn: {
    autonomousDecisions: "স্বয়ংক্রিয় ক্লিনিক্যাল সিদ্ধান্ত",
    body: "এই পেজটি জাজিং স্ক্রিপ্ট হিসেবে ব্যবহার করুন। এটি আগে শান্ত ক্লিনিক ওয়ার্কফ্লো দেখায়, তারপর রিসিট, অনুমোদন, Builder, MCP Explorer, global Ask Copilot এবং প্রিন্ট-ফার্স্ট আউটপুট দিয়ে এজেন্টিক লেয়ার প্রমাণ করে।",
    docs: "ডকস",
    eyebrow: "জাজ মোড",
    launchDemo: "ডেমো চালু করুন",
    mcpTools: "MCP টুল",
    safetyLine:
      "এটি পরিষ্কারভাবে বলুন: AI ড্রাফট করে, চেক করে, ব্যাখ্যা করে এবং কাজ প্রস্তুত করে। ক্লিনিক্যাল ও রোগীমুখী আউটপুট মানুষ অনুমোদন করে।",
    steps: [
      {
        detail:
          "লাইভ Queue ওয়ার্কস্পেস খুলে red-flag lane, wait time, owner badges এবং follow-up due state দেখান।",
        icon: MonitorPlay,
        title: "১. Queue থেকে শুরু",
      },
      {
        detail:
          "নির্বাচিত রোগীর Case পেজ খুলে intake, vitals, safety gates, draft, handout এবং follow-up রিভিউ করুন।",
        icon: HeartPulse,
        title: "২. Case খুলুন",
      },
      {
        detail:
          "chat, command palette, tool stream, run receipts, approvals, memory এবং timeline সহ Copilot Console চালান বা দেখান।",
        icon: Bot,
        title: "৩. Copilot দেখান",
      },
      {
        detail:
          "Builder খুলে Workflow Studio দেখান: Canvas, Governor, Journey, Protocols, Shift, Simulation, Marketplace।",
        icon: GitBranch,
        title: "৪. Builder দেখান",
      },
      {
        detail:
          "Admin MCP Explorer দিয়ে tools/list বা safety blockers চালিয়ে external-agent readiness প্রমাণ করুন।",
        icon: FileText,
        title: "৫. MCP প্রমাণ করুন",
      },
      {
        detail:
          "print preview, safety guardrails, impact metrics এবং clinician-review boundary দিয়ে শেষ করুন।",
        icon: Printer,
        title: "৬. শক্তভাবে শেষ করুন",
      },
    ],
    title: "পুরো clinic OS দেখানোর পরিষ্কার ৩ মিনিটের পথ।",
    workspaces: "ওয়ার্কস্পেস",
  },
} as const;
