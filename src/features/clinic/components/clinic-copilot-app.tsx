"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/features/language/language-context";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { AuthScreen } from "../../auth/components/auth-screen";
import { useDemoAuth } from "../../auth/use-demo-auth";
import { normalizeAgentCommand } from "../agent-commands";
import {
  demoScenarios,
  guidedWorkflowScript,
  initialIntake,
  uiCopy,
} from "../data";
import { getWorkspaceHref } from "../routes";
import type {
  CaseStatus,
  CommandHistoryEntry,
  CommandPlan,
  CopilotOutput,
  IntakeCleanupOutput,
  IntakeFormState,
  Severity,
  UiLanguage,
} from "../types";
import { useClinicText } from "../use-clinic-text";
import { AiRunReceipts } from "./ai-run-receipts";
import {
  AppShellSidebar,
  type WorkspacePage,
  workspaceMeta,
} from "./app-shell-sidebar";
import { ApprovalReadiness } from "./approval-readiness";
import { ApprovalsInbox } from "./approvals-inbox";
import { CaseAssistant } from "./case-assistant";
import { CaseBoard } from "./case-board";
import { ClinicBriefing } from "./clinic-briefing";
import {
  ClinicalSafetyGates,
  getClinicalSafetyGates,
} from "./clinical-safety-gates";
import { CopilotConsole } from "./copilot-console";
import { DoctorConsole } from "./doctor-console";
import { DocumentExtractor } from "./document-extractor";
import { FollowUpComposer } from "./follow-up-composer";
import { FollowUpPanel } from "./follow-up-panel";
import { FollowUpScheduler } from "./follow-up-scheduler";
import { IntakePanel } from "./intake-panel";
import {
  LowConnectivityPanel,
  type QueuedDraft,
} from "./low-connectivity-panel";
import { MedicineSafety } from "./medicine-safety";
import { Metric } from "./metric";
import { NextStepNavigator } from "./next-step-navigator";
import { OperationsPulse } from "./operations-pulse";
import { PatientHandout } from "./patient-handout";
import {
  type LiteracyMode,
  PatientLiteracyPanel,
} from "./patient-literacy-panel";
import { PatientQuestionAnswer } from "./patient-question-answer";
import { PresentationMode } from "./presentation-mode";
import { PrintWorkflowPanel } from "./print-workflow-panel";
import { ReferralComposer } from "./referral-composer";
import { ReplyTriage } from "./reply-triage";
import { RiskExplainer } from "./risk-explainer";
import type { ClinicRole } from "./role-workspace-panel";
import { StaffHandoff } from "./staff-handoff";
import { TeachBackCheck } from "./teach-back-check";
import { TrendDashboard } from "./trend-dashboard";
import { VisitCloseout } from "./visit-closeout";
import {
  type ToastNotice,
  WorkflowProgress,
  type WorkflowStep,
} from "./workflow-progress";

type ClinicCopilotAppProps = {
  initialWorkspace?: WorkspacePage;
};

type WorkspaceSnapshot = {
  caseSearch: string;
  commandApprovalInstruction?: string;
  commandCloseoutInstruction?: string;
  commandDocumentText?: string;
  commandCaseQuestion?: string;
  commandFollowUpInstruction?: string;
  commandFollowUpScheduleInstruction?: string;
  commandHandoffInstruction?: string;
  commandMedicines?: string;
  commandPatientQuestion?: string;
  commandPatientReply?: string;
  commandReferralInstruction?: string;
  commandRiskInstruction?: string;
  commandNextStepInstruction?: string;
  followUpChannel: "sms" | "whatsapp";
  form: IntakeFormState;
  label: string;
  mode: "idle" | "demo" | "live";
  output: CopilotOutput | null;
  presentationMode: boolean;
  referralDocumentType: "referral" | "visit_summary";
  selectedCaseId?: Id<"cases">;
  selectedModel: string;
  severityFilter: Severity | "all";
  statusFilter: CaseStatus | "all";
  uiLanguage: UiLanguage;
};

type ApiErrorPayload = {
  detail?: string;
  error?: string;
  provider?: string;
};

type ProviderErrorPayload = {
  detail?: string;
  provider?: string;
};

type AccessibilitySettings = {
  calmMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
};

function formatApiError(data: ApiErrorPayload, fallback: string) {
  const parts = [data.error ?? fallback];
  if (data.provider) {
    parts.push(`Provider: ${data.provider}`);
  }
  if (data.detail) {
    parts.push(`Detail: ${data.detail}`);
  }
  return parts.join(" ");
}

function formatProviderFallback(providerError?: ProviderErrorPayload) {
  if (!providerError) {
    return "";
  }
  const detail = providerError.detail ? `: ${providerError.detail}` : "";
  return ` Provider fallback (${providerError.provider ?? "AI provider"}${detail}).`;
}

export function ClinicCopilotApp({
  initialWorkspace = "ai",
}: ClinicCopilotAppProps = {}) {
  const router = useRouter();
  const auth = useDemoAuth();
  const { language: uiLanguage, setLanguage: setUiLanguage } = useLanguage();
  const [form, setForm] = useState<IntakeFormState>(initialIntake);
  const [output, setOutput] = useState<CopilotOutput | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<
    Id<"cases"> | undefined
  >();
  const [selectedModel, setSelectedModel] = useState("lmstudio");
  const [commandDocumentText, setCommandDocumentText] = useState<
    string | undefined
  >();
  const [commandApprovalInstruction, setCommandApprovalInstruction] = useState<
    string | undefined
  >();
  const [commandCloseoutInstruction, setCommandCloseoutInstruction] = useState<
    string | undefined
  >();
  const [commandCaseQuestion, setCommandCaseQuestion] = useState<
    string | undefined
  >();
  const [commandFollowUpInstruction, setCommandFollowUpInstruction] = useState<
    string | undefined
  >();
  const [
    commandFollowUpScheduleInstruction,
    setCommandFollowUpScheduleInstruction,
  ] = useState<string | undefined>();
  const [commandHandoffInstruction, setCommandHandoffInstruction] = useState<
    string | undefined
  >();
  const [commandMedicines, setCommandMedicines] = useState<
    string | undefined
  >();
  const [commandPatientQuestion, setCommandPatientQuestion] = useState<
    string | undefined
  >();
  const [commandPatientReply, setCommandPatientReply] = useState<
    string | undefined
  >();
  const [commandReferralInstruction, setCommandReferralInstruction] = useState<
    string | undefined
  >();
  const [commandRiskInstruction, setCommandRiskInstruction] = useState<
    string | undefined
  >();
  const [commandNextStepInstruction, setCommandNextStepInstruction] = useState<
    string | undefined
  >();
  const accessibilitySettings: AccessibilitySettings = {
    calmMotion: false,
    highContrast: false,
    largeText: false,
  };
  const [activeWorkspacePage, setActiveWorkspacePage] =
    useState<WorkspacePage>(initialWorkspace);
  const [activeRole] = useState<ClinicRole>("doctor");
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [appSidebarCollapsed, setAppSidebarCollapsed] = useState(false);
  const [literacyMode, setLiteracyMode] = useState<LiteracyMode>("simple_bn");
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [queuedDrafts, setQueuedDrafts] = useState<QueuedDraft[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [caseSearch, setCaseSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [mode, setMode] = useState<"idle" | "demo" | "live">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaningIntake, setIsCleaningIntake] = useState(false);
  const [error, setError] = useState("");
  const [liveMessage, setLiveMessage] = useState("Clinic workspace ready.");
  const [commandUndoStack, setCommandUndoStack] = useState<WorkspaceSnapshot[]>(
    [],
  );
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>(
    [],
  );
  const [followUpComposeSignal, setFollowUpComposeSignal] = useState(0);
  const [followUpChannel, setFollowUpChannel] = useState<"sms" | "whatsapp">(
    "whatsapp",
  );
  const [referralComposeSignal, setReferralComposeSignal] = useState(0);
  const [referralDocumentType, setReferralDocumentType] = useState<
    "referral" | "visit_summary"
  >("referral");
  const [briefingSignal, setBriefingSignal] = useState(0);
  const [riskExplainSignal, setRiskExplainSignal] = useState(0);
  const [handoffSignal, setHandoffSignal] = useState(0);
  const [nextStepSignal, setNextStepSignal] = useState(0);
  const [documentExtractSignal, setDocumentExtractSignal] = useState(0);
  const [replyTriageSignal, setReplyTriageSignal] = useState(0);
  const [followUpScheduleSignal, setFollowUpScheduleSignal] = useState(0);
  const [patientQuestionSignal, setPatientQuestionSignal] = useState(0);
  const [approvalCheckSignal, setApprovalCheckSignal] = useState(0);
  const [visitCloseoutSignal, setVisitCloseoutSignal] = useState(0);
  const [medicineCheckSignal, setMedicineCheckSignal] = useState(0);
  const [caseAssistantAskSignal, setCaseAssistantAskSignal] = useState(0);

  const cases = useQuery(api.cases.listRecent, { userId: auth.user?._id });
  const createCase = useMutation(api.cases.createCase);
  const updateStatus = useMutation(api.cases.updateStatus);
  const approveCase = useMutation(api.cases.approveCase);
  const updateDraft = useMutation(api.cases.updateDraft);
  const copy = uiCopy[uiLanguage];
  const t = useClinicText();
  useClinicDomLocalization(uiLanguage);
  const activeProviderLabel =
    selectedModel === "lmstudio" ? "LM Studio" : "Gemini";

  useEffect(() => {
    setActiveWorkspacePage(initialWorkspace);
  }, [initialWorkspace]);

  useEffect(() => {
    setAppSidebarCollapsed(activeWorkspacePage === "ai");
  }, [activeWorkspacePage]);

  function openWorkspacePage(page: WorkspacePage) {
    setActiveWorkspacePage(page);
    router.push(getWorkspaceHref(page));
  }

  function logout() {
    auth.logout();
    router.push("/login");
  }

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
  const filteredCases = useMemo(() => {
    const query = caseSearch.trim().toLowerCase();
    return (cases ?? []).filter((caseItem) => {
      const matchesQuery =
        !query ||
        [
          caseItem.patientName,
          caseItem.chiefComplaint,
          caseItem.language,
          caseItem.status,
          caseItem.severity,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "all" || caseItem.status === statusFilter;
      const matchesSeverity =
        severityFilter === "all" || caseItem.severity === severityFilter;

      return matchesQuery && matchesStatus && matchesSeverity;
    });
  }, [caseSearch, cases, severityFilter, statusFilter]);
  const displayOutput = selectedCase ? caseToOutput(selectedCase) : output;
  const safetyGates = useMemo(
    () =>
      getClinicalSafetyGates({
        form,
        output: displayOutput,
        status: selectedCase?.status,
      }),
    [displayOutput, form, selectedCase?.status],
  );
  const workflowSteps: WorkflowStep[] = useMemo(
    () => [
      {
        id: "intake",
        label: "Intake",
        detail: form.patientName
          ? `${form.patientName} captured`
          : "Patient basics needed",
        status:
          form.patientName && form.intake.length > 20 ? "complete" : "idle",
      },
      {
        id: "ai-draft",
        label: "AI draft",
        detail:
          runningAction === "generate"
            ? "Generating clinical draft"
            : "Structured draft",
        status:
          runningAction === "generate"
            ? "running"
            : displayOutput
              ? "complete"
              : "idle",
      },
      {
        id: "safety",
        label: "Safety gates",
        detail: safetyGates.some((gate) => !gate.passed)
          ? `${safetyGates.filter((gate) => !gate.passed).length} checks open`
          : "Required checks clear",
        status: safetyGates.some((gate) => !gate.passed)
          ? displayOutput
            ? "blocked"
            : "idle"
          : "complete",
      },
      {
        id: "patient",
        label: "Patient packet",
        detail:
          selectedCase?.status === "handout"
            ? "Handout ready"
            : "Handout and teach-back",
        status:
          selectedCase?.status === "handout" ||
          selectedCase?.status === "followup"
            ? "complete"
            : displayOutput
              ? "idle"
              : "idle",
      },
      {
        id: "follow-up",
        label: "Follow-up",
        detail:
          selectedCase?.status === "followup"
            ? "Callback owner assigned"
            : "Close the loop",
        status: selectedCase?.status === "followup" ? "complete" : "idle",
      },
    ],
    [displayOutput, form, runningAction, safetyGates, selectedCase?.status],
  );
  useEffect(() => {
    if (!selectedCaseId && filteredCases[0]) {
      setSelectedCaseId(filteredCases[0]._id);
    }
  }, [filteredCases, selectedCaseId]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const rawQueue = window.localStorage.getItem("clinic-copilot-draft-queue");
    if (rawQueue) {
      setQueuedDrafts(JSON.parse(rawQueue) as QueuedDraft[]);
    }

    function announceConnection(
      title: string,
      body: string,
      tone: ToastNotice["tone"],
    ) {
      setToast({ id: crypto.randomUUID(), title, body, tone });
      setLiveMessage(`${title}: ${body}`);
    }

    function handleOnline() {
      setIsOnline(true);
      announceConnection(
        "Connection restored",
        "Local draft queue is ready to sync.",
        "success",
      );
    }

    function handleOffline() {
      setIsOnline(false);
      announceConnection(
        "Offline mode",
        "New quick notes can be queued locally.",
        "warning",
      );
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "clinic-copilot-draft-queue",
      JSON.stringify(queuedDrafts),
    );
  }, [queuedDrafts]);

  const currentUser = auth.user;

  function notify(
    title: string,
    body: string,
    tone: ToastNotice["tone"] = "info",
  ) {
    setToast({
      id: crypto.randomUUID(),
      title,
      body,
      tone,
    });
    setLiveMessage(`${title}: ${body}`);
  }

  function beginAction(action: string, title: string, body: string) {
    setRunningAction(action);
    notify(title, body, "info");
  }

  function finishAction(title: string, body: string) {
    setRunningAction(null);
    notify(title, body, "success");
  }

  function failAction(title: string, body: string) {
    setRunningAction(null);
    notify(title, body, "error");
  }

  function queueLocalDraft(note: string) {
    const nextDraft: QueuedDraft = {
      id: crypto.randomUUID(),
      patientName: "Offline intake",
      age: "",
      sex: "unknown",
      intake: note,
      createdAt: Date.now(),
      syncStatus: "queued",
    };
    setQueuedDrafts((drafts) => [nextDraft, ...drafts].slice(0, 12));
    notify(
      "Draft queued",
      "The intake note is saved locally for sync.",
      "success",
    );
  }

  function syncQueuedDraft(draft: QueuedDraft) {
    setQueuedDrafts((drafts) =>
      drafts.map((item) =>
        item.id === draft.id ? { ...item, syncStatus: "syncing" } : item,
      ),
    );
    setForm({
      patientName: draft.patientName,
      age: draft.age,
      sex: draft.sex,
      intake: draft.intake,
    });
    setQueuedDrafts((drafts) => drafts.filter((item) => item.id !== draft.id));
    openWorkspacePage("case");
    notify(
      "Draft synced",
      "Queued intake is now active in the reception form.",
      "success",
    );
  }

  async function generate(nextForm = form, language: UiLanguage = uiLanguage) {
    if (!currentUser) {
      return;
    }

    setIsGenerating(true);
    setError("");
    beginAction(
      "generate",
      "Generating draft",
      "AI is structuring intake, red flags, and patient instructions.",
    );

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: nextForm.patientName,
          age: Number(nextForm.age),
          sex: nextForm.sex,
          intake: nextForm.intake,
          model: selectedModel,
          language,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(formatApiError(data, "AI generation failed."));
      }

      const generated = data.output as CopilotOutput;
      setOutput(generated);
      setMode(data.mode ?? "live");
      if (data.providerError) {
        notify(
          "Provider fallback",
          formatProviderFallback(data.providerError).trim(),
          "warning",
        );
      }
      setLiveMessage(`Generated draft for ${nextForm.patientName}.`);

      const caseId = await createCase({
        userId: currentUser._id,
        patientName: nextForm.patientName,
        age: Number(nextForm.age) || 0,
        language: generated.languageDetected,
        sex: nextForm.sex,
        intake: nextForm.intake,
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
      finishAction(
        "Draft generated",
        `${nextForm.patientName} is ready for clinician review and safety gates.`,
      );
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Something failed.";
      setError(message);
      failAction("Draft generation failed", message);
    } finally {
      setIsGenerating(false);
      setRunningAction(null);
    }
  }

  function changeCaseStatus(
    caseId: Id<"cases">,
    status: "handout" | "followup",
  ) {
    if (!currentUser) {
      return;
    }

    const openGates = safetyGates.filter((gate) => !gate.passed);
    if (status === "handout" && openGates.length) {
      notify(
        "Handout blocked",
        `Resolve ${openGates.length} safety gate${openGates.length === 1 ? "" : "s"} before moving to handout.`,
        "warning",
      );
      return;
    }

    void updateStatus({ caseId, userId: currentUser._id, status });
    finishAction("Status updated", `Moved selected case to ${status}.`);
  }

  function approveSelectedCase(caseId = selectedCaseId) {
    if (!(caseId && currentUser)) {
      return;
    }
    const openCriticalGates = safetyGates.filter(
      (gate) => !gate.passed && gate.priority !== "recommended",
    );
    if (openCriticalGates.length) {
      notify(
        "Approval blocked",
        `Resolve ${openCriticalGates.length} required safety check${openCriticalGates.length === 1 ? "" : "s"} first.`,
        "warning",
      );
      return;
    }
    void approveCase({ caseId, userId: currentUser._id });
    finishAction(
      "Approval saved",
      "Clinician approval recorded and case moved to handout.",
    );
  }

  function saveDraftEdits(nextOutput: CopilotOutput) {
    if (!currentUser) {
      return;
    }

    if (!selectedCaseId) {
      setOutput(nextOutput);
      return;
    }

    void updateDraft({
      caseId: selectedCaseId,
      userId: currentUser._id,
      chiefComplaint: nextOutput.chiefComplaint,
      summary: nextOutput.summary,
      severity: nextOutput.severity,
      redFlags: nextOutput.redFlags,
      missingQuestions: nextOutput.missingQuestions,
      soap: nextOutput.soap,
      doctorChecklist: nextOutput.doctorChecklist,
      patientHandout: nextOutput.patientHandout,
      followUp: nextOutput.followUp,
    });
    finishAction(
      "Draft edits saved",
      "Updated clinical draft is stored for review.",
    );
  }

  function recordCommand(entry: CommandHistoryEntry) {
    setCommandHistory((history) => [entry, ...history].slice(0, 8));
    setLiveMessage(`Command complete: ${entry.summary}`);
  }

  function resetWorkspace(scope: "filters" | "intake" | "all") {
    if (scope === "filters" || scope === "all") {
      setCaseSearch("");
      setStatusFilter("all");
      setSeverityFilter("all");
      setLiveMessage("Case filters cleared.");
    }

    if (scope === "intake" || scope === "all") {
      setForm(initialIntake);
      setOutput(null);
      setCommandApprovalInstruction(undefined);
      setCommandCaseQuestion(undefined);
      setCommandCloseoutInstruction(undefined);
      setCommandDocumentText(undefined);
      setCommandFollowUpInstruction(undefined);
      setCommandFollowUpScheduleInstruction(undefined);
      setCommandHandoffInstruction(undefined);
      setCommandMedicines(undefined);
      setCommandNextStepInstruction(undefined);
      setCommandPatientQuestion(undefined);
      setCommandPatientReply(undefined);
      setCommandReferralInstruction(undefined);
      setCommandRiskInstruction(undefined);
      setLiveMessage("Intake workspace reset.");
    }
  }

  function captureWorkspaceSnapshot(label: string): WorkspaceSnapshot {
    return {
      caseSearch,
      commandApprovalInstruction,
      commandCaseQuestion,
      commandCloseoutInstruction,
      commandDocumentText,
      commandFollowUpInstruction,
      commandFollowUpScheduleInstruction,
      commandHandoffInstruction,
      commandMedicines,
      commandNextStepInstruction,
      commandPatientQuestion,
      commandPatientReply,
      commandReferralInstruction,
      commandRiskInstruction,
      followUpChannel,
      form,
      label,
      mode,
      output,
      presentationMode,
      referralDocumentType,
      selectedCaseId,
      selectedModel,
      severityFilter,
      statusFilter,
      uiLanguage,
    };
  }

  function pushUndoSnapshot(label: string) {
    const snapshot = captureWorkspaceSnapshot(label);
    setCommandUndoStack((stack) => [snapshot, ...stack].slice(0, 6));
  }

  function restoreSnapshot(snapshot: WorkspaceSnapshot) {
    setCaseSearch(snapshot.caseSearch);
    setCommandApprovalInstruction(snapshot.commandApprovalInstruction);
    setCommandCaseQuestion(snapshot.commandCaseQuestion);
    setCommandCloseoutInstruction(snapshot.commandCloseoutInstruction);
    setCommandDocumentText(snapshot.commandDocumentText);
    setCommandFollowUpInstruction(snapshot.commandFollowUpInstruction);
    setCommandFollowUpScheduleInstruction(
      snapshot.commandFollowUpScheduleInstruction,
    );
    setCommandHandoffInstruction(snapshot.commandHandoffInstruction);
    setCommandMedicines(snapshot.commandMedicines);
    setCommandNextStepInstruction(snapshot.commandNextStepInstruction);
    setCommandPatientQuestion(snapshot.commandPatientQuestion);
    setCommandPatientReply(snapshot.commandPatientReply);
    setCommandReferralInstruction(snapshot.commandReferralInstruction);
    setCommandRiskInstruction(snapshot.commandRiskInstruction);
    setFollowUpChannel(snapshot.followUpChannel);
    setForm(snapshot.form);
    setMode(snapshot.mode);
    setOutput(snapshot.output);
    setPresentationMode(snapshot.presentationMode);
    setReferralDocumentType(snapshot.referralDocumentType);
    setSelectedCaseId(snapshot.selectedCaseId);
    setSelectedModel(snapshot.selectedModel);
    setSeverityFilter(snapshot.severityFilter);
    setStatusFilter(snapshot.statusFilter);
    setUiLanguage(snapshot.uiLanguage);
  }

  function undoLastCommand() {
    const [snapshot, ...remainingSnapshots] = commandUndoStack;
    if (!snapshot) {
      setLiveMessage("No previous command state to restore.");
      return;
    }

    restoreSnapshot(snapshot);
    setCommandUndoStack(remainingSnapshots);
    setLiveMessage(`Restored workspace before: ${snapshot.label}`);
  }

  async function runGuidedWorkflow(
    scenarioLabel: string = guidedWorkflowScript.scenarioLabel,
  ) {
    const scenario =
      demoScenarios.find((item) =>
        item.label.toLowerCase().includes(scenarioLabel.toLowerCase()),
      ) ?? demoScenarios[4];

    const nextForm = {
      patientName: scenario.patientName,
      age: scenario.age,
      sex: scenario.sex,
      intake: scenario.intake,
    };
    resetWorkspace("filters");
    setUiLanguage("bn");
    setForm(nextForm);
    setCommandMedicines(guidedWorkflowScript.medicines);
    setLiveMessage("Running guided workflow: scenario loaded.");
    await generate(nextForm, "bn");
    setPresentationMode(true);
  }

  async function runFullClinicWorkflow(
    scenarioLabel: string = guidedWorkflowScript.scenarioLabel,
  ) {
    await runGuidedWorkflow(scenarioLabel);
    setFollowUpChannel("whatsapp");
    setReferralDocumentType("referral");
    setRiskExplainSignal((signal) => signal + 1);
    setHandoffSignal((signal) => signal + 1);
    setNextStepSignal((signal) => signal + 1);
    setDocumentExtractSignal((signal) => signal + 1);
    setReplyTriageSignal((signal) => signal + 1);
    setFollowUpScheduleSignal((signal) => signal + 1);
    setPatientQuestionSignal((signal) => signal + 1);
    setApprovalCheckSignal((signal) => signal + 1);
    setVisitCloseoutSignal((signal) => signal + 1);
    setReferralComposeSignal((signal) => signal + 1);
    setFollowUpComposeSignal((signal) => signal + 1);
    setBriefingSignal((signal) => signal + 1);
    setLiveMessage(
      "Full clinic workflow is running: draft, risk, handoff, closeout, referral, follow-up, queue briefing, and presentation.",
    );
  }

  async function editDraftByCommand(instruction: string) {
    if (!displayOutput) {
      setError("Generate or select a draft before editing it.");
      return;
    }

    setError("");
    setLiveMessage("Editing selected draft with AI.");
    try {
      const response = await fetch("/api/draft-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: displayOutput,
          instruction,
          model: selectedModel,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Draft edit failed.");
      }
      const editedOutput = data.output as CopilotOutput;
      setOutput(editedOutput);
      saveDraftEdits(editedOutput);
      setLiveMessage(`Draft edited: ${instruction}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Draft edit failed.");
    }
  }

  async function cleanIntakeWithAi() {
    setIsCleaningIntake(true);
    setError("");
    beginAction(
      "clean-intake",
      "Cleaning intake",
      "AI is extracting vitals, medicines, red flags, and missing info.",
    );
    try {
      const response = await fetch("/api/intake-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intake: form.intake,
          model: selectedModel,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Intake cleanup failed.");
      }
      const cleaned = data.output as IntakeCleanupOutput;
      setForm({
        patientName: cleaned.patientName ?? form.patientName,
        age: cleaned.age ?? form.age,
        sex: cleaned.sex ?? form.sex,
        intake: [
          cleaned.cleanedIntake,
          cleaned.extractedVitals.length
            ? `Vitals extracted:\n${cleaned.extractedVitals.join("\n")}`
            : "",
          cleaned.extractedMedicines.length
            ? `Medicines extracted:\n${cleaned.extractedMedicines.join("\n")}`
            : "",
          cleaned.possibleRedFlags.length
            ? `Possible red flags to confirm:\n${cleaned.possibleRedFlags.join("\n")}`
            : "",
          cleaned.missingInfo.length
            ? `Missing info:\n${cleaned.missingInfo.join("\n")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
      });
      finishAction(
        "Intake cleaned",
        "Reception note now includes extracted facts and missing information.",
      );
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Intake cleanup failed.";
      setError(message);
      failAction("Intake cleanup failed", message);
    } finally {
      setIsCleaningIntake(false);
      setRunningAction(null);
    }
  }

  async function applyCommandPlan(plan: CommandPlan) {
    if (plan.actions.some((action) => action.type === "undo_last_command")) {
      undoLastCommand();
      return;
    }

    if (plan.actions.length > 0) {
      pushUndoSnapshot(plan.summary);
    }

    let nextForm = form;

    for (const action of plan.actions) {
      if (action.type === "fill_intake") {
        nextForm = {
          patientName: action.patientName ?? nextForm.patientName,
          age: action.age ?? nextForm.age,
          sex: action.sex ?? nextForm.sex,
          intake: action.intake
            ? `${nextForm.intake}\n\n${action.intake}`
            : nextForm.intake,
        };
        setForm(nextForm);
      }

      if (action.type === "load_scenario") {
        const scenario = demoScenarios.find((item) =>
          item.label
            .toLowerCase()
            .includes(action.scenarioLabel.toLowerCase().split(" ")[0]),
        );
        if (scenario) {
          nextForm = {
            patientName: scenario.patientName,
            age: scenario.age,
            sex: scenario.sex,
            intake: scenario.intake,
          };
          setForm(nextForm);
        }
      }

      if (action.type === "switch_language") {
        setUiLanguage(action.language);
        setLiveMessage(`Language switched to ${action.language}.`);
      }

      if (action.type === "presentation_mode") {
        setPresentationMode(action.enabled);
        setLiveMessage(
          action.enabled
            ? "Presentation mode opened."
            : "Presentation mode closed.",
        );
      }

      if (action.type === "check_medicine") {
        setCommandMedicines(
          action.medicines ??
            "Paracetamol 500mg\nAntibiotic twice daily\nORS as needed",
        );
        setMedicineCheckSignal((signal) => signal + 1);
      }

      if (action.type === "set_status" && selectedCaseId) {
        changeCaseStatus(selectedCaseId, action.status);
      }

      if (action.type === "search_cases") {
        setCaseSearch(action.query);
        setLiveMessage(`Searching cases for ${action.query}.`);
      }

      if (action.type === "filter_cases") {
        if (action.status) {
          setStatusFilter(action.status as CaseStatus | "all");
        }
        if (action.severity) {
          setSeverityFilter(action.severity as Severity | "all");
        }
      }

      if (action.type === "select_case") {
        const matchingCase = cases?.find((caseItem) =>
          caseItem.patientName
            .toLowerCase()
            .includes(action.patientName.toLowerCase()),
        );
        if (matchingCase) {
          setSelectedCaseId(matchingCase._id);
        }
      }

      if (action.type === "set_model") {
        setSelectedModel(action.model);
        setLiveMessage(`Model changed to ${action.model}.`);
      }

      if (action.type === "reset_workspace") {
        resetWorkspace(action.scope);
      }

      if (action.type === "run_guided_demo") {
        await runGuidedWorkflow(action.scenarioLabel);
      }

      if (action.type === "run_full_workflow") {
        await runFullClinicWorkflow(action.scenarioLabel);
      }

      if (action.type === "ask_case_assistant") {
        setCommandCaseQuestion(action.question);
        setCaseAssistantAskSignal((signal) => signal + 1);
        setLiveMessage("Asking the case assistant.");
      }

      if (action.type === "compose_followup") {
        setFollowUpChannel(action.channel);
        setCommandFollowUpInstruction(action.instruction);
        setFollowUpComposeSignal((signal) => signal + 1);
        setLiveMessage(`Composing ${action.channel} follow-up.`);
      }

      if (action.type === "edit_draft") {
        await editDraftByCommand(action.instruction);
      }

      if (action.type === "compose_referral") {
        setReferralDocumentType(action.documentType);
        setCommandReferralInstruction(action.instruction);
        setReferralComposeSignal((signal) => signal + 1);
        setLiveMessage(`Writing ${action.documentType} paperwork.`);
      }

      if (action.type === "compose_briefing") {
        setBriefingSignal((signal) => signal + 1);
        setLiveMessage("Briefing the clinic queue.");
      }

      if (action.type === "cleanup_intake") {
        await cleanIntakeWithAi();
      }

      if (action.type === "explain_risk") {
        setCommandRiskInstruction(action.instruction);
        setRiskExplainSignal((signal) => signal + 1);
        setLiveMessage("Explaining selected case risk.");
      }

      if (action.type === "compose_handoff") {
        setCommandHandoffInstruction(action.instruction);
        setHandoffSignal((signal) => signal + 1);
        setLiveMessage("Creating staff handoff.");
      }

      if (action.type === "plan_next_steps") {
        setCommandNextStepInstruction(action.instruction);
        setNextStepSignal((signal) => signal + 1);
        setLiveMessage("Planning next steps for the selected case.");
      }

      if (action.type === "extract_document") {
        setCommandDocumentText(action.documentText);
        setDocumentExtractSignal((signal) => signal + 1);
        setLiveMessage("Extracting attached document text.");
      }

      if (action.type === "triage_reply") {
        setCommandPatientReply(action.replyText);
        setReplyTriageSignal((signal) => signal + 1);
        setLiveMessage("Triaging patient follow-up reply.");
      }

      if (action.type === "schedule_followup") {
        setCommandFollowUpScheduleInstruction(action.instruction);
        setFollowUpScheduleSignal((signal) => signal + 1);
        setLiveMessage("Scheduling follow-up callback workflow.");
      }

      if (action.type === "answer_patient_question") {
        setCommandPatientQuestion(action.question);
        setPatientQuestionSignal((signal) => signal + 1);
        setLiveMessage("Answering patient question for clinician review.");
      }

      if (action.type === "check_approval_readiness") {
        setCommandApprovalInstruction(action.instruction);
        setApprovalCheckSignal((signal) => signal + 1);
        setLiveMessage("Checking draft approval readiness.");
      }

      if (action.type === "close_visit") {
        setCommandCloseoutInstruction(action.instruction);
        setVisitCloseoutSignal((signal) => signal + 1);
        setLiveMessage("Preparing safe visit closeout packet.");
      }

      if (action.type === "approve_case") {
        approveSelectedCase();
      }

      if (action.type === "print_handout") {
        window.print();
      }

      if (action.type === "generate_draft") {
        await generate(nextForm);
      }
    }
  }

  async function runSuggestedCommand(command: string) {
    const nextCommand = normalizeAgentCommand(command.trim());
    if (!nextCommand) {
      return null;
    }

    setError("");
    setLiveMessage(`Running suggested command: ${nextCommand}`);
    setRunningAction("command");
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: nextCommand, model: selectedModel }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(formatApiError(data, "Suggested command failed."));
      }
      const plan = data.output as CommandPlan;
      await applyCommandPlan(plan);
      const providerFallback = formatProviderFallback(data.providerError);
      const entry: CommandHistoryEntry = {
        id: crypto.randomUUID(),
        command: nextCommand,
        summary: `${plan.summary}${providerFallback}`,
        actions: plan.actions.map((action) => action.type),
        mode: data.mode ?? "live",
        createdAt: Date.now(),
      };
      recordCommand(entry);
      setRunningAction(null);
      return entry;
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Suggested command failed.";
      setError(message);
      failAction("Command failed", message);
      return {
        id: crypto.randomUUID(),
        command: nextCommand,
        summary: message,
        actions: [],
        mode: "fallback" as const,
        createdAt: Date.now(),
      };
    } finally {
      setRunningAction(null);
    }
  }

  async function runCommandAndForget(command: string) {
    await runSuggestedCommand(command);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openWorkspacePage("ai");
      }
      if (isModifier && event.key.toLowerCase() === "g") {
        event.preventDefault();
        void generate();
      }
      if (isModifier && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setPresentationMode(true);
      }
      if (event.key === "Escape") {
        setPresentationMode(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!auth.isReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#12332c] text-white">
        Loading clinic workspace...
      </main>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={auth.login} onRegister={auth.register} />;
  }

  const activeWorkspace =
    workspaceMeta.find((item) => item.id === activeWorkspacePage) ??
    workspaceMeta[0];
  const ActiveWorkspaceIcon = activeWorkspace.icon;

  return (
    <main
      className={cn(
        "min-h-screen bg-[#f7f4ee] text-slate-950",
        accessibilitySettings.calmMotion && "clinic-calm-motion",
        accessibilitySettings.highContrast && "clinic-high-contrast",
        accessibilitySettings.largeText && "clinic-large-text",
      )}
      data-clinic-language={uiLanguage}
    >
      <div className="sr-only" aria-live="polite">
        {liveMessage}
      </div>
      <a className="skip-link" href="#clinic-workspace">
        Skip to clinic workspace
      </a>
      {presentationMode ? (
        <PresentationMode
          caseCount={cases?.length ?? 0}
          clinicName={currentUser.clinicName}
          output={displayOutput}
          onClose={() => setPresentationMode(false)}
        />
      ) : null}
      {printPreviewOpen ? (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50 p-4">
          <div className="mx-auto max-w-3xl rounded-lg bg-white p-4 shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b pb-3">
              <div>
                <p className="font-black text-xl">{t("Print Preview")}</p>
                <p className="text-muted-foreground text-sm">
                  {t("Review the packet before sending it to the printer.")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPrintPreviewOpen(false)}
              >
                {t("Close")}
              </Button>
            </div>
            <div className="mt-4">
              <PatientHandout copy={copy} output={displayOutput} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPrintPreviewOpen(false)}
              >
                {t("Keep editing")}
              </Button>
              <Button type="button" onClick={() => window.print()}>
                {t("Print packet")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <AppShellSidebar
        activePage={activeWorkspacePage}
        clinicName={currentUser.clinicName}
        collapsed={activeWorkspacePage === "ai" ? appSidebarCollapsed : false}
        overlay={activeWorkspacePage === "ai"}
        onCollapsedChange={setAppSidebarCollapsed}
        onPageChange={openWorkspacePage}
        role={currentUser.role}
        onLogout={logout}
      />

      {aiDrawerOpen ? (
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setAiDrawerOpen(false)}
              >
                {t("Close")}
              </Button>
            </div>
            <div className="space-y-4 p-4">
              <Button
                className="w-full justify-center"
                type="button"
                onClick={() => {
                  setAiDrawerOpen(false);
                  openWorkspacePage("ai");
                }}
              >
                {t("Open full Copilot")}
              </Button>
              <AiRunReceipts
                form={form}
                output={displayOutput}
                runningAction={runningAction}
              />
              <ApprovalsInbox
                form={form}
                output={displayOutput}
                onCommand={runCommandAndForget}
                onPrintPreview={() => setPrintPreviewOpen(true)}
              />
              <ClinicalSafetyGates gates={safetyGates} />
              <ApprovalReadiness
                checkSignal={approvalCheckSignal}
                commandInstruction={commandApprovalInstruction}
                model={selectedModel}
                onRunCommand={runCommandAndForget}
                output={displayOutput}
              />
            </div>
          </aside>
        </div>
      ) : null}

      <div
        className={cn(
          "min-w-0",
          activeWorkspacePage === "ai" ? "lg:pl-0" : "lg:pl-72",
        )}
      >
        <header className="border-slate-200 border-b bg-gradient-to-r from-white via-[#f7fff8] to-[#fff7d6]">
          <div className="mx-auto grid max-w-[1680px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
            <div>
              <p className="font-semibold text-primary text-sm">
                {currentUser.clinicName}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="hidden size-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm sm:flex">
                  <ActiveWorkspaceIcon size={22} aria-hidden="true" />
                </span>
                <div>
                  <h1 className="font-black text-2xl tracking-normal sm:text-4xl">
                    {activeWorkspace.label}
                  </h1>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {activeWorkspace.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 lg:min-w-[30rem]">
              <Metric label={copy.cases} value={cases?.length ?? 0} />
              <Metric label={copy.ready} value={`${readyScore}%`} />
              <Metric
                label={copy.mode}
                value={mode === "idle" ? "Demo" : mode}
              />
              <Metric label={t("Provider")} value={activeProviderLabel} />
              <ProviderSwitch
                className="col-span-4"
                value={selectedModel}
                onChange={setSelectedModel}
              />
              {activeWorkspacePage !== "ai" ? (
                <Button
                  className="col-span-4 bg-[#f2c14e] text-slate-950 hover:bg-[#e2b243]"
                  type="button"
                  onClick={() => setAiDrawerOpen(true)}
                >
                  {t("Ask Copilot")}
                </Button>
              ) : null}
            </div>
          </div>
        </header>

        <section
          className="mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8"
          id="clinic-workspace"
        >
          <WorkflowProgress steps={workflowSteps} toast={toast} />

          {activeWorkspacePage === "ai" ? (
            <div className="mt-4">
              <CopilotConsole
                activeRole={activeRole}
                commandHistory={commandHistory}
                form={form}
                model={selectedModel}
                output={displayOutput}
                runningAction={runningAction}
                safetyGates={safetyGates}
                onCommand={runSuggestedCommand}
                onOpenCase={() => openWorkspacePage("case")}
              />
            </div>
          ) : null}

          {activeWorkspacePage === "case" ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 xl:grid-cols-[400px_minmax(0,1fr)_400px]">
                <div className="space-y-4">
                  <IntakePanel
                    copy={copy}
                    form={form}
                    error={error}
                    isGenerating={isGenerating}
                    isCleaningIntake={isCleaningIntake}
                    onChange={setForm}
                    onCleanIntake={() => void cleanIntakeWithAi()}
                    onGenerate={() => void generate()}
                  />
                  <LowConnectivityPanel
                    isOnline={isOnline}
                    queue={queuedDrafts}
                    onQueueDraft={queueLocalDraft}
                    onSyncDraft={syncQueuedDraft}
                  />
                </div>
                <div className="space-y-4">
                  <DoctorConsole
                    output={displayOutput}
                    onSave={saveDraftEdits}
                  />
                  <PatientHandout copy={copy} output={displayOutput} />
                  <PrintWorkflowPanel
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                  />
                </div>
                <div className="space-y-4">
                  <ClinicalSafetyGates gates={safetyGates} />
                  <ApprovalReadiness
                    checkSignal={approvalCheckSignal}
                    commandInstruction={commandApprovalInstruction}
                    model={selectedModel}
                    onRunCommand={runCommandAndForget}
                    output={displayOutput}
                  />
                  <VisitCloseout
                    closeoutSignal={visitCloseoutSignal}
                    commandInstruction={commandCloseoutInstruction}
                    model={selectedModel}
                    onRunCommand={runCommandAndForget}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                  />
                </div>
              </div>

              <details className="rounded-md border border-slate-200 bg-white shadow-sm">
                <summary className="cursor-pointer px-4 py-3 font-bold text-sm">
                  {t("Agent tool outputs")}
                </summary>
                <div className="grid gap-4 border-slate-200 border-t bg-[#fbfaf7] p-4 xl:grid-cols-2">
                  <DocumentExtractor
                    commandDocumentText={commandDocumentText}
                    documentText={form.intake}
                    extractSignal={documentExtractSignal}
                    model={selectedModel}
                    onRunCommand={runCommandAndForget}
                    onApplyAddendum={(addendum) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        intake: `${currentForm.intake}\n\nDocument addendum:\n${addendum}`,
                      }))
                    }
                  />
                  <NextStepNavigator
                    commandInstruction={commandNextStepInstruction}
                    model={selectedModel}
                    onRunCommand={runCommandAndForget}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                    planSignal={nextStepSignal}
                  />
                  <RiskExplainer
                    commandInstruction={commandRiskInstruction}
                    explainSignal={riskExplainSignal}
                    model={selectedModel}
                    output={displayOutput}
                  />
                  <StaffHandoff
                    commandInstruction={commandHandoffInstruction}
                    handoffSignal={handoffSignal}
                    model={selectedModel}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                  />
                  <CaseAssistant
                    askSignal={caseAssistantAskSignal}
                    commandQuestion={commandCaseQuestion}
                    model={selectedModel}
                    output={displayOutput}
                  />
                  <PatientLiteracyPanel
                    activeMode={literacyMode}
                    onModeChange={setLiteracyMode}
                    output={displayOutput}
                  />
                  <TeachBackCheck output={displayOutput} />
                  <PatientQuestionAnswer
                    answerSignal={patientQuestionSignal}
                    commandQuestion={commandPatientQuestion}
                    model={selectedModel}
                    onRunCommand={runCommandAndForget}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                  />
                  <FollowUpComposer
                    commandInstruction={commandFollowUpInstruction}
                    composeSignal={followUpComposeSignal}
                    model={selectedModel}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                    preferredChannel={followUpChannel}
                  />
                  <FollowUpScheduler
                    commandInstruction={commandFollowUpScheduleInstruction}
                    model={selectedModel}
                    onRunCommand={runCommandAndForget}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                    scheduleSignal={followUpScheduleSignal}
                  />
                  <ReplyTriage
                    commandReplyText={commandPatientReply}
                    model={selectedModel}
                    onRunCommand={runCommandAndForget}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                    triageSignal={replyTriageSignal}
                  />
                  <ReferralComposer
                    commandInstruction={commandReferralInstruction}
                    composeSignal={referralComposeSignal}
                    documentType={referralDocumentType}
                    model={selectedModel}
                    output={displayOutput}
                    patientName={selectedCase?.patientName ?? form.patientName}
                  />
                  <MedicineSafety
                    commandMedicines={commandMedicines}
                    medicineCheckSignal={medicineCheckSignal}
                    model={selectedModel}
                    output={displayOutput}
                  />
                </div>
              </details>
            </div>
          ) : null}

          {activeWorkspacePage === "queue" ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0">
                  <CaseBoard
                    cases={filteredCases}
                    searchQuery={caseSearch}
                    selectedCaseId={selectedCaseId}
                    severityFilter={severityFilter}
                    statusFilter={statusFilter}
                    onSearchChange={setCaseSearch}
                    onSelectCase={setSelectedCaseId}
                    onSeverityFilterChange={setSeverityFilter}
                    onStatusFilterChange={setStatusFilter}
                    onStatusChange={changeCaseStatus}
                    onApproveCase={approveSelectedCase}
                  />
                </div>
                <div className="min-w-0 space-y-4">
                  <OperationsPulse cases={cases} />
                  <ClinicBriefing
                    briefingSignal={briefingSignal}
                    cases={cases}
                    clinicName={currentUser.clinicName}
                    model={selectedModel}
                  />
                </div>
              </div>
              <details className="rounded-md border border-slate-200 bg-white shadow-sm">
                <summary className="cursor-pointer px-4 py-3 font-bold text-sm">
                  {t("Queue follow-up and trends")}
                </summary>
                <div className="grid gap-4 border-slate-200 border-t bg-[#fbfaf7] p-4 lg:grid-cols-3">
                  <LowConnectivityPanel
                    isOnline={isOnline}
                    queue={queuedDrafts}
                    onQueueDraft={queueLocalDraft}
                    onSyncDraft={syncQueuedDraft}
                  />
                  <FollowUpPanel
                    cases={cases}
                    onSelectCase={setSelectedCaseId}
                  />
                  <TrendDashboard cases={cases} />
                </div>
              </details>
            </div>
          ) : null}
        </section>
      </div>
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

const bnTextMap = new Map<string, string>(
  Object.entries({
    "Skip to clinic workspace": "ক্লিনিক ওয়ার্কস্পেসে যান",
    "Loading clinic workspace...": "ক্লিনিক ওয়ার্কস্পেস লোড হচ্ছে...",
    Demo: "ডেমো",
    live: "লাইভ",
    fallback: "ফলব্যাক",
    "Ask Copilot": "কোপাইলটকে জিজ্ঞাসা করুন",
    "Print Preview": "প্রিন্ট প্রিভিউ",
    "Review the packet before sending it to the printer.":
      "প্রিন্টারে পাঠানোর আগে প্যাকেটটি দেখুন।",
    Close: "বন্ধ করুন",
    "Keep editing": "এডিট চালিয়ে যান",
    "Print packet": "প্যাকেট প্রিন্ট করুন",
    "Page-aware help with chat, tools, approvals, and safety context.":
      "চ্যাট, টুল, অনুমোদন ও সেফটি প্রসঙ্গসহ পেজভিত্তিক সহায়তা।",
    Overview: "ওভারভিউ",
    Queue: "কিউ",
    Case: "কেস",
    Copilot: "কোপাইলট",
    Builder: "বিল্ডার",
    "Live queue": "লাইভ কিউ",
    "Case workspace": "কেস ওয়ার্কস্পেস",
    "AI command": "AI কমান্ড",
    Operations: "অপারেশনস",
    "Workflow builder": "ওয়ার্কফ্লো বিল্ডার",
    Admin: "অ্যাডমিন",
    "Waiting room, red flags, owners, and follow-ups":
      "ওয়েটিং রুম, রেড ফ্ল্যাগ, দায়িত্বপ্রাপ্ত ও ফলো-আপ",
    "One patient, intake, safety, draft, packet":
      "এক রোগী, ইনটেক, সেফটি, ড্রাফট, প্যাকেট",
    "Chat, tools, runs, approvals, memory, MCP":
      "চ্যাট, টুল, রান, অনুমোদন, মেমরি, MCP",
    "Shift brief, analytics, follow-up, offline sync":
      "শিফট ব্রিফ, অ্যানালিটিক্স, ফলো-আপ, অফলাইন সিঙ্ক",
    "Workflow canvas, protocols, simulation, templates":
      "ওয়ার্কফ্লো ক্যানভাস, প্রোটোকল, সিমুলেশন, টেমপ্লেট",
    "Settings, roles, MCP, audit, readiness": "সেটিংস, রোল, MCP, অডিট, রেডিনেস",
    "clinician workspace": "ক্লিনিশিয়ান ওয়ার্কস্পেস",
    "reception workspace": "রিসেপশন ওয়ার্কস্পেস",
    "Help and tools": "সহায়তা ও টুল",
    Help: "সহায়তা",
    "Open workspace navigation": "ওয়ার্কস্পেস ন্যাভিগেশন খুলুন",
    "Open full Copilot": "পূর্ণ কোপাইলট খুলুন",
    "Close workspace navigation": "ওয়ার্কস্পেস ন্যাভিগেশন বন্ধ করুন",
    Workspace: "ওয়ার্কস্পেস",
    "Primary mobile workspace": "প্রাথমিক মোবাইল ওয়ার্কস্পেস",
    "Shortcuts, safety rules, and tool reference live here so the workspace can stay calm.":
      "শর্টকাট, সেফটি নিয়ম ও টুল রেফারেন্স এখানে থাকে, যাতে ওয়ার্কস্পেস শান্ত থাকে।",
    Shortcuts: "শর্টকাট",
    "Safety reminders": "সেফটি রিমাইন্ডার",
    "Useful Copilot asks": "উপকারী কোপাইলট প্রশ্ন",
    "Cmd/Ctrl+K opens Copilot": "Cmd/Ctrl+K কোপাইলট খোলে",
    "Cmd/Ctrl+G generates a draft": "Cmd/Ctrl+G ড্রাফট তৈরি করে",
    "Cmd/Ctrl+P opens presentation mode": "Cmd/Ctrl+P প্রেজেন্টেশন মোড খোলে",
    "Esc closes presentation mode": "Esc প্রেজেন্টেশন মোড বন্ধ করে",
    "Vitals, allergies, escalation, return warnings, and clinician approval stay visible before print.":
      "প্রিন্টের আগে ভাইটাল, অ্যালার্জি, এসকেলেশন, রিটার্ন ওয়ার্নিং এবং ক্লিনিশিয়ান অনুমোদন দৃশ্যমান থাকে।",
    "Copilot output is draft support only.": "কোপাইলট আউটপুট শুধু ড্রাফট সহায়তা।",
    "Use Case for patient work; use Copilot for questions and agent actions.":
      "রোগীর কাজের জন্য Case ব্যবহার করুন; প্রশ্ন ও এজেন্ট অ্যাকশনের জন্য Copilot ব্যবহার করুন।",
    "What should I do next?": "এরপর কী করব?",
    "Is this safe to print?": "এটি কি প্রিন্টের জন্য নিরাপদ?",
    "Explain this in simple Bangla.": "এটি সহজ বাংলায় ব্যাখ্যা করুন।",
    "Prepare follow-up ownership.": "ফলো-আপ দায়িত্ব প্রস্তুত করুন।",
    "Open public docs and tool catalog": "পাবলিক ডকস ও টুল ক্যাটালগ খুলুন",
    Intake: "ইনটেক",
    "AI draft": "AI ড্রাফট",
    "Safety gates": "সেফটি গেট",
    "Patient packet": "রোগীর প্যাকেট",
    "Follow-up": "ফলো-আপ",
    "Patient basics needed": "রোগীর মৌলিক তথ্য প্রয়োজন",
    "Generating clinical draft": "ক্লিনিক্যাল ড্রাফট তৈরি হচ্ছে",
    "Structured draft": "স্ট্রাকচার্ড ড্রাফট",
    "Required checks clear": "প্রয়োজনীয় চেক সম্পন্ন",
    "Handout ready": "হ্যান্ডআউট প্রস্তুত",
    "Handout and teach-back": "হ্যান্ডআউট ও টিচ-ব্যাক",
    "Callback owner assigned": "কলব্যাক দায়িত্বপ্রাপ্ত নির্ধারিত",
    "Close the loop": "ফলো-আপ সম্পন্ন করুন",
    "Role View": "রোল ভিউ",
    "Focused workflows for each clinic worker":
      "প্রতিটি ক্লিনিক কর্মীর জন্য নির্দিষ্ট ওয়ার্কফ্লো",
    Reception: "রিসেপশন",
    Nurse: "নার্স",
    Doctor: "ডাক্তার",
    "Follow-up desk": "ফলো-আপ ডেস্ক",
    "Register patient": "রোগী রেজিস্টার করুন",
    "Record vitals": "ভাইটাল লিখুন",
    "Attach prescription or lab text": "প্রেসক্রিপশন বা ল্যাব টেক্সট যোগ করুন",
    "Check vitals": "ভাইটাল চেক করুন",
    "Confirm allergies": "অ্যালার্জি নিশ্চিত করুন",
    "Escalate red flags": "রেড ফ্ল্যাগ এসকেলেট করুন",
    "Review draft": "ড্রাফট রিভিউ করুন",
    "Check safety gates": "সেফটি গেট চেক করুন",
    "Approve handout": "হ্যান্ডআউট অনুমোদন করুন",
    "Schedule callback": "কলব্যাক সময় দিন",
    "Triage replies": "উত্তর ট্রায়াজ করুন",
    "Confirm teach-back": "টিচ-ব্যাক নিশ্চিত করুন",
    "Watch queue pressure": "কিউ চাপ দেখুন",
    "Review audit trail": "অডিট ট্রেইল দেখুন",
    "Assign owners": "দায়িত্বপ্রাপ্ত নির্ধারণ করুন",
    "Operations Pulse": "অপারেশনস পালস",
    "Queue pressure and staffing focus": "কিউ চাপ ও স্টাফিং ফোকাস",
    "Needs review": "রিভিউ প্রয়োজন",
    "Red flags": "রেড ফ্ল্যাগ",
    "Bangla/mixed": "বাংলা/মিশ্র",
    "Staffing focus": "স্টাফিং ফোকাস",
    "Clinic Display": "ক্লিনিক ডিসপ্লে",
    "Low-vision and busy-desk readability controls":
      "কম দৃষ্টি ও ব্যস্ত ডেস্কে পড়ার সুবিধা",
    "Large text": "বড় লেখা",
    "High contrast": "হাই কনট্রাস্ট",
    "Calm motion": "কম মুভমেন্ট",
    "Teach-Back Check": "টিচ-ব্যাক চেক",
    "Verify family understanding before discharge":
      "ছাড়ার আগে পরিবার বুঝেছে কিনা যাচাই",
    "Staff script": "স্টাফ স্ক্রিপ্ট",
    "Family should repeat": "পরিবার যা পুনরাবৃত্তি করবে",
    "Staff confirmation": "স্টাফ কনফার্মেশন",
    "Visit Journey": "ভিজিট জার্নি",
    "One glance from intake to closeout": "ইনটেক থেকে ক্লোজআউট এক নজরে",
    "Next move": "পরবর্তী পদক্ষেপ",
    Handout: "হ্যান্ডআউট",
    "Teach-back": "টিচ-ব্যাক",
    "AI clinical documentation, built for Bangla-first care.":
      "বাংলা-প্রথম সেবার জন্য AI ক্লিনিক ডকুমেন্টেশন।",
    "Clinician review required": "ক্লিনিশিয়ান রিভিউ প্রয়োজন",
    "This is draft documentation support only. It does not diagnose, prescribe, or replace clinical judgment.":
      "এটি শুধু ড্রাফট ডকুমেন্টেশন সহায়তা। এটি রোগ নির্ণয়, প্রেসক্রিপশন বা ক্লিনিক্যাল সিদ্ধান্তের বিকল্প নয়।",
    "Patient Handout": "রোগীর হ্যান্ডআউট",
    "Printable clinic slip with safety-net language":
      "সেফটি নির্দেশনাসহ প্রিন্টযোগ্য ক্লিনিক স্লিপ",
    "Agent Capacity": "এজেন্ট সক্ষমতা",
    "Safety Agent": "সেফটি এজেন্ট",
    "Documentation Agent": "ডকুমেন্টেশন এজেন্ট",
    "Operations Agent": "অপারেশনস এজেন্ট",
    Tools: "টুল",
    Critical: "গুরুত্বপূর্ণ",
    "Waiting for a draft.": "ড্রাফটের অপেক্ষায়।",
    "No agent command has run yet.": "এখনও কোনো এজেন্ট কমান্ড চালানো হয়নি।",
    "Model Selector": "মডেল সিলেক্টর",
    "Audit Log": "অডিট লগ",
    "Readiness Scorecard": "রেডিনেস স্কোরকার্ড",
    "Safety Frame": "সেফটি ফ্রেম",
    "Shortcut Help": "শর্টকাট সহায়তা",
    "Agent routing logic": "এজেন্ট রাউটিং লজিক",
    "Ridiculous tool coverage, one click away": "বিস্তৃত টুল কাভারেজ, এক ক্লিক দূরে",
    "Follow-up Scheduler": "ফলো-আপ শিডিউলার",
    "AI callback timing, reminders, and closure rules":
      "AI কলব্যাক সময়, রিমাইন্ডার ও ক্লোজার নিয়ম",
    Reminders: "রিমাইন্ডার",
    "Escalate if": "যদি হয় এসকেলেট করুন",
    "Close when": "যখন হবে বন্ধ করুন",
    "Suggested commands": "সাজেস্টেড কমান্ড",
    "AI Model": "AI মডেল",
    "Switch provider model for demos": "ডেমোর জন্য প্রোভাইডার মডেল বদলান",
    "Generation model": "জেনারেশন মডেল",
    "Ask This Case": "এই কেস জিজ্ঞাসা করুন",
    "Free-text AI help for the selected patient":
      "নির্বাচিত রোগীর জন্য ফ্রি-টেক্সট AI সহায়তা",
    "Ask about selected case": "নির্বাচিত কেস সম্পর্কে জিজ্ঞাসা করুন",
    "Agentic Workflow Studio": "এজেন্টিক ওয়ার্কফ্লো স্টুডিও",
    "Canvas builder, protocols, simulation lab, journey map, safety governor, and workflow marketplace":
      "ক্যানভাস বিল্ডার, প্রোটোকল, সিমুলেশন ল্যাব, জার্নি ম্যাপ, সেফটি গভর্নর ও ওয়ার্কফ্লো মার্কেটপ্লেস",
    "Current role": "বর্তমান রোল",
    "Blocked gates": "ব্লকড গেট",
    "Automation status": "অটোমেশন স্ট্যাটাস",
    "Ready to run": "চালানোর জন্য প্রস্তুত",
    "Safety Governor": "সেফটি গভর্নর",
    blocked: "ব্লকড",
    "ready for review": "রিভিউয়ের জন্য প্রস্তুত",
    "Follow-up due": "ফলো-আপ বাকি",
    "Safety blockers": "সেফটি ব্লকার",
    "Shift brief": "শিফট ব্রিফ",
    "Due Follow-ups": "ডিউ ফলো-আপ",
    "Close the loop after discharge": "ডিসচার্জের পর ফলো-আপ শেষ করুন",
    "Patient Literacy Modes": "রোগীর লিটারেসি মোড",
    "Simple Bangla, pictograms, audio, and teach-back confirmation":
      "সহজ বাংলা, পিক্টোগ্রাম, অডিও ও টিচ-ব্যাক কনফার্মেশন",
    "Next-Step Navigator": "নেক্সট-স্টেপ ন্যাভিগেটর",
    "AI turns the selected case into actions and commands":
      "AI নির্বাচিত কেসকে অ্যাকশন ও কমান্ডে বদলায়",
    "Do next": "এরপর করুন",
    "Accessibility notes": "অ্যাক্সেসিবিলিটি নোট",
    "Patient communication": "রোগী যোগাযোগ",
    "Follow-up Messenger": "ফলো-আপ মেসেঞ্জার",
    "AI-drafted SMS or WhatsApp callback": "AI ড্রাফট করা SMS বা WhatsApp কলব্যাক",
    "Follow-up message": "ফলো-আপ মেসেজ",
    "Print Packet": "প্রিন্ট প্যাকেট",
    "Handout, referral, medicine slip, call sheet, doctor summary":
      "হ্যান্ডআউট, রেফারাল, মেডিসিন স্লিপ, কল শিট, ডাক্তার সারাংশ",
    "Clinic flow": "ক্লিনিক ফ্লো",
    "1. Capture Bangla-English intake at reception.":
      "১. রিসেপশনে বাংলা-ইংরেজি ইনটেক নিন।",
    "2. AI finds missing questions and urgent red flags.":
      "২. AI মিসিং প্রশ্ন ও জরুরি রেড ফ্ল্যাগ খুঁজে।",
    "3. Clinician reviews and approves the note.":
      "৩. ক্লিনিশিয়ান নোট রিভিউ ও অনুমোদন করেন।",
    "4. Patient leaves with a plain Bangla handout.":
      "৪. রোগী সহজ বাংলা হ্যান্ডআউট নিয়ে যায়।",
    "5. Clinic tracks follow-up and anonymized trends.":
      "৫. ক্লিনিক ফলো-আপ ও অ্যানোনিমাইজড ট্রেন্ড ট্র্যাক করে।",
    "Seeded demo cases": "সিডেড ডেমো কেস",
    "Missing questions found": "মিসিং প্রশ্ন পাওয়া",
    "Red flags caught": "রেড ফ্ল্যাগ ধরা",
    "Current case": "বর্তমান কেস",
    "Staff Handoff": "স্টাফ হ্যান্ডঅফ",
    "AI task split for receptionist, nurse, doctor, and follow-up desk":
      "রিসেপশনিস্ট, নার্স, ডাক্তার ও ফলো-আপ ডেস্কের জন্য AI টাস্ক ভাগ",
    Receptionist: "রিসেপশনিস্ট",
    "Safety notes": "সেফটি নোট",
    "AI Run Receipts": "AI রান রিসিট",
    "Every AI action shows inputs, safety checks, review state, and audit context":
      "প্রতিটি AI অ্যাকশনে ইনপুট, সেফটি চেক, রিভিউ স্টেট ও অডিট প্রসঙ্গ দেখায়",
    Input: "ইনপুট",
    Output: "আউটপুট",
    Safety: "সেফটি",
    "MCP Explorer": "MCP এক্সপ্লোরার",
    "Inspect tools, copy payloads, and run demo-safe external-agent calls":
      "টুল দেখুন, পেলোড কপি করুন এবং ডেমো-সেফ external-agent call চালান",
    "MCP explorer response": "MCP এক্সপ্লোরার রেসপন্স",
    "Command Copilot": "কমান্ড কোপাইলট",
    "Type your way through the clinic workflow": "টাইপ করে ক্লিনিক ওয়ার্কফ্লো চালান",
    "Command Copilot input": "কমান্ড কোপাইলট ইনপুট",
    "Start here": "এখান থেকে শুরু করুন",
    "Run the guided workflow or jump straight into the work area you need.":
      "গাইডেড ওয়ার্কফ্লো চালান বা দরকারি কাজের জায়গায় সরাসরি যান।",
    "Start guided workflow": "গাইডেড ওয়ার্কফ্লো শুরু করুন",
    "Medicine Safety": "মেডিসিন সেফটি",
    "Checks clarity, allergies, and warning language":
      "ক্ল্যারিটি, অ্যালার্জি ও সতর্কতা ভাষা চেক করে",
    "Draft medicine instructions": "ড্রাফট ওষুধ নির্দেশনা",
    Issues: "ইস্যু",
    "Clarifying questions": "ক্ল্যারিফাইং প্রশ্ন",
    "Patient instructions": "রোগীর নির্দেশনা",
    "Clinic Trends": "ক্লিনিক ট্রেন্ড",
    "Anonymized demo signals": "অ্যানোনিমাইজড ডেমো সিগন্যাল",
    Readiness: "রেডিনেস",
    "Safety, access, workflow, and operating proof":
      "সেফটি, অ্যাক্সেস, ওয়ার্কফ্লো ও অপারেটিং প্রমাণ",
    "Proof points": "প্রমাণ পয়েন্ট",
    "Clinical Safety Gates": "ক্লিনিক্যাল সেফটি গেট",
    "Required checks before print, approval, and closeout":
      "প্রিন্ট, অনুমোদন ও ক্লোজআউটের আগে প্রয়োজনীয় চেক",
    "Approvals Inbox": "অ্যাপ্রুভাল ইনবক্স",
    "One place for signoff, escalation acknowledgment, return warnings, and print approval":
      "সাইনঅফ, এসকেলেশন স্বীকৃতি, রিটার্ন ওয়ার্নিং ও প্রিন্ট অনুমোদনের এক জায়গা",
    "Low-Connectivity Mode": "লো-কানেক্টিভিটি মোড",
    "Offline intake note": "অফলাইন ইনটেক নোট",
    "Queue a quick note when the clinic internet is weak...":
      "ক্লিনিকের ইন্টারনেট দুর্বল হলে দ্রুত নোট কিউ করুন...",
    "Reply Triage": "রিপ্লাই ট্রায়াজ",
    "AI reviews incoming patient replies after follow-up":
      "ফলো-আপের পর রোগীর আসা উত্তর AI রিভিউ করে",
    "Patient follow-up reply": "রোগীর ফলো-আপ উত্তর",
    Concerning: "উদ্বেগজনক",
    Reassuring: "আশ্বস্তকর",
    "Staff actions": "স্টাফ অ্যাকশন",
    "Bangla response": "বাংলা উত্তর",
    "English response": "ইংরেজি উত্তর",
    "Document Extractor": "ডকুমেন্ট এক্সট্র্যাক্টর",
    "AI parses lab, prescription, and OCR text into case facts":
      "AI ল্যাব, প্রেসক্রিপশন ও OCR টেক্সটকে কেস ফ্যাক্টে পার্স করে",
    Vitals: "ভাইটাল",
    Labs: "ল্যাব",
    Medicines: "ওষুধ",
    "Safety issues": "সেফটি ইস্যু",
    Clarify: "ক্ল্যারিফাই",
    "steps completed": "ধাপ সম্পন্ন",
    "Copilot command room": "কোপাইলট কমান্ড রুম",
    "Recent runs": "সাম্প্রতিক রান",
    "Ask Copilot...": "কোপাইলটকে জিজ্ঞাসা করুন...",
    "Clean intake note with AI": "AI দিয়ে ইনটেক নোট পরিষ্কার করুন",
    "Approval Guard": "অ্যাপ্রুভাল গার্ড",
    "AI checks blockers before clinician signoff":
      "ক্লিনিশিয়ান সাইনঅফের আগে AI ব্লকার চেক করে",
    Blockers: "ব্লকার",
    "Missing checks": "মিসিং চেক",
    "Ready signals": "রেডি সিগন্যাল",
    "Signoff checklist": "সাইনঅফ চেকলিস্ট",
    "Visit Closeout": "ভিজিট ক্লোজআউট",
    "AI final packet, follow-up closure, and audit notes":
      "AI ফাইনাল প্যাকেট, ফলো-আপ ক্লোজার ও অডিট নোট",
    "Staff closeout": "স্টাফ ক্লোজআউট",
    "Before patient leaves": "রোগী যাওয়ার আগে",
    "Follow-up closure": "ফলো-আপ ক্লোজার",
    "Audit notes": "অডিট নোট",
    "Referral Writer": "রেফারাল রাইটার",
    "Clinician-reviewable referral or visit summary":
      "ক্লিনিশিয়ান-রিভিউযোগ্য রেফারাল বা ভিজিট সারাংশ",
    "Referral or visit summary": "রেফারাল বা ভিজিট সারাংশ",
    "Patient Question": "রোগীর প্রশ্ন",
    "AI drafts safe Bangla-English answers for clinician review":
      "ক্লিনিশিয়ান রিভিউয়ের জন্য AI নিরাপদ বাংলা-ইংরেজি উত্তর ড্রাফট করে",
    "Patient or family question": "রোগী বা পরিবারের প্রশ্ন",
    "Bangla answer": "বাংলা উত্তর",
    "English answer": "ইংরেজি উত্তর",
    "Clinician review": "ক্লিনিশিয়ান রিভিউ",
    "Clinic Briefing": "ক্লিনিক ব্রিফিং",
    "AI queue summary for the next safe move":
      "পরবর্তী নিরাপদ পদক্ষেপের জন্য AI কিউ সারাংশ",
    "Priority patients": "অগ্রাধিকার রোগী",
    "Follow-up actions": "ফলো-আপ অ্যাকশন",
    Paperwork: "পেপারওয়ার্ক",
    "Next best actions": "নেক্সট বেস্ট অ্যাকশন",
    "Operational proof points the clinic can act on":
      "ক্লিনিক যেগুলোতে কাজ করতে পারে এমন অপারেশনাল প্রমাণ পয়েন্ট",
    "min saved": "মিনিট সাশ্রয়",
    "questions found": "প্রশ্ন পাওয়া",
    "Risk Rationale": "রিস্ক র‍্যাশনাল",
    "Explainable safety reasoning for review":
      "রিভিউয়ের জন্য ব্যাখ্যাযোগ্য সেফটি যুক্তি",
    "Evidence for risk": "রিস্কের পক্ষে প্রমাণ",
    "Evidence against risk": "রিস্কের বিপক্ষে প্রমাণ",
    Uncertainty: "অনিশ্চয়তা",
    "Clinician actions": "ক্লিনিশিয়ান অ্যাকশন",
    "Patient safety net": "রোগীর সেফটি নেট",
    "Live Case Board": "লাইভ কেস বোর্ড",
    "Convex realtime queue": "Convex রিয়েলটাইম কিউ",
    "Search cases": "কেস সার্চ করুন",
    "Patient, complaint, language...": "রোগী, অভিযোগ, ভাষা...",
    "Filter by status": "স্ট্যাটাস দিয়ে ফিল্টার",
    "Filter by severity": "সিভিয়ারিটি দিয়ে ফিল্টার",
    "Red Flag Lane": "রেড ফ্ল্যাগ লেন",
    "Doctor Console": "ডাক্তার কনসোল",
    "Draft support only, clinician reviewed": "শুধু ড্রাফট সহায়তা, ক্লিনিশিয়ান রিভিউড",
    "Chief complaint": "প্রধান অভিযোগ",
    "Case summary": "কেস সারাংশ",
    "Missing Questions": "মিসিং প্রশ্ন",
    "Safety Red Flags": "সেফটি রেড ফ্ল্যাগ",
    "Audit Trail": "অডিট ট্রেইল",
    "Every important AI and workflow action":
      "প্রতিটি গুরুত্বপূর্ণ AI ও ওয়ার্কফ্লো অ্যাকশন",
    "Fast Demo Keys": "ফাস্ট ডেমো কী",
    "Keyboard-first clinic operation": "কিবোর্ড-ফার্স্ট ক্লিনিক অপারেশন",
    "Copy handout": "হ্যান্ডআউট কপি",
    "Print handout": "হ্যান্ডআউট প্রিন্ট",
    Care: "যত্ন",
    Medicine: "ওষুধ",
    "Urgent return": "জরুরি ফিরে আসা",
    "Clinic workflow progress": "ক্লিনিক ওয়ার্কফ্লো প্রগ্রেস",
    "Agent Command Bar": "এজেন্ট কমান্ড বার",
    "Agent Timeline": "এজেন্ট টাইমলাইন",
    "Every AI action stays accountable": "প্রতিটি AI অ্যাকশন জবাবদিহির মধ্যে থাকে",
    "Live Tool Streaming": "লাইভ টুল স্ট্রিমিং",
    "Reading intake -> checking gates -> drafting outputs":
      "ইনটেক পড়া -> গেট চেক -> আউটপুট ড্রাফট",
    "Agent Permissions": "এজেন্ট পারমিশন",
    "Agent Inbox": "এজেন্ট ইনবক্স",
    "Human-resolution tasks": "মানুষের সমাধানযোগ্য টাস্ক",
    "Case Intelligence Graph": "কেস ইন্টেলিজেন্স গ্রাফ",
    "Intake -> safety -> tasks -> print -> follow-up":
      "ইনটেক -> সেফটি -> টাস্ক -> প্রিন্ট -> ফলো-আপ",
    "Cmd+K Command Palette": "Cmd+K কমান্ড প্যালেট",
    "Search agent tools, recent commands, role and patient actions":
      "এজেন্ট টুল, সাম্প্রতিক কমান্ড, রোল ও রোগী অ্যাকশন সার্চ করুন",
    "Search agent command palette": "এজেন্ট কমান্ড প্যালেট সার্চ করুন",
    "Search tools like allergy, triage, RAG, print...":
      "allergy, triage, RAG, print-এর মতো টুল সার্চ করুন...",
    "Named Agent Tools": "নেমড এজেন্ট টুল",
    "Explicit tool surface requested for the agent layer":
      "এজেন্ট লেয়ারের জন্য চাওয়া স্পষ্ট টুল সারফেস",
    "Simulation Mode": "সিমুলেশন মোড",
    "3-minute judging autopilot": "৩ মিনিটের জাজিং অটোপাইলট",
    "Voice Agent": "ভয়েস এজেন্ট",
    "Push-to-talk clinic commands": "পুশ-টু-টক ক্লিনিক কমান্ড",
    "Voice agent command": "ভয়েস এজেন্ট কমান্ড",
    "Load dengue case and generate draft...":
      "ডেঙ্গু কেস লোড করে ড্রাফট তৈরি করুন...",
    "Agent Memory": "এজেন্ট মেমরি",
    "Clinic preferences stored locally": "ক্লিনিক পছন্দ লোকালি সংরক্ষিত",
    "Common medicines": "সাধারণ ওষুধ",
    "Doctor style": "ডাক্তারের স্টাইল",
    "Opening hours": "খোলার সময়",
    "Follow-up templates": "ফলো-আপ টেমপ্লেট",
    "Referral hospitals": "রেফারাল হাসপাতাল",
    "Command History": "কমান্ড হিস্ট্রি",
    "Undo and replay agent actions": "এজেন্ট অ্যাকশন আনডু ও রিপ্লে করুন",
    "AI Draft vs Clinician Edits": "AI ড্রাফট বনাম ক্লিনিশিয়ান এডিট",
    "Side-by-side review surface": "পাশাপাশি রিভিউ সারফেস",
    "Review before window.print": "window.print-এর আগে রিভিউ করুন",
    "Ask the agent to run any clinic workflow...":
      "যেকোনো ক্লিনিক ওয়ার্কফ্লো চালাতে এজেন্টকে বলুন...",
  }),
);

const originalTextNodes = new WeakMap<Text, string>();

function useClinicDomLocalization(language: UiLanguage) {
  useEffect(() => {
    const root = document.querySelector("[data-clinic-language]");
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
        ["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "OPTION"].includes(
          parent.tagName,
        ) ||
        parent.isContentEditable
      ) {
        return;
      }

      const original = originalTextNodes.get(node) ?? node.nodeValue ?? "";
      if (!originalTextNodes.has(node)) {
        originalTextNodes.set(node, original);
      }
      const trimmed = original.trim();
      const translated = bnTextMap.get(trimmed);
      const nextValue =
        language === "bn" && translated
          ? original.replace(trimmed, translated)
          : original;
      if (node.nodeValue !== nextValue) {
        node.nodeValue = nextValue;
      }
    }

    function translateAttributes(element: Element) {
      for (const attribute of ["placeholder", "aria-label", "title"]) {
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
          language === "bn" ? (bnTextMap.get(original) ?? original) : original;
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
