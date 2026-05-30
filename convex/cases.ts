import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("waiting"),
  v.literal("review"),
  v.literal("handout"),
  v.literal("followup"),
);

export const listRecent = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    if (args.userId) {
      return await ctx.db
        .query("cases")
        .withIndex("by_userId_and_updatedAt", (q) =>
          q.eq("userId", args.userId),
        )
        .order("desc")
        .take(24);
    }

    return await ctx.db
      .query("cases")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(12);
  },
});

export const createCase = mutation({
  args: {
    userId: v.id("users"),
    patientName: v.string(),
    age: v.number(),
    language: v.union(v.literal("bn"), v.literal("en"), v.literal("mixed")),
    sex: v.union(
      v.literal("female"),
      v.literal("male"),
      v.literal("other"),
      v.literal("unknown"),
    ),
    intake: v.string(),
    chiefComplaint: v.string(),
    summary: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    redFlagCount: v.number(),
    redFlags: v.array(v.string()),
    missingQuestions: v.array(v.string()),
    soap: v.object({
      subjective: v.string(),
      objective: v.string(),
      assessmentSupport: v.string(),
      planSupport: v.string(),
    }),
    doctorChecklist: v.array(v.string()),
    patientHandout: v.object({
      title: v.string(),
      plainSummary: v.string(),
      careSteps: v.array(v.string()),
      medicineInstructions: v.array(v.string()),
      urgentReturnWarnings: v.array(v.string()),
    }),
    followUp: v.object({
      timing: v.string(),
      message: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User does not exist.");
    }

    const caseId = await ctx.db.insert("cases", {
      ...args,
      status: "review",
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      caseId,
      action: "case.create",
      detail: `Generated clinical draft for ${args.patientName}.`,
      createdAt: Date.now(),
    });

    return caseId;
  },
});

export const updateStatus = mutation({
  args: {
    caseId: v.id("cases"),
    userId: v.id("users"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.userId !== args.userId) {
      throw new Error("Case not found for this user.");
    }

    await ctx.db.patch(args.caseId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      caseId: args.caseId,
      action: "case.status",
      detail: `Moved case to ${args.status}.`,
      createdAt: Date.now(),
    });

    return null;
  },
});

export const approveCase = mutation({
  args: {
    caseId: v.id("cases"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.userId !== args.userId) {
      throw new Error("Case not found for this user.");
    }

    const now = Date.now();
    await ctx.db.patch(args.caseId, {
      approvedAt: now,
      approvedBy: args.userId,
      status: "handout",
      updatedAt: now,
    });

    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      caseId: args.caseId,
      action: "case.approve",
      detail: "Clinician approved the AI draft for handout use.",
      createdAt: now,
    });

    return null;
  },
});

export const updateDraft = mutation({
  args: {
    caseId: v.id("cases"),
    userId: v.id("users"),
    chiefComplaint: v.string(),
    summary: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    redFlags: v.array(v.string()),
    missingQuestions: v.array(v.string()),
    soap: v.object({
      subjective: v.string(),
      objective: v.string(),
      assessmentSupport: v.string(),
      planSupport: v.string(),
    }),
    doctorChecklist: v.array(v.string()),
    patientHandout: v.object({
      title: v.string(),
      plainSummary: v.string(),
      careSteps: v.array(v.string()),
      medicineInstructions: v.array(v.string()),
      urgentReturnWarnings: v.array(v.string()),
    }),
    followUp: v.object({
      timing: v.string(),
      message: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const caseDoc = await ctx.db.get(args.caseId);
    if (!caseDoc || caseDoc.userId !== args.userId) {
      throw new Error("Case not found for this user.");
    }

    await ctx.db.patch(args.caseId, {
      chiefComplaint: args.chiefComplaint,
      summary: args.summary,
      severity: args.severity,
      redFlagCount: args.redFlags.length,
      redFlags: args.redFlags,
      missingQuestions: args.missingQuestions,
      soap: args.soap,
      doctorChecklist: args.doctorChecklist,
      patientHandout: args.patientHandout,
      followUp: args.followUp,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: args.userId,
      caseId: args.caseId,
      action: "case.edit",
      detail: "Clinician edited and saved the AI draft.",
      createdAt: Date.now(),
    });

    return null;
  },
});

export const listAuditLogs = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("auditLogs")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});
