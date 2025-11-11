import { Colors } from '@/constants/Colors';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import useDailyNutrition from '@/hooks/useDailyNutrition';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ViewMealsModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Get date from params (today or yesterday)
  const date = params.date as string || 'today';
  const isToday = date === 'today';
  
  // Calculate tab bar height to leave space at bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 60;
  
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  
  // Get meals for the selected date
  const { 
    todayData,
    yesterdayData,
    loading,
  } = useDailyNutrition(userId, isToday ? 'today' : 'yesterday');
  
  const meals = isToday ? todayData.recentlyEaten : yesterdayData.recentlyEaten;
  const dailyTotals = isToday ? todayData.dailyTotals : yesterdayData.dailyTotals;

  // Helper function to format nutritional values
  const formatNutritionValue = (value: number): string => {
    if (value === 0) return '0g';
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}g` : `${rounded}g`;
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={styles.loadingText}>Loading meals...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Transparent bottom area to allow tab bar touches */}
      <View 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: tabBarHeight,
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 999,
        }}
      />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 16) }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isToday ? "Today's Meals" : "Yesterday's Meals"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Daily Totals Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Daily Totals</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Ionicons name="flame" size={20} color={colors.calories} />
            <Text style={styles.summaryValue}>{Math.round(dailyTotals.calories || 0)}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="water" size={20} color={colors.protein} />
            <Text style={styles.summaryValue}>{formatNutritionValue(dailyTotals.protein || 0)}</Text>
            <Text style={styles.summaryLabel}>Protein</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="leaf" size={20} color={colors.carbs} />
            <Text style={styles.summaryValue}>{formatNutritionValue(dailyTotals.carbs || 0)}</Text>
            <Text style={styles.summaryLabel}>Carbs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="water" size={20} color={colors.fat} />
            <Text style={styles.summaryValue}>{formatNutritionValue(dailyTotals.fat || 0)}</Text>
            <Text style={styles.summaryLabel}>Fat</Text>
          </View>
        </View>
      </View>

      {/* Meals List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ 
          paddingBottom: tabBarHeight + 24,
          flexGrow: 1 
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {meals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No meals yet</Text>
            <Text style={styles.emptyDescription}>
              {isToday 
                ? "Start tracking your meals by scanning food!" 
                : "No meals were logged yesterday."}
            </Text>
          </View>
        ) : (
          <View style={styles.mealsList}>
            {meals.map((meal) => (
              <View key={meal._id} style={styles.mealCard}>
                {meal.imageUri ? (
                  <Image source={{ uri: meal.imageUri }} style={styles.mealImage} />
                ) : (
                  <View style={[styles.mealImage, styles.mealImagePlaceholder]}>
                    <FontAwesome name="cutlery" size={24} color={colors.textTertiary} />
                  </View>
                )}
                <View style={styles.mealContent}>
                  <Text style={styles.mealTitle} numberOfLines={2}>{meal.title || 'Meal'}</Text>
                  <View style={styles.mealInfo}>
                    <View style={styles.mealInfoItem}>
                      <Ionicons name="flame" size={16} color={colors.calories} />
                      <Text style={styles.mealInfoText}>{Math.round(meal.calories)} kcal</Text>
                    </View>
                    <View style={styles.mealInfoItem}>
                      <Ionicons name="water" size={16} color={colors.protein} />
                      <Text style={styles.mealInfoText}>{formatNutritionValue(meal.proteinG)}</Text>
                    </View>
                    <View style={styles.mealInfoItem}>
                      <Ionicons name="leaf" size={16} color={colors.carbs} />
                      <Text style={styles.mealInfoText}>{formatNutritionValue(meal.carbsG)}</Text>
                    </View>
                    <View style={styles.mealInfoItem}>
                      <Ionicons name="water" size={16} color={colors.fat} />
                      <Text style={styles.mealInfoText}>{formatNutritionValue(meal.fatG)}</Text>
                    </View>
                  </View>
                  <View style={styles.mealTime}>
                    <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.mealTimeText}>
                      {new Date(meal.createdAt || Date.now()).toLocaleTimeString([], { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  summaryCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  mealsList: {
    paddingHorizontal: 20,
  },
  mealCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  mealImagePlaceholder: {
    backgroundColor: colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealContent: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  mealInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  mealInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mealInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mealTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  mealTimeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    minHeight: 200,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
