import { db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';
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

    // Query meals for today only
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const mealsQuery = query(
      collection(db, 'users', userId, 'meals'),
      where('createdAt', '>=', todayStart),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(mealsQuery, async (snap) => {
      let dailyTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      
      snap.forEach((doc) => {
        const meal = doc.data();
        dailyTotals.calories += meal.calories || 0;
        dailyTotals.protein += meal.proteinG || 0;
        dailyTotals.carbs += meal.carbsG || 0;
        dailyTotals.fat += meal.fatG || 0;
      });
      
      // Store the calculated totals in the daily document for persistence
      const dailyRef = doc(db, 'users', userId, 'daily', dateKey);
      await setDoc(dailyRef, { 
        ...dailyTotals, 
        dateKey,
        lastUpdated: new Date()
      }, { merge: true });
      
      setTotals(dailyTotals);
    }, (err) => {
      if (String(err?.code || '').includes('permission-denied')) {
        console.warn('[DailyProgress] meals snapshot permission denied');
        return;
      }
      console.warn('[DailyProgress] meals snapshot error', err);
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
    
    // Get current totals and add the new intake
    const currentData = (await getDoc(ref)).data() || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const newTotals = {
      calories: (currentData.calories || 0) + (delta.calories || 0),
      protein: (currentData.protein || 0) + (delta.protein || 0),
      carbs: (currentData.carbs || 0) + (delta.carbs || 0),
      fat: (currentData.fat || 0) + (delta.fat || 0),
    };
    
    await setDoc(ref, { 
      ...newTotals, 
      dateKey: todayKey,
      lastUpdated: new Date()
    }, { merge: true });
    
    setTotals(newTotals);
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


