import { v } from "convex/values";
import { mutation } from "./_generated/server";

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

    const caseId = await ctx.db.insert("cases", {
      userId,
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
      redFlagCount: 1,
      redFlags: [
        "Escalate if breathing difficulty, chest pain, confusion, severe dehydration, or persistent high fever is present.",
      ],
      missingQuestions: [
        "What is the measured temperature?",
        "Any breathing difficulty or chest pain?",
        "Any allergy or current medicine?",
      ],
      soap: {
        subjective: "Fever, dry cough, and body ache for three days.",
        objective: "Vitals and respiratory exam pending clinician review.",
        assessmentSupport:
          "Draft support note only: acute febrile respiratory illness category.",
        planSupport:
          "Clinician to confirm plan, document safety-net advice, and set follow-up.",
      },
      doctorChecklist: [
        "Record temperature, pulse, blood pressure, respiratory rate, and SpO2.",
        "Check hydration and danger signs.",
        "Review allergy and medication history.",
      ],
      patientHandout: {
        title: "রোগীর জন্য নির্দেশনা",
        plainSummary:
          "আপনার জ্বর, কাশি ও শরীর ব্যথা আছে। ডাক্তারের নির্দেশনা মেনে চলুন, পানি পান করুন এবং বিশ্রাম নিন।",
        careSteps: ["পর্যাপ্ত পানি পান করুন।", "জ্বর ও শ্বাসকষ্টের লক্ষণ খেয়াল করুন।"],
        medicineInstructions: ["ডাক্তারের লেখা মাত্রা ও সময়ে ওষুধ খাবেন।"],
        urgentReturnWarnings: [
          "শ্বাসকষ্ট, বুকব্যথা, অজ্ঞানভাব, বা জ্বর না কমলে দ্রুত ক্লিনিকে আসুন।",
        ],
      },
      followUp: {
        timing: "24-48 hours",
        message:
          "আপনার জ্বর/কাশির অবস্থা জানাতে ২৪-৪৮ ঘণ্টার মধ্যে ক্লিনিকের সাথে যোগাযোগ করুন।",
      },
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId,
      caseId,
      action: "seed.demo",
      detail: "Created demo user and starter case.",
      createdAt: Date.now(),
    });

    return { userId, caseId, email, password: "demo1234" };
  },
});
