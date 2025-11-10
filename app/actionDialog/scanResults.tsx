import type { Id } from '@/convex/_generated/dataModel';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import useDailyNutrition from '@/hooks/useDailyNutrition';
import useStreak from '@/hooks/useStreak';
import { ScanResult } from '@/types/scan';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Image, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanResultsModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  const { markDone } = useStreak(userId);
  const { addFoodEntry } = useDailyNutrition(userId);
  const slideAnim = useRef(new Animated.Value(50)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Helper function to format nutritional values to one decimal place maximum
  const formatNutritionValue = (value: number): string => {
    if (value === 0) return '0g';
    // Round to 1 decimal place and remove trailing .0 if it's a whole number
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}g` : `${rounded}g`;
  };

  // Parse the scan result from navigation params with safe defaults
  const scanResult: ScanResult = {
    title: params.title as string || "Unknown dish",
    calories: Number(params.calories) || 0,
    carbsG: Number(params.carbsG) || 0,
    proteinG: Number(params.proteinG) || 0,
    fatG: Number(params.fatG) || 0,
    healthScore: Number(params.healthScore) || 0,
    // The router already decodes once; the source encoded to preserve the URI.
    imageUri: params.imageUri as string,
  };

  // Runtime guard for missing fields
  useEffect(() => {
    const missingFields = [];
    if (!params.title) missingFields.push('title');
    if (!params.calories) missingFields.push('calories');
    if (!params.carbsG) missingFields.push('carbsG');
    if (!params.proteinG) missingFields.push('proteinG');
    if (!params.fatG) missingFields.push('fatG');
    if (!params.healthScore) missingFields.push('healthScore');
    
    if (missingFields.length > 0) {
      console.warn('[ScanResults] Missing fields:', missingFields);
    }
  }, [params]);

  // Slide-up animation on mount
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // Set current time once on mount
  useEffect(() => {
    try {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }).format(now);
      setFormattedTime(fmt);
    } catch {
      // Fallback if Intl fails
      const h = new Date().getHours();
      const m = new Date().getMinutes();
      const mm = m < 10 ? `0${m}` : String(m);
      setFormattedTime(`${h}:${mm}`);
    }
  }, []);

  // Spin animation for loading spinner
  useEffect(() => {
    if (isLoading) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }
  }, [isLoading, spinAnim]);

  // Block hardware back to prevent accidental dismiss (Android)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, []);

  // Enable manual pull-down to close (only downward swipe on the sheet)
  const dragY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        // Allow downward drag; resist upward drag
        const dy = gesture.dy > 0 ? gesture.dy : gesture.dy / 4;
        dragY.setValue(dy);
      },
      onPanResponderRelease: (_, gesture) => {
        const shouldClose = gesture.dy > 140 || gesture.vy > 1;
        if (shouldClose) {
          Animated.timing(dragY, { toValue: 800, duration: 220, useNativeDriver: true }).start(() => {
            router.replace('/(tabs)');
          });
        } else {
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    // Go back to camera and reopen it
    router.replace({ pathname: '/actionDialog/scan', params: { reopen: '1' } });
  };

  const handleDone = async () => {
    if (isLoading) return; // Prevent double-clicking
    
    setIsLoading(true);
    try {
      // Add food entry to daily nutrition tracking
      if (userId) {
        await addFoodEntry({
          title: scanResult.title,
          calories: scanResult.calories,
          proteinG: scanResult.proteinG,
          carbsG: scanResult.carbsG,
          fatG: scanResult.fatG,
          imageUri: scanResult.imageUri || null,
        });
      }
      await markDone();
    } catch (error) {
      console.error('Error in handleDone:', error);
      setIsLoading(false);
      return;
    }
    
    // Navigate to home screen
    router.replace('/(tabs)');
  };

  const handleFixResults = () => {
    router.push({
      pathname: '/actionDialog/fixResults',
      params: {
        title: scanResult.title,
        calories: scanResult.calories.toString(),
        carbsG: scanResult.carbsG.toString(),
        proteinG: scanResult.proteinG.toString(),
        fatG: scanResult.fatG.toString(),
        healthScore: scanResult.healthScore.toString(),
        imageUri: scanResult.imageUri || '',
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* iOS Status Bar */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      {/* Top Section - 40% of screen (Image) */}
      <View style={styles.topSection} pointerEvents="none">
        {/* Food Image - Full background */}
        {scanResult.imageUri ? (
          <Image source={{ uri: scanResult.imageUri }} style={styles.foodImage} resizeMode="cover" />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="restaurant" size={64} color={colors.textTertiary} />
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}
      </View>

      {/* Close Button - above image, not affected by pointer events */}
      <TouchableOpacity 
        style={[styles.closeButton, { top: insets.top + 20 }]} 
        onPress={handleClose}
        accessibilityRole="button"
        accessibilityLabel="Close scan results"
      >
        <Ionicons name="close" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* Bottom Section - rounded, scrollable content */}
      <Animated.View 
        style={[
          styles.sheet,
          { transform: [{ translateY: Animated.add(slideAnim, dragY) }] }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handle} />
        <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Title and Timestamp */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={styles.timeChip}><Text style={styles.timeChipText}>{formattedTime}</Text></View>
            </View>
            <Text style={styles.foodTitle}>{scanResult.title}</Text>
          </View>

          {/* Calories Card */}
          <View style={styles.caloriesCard}>
            <Ionicons name="flame" size={24} color={colors.textPrimary} />
            <Text style={styles.caloriesLabel}>Calories</Text>
            <Text style={styles.caloriesValue}>{Math.round(scanResult.calories)}</Text>
          </View>

          {/* Macronutrients Row */}
          <View style={styles.macrosRow}>
            <View style={styles.macroCard}>
              <View style={styles.macroIconContainer}>
                <Ionicons name="water" size={20} color={colors.protein} />
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{formatNutritionValue(scanResult.proteinG)}</Text>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroIconContainer}>
                <Ionicons name="leaf" size={20} color={colors.carbs} />
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{formatNutritionValue(scanResult.carbsG)}</Text>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroIconContainer}>
                <Ionicons name="water" size={20} color={colors.fat} />
              </View>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{formatNutritionValue(scanResult.fatG)}</Text>
            </View>
          </View>

          {/* Health Score Card */}
          <View style={styles.healthScoreCard}>
            <View style={styles.healthScoreHeader}>
              <View style={styles.healthIconContainer}>
                <Ionicons name="heart" size={20} color={colors.error} />
                <Ionicons name="flash" size={12} color={colors.error} style={styles.flashIcon} />
              </View>
              <Text style={styles.healthScoreLabel}>Health Score</Text>
              <Text style={styles.healthScoreValue}>{scanResult.healthScore}/10</Text>
            </View>
            <View style={styles.healthBarTrack}>
              <View 
                style={[
                  styles.healthBarFill, 
                  { width: `${(scanResult.healthScore / 10) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.fixResultsButton} 
              onPress={handleFixResults}
              accessibilityRole="button"
              accessibilityLabel={`Fix nutrition results for ${scanResult.title}`}
            >
              <FontAwesome name="star" size={16} color={colors.textPrimary} />
              <Text style={styles.fixResultsText}>Fix Results</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.doneButton, 
                isLoading && styles.doneButtonDisabled
              ]} 
              onPress={handleDone}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Return to home screen"
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Animated.View 
                    style={[
                      styles.spinner,
                      {
                        transform: [{
                          rotate: spinAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg']
                          })
                        }]
                      }
                    ]} 
                  />
                  <Text style={styles.doneButtonText}>Saving...</Text>
                </View>
              ) : (
                <Text style={styles.doneButtonText}>Done</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSection: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: colors.background,
  },
  sheet: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginTop: 8,
    marginBottom: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
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
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.modalBackground,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeChip: {
    backgroundColor: colors.cardSecondary,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeChipText: { 
    fontSize: 12, 
    color: colors.textSecondary 
  },
  timestamp: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  foodTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  caloriesCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caloriesLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 2,
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  macroIconContainer: {
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  healthScoreCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  healthIconContainer: {
    position: 'relative',
  },
  flashIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  healthScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  healthScoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  healthBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  fixResultsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fixResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonDisabled: {
    opacity: 0.7,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: colors.buttonText,
    borderTopColor: 'transparent',
    borderRadius: 10,
  },
});
