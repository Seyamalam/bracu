"use client";

import { useMutation, useQuery } from "convex/react";
import { Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { initialIntake } from "../data";
import type { CopilotOutput, IntakeFormState } from "../types";
import { CaseBoard } from "./case-board";
import { DoctorConsole } from "./doctor-console";
import { IntakePanel } from "./intake-panel";
import { Metric } from "./metric";
import { PatientHandout } from "./patient-handout";
import { SafetyFrame } from "./safety-frame";

export function ClinicCopilotApp() {
  const [form, setForm] = useState<IntakeFormState>(initialIntake);
  const [output, setOutput] = useState<CopilotOutput | null>(null);
  const [mode, setMode] = useState<"idle" | "demo" | "live">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const cases = useQuery(api.cases.listRecent);
  const createCase = useMutation(api.cases.createCase);
  const updateStatus = useMutation(api.cases.updateStatus);

  const readyScore = useMemo(() => {
    let score = 0;
    if (form.patientName.trim()) score += 25;
    if (Number(form.age) > 0) score += 20;
    if (form.intake.length > 40) score += 35;
    if (form.intake.length > 120) score += 20;
    return Math.min(score, 100);
  }, [form]);

  async function generate() {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.patientName,
          age: Number(form.age),
          sex: form.sex,
          intake: form.intake,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "AI generation failed.");
      }

      const generated = data.output as CopilotOutput;
      setOutput(generated);
      setMode(data.mode ?? "live");

      await createCase({
        patientName: form.patientName,
        age: Number(form.age) || 0,
        language: generated.languageDetected,
        sex: form.sex,
        intake: form.intake,
        chiefComplaint: generated.chiefComplaint,
        severity: generated.severity,
        redFlagCount: generated.redFlags.length,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  function changeCaseStatus(
    caseId: Id<"cases">,
    status: "handout" | "followup",
  ) {
    void updateStatus({ caseId, status });
  }

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-slate-950">
      <section className="border-slate-900 border-b bg-[#12332c] text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-[#f2c14e] text-slate-950">
              <Stethoscope size={24} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-[#f2c14e] text-sm">
                Clinic Copilot BD
              </p>
              <h1 className="font-semibold text-2xl tracking-normal sm:text-4xl">
                AI clinical documentation, built for Bangla-first care.
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-96">
            <Metric label="Cases" value={cases?.length ?? 0} />
            <Metric label="Ready" value={`${readyScore}%`} />
            <Metric label="Mode" value={mode === "idle" ? "Demo" : mode} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[380px_1fr_320px] lg:px-8">
        <aside className="space-y-4">
          <IntakePanel
            form={form}
            error={error}
            isGenerating={isGenerating}
            onChange={setForm}
            onGenerate={generate}
          />
        </aside>

        <section className="space-y-4">
          <DoctorConsole output={output} />
          <PatientHandout output={output} />
        </section>

        <aside className="space-y-4">
          <CaseBoard cases={cases} onStatusChange={changeCaseStatus} />
          <SafetyFrame />
        </aside>
      </section>
    </main>
  );
}
