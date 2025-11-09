import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WeeklyNutrition {
  weekStart: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  daysTracked: number;
  isRestWeek: boolean;
  healthScore: number;
  weekLabel: string;
}

interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function AnalyticsScreen() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
  const insets = useSafeAreaInsets();
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  const [currentWeek, setCurrentWeek] = useState<WeeklyNutrition | null>(null);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyNutrition[]>([]);
  const [dailyData, setDailyData] = useState<DailyNutrition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch recent meals for analytics (last 30 days)
  const recentMeals = useQuery(
    api.meals.getRecent,
    userId ? { userId, days: 30 } : "skip"
  );
  
  // Convex mutations for weight tracking
  const logWeightMutation = useMutation(api.users.logWeight);
  const updateDesiredWeightMutation = useMutation(api.users.updateDesiredWeight);
  
  // Check if user can log weight (once per week)
  const canLogWeightCheck = useQuery(
    api.users.canLogWeight,
    userId ? { userId } : "skip"
  );
  
  // Debounce mechanism to prevent excessive API calls
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const FETCH_COOLDOWN = 5000; // 5 seconds cooldown between fetches

  const timeframes = ['This Week', 'Last Week', '2 Weeks Ago', '3 Weeks Ago'];

  const BMICategories = [
    { label: 'Underweight', color: '#007AFF', range: [0, 18.5] },
    { label: 'Healthy', color: '#34C759', range: [18.5, 25] },
    { label: 'Overweight', color: '#FF9500', range: [25, 30] },
    { label: 'Obese', color: '#FF3B30', range: [30, 100] },
  ];

  const [currentWeight, setCurrentWeight] = useState<number>(0);
  const [goalWeight, setGoalWeight] = useState<number>(0);
  const [heightCm, setHeightCm] = useState<number>(0);
  const [userPlan, setUserPlan] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  const currentBMI = useMemo(() => {
    if (!currentWeight || !heightCm) return 0;
    const h = heightCm / 100;
    return Number((currentWeight / (h * h)).toFixed(2));
  }, [currentWeight, heightCm]);

  const getBMICategory = (bmi: number) => {
    return BMICategories.find(cat => bmi >= cat.range[0] && bmi < cat.range[1]) || BMICategories[1];
  };

  const bmiCategory = getBMICategory(currentBMI);

  // Get week start date (Monday)
  const getWeekStart = (date: Date = new Date()): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(d.setDate(diff));
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(monday.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  };

  // Get week end date (Sunday)
  const getWeekEnd = (date: Date = new Date()): string => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Adjust for Sunday
    const sunday = new Date(d.setDate(diff));
    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, '0');
    const dayOfMonth = String(sunday.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayOfMonth}`;
  };

  // Get readable week label
  const getWeekLabel = (weekStart: string): string => {
    const date = new Date(weekStart);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 14) return 'Last Week';
    if (diffDays <= 21) return '2 Weeks Ago';
    return '3 Weeks Ago';
  };

  // Calculate health score based on nutrition balance and consistency
  const calculateHealthScore = (
    totalCalories: number,
    totalProtein: number,
    totalCarbs: number,
    totalFat: number,
    daysTracked: number,
    targetCalories: number,
    targetProtein: number,
    targetCarbs: number,
    targetFat: number
  ): number => {
    if (daysTracked === 0) return 0;

    // Calculate daily averages
    const avgCalories = totalCalories / daysTracked;
    const avgProtein = totalProtein / daysTracked;
    const avgCarbs = totalCarbs / daysTracked;
    const avgFat = totalFat / daysTracked;

    // Calorie balance score (0-25 points)
    const calorieScore = Math.max(0, 25 - Math.abs(avgCalories - targetCalories) / targetCalories * 25);

    // Protein balance score (0-25 points)
    const proteinScore = Math.max(0, 25 - Math.abs(avgProtein - targetProtein) / targetProtein * 25);

    // Carbs balance score (0-25 points)
    const carbsScore = Math.max(0, 25 - Math.abs(avgCarbs - targetCarbs) / targetCarbs * 25);

    // Fat balance score (0-25 points)
    const fatScore = Math.max(0, 25 - Math.abs(avgFat - targetFat) / targetFat * 25);

    // Consistency bonus (0-10 points)
    const consistencyBonus = daysTracked >= 7 ? 10 : (daysTracked / 7) * 10;

    const totalScore = calorieScore + proteinScore + carbsScore + fatScore + consistencyBonus;
    return Math.round(Math.min(100, Math.max(0, totalScore)));
  };

  // TODO: Data migration function - needs full Convex implementation
  const fixExistingMeals = async (): Promise<void> => {
    if (!userId) return;

    try {
      // TODO: Implement with Convex
      console.log('Fix existing meals - needs Convex implementation');
      return;

      snapshot.docs.forEach(doc => {
        const meal = doc.data();
        if (meal.createdAt) {
          // Extract date from createdAt timestamp
          const timestamp = meal.createdAt.toDate ? meal.createdAt.toDate() : new Date(meal.createdAt);
          const dateString = timestamp.toISOString().split('T')[0];
          
          batch.update(doc.ref, { date: dateString });
          fixedCount++;
        }
      });

      if (fixedCount > 0) {
        await batch.commit();
        console.log(`Fixed ${fixedCount} meals with missing date fields`);
      }
    } catch (error) {
      console.warn('Error fixing existing meals:', error);
    }
  };

  // Fetch weekly nutrition data with fallback logic
  const fetchWeeklyNutrition = async (weekStart: string, weekEnd: string): Promise<WeeklyNutrition> => {
    if (!userId || !recentMeals) {
      return {
        weekStart,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        daysTracked: 0,
        isRestWeek: false,
        healthScore: 0,
        weekLabel: getWeekLabel(weekStart)
      };
    }

    try {
      // Debug: Show available meals
      console.log('[Analytics] Filtering meals for week:', { 
        weekStart, 
        weekEnd, 
        totalMealsAvailable: recentMeals?.length || 0,
        sampleMealDates: recentMeals?.slice(0, 3).map((m: any) => m.date) || []
      });

      // Use Convex data - filter meals by date range
      let meals = recentMeals.filter((meal: any) => 
        meal.date >= weekStart && meal.date <= weekEnd
      );

      console.log('[Analytics] Meals in range:', meals.length);

      // Group meals by date to count unique days
      const uniqueDays = new Set<string>();
      const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

      meals.forEach(meal => {
        let mealDate = meal.date;
        
        // If no date field, try to extract from createdAt
        if (!mealDate && meal.createdAt) {
          try {
            const timestamp = meal.createdAt.toDate ? meal.createdAt.toDate() : new Date(meal.createdAt);
            mealDate = timestamp.toISOString().split('T')[0];
          } catch {
            return; // Skip this meal if date parsing fails
          }
        }

        if (mealDate) {
          uniqueDays.add(mealDate);
          totals.calories += meal.calories || 0;
          totals.protein += meal.proteinG || 0;
          totals.carbs += meal.carbsG || 0;
          totals.fat += meal.fatG || 0;
        }
      });

      const daysTracked = uniqueDays.size;
      const isRestWeek = daysTracked === 0;

      // Calculate health score (pass daily targets, not weekly)
      const healthScore = userPlan ? calculateHealthScore(
        totals.calories,
        totals.protein,
        totals.carbs,
        totals.fat,
        daysTracked,
        userPlan.calories,  // Daily target
        userPlan.protein,   // Daily target
        userPlan.carbs,     // Daily target
        userPlan.fat        // Daily target
      ) : 0;

      // Debug logging
      console.log('[Analytics] Week Calculation:', {
        weekStart,
        weekEnd,
        mealsFound: meals.length,
        daysTracked,
        totalCalories: totals.calories,
        avgCaloriesPerDay: daysTracked > 0 ? Math.round(totals.calories / daysTracked) : 0,
        targetCaloriesPerDay: userPlan?.calories || 0,
        healthScore,
      });

      return {
        weekStart,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        daysTracked,
        isRestWeek,
        healthScore,
        weekLabel: getWeekLabel(weekStart)
      };
    } catch (error) {
      console.warn('Error fetching weekly nutrition:', error);
      return {
        weekStart,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        daysTracked: 0,
        isRestWeek: false,
        healthScore: 0,
        weekLabel: getWeekLabel(weekStart)
      };
    }
  };

  // Fetch daily nutrition data for chart
  const fetchDailyNutrition = async () => {
    if (!userId || !recentMeals) return;

    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
      const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      // Use Convex data
      const meals = recentMeals.filter((meal: any) => meal.date >= cutoffDate);

      // Group by date and calculate daily totals
      const dailyMap = new Map<string, DailyNutrition>();
      
      meals.forEach(meal => {
        const date = meal.date;
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          });
        }
        
        const daily = dailyMap.get(date)!;
        daily.calories += meal.calories || 0;
        daily.protein += meal.proteinG || 0;
        daily.carbs += meal.carbsG || 0;
        daily.fat += meal.fatG || 0;
      });

      const dailyArray = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setDailyData(dailyArray);
    } catch (error) {
      console.error('Error fetching daily nutrition:', error);
    }
  };

  // Debounced data loading function
  const debouncedLoadData = useCallback(async () => {
    if (!userId || !recentMeals) {
      setLoading(false);
      return;
    }
    
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) {
      return; // Still in cooldown period
    }

    setLastFetchTime(now);
    
    try {
      const weekStart = getWeekStart();
      const weekEnd = getWeekEnd();
      const weekData = await fetchWeeklyNutrition(weekStart, weekEnd);
      setCurrentWeek(weekData);
      setLoading(false);
    } catch (error) {
      console.warn('Error in debounced data loading:', error);
      setLoading(false);
    }
  }, [userId, recentMeals, userPlan, lastFetchTime]);

  // Load current week data with debouncing
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      debouncedLoadData();
    }, 300); // 300ms debounce delay

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [debouncedLoadData]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Load weekly history
  useEffect(() => {
    const loadWeeklyHistory = async () => {
      if (!userId || !recentMeals) return;
      
      const history: WeeklyNutrition[] = [];
      
      // Get last 4 weeks
      for (let i = 1; i <= 4; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const weekStart = getWeekStart(date);
        const weekEnd = getWeekEnd(date);
        const weekData = await fetchWeeklyNutrition(weekStart, weekEnd);
        history.push(weekData);
      }
      
      setWeeklyHistory(history);
    };

    if (userId && recentMeals && userPlan) {
      loadWeeklyHistory();
      fetchDailyNutrition();
    }
  }, [userId, recentMeals, userPlan]);

  // Load user profile and plan  
  const userData = useQuery(api.users.get, userId ? { userId } : "skip");
  
  useEffect(() => {
    if (!userData) return;
    
    const profile = userData.profile || {};
    const weight = Number(profile.weight || profile.currentWeight || 0);
    const desired = Number(profile.desiredWeight || userData.plan?.desiredWeight || 0);
    const height = Number(profile.height || 0);
    const plan = userData.plan || null;
    
    if (!isNaN(weight)) setCurrentWeight(weight);
    if (!isNaN(desired)) setGoalWeight(desired);
    if (!isNaN(height)) setHeightCm(height);
    if (plan) setUserPlan(plan);
  }, [userData]);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [logInput, setLogInput] = useState('');
  const [saving, setSaving] = useState(false);

  const openGoalModal = () => {
    setGoalInput(String(goalWeight || ''));
    setIsGoalModalOpen(true);
  };

  const openLogModal = () => {
    // Check if user can log weight
    if (canLogWeightCheck && !canLogWeightCheck.canLog) {
      const daysRemaining = canLogWeightCheck.daysRemaining || 0;
      const nextDate = canLogWeightCheck.nextAllowedDate 
        ? new Date(canLogWeightCheck.nextAllowedDate).toLocaleDateString()
        : 'soon';
      
      Alert.alert(
        'Weight Logging Restricted',
        `You can only log your weight once per week.\n\nYou logged your weight recently and can log again in ${daysRemaining} day(s).\n\nNext allowed: ${nextDate}`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    setLogInput(String(currentWeight || ''));
    setIsLogModalOpen(true);
  };

  const saveGoalWeight = async () => {
    if (!userId) {
      console.warn('No user ID');
      return;
    }
    
    const desiredWeight = parseFloat(goalInput || '0');
    
    if (desiredWeight <= 0 || isNaN(desiredWeight)) {
      console.warn('Invalid goal weight:', goalInput);
      return;
    }
    
    setSaving(true);
    try {
      console.log('Saving goal weight:', desiredWeight, 'for user:', userId);
      
      await updateDesiredWeightMutation({
        userId,
        desiredWeight,
      });
      
      // Update local state immediately
      setGoalWeight(desiredWeight);
      
      console.log('Goal weight saved successfully:', desiredWeight);
      setIsGoalModalOpen(false);
    } catch (e) {
      console.error('Failed to save goal weight:', e);
      // Keep modal open so user can try again
    } finally {
      setSaving(false);
    }
  };

  const logCurrentWeight = async () => {
    if (!userId) {
      console.warn('No user ID');
      return;
    }
    
    const weight = parseFloat(logInput || '0');
    
    if (weight <= 0 || isNaN(weight)) {
      console.warn('Invalid weight:', logInput);
      return;
    }
    
    setSaving(true);
    try {
      console.log('Logging weight:', weight, 'for user:', userId);
      
      await logWeightMutation({
        userId,
        weight,
      });
      
      // Update local state immediately
      setCurrentWeight(weight);
      
      console.log('Weight logged successfully:', weight);
      setIsLogModalOpen(false);
    } catch (e: any) {
      console.error('Failed to log weight:', e);
      const errorMessage = e?.message || String(e);
      
      // Show user-friendly error message
      Alert.alert(
        'Failed to Save Weight',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
      
      // Close modal if it's a restriction error (once per week)
      if (errorMessage.includes('can log weight again')) {
        setIsLogModalOpen(false);
      }
      // Otherwise keep modal open so user can try again
    } finally {
      setSaving(false);
    }
  };

  // Refresh data with debouncing
  const onRefresh = async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setRefreshing(true);
    try {
      // Use debounced approach for refresh
      await debouncedLoadData();
      
      // Reload weekly history with cooldown check
      const now = Date.now();
      if (now - lastFetchTime >= FETCH_COOLDOWN) {
        const history: WeeklyNutrition[] = [];
        for (let i = 1; i <= 4; i++) {
          const date = new Date();
          date.setDate(date.getDate() - (i * 7));
          const weekStart = getWeekStart(date);
          const weekEnd = getWeekEnd(date);
          const weekData = await fetchWeeklyNutrition(weekStart, weekEnd);
          history.push(weekData);
        }
        setWeeklyHistory(history);
        
        await fetchDailyNutrition();
      }
    } catch (error) {
      console.warn('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get selected week data based on timeframe
  const getSelectedWeekData = (): WeeklyNutrition | null => {
    if (selectedTimeframe === 'This Week') return currentWeek;
    const index = timeframes.indexOf(selectedTimeframe) - 1;
    return index >= 0 && index < weeklyHistory.length ? weeklyHistory[index] : null;
  };

  const selectedWeekData = getSelectedWeekData();

  // Calculate goal achievement percentage
  const getGoalAchievement = (): number => {
    if (!selectedWeekData || !userPlan) return 0;
    const targetCalories = userPlan.calories * 7;
    if (targetCalories === 0) return 0;
    return Math.min(100, Math.round((selectedWeekData.totalCalories / targetCalories) * 100));
  };

  // Get health score color
  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    if (score >= 40) return '#FF6B35';
    return '#FF3B30';
  };

  // Get health score emoji
  const getHealthScoreEmoji = (score: number): string => {
    if (score >= 80) return '🌟';
    if (score >= 60) return '👍';
    if (score >= 40) return '😐';
    return '😔';
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#772CE8" />
        <Text style={styles.loadingText}>Loading your nutrition data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh} disabled={refreshing}>
          <FontAwesome name="refresh" size={20} color="#772CE8" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#772CE8']} />
        }
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
        scrollEventThrottle={16}
      >
        {/* Weekly Nutrition Overview */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Weekly Nutrition</Text>
            <View style={styles.goalAchievement}>
              <Text style={styles.progressPercentage}>
                {getGoalAchievement()}% Goal achieved
              </Text>
              {userPlan && (
                <Text style={styles.targetCalories}>
                  Target: {userPlan.calories * 7} cal/week
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.timeframeTabs}>
            {timeframes.map(timeframe => (
              <TouchableOpacity 
                key={timeframe} 
                style={[styles.timeframeTab, selectedTimeframe === timeframe && styles.timeframeTabActive]} 
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text style={[styles.timeframeTabText, selectedTimeframe === timeframe && styles.timeframeTabTextActive]}>
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedWeekData && (
            <View style={styles.weeklyStats}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedWeekData.totalCalories.toFixed(0)}</Text>
                  <Text style={styles.statLabel}>Total Calories</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{selectedWeekData.daysTracked}</Text>
                  <Text style={styles.statLabel}>Days Tracked</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.healthScoreContainer}>
                    <Text style={styles.healthScoreEmoji}>{getHealthScoreEmoji(selectedWeekData.healthScore)}</Text>
                    <Text style={[styles.statValue, { color: getHealthScoreColor(selectedWeekData.healthScore) }]}>
                      {selectedWeekData.healthScore}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>Health Score</Text>
                </View>
              </View>

              {selectedWeekData.isRestWeek ? (
                <View style={styles.restWeekCard}>
                  <FontAwesome name="bed" size={24} color="#666" />
                  <Text style={styles.restWeekText}>Rest Week - Take a break from tracking</Text>
                  <Text style={styles.restWeekSubtext}>Your body needs recovery time</Text>
                </View>
              ) : (
                <View style={styles.macrosBreakdown}>
                  <Text style={styles.macrosTitle}>Macronutrients Breakdown</Text>
                  <View style={styles.macroItem}>
                    <View style={styles.macroHeader}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroValue}>{selectedWeekData.totalProtein.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.macroBar}>
                      <View style={[styles.macroFill, { 
                        width: `${Math.min(100, (selectedWeekData.totalProtein / (userPlan?.protein || 1) / 7) * 100)}%`,
                        backgroundColor: '#F97373'
                      }]} />
                    </View>
                    {userPlan && (
                      <Text style={styles.macroTarget}>Target: {userPlan.protein * 7}g/week</Text>
                    )}
                  </View>
                  <View style={styles.macroItem}>
                    <View style={styles.macroHeader}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroValue}>{selectedWeekData.totalCarbs.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.macroBar}>
                      <View style={[styles.macroFill, { 
                        width: `${Math.min(100, (selectedWeekData.totalCarbs / (userPlan?.carbs || 1) / 7) * 100)}%`,
                        backgroundColor: '#F59E0B'
                      }]} />
                    </View>
                    {userPlan && (
                      <Text style={styles.macroTarget}>Target: {userPlan.carbs * 7}g/week</Text>
                    )}
                  </View>
                  <View style={styles.macroItem}>
                    <View style={styles.macroHeader}>
                      <Text style={styles.macroLabel}>Fat</Text>
                      <Text style={styles.macroValue}>{selectedWeekData.totalFat.toFixed(1)}g</Text>
                    </View>
                    <View style={styles.macroBar}>
                      <View style={[styles.macroFill, { 
                        width: `${Math.min(100, (selectedWeekData.totalFat / (userPlan?.fat || 1) / 7) * 100)}%`,
                        backgroundColor: '#3B82F6'
                      }]} />
                    </View>
                    {userPlan && (
                      <Text style={styles.macroTarget}>Target: {userPlan.fat * 7}g/week</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Weight Goal Section */}
        <View style={styles.section}>
          <View style={styles.weightHeader}>
            <Text style={styles.sectionTitle}>Weight Goal</Text>
            <TouchableOpacity style={styles.updateButton} onPress={openGoalModal}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.weightValue}>{goalWeight} kg</Text>
          <Text style={styles.sectionTitle}>Current Weight</Text>
          <Text style={styles.weightValue}>{currentWeight} kg</Text>
          {goalWeight > 0 && currentWeight > 0 && (
            <View style={styles.weightProgress}>
              <Text style={styles.weightProgressText}>
                {goalWeight > currentWeight ? 'Gain' : 'Lose'}: {Math.abs(goalWeight - currentWeight).toFixed(1)} kg
              </Text>
            </View>
          )}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>Try to update once a week so we can adjust your plan.</Text>
          </View>
          <TouchableOpacity style={styles.logWeightButton} onPress={openLogModal}>
            <Text style={styles.logWeightButtonText}>Log weight</Text>
          </TouchableOpacity>
        </View>

        {/* BMI Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your BMI</Text>
          <View style={styles.bmiCard}>
            <View style={styles.bmiHeader}>
              <Text style={styles.bmiText}>Your weight is</Text>
              <View style={[styles.bmiLabel, { backgroundColor: bmiCategory.color }]}>
                <Text style={styles.bmiLabelText}>{bmiCategory.label}</Text>
              </View>
              <FontAwesome name="info-circle" size={20} color="#666" />
            </View>
            <Text style={styles.bmiValue}>{currentBMI || 0}</Text>
            <View style={styles.bmiScale}>
              <View style={styles.bmiBar}>
                {BMICategories.map((category) => (
                  <View key={category.label} style={[styles.bmiBarSegment, { backgroundColor: category.color, flex: category.range[1] - category.range[0] }]} />
                ))}
                <View style={[styles.bmiMarker, { left: `${Math.max(0, Math.min(100, ((currentBMI - 15) / (40 - 15)) * 100))}%` }]} />
              </View>
              <View style={styles.bmiLegend}>
                {BMICategories.map(category => (
                  <View key={category.label} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                    <Text style={styles.legendText}>{category.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Progress Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Progress Trend</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartYLabel}>100%</Text>
              <Text style={styles.chartYLabel}>75%</Text>
              <Text style={styles.chartYLabel}>50%</Text>
              <Text style={styles.chartYLabel}>25%</Text>
              <Text style={styles.chartYLabel}>0%</Text>
            </View>
            <View style={styles.chartArea}>
              <View style={styles.chartGrid}>
                {[0, 1, 2, 3, 4].map(i => (
                  <View key={i} style={styles.chartGridLine} />
                ))}
              </View>
              <View style={styles.chartDataPoints}>
                {weeklyHistory.slice().reverse().map((week, index) => (
                  <View key={week.weekStart} style={styles.chartDataPoint}>
                    <View style={[styles.dataPoint, { 
                      backgroundColor: getHealthScoreColor(week.healthScore)
                    }]} />
                    <Text style={styles.dataPointValue}>{week.healthScore}%</Text>
                    <Text style={styles.dataPointLabel}>{week.weekLabel}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          {weeklyHistory.length === 0 && (
            <View style={styles.emptyChart}>
              <FontAwesome name="bar-chart" size={48} color="#ccc" />
              <Text style={styles.emptyChartText}>No data available yet</Text>
              <Text style={styles.emptyChartSubtext}>Start tracking your meals to see progress</Text>
            </View>
          )}
        </View>

        {/* Bottom Spacer for iOS */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Goal Weight Modal */}
      <Modal visible={isGoalModalOpen} transparent animationType="slide" onRequestClose={() => setIsGoalModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Update weight goal</Text>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Goal (kg)</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    keyboardType="decimal-pad"
                    placeholder="e.g., 70"
                    placeholderTextColor="#999"
                    value={goalInput} 
                    onChangeText={setGoalInput}
                    autoFocus
                    selectTextOnFocus
                  />
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalSecondary} onPress={() => setIsGoalModalOpen(false)}>
                    <Text style={styles.modalSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalPrimary, (saving || !goalInput) && { opacity: 0.5 }]} 
                    onPress={saveGoalWeight} 
                    disabled={saving || !goalInput}
                  >
                    <Text style={styles.modalPrimaryText}>{saving ? 'Saving…' : 'Save'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Log Weight Modal */}
      <Modal visible={isLogModalOpen} transparent animationType="slide" onRequestClose={() => setIsLogModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Log current weight</Text>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Weight (kg)</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    keyboardType="decimal-pad"
                    placeholder="e.g., 75"
                    placeholderTextColor="#999"
                    value={logInput} 
                    onChangeText={setLogInput}
                    autoFocus
                    selectTextOnFocus
                  />
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalSecondary} onPress={() => setIsLogModalOpen(false)}>
                    <Text style={styles.modalSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalPrimary, (saving || !logInput) && { opacity: 0.5 }]} 
                    onPress={logCurrentWeight} 
                    disabled={saving || !logInput}
                  >
                    <Text style={styles.modalPrimaryText}>{saving ? 'Saving…' : 'Save'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: {
    paddingBottom: 100, // Extra padding for iOS scroll
  },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  refreshButton: {
    padding: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  progressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  progressPercentage: { fontSize: 14, color: '#666' },
  goalAchievement: { alignItems: 'flex-end' },
  targetCalories: { fontSize: 12, color: '#666', marginTop: 4 },
  timeframeTabs: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 4 },
  timeframeTab: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignItems: 'center' },
  timeframeTabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  timeframeTabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  timeframeTabTextActive: { color: '#000', fontWeight: '600' },
  weeklyStats: { marginTop: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  healthScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  healthScoreEmoji: { fontSize: 20 },
  restWeekCard: { 
    backgroundColor: '#f8f9fa', 
    padding: 20, 
    borderRadius: 8, 
    alignItems: 'center',
    flexDirection: 'column',
    gap: 8
  },
  restWeekText: { fontSize: 16, color: '#666', textAlign: 'center', fontWeight: '500' },
  restWeekSubtext: { fontSize: 12, color: '#999', textAlign: 'center' },
  macrosBreakdown: { marginTop: 16 },
  macrosTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  macroItem: { marginBottom: 12 },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  macroLabel: { fontSize: 12, color: '#666' },
  macroValue: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  macroBar: { 
    height: 8, 
    backgroundColor: '#f0f0f0', 
    borderRadius: 4, 
    marginBottom: 4,
    overflow: 'hidden'
  },
  macroFill: { height: '100%', borderRadius: 4 },
  macroTarget: { fontSize: 12, color: '#666', marginTop: 4 },
  weightHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  updateButton: { backgroundColor: '#772CE8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  updateButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  weightValue: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 16 },
  weightProgress: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  weightProgressText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  infoCard: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16 },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20 },
  logWeightButton: { backgroundColor: '#333', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  logWeightButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bmiCard: { padding: 16 },
  bmiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  bmiText: { fontSize: 16, color: '#333' },
  bmiLabel: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  bmiLabelText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  bmiValue: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 16 },
  bmiScale: { marginTop: 16 },
  bmiBar: { height: 8, borderRadius: 4, flexDirection: 'row', position: 'relative', marginBottom: 12 },
  bmiBarSegment: { height: '100%' },
  bmiMarker: { position: 'absolute', top: -4, width: 4, height: 16, backgroundColor: '#000', borderRadius: 2 },
  bmiLegend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendColor: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: '#666' },
  chartContainer: { 
    flexDirection: 'row', 
    height: 200,
    marginTop: 16,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 16,
  },
  chartYAxis: { 
    width: 60, 
    justifyContent: 'space-between', 
    paddingRight: 12,
    paddingVertical: 8,
  },
  chartYLabel: { 
    fontSize: 12, 
    color: '#666', 
    textAlign: 'right',
    height: 32,
    lineHeight: 32,
  },
  chartArea: { 
    flex: 1, 
    position: 'relative',
    paddingVertical: 8,
  },
  chartGrid: { 
    position: 'absolute', 
    top: 8, 
    left: 0, 
    right: 0, 
    bottom: 8,
  },
  chartGridLine: { 
    height: 1, 
    backgroundColor: '#f0f0f0', 
    marginTop: 32,
  },
  chartDataPoints: { 
    position: 'absolute', 
    top: 8, 
    left: 0, 
    right: 0, 
    bottom: 8, 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'flex-end', 
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  chartDataPoint: { 
    alignItems: 'center',
    minWidth: 40,
  },
  dataPoint: { 
    width: 12, 
    height: 12, 
    borderRadius: 6, 
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dataPointValue: { 
    fontSize: 11, 
    color: '#333', 
    fontWeight: '600',
    textAlign: 'center',
  },
  dataPointLabel: { 
    fontSize: 10, 
    color: '#666', 
    marginTop: 4,
    textAlign: 'center',
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 18,
    color: '#666',
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 100, // Extra space at bottom for iOS
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#000', marginBottom: 8 },
  modalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modalLabel: { fontSize: 14, color: '#333' },
  modalInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, minWidth: 120, textAlign: 'right', color: '#000' },
  modalActions: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  modalSecondary: { borderWidth: 1, borderColor: '#000', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 20, width: '48%', alignItems: 'center' },
  modalSecondaryText: { color: '#000', fontWeight: '700' },
  modalPrimary: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 20, width: '48%', alignItems: 'center' },
  modalPrimaryText: { color: '#fff', fontWeight: '700' },
});
