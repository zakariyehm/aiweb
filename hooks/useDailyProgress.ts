/**
 * Daily Progress Hook - Convex Version
 * Replaces Firebase Firestore daily totals tracking
 */

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useMemo } from "react";

export type DailyPlan = { calories: number; protein: number; carbs: number; fat: number };
export type DailyTotals = { calories: number; protein: number; carbs: number; fat: number };

const getLocalDateKey = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Tracks today's consumption totals and percentages relative to a daily plan.
 * Uses Convex reactive queries - automatically updates when meals change.
 */
export function useDailyProgress(userId: Id<"users"> | undefined, plan: DailyPlan | null) {
  const dateKey = getLocalDateKey();

  // Query today's totals (reactive)
  const dailyTotals = useQuery(
    api.meals.getDailyTotals,
    userId ? { userId, date: dateKey } : "skip"
  );

  const totals: DailyTotals = useMemo(() => {
    if (!dailyTotals) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    return {
      calories: dailyTotals.calories || 0,
      protein: dailyTotals.protein || 0,
      carbs: dailyTotals.carbs || 0,
      fat: dailyTotals.fat || 0,
    };
  }, [dailyTotals]);

  const percents = useMemo(() => {
    const pct = (n: number, d: number) => (d > 0 ? Math.min(1, Math.max(0, n / d)) : 0);
    return {
      calories: plan ? pct(totals.calories, plan.calories) : 0,
      protein: plan ? pct(totals.protein, plan.protein) : 0,
      carbs: plan ? pct(totals.carbs, plan.carbs) : 0,
      fat: plan ? pct(totals.fat, plan.fat) : 0,
    } as const;
  }, [totals, plan]);

  return {
    dateKey,
    totals,
    percents,
    // Legacy compatibility - addIntake not needed as meals.add handles this
    addIntake: async () => {
      console.warn('addIntake is deprecated - use useDailyNutrition.addFoodEntry instead');
    },
  };
}

export default useDailyProgress;
