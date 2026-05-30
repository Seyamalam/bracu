import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

const seededCases = [
  {
    patientName: "Nusrat Akter",
    age: 29,
    language: "mixed",
    sex: "female",
    status: "review",
    intake:
      "রোগীর তিন দিন ধরে জ্বর, শুকনা কাশি, শরীর ব্যথা। রাতে জ্বর বেশি থাকে। শ্বাসকষ্ট নেই বলেছে।",
    chiefComplaint: "Fever, cough, and body ache for three days",
    summary:
      "Adult patient reports fever with cough and body ache. Clinician should verify vitals, hydration, respiratory status, allergies, and exposure history.",
    severity: "medium",
    redFlags: [
      "Escalate if breathing difficulty, chest pain, confusion, severe dehydration, or persistent high fever is present.",
    ],
    missingQuestions: [
      "What is the measured temperature?",
      "Any breathing difficulty or chest pain?",
      "Any allergy or current medicine?",
    ],
    followUpTiming: "24-48 hours",
  },
  {
    patientName: "Md. Rahman",
    age: 52,
    language: "en",
    sex: "male",
    status: "followup",
    intake:
      "Chest tightness since morning with sweating and mild shortness of breath. Has diabetes.",
    chiefComplaint: "Chest tightness with sweating",
    summary:
      "High-priority presentation. Clinician should urgently evaluate vitals, ECG availability, diabetes status, and referral pathway.",
    severity: "high",
    redFlags: [
      "Chest tightness with sweating and shortness of breath requires urgent clinician assessment.",
    ],
    missingQuestions: [
      "Exact onset time and progression?",
      "Radiation to arm, jaw, or back?",
      "Current diabetes medicine and last glucose reading?",
    ],
    followUpTiming: "Immediate",
  },
  {
    patientName: "Ayaan",
    age: 8,
    language: "bn",
    sex: "unknown",
    status: "handout",
    intake: "৮ বছরের শিশু। গতকাল থেকে পাতলা পায়খানা, দুইবার বমি, জ্বর নেই। পানি কম খাচ্ছে।",
    chiefComplaint: "Child diarrhea and vomiting",
    summary:
      "Child has diarrhea and vomiting with reduced oral intake. Clinician should assess dehydration and caregiver safety-net understanding.",
    severity: "medium",
    redFlags: [
      "Escalate if lethargy, sunken eyes, no urine, blood in stool, or persistent vomiting is present.",
    ],
    missingQuestions: [
      "How many times stool and vomiting in 24 hours?",
      "Urine frequency?",
      "Any blood in stool or severe abdominal pain?",
    ],
    followUpTiming: "24 hours",
  },
  {
    patientName: "Tanvir Hasan",
    age: 24,
    language: "bn",
    sex: "male",
    status: "review",
    intake:
      "চার দিন ধরে জ্বর, মাথা ব্যথা, চোখের পেছনে ব্যথা, শরীর ব্যথা। প্লেটলেট রিপোর্ট এনেছে।",
    chiefComplaint: "Fever with dengue-like symptoms",
    summary:
      "Local outbreak-aware fever presentation. Clinician should review warning signs, hydration, platelet report, and repeat follow-up timing.",
    severity: "medium",
    redFlags: [
      "Escalate if bleeding, severe abdominal pain, persistent vomiting, lethargy, or rapid deterioration appears.",
    ],
    missingQuestions: [
      "Any bleeding, rash, abdominal pain, or vomiting?",
      "Platelet count and hematocrit trend?",
      "Fluid intake and urine output?",
    ],
    followUpTiming: "24 hours",
  },
  {
    patientName: "Farzana Islam",
    age: 31,
    language: "en",
    sex: "female",
    status: "followup",
    intake:
      "26 weeks pregnant with fever since yesterday, burning urination, and lower abdominal discomfort.",
    chiefComplaint: "Fever and urinary symptoms in pregnancy",
    summary:
      "Pregnancy with fever and urinary symptoms needs prompt clinician review, vitals, obstetric history, and escalation criteria.",
    severity: "high",
    redFlags: [
      "Pregnancy with fever and abdominal discomfort needs prompt clinician assessment.",
    ],
    missingQuestions: [
      "Any contractions, bleeding, reduced fetal movement, or severe pain?",
      "Temperature and urine test findings?",
      "Any known medication allergy?",
    ],
    followUpTiming: "Same day",
  },
  {
    patientName: "Anwar Hossain",
    age: 61,
    language: "mixed",
    sex: "male",
    status: "review",
    intake: "ডায়াবেটিস আছে। পায়ে ছোট ক্ষত হয়েছে ৫ দিন আগে, ব্যথা ও লালচে ভাব বাড়ছে।",
    chiefComplaint: "Diabetic foot wound concern",
    summary:
      "Diabetes with worsening foot wound. Clinician should inspect wound, check glucose control, fever, spreading redness, and referral needs.",
    severity: "high",
    redFlags: [
      "Diabetes with worsening wound redness or pain may need urgent escalation.",
    ],
    missingQuestions: [
      "Any fever, pus, bad smell, numbness, or spreading redness?",
      "Last blood sugar reading?",
      "Current diabetes medicine and wound care used?",
    ],
    followUpTiming: "Same day",
  },
] as const;

export const demo = mutation({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = (args.email ?? "doctor@demo.clinic").trim().toLowerCase();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    const userId =
      existing?._id ??
      (await ctx.db.insert("users", {
        email,
        password: "demo1234",
        clinicName: "Dhanmondi Care Desk",
        role: "clinician",
        updatedAt: Date.now(),
      }));

    const caseIds: Id<"cases">[] = [];
    for (const seedCase of seededCases) {
      const now = Date.now();
      const caseId = await ctx.db.insert("cases", {
        userId,
        patientName: seedCase.patientName,
        age: seedCase.age,
        language: seedCase.language,
        sex: seedCase.sex,
        status: seedCase.status,
        intake: seedCase.intake,
        chiefComplaint: seedCase.chiefComplaint,
        summary: seedCase.summary,
        severity: seedCase.severity,
        redFlagCount: seedCase.redFlags.length,
        redFlags: [...seedCase.redFlags],
        missingQuestions: [...seedCase.missingQuestions],
        soap: {
          subjective: seedCase.intake,
          objective: "Vitals and exam findings pending clinician entry.",
          assessmentSupport:
            "Draft support note only. Clinician must confirm assessment and local context.",
          planSupport:
            "Review danger signs, document clinician-approved plan, and confirm follow-up.",
        },
        doctorChecklist: [
          "Record vitals and danger signs.",
          "Confirm allergies, pregnancy/chronic disease status, and current medicine.",
          "Explain return warnings in the patient's preferred language.",
        ],
        patientHandout: {
          title: "রোগীর জন্য নির্দেশনা",
          plainSummary: seedCase.summary,
          careSteps: [
            "ডাক্তারের নির্দেশনা মেনে চলুন।",
            "পর্যাপ্ত পানি পান করুন এবং লক্ষণ খেয়াল করুন।",
          ],
          medicineInstructions: ["শুধু ক্লিনিশিয়ান অনুমোদিত মাত্রা ও সময়ে ওষুধ খাবেন।"],
          urgentReturnWarnings: [...seedCase.redFlags],
        },
        followUp: {
          timing: seedCase.followUpTiming,
          message: `Follow up timing: ${seedCase.followUpTiming}. Return earlier if warning signs appear.`,
        },
        updatedAt: now,
      });
      caseIds.push(caseId);

      await ctx.db.insert("auditLogs", {
        userId,
        caseId,
        action: "seed.demo",
        detail: `Created seeded demo case for ${seedCase.patientName}.`,
        createdAt: now,
      });
    }

    return { userId, caseIds, email, password: "demo1234" };
  },
});
