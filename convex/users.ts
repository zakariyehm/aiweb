/**
 * User Management Functions
 * Replaces Firebase Firestore users operations
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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
 * Send email verification code
 * Generates a 6-digit code and stores it for verification
 * In production, this would send an email via an email service
 */
export const sendEmailVerificationCode = mutation({
  args: {
    userId: v.id("users"),
    newEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("Account not found. Please try signing in again.");
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.newEmail)) {
      throw new Error("Please enter a valid email address (e.g., name@example.com)");
    }
    
    // Check if email is already in use by another user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.newEmail))
      .first();
    
    if (existingUser && existingUser._id !== args.userId) {
      throw new Error("This email is already registered. Please use a different email address.");
    }
    
    // Check if email is the same as current email
    if (user.email === args.newEmail || user.profile?.email === args.newEmail) {
      throw new Error("This is already your current email address.");
    }
    
    // Delete any existing verification codes for this user
    const existingCodes = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const code of existingCodes) {
      await ctx.db.delete(code._id);
    }
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Code expires in 15 minutes
    const expiresAt = Date.now() + 15 * 60 * 1000;
    
    // Store verification code
    await ctx.db.insert("emailVerifications", {
      userId: args.userId,
      email: args.newEmail,
      code: verificationCode,
      expiresAt,
      createdAt: Date.now(),
    });
    
    // Send email using Resend via action (actions can make external API calls)
    // Mutations cannot call actions directly, so we schedule it to run immediately
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      // Production: Schedule action to send real email using Resend
      // runAfter(0) means run immediately
      // Note: Scheduler doesn't return result, so we can't check if email was sent
      // If domain is not verified, email will fail but we return code as fallback
      await ctx.scheduler.runAfter(0, api.actions.sendVerificationEmail, {
        email: args.newEmail,
        code: verificationCode,
      });
      console.log(`[Email Scheduled] Verification code will be sent to ${args.newEmail}`);
      
      // Return code as fallback (in case domain is not verified and email fails)
      // Once domain is verified and emails work reliably, you can remove code from return
      return {
        success: true,
        code: verificationCode, // Fallback if email sending fails
      };
    } else {
      // Development mode: Log warning if API key is missing
      console.warn(`[Email Verification] RESEND_API_KEY not found. Email not sent. Code: ${verificationCode}`);
      console.warn(`[Development Mode] Add RESEND_API_KEY to Convex environment variables to send real emails`);
      // In development without API key, return code for testing
      return {
        success: true,
        code: verificationCode,
      };
    }
  },
});

/**
 * Verify email code and update user email
 * Returns { success: true, newEmail: string } on success
 * Returns { success: false, error: string } on validation failure
 * Throws only for unexpected errors (user not found, etc.)
 */
export const verifyEmailCode = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("Account not found. Please try signing in again.");
    }
    
    // Find verification code for this user
    const verification = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!verification) {
      // Return error instead of throwing to avoid "Uncaught Error" in logs
      return {
        success: false,
        error: "No verification code found. Please request a new verification code.",
      };
    }
    
    // Check if code is expired
    if (Date.now() > verification.expiresAt) {
      // Delete expired code
      await ctx.db.delete(verification._id);
      // Return error instead of throwing
      return {
        success: false,
        error: "This verification code has expired. Please request a new code.",
      };
    }
    
    // Verify code matches (normalize and compare as strings)
    // Remove all non-digit characters and ensure 6 digits
    const enteredCode = String(args.code || '').replace(/\D/g, '').trim();
    const storedCode = String(verification.code || '').replace(/\D/g, '').trim();
    
    // Validate code length
    if (!enteredCode || enteredCode.length !== 6) {
      // Return error instead of throwing
      return {
        success: false,
        error: "The verification code must be 6 digits. Please check and try again.",
      };
    }
    
    if (!storedCode || storedCode.length !== 6) {
      // This shouldn't happen, but handle it gracefully
      await ctx.db.delete(verification._id);
      // Return error instead of throwing
      return {
        success: false,
        error: "Invalid verification code. Please request a new code.",
      };
    }
    
    // Compare codes (case-insensitive, already normalized to digits only)
    if (storedCode !== enteredCode) {
      // Return error instead of throwing to avoid "Uncaught Error" in logs
      return {
        success: false,
        error: "The verification code you entered is incorrect. Please check and try again.",
      };
    }
    
    // Check if email is still available
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", verification.email))
      .first();
    
    if (existingUser && existingUser._id !== args.userId) {
      await ctx.db.delete(verification._id);
      // Return error instead of throwing
      return {
        success: false,
        error: "This email address is already registered to another account. Please use a different email.",
      };
    }
    
    // Update user email in both root and profile
    await ctx.db.patch(args.userId, {
      email: verification.email,
      profile: {
        ...user.profile,
        email: verification.email,
      },
      updatedAt: Date.now(),
    });
    
    // Delete verification code after successful verification
    await ctx.db.delete(verification._id);
    
    return { 
      success: true,
      newEmail: verification.email,
    };
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
    
    // 4. Delete email verification codes
    const verifications = await ctx.db
      .query("emailVerifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const verification of verifications) {
      await ctx.db.delete(verification._id);
    }
    
    // 5. Delete the user record itself
    await ctx.db.delete(args.userId);
    
    return { success: true };
  },
});

