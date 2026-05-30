"use client";

import { useMutation, useQuery } from "convex/react";
import { LogOut, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { AuthScreen } from "../../auth/components/auth-screen";
import { useDemoAuth } from "../../auth/use-demo-auth";
import { initialIntake } from "../data";
import type { CopilotOutput, IntakeFormState } from "../types";
import { CaseBoard } from "./case-board";
import { DoctorConsole } from "./doctor-console";
import { IntakePanel } from "./intake-panel";
import { MedicineSafety } from "./medicine-safety";
import { Metric } from "./metric";
import { ModelSelector } from "./model-selector";
import { PatientHandout } from "./patient-handout";
import { SafetyFrame } from "./safety-frame";
import { TrendDashboard } from "./trend-dashboard";

export function ClinicCopilotApp() {
  const auth = useDemoAuth();
  const [form, setForm] = useState<IntakeFormState>(initialIntake);
  const [output, setOutput] = useState<CopilotOutput | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<
    Id<"cases"> | undefined
  >();
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [mode, setMode] = useState<"idle" | "demo" | "live">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const cases = useQuery(api.cases.listRecent, { userId: auth.user?._id });
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

  const selectedCase = useMemo(
    () => cases?.find((caseItem) => caseItem._id === selectedCaseId),
    [cases, selectedCaseId],
  );
  const displayOutput = selectedCase ? caseToOutput(selectedCase) : output;

  useEffect(() => {
    if (!selectedCaseId && cases?.[0]) {
      setSelectedCaseId(cases[0]._id);
    }
  }, [cases, selectedCaseId]);

  if (!auth.isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#12332c] text-white">
        Loading clinic workspace...
      </main>
    );
  }

  if (!auth.user) {
    return <AuthScreen onLogin={auth.login} onRegister={auth.register} />;
  }

  const currentUser = auth.user;

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
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "AI generation failed.");
      }

      const generated = data.output as CopilotOutput;
      setOutput(generated);
      setMode(data.mode ?? "live");

      const caseId = await createCase({
        userId: currentUser._id,
        patientName: form.patientName,
        age: Number(form.age) || 0,
        language: generated.languageDetected,
        sex: form.sex,
        intake: form.intake,
        chiefComplaint: generated.chiefComplaint,
        summary: generated.summary,
        severity: generated.severity,
        redFlagCount: generated.redFlags.length,
        redFlags: generated.redFlags,
        missingQuestions: generated.missingQuestions,
        soap: generated.soap,
        doctorChecklist: generated.doctorChecklist,
        patientHandout: generated.patientHandout,
        followUp: generated.followUp,
      });
      setSelectedCaseId(caseId);
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
    void updateStatus({ caseId, userId: currentUser._id, status });
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
                {currentUser.clinicName}
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
          <Button
            className="justify-self-start lg:justify-self-end"
            type="button"
            variant="secondary"
            onClick={auth.logout}
          >
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </Button>
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
          <DoctorConsole output={displayOutput} />
          <PatientHandout output={displayOutput} />
          <MedicineSafety model={selectedModel} output={displayOutput} />
        </section>

        <aside className="space-y-4">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <CaseBoard
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={setSelectedCaseId}
            onStatusChange={changeCaseStatus}
          />
          <TrendDashboard cases={cases} />
          <SafetyFrame />
        </aside>
      </section>
    </main>
  );
}

function caseToOutput(caseItem: Doc<"cases">): CopilotOutput {
  return {
    chiefComplaint: caseItem.chiefComplaint,
    summary: caseItem.summary ?? "Stored case summary is not available.",
    languageDetected: caseItem.language,
    severity: caseItem.severity,
    redFlags: caseItem.redFlags ?? [],
    missingQuestions: caseItem.missingQuestions ?? [],
    soap: caseItem.soap ?? {
      subjective: caseItem.intake,
      objective: "Vitals and exam findings were not stored for this case.",
      assessmentSupport: "Open the latest generated draft for full detail.",
      planSupport: "Review and document clinician-approved plan.",
    },
    doctorChecklist: caseItem.doctorChecklist ?? [],
    patientHandout: caseItem.patientHandout ?? {
      title: "Patient handout",
      plainSummary: caseItem.summary ?? caseItem.chiefComplaint,
      careSteps: [],
      medicineInstructions: [],
      urgentReturnWarnings: [],
    },
    followUp: caseItem.followUp ?? {
      timing: "As advised",
      message: "Follow the clinician-approved follow-up plan.",
    },
  };
}
