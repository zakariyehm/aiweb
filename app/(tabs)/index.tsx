import CardComponent from '@/components/homeComponents/cardComponent';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import useDailyNutrition from '@/hooks/useDailyNutrition';
import useStreak from '@/hooks/useStreak';
import { FontAwesome } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState<'today' | 'yesterday'>('today');
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<null | { calories: number; protein: number; carbs: number; fat: number }>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const [saving, setSaving] = useState(false);

  // Helper function to format nutritional values to one decimal place maximum
  const formatNutritionValue = (value: number): string => {
    if (value === 0) return '0g';
    // Round to 1 decimal place and remove trailing .0 if it's a whole number
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}g` : `${rounded}g`;
  };

  // Get user session
  const { userSession, isLoggedIn } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;

  // Fetch user data (reactive)
  const userData = useQuery(api.users.get, userId ? { userId } : "skip");

  // Update plan mutation
  const updatePlanMutation = useMutation(api.users.updatePlan);

  // Redirect to onboarding if not logged in
  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace('/onboarding/welcome');
    }
  }, [isLoggedIn]);

  // Update local plan state when user data changes
  useEffect(() => {
    if (userData?.plan) {
      const { calories = 0, protein = 0, carbs = 0, fat = 0 } = userData.plan;
      setPlan({ calories, protein, carbs, fat });
    } else {
      setPlan(null);
    }
  }, [userData]);

  const openEdit = () => {
    if (plan) {
      setEditCalories(String(plan.calories ?? ''));
      setEditProtein(String(plan.protein ?? ''));
      setEditCarbs(String(plan.carbs ?? ''));
      setEditFat(String(plan.fat ?? ''));
    }
    setIsEditOpen(true);
  };

  const saveEdit = async () => {
    if (!userId || !userData?.plan) return;
    const calories = parseInt(editCalories || '0', 10);
    const protein = parseInt(editProtein || '0', 10);
    const carbs = parseInt(editCarbs || '0', 10);
    const fat = parseInt(editFat || '0', 10);
    setSaving(true);
    try {
      // Include all existing plan fields to avoid overwriting them
      await updatePlanMutation({
        userId,
        plan: { 
          calories, 
          protein, 
          carbs, 
          fat,
          bmr: userData.plan.bmr,
          tdee: userData.plan.tdee,
          goal: userData.plan.goal,
          currentWeight: userData.plan.currentWeight,
          desiredWeight: userData.plan.desiredWeight,
        },
      });
      
      // Update local state immediately (optimistic update)
      setPlan({ calories, protein, carbs, fat });
      
      console.log('Updated plan', { calories, protein, carbs, fat });
      
      // Wait a bit for Convex to propagate before closing
      setTimeout(() => {
        setIsEditOpen(false);
      }, 300);
    } catch (e) {
      console.error('Failed to save edited plan:', e);
    } finally {
      setSaving(false);
    }
  };

  // Removed day selector pills (F S S M T W T)
  // Use Convex hooks
  const { 
    recentlyEaten, 
    dailyTotals,
    todayData,
    yesterdayData,
    loading,
    getProgressPercentages,
  } = useDailyNutrition(userId, selectedTab);
  const { count: streakCount, atRisk: streakAtRisk, broken: streakBroken } = useStreak(userId);

  // Debug logging for iOS
  useEffect(() => {
    console.log('[iOS Debug] Home screen data:', {
      selectedTab,
      todayDataLength: todayData.recentlyEaten.length,
      yesterdayDataLength: yesterdayData.recentlyEaten.length,
      todayData: todayData.recentlyEaten.map(m => ({ id: m._id, title: m.title, date: m.date })),
      yesterdayData: yesterdayData.recentlyEaten.map(m => ({ id: m._id, title: m.title, date: m.date }))
    });
  }, [selectedTab, todayData, yesterdayData]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator size="large" color="#772CE8" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Loading your nutrition data...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header and tabs */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <View style={styles.headerLeft}>
          <Image source={require('@/assets/images/pnglogo.png')} style={styles.logoImage} />
          <Text style={styles.appName}>Nutro AI</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[
            styles.streakPill,
            streakBroken ? { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' } : streakAtRisk ? { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' } : null,
          ]}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={[styles.streakNum, streakBroken ? { color: '#B91C1C' } : streakAtRisk ? { color: '#B45309' } : null]}>{streakCount}</Text>
          </View>
        </View>
      </View>
      <View style={styles.tabsRow}>
        <TouchableOpacity onPress={() => setSelectedTab('today')}>
          <Text style={[styles.tabLabel, selectedTab === 'today' && styles.tabLabelActive]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('yesterday')}>
          <Text style={[styles.tabLabel, selectedTab === 'yesterday' && styles.tabLabelActive]}>Yesterday</Text>
        </TouchableOpacity>
      </View>

      {/* ScrollView - now only contains the scrollable content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        <View style={styles.cardWrapper}>
          <CardComponent
            caloriesLeft={selectedTab === 'today' 
              ? Math.max(0, (plan?.calories ?? 0) - (todayData.dailyTotals.calories ?? 0))
              : Math.max(0, (plan?.calories ?? 0) - (yesterdayData.dailyTotals.calories ?? 0))
            }
            caloriesProgress={selectedTab === 'today' 
              ? (plan ? Math.min(1, Math.max(0, todayData.dailyTotals.calories / plan.calories)) : 0)
              : (plan ? Math.min(1, Math.max(0, yesterdayData.dailyTotals.calories / plan.calories)) : 0)
            }
            macros={selectedTab === 'today' ? [
              { 
                valueText: `${formatNutritionValue(todayData.dailyTotals.protein)} / ${plan?.protein ?? 0}g`, 
                helper: 'Protein', 
                progress: plan ? Math.min(1, Math.max(0, todayData.dailyTotals.protein / plan.protein)) : 0, 
                color: '#F97373', 
                icon: 'flash' 
              },
              { 
                valueText: `${formatNutritionValue(todayData.dailyTotals.carbs)} / ${plan?.carbs ?? 0}g`, 
                helper: 'Carbs', 
                progress: plan ? Math.min(1, Math.max(0, todayData.dailyTotals.carbs / plan.carbs)) : 0, 
                color: '#F59E0B', 
                icon: 'leaf' 
              },
              { 
                valueText: `${formatNutritionValue(todayData.dailyTotals.fat)} / ${plan?.fat ?? 0}g`, 
                helper: 'Fats', 
                progress: plan ? Math.min(1, Math.max(0, todayData.dailyTotals.fat / plan.fat)) : 0, 
                color: '#3B82F6', 
                icon: 'water' 
              },
            ] : [
              { 
                valueText: `${formatNutritionValue(yesterdayData.dailyTotals.protein)} / ${plan?.protein ?? 0}g`, 
                helper: 'Protein', 
                progress: plan ? Math.min(1, Math.max(0, yesterdayData.dailyTotals.protein / plan.protein)) : 0, 
                color: '#F97373', 
                icon: 'flash' 
              },
              { 
                valueText: `${formatNutritionValue(yesterdayData.dailyTotals.carbs)} / ${plan?.carbs ?? 0}g`, 
                helper: 'Carbs', 
                progress: plan ? Math.min(1, Math.max(0, yesterdayData.dailyTotals.carbs / plan.carbs)) : 0, 
                color: '#F59E0B', 
                icon: 'leaf' 
              },
              { 
                valueText: `${formatNutritionValue(yesterdayData.dailyTotals.fat)} / ${plan?.fat ?? 0}g`, 
                helper: 'Fats', 
                progress: plan ? Math.min(1, Math.max(0, yesterdayData.dailyTotals.fat / plan.fat)) : 0, 
                color: '#3B82F6', 
                icon: 'water' 
              },
            ]}
          />
          {selectedTab === 'today' && (
            <TouchableOpacity style={styles.editButton} onPress={openEdit} disabled={!plan}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.paginationDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.recentlyEatenSection}>
          <Text style={styles.sectionTitle}>
            {selectedTab === 'today' ? 'Recently eaten' : 'Yesterday\'s meals'}
          </Text>
          {(selectedTab === 'today' ? todayData.recentlyEaten : yesterdayData.recentlyEaten).length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                {selectedTab === 'today' 
                  ? 'You haven&apos;t eaten anything today' 
                  : 'No meals recorded yesterday'
                }
              </Text>
              <Text style={styles.emptyDescription}>
                {selectedTab === 'today'
                  ? 'Start tracking today&apos;s meals by taking a quick picture'
                  : 'Yesterday was a rest day - no meals were logged'
                }
              </Text>
              <View style={styles.arrowContainer}>
                <FontAwesome name="arrow-down" size={24} color="#666" style={styles.arrow} />
              </View>
            </View>
          ) : (
            (selectedTab === 'today' ? todayData.recentlyEaten : yesterdayData.recentlyEaten).map((m) => (
              <View key={m._id} style={styles.mealCard}>
                {m.imageUri ? (
                  <View style={styles.mealImageWrap}>
                    <Image source={{ uri: m.imageUri }} style={styles.mealImage} />
                  </View>
                ) : (
                  <View style={[styles.mealImageWrap, { backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }]}>
                    <FontAwesome name="cutlery" size={18} color="#9CA3AF" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealTitle} numberOfLines={1}>{m.title || 'Meal'}</Text>
                  <View style={styles.mealRow}><FontAwesome name="fire" size={14} color="#111" /><Text style={styles.mealCal}> {Math.round(m.calories)} kcal</Text></View>
                  <View style={styles.mealMacrosRow}>
                    <Text style={[styles.mealMacro, { color: '#EF4444' }]}>⚡ {formatNutritionValue(m.proteinG)}</Text>
                    <Text style={[styles.mealMacro, { color: '#D97706' }]}>🌾 {formatNutritionValue(m.carbsG)}</Text>
                    <Text style={[styles.mealMacro, { color: '#2563EB' }]}>💧 {formatNutritionValue(m.fatG)}</Text>
                  </View>
                </View>
                <View style={styles.mealTimePill}>
                  <Text style={styles.mealTimeText}>
                    {new Date(m.createdAt?.toDate?.() || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {/* Edit Modal */}
      <Modal visible={isEditOpen} transparent animationType="slide" onRequestClose={() => setIsEditOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit daily recommendation</Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Calories</Text>
              <TextInput style={styles.modalInput} keyboardType="numeric" value={editCalories} onChangeText={setEditCalories} />
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Protein (g)</Text>
              <TextInput style={styles.modalInput} keyboardType="numeric" value={editProtein} onChangeText={setEditProtein} />
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Carbs (g)</Text>
              <TextInput style={styles.modalInput} keyboardType="numeric" value={editCarbs} onChangeText={setEditCarbs} />
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Fats (g)</Text>
              <TextInput style={styles.modalInput} keyboardType="numeric" value={editFat} onChangeText={setEditFat} />
            </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalSecondary} onPress={() => setIsEditOpen(false)}>
                    <Text style={styles.modalSecondaryText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalPrimary} onPress={saveEdit} disabled={saving}>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakFire: {
    fontSize: 14,
    marginRight: 6,
  },
  streakNum: {
    color: '#111',
    fontWeight: '700',
    fontSize: 14,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 18,
    color: '#8A8A8A',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#000',
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  // removed date selector styles
  // calorieCard removed in favor of CardComponent
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  editButtonText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
  calorieLeft: {
    flex: 1,
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  calorieRight: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressArc: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#333',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  progressIcon: {
    position: 'absolute',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  macroCard: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  macroNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  macroIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    marginHorizontal: 3,
  },
  dailyTotalsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  totalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  totalCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  recentlyEatenSection: {
    paddingHorizontal: 20,
    marginBottom: 100, // Space for FAB
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImageWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  mealImage: { width: '100%', height: '100%' },
  mealTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  mealRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  mealCal: { color: '#111', fontSize: 14 },
  mealMacrosRow: { flexDirection: 'row', gap: 16, marginTop: 6 },
  mealMacro: { fontSize: 13, fontWeight: '600' },
  mealTimePill: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 10,
  },
  mealTimeText: { color: '#111', fontSize: 12, fontWeight: '600' },
  arrowContainer: {
    marginTop: 15,
  },
  arrow: {
    transform: [{ rotate: '45deg' }],
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 120,
    textAlign: 'right',
    color: '#000',
  },
  modalActions: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalSecondary: {
    borderWidth: 1,
    borderColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: '#000',
    fontWeight: '700',
  },
  modalPrimary: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    width: '48%',
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
});