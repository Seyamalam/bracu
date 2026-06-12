"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CopilotOutput, IntakeFormState } from "../types";
import { useClinicText } from "../use-clinic-text";
import { AiRunReceipts } from "./ai-run-receipts";
import type { WorkspacePage } from "./app-shell-sidebar";
import { workspaceMeta } from "./app-shell-sidebar";
import { ApprovalReadiness } from "./approval-readiness";
import { ApprovalsInbox } from "./approvals-inbox";
import { ClinicalSafetyGates, type SafetyGate } from "./clinical-safety-gates";
import { Metric } from "./metric";
import { PatientHandout } from "./patient-handout";

type HandoutCopy = {
  handoutTitle: string;
  handoutSubtitle: string;
  clinicianReview: string;
  safetyBanner: string;
};

export function PrintPreviewDialog({
  copy,
  output,
  onClose,
}: {
  copy: HandoutCopy;
  output: CopilotOutput | null;
  onClose: () => void;
}) {
  const t = useClinicText();

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 p-4">
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b pb-3">
          <div>
            <p className="font-black text-xl">{t("Print Preview")}</p>
            <p className="text-muted-foreground text-sm">
              {t("Review the packet before sending it to the printer.")}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("Close")}
          </Button>
        </div>
        <div className="mt-4">
          <PatientHandout copy={copy} output={output} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("Keep editing")}
          </Button>
          <Button type="button" onClick={() => window.print()}>
            {t("Print packet")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CopilotSupportDrawer({
  approvalCheckSignal,
  commandApprovalInstruction,
  form,
  model,
  output,
  runningAction,
  safetyGates,
  onClose,
  onOpenCopilot,
  onPrintPreview,
  onRunCommand,
}: {
  approvalCheckSignal: number;
  commandApprovalInstruction?: string;
  form: IntakeFormState;
  model: string;
  output: CopilotOutput | null;
  runningAction: string | null;
  safetyGates: SafetyGate[];
  onClose: () => void;
  onOpenCopilot: () => void;
  onPrintPreview: () => void;
  onRunCommand: (command: string) => void | Promise<void>;
}) {
  const t = useClinicText();

  return (
    <div className="fixed inset-0 z-40 bg-black/30">
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto border-slate-200 border-l bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-slate-200 border-b bg-white p-4">
          <div>
            <p className="font-black text-xl">{t("Ask Copilot")}</p>
            <p className="text-muted-foreground text-sm">
              {t(
                "Page-aware help with chat, tools, approvals, and safety context.",
              )}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("Close")}
          </Button>
        </div>
        <div className="space-y-4 p-4">
          <Button
            className="w-full justify-center"
            type="button"
            onClick={onOpenCopilot}
          >
            {t("Open full Copilot")}
          </Button>
          <AiRunReceipts
            form={form}
            output={output}
            runningAction={runningAction}
          />
          <ApprovalsInbox
            form={form}
            output={output}
            onCommand={onRunCommand}
            onPrintPreview={onPrintPreview}
          />
          <ClinicalSafetyGates gates={safetyGates} />
          <ApprovalReadiness
            checkSignal={approvalCheckSignal}
            commandInstruction={commandApprovalInstruction}
            model={model}
            onRunCommand={onRunCommand}
            output={output}
          />
        </div>
      </aside>
    </div>
  );
}

export function ClinicWorkspaceHeader({
  activePage,
  caseCount,
  clinicName,
  mode,
  providerLabel,
  readyScore,
  selectedModel,
  onAskCopilot,
  onModelChange,
}: {
  activePage: WorkspacePage;
  caseCount: number;
  clinicName: string;
  mode: "idle" | "demo" | "live";
  providerLabel: string;
  readyScore: number;
  selectedModel: string;
  onAskCopilot: () => void;
  onModelChange: (value: string) => void;
}) {
  const t = useClinicText();
  const activeWorkspace =
    workspaceMeta.find((item) => item.id === activePage) ?? workspaceMeta[0];
  const ActiveWorkspaceIcon = activeWorkspace.icon as LucideIcon;

  return (
    <header className="border-slate-200 border-b bg-gradient-to-r from-white via-[#f7fff8] to-[#fff7d6]">
      <div className="mx-auto grid max-w-[1680px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-semibold text-primary text-sm">{clinicName}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="hidden size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm sm:flex">
              <ActiveWorkspaceIcon size={22} aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-black text-2xl tracking-normal sm:text-4xl">
                {t(activeWorkspace.label)}
              </h1>
              <p className="mt-1 text-muted-foreground text-sm">
                {t(activeWorkspace.description)}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 lg:min-w-[30rem]">
          <Metric label={t("Cases")} value={caseCount} />
          <Metric label={t("Ready")} value={`${readyScore}%`} />
          <Metric label={t("Mode")} value={mode === "idle" ? "Demo" : mode} />
          <Metric label={t("Provider")} value={providerLabel} />
          <ProviderSwitch
            className="col-span-4"
            value={selectedModel}
            onChange={onModelChange}
          />
          {activePage !== "ai" ? (
            <Button
              className="col-span-4 bg-[#f2c14e] text-slate-950 hover:bg-[#e2b243]"
              type="button"
              onClick={onAskCopilot}
            >
              {t("Ask Copilot")}
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function ProviderSwitch({
  className,
  value,
  onChange,
}: {
  className?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useClinicText();
  const options = [
    { label: "LM Studio", value: "lmstudio" },
    { label: "Gemini", value: "gemini-2.5-flash" },
  ];

  return (
    <fieldset
      className={cn(
        "grid grid-cols-2 rounded-lg border border-slate-200 bg-white p-1 shadow-sm",
        className,
      )}
    >
      <legend className="sr-only">{t("AI provider switcher")}</legend>
      {options.map((option) => {
        const isActive =
          option.value === "lmstudio"
            ? value === "lmstudio"
            : value !== "lmstudio";
        return (
          <Button
            key={option.value}
            aria-pressed={isActive}
            className={cn(
              "h-9 rounded-md text-xs",
              isActive
                ? "bg-[#0f3d33] text-white hover:bg-[#0b2f28]"
                : "bg-transparent text-slate-700 shadow-none hover:bg-slate-100",
            )}
            type="button"
            variant={isActive ? "default" : "ghost"}
            onClick={() => onChange(option.value)}
          >
            {t(option.label)}
          </Button>
        );
      })}
    </fieldset>
  );
}
