import { Colors } from '@/constants/Colors';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import useDailyNutrition from '@/hooks/useDailyNutrition';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { Animated, BackHandler, Image, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ViewMealsModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors, colorScheme);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Get date and mealId from params
  const date = params.date as string || 'today';
  const mealId = params.mealId as string | undefined;
  const isToday = date === 'today';
  
  // Calculate tab bar height to leave space at bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 60;
  
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  
  // Animation refs
  const slideAnim = useRef(new Animated.Value(50)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  
  // Get meals for the selected date
  const { 
    todayData,
    yesterdayData,
    loading,
  } = useDailyNutrition(userId, isToday ? 'today' : 'yesterday');
  
  // Filter meals - if mealId is provided, show only that meal
  const allMeals = isToday ? todayData.recentlyEaten : yesterdayData.recentlyEaten;
  const meals = mealId 
    ? allMeals.filter(m => m._id === mealId)
    : allMeals;
  
  // Get the meal to display image (first meal if multiple, or the selected meal)
  const displayMeal = meals.length > 0 ? meals[0] : null;
  const imageUri = displayMeal?.imageUri || '';
  
  // If showing single meal, use that meal's data for totals, otherwise use daily totals
  const dailyTotals = mealId && meals.length > 0
    ? {
        calories: meals[0].calories || 0,
        protein: meals[0].proteinG || 0,
        carbs: meals[0].carbsG || 0,
        fat: meals[0].fatG || 0,
      }
    : (isToday ? todayData.dailyTotals : yesterdayData.dailyTotals);

  // Helper function to format nutritional values
  const formatNutritionValue = (value: number): string => {
    if (value === 0) return '0g';
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}g` : `${rounded}g`;
  };

  // Slide-up animation on mount
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Block hardware back to prevent accidental dismiss (Android)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Pan responder for swipe down to close
  const panStartY = useRef(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (evt, gesture) => {
        const isTopArea = evt.nativeEvent.pageY < 300;
        return isTopArea && gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
      onPanResponderGrant: () => {
        dragY.stopAnimation((value) => {
          panStartY.current = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          dragY.setValue(panStartY.current + gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          Animated.timing(dragY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            router.back();
          });
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <Text style={styles.loadingText}>Loading meals...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      {/* Top Section - Meal Image */}
      <View style={styles.topSection} pointerEvents="auto">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.foodImage} resizeMode="cover" />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="restaurant" size={64} color={colors.textTertiary} />
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}
        
        {/* Header with Back button - Overlay on image */}
        <View style={[styles.header, { paddingTop: insets.top - 5 }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
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

      {/* Bottom Section - Sheet */}
      <Animated.View 
        style={[
          styles.sheet,
          { 
            transform: [
              { translateY: Animated.add(slideAnim, dragY) }
            ],
            bottom: 0,
            height: '65%',
          }
        ]}
        pointerEvents="auto"
        {...panResponder.panHandlers}
      >
        {/* Drag handle indicator */}
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragHandleBar} />
        </View>
        
        <ScrollView 
          ref={scrollViewRef}
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          showsVerticalScrollIndicator={false}
          bounces
          scrollEnabled={true}
        >
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.foodTitle}>
              {mealId && meals.length > 0 
                ? meals[0].title || 'Meal Details'
                : (isToday ? "Today's Meals" : "Yesterday's Meals")}
            </Text>
          </View>

          {/* Calories Button */}
          <TouchableOpacity style={styles.caloriesButton}>
            <Ionicons name="flame" size={20} color={colors.error} style={styles.flameIcon} />
            <Text style={styles.caloriesButtonText}>
              {Math.round(dailyTotals.calories || 0)} Calories
            </Text>
          </TouchableOpacity>

          {/* Macronutrients - Three columns */}
          <View style={styles.macrosRow}>
            <View style={styles.macroColumn}>
              <Text style={styles.macroValue}>{formatNutritionValue(dailyTotals.carbs || 0)}</Text>
              <Text style={styles.macroLabel}>carbs</Text>
            </View>
            <View style={styles.macroColumn}>
              <Text style={styles.macroValue}>{formatNutritionValue(dailyTotals.protein || 0)}</Text>
              <Text style={styles.macroLabel}>protein</Text>
            </View>
            <View style={styles.macroColumn}>
              <Text style={styles.macroValue}>{formatNutritionValue(dailyTotals.fat || 0)}</Text>
              <Text style={styles.macroLabel}>fat</Text>
            </View>
          </View>

          {/* Meals List (if multiple meals) */}
          {!mealId && meals.length > 0 && (
            <View style={styles.mealsListSection}>
              <Text style={styles.sectionTitle}>All Meals</Text>
              {meals.map((meal) => (
                <View key={meal._id} style={styles.mealCard}>
                  {meal.imageUri ? (
                    <Image source={{ uri: meal.imageUri }} style={styles.mealImage} />
                  ) : (
                    <View style={[styles.mealImage, styles.mealImagePlaceholder]}>
                      <FontAwesome name="cutlery" size={20} color={colors.textTertiary} />
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

          {/* Empty State */}
          {meals.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={64} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No meals yet</Text>
              <Text style={styles.emptyDescription}>
                {isToday 
                  ? "Start tracking your meals by scanning food!" 
                  : "No meals were logged yesterday."}
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, colorScheme: 'light' | 'dark') => StyleSheet.create({
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  topSection: {
    height: '40%',
    width: '100%',
    backgroundColor: colors.background,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
    backgroundColor: colors.modalBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  foodImage: {
    ...StyleSheet.absoluteFillObject as any,
    width: undefined,
    height: undefined,
  },
  noImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
  },
  noImageText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textTertiary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleSection: {
    marginBottom: 20,
    marginTop: 8,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'left',
  },
  caloriesButton: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  flameIcon: {
    marginRight: 8,
  },
  caloriesButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  macroColumn: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'lowercase',
  },
  mealsListSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
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
  dragHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    opacity: 0.5,
  },
});
