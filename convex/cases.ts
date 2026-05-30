import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const statusValidator = v.union(
  v.literal("waiting"),
  v.literal("review"),
  v.literal("handout"),
  v.literal("followup"),
);

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(12);
  },
});

export const createCase = mutation({
  args: {
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
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    redFlagCount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cases", {
      ...args,
      status: "review",
      updatedAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    caseId: v.id("cases"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.caseId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});
