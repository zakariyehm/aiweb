import CardComponent from '@/components/homeComponents/cardComponent';
import useDailyProgress from '@/hooks/useDailyProgress';
import useStreak from '@/hooks/useStreak';
import { auth, db } from '@/lib/firebase';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [selectedTab, setSelectedTab] = useState<'today' | 'yesterday'>('today');
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<null | { calories: number; protein: number; carbs: number; fat: number }>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to onboarding if signed out
        try { router.replace('/onboarding/welcome'); } catch {}
        setPlan(null);
        return;
      }
      const ref = doc(db, 'users', user.uid);
      const unsubDoc = onSnapshot(ref, (snap) => {
        const data: any = snap.data() || {};
        if (data?.plan) {
          const { calories = 0, protein = 0, carbs = 0, fat = 0 } = data.plan || {};
          setPlan({ calories, protein, carbs, fat });
        } else {
          setPlan(null);
        }
        setLoadingPlan(false);
      }, () => {
        setLoadingPlan(false);
      });
      return () => unsubDoc();
    });
    return unsubAuth;
  }, []);

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
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const calories = parseInt(editCalories || '0', 10);
    const protein = parseInt(editProtein || '0', 10);
    const carbs = parseInt(editCarbs || '0', 10);
    const fat = parseInt(editFat || '0', 10);
    setSaving(true);
    try {
      const ref = doc(db, 'users', uid);
      await setDoc(ref, { plan: { calories, protein, carbs, fat } } as any, { merge: true } as any);
      console.log('Updated plan', { calories, protein, carbs, fat });
      setIsEditOpen(false);
    } catch (e) {
      console.error('Failed to save edited plan:', e);
    } finally {
      setSaving(false);
    }
  };

  // Removed day selector pills (F S S M T W T)

  const uid = auth.currentUser?.uid;
  const { totals, percents } = useDailyProgress(uid, plan);
  const { count: streakCount, atRisk: streakAtRisk, broken: streakBroken } = useStreak(uid);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header and tabs */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <View style={styles.headerLeft}>
          <FontAwesome name="apple" size={24} color="#000" />
          <Text style={styles.appName}>Cal AI</Text>
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
            caloriesLeft={Math.max(0, (plan?.calories ?? 0) - (totals.calories ?? 0))}
            caloriesProgress={percents.calories}
            macros={[
              { valueText: `${plan?.protein ?? 0}g`, helper: 'Protein target', progress: percents.protein, color: '#FF6B6B', icon: 'flash' },
              { valueText: `${plan?.carbs ?? 0}g`, helper: 'Carbs target', progress: percents.carbs, color: '#8B4513', icon: 'leaf' },
              { valueText: `${plan?.fat ?? 0}g`, helper: 'Fats target', progress: percents.fat, color: '#4A90E2', icon: 'water' },
            ]}
          />
          <TouchableOpacity style={styles.editButton} onPress={openEdit} disabled={!plan}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.paginationDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.recentlyEatenSection}>
          <Text style={styles.sectionTitle}>Recently eaten</Text>
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>You haven't uploaded any food</Text>
            <Text style={styles.emptyDescription}>
              Start tracking today's meals by taking a quick pictures
            </Text>
            <View style={styles.arrowContainer}>
              <FontAwesome name="arrow-down" size={24} color="#666" style={styles.arrow} />
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Edit Modal */}
      <Modal visible={isEditOpen} transparent animationType="slide" onRequestClose={() => setIsEditOpen(false)}>
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