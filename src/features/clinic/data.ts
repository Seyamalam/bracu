import type {
  CopilotOutput,
  DemoScenario,
  IntakeFormState,
  MedicineSafetyOutput,
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
  "Load dengue watch and generate a draft",
  "Switch to Bangla and open presentation mode",
  "Approve this case and move it to handout",
  "Mark this patient for follow-up",
  "Create a 52 year old male chest pain intake",
  "Check medicine safety for paracetamol 500mg and antibiotic twice daily",
];

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
