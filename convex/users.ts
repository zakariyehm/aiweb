/**
 * User Management Functions
 * Replaces Firebase Firestore users operations
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user by ID
 * Replaces: getDoc(doc(db, 'users', uid))
 */
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Get user by email
 */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

/**
 * Update user profile
 * Replaces: setDoc(doc(db, 'users', uid), { profile: {...} }, { merge: true })
 */
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    profile: v.object({
      firstName: v.optional(v.string()),
      name: v.optional(v.string()),
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
      phone: v.optional(v.string()),
      phoneCountryCode: v.optional(v.string()),
      phoneNational: v.optional(v.string()),
      username: v.optional(v.string()),
      usernameLower: v.optional(v.string()),
      usernameManualChanged: v.optional(v.boolean()),
      usernameManualChangedAt: v.optional(v.number()),
      lastUsernameChangeAt: v.optional(v.number()),
      email: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(args.userId, {
      profile: {
        ...user.profile,
        ...args.profile,
      },
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Update user plan (calories, macros)
 * Replaces: setDoc(doc(db, 'users', uid), { plan: {...} }, { merge: true })
 */
export const updatePlan = mutation({
  args: {
    userId: v.id("users"),
    plan: v.object({
      calories: v.number(),
      protein: v.number(),
      carbs: v.number(),
      fat: v.number(),
      bmr: v.optional(v.number()),
      tdee: v.optional(v.number()),
      goal: v.optional(v.string()),
      currentWeight: v.optional(v.number()),
      desiredWeight: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Ensure all required fields are present
    const existingPlan = user.plan || {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70,
      bmr: 1600,
      tdee: 2000,
      goal: 'Maintain',
      currentWeight: 70,
      desiredWeight: 70,
    };
    
    await ctx.db.patch(args.userId, {
      plan: {
        calories: args.plan.calories,
        protein: args.plan.protein,
        carbs: args.plan.carbs,
        fat: args.plan.fat,
        bmr: args.plan.bmr ?? existingPlan.bmr,
        tdee: args.plan.tdee ?? existingPlan.tdee,
        goal: args.plan.goal ?? existingPlan.goal,
        currentWeight: args.plan.currentWeight ?? existingPlan.currentWeight,
        desiredWeight: args.plan.desiredWeight ?? existingPlan.desiredWeight,
      },
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Update single profile field
 * Used by edit field modal
 */
export const updateField = mutation({
  args: {
    userId: v.id("users"),
    field: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    await ctx.db.patch(args.userId, {
      profile: {
        ...user.profile,
        [args.field]: args.value,
      },
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Update username with cooldown logic
 * Replaces: Firebase username update with batch write
 */
export const updateUsername = mutation({
  args: {
    userId: v.id("users"),
    newUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const lower = args.newUsername.toLowerCase();
    const currentLower = String(user.profile?.username || '').toLowerCase();
    
    // If not changing, no-op
    if (currentLower === lower) {
      return { success: true };
    }
    
    // Check if username is available
    const existingUsername = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", lower))
      .first();
    
    if (existingUsername && existingUsername.userId !== args.userId) {
      throw new Error("Username not available");
    }
    
    // Reserve new username
    if (!existingUsername) {
      await ctx.db.insert("usernames", {
        username: lower,
        userId: args.userId,
        updatedAt: Date.now(),
      });
    }
    
    // Delete old username mapping if exists
    if (currentLower) {
      const oldUsername = await ctx.db
        .query("usernames")
        .withIndex("by_username", (q) => q.eq("username", currentLower))
        .first();
      
      if (oldUsername && oldUsername.userId === args.userId) {
        await ctx.db.delete(oldUsername._id);
      }
    }
    
    // Update user profile
    await ctx.db.patch(args.userId, {
      profile: {
        ...user.profile,
        username: args.newUsername,
        usernameLower: lower,
        usernameManualChangedAt: Date.now(),
        usernameManualChanged: true,
      },
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Log weight update
 * Replaces: arrayUnion for weight history
 * Updates profile weight, plan currentWeight, and weightHistory
 * Restriction: Can only log weight once per week
 */
export const logWeight = mutation({
  args: {
    userId: v.id("users"),
    weight: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if user logged weight in the last 7 days
    const lastWeighedAt = user.lastWeighedAt;
    const now = Date.now();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    if (lastWeighedAt && (now - lastWeighedAt) < ONE_WEEK_MS) {
      const nextAllowedDate = new Date(lastWeighedAt + ONE_WEEK_MS);
      const daysRemaining = Math.ceil((nextAllowedDate.getTime() - now) / (24 * 60 * 60 * 1000));
      throw new Error(`You can log weight again in ${daysRemaining} day(s). Next allowed: ${nextAllowedDate.toLocaleDateString()}`);
    }
    
    const weightHistory = user.weightHistory || [];
    weightHistory.push({
      weight: args.weight,
      at: Date.now(),
    });
    
    // Update profile, plan, and history
    const updates: any = {
      profile: {
        ...user.profile,
        weight: args.weight, // Update profile weight
      },
      weightHistory,
      lastWeighedAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    // Also update plan currentWeight if plan exists
    if (user.plan) {
      updates.plan = {
        ...user.plan,
        currentWeight: args.weight,
      };
    }
    
    await ctx.db.patch(args.userId, updates);
    
    return { success: true };
  },
});

/**
 * Check if user can log weight (once per week restriction)
 */
export const canLogWeight = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return { canLog: false, reason: "User not found" };
    }
    
    const lastWeighedAt = user.lastWeighedAt;
    if (!lastWeighedAt) {
      return { canLog: true, daysRemaining: 0 };
    }
    
    const now = Date.now();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const timeSinceLastLog = now - lastWeighedAt;
    
    if (timeSinceLastLog < ONE_WEEK_MS) {
      const nextAllowedDate = new Date(lastWeighedAt + ONE_WEEK_MS);
      const daysRemaining = Math.ceil((nextAllowedDate.getTime() - now) / (24 * 60 * 60 * 1000));
      return { 
        canLog: false, 
        daysRemaining, 
        nextAllowedDate: nextAllowedDate.toISOString(),
        lastLoggedDate: new Date(lastWeighedAt).toISOString(),
      };
    }
    
    return { canLog: true, daysRemaining: 0 };
  },
});

/**
 * Update desired weight (goal weight)
 * Updates both profile and plan
 */
export const updateDesiredWeight = mutation({
  args: {
    userId: v.id("users"),
    desiredWeight: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update both profile and plan to keep them in sync
    const updates: any = {
      profile: {
        ...user.profile,
        desiredWeight: args.desiredWeight,
      },
      updatedAt: Date.now(),
    };
    
    // Also update plan if it exists
    if (user.plan) {
      updates.plan = {
        ...user.plan,
        desiredWeight: args.desiredWeight,
      };
    }
    
    await ctx.db.patch(args.userId, updates);
    
    return { success: true };
  },
});

/**
 * Delete user account and all associated data
 * Deletes: user record, all meals, all daily entries, username mapping
 */
export const deleteAccount = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // 1. Delete all meals for this user
    const meals = await ctx.db
      .query("meals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const meal of meals) {
      await ctx.db.delete(meal._id);
    }
    
    // 2. Delete all daily entries for this user
    const dailyEntries = await ctx.db
      .query("daily")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const daily of dailyEntries) {
      await ctx.db.delete(daily._id);
    }
    
    // 3. Delete username mapping if exists
    if (user.profile?.usernameLower) {
      const usernameLower = user.profile.usernameLower;
      const usernameEntry = await ctx.db
        .query("usernames")
        .withIndex("by_username", (q) => q.eq("username", usernameLower))
        .first();
      
      if (usernameEntry && usernameEntry.userId === args.userId) {
        await ctx.db.delete(usernameEntry._id);
      }
    }
    
    // 4. Delete the user record itself
    await ctx.db.delete(args.userId);
    
    return { success: true };
  },
});

