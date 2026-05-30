export type Sex = "female" | "male" | "other" | "unknown";
export type Language = "bn" | "en" | "mixed";
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
