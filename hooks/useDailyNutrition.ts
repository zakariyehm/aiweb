/**
 * Daily Nutrition Hook - Convex Version
 * Replaces Firebase Firestore meals tracking
 */

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";

export interface NutritionEntry {
  _id: Id<"meals">;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  imageUri?: string | null;
  createdAt: number;
  date: string;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyProgress {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const getTodayDateKey = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateKey = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useDailyNutrition(
  userId: Id<"users"> | undefined,
  selectedDate: 'today' | 'yesterday' = 'today'
) {
  const todayKey = getTodayDateKey();
  const yesterdayKey = getYesterdayDateKey();

  // Query today's meals (reactive)
  const todayMeals = useQuery(
    api.meals.getByDate,
    userId ? { userId, date: todayKey } : "skip"
  );

  // Query yesterday's meals (reactive)
  const yesterdayMeals = useQuery(
    api.meals.getByDate,
    userId ? { userId, date: yesterdayKey } : "skip"
  );

  // Query today's totals
  const todayTotals = useQuery(
    api.meals.getDailyTotals,
    userId ? { userId, date: todayKey } : "skip"
  );

  // Query yesterday's totals
  const yesterdayTotals = useQuery(
    api.meals.getDailyTotals,
    userId ? { userId, date: yesterdayKey } : "skip"
  );

  // Mutation to add food entry
  const addMealMutation = useMutation(api.meals.add);

  const loading = todayMeals === undefined || yesterdayMeals === undefined;

  // Prepare data structures
  const todayData = useMemo(() => ({
    recentlyEaten: (todayMeals || []) as NutritionEntry[],
    dailyTotals: todayTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
    date: todayKey,
  }), [todayMeals, todayTotals, todayKey]);

  const yesterdayData = useMemo(() => ({
    recentlyEaten: (yesterdayMeals || []) as NutritionEntry[],
    dailyTotals: yesterdayTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 },
    date: yesterdayKey,
  }), [yesterdayMeals, yesterdayTotals, yesterdayKey]);

  // Current selection
  const recentlyEaten = selectedDate === 'today' ? todayData.recentlyEaten : yesterdayData.recentlyEaten;
  const dailyTotals = selectedDate === 'today' ? todayData.dailyTotals : yesterdayData.dailyTotals;

  // Add food entry callback
  const addFoodEntry = useCallback(async (foodData: {
    title: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    healthScore?: number;
    imageUri?: string | null;
  }) => {
    if (!userId) return;

    try {
      const todayKey = getTodayDateKey();
      await addMealMutation({
        userId,
        title: foodData.title,
        calories: foodData.calories,
        proteinG: foodData.proteinG,
        carbsG: foodData.carbsG,
        fatG: foodData.fatG,
        healthScore: foodData.healthScore,
        imageUri: foodData.imageUri || undefined,
        date: todayKey,
      });
      console.log(`[Convex] Added food entry for ${todayKey}:`, foodData.title);
    } catch (error) {
      console.error('Failed to add food entry:', error);
      throw error;
    }
  }, [userId, addMealMutation]);

  // Calculate progress percentages
  const calculateProgress = useCallback((target: number, current: number): number => {
    if (target <= 0) return 0;
    return Math.min(1, Math.max(0, current / target));
  }, []);

  const getProgressPercentages = useCallback((targets: DailyTotals): DailyProgress => {
    return {
      calories: calculateProgress(targets.calories, todayData.dailyTotals.calories),
      protein: calculateProgress(targets.protein, todayData.dailyTotals.protein),
      carbs: calculateProgress(targets.carbs, todayData.dailyTotals.carbs),
      fat: calculateProgress(targets.fat, todayData.dailyTotals.fat),
    };
  }, [todayData.dailyTotals, calculateProgress]);

  return {
    recentlyEaten,
    dailyTotals,
    loading,
    addFoodEntry,
    getProgressPercentages,
    currentDateKey: selectedDate === 'today' ? todayKey : yesterdayKey,
    todayData,
    yesterdayData,
    // Legacy compatibility (not used in new code)
    transitionToNewDay: () => {}, // No-op, Convex handles this automatically
  };
}

export default useDailyNutrition;
