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
  | { type: "run_judge_demo"; scenarioLabel?: string }
  | { type: "compose_followup"; channel: "sms" | "whatsapp" }
  | { type: "edit_draft"; instruction: string };

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
