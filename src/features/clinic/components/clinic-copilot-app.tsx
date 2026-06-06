"use client";

import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { AuthScreen } from "../../auth/components/auth-screen";
import { useDemoAuth } from "../../auth/use-demo-auth";
import {
  demoScenarios,
  guidedWorkflowScript,
  initialIntake,
  uiCopy,
} from "../data";
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
import {
  AccessibilityControls,
  type AccessibilitySettings,
} from "./accessibility-controls";
import { AgentCommandCenter } from "./agent-command-center";
import {
  type AgentMemory,
  AgentOperatingSystem,
  type AgentTimelineEvent,
  type AutopilotMode,
  defaultAgentMemory,
  initialTimeline,
  type StreamingStep,
} from "./agent-operating-system";
import {
  AppShellSidebar,
  type WorkspacePage,
  workspaceNav,
} from "./app-shell-sidebar";
import { ApprovalReadiness } from "./approval-readiness";
import { AuditLogViewer } from "./audit-log-viewer";
import { CaseAssistant } from "./case-assistant";
import { CaseBoard } from "./case-board";
import { ClinicBriefing } from "./clinic-briefing";
import {
  ClinicalSafetyGates,
  getClinicalSafetyGates,
} from "./clinical-safety-gates";
import { CommandCopilot } from "./command-copilot";
import { DoctorConsole } from "./doctor-console";
import { DocumentExtractor } from "./document-extractor";
import { FollowUpComposer } from "./follow-up-composer";
import { FollowUpPanel } from "./follow-up-panel";
import { FollowUpScheduler } from "./follow-up-scheduler";
import { GuidedWorkflowPanel } from "./guided-workflow-panel";
import { ImpactSnapshot } from "./impact-snapshot";
import { IntakePanel } from "./intake-panel";
import {
  LowConnectivityPanel,
  type QueuedDraft,
} from "./low-connectivity-panel";
import { MedicineSafety } from "./medicine-safety";
import { Metric } from "./metric";
import { ModelSelector } from "./model-selector";
import { NextStepNavigator } from "./next-step-navigator";
import { OperationsPulse } from "./operations-pulse";
import { OverviewQuickActions } from "./overview-quick-actions";
import { PatientHandout } from "./patient-handout";
import {
  type LiteracyMode,
  PatientLiteracyPanel,
} from "./patient-literacy-panel";
import { PatientQuestionAnswer } from "./patient-question-answer";
import { PresentationMode } from "./presentation-mode";
import { PrintWorkflowPanel } from "./print-workflow-panel";
import { ReadinessScorecard } from "./readiness-scorecard";
import { ReferralComposer } from "./referral-composer";
import { ReplyTriage } from "./reply-triage";
import { RiskExplainer } from "./risk-explainer";
import { type ClinicRole, RoleWorkspacePanel } from "./role-workspace-panel";
import { SafetyBanner } from "./safety-banner";
import { SafetyFrame } from "./safety-frame";
import { ShortcutHelp } from "./shortcut-help";
import { StaffHandoff } from "./staff-handoff";
import { TeachBackCheck } from "./teach-back-check";
import { TrendDashboard } from "./trend-dashboard";
import { VisitCloseout } from "./visit-closeout";
import { VisitJourney } from "./visit-journey";
import {
  type ToastNotice,
  WorkflowProgress,
  type WorkflowStep,
} from "./workflow-progress";

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

export function ClinicCopilotApp() {
  const auth = useDemoAuth();
  const commandInputRef = useRef<HTMLInputElement>(null);
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>("en");
  const [form, setForm] = useState<IntakeFormState>(initialIntake);
  const [output, setOutput] = useState<CopilotOutput | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<
    Id<"cases"> | undefined
  >();
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
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
  const [accessibilitySettings, setAccessibilitySettings] =
    useState<AccessibilitySettings>({
      calmMotion: false,
      highContrast: false,
      largeText: false,
    });
  const [activeWorkspacePage, setActiveWorkspacePage] =
    useState<WorkspacePage>("overview");
  const [activeRole, setActiveRole] = useState<ClinicRole>("doctor");
  const [autopilotMode, setAutopilotMode] = useState<AutopilotMode>("safe");
  const [agentTimeline, setAgentTimeline] =
    useState<AgentTimelineEvent[]>(initialTimeline);
  const [agentMemory, setAgentMemory] =
    useState<AgentMemory>(defaultAgentMemory);
  const [isJudgeMode, setIsJudgeMode] = useState(false);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
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
  const auditLogs = useQuery(
    api.cases.listAuditLogs,
    auth.user ? { userId: auth.user._id } : "skip",
  );
  const createCase = useMutation(api.cases.createCase);
  const updateStatus = useMutation(api.cases.updateStatus);
  const approveCase = useMutation(api.cases.approveCase);
  const updateDraft = useMutation(api.cases.updateDraft);
  const copy = uiCopy[uiLanguage];

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
  const streamingSteps: StreamingStep[] = useMemo(
    () =>
      [
        "Reading intake",
        "Checking pregnancy/child/chest pain",
        "Checking allergy and medicines",
        "Drafting handout",
        "Writing audit trail",
      ].map((label, index) => ({
        id: label.toLowerCase().replaceAll(" ", "-"),
        label,
        status: runningAction
          ? index === 0
            ? "running"
            : "idle"
          : displayOutput
            ? "complete"
            : "idle",
      })),
    [displayOutput, runningAction],
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

  useEffect(() => {
    const rawMemory = window.localStorage.getItem(
      "clinic-copilot-agent-memory",
    );
    if (rawMemory) {
      setAgentMemory(JSON.parse(rawMemory) as AgentMemory);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "clinic-copilot-agent-memory",
      JSON.stringify(agentMemory),
    );
  }, [agentMemory]);

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

  function addAgentEvent(
    agent: AgentTimelineEvent["agent"],
    detail: string,
    status: AgentTimelineEvent["status"] = "complete",
  ) {
    setAgentTimeline((events) =>
      [
        {
          id: crypto.randomUUID(),
          agent,
          detail,
          status,
          timestamp: Date.now(),
        },
        ...events,
      ].slice(0, 24),
    );
  }

  function changeAutopilotMode(nextMode: AutopilotMode) {
    setAutopilotMode(nextMode);
    addAgentEvent(
      nextMode === "emergency" ? "Safety" : "Ops",
      `Autopilot mode set to ${nextMode}.`,
      nextMode === "emergency" ? "running" : "complete",
    );
  }

  function beginAction(action: string, title: string, body: string) {
    setRunningAction(action);
    notify(title, body, "info");
    addAgentEvent("Ops", `${title}: ${body}`, "running");
  }

  function finishAction(title: string, body: string) {
    setRunningAction(null);
    notify(title, body, "success");
    addAgentEvent("Ops", `${title}: ${body}`, "complete");
  }

  function failAction(title: string, body: string) {
    setRunningAction(null);
    notify(title, body, "error");
    addAgentEvent("Safety", `${title}: ${body}`, "blocked");
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
    setActiveWorkspacePage("intake");
    notify(
      "Draft synced",
      "Queued intake is now active in the reception form.",
      "success",
    );
  }

  async function generate(nextForm = form) {
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
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "AI generation failed.");
      }

      const generated = data.output as CopilotOutput;
      setOutput(generated);
      setMode(data.mode ?? "live");
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
    addAgentEvent(
      inferAgentForCommand(entry.command),
      `Command complete: ${entry.summary}`,
      "complete",
    );
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
    await generate(nextForm);
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
      return;
    }

    setError("");
    setLiveMessage(`Running suggested command: ${nextCommand}`);
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: nextCommand, model: selectedModel }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Suggested command failed.");
      }
      const plan = data.output as CommandPlan;
      await applyCommandPlan(plan);
      recordCommand({
        id: crypto.randomUUID(),
        command: nextCommand,
        summary: plan.summary,
        actions: plan.actions.map((action) => action.type),
        mode: data.mode ?? "live",
        createdAt: Date.now(),
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Suggested command failed.",
      );
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isModifier = event.metaKey || event.ctrlKey;
      if (isModifier && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setActiveWorkspacePage("overview");
        addAgentEvent(
          "Ops",
          "Cmd+K opened the agent command palette.",
          "complete",
        );
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
    workspaceNav.find((item) => item.id === activeWorkspacePage) ??
    workspaceNav[0];
  const ActiveWorkspaceIcon = activeWorkspace.icon;

  return (
    <main
      className={cn(
        "min-h-screen bg-[#f7f4ee] text-slate-950",
        accessibilitySettings.calmMotion && "clinic-calm-motion",
        accessibilitySettings.highContrast && "clinic-high-contrast",
        accessibilitySettings.largeText && "clinic-large-text",
      )}
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
                <p className="font-black text-xl">Print Preview</p>
                <p className="text-muted-foreground text-sm">
                  Review the packet before sending it to the printer.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPrintPreviewOpen(false)}
              >
                Close
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
                Keep editing
              </Button>
              <Button type="button" onClick={() => window.print()}>
                Print packet
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <AppShellSidebar
        activePage={activeWorkspacePage}
        clinicName={currentUser.clinicName}
        onPageChange={setActiveWorkspacePage}
        role={currentUser.role}
        onLogout={auth.logout}
      />

      <div className="min-w-0 lg:pl-72">
        <header className="border-slate-200 border-b bg-white">
          <div className="mx-auto grid max-w-[1680px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
            <div>
              <p className="font-semibold text-primary text-sm">
                {currentUser.clinicName}
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span className="hidden size-11 shrink-0 items-center justify-center rounded-md bg-[#eaf6f1] text-primary sm:flex">
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
            <div className="grid grid-cols-3 gap-2 lg:min-w-96">
              <Metric label={copy.cases} value={cases?.length ?? 0} />
              <Metric label={copy.ready} value={`${readyScore}%`} />
              <Metric
                label={copy.mode}
                value={mode === "idle" ? "Demo" : mode}
              />
            </div>
          </div>
        </header>

        <section
          className="mx-auto max-w-[1680px] px-4 py-4 sm:px-6 lg:px-8"
          id="clinic-workspace"
        >
          <WorkflowProgress steps={workflowSteps} toast={toast} />

          {activeWorkspacePage === "overview" ? (
            <>
              <div className="mt-4">
                <AgentOperatingSystem
                  activeRole={activeRole}
                  autopilotMode={autopilotMode}
                  cases={cases}
                  commandHistory={commandHistory}
                  form={form}
                  isJudgeMode={isJudgeMode}
                  memory={agentMemory}
                  output={displayOutput}
                  runningAction={runningAction}
                  streamingSteps={streamingSteps}
                  timeline={agentTimeline}
                  onAutopilotModeChange={changeAutopilotMode}
                  onCommand={(command) => void runSuggestedCommand(command)}
                  onJudgeModeChange={setIsJudgeMode}
                  onMemoryChange={setAgentMemory}
                  onPrintPreview={() => setPrintPreviewOpen(true)}
                />
              </div>
              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_420px]">
                <div className="space-y-4">
                  <RoleWorkspacePanel
                    activeRole={activeRole}
                    onRoleChange={setActiveRole}
                    onOpenPage={setActiveWorkspacePage}
                  />
                  <AgentCommandCenter
                    cases={cases}
                    model={selectedModel}
                    output={displayOutput}
                    selectedPatient={
                      selectedCase?.patientName ?? form.patientName
                    }
                    onRunCommand={runSuggestedCommand}
                  />
                  <OverviewQuickActions
                    onOpenPage={setActiveWorkspacePage}
                    onStartGuidedWorkflow={() => void runGuidedWorkflow()}
                  />
                  <CommandCopilot
                    ref={commandInputRef}
                    history={commandHistory}
                    model={selectedModel}
                    onCommandComplete={recordCommand}
                    onApplyPlan={applyCommandPlan}
                  />
                  <GuidedWorkflowPanel
                    copy={copy}
                    language={uiLanguage}
                    onLanguageChange={setUiLanguage}
                    onLoadScenario={setForm}
                    onRunGuidedWorkflow={() => void runGuidedWorkflow()}
                  />
                </div>
                <div className="space-y-4">
                  <SafetyBanner
                    title={copy.clinicianReview}
                    body={copy.safetyBanner}
                  />
                  <ClinicalSafetyGates gates={safetyGates} />
                  <ImpactSnapshot
                    output={displayOutput}
                    title={copy.impactTitle}
                  />
                  <VisitJourney
                    form={form}
                    output={displayOutput}
                    status={selectedCase?.status}
                  />
                </div>
              </div>
            </>
          ) : null}

          {activeWorkspacePage === "intake" ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
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
                <DocumentExtractor
                  commandDocumentText={commandDocumentText}
                  documentText={form.intake}
                  extractSignal={documentExtractSignal}
                  model={selectedModel}
                  onRunCommand={runSuggestedCommand}
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
                  onRunCommand={runSuggestedCommand}
                  output={displayOutput}
                  patientName={selectedCase?.patientName ?? form.patientName}
                  planSignal={nextStepSignal}
                />
              </div>
            </div>
          ) : null}

          {activeWorkspacePage === "review" ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-4">
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
                <DoctorConsole output={displayOutput} onSave={saveDraftEdits} />
              </div>
              <div className="space-y-4">
                <ClinicalSafetyGates gates={safetyGates} />
                <ApprovalReadiness
                  checkSignal={approvalCheckSignal}
                  commandInstruction={commandApprovalInstruction}
                  model={selectedModel}
                  onRunCommand={runSuggestedCommand}
                  output={displayOutput}
                />
                <VisitCloseout
                  closeoutSignal={visitCloseoutSignal}
                  commandInstruction={commandCloseoutInstruction}
                  model={selectedModel}
                  onRunCommand={runSuggestedCommand}
                  output={displayOutput}
                  patientName={selectedCase?.patientName ?? form.patientName}
                />
              </div>
            </div>
          ) : null}

          {activeWorkspacePage === "patient" ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-4">
                <PatientHandout copy={copy} output={displayOutput} />
                <PrintWorkflowPanel
                  output={displayOutput}
                  patientName={selectedCase?.patientName ?? form.patientName}
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
                  onRunCommand={runSuggestedCommand}
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
              </div>
              <div className="space-y-4">
                <FollowUpScheduler
                  commandInstruction={commandFollowUpScheduleInstruction}
                  model={selectedModel}
                  onRunCommand={runSuggestedCommand}
                  output={displayOutput}
                  patientName={selectedCase?.patientName ?? form.patientName}
                  scheduleSignal={followUpScheduleSignal}
                />
                <ReplyTriage
                  commandReplyText={commandPatientReply}
                  model={selectedModel}
                  onRunCommand={runSuggestedCommand}
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
            </div>
          ) : null}

          {activeWorkspacePage === "operations" ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <RoleWorkspacePanel
                  activeRole={activeRole}
                  onRoleChange={setActiveRole}
                  onOpenPage={setActiveWorkspacePage}
                />
                <AgentCommandCenter
                  cases={cases}
                  model={selectedModel}
                  output={displayOutput}
                  selectedPatient={
                    selectedCase?.patientName ?? form.patientName
                  }
                  onRunCommand={runSuggestedCommand}
                />
                <ModelSelector
                  value={selectedModel}
                  onChange={setSelectedModel}
                />
                <AccessibilityControls
                  settings={accessibilitySettings}
                  onChange={setAccessibilitySettings}
                />
                <ReadinessScorecard
                  auditCount={auditLogs?.length ?? 0}
                  cases={cases}
                  output={displayOutput}
                />
                <OperationsPulse cases={cases} />
                <LowConnectivityPanel
                  isOnline={isOnline}
                  queue={queuedDrafts}
                  onQueueDraft={queueLocalDraft}
                  onSyncDraft={syncQueuedDraft}
                />
              </div>
              <div className="space-y-4">
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
                <FollowUpPanel cases={cases} onSelectCase={setSelectedCaseId} />
                <TrendDashboard cases={cases} />
              </div>
              <div className="space-y-4">
                <ClinicBriefing
                  briefingSignal={briefingSignal}
                  cases={cases}
                  clinicName={currentUser.clinicName}
                  model={selectedModel}
                />
                <AuditLogViewer logs={auditLogs} />
                <ShortcutHelp />
                <SafetyFrame />
              </div>
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

function normalizeAgentCommand(command: string) {
  const aliases: Record<string, string> = {
    audit_case_safety: "Check if this case is ready to approve",
    auto_triage_case: "Tell me what to do next for this case",
    compare_before_after_draft:
      "Add a clinician edit note and compare the draft with clinician review",
    detect_allergy_gap: "Check allergy status and medicine clarity",
    detect_missing_vitals: "Clean this intake and extract vitals",
    detect_pregnancy_child_chest_pain:
      "Explain why this case is risky and check pregnancy child chest pain escalation",
    generate_patient_audio_script:
      "Answer this patient question in Bangla with a read-aloud script",
    generate_pictogram_plan:
      "Simplify the patient handout for low literacy with pictogram plan",
    generate_staff_tasks:
      "Create receptionist, nurse, doctor, and follow-up desk tasks",
    prepare_referral_packet:
      "Prepare the print packet for handout, referral, medicines, and follow-up",
    predict_followup_risk: "Schedule follow-up for this patient",
    recommend_next_agent_action: "Tell me what to do next for this case",
    rewrite_for_low_literacy: "Simplify the patient handout for low literacy",
    summarize_queue_pressure: "Brief me on today's clinic queue",
    translate_bn_en: "Switch to Bangla and open presentation mode",
  };

  return aliases[command] ?? command;
}

function inferAgentForCommand(command: string): AgentTimelineEvent["agent"] {
  const normalized = command.toLowerCase();
  if (/(intake|extract|vital|document)/.test(normalized)) {
    return "Reception";
  }
  if (
    /(risk|safety|approval|allergy|medicine|triage|red flag)/.test(normalized)
  ) {
    return "Safety";
  }
  if (/(follow|whatsapp|reply|schedule|call)/.test(normalized)) {
    return "Follow-up";
  }
  if (/(brief|queue|filter|search|handoff|task)/.test(normalized)) {
    return "Ops";
  }
  return "Doctor";
}
