import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const languageValidator = v.union(
  v.literal("bn"),
  v.literal("en"),
  v.literal("mixed"),
);

const sexValidator = v.union(
  v.literal("female"),
  v.literal("male"),
  v.literal("other"),
  v.literal("unknown"),
);

const severityValidator = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);

const statusValidator = v.union(
  v.literal("waiting"),
  v.literal("review"),
  v.literal("handout"),
  v.literal("followup"),
);

const soapValidator = v.object({
  subjective: v.string(),
  objective: v.string(),
  assessmentSupport: v.string(),
  planSupport: v.string(),
});

const patientHandoutValidator = v.object({
  title: v.string(),
  plainSummary: v.string(),
  careSteps: v.array(v.string()),
  medicineInstructions: v.array(v.string()),
  urgentReturnWarnings: v.array(v.string()),
});

const followUpValidator = v.object({
  timing: v.string(),
  message: v.string(),
});

export default defineSchema({
  users: defineTable({
    email: v.string(),
    password: v.string(),
    clinicName: v.string(),
    role: v.union(v.literal("clinician"), v.literal("reception")),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  cases: defineTable({
    userId: v.optional(v.id("users")),
    patientName: v.string(),
    age: v.number(),
    language: languageValidator,
    sex: sexValidator,
    status: statusValidator,
    intake: v.string(),
    chiefComplaint: v.string(),
    summary: v.optional(v.string()),
    severity: severityValidator,
    redFlagCount: v.number(),
    redFlags: v.optional(v.array(v.string())),
    missingQuestions: v.optional(v.array(v.string())),
    soap: v.optional(soapValidator),
    doctorChecklist: v.optional(v.array(v.string())),
    patientHandout: v.optional(patientHandoutValidator),
    followUp: v.optional(followUpValidator),
    approvedAt: v.optional(v.number()),
    approvedBy: v.optional(v.id("users")),
    updatedAt: v.number(),
  })
    .index("by_userId_and_updatedAt", ["userId", "updatedAt"])
    .index("by_status_and_updatedAt", ["status", "updatedAt"])
    .index("by_updatedAt", ["updatedAt"]),

  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    caseId: v.optional(v.id("cases")),
    action: v.string(),
    detail: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId_and_createdAt", ["userId", "createdAt"])
    .index("by_caseId_and_createdAt", ["caseId", "createdAt"]),
});
