/**
 * Streak Management Functions
 * Replaces Firebase streak tracking logic
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get user's current streak
 * Replaces: onSnapshot(doc(db, 'users', uid), ...) for streak data
 */
export const get = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      return { count: 0, lastDoneDate: undefined, atRisk: false, broken: false };
    }
    
    const streak = user.streak || { count: 0, lastDoneDate: undefined };
    const todayKey = new Date().toISOString().split('T')[0];
    
    // Calculate streak status
    const status = calculateStreakStatus(streak.lastDoneDate, todayKey);
    
    return {
      count: status.broken ? 0 : streak.count,
      lastDoneDate: streak.lastDoneDate,
      atRisk: status.atRisk,
      broken: status.broken,
      countedToday: status.countedToday,
    };
  },
});

/**
 * Mark today as done (increment streak)
 * Replaces: setDoc(doc(db, 'users', uid), { streak: {...} }, { merge: true })
 * 
 * Streak Logic:
 * - Same day: no change
 * - Next day: count + 1
 * - Missed 1 day (grace period): keep count
 * - Missed 2+ days: reset to 1
 */
export const markDone = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const currentStreak = user.streak || { count: 0, lastDoneDate: undefined };
    const todayKey = new Date().toISOString().split('T')[0];
    
    let nextCount = currentStreak.count;
    
    if (!currentStreak.lastDoneDate) {
      // First time tracking
      nextCount = 1;
    } else {
      const daysDiff = calculateDayDiff(currentStreak.lastDoneDate, todayKey);
      
      if (daysDiff <= 0) {
        // Already counted today, no change
        nextCount = currentStreak.count;
      } else if (daysDiff === 1) {
        // Consecutive day, increment
        nextCount = currentStreak.count + 1;
      } else if (daysDiff === 2) {
        // Grace period: missed yesterday, keep count
        nextCount = currentStreak.count;
      } else {
        // Missed 2+ days, reset
        nextCount = 1;
      }
    }
    
    await ctx.db.patch(args.userId, {
      streak: {
        count: nextCount,
        lastDoneDate: todayKey,
        updatedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
    
    return { count: nextCount, lastDoneDate: todayKey };
  },
});

/**
 * Reset streak (admin/debug function)
 */
export const reset = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      streak: {
        count: 0,
        lastDoneDate: undefined,
        updatedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Helper: Calculate day difference between two date strings
 */
function calculateDayDiff(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split('-').map(Number);
  const [ty, tm, td] = toKey.split('-').map(Number);
  
  const from = new Date(fy, (fm || 1) - 1, fd || 1);
  const to = new Date(ty, (tm || 1) - 1, td || 1);
  
  const ms = to.getTime() - from.getTime();
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

/**
 * Helper: Calculate streak status (at risk, broken, counted today)
 */
function calculateStreakStatus(lastDoneDate: string | undefined, todayKey: string) {
  if (!lastDoneDate) {
    return { daysSince: Infinity, atRisk: false, broken: false, countedToday: false };
  }
  
  const diff = calculateDayDiff(lastDoneDate, todayKey);
  
  return {
    daysSince: diff,
    atRisk: diff === 2,      // Missed yesterday
    broken: diff >= 3,       // Missed 2+ days
    countedToday: diff <= 0, // Already recorded today
  };
}

