/**
 * Meals Management Functions
 * Replaces Firebase Firestore meals subcollection operations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Add a new meal
 * Replaces: addDoc(collection(db, 'users', uid, 'meals'), {...})
 */
export const add = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    calories: v.number(),
    proteinG: v.number(),
    carbsG: v.number(),
    fatG: v.number(),
    healthScore: v.optional(v.number()),
    fiberG: v.optional(v.number()),
    sugarG: v.optional(v.number()),
    sodiumMg: v.optional(v.number()),
    servingSize: v.optional(v.string()),
    imageUri: v.optional(v.string()),
    date: v.string(), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    const mealId = await ctx.db.insert("meals", {
      userId: args.userId,
      title: args.title,
      calories: args.calories,
      proteinG: args.proteinG,
      carbsG: args.carbsG,
      fatG: args.fatG,
      healthScore: args.healthScore,
      fiberG: args.fiberG,
      sugarG: args.sugarG,
      sodiumMg: args.sodiumMg,
      servingSize: args.servingSize,
      imageUri: args.imageUri,
      date: args.date,
      createdAt: Date.now(),
    });
    
    // Also update daily totals
    await updateDailyTotals(ctx, args.userId, args.date);
    
    return mealId;
  },
});

/**
 * Get meals for a specific date
 * Replaces: query(collection, where('date', '==', date), orderBy('createdAt', 'desc'))
 */
export const getByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("meals")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get meals for today
 */
export const getToday = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    return await ctx.db
      .query("meals")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", today)
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get meals for yesterday
 */
export const getYesterday = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return await ctx.db
      .query("meals")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("date", yesterday)
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get recent meals (last N days)
 */
export const getRecent = query({
  args: {
    userId: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const allMeals = await ctx.db
      .query("meals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
    
    // Filter by date range
    return allMeals.filter(meal => meal.date >= startDate);
  },
});

/**
 * Get meals for a date range (for analytics)
 */
export const getByDateRange = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const allMeals = await ctx.db
      .query("meals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    return allMeals.filter(
      meal => meal.date >= args.startDate && meal.date <= args.endDate
    );
  },
});

/**
 * Delete a meal
 */
export const remove = mutation({
  args: {
    mealId: v.id("meals"),
  },
  handler: async (ctx, args) => {
    const meal = await ctx.db.get(args.mealId);
    
    if (!meal) {
      throw new Error("Meal not found");
    }
    
    await ctx.db.delete(args.mealId);
    
    // Update daily totals after deletion
    await updateDailyTotals(ctx, meal.userId, meal.date);
    
    return { success: true };
  },
});

/**
 * Helper function to update daily totals
 * Called after adding or removing a meal
 */
async function updateDailyTotals(
  ctx: any,
  userId: any,
  date: string
) {
  // Get all meals for this date
  const meals = await ctx.db
    .query("meals")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).eq("date", date)
    )
    .collect();
  
  // Calculate totals
  const totals = meals.reduce(
    (acc: any, meal: any) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.proteinG || 0),
      carbs: acc.carbs + (meal.carbsG || 0),
      fat: acc.fat + (meal.fatG || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  // Check if daily record exists
  const existing = await ctx.db
    .query("daily")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).eq("dateKey", date)
    )
    .first();
  
  if (existing) {
    // Update existing
    await ctx.db.patch(existing._id, {
      ...totals,
      lastUpdated: Date.now(),
    });
  } else {
    // Create new
    await ctx.db.insert("daily", {
      userId,
      dateKey: date,
      ...totals,
      lastUpdated: Date.now(),
    });
  }
}

/**
 * Get daily totals for a date
 */
export const getDailyTotals = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const daily = await ctx.db
      .query("daily")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("dateKey", args.date)
      )
      .first();
    
    return daily || {
      userId: args.userId,
      dateKey: args.date,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      lastUpdated: Date.now(),
    };
  },
});

/**
 * Get daily totals for today
 */
export const getTodayTotals = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split('T')[0];
    return await ctx.db
      .query("daily")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", args.userId).eq("dateKey", today)
      )
      .first();
  },
});

