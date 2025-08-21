import { db } from '@/lib/firebase';
import { doc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type DailyPlan = { calories: number; protein: number; carbs: number; fat: number };
export type DailyTotals = { calories: number; protein: number; carbs: number; fat: number };

const getLocalDateKey = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // e.g., 2025-08-21
};

const msUntilNextLocalMidnight = (): number => {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0, 0, 0, 0
  );
  return Math.max(0, midnight.getTime() - now.getTime());
};

/**
 * Tracks today's consumption totals and percentages relative to a daily plan.
 * Stores data per-day under: users/{uid}/daily/{YYYY-MM-DD}
 * Automatically rolls over at local midnight by switching the subscribed date key.
 */
export function useDailyProgress(userId: string | undefined, plan: DailyPlan | null) {
  const [dateKey, setDateKey] = useState<string>(getLocalDateKey());
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    if (!userId) return;

    const ref = doc(db, 'users', userId, 'daily', dateKey);
    const unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        await setDoc(ref, { calories: 0, protein: 0, carbs: 0, fat: 0, dateKey }, { merge: true });
        setTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
      } else {
        const data = snap.data() as any;
        setTotals({
          calories: data?.calories ?? 0,
          protein: data?.protein ?? 0,
          carbs: data?.carbs ?? 0,
          fat: data?.fat ?? 0,
        });
      }
    });

    const timer = setTimeout(() => setDateKey(getLocalDateKey()), msUntilNextLocalMidnight());
    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, [userId, dateKey]);

  const addIntake = useCallback(async (delta: Partial<DailyTotals>) => {
    if (!userId) return;
    const todayKey = getLocalDateKey();
    const ref = doc(db, 'users', userId, 'daily', todayKey);
    // Ensure document exists first
    await setDoc(ref, { calories: 0, protein: 0, carbs: 0, fat: 0, dateKey: todayKey }, { merge: true });
    await updateDoc(ref, {
      calories: increment(delta.calories ?? 0),
      protein: increment(delta.protein ?? 0),
      carbs: increment(delta.carbs ?? 0),
      fat: increment(delta.fat ?? 0),
    });
  }, [userId]);

  const percents = useMemo(() => {
    const pct = (n: number, d: number) => (d > 0 ? Math.min(1, Math.max(0, n / d)) : 0);
    return {
      calories: plan ? pct(totals.calories, plan.calories) : 0,
      protein: plan ? pct(totals.protein, plan.protein) : 0,
      carbs: plan ? pct(totals.carbs, plan.carbs) : 0,
      fat: plan ? pct(totals.fat, plan.fat) : 0,
    } as const;
  }, [totals, plan]);

  return { dateKey, totals, percents, addIntake };
}

export default useDailyProgress;


