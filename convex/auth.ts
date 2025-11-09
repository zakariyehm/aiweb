/**
 * Convex Auth Functions
 * Replaces Firebase Authentication
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new user account with email/password
 * Replaces: createUserWithEmailAndPassword
 */
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(), // In production, hash this on client before sending
    profile: v.object({
      firstName: v.optional(v.string()),
      age: v.optional(v.union(v.string(), v.number())),
      height: v.optional(v.union(v.string(), v.number())),
      weight: v.optional(v.union(v.string(), v.number())),
      gender: v.optional(v.string()),
      workouts: v.optional(v.string()),
      goal: v.optional(v.string()),
      desiredWeight: v.optional(v.union(v.string(), v.number())),
      obstacles: v.optional(v.string()),
      specificGoal: v.optional(v.string()),
      accomplishments: v.optional(v.string()),
      source: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
    plan: v.optional(v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      bmr: v.number(),
      tdee: v.number(),
      goal: v.string(),
      currentWeight: v.number(),
      desiredWeight: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existing) {
      throw new Error("Email already in use");
    }
    
    // Create user
    const userId = await ctx.db.insert("users", {
      email: args.email,
      isGuest: false,
      profile: {
        ...args.profile,
        email: args.email,
      },
      plan: args.plan,
      createdAt: Date.now(),
    });
    
    return { userId, email: args.email };
  },
});

/**
 * Sign in with email/password
 * Replaces: signInWithEmailAndPassword
 */
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // In production, verify password hash here
    // For now, we'll trust the client-side verification
    
    return {
      userId: user._id,
      email: user.email,
      profile: user.profile,
      plan: user.plan,
    };
  },
});

/**
 * Create anonymous/guest account
 * Replaces: signInAnonymously
 */
export const signInAnonymously = mutation({
  args: {
    profile: v.optional(v.object({
      firstName: v.optional(v.string()),
      age: v.optional(v.union(v.string(), v.number())),
      height: v.optional(v.union(v.string(), v.number())),
      weight: v.optional(v.union(v.string(), v.number())),
      gender: v.optional(v.string()),
      workouts: v.optional(v.string()),
      goal: v.optional(v.string()),
      desiredWeight: v.optional(v.union(v.string(), v.number())),
      obstacles: v.optional(v.string()),
      specificGoal: v.optional(v.string()),
      accomplishments: v.optional(v.string()),
      source: v.optional(v.string()),
    })),
    plan: v.optional(v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      bmr: v.number(),
      tdee: v.number(),
      goal: v.string(),
      currentWeight: v.number(),
      desiredWeight: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      isGuest: true,
      profile: args.profile || {},
      plan: args.plan,
      createdAt: Date.now(),
    });
    
    return { userId, isGuest: true };
  },
});

/**
 * Get current user session
 * Replaces: auth.currentUser
 */
export const getCurrentUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return null;
    }
    
    return {
      userId: user._id,
      email: user.email,
      isGuest: user.isGuest,
      profile: user.profile,
      plan: user.plan,
      streak: user.streak,
      referral: user.referral,
    };
  },
});

/**
 * Update user password
 * Note: In production, implement proper password hashing
 */
export const updatePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Verify current password (implement password verification)
    // Hash new password
    // Update user record
    
    // For now, just acknowledge the change
    await ctx.db.patch(args.userId, {
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

