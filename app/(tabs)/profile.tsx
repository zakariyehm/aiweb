import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import useStreak from '@/hooks/useStreak';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UserProfile {
  firstName?: string;
  age?: string;
  height?: string;
  weight?: string;
  gender?: string;
  workouts?: string;
  goal?: string;
  desiredWeight?: string;
  specificGoal?: string;
  email?: string;
}

interface NutritionPlan {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
  goal: string;
  currentWeight: number;
  desiredWeight: number;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get streak data
  const { count: streakCount, atRisk: streakAtRisk, broken: streakBroken } = useStreak(userId);
  
  // Fetch user data (reactive)
  const userData = useQuery(api.users.get, userId ? { userId } : "skip");

  useEffect(() => {
    if (userData) {
      setUserProfile(userData.profile || {});
      setNutritionPlan(userData.plan || null);
      setLoading(false);
    }
  }, [userData]);



  const getGoalEmoji = (goal: string) => {
    switch (goal) {
      case 'Lose Weight': return '📉';
      case 'Gain Weight': return '📈';
      case 'Maintain': return '⚖️';
      default: return '🎯';
    }
  };

  const getWorkoutEmoji = (workouts: string) => {
    switch (workouts) {
      case '0-2 times': return '🛋️';
      case '3-5 times': return '💪';
      case '6+ times': return '🏃‍♂️';
      default: return '🏋️‍♂️';
    }
  };

  const getDietEmoji = (diet: string) => {
    switch (diet) {
      case 'Vegetarian': return '🥦';
      case 'Vegan': return '🌱';
      case 'Keto': return '🥓';
      case 'Paleo': return '🍖';
      case 'Mediterranean': return '🫒';
      default: return '🍽️';
    }
  };

  const getNutritionColor = (type: string) => {
    switch (type) {
      case 'calories': return '#000';
      case 'protein': return '#F87171';
      case 'carbs': return '#FBBF24';
      case 'fat': return '#3B82F6';
      default: return '#FF6B6B';
    }
  };

  // Streak rewards system
  const getStreakReward = (days: number) => {
    if (days >= 180) return { emoji: '🏅', title: 'Legendary Badge', message: '6 MONTHS streak! You earned a legendary badge.' };
    if (days >= 150) return { emoji: '🌟', title: 'Shining Star', message: '5 months streak! You\'re inspiring others.' };
    if (days >= 120) return { emoji: '🥉', title: 'Bronze Medal', message: '4 months streak! You\'re unstoppable.' };
    if (days >= 90) return { emoji: '🥇', title: 'Gold Medal', message: '3 months streak! You\'re among the top users.' };
    if (days >= 60) return { emoji: '🏆', title: 'Trophy', message: '2 months streak! This is champion level.' };
    if (days >= 30) return { emoji: '💕', title: 'Heart', message: '1 month streak! You\'re building a healthy habit.' };
    if (days >= 14) return { emoji: '😍', title: 'Love Eyes', message: '2 weeks strong, we love your commitment.' };
    if (days >= 7) return { emoji: '🤪', title: 'Goofy', message: '1 week streak! Wow, keep it up!' };
    if (days >= 3) return { emoji: '✨', title: 'Spark', message: 'You\'re getting consistent!' };
    if (days >= 1) return { emoji: '🔥', title: 'Fire Start', message: 'You\'ve started your journey!' };
    return { emoji: '🌱', title: 'New Beginning', message: 'Start your healthy journey today!' };
  };

  const currentReward = getStreakReward(streakCount);



  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        removeClippedSubviews={false}
      >
        {/* User Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <FontAwesome name="user" size={40} color="#9CA3AF" />
            </View>
          </View>
          <Text style={styles.userName}>
            {userProfile?.firstName || 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {userProfile?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Basic Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>{userProfile?.age || '--'} years</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>{userProfile?.height || '--'} cm</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>{userProfile?.weight || '--'} kg</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Gender</Text>
              <Text style={styles.statValue}>{userProfile?.gender || '--'}</Text>
            </View>
          </View>
        </View>

        {/* Goals & Preferences */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Goals & Preferences</Text>
          <View style={styles.goalCards}>
            <View style={styles.goalCard}>
              <Text style={styles.goalEmoji}>
                {getGoalEmoji(userProfile?.goal || '')}
              </Text>
              <Text style={styles.goalTitle}>Primary Goal</Text>
              <Text style={styles.goalValue}>
                {userProfile?.goal || 'Not set'}
              </Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalEmoji}>
                {getWorkoutEmoji(userProfile?.workouts || '')}
              </Text>
              <Text style={styles.goalTitle}>Workout Frequency</Text>
              <Text style={styles.goalValue}>
                {userProfile?.workouts || 'Not set'}
              </Text>
            </View>
            <View style={styles.goalCard}>
              <Text style={styles.goalEmoji}>
                {getDietEmoji(userProfile?.specificGoal || '')}
              </Text>
              <Text style={styles.goalTitle}>Diet Preference</Text>
              <Text style={styles.goalValue}>
                {userProfile?.specificGoal || 'Not set'}
              </Text>
            </View>
          </View>
          {userProfile?.desiredWeight && (
            <View style={styles.targetWeightCard}>
              <Text style={styles.targetWeightLabel}>Target Weight</Text>
              <Text style={styles.targetWeightValue}>
                {userProfile.desiredWeight} kg
              </Text>
            </View>
          )}
        </View>

        {/* Daily Nutrition Targets */}
        {nutritionPlan && (
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
            <View style={styles.nutritionGrid}>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('calories') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="flame" size={24} color={getNutritionColor('calories')} />
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <Text style={[styles.nutritionValue, { color: '#000' }]}>{nutritionPlan.calories}</Text>
                <Text style={styles.nutritionUnit}>kcal</Text>
              </View>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('protein') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="flash" size={24} color={getNutritionColor('protein')} />
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <Text style={styles.nutritionValue}>{nutritionPlan.protein}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('carbs') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="leaf" size={24} color={getNutritionColor('carbs')} />
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <Text style={styles.nutritionValue}>{nutritionPlan.carbs}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
              <View style={[styles.nutritionCard, { borderLeftColor: getNutritionColor('fat') }]}>
                <View style={styles.nutritionHeader}>
                  <Ionicons name="water" size={24} color={getNutritionColor('fat')} />
                  <Text style={styles.nutritionLabel}>Fat</Text>
                </View>
                <Text style={styles.nutritionValue}>{nutritionPlan.fat}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
            </View>
            
            {/* BMR & TDEE Info */}
            <View style={styles.metabolicInfo}>
              <View style={styles.metabolicCard}>
                <Text style={styles.metabolicLabel}>BMR</Text>
                <Text style={styles.metabolicValue}>{nutritionPlan.bmr} kcal/day</Text>
                <Text style={styles.metabolicDescription}>Basal Metabolic Rate</Text>
              </View>
              <View style={styles.metabolicCard}>
                <Text style={styles.metabolicLabel}>TDEE</Text>
                <Text style={styles.metabolicValue}>{nutritionPlan.tdee} kcal/day</Text>
                <Text style={styles.metabolicDescription}>Total Daily Energy Expenditure</Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress Tracking Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Progress Tracking</Text>
          
          {/* Enhanced Streak Section */}
          <View style={styles.streakMainCard}>
            <Text style={styles.streakMainTitle}>
              You have a Streak going for 🔥 <Text style={styles.streakHighlight}>{streakCount}</Text> days
            </Text>
            <Text style={styles.streakDescription}>
              A Streak unlocks when you log your meals on consecutive days. Keep tracking to upgrade your Streak badge. 
              {/* <Text style={styles.learnMoreLink}> Learn more</Text> */}
            </Text>
          </View>

          {/* Streak Progression Badges */}
          <View style={styles.streakBadgesSection}>
            <Text style={styles.badgesTitle}>Streak Badges</Text>
            <View style={styles.badgesContainer}>
              <View style={styles.badgeItem}>
                <Text style={[styles.badgeEmoji, streakCount >= 3 && styles.badge3d]}>🔥</Text>
                <Text style={[styles.badgeText, streakCount >= 3 && styles.badgeText3d]}>3d</Text>
              </View>
              <View style={styles.badgeConnector} />
              <View style={styles.badgeItem}>
                <Text style={[styles.badgeEmoji, streakCount >= 10 && styles.badge10d]}>🔥</Text>
                <Text style={[styles.badgeText, streakCount >= 10 && styles.badgeText10d]}>10d</Text>
              </View>
              <View style={styles.badgeConnector} />
              <View style={styles.badgeItem}>
                <Text style={[styles.badgeEmoji, streakCount >= 30 && styles.badge30d]}>🔥</Text>
                <Text style={[styles.badgeText, streakCount >= 30 && styles.badgeText30d]}>30d</Text>
              </View>
              <View style={styles.badgeConnector} />
              <View style={styles.badgeItem}>
                <Text style={[styles.badgeEmoji, streakCount >= 100 && styles.badge100d]}>🔥</Text>
                <Text style={[styles.badgeText, streakCount >= 100 && styles.badgeText100d]}>100d</Text>
              </View>
              <View style={styles.badgeConnector} />
              <View style={styles.badgeItem}>
                <Text style={[styles.badgeEmoji, streakCount >= 200 && styles.badge200d]}>🔥</Text>
                <Text style={[styles.badgeText, streakCount >= 200 && styles.badgeText200d]}>200d</Text>
              </View>
            </View>
          </View>

          {/* Current Reward */}
          <View style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardEmoji}>{currentReward.emoji}</Text>
              <Text style={styles.rewardTitle}>{currentReward.title}</Text>
            </View>
            <Text style={styles.rewardMessage}>{currentReward.message}</Text>
          </View>

          {/* Weekly Progress */}
          <View style={styles.weeklyProgressCard}>
            <Text style={styles.weeklyTitle}>Weekly Progress</Text>
            <View style={styles.weeklyStats}>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>7</Text>
                <Text style={styles.weeklyStatLabel}>Days Logged</Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>85%</Text>
                <Text style={styles.weeklyStatLabel}>Goal Achievement</Text>
              </View>
              <View style={styles.weeklyStat}>
                <Text style={styles.weeklyStatValue}>+2.1</Text>
                <Text style={styles.weeklyStatLabel}>Weight Change (kg)</Text>
              </View>
            </View>
          </View>

          {/* Monthly Achievement */}
          <View style={styles.monthlyCard}>
            <Text style={styles.monthlyTitle}>Monthly Achievement</Text>
            <View style={styles.achievementRow}>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🎯</Text>
                <Text style={styles.achievementText}>Calorie Goal</Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>💪</Text>
                <Text style={styles.achievementText}>Protein Target</Text>
              </View>
              <View style={styles.achievementItem}>
                <Text style={styles.achievementEmoji}>🌱</Text>
                <Text style={styles.achievementText}>Healthy Eating</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa', 
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  userInfoSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  userName: {
    fontSize: 24,
    color: '#000',
    fontWeight: '600',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  goalsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  goalCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  goalEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  targetWeightCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  targetWeightLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  targetWeightValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  nutritionSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nutritionCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  nutritionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  nutritionUnit: {
    fontSize: 12,
    color: '#666',
  },
  metabolicInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metabolicCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  metabolicLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metabolicValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  metabolicDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  streakMainCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  streakMainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  streakHighlight: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF0000',
  },
  streakDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  learnMoreLink: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  streakBadgesSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.3,
    color: '#9CA3AF',
  },
  badgeText: {
    fontSize: 12,
    color: '#9CA3AF',
    opacity: 0.3,
  },
  badgeConnector: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  rewardCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  rewardMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  weeklyProgressCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  weeklyStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  monthlyCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  monthlyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  achievementText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  badge3d: {
    opacity: 1,
    color: '#FFD700', // Gold
  },
  badge10d: {
    opacity: 1,
    color: '#FF9800', // Orange
  },
  badge30d: {
    opacity: 1,
    color: '#F44336', // Red
  },
  badge100d: {
    opacity: 1,
    color: '#E91E63', // Pink
  },
  badge200d: {
    opacity: 1,
    color: '#9C27B0', // Purple
  },
  badgeText3d: {
    opacity: 1,
    color: '#FFD700',
    fontWeight: '600',
  },
  badgeText10d: {
    opacity: 1,
    color: '#FF9800',
    fontWeight: '600',
  },
  badgeText30d: {
    opacity: 1,
    color: '#F44336',
    fontWeight: '600',
  },
  badgeText100d: {
    opacity: 1,
    color: '#E91E63',
    fontWeight: '600',
  },
  badgeText200d: {
    opacity: 1,
    color: '#9C27B0',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 120, // Add padding for the tab bar and extra space
  },
});


