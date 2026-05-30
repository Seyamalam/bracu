import type { CopilotOutput, MedicineSafetyOutput } from "./types";

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
] as const;

export const initialIntake = {
  patientName: "Nusrat Akter",
  age: "29",
  sex: "female",
  intake: sampleIntakes[0].text,
} as const;

export const safetyPrinciples = [
  "AI drafts notes. Doctors decide care.",
  "No diagnosis claims. No autonomous prescribing.",
  "Patient copy prioritizes plain language and return warnings.",
];

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
