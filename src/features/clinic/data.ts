import type {
  ApprovalReadinessOutput,
  ClinicBriefingOutput,
  CopilotOutput,
  DemoScenario,
  DocumentExtractionOutput,
  FollowUpMessageOutput,
  FollowUpPlanOutput,
  IntakeCleanupOutput,
  IntakeFormState,
  MedicineSafetyOutput,
  NextStepOutput,
  PatientQuestionOutput,
  PatientReplyTriageOutput,
  ReferralOutput,
  RiskExplanationOutput,
  StaffHandoffOutput,
  VisitCloseoutOutput,
} from "./types";

export const sampleIntakes = [
  {
    label: "Bangla fever",
    text: "রোগীর তিন দিন ধরে জ্বর, শুকনা কাশি, শরীর ব্যথা। রাতে জ্বর বেশি থাকে। শ্বাসকষ্ট নেই বলেছে, কিন্তু খাওয়ার রুচি কম। আগে কোনো অ্যালার্জি আছে কিনা জানা নেই।",
  },
  {
    label: "Chest concern",
    text: "Patient is 52, male. Chest tightness since morning with sweating and mild shortness of breath. Has diabetes. No prescription available at reception.",
  },
  {
    label: "Child follow-up",
    text: "৮ বছরের শিশু। গতকাল থেকে পাতলা পায়খানা, দুইবার বমি, জ্বর নেই। পানি কম খাচ্ছে। মা বলছেন শিশুটি দুর্বল লাগছে।",
  },
  {
    label: "Dengue watch",
    text: "২৪ বছরের রোগী। চার দিন ধরে জ্বর, মাথা ব্যথা, চোখের পেছনে ব্যথা, শরীর ব্যথা। আজ প্লেটলেট রিপোর্ট এনেছে কিন্তু রিসেপশনে পরিষ্কার বোঝা যাচ্ছে না। র‍্যাশ নেই বলেছে।",
  },
  {
    label: "Pregnancy fever",
    text: "Patient is 26 weeks pregnant with fever since yesterday, burning urination, and lower abdominal discomfort. No bleeding. She looks anxious and has not eaten well.",
  },
  {
    label: "Diabetes follow-up",
    text: "৬১ বছরের রোগী, ডায়াবেটিস আছে। পায়ে ছোট ক্ষত হয়েছে ৫ দিন আগে, ব্যথা ও লালচে ভাব বাড়ছে। রক্তে সুগার বেশি থাকে। আগের ওষুধের নাম মনে নেই।",
  },
] as const;

export const readinessPillars = [
  {
    key: "safety",
    label: "Safety controls",
    description: "Human review, red flags, medicine clarity, and audit trail.",
  },
  {
    key: "accessibility",
    label: "Access for BD clinics",
    description:
      "Bangla-first copy, print slips, mobile layout, and low literacy.",
  },
  {
    key: "workflow",
    label: "Workflow coverage",
    description: "Intake, draft, handout, follow-up, referral, and closeout.",
  },
  {
    key: "demo",
    label: "Workflow proof",
    description: "Seed cases, impact metrics, presentation mode, and live AI.",
  },
] as const;

export const readinessSignals = [
  "Bilingual handout is generated for clinician review.",
  "Safety banner and approval guard frame the AI as draft support.",
  "Six Bangladesh-native seed cases prove the workflow beyond one happy path.",
  "Audit log records important auth, AI, and case workflow actions.",
  "Printable clinic slip and mobile layout support real clinic desks.",
] as const;

export const accessibilityControlCopy = {
  title: "Clinic Display",
  subtitle: "Low-vision and busy-desk readability controls",
  largeText: "Large text",
  highContrast: "High contrast",
  calmMotion: "Calm motion",
  proof:
    "Patient-facing slips, dense dashboards, and AI review panels stay easier to scan on phones and shared clinic desks.",
} as const;

export const teachBackCopy = {
  title: "Teach-Back Check",
  subtitle: "Verify family understanding before discharge",
  empty: "Generate a patient handout to prepare teach-back prompts.",
  progress: "confirmed",
  scriptTitle: "Staff script",
  script:
    "Before you leave, can you tell me in your own words what you will do at home, when you will come back, and what danger signs mean you should seek help urgently?",
  essentialsTitle: "Family should repeat",
  checklistTitle: "Staff confirmation",
  checklist: [
    "Caregiver can explain the main care steps.",
    "Caregiver can explain medicine instructions without guessing.",
    "Caregiver can name at least one urgent return warning.",
    "Caregiver knows the follow-up timing and who to contact.",
  ],
} as const;

export const visitJourneyCopy = {
  title: "Visit Journey",
  subtitle: "One glance from intake to closeout",
  nextMoveLabel: "Next move",
  steps: [
    {
      key: "intake",
      label: "Intake",
      waiting: "Capture patient, age, and story.",
      active: "Finish enough intake detail for AI support.",
      done: "Reception intake is ready.",
    },
    {
      key: "draft",
      label: "AI draft",
      waiting: "Generate draft documentation.",
      active: "Create the clinician-review draft.",
      done: "Draft, handout, and checklist are generated.",
    },
    {
      key: "safety",
      label: "Safety review",
      waiting: "Review missing questions and red flags.",
      active: "Clinician reviews risks and missing checks.",
      done: "Safety signals are visible for clinician review.",
    },
    {
      key: "handout",
      label: "Handout",
      waiting: "Prepare patient-facing instructions.",
      active: "Clinician approves wording before sharing.",
      done: "Patient handout is ready to share.",
    },
    {
      key: "teachBack",
      label: "Teach-back",
      waiting: "Confirm the family understood.",
      active: "Ask the family to repeat the plan.",
      done: "Understanding is confirmed by staff.",
    },
    {
      key: "followup",
      label: "Follow-up",
      waiting: "Assign callback or closeout.",
      active: "Schedule callback and closure owner.",
      done: "Follow-up workflow is queued.",
    },
  ],
} as const;

export const operationsPulseCopy = {
  title: "Operations Pulse",
  subtitle: "Queue pressure and staffing focus",
  pressure: {
    low: "Steady",
    medium: "Busy",
    high: "Strained",
  },
  metrics: {
    review: "Needs review",
    followup: "Follow-up",
    bangla: "Bangla/mixed",
    redFlags: "Red flags",
  },
  focusTitle: "Staffing focus",
  empty: "Seed or generate cases to see clinic pressure.",
} as const;

export const demoScenarios = [
  {
    label: "Fever desk",
    focus: "Fast Bangla fever triage",
    patientName: "Nusrat Akter",
    age: "29",
    sex: "female",
    intake: sampleIntakes[0].text,
  },
  {
    label: "Cardiac risk",
    focus: "High-priority red-flag escalation",
    patientName: "Md. Rahman",
    age: "52",
    sex: "male",
    intake: sampleIntakes[1].text,
  },
  {
    label: "Child hydration",
    focus: "Parent-friendly Bangla handout",
    patientName: "Ayaan",
    age: "8",
    sex: "unknown",
    intake: sampleIntakes[2].text,
  },
  {
    label: "Dengue watch",
    focus: "Local outbreak-aware missing questions",
    patientName: "Tanvir Hasan",
    age: "24",
    sex: "male",
    intake: sampleIntakes[3].text,
  },
  {
    label: "Pregnancy fever",
    focus: "Sensitive escalation with safety language",
    patientName: "Farzana Islam",
    age: "31",
    sex: "female",
    intake: sampleIntakes[4].text,
  },
  {
    label: "Diabetes wound",
    focus: "Chronic-care follow-up workflow",
    patientName: "Anwar Hossain",
    age: "61",
    sex: "male",
    intake: sampleIntakes[5].text,
  },
] satisfies DemoScenario[];

export const initialIntake = {
  patientName: demoScenarios[0].patientName,
  age: demoScenarios[0].age,
  sex: demoScenarios[0].sex,
  intake: demoScenarios[0].intake,
} satisfies IntakeFormState;

export const modelOptions = [
  {
    label: "Gemini 2.5 Flash",
    value: "gemini-2.5-flash",
    description: "Best live-demo balance",
  },
  {
    label: "Gemini 2.5 Flash Lite",
    value: "gemini-2.5-flash-lite",
    description: "Fastest low-cost mode",
  },
  {
    label: "Environment default",
    value: "env",
    description: "Use server configuration",
  },
] as const;

export const safetyPrinciples = [
  "AI drafts notes. Doctors decide care.",
  "No diagnosis claims. No autonomous prescribing.",
  "Patient copy prioritizes plain language and return warnings.",
];

export const commandExamples = [
  "Run the full clinic workflow",
  "Run the guided clinic workflow",
  "Undo last command",
  "Load dengue watch and generate a draft",
  "Switch to Bangla and open presentation mode",
  "Approve this case and move it to handout",
  "Check if this case is ready to approve",
  "Search for Farzana and show high priority cases",
  "Use the fastest model and clear filters",
  "Mark this patient for follow-up",
  "Schedule follow-up for this patient",
  "Close this visit safely",
  "Compose a WhatsApp follow-up for this patient",
  "Triage this patient reply",
  "Answer this patient question in Bangla",
  "Write a referral letter for this patient",
  "Create a visit summary for the family",
  "Brief me on today's clinic queue",
  "Tell me what to do next for this case",
  "Extract this prescription and lab report",
  "Create a nurse handoff and receptionist task list",
  "Clean this intake and extract vitals",
  "Explain why this case is risky",
  "Add a bleeding red flag and simplify the Bangla handout",
  "Create a 52 year old male chest pain intake",
  "Check medicine safety for paracetamol 500mg and antibiotic twice daily",
];

export const commandPlaybook = [
  {
    label: "Operate",
    examples: ["answer question", "triage reply", "close visit", "undo"],
  },
  {
    label: "Navigate",
    examples: ["brief queue", "show high priority", "clear filters"],
  },
  {
    label: "Demo",
    examples: ["full workflow", "guided workflow", "open presentation"],
  },
  {
    label: "AI setup",
    examples: ["extract document", "clean intake", "check medicines"],
  },
] as const;

export const guidedWorkflowScript = {
  command: "Run guided clinic workflow",
  scenarioLabel: "Pregnancy fever",
  medicines:
    "Paracetamol 500mg\nORS as needed\nUnknown antibiotic from prior visit",
  pitchBeats: [
    "Load a locally relevant red-flag case.",
    "Generate bilingual clinical documentation.",
    "Surface missing questions and safety gaps.",
    "Prepare handout, follow-up, and presentation view.",
  ],
} as const;

export const uiCopy = {
  en: {
    appTitle: "AI clinical documentation, built for Bangla-first care.",
    signOut: "Sign out",
    mode: "Mode",
    language: "Language",
    english: "EN",
    bangla: "BN",
    cases: "Cases",
    ready: "Ready",
    guidedMode: "Guided Workflow",
    guidedSubtitle: "One clear clinic story in three minutes",
    demoStep1: "Load scenario",
    demoStep2: "Generate draft",
    demoStep3: "Review safety",
    demoStep4: "Print handout",
    impactTitle: "Impact Snapshot",
    intakeTitle: "Reception Intake",
    intakeSubtitle: "Bangla, English, or mixed",
    patient: "Patient",
    age: "Age",
    sex: "Sex",
    rawIntake: "Raw intake",
    scripts: "Demo scenarios",
    voice: "Voice intake",
    listening: "Listening...",
    attach: "Attach prescription/lab text",
    generate: "Generate Clinical Draft",
    clinicianReview: "Clinician review required",
    safetyBanner:
      "This is draft documentation support only. It does not diagnose, prescribe, or replace clinical judgment.",
    handoutTitle: "Patient Handout",
    handoutSubtitle: "Printable clinic slip with safety-net language",
  },
  bn: {
    appTitle: "বাংলা-প্রথম সেবার জন্য AI ক্লিনিক ডকুমেন্টেশন।",
    signOut: "সাইন আউট",
    mode: "মোড",
    language: "ভাষা",
    english: "ইং",
    bangla: "বাংলা",
    cases: "কেস",
    ready: "প্রস্তুত",
    guidedMode: "গাইডেড ওয়ার্কফ্লো",
    guidedSubtitle: "তিন মিনিটে একটি পরিষ্কার ক্লিনিক গল্প",
    demoStep1: "সিনারিও নিন",
    demoStep2: "ড্রাফট তৈরি",
    demoStep3: "সেফটি রিভিউ",
    demoStep4: "হ্যান্ডআউট প্রিন্ট",
    impactTitle: "ইমপ্যাক্ট স্ন্যাপশট",
    intakeTitle: "রিসেপশন ইনটেক",
    intakeSubtitle: "বাংলা, ইংরেজি বা মিশ্র",
    patient: "রোগী",
    age: "বয়স",
    sex: "লিঙ্গ",
    rawIntake: "ইনটেক নোট",
    scripts: "ডেমো সিনারিও",
    voice: "ভয়েস ইনটেক",
    listening: "শোনা হচ্ছে...",
    attach: "প্রেসক্রিপশন/ল্যাব টেক্সট যোগ করুন",
    generate: "ক্লিনিক্যাল ড্রাফট তৈরি করুন",
    clinicianReview: "ক্লিনিশিয়ান রিভিউ প্রয়োজন",
    safetyBanner:
      "এটি শুধু ড্রাফট ডকুমেন্টেশন সহায়তা। এটি রোগ নির্ণয়, প্রেসক্রিপশন বা ক্লিনিক্যাল সিদ্ধান্তের বিকল্প নয়।",
    handoutTitle: "রোগীর হ্যান্ডআউট",
    handoutSubtitle: "সেফটি নির্দেশনাসহ প্রিন্টযোগ্য ক্লিনিক স্লিপ",
  },
} as const;

export const trendLabels = {
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
  followup: "Needs follow-up",
};

export const emptyWorkflowSteps = [
  ["1", "Capture intake", "Paste Bangla, English, or mixed notes."],
  ["2", "Generate draft", "AI extracts structure and safety gaps."],
  ["3", "Review handout", "Doctor approves patient instructions."],
] as const;

export const demoCopilotOutput = {
  chiefComplaint: "Fever, cough, and body ache for three days",
  summary:
    "Adult patient reports three days of fever with cough and generalized body ache. No confirmed red flag was provided in the intake. Clinician should check vitals, hydration, respiratory distress, and exposure history before making care decisions.",
  languageDetected: "mixed",
  severity: "medium",
  redFlags: [
    "Escalate if breathing difficulty, confusion, persistent high fever, chest pain, severe dehydration, or oxygen saturation concern is present.",
  ],
  missingQuestions: [
    "What is the measured temperature and highest fever?",
    "Any breathing difficulty, chest pain, or wheezing?",
    "Any pregnancy, chronic disease, allergy, or current medicine?",
    "Any dengue, influenza, or COVID exposure in the household?",
  ],
  soap: {
    subjective:
      "Patient describes fever, cough, and body ache for three days. Further history needed for red flags, medication use, allergies, and exposure.",
    objective:
      "Vitals, temperature, oxygen saturation, respiratory exam, hydration status, and danger signs should be documented by the clinician.",
    assessmentSupport:
      "Draft support note only: acute febrile respiratory illness category. Clinician must evaluate differentials and local outbreak context.",
    planSupport:
      "Document clinician-directed plan, safety-net advice, hydration/rest instructions, and follow-up timing.",
  },
  doctorChecklist: [
    "Record temperature, pulse, blood pressure, respiratory rate, and SpO2.",
    "Ask about breathing difficulty, rash, bleeding, severe headache, and dehydration.",
    "Review allergies, pregnancy status, chronic disease, and current medicine.",
    "Explain urgent return signs in the patient's preferred language.",
  ],
  patientHandout: {
    title: "রোগীর জন্য নির্দেশনা",
    plainSummary:
      "আপনার জ্বর, কাশি ও শরীর ব্যথা আছে। ডাক্তার আপনার লক্ষণ দেখে পরবর্তী সিদ্ধান্ত দেবেন। পর্যাপ্ত পানি পান করুন এবং বিশ্রাম নিন।",
    careSteps: [
      "পর্যাপ্ত পানি পান করুন।",
      "জ্বর ও শ্বাসকষ্টের লক্ষণ খেয়াল করুন।",
      "ডাক্তারের নির্দেশনা ছাড়া অ্যান্টিবায়োটিক শুরু করবেন না।",
    ],
    medicineInstructions: [
      "ডাক্তারের লেখা মাত্রা ও সময়ে ওষুধ খাবেন।",
      "অ্যালার্জি বা পার্শ্বপ্রতিক্রিয়া হলে ক্লিনিকে যোগাযোগ করুন।",
    ],
    urgentReturnWarnings: [
      "শ্বাসকষ্ট, বুকব্যথা, অজ্ঞানভাব, পানিশূন্যতা, বা জ্বর না কমলে দ্রুত ক্লিনিকে আসুন।",
    ],
  },
  followUp: {
    timing: "24-48 hours",
    message: "আপনার জ্বর/কাশির অবস্থা জানাতে ২৪-৪৮ ঘণ্টার মধ্যে ক্লিনিকের সাথে যোগাযোগ করুন।",
  },
} satisfies CopilotOutput;

export const demoMedicineSafetyOutput = {
  riskLevel: "medium",
  issues: [
    "Dosage and frequency are missing or unclear for at least one medicine.",
    "Confirm allergies, pregnancy status, kidney/liver disease, and current medications before dispensing.",
  ],
  clarifyingQuestions: [
    "What exact dose, route, and frequency did the clinician intend?",
    "Does the patient have any known drug allergy?",
    "Is the patient taking any regular medication already?",
  ],
  patientInstructions: [
    "Follow only the clinician-approved dose and timing.",
    "Stop and contact the clinic urgently if rash, breathing trouble, swelling, or severe dizziness occurs.",
  ],
} satisfies MedicineSafetyOutput;

export const demoFollowUpMessage = {
  channel: "whatsapp",
  urgency: "medium",
  messageBn:
    "আসসালামু আলাইকুম। Clinic Copilot BD থেকে ফলো-আপ: আপনার জ্বর/উপসর্গ কেমন আছে জানাবেন। শ্বাসকষ্ট, বুকে ব্যথা, অজ্ঞান ভাব, রক্তপাত, কম প্রস্রাব বা অবস্থা খারাপ হলে দেরি না করে ক্লিনিক/ইমার্জেন্সিতে যোগাযোগ করুন।",
  messageEn:
    "Clinic Copilot BD follow-up: please reply with how your symptoms are today. If you have breathing difficulty, chest pain, fainting, bleeding, very low urine, or worsening condition, contact the clinic or emergency care urgently.",
  checklist: [
    "Ask current temperature and symptom change.",
    "Confirm red-flag return signs were understood.",
    "Remind that medicine changes need clinician approval.",
  ],
} satisfies FollowUpMessageOutput;

export const demoReferralOutput = {
  documentType: "referral",
  urgency: "medium",
  title: "Clinician-reviewed referral draft",
  recipient: "Receiving clinician or emergency desk",
  reason:
    "Further clinician assessment is requested because the current intake includes symptoms that need vitals, examination, and safety review.",
  clinicalSummary:
    "Patient reports fever and systemic symptoms. This document is AI-generated draft support only and requires clinician review before use.",
  keyFindings: [
    "Symptoms and duration should be confirmed at handover.",
    "Vitals, hydration status, and danger signs need documentation.",
    "Medication history, allergy, pregnancy status, and comorbidities should be checked.",
  ],
  redFlags: [
    "Escalate urgently for breathing difficulty, chest pain, confusion, bleeding, severe dehydration, fainting, or rapidly worsening condition.",
  ],
  requestedAction:
    "Please assess, document vitals and examination findings, and decide next steps according to clinical judgment.",
  patientInstructions:
    "Bring current medicines, reports, and this note. Seek urgent care immediately if danger signs appear or symptoms worsen.",
  clinicianChecklist: [
    "Confirm identity, age, pregnancy status, allergies, and current medicines.",
    "Record vital signs and focused examination.",
    "Review red flags before sharing this document.",
  ],
} satisfies ReferralOutput;

export const demoClinicBriefing = {
  headline: "Clinic queue needs focused review before handout.",
  riskLevel: "medium",
  queueSummary:
    "Demo queue has mixed Bangla-English intakes with several cases needing clinician review, safety-net wording, and follow-up closure.",
  priorityPatients: [
    "Review high-priority or pregnancy-related cases before routine handouts.",
    "Check any case with chest pain, breathing difficulty, bleeding, or dehydration warning signs.",
  ],
  followUpActions: [
    "Queue follow-up messages for patients marked followup.",
    "Confirm timing and urgent return warnings before sending callbacks.",
  ],
  paperworkGaps: [
    "Create referral paperwork for high-risk presentations.",
    "Approve edited drafts before printing patient handouts.",
  ],
  nextBestActions: [
    "Start with the highest-priority selected case.",
    "Generate or refresh missing clinical drafts.",
    "Run medicine safety checks for unclear prescriptions.",
  ],
  operatorSummary:
    "This turns a small clinic queue into an AI-guided operating dashboard: triage, paperwork, follow-up, and safety review from one command box.",
} satisfies ClinicBriefingOutput;

export const demoIntakeCleanupOutput = {
  patientName: "Nusrat Akter",
  age: "29",
  sex: "female",
  cleanedIntake:
    "Patient reports fever, dry cough, and body ache for three days. Fever is worse at night. No shortness of breath was reported. Appetite is reduced. Allergy history is unknown and should be confirmed.",
  extractedVitals: ["No measured vitals documented."],
  extractedMedicines: ["No current medicines documented."],
  possibleRedFlags: [
    "Confirm breathing difficulty, persistent high fever, dehydration, confusion, chest pain, pregnancy status, and oxygen saturation concern.",
  ],
  missingInfo: [
    "Measured temperature and vital signs",
    "Allergy and current medicine history",
    "Pregnancy status if relevant",
    "Exposure history and danger signs",
  ],
  languageDetected: "mixed",
} satisfies IntakeCleanupOutput;

export const demoRiskExplanation = {
  riskLevel: "medium",
  plainReason:
    "The draft is medium priority because fever and systemic symptoms are present, but key danger signs and vitals have not yet been confirmed.",
  evidenceForRisk: [
    "Fever and body ache have lasted several days.",
    "Current vitals, hydration, and oxygen status are not documented.",
    "Allergy, pregnancy, chronic disease, and medicine history remain unclear.",
  ],
  evidenceAgainstRisk: [
    "No breathing difficulty was reported in the intake.",
    "No confirmed bleeding, confusion, or chest pain was documented.",
  ],
  uncertainty: [
    "Measured temperature, pulse, blood pressure, respiratory rate, and SpO2 are missing.",
    "Exposure history and current medicines are not confirmed.",
  ],
  clinicianActions: [
    "Check vitals and danger signs before giving patient instructions.",
    "Ask missing questions and document clinician assessment.",
    "Escalate if red flags are present or symptoms worsen.",
  ],
  patientSafetyNet: [
    "Seek urgent care for breathing difficulty, chest pain, confusion, bleeding, fainting, dehydration, or rapidly worsening symptoms.",
  ],
} satisfies RiskExplanationOutput;

export const demoStaffHandoff = {
  urgency: "medium",
  headline: "Coordinate vitals, safety review, and patient follow-up.",
  receptionistTasks: [
    "Confirm patient identity, age, phone number, and preferred language.",
    "Attach any prescription, lab report, or referral paper to the case.",
    "Flag the case for nurse vitals before routine waiting.",
  ],
  nurseTasks: [
    "Record temperature, pulse, blood pressure, respiratory rate, and SpO2.",
    "Ask about breathing difficulty, chest pain, bleeding, fainting, dehydration, and pregnancy status when relevant.",
    "Escalate immediately if any red flag is present or the patient looks unstable.",
  ],
  doctorTasks: [
    "Review the AI draft, missing questions, and red flags before signing.",
    "Document clinician assessment and approved plan.",
    "Approve handout wording only after checking medicine and follow-up instructions.",
  ],
  followUpDeskTasks: [
    "Send the clinician-approved follow-up message in the patient's preferred language.",
    "Schedule callback timing and record whether the patient understood urgent return signs.",
  ],
  safetyNotes: [
    "This handoff is operational support, not medical advice.",
    "Do not dispense or change medicines without clinician approval.",
  ],
  handoffScript:
    "Medium-priority fever case. Please confirm vitals and danger signs first, then doctor review before handout or follow-up message.",
} satisfies StaffHandoffOutput;

export const demoNextStepOutput = {
  priority: "medium",
  headline: "Finish safety review before handout or follow-up.",
  immediateActions: [
    "Confirm vitals, allergy history, pregnancy status if relevant, and current medicines.",
    "Review missing questions with the clinician before approving the draft.",
    "Prepare a patient-friendly handout only after clinician approval.",
  ],
  suggestedCommands: [
    "Explain why this case is risky",
    "Create a nurse handoff and receptionist task list",
    "Compose a WhatsApp follow-up for this patient",
    "Write a referral letter for this patient",
  ],
  accessibilityNotes: [
    "Use Bangla patient copy if the patient or family prefers Bangla.",
    "Read urgent return warnings aloud for low-literacy patients.",
    "Keep the next action visible for staff using keyboard navigation.",
  ],
  patientCommunication:
    "Tell the patient the clinician is reviewing safety details first, and they should report breathing difficulty, chest pain, fainting, bleeding, or worsening symptoms immediately.",
  demoNarration:
    "This turns the AI from a note writer into a clinic operator: it tells staff the safest next move and gives commands that run the workflow.",
} satisfies NextStepOutput;

export const demoDocumentExtractionOutput = {
  documentType: "mixed",
  confidence: "medium",
  extractedVitals: ["No confirmed measured vitals found in the attached text."],
  extractedLabs: [
    "Platelet count mentioned but value needs confirmation from original report.",
    "Fever-related lab report should be reviewed by the clinician.",
  ],
  extractedMedicines: [
    "Paracetamol 500mg mentioned; dose timing needs clinician confirmation.",
    "Unknown antibiotic mentioned; exact name, dose, and duration are unclear.",
  ],
  possibleSafetyIssues: [
    "Unclear antibiotic details should not be dispensed without clinician approval.",
    "Confirm allergy, pregnancy status, kidney/liver disease, and current medicines.",
  ],
  missingClarifications: [
    "Photo/report date and patient identity",
    "Exact lab values with units and reference ranges",
    "Medicine names, strengths, routes, frequency, and duration",
  ],
  intakeAddendum:
    "Attached document text suggests medicines/labs are present but key values and dose details remain unclear. Clinician should verify the original report or prescription before making decisions.",
  suggestedCommands: [
    "Check medicine safety for the extracted medicines",
    "Clean this intake and extract vitals",
    "Explain why this case is risky",
    "Create a nurse handoff and receptionist task list",
  ],
} satisfies DocumentExtractionOutput;

export const demoPatientReply =
  "জ্বর এখনো আছে, মাথা ঘুরছে, প্রস্রাব কম হচ্ছে। ওষুধ খেয়েছি কিন্তু খুব দুর্বল লাগছে।";

export const demoPatientReplyTriageOutput = {
  urgency: "high",
  replySummary:
    "Patient reports persistent fever with dizziness, low urine, and marked weakness after taking medicine.",
  detectedLanguage: "bn",
  concerningSignals: [
    "Dizziness and marked weakness may indicate worsening condition.",
    "Reduced urine can suggest dehydration or other urgent concern.",
    "Symptoms persist despite taking medicine.",
  ],
  reassuringSignals: [
    "No direct report of chest pain or breathing difficulty.",
  ],
  staffActions: [
    "Call the patient now and confirm location, consciousness, breathing, bleeding, and urine output.",
    "Escalate to the clinician before sending routine reassurance.",
    "Advise urgent in-person review or emergency care if symptoms are worsening or danger signs are present.",
  ],
  clinicianEscalation:
    "High-priority callback: persistent fever plus dizziness, low urine, and weakness. Clinician review is needed before routine follow-up closure.",
  responseBn:
    "আপনার উত্তর দেখে মনে হচ্ছে দ্রুত কথা বলা দরকার। দয়া করে এখনই ক্লিনিকে ফোন করুন/আসুন, অথবা অবস্থা খারাপ হলে জরুরি সেবায় যান। শ্বাসকষ্ট, অজ্ঞানভাব, রক্তপাত, খুব কম প্রস্রাব বা বেশি দুর্বলতা হলে দেরি করবেন না।",
  responseEn:
    "Your reply suggests we should speak with you urgently. Please call or come to the clinic now, or seek emergency care if you are worsening. Do not delay for breathing difficulty, fainting, bleeding, very low urine, or severe weakness.",
  suggestedCommands: [
    "Create a nurse handoff and receptionist task list",
    "Explain why this case is risky",
    "Write a referral letter for this patient",
    "Mark this patient for follow-up",
  ],
} satisfies PatientReplyTriageOutput;

export const demoFollowUpPlan = {
  priority: "medium",
  timing: "Call within 24 hours, sooner if red-flag symptoms are present.",
  channel: "phone",
  staffOwner: "Follow-up desk or nurse, with clinician escalation available.",
  callbackScript:
    "Confirm current fever, breathing, urine output, dizziness, bleeding, medicine use, and whether the patient understands urgent return signs.",
  reminders: [
    "Record callback attempt time and patient response.",
    "Try WhatsApp/SMS if the first phone call is missed.",
    "Ask the patient to keep prescriptions and lab reports ready for review.",
  ],
  escalationRules: [
    "Escalate immediately for breathing difficulty, chest pain, fainting, bleeding, severe weakness, very low urine, or worsening symptoms.",
    "Escalate if pregnancy, child dehydration, diabetes wound, or chest pain concerns appear in the reply.",
  ],
  closureCriteria: [
    "Clinician-approved advice was communicated.",
    "Patient or caregiver repeated urgent return signs.",
    "Follow-up status and next contact timing were documented.",
  ],
  suggestedCommands: [
    "Compose a WhatsApp follow-up for this patient",
    "Triage this patient reply",
    "Create a nurse handoff and receptionist task list",
    "Mark this patient for follow-up",
  ],
} satisfies FollowUpPlanOutput;

export const demoPatientQuestion =
  "ডাক্তার দেখানোর আগে আমি কি অ্যান্টিবায়োটিক খেতে পারি?";

export const demoPatientQuestionAnswer = {
  urgency: "medium",
  detectedLanguage: "bn",
  plainAnswerBn:
    "ডাক্তারের অনুমতি ছাড়া অ্যান্টিবায়োটিক শুরু করবেন না। ভুল অ্যান্টিবায়োটিক বা ভুল মাত্রা ক্ষতি করতে পারে। আপনার বর্তমান লক্ষণ, অ্যালার্জি, গর্ভাবস্থা/অন্যান্য রোগ, এবং আগের ওষুধ দেখে ডাক্তার সিদ্ধান্ত দেবেন।",
  plainAnswerEn:
    "Do not start an antibiotic without clinician approval. The wrong antibiotic or dose can be harmful. The clinician should review your symptoms, allergies, pregnancy or other conditions, and current medicines first.",
  teachBackQuestion:
    "Can you tell me which danger signs mean you should call or come in urgently?",
  redFlagReminder: [
    "Seek urgent care for breathing difficulty, chest pain, fainting, bleeding, very low urine, severe weakness, or worsening symptoms.",
    "Bring any prescription, lab report, and current medicines to the clinic.",
  ],
  clinicianReviewNeeded: [
    "Medicine changes or antibiotics need clinician approval.",
    "The answer should be reviewed if the patient is pregnant, a child, elderly, diabetic, or has severe symptoms.",
  ],
  suggestedCommands: [
    "Check medicine safety for the extracted medicines",
    "Explain why this case is risky",
    "Create a nurse handoff and receptionist task list",
    "Schedule follow-up for this patient",
  ],
} satisfies PatientQuestionOutput;

export const demoApprovalReadiness = {
  readiness: "needs_review",
  riskLevel: "medium",
  headline: "Draft is close, but clinician checks are still needed.",
  blockers: [
    "Vitals and danger signs are not fully documented.",
    "Medication and allergy history should be confirmed before handout approval.",
  ],
  missingChecks: [
    "Temperature, pulse, blood pressure, respiratory rate, and SpO2",
    "Pregnancy status when relevant",
    "Current medicines, allergies, and prior antibiotic use",
  ],
  readySignals: [
    "Patient-facing safety-net language is present.",
    "Follow-up timing is included.",
    "Red flags and missing questions are visible for review.",
  ],
  clinicianSignoffChecklist: [
    "Review and edit SOAP note.",
    "Confirm red flags and missing questions with patient or caregiver.",
    "Approve handout and follow-up wording only after clinical assessment.",
  ],
  suggestedCommands: [
    "Explain why this case is risky",
    "Clean this intake and extract vitals",
    "Check medicine safety for the extracted medicines",
    "Create a nurse handoff and receptionist task list",
  ],
} satisfies ApprovalReadinessOutput;

export const demoVisitCloseout = {
  readiness: "needs_review",
  priority: "medium",
  headline: "Closeout packet is prepared, but clinician review remains open.",
  staffCloseoutSteps: [
    "Confirm vitals, allergies, current medicines, and danger signs are documented.",
    "Ask the clinician to review the draft, handout wording, and follow-up timing before final handoff.",
    "Move the case to follow-up if callback timing or safety-net confirmation is still pending.",
  ],
  patientBeforeLeaving: [
    "Explain the approved instructions in the patient's preferred language.",
    "Ask the patient or caregiver to repeat urgent return signs back to staff.",
    "Make sure prescriptions, lab papers, and clinic contact details are returned to the patient.",
  ],
  followUpClosure: [
    "Schedule a 24-48 hour callback if symptoms continue or red flags are uncertain.",
    "Record the responsible staff owner and the next contact channel.",
    "Escalate immediately if the patient reports breathing difficulty, chest pain, fainting, bleeding, very low urine, severe weakness, or worsening symptoms.",
  ],
  auditNotes: [
    "AI generated operational closeout support only; clinician signoff is required.",
    "Document whether the patient received Bangla or English instructions.",
    "Record unresolved blockers before marking the visit complete.",
  ],
  printPacket: [
    "Clinician-reviewed visit summary",
    "Patient handout with urgent return warnings",
    "Follow-up callback plan",
    "Referral note if escalation is needed",
  ],
  suggestedCommands: [
    "Check if this case is ready to approve",
    "Schedule follow-up for this patient",
    "Create a visit summary for the family",
    "Print the patient handout",
  ],
} satisfies VisitCloseoutOutput;
