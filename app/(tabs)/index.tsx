import { auth, db } from '@/lib/firebase';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(5);
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

  const days = [
    { day: 'F', date: '01' },
    { day: 'S', date: '02' },
    { day: 'S', date: '03' },
    { day: 'M', date: '04' },
    { day: 'T', date: '05' },
    { day: 'W', date: '06' },
    { day: 'T', date: '07' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header - now outside ScrollView so it doesn't scroll */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <View style={styles.headerLeft}>
          <FontAwesome name="apple" size={24} color="#000" />
          <Text style={styles.appName}>Cal AI</Text>
        </View>
        <View style={styles.headerRight}>
          <FontAwesome name="fire" size={20} color="#FF6B35" />
          <Text style={styles.streakText}>0</Text>
        </View>
      </View>

      {/* ScrollView - now only contains the scrollable content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.dateSelector}>
          {days.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCircle,
                selectedDate === index && styles.selectedDateCircle
              ]}
              onPress={() => setSelectedDate(index)}
            >
              <Text style={[
                styles.dayText,
                selectedDate === index && styles.selectedDayText
              ]}>
                {item.day}
              </Text>
              <Text style={[
                styles.dateText,
                selectedDate === index && styles.selectedDateText
              ]}>
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.calorieCard}>
          <View style={styles.calorieLeft}>
            <Text style={styles.calorieNumber}>{plan?.calories ?? 0}</Text>
            <Text style={styles.calorieLabel}>{loadingPlan ? 'Loading...' : 'Calories target'}</Text>
          </View>
          <View style={styles.calorieRight}>
            <View style={styles.progressCircle}>
              <View style={styles.progressArc} />
              <FontAwesome name="fire" size={24} color="#000" style={styles.progressIcon} />
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={openEdit} disabled={!plan}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.macroContainer}>
          <View style={styles.macroCard}>
            <Text style={styles.macroNumber}>{plan?.protein ?? 0}g</Text>
            <Text style={styles.macroLabel}>{loadingPlan ? 'Loading...' : 'Protein target'}</Text>
            <View style={[styles.macroIcon, { backgroundColor: '#FF6B6B' }]}>
              <FontAwesome name="bolt" size={16} color="white" />
            </View>
          </View>
          
          <View style={styles.macroCard}>
            <Text style={styles.macroNumber}>{plan?.carbs ?? 0}g</Text>
            <Text style={styles.macroLabel}>{loadingPlan ? 'Loading...' : 'Carbs target'}</Text>
            <View style={[styles.macroIcon, { backgroundColor: '#8B4513' }]}>
              <FontAwesome name="leaf" size={16} color="white" />
            </View>
          </View>
          
          <View style={styles.macroCard}>
            <Text style={styles.macroNumber}>{plan?.fat ?? 0}g</Text>
            <Text style={styles.macroLabel}>{loadingPlan ? 'Loading...' : 'Fats target'}</Text>
            <View style={[styles.macroIcon, { backgroundColor: '#4A90E2' }]}>
              <FontAwesome name="tint" size={16} color="white" />
            </View>
          </View>
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
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateCircle: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedDayText: {
    color: '#fff',
  },
  dateText: {
    fontSize: 10,
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
  },
  calorieCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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