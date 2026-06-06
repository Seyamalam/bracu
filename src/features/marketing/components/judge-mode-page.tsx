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
  return (
    <main className="min-h-screen bg-[#071f1a] text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <BrandMark />
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/clinic/queue">Launch demo</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/docs">Docs</Link>
          </Button>
        </div>
      </header>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="font-semibold text-[#f2c14e] text-sm uppercase tracking-[0.16em]">
            Judge Mode
          </p>
          <h1 className="mt-4 font-black text-4xl tracking-normal sm:text-6xl">
            A clean 3-minute route through the whole clinic OS.
          </h1>
          <p className="mt-5 text-lg text-white/76 leading-8">
            Use this page as the judging script. It highlights the calm clinic
            workflow first, then proves the agentic layer with receipts,
            approvals, Builder, MCP Explorer, global Ask Copilot, and
            print-first outputs.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["6", "workspaces"],
              ["10+", "MCP tools"],
              ["0", "autonomous clinical decisions"],
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
          {judgeSteps.map((step) => {
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
              <p className="text-emerald-50 leading-7">
                Say this clearly: the AI drafts, checks, explains, and prepares
                work. Humans approve clinical and patient-facing outputs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
