import type {
  ClinicBriefingOutput,
  CopilotOutput,
  DemoScenario,
  FollowUpMessageOutput,
  IntakeCleanupOutput,
  IntakeFormState,
  MedicineSafetyOutput,
  ReferralOutput,
  RiskExplanationOutput,
  StaffHandoffOutput,
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
  "Run the full winning clinic workflow",
  "Run the winning judge demo",
  "Load dengue watch and generate a draft",
  "Switch to Bangla and open presentation mode",
  "Approve this case and move it to handout",
  "Search for Farzana and show high priority cases",
  "Use the fastest model and clear filters",
  "Mark this patient for follow-up",
  "Compose a WhatsApp follow-up for this patient",
  "Write a referral letter for this patient",
  "Create a visit summary for the family",
  "Brief me on today's clinic queue",
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
    examples: ["generate", "referral", "handoff", "print handout"],
  },
  {
    label: "Navigate",
    examples: ["brief queue", "show high priority", "clear filters"],
  },
  {
    label: "Demo",
    examples: ["full workflow", "run judge demo", "open presentation"],
  },
  {
    label: "AI setup",
    examples: ["clean intake", "check medicines", "load dengue watch"],
  },
] as const;

export const judgeRunScript = {
  command: "Run the winning judge demo",
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
    cases: "Cases",
    ready: "Ready",
    judgeMode: "Judge Demo Mode",
    judgeSubtitle: "One clear story for a 3-minute winning pitch",
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
    scripts: "Judge demo scripts",
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
    cases: "কেস",
    ready: "প্রস্তুত",
    judgeMode: "জাজ ডেমো মোড",
    judgeSubtitle: "৩ মিনিটের শক্তিশালী পিচের জন্য এক পরিষ্কার গল্প",
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
    scripts: "জাজ ডেমো স্ক্রিপ্ট",
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
  judgePitch:
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
