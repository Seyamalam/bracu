import { v } from "convex/values";
import { mutation } from "./_generated/server";

const roleValidator = v.union(v.literal("clinician"), v.literal("reception"));

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function publicUser(user: {
  _id: string;
  email: string;
  clinicName: string;
  role: "clinician" | "reception";
}) {
  return {
    _id: user._id,
    email: user.email,
    clinicName: user.clinicName,
    role: user.role,
  };
}

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    clinicName: v.string(),
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);

    if (!email.includes("@") || args.password.length < 6) {
      throw new Error("Use a valid email and at least 6 password characters.");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("An account already exists for this email.");
    }

    const userId = await ctx.db.insert("users", {
      email,
      password: args.password,
      clinicName: args.clinicName.trim() || "Demo Clinic",
      role: args.role,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId,
      action: "auth.register",
      detail: "Created temporary email/password account.",
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Failed to create account.");
    }
    return publicUser(user);
  },
});

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user || user.password !== args.password) {
      throw new Error("Email or password is incorrect.");
    }

    await ctx.db.patch(user._id, { updatedAt: Date.now() });
    await ctx.db.insert("auditLogs", {
      userId: user._id,
      action: "auth.login",
      detail: "Temporary password login.",
      createdAt: Date.now(),
    });

    return publicUser(user);
  },
});
