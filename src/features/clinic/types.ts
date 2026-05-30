export type Sex = "female" | "male" | "other" | "unknown";
export type Language = "bn" | "en" | "mixed";
export type UiLanguage = "en" | "bn";
export type Severity = "low" | "medium" | "high";
export type CaseStatus = "waiting" | "review" | "handout" | "followup";

export type CopilotOutput = {
  chiefComplaint: string;
  summary: string;
  languageDetected: Language;
  severity: Severity;
  redFlags: string[];
  missingQuestions: string[];
  soap: {
    subjective: string;
    objective: string;
    assessmentSupport: string;
    planSupport: string;
  };
  doctorChecklist: string[];
  patientHandout: {
    title: string;
    plainSummary: string;
    careSteps: string[];
    medicineInstructions: string[];
    urgentReturnWarnings: string[];
  };
  followUp: {
    timing: string;
    message: string;
  };
};

export type IntakeFormState = {
  patientName: string;
  age: string;
  sex: Sex;
  intake: string;
};

export type DemoScenario = IntakeFormState & {
  label: string;
  focus: string;
};

export type MedicineSafetyOutput = {
  riskLevel: Severity;
  issues: string[];
  clarifyingQuestions: string[];
  patientInstructions: string[];
};

export type FollowUpMessageOutput = {
  channel: "sms" | "whatsapp";
  messageBn: string;
  messageEn: string;
  checklist: string[];
  urgency: Severity;
};

export type ReferralOutput = {
  documentType: "referral" | "visit_summary";
  urgency: Severity;
  title: string;
  recipient: string;
  reason: string;
  clinicalSummary: string;
  keyFindings: string[];
  redFlags: string[];
  requestedAction: string;
  patientInstructions: string;
  clinicianChecklist: string[];
};

export type ClinicBriefingOutput = {
  headline: string;
  riskLevel: Severity;
  queueSummary: string;
  priorityPatients: string[];
  followUpActions: string[];
  paperworkGaps: string[];
  nextBestActions: string[];
  operatorSummary: string;
};

export type IntakeCleanupOutput = {
  patientName?: string;
  age?: string;
  sex?: Sex;
  cleanedIntake: string;
  extractedVitals: string[];
  extractedMedicines: string[];
  possibleRedFlags: string[];
  missingInfo: string[];
  languageDetected: Language;
};

export type RiskExplanationOutput = {
  riskLevel: Severity;
  plainReason: string;
  evidenceForRisk: string[];
  evidenceAgainstRisk: string[];
  uncertainty: string[];
  clinicianActions: string[];
  patientSafetyNet: string[];
};

export type StaffHandoffOutput = {
  urgency: Severity;
  headline: string;
  receptionistTasks: string[];
  nurseTasks: string[];
  doctorTasks: string[];
  followUpDeskTasks: string[];
  safetyNotes: string[];
  handoffScript: string;
};

export type NextStepOutput = {
  priority: Severity;
  headline: string;
  immediateActions: string[];
  suggestedCommands: string[];
  accessibilityNotes: string[];
  patientCommunication: string;
  demoNarration: string;
};

export type DocumentExtractionOutput = {
  documentType: "prescription" | "lab_report" | "mixed" | "unknown";
  confidence: Severity;
  extractedVitals: string[];
  extractedLabs: string[];
  extractedMedicines: string[];
  possibleSafetyIssues: string[];
  missingClarifications: string[];
  intakeAddendum: string;
  suggestedCommands: string[];
};

export type PatientReplyTriageOutput = {
  urgency: Severity;
  replySummary: string;
  detectedLanguage: Language;
  concerningSignals: string[];
  reassuringSignals: string[];
  staffActions: string[];
  clinicianEscalation: string;
  responseBn: string;
  responseEn: string;
  suggestedCommands: string[];
};

export type FollowUpPlanOutput = {
  priority: Severity;
  timing: string;
  channel: "sms" | "whatsapp" | "phone";
  staffOwner: string;
  callbackScript: string;
  reminders: string[];
  escalationRules: string[];
  closureCriteria: string[];
  suggestedCommands: string[];
};

export type PatientQuestionOutput = {
  urgency: Severity;
  detectedLanguage: Language;
  plainAnswerBn: string;
  plainAnswerEn: string;
  teachBackQuestion: string;
  redFlagReminder: string[];
  clinicianReviewNeeded: string[];
  suggestedCommands: string[];
};

export type ApprovalReadinessOutput = {
  readiness: "ready" | "needs_review" | "blocked";
  riskLevel: Severity;
  headline: string;
  blockers: string[];
  missingChecks: string[];
  readySignals: string[];
  clinicianSignoffChecklist: string[];
  suggestedCommands: string[];
};

export type VisitCloseoutOutput = {
  readiness: "ready" | "needs_review" | "blocked";
  priority: Severity;
  headline: string;
  staffCloseoutSteps: string[];
  patientBeforeLeaving: string[];
  followUpClosure: string[];
  auditNotes: string[];
  printPacket: string[];
  suggestedCommands: string[];
};

export type CommandAction =
  | {
      type: "fill_intake";
      patientName?: string;
      age?: string;
      sex?: Sex;
      intake?: string;
    }
  | { type: "load_scenario"; scenarioLabel: string }
  | { type: "generate_draft" }
  | { type: "check_medicine"; medicines?: string }
  | { type: "set_status"; status: "handout" | "followup" }
  | { type: "approve_case" }
  | { type: "switch_language"; language: UiLanguage }
  | { type: "print_handout" }
  | { type: "presentation_mode"; enabled: boolean }
  | { type: "search_cases"; query: string }
  | {
      type: "filter_cases";
      status?: CaseStatus | "all";
      severity?: Severity | "all";
    }
  | { type: "select_case"; patientName: string }
  | { type: "set_model"; model: string }
  | { type: "reset_workspace"; scope: "filters" | "intake" | "all" }
  | { type: "run_guided_demo"; scenarioLabel?: string }
  | { type: "run_full_workflow"; scenarioLabel?: string }
  | { type: "ask_case_assistant"; question?: string }
  | {
      type: "compose_followup";
      channel: "sms" | "whatsapp";
      instruction?: string;
    }
  | { type: "edit_draft"; instruction: string }
  | {
      type: "compose_referral";
      documentType: "referral" | "visit_summary";
      instruction?: string;
    }
  | { type: "compose_briefing" }
  | { type: "cleanup_intake" }
  | { type: "explain_risk"; instruction?: string }
  | { type: "compose_handoff"; instruction?: string }
  | { type: "plan_next_steps"; instruction?: string }
  | { type: "extract_document"; documentText?: string }
  | { type: "triage_reply"; replyText?: string }
  | { type: "schedule_followup"; instruction?: string }
  | { type: "answer_patient_question"; question?: string }
  | { type: "check_approval_readiness"; instruction?: string }
  | { type: "close_visit"; instruction?: string }
  | { type: "undo_last_command" };

export type CommandPlan = {
  summary: string;
  actions: CommandAction[];
};

export type CommandHistoryEntry = {
  id: string;
  command: string;
  summary: string;
  actions: string[];
  mode: "live" | "demo" | "fallback";
  createdAt: number;
};
