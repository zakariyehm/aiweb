import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema - Replaces Firebase Firestore
 * 
 * Tables:
 * - users: Main user profiles and settings
 * - meals: Individual meal entries (replaces users/{uid}/meals subcollection)
 * - daily: Daily nutrition aggregates (replaces users/{uid}/daily subcollection)
 * - promoCodes: Referral promo codes
 * - usernames: Username reservations for uniqueness
 */

export default defineSchema({
  // Main user table - stores profile, plan, streak, referral data
  users: defineTable({
    // Auth - will be linked via Convex auth system
    email: v.optional(v.string()),
    isGuest: v.boolean(),
    
    // Profile data
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
      notificationsEnabled: v.optional(v.boolean()), // User notification preference
    }),
    
    // Nutrition plan (BMR, TDEE, macros)
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
    
    // Streak tracking
    streak: v.optional(v.object({
      count: v.number(),
      lastDoneDate: v.optional(v.string()), // YYYY-MM-DD format
      updatedAt: v.optional(v.number()),
    })),
    
    // Referral system
    referral: v.optional(v.object({
      promoCode: v.string(),
      referredCount: v.number(),
      earningsCents: v.number(),
      referredPeople: v.array(v.string()), // Array of user IDs
      usedReferrerId: v.optional(v.string()),
      usedReferrerCode: v.optional(v.string()),
    })),
    
    // Weight tracking history
    weightHistory: v.optional(v.array(v.object({
      weight: v.number(),
      at: v.number(), // timestamp
    }))),
    lastWeighedAt: v.optional(v.number()),
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_creation", ["createdAt"]),
  
  // Meals table - replaces users/{uid}/meals subcollection
  meals: defineTable({
    userId: v.id("users"),
    
    // Meal data
    title: v.string(),
    calories: v.number(),
    proteinG: v.number(),
    carbsG: v.number(),
    fatG: v.number(),
    healthScore: v.optional(v.number()),
    
    // Additional nutrition (optional)
    fiberG: v.optional(v.number()),
    sugarG: v.optional(v.number()),
    sodiumMg: v.optional(v.number()),
    servingSize: v.optional(v.string()),
    
    // Image
    imageUri: v.optional(v.string()),
    
    // Date tracking
    date: v.string(), // YYYY-MM-DD format for querying by day
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"])
    .index("by_date", ["date"])
    .index("by_creation", ["userId", "createdAt"]),
  
  // Daily aggregates - replaces users/{uid}/daily subcollection
  daily: defineTable({
    userId: v.id("users"),
    dateKey: v.string(), // YYYY-MM-DD format
    
    // Totals for the day
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    
    // Metadata
    lastUpdated: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "dateKey"])
    .index("by_date", ["dateKey"]),
  
  // Promo codes for referral system
  promoCodes: defineTable({
    code: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_user", ["userId"]),
  
  // Username reservations for uniqueness
  usernames: defineTable({
    username: v.string(), // lowercase username
    userId: v.id("users"),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_user", ["userId"]),
});

