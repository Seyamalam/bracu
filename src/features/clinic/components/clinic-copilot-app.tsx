"use client";

import { useMutation, useQuery } from "convex/react";
import { LogOut, Stethoscope } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { AuthScreen } from "../../auth/components/auth-screen";
import { useDemoAuth } from "../../auth/use-demo-auth";
import { demoScenarios, initialIntake, judgeRunScript, uiCopy } from "../data";
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
import { ApprovalReadiness } from "./approval-readiness";
import { AuditLogViewer } from "./audit-log-viewer";
import { CaseAssistant } from "./case-assistant";
import { CaseBoard } from "./case-board";
import { ClinicBriefing } from "./clinic-briefing";
import { CommandCopilot } from "./command-copilot";
import { DoctorConsole } from "./doctor-console";
import { DocumentExtractor } from "./document-extractor";
import { FollowUpComposer } from "./follow-up-composer";
import { FollowUpPanel } from "./follow-up-panel";
import { FollowUpScheduler } from "./follow-up-scheduler";
import { ImpactSnapshot } from "./impact-snapshot";
import { IntakePanel } from "./intake-panel";
import { JudgeDemoPanel } from "./judge-demo-panel";
import { MedicineSafety } from "./medicine-safety";
import { Metric } from "./metric";
import { ModelSelector } from "./model-selector";
import { NextStepNavigator } from "./next-step-navigator";
import { PatientHandout } from "./patient-handout";
import { PatientQuestionAnswer } from "./patient-question-answer";
import { PresentationMode } from "./presentation-mode";
import { ReadinessScorecard } from "./readiness-scorecard";
import { ReferralComposer } from "./referral-composer";
import { ReplyTriage } from "./reply-triage";
import { RiskExplainer } from "./risk-explainer";
import { SafetyBanner } from "./safety-banner";
import { SafetyFrame } from "./safety-frame";
import { ShortcutHelp } from "./shortcut-help";
import { StaffHandoff } from "./staff-handoff";
import { TeachBackCheck } from "./teach-back-check";
import { TrendDashboard } from "./trend-dashboard";
import { VisitCloseout } from "./visit-closeout";

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

  useEffect(() => {
    if (!selectedCaseId && filteredCases[0]) {
      setSelectedCaseId(filteredCases[0]._id);
    }
  }, [filteredCases, selectedCaseId]);

  const currentUser = auth.user;

  async function generate(nextForm = form) {
    if (!currentUser) {
      return;
    }

    setIsGenerating(true);
    setError("");

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
    if (!currentUser) {
      return;
    }

    void updateStatus({ caseId, userId: currentUser._id, status });
    setLiveMessage(`Moved selected case to ${status}.`);
  }

  function approveSelectedCase(caseId = selectedCaseId) {
    if (!(caseId && currentUser)) {
      return;
    }
    void approveCase({ caseId, userId: currentUser._id });
    setLiveMessage("Clinician approval saved.");
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

  async function runJudgeDemo(
    scenarioLabel: string = judgeRunScript.scenarioLabel,
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
    setCommandMedicines(judgeRunScript.medicines);
    setLiveMessage("Running the judge demo: scenario loaded.");
    await generate(nextForm);
    setPresentationMode(true);
  }

  async function runFullClinicWorkflow(
    scenarioLabel: string = judgeRunScript.scenarioLabel,
  ) {
    await runJudgeDemo(scenarioLabel);
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
    setLiveMessage("Cleaning intake with AI.");
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
      setLiveMessage("Intake cleaned and structured.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Intake cleanup failed.",
      );
    } finally {
      setIsCleaningIntake(false);
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

      if (action.type === "run_judge_demo") {
        await runJudgeDemo(action.scenarioLabel);
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
    const nextCommand = command.trim();
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
        commandInputRef.current?.focus();
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
                {copy.appTitle}
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 lg:min-w-96">
            <Metric label={copy.cases} value={cases?.length ?? 0} />
            <Metric label={copy.ready} value={`${readyScore}%`} />
            <Metric label={copy.mode} value={mode === "idle" ? "Demo" : mode} />
          </div>
          <Button
            className="justify-self-start lg:justify-self-end"
            type="button"
            variant="secondary"
            onClick={auth.logout}
          >
            <LogOut size={17} aria-hidden="true" />
            {copy.signOut}
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <CommandCopilot
          ref={commandInputRef}
          history={commandHistory}
          model={selectedModel}
          onCommandComplete={recordCommand}
          onApplyPlan={applyCommandPlan}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <JudgeDemoPanel
          copy={copy}
          language={uiLanguage}
          onLanguageChange={setUiLanguage}
          onLoadScenario={setForm}
          onRunJudgeDemo={() => void runJudgeDemo()}
        />
      </section>

      <section
        className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[380px_1fr_320px] lg:px-8"
        id="clinic-workspace"
      >
        <aside className="space-y-4">
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
        </aside>

        <section className="space-y-4">
          <SafetyBanner title={copy.clinicianReview} body={copy.safetyBanner} />
          <ImpactSnapshot output={displayOutput} title={copy.impactTitle} />
          <NextStepNavigator
            commandInstruction={commandNextStepInstruction}
            model={selectedModel}
            onRunCommand={runSuggestedCommand}
            output={displayOutput}
            patientName={selectedCase?.patientName ?? form.patientName}
            planSignal={nextStepSignal}
          />
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
          <CaseAssistant
            askSignal={caseAssistantAskSignal}
            commandQuestion={commandCaseQuestion}
            model={selectedModel}
            output={displayOutput}
          />
          <DoctorConsole output={displayOutput} onSave={saveDraftEdits} />
          <PatientHandout copy={copy} output={displayOutput} />
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
        </section>

        <aside className="space-y-4">
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <AccessibilityControls
            settings={accessibilitySettings}
            onChange={setAccessibilitySettings}
          />
          <ReadinessScorecard
            auditCount={auditLogs?.length ?? 0}
            cases={cases}
            output={displayOutput}
          />
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
          <ClinicBriefing
            briefingSignal={briefingSignal}
            cases={cases}
            clinicName={currentUser.clinicName}
            model={selectedModel}
          />
          <AuditLogViewer logs={auditLogs} />
          <ShortcutHelp />
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
