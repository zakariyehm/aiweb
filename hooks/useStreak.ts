/**
 * Streak Hook - Convex Version
 * Replaces Firebase Firestore streak tracking
 */

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export function useStreak(userId: Id<"users"> | undefined | null) {
  // Get streak data from Convex (reactive)
  const streakData = useQuery(
    api.streak.get,
    userId ? { userId } : "skip"
  );
  
  // Mutation to mark today as done
  const markDoneMutation = useMutation(api.streak.markDone);

  const count = streakData?.count ?? 0;
  const lastDone = streakData?.lastDoneDate;
  const atRisk = streakData?.atRisk ?? false;
  const broken = streakData?.broken ?? false;
  const countedToday = streakData?.countedToday ?? false;

  const markDone = useCallback(async () => {
    if (!userId) return;
    
    try {
      await markDoneMutation({ userId });
    } catch (error) {
      console.error('Failed to mark streak done:', error);
    }
  }, [userId, markDoneMutation]);

  const canCountToday = !countedToday;

  return useMemo(
    () => ({
      count,
      atRisk,
      broken,
      countedToday,
      canCountToday,
      markDone,
    }),
    [count, atRisk, broken, countedToday, canCountToday, markDone]
  );
}

export default useStreak;
