import { db } from '@/lib/firebase';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export interface NutritionEntry {
  id: string;
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  imageUri?: string | null;
  createdAt: any;
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
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const getYesterdayDateKey = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0]; // YYYY-MM-DD format
};

const isNewDay = (lastDateKey: string): boolean => {
  const todayKey = getTodayDateKey();
  return lastDateKey !== todayKey;
};

export function useDailyNutrition(userId: string | undefined, selectedDate: 'today' | 'yesterday' = 'today') {
  const [recentlyEaten, setRecentlyEaten] = useState<NutritionEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [currentDateKey, setCurrentDateKey] = useState<string>(getTodayDateKey());
  const [loading, setLoading] = useState(true);

  // Calculate daily totals from recently eaten foods
  const calculateDailyTotals = useCallback((entries: NutritionEntry[]): DailyTotals => {
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.proteinG || 0),
      carbs: totals.carbs + (entry.carbsG || 0),
      fat: totals.fat + (entry.fatG || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, []);

  // Add a new food entry to today's log
  const addFoodEntry = useCallback(async (foodData: Omit<NutritionEntry, 'id' | 'createdAt' | 'date'>) => {
    if (!userId) return;

    try {
      const todayKey = getTodayDateKey();
      const newEntry = {
        ...foodData,
        date: todayKey,
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
      await addDoc(collection(db, 'users', userId, 'meals'), newEntry);

      // Update local state immediately for better UX
      const entryWithId = {
        ...newEntry,
        id: `temp-${Date.now()}`, // Temporary ID until Firestore syncs
        createdAt: new Date(),
      };

      setRecentlyEaten(prev => [entryWithId, ...prev]);
      
      // Recalculate totals
      const newTotals = calculateDailyTotals([entryWithId, ...recentlyEaten]);
      setDailyTotals(newTotals);

    } catch (error) {
      console.error('Failed to add food entry:', error);
    }
  }, [userId, recentlyEaten, calculateDailyTotals]);

  // Reset daily log for new day
  const resetForNewDay = useCallback(() => {
    setRecentlyEaten([]);
    setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    setCurrentDateKey(getTodayDateKey());
  }, []);

  // Listen to meals for selected date
  useEffect(() => {
    if (!userId) return;

    const dateKey = selectedDate === 'today' ? getTodayDateKey() : getYesterdayDateKey();
    
    // Check if it's a new day (only for today)
    if (selectedDate === 'today' && isNewDay(currentDateKey)) {
      resetForNewDay();
      return;
    }

    const mealsQuery = query(
      collection(db, 'users', userId, 'meals'),
      where('date', '==', dateKey),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(mealsQuery, (snapshot) => {
      const entries: NutritionEntry[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          title: data.title || 'Unknown',
          calories: data.calories || 0,
          proteinG: data.proteinG || 0,
          carbsG: data.carbsG || 0,
          fatG: data.fatG || 0,
          imageUri: data.imageUri || null,
          createdAt: data.createdAt,
          date: data.date || dateKey,
        });
      });

      setRecentlyEaten(entries);
      
      // Calculate and update daily totals
      const totals = calculateDailyTotals(entries);
      setDailyTotals(totals);
      
      setLoading(false);
    }, (error) => {
      console.error('Error fetching meals:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, currentDateKey, calculateDailyTotals, resetForNewDay, selectedDate]);

  // Check for new day at midnight
  useEffect(() => {
    const checkForNewDay = () => {
      const todayKey = getTodayDateKey();
      if (isNewDay(currentDateKey)) {
        resetForNewDay();
      }
    };

    // Check every minute for new day
    const interval = setInterval(checkForNewDay, 60000);
    
    // Also check when the app becomes active
    const handleAppStateChange = () => {
      checkForNewDay();
    };

    return () => {
      clearInterval(interval);
    };
  }, [currentDateKey, resetForNewDay]);

  // Calculate progress percentages (for UI circles)
  const calculateProgress = useCallback((target: number, current: number): number => {
    if (target <= 0) return 0;
    return Math.min(1, Math.max(0, current / target));
  }, []);

  const getProgressPercentages = useCallback((targets: DailyTotals): DailyProgress => {
    return {
      calories: calculateProgress(targets.calories, dailyTotals.calories),
      protein: calculateProgress(targets.protein, dailyTotals.protein),
      carbs: calculateProgress(targets.carbs, dailyTotals.carbs),
      fat: calculateProgress(targets.fat, dailyTotals.fat),
    };
  }, [dailyTotals, calculateProgress]);

  return {
    recentlyEaten,
    dailyTotals,
    loading,
    addFoodEntry,
    resetForNewDay,
    getProgressPercentages,
    currentDateKey,
  };
}

export default useDailyNutrition;
