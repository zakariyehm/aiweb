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
  // Use local timezone to avoid iOS timezone issues
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateKey = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // Use local timezone to avoid iOS timezone issues
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  
  // Separate state for today's and yesterday's data
  const [todayData, setTodayData] = useState<{
    recentlyEaten: NutritionEntry[];
    dailyTotals: DailyTotals;
    date: string;
  }>({
    recentlyEaten: [],
    dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    date: getTodayDateKey()
  });

  const [yesterdayData, setYesterdayData] = useState<{
    recentlyEaten: NutritionEntry[];
    dailyTotals: DailyTotals;
    date: string;
  }>({
    recentlyEaten: [],
    dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    date: getYesterdayDateKey()
  });

  // Calculate daily totals from recently eaten foods
  const calculateDailyTotals = useCallback((entries: NutritionEntry[]): DailyTotals => {
    return entries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.proteinG || 0),
      carbs: totals.carbs + (entry.carbsG || 0),
      fat: totals.fat + (entry.fatG || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, []);

  // Add a new food entry to today's log (always current date)
  const addFoodEntry = useCallback(async (foodData: Omit<NutritionEntry, 'id' | 'createdAt' | 'date'>) => {
    if (!userId) return;

    try {
      const todayKey = getTodayDateKey(); // Always use current date
      const newEntry = {
        ...foodData,
        date: todayKey, // Force current date
        createdAt: serverTimestamp(),
      };

      // Add to Firestore
      await addDoc(collection(db, 'users', userId, 'meals'), newEntry);
      console.log(`Added food entry for ${todayKey}:`, foodData.title);

    } catch (error) {
      console.error('Failed to add food entry:', error);
    }
  }, [userId]);

  // Move today's data to yesterday and reset for new day
  const transitionToNewDay = useCallback(() => {
    const newTodayDate = getTodayDateKey();
    const newYesterdayDate = getYesterdayDateKey();
    
    // Move current today's data to yesterday with proper date
    setYesterdayData({
      recentlyEaten: todayData.recentlyEaten,
      dailyTotals: todayData.dailyTotals,
      date: newYesterdayDate // Yesterday's date
    });

    // Reset today's data for the new day
    setTodayData({
      recentlyEaten: [],
      dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      date: newTodayDate
    });

    setCurrentDateKey(newTodayDate);
    console.log(`Daily transition completed: moved ${todayData.date} to yesterday, reset ${newTodayDate} to 0`);
  }, [todayData]);

  // Check for new day transition and handle it
  useEffect(() => {
    if (isNewDay(currentDateKey)) {
      transitionToNewDay();
    }
  }, [currentDateKey, transitionToNewDay]);

  // Listen to today's meals (current date only)
  useEffect(() => {
    if (!userId) return;

    const todayKey = getTodayDateKey();
    console.log(`[iOS Debug] Setting up today's meals listener for date: ${todayKey}`);
    
    // First, let's check if there are any meals at all
    const allMealsQuery = query(
      collection(db, 'users', userId, 'meals'),
      orderBy('createdAt', 'desc')
    );
    
    const allMealsUnsubscribe = onSnapshot(allMealsQuery, (snapshot) => {
      console.log(`[iOS Debug] All meals snapshot received with ${snapshot.size} total documents`);
      if (snapshot.size > 0) {
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`[iOS Debug] All meals document ${doc.id}:`, { 
            title: data.title, 
            date: data.date, 
            createdAt: data.createdAt 
          });
        });
      }
    }, (error) => {
      if (String(error?.code || '').includes('permission-denied')) {
        console.warn('[iOS Debug] All meals snapshot permission denied');
        return;
      }
      console.warn('[iOS Debug] All meals snapshot error', error);
    });
    
    const todayMealsQuery = query(
      collection(db, 'users', userId, 'meals'),
      where('date', '==', todayKey),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(todayMealsQuery, (snapshot) => {
      const entries: NutritionEntry[] = [];
      
      console.log(`[iOS Debug] Today's snapshot received with ${snapshot.size} documents`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`[iOS Debug] Document ${doc.id}:`, { 
          title: data.title, 
          date: data.date, 
          expectedDate: todayKey,
          createdAt: data.createdAt 
        });
        
        // Only include meals from today's date
        if (data.date === todayKey) {
          entries.push({
            id: doc.id,
            title: data.title || 'Unknown',
            calories: data.calories || 0,
            proteinG: data.proteinG || 0,
            carbsG: data.carbsG || 0,
            fatG: data.fatG || 0,
            imageUri: data.imageUri || null,
            createdAt: data.createdAt,
            date: data.date || todayKey,
          });
        } else {
          console.log(`[iOS Debug] Skipping document ${doc.id} - date mismatch: ${data.date} vs ${todayKey}`);
        }
      });

      // Update today's data with filtered meals
      setTodayData(prev => ({
        ...prev,
        recentlyEaten: entries,
        dailyTotals: calculateDailyTotals(entries),
        date: todayKey
      }));
      
      setLoading(false);
      console.log(`[iOS Debug] Loaded ${entries.length} meals for today (${todayKey})`);
    }, (error) => {
      console.error('[iOS Debug] Error fetching today\'s meals:', error);
      console.error('[iOS Debug] Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setLoading(false);
    });

    return () => {
      unsubscribe();
      allMealsUnsubscribe();
    };
  }, [userId, calculateDailyTotals]);

  // Listen to yesterday's meals (previous date only)
  useEffect(() => {
    if (!userId) return;

    const yesterdayKey = getYesterdayDateKey();
    console.log(`[iOS Debug] Setting up yesterday's meals listener for date: ${yesterdayKey}`);
    
    const yesterdayMealsQuery = query(
      collection(db, 'users', userId, 'meals'),
      where('date', '==', yesterdayKey),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(yesterdayMealsQuery, (snapshot) => {
      const entries: NutritionEntry[] = [];
      
      console.log(`[iOS Debug] Yesterday's snapshot received with ${snapshot.size} documents`);
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`[iOS Debug] Yesterday document ${doc.id}:`, { 
          title: data.title, 
          date: data.date, 
          expectedDate: yesterdayKey,
          createdAt: data.createdAt 
        });
        
        // Only include meals from yesterday's date
        if (data.date === yesterdayKey) {
          entries.push({
            id: doc.id,
            title: data.title || 'Unknown',
            calories: data.calories || 0,
            proteinG: data.proteinG || 0,
            carbsG: data.carbsG || 0,
            fatG: data.fatG || 0,
            imageUri: data.imageUri || null,
            createdAt: data.createdAt,
            date: data.date || yesterdayKey,
          });
        } else {
          console.log(`[iOS Debug] Skipping yesterday document ${doc.id} - date mismatch: ${data.date} vs ${yesterdayKey}`);
        }
      });

      // Update yesterday's data with filtered meals
      setYesterdayData(prev => ({
        ...prev,
        recentlyEaten: entries,
        dailyTotals: calculateDailyTotals(entries),
        date: yesterdayKey
      }));
      
      console.log(`[iOS Debug] Loaded ${entries.length} meals for yesterday (${yesterdayKey})`);
    }, (error) => {
      console.error('[iOS Debug] Error fetching yesterday\'s meals:', error);
      console.error('[iOS Debug] Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    });

    return unsubscribe;
  }, [userId, calculateDailyTotals]);

  // Update main state based on selected tab
  useEffect(() => {
    if (selectedDate === 'today') {
      setRecentlyEaten(todayData.recentlyEaten);
      setDailyTotals(todayData.dailyTotals);
    } else {
      setRecentlyEaten(yesterdayData.recentlyEaten);
      setDailyTotals(yesterdayData.dailyTotals);
    }
  }, [selectedDate, todayData, yesterdayData]);

  // Check for new day at midnight (every minute)
  useEffect(() => {
    const checkForNewDay = () => {
      const todayKey = getTodayDateKey();
      if (isNewDay(currentDateKey)) {
        console.log(`🌅 New day detected! Transitioning from ${currentDateKey} to ${todayKey}`);
        transitionToNewDay();
      }
    };

    // Check immediately on mount
    checkForNewDay();

    // Check every minute for new day
    const interval = setInterval(checkForNewDay, 60000);
    
    // Also check when the app becomes active
    const handleAppStateChange = () => {
      checkForNewDay();
    };

    return () => {
      clearInterval(interval);
    };
  }, [currentDateKey, transitionToNewDay]);

  // Calculate progress percentages (for UI circles)
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
    transitionToNewDay,
    getProgressPercentages,
    currentDateKey,
    // Return separate data for today and yesterday
    todayData,
    yesterdayData,
  };
}

export default useDailyNutrition;
