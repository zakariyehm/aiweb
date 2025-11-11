import { analyzeFoodFromImage, type Nutrition } from '@/constants/api';
import { Colors } from '@/constants/Colors';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import useDailyNutrition from '@/hooks/useDailyNutrition';
import useStreak from '@/hooks/useStreak';
import { ScanResult } from '@/types/scan';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Image, PanResponder, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanResultsModal() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors, colorScheme);
  
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  const { markDone } = useStreak(userId);
  const { addFoodEntry } = useDailyNutrition(userId);
  const slideAnim = useRef(new Animated.Value(50)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const abortControllerRef = useRef<AbortController | null>(null);
  const [formattedTime, setFormattedTime] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Calculate tab bar height to leave space at bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 60;

  // Helper function to format nutritional values to one decimal place maximum
  const formatNutritionValue = (value: number): string => {
    if (value === 0) return '0g';
    // Round to 1 decimal place and remove trailing .0 if it's a whole number
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}g` : `${rounded}g`;
  };

  // Check if we have nutrition data or need to analyze
  const hasNutritionData = params.title && params.calories;
  const imageUri = params.imageUri ? decodeURIComponent(params.imageUri as string) : '';

  // Cleanup: abort request ONLY when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('[ScanResults] Component unmounting - cancelling API request');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []); // Empty array = only run on mount/unmount

  // Analyze image if we don't have nutrition data
  useEffect(() => {
    if (!hasNutritionData && imageUri && !isAnalyzing && !scanResult) {
      setIsAnalyzing(true);
      
      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      const analyzeImage = async () => {
        try {
          console.log('[ScanResults] Starting analysis');
          const analyzed = await analyzeFoodFromImage(imageUri, abortController.signal);
          
          // Check if request was aborted
          if (abortController.signal.aborted) {
            console.log('[ScanResults] Analysis cancelled');
            return;
          }
          
          if ((analyzed as any).notFood) {
            console.warn('[ScanResults] No food detected');
            setScanResult({
              title: "Ma cunto baa tani?",
              calories: 0,
              carbsG: 0,
              proteinG: 0,
              fatG: 0,
              healthScore: 5,
              imageUri: imageUri,
            });
          } else {
            console.log('[ScanResults] Analysis success');
            const nutritionData = analyzed as Nutrition;
            setScanResult({
              title: nutritionData.title,
              calories: nutritionData.calories,
              carbsG: nutritionData.carbsG,
              proteinG: nutritionData.proteinG,
              fatG: nutritionData.fatG,
              healthScore: nutritionData.healthScore,
              imageUri: imageUri,
            });
          }
        } catch (err: any) {
          // Ignore abort errors
          if (err.name === 'AbortError' || abortController.signal.aborted) {
            console.log('[ScanResults] Analysis cancelled by user');
            return;
          }
          console.error('[ScanResults] Analysis error:', err);
          // Only set error state if not aborted
          if (!abortController.signal.aborted) {
            setScanResult({
              title: "Analysis failed",
              calories: 0,
              carbsG: 0,
              proteinG: 0,
              fatG: 0,
              healthScore: 5,
              imageUri: imageUri,
            });
          }
        } finally {
          if (!abortController.signal.aborted) {
            setIsAnalyzing(false);
          }
        }
      };
      
      analyzeImage();
    } else if (hasNutritionData) {
      // Use provided nutrition data
      setScanResult({
        title: params.title as string || "Unknown dish",
        calories: Number(params.calories) || 0,
        carbsG: Number(params.carbsG) || 0,
        proteinG: Number(params.proteinG) || 0,
        fatG: Number(params.fatG) || 0,
        healthScore: Number(params.healthScore) || 0,
        imageUri: imageUri,
      });
    }
  }, [hasNutritionData, imageUri]); // Removed isAnalyzing, scanResult, params - only trigger when imageUri or hasNutritionData changes

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

  // Spin animation for loading spinner (analyzing or saving)
  useEffect(() => {
    if (isAnalyzing || isSaving) {
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
  }, [isAnalyzing, isSaving, spinAnim]);

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
        // Only respond to downward swipes from top area or when scroll is at top
        const isTopArea = evt.nativeEvent.pageY < 300; // Top 300px of screen
        return isTopArea && gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
      },
      onPanResponderGrant: () => {
        dragY.stopAnimation((value) => {
          panStartY.current = value;
        });
      },
      onPanResponderMove: (_, gesture) => {
        // Only allow downward swipes
        if (gesture.dy > 0) {
          dragY.setValue(panStartY.current + gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        // If swiped down more than 100px or with velocity > 0.5, close modal
        if (gesture.dy > 100 || gesture.vy > 0.5) {
          // Cancel any ongoing API request
          if (abortControllerRef.current) {
            console.log('[ScanResults] Cancelling API request on swipe down');
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
          }
          Animated.timing(dragY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            router.replace('/(tabs)');
          });
        } else {
          // Snap back to original position
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
    // Cancel any ongoing API request
    if (abortControllerRef.current) {
      console.log('[ScanResults] Cancelling API request on close');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Go back to home screen
    router.replace('/(tabs)');
  };

  const handleDelete = () => {
    // Cancel any ongoing API request
    if (abortControllerRef.current) {
      console.log('[ScanResults] Cancelling API request on delete');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    // Delete result and return to home
    setScanResult(null);
    router.replace('/(tabs)');
  };

  const handleDone = async () => {
    if (isSaving || !scanResult) return; // Prevent double-clicking
    
    setIsSaving(true);
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
      setIsSaving(false);
      return;
    }
    
    // Navigate to home screen
    router.replace('/(tabs)');
  };

  const handleFixResults = () => {
    if (!scanResult) return;
    router.push({
      pathname: '/fixResults',
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
      
      {/* Top Section - Food Image */}
      <View style={styles.topSection} pointerEvents="auto">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.foodImage} resizeMode="cover" />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="restaurant" size={64} color={colors.textTertiary} />
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}
        
        {/* Header with Back and Delete buttons - Overlay on image */}
        <View style={[styles.header, { paddingTop: insets.top - 5 }]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete scan results"
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
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

      {/* Bottom Section - Dark blue-grey sheet */}
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
          {/* Food Title */}
          <View style={styles.titleSection}>
            {isAnalyzing ? (
              <Text style={styles.foodTitle}>Loading</Text>
            ) : (
              <Text style={styles.foodTitle}>{scanResult?.title || 'Unknown dish'}</Text>
            )}
          </View>

          {/* Calories Button - Pink with flame icon and edit pencil */}
          <TouchableOpacity style={styles.caloriesButton}>
            <Ionicons name="flame" size={20} color={colors.error} style={styles.flameIcon} />
            <Text style={styles.caloriesButtonText}>
              {isAnalyzing ? '0' : Math.round(scanResult?.calories || 0)} Calories
            </Text>
            <Ionicons name="pencil" size={16} color={colors.info} style={styles.editIcon} />
          </TouchableOpacity>

          {/* Macronutrients - Three columns */}
          {isAnalyzing ? (
            <View style={styles.macrosLoadingContainer}>
              <View style={styles.macroLoadingItem}>
                <Text style={styles.macroLoadingLabel}>0g</Text>
                <Text style={styles.macroLoadingSubtext}>carbs</Text>
              </View>
              <View style={styles.macroLoadingCenter}>
                <Animated.View 
                  style={[
                    styles.macroLoadingSpinner,
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
                <Text style={styles.macroLoadingText}>Uploading Data</Text>
              </View>
              <View style={styles.macroLoadingItem}>
                <Text style={styles.macroLoadingLabel}>0g</Text>
                <Text style={styles.macroLoadingSubtext}>fat</Text>
              </View>
            </View>
          ) : (
            <View style={styles.macrosRow}>
              <View style={styles.macroColumn}>
                <Text style={styles.macroValue}>{formatNutritionValue(scanResult?.carbsG || 0)}</Text>
                <Text style={styles.macroLabel}>carbs</Text>
              </View>
              <View style={styles.macroColumn}>
                <Text style={styles.macroValue}>{formatNutritionValue(scanResult?.proteinG || 0)}</Text>
                <Text style={styles.macroLabel}>protein</Text>
              </View>
              <View style={styles.macroColumn}>
                <Text style={styles.macroValue}>{formatNutritionValue(scanResult?.fatG || 0)}</Text>
                <Text style={styles.macroLabel}>fat</Text>
              </View>
            </View>
          )}

          {/* Health Score */}
          {!isAnalyzing && scanResult && (
            <View style={styles.healthScoreSection}>
              <Text style={styles.healthScoreLabel}>Health Score ({scanResult.healthScore}/10)</Text>
              <View style={styles.healthBarTrack}>
                <View 
                  style={[
                    styles.healthBarFill, 
                    { width: `${(scanResult.healthScore / 10) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          )}

          {/* View Vitamin Data Button */}
          {!isAnalyzing && scanResult && (
            <TouchableOpacity style={styles.vitaminDataButton}>
              <Ionicons name="document-text" size={18} color={colors.textPrimary} />
              <Text style={styles.vitaminDataText}>View Vitamin Data</Text>
            </TouchableOpacity>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {/* AI Fix button */}
            <TouchableOpacity 
              style={[
                styles.fixResultsButton,
                isAnalyzing && styles.fixResultsButtonDisabled
              ]} 
              onPress={handleFixResults}
              disabled={isAnalyzing}
              accessibilityRole="button"
              accessibilityLabel="AI Fix nutrition results"
            >
              <FontAwesome name="star" size={16} color={isAnalyzing ? colors.textTertiary : colors.textPrimary} />
              <Text style={[
                styles.fixResultsText,
                isAnalyzing && styles.fixResultsTextDisabled
              ]}>AI Fix</Text>
            </TouchableOpacity>
            
            {/* Done button */}
            {!isAnalyzing && scanResult && (
              <TouchableOpacity 
                style={[
                  styles.doneButton, 
                  isSaving && styles.doneButtonDisabled
                ]} 
                onPress={handleDone}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Return to home screen"
              >
                {isSaving ? (
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
            )}
          </View>
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
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
    position: 'relative',
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
  editIcon: {
    position: 'absolute',
    right: 16,
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
  healthScoreSection: {
    marginBottom: 20,
  },
  healthScoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
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
  vitaminDataButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  vitaminDataText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  fixResultsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.buttonSecondary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  fixResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
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
  macrosLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  macroLoadingItem: {
    alignItems: 'center',
  },
  macroLoadingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  macroLoadingSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  macroLoadingCenter: {
    alignItems: 'center',
  },
  macroLoadingSpinner: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: colors.textPrimary,
    borderTopColor: 'transparent',
    borderRadius: 20,
    marginBottom: 8,
  },
  macroLoadingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  fixResultsButtonDisabled: {
    opacity: 0.5,
  },
  fixResultsTextDisabled: {
    color: colors.textTertiary,
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
