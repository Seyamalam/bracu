import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cases: defineTable({
    patientName: v.string(),
    age: v.number(),
    language: v.union(v.literal("bn"), v.literal("en"), v.literal("mixed")),
    sex: v.union(
      v.literal("female"),
      v.literal("male"),
      v.literal("other"),
      v.literal("unknown"),
    ),
    status: v.union(
      v.literal("waiting"),
      v.literal("review"),
      v.literal("handout"),
      v.literal("followup"),
    ),
    intake: v.string(),
    chiefComplaint: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    redFlagCount: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status_and_updatedAt", ["status", "updatedAt"])
    .index("by_updatedAt", ["updatedAt"]),
});
