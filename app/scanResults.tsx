import type { Id } from '@/convex/_generated/dataModel';
import { analyzeFoodFromImage, type Nutrition } from '@/constants/api';
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
import { Animated, BackHandler, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  
  // Helper function to format nutritional values to one decimal place maximum
  const formatNutritionValue = (value: number): string => {
    if (value === 0) return '0g';
    // Round to 1 decimal place and remove trailing .0 if it's a whole number
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}g` : `${rounded}g`;
  };

  // Check if we have nutrition data or need to analyze
  const hasNutritionData = params.title && params.calories;
  const imageUri = params.imageUri as string;

  // Analyze image if we don't have nutrition data
  useEffect(() => {
    if (!hasNutritionData && imageUri && !isAnalyzing && !scanResult) {
      setIsAnalyzing(true);
      
      const analyzeImage = async () => {
        try {
          console.log('[ScanResults] Starting analysis');
          const analyzed = await analyzeFoodFromImage(imageUri);
          
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
        } catch (err) {
          console.error('[ScanResults] Analysis error:', err);
          setScanResult({
            title: "Analysis failed",
            calories: 0,
            carbsG: 0,
            proteinG: 0,
            fatG: 0,
            healthScore: 5,
            imageUri: imageUri,
          });
        } finally {
          setIsAnalyzing(false);
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
  }, [hasNutritionData, imageUri, isAnalyzing, scanResult, params]);

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

  const handleClose = () => {
    // Go back to camera and reopen it
    router.replace({ pathname: '/(tabs)/actionDialog', params: { reopen: '1' } });
  };

  const handleDelete = () => {
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
    <View style={styles.container} pointerEvents="box-none">
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
        
        {/* Back Button - Left side, circular black */}
        <TouchableOpacity 
          style={[styles.backButton, { top: insets.top + 20 }]} 
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Delete Button - Right side, red square */}
        <TouchableOpacity 
          style={[styles.deleteButton, { top: insets.top + 20 }]} 
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete scan results"
        >
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Section - Dark blue-grey sheet */}
      <Animated.View 
        style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] }
        ]}
        pointerEvents="auto"
      >
        <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          bounces
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
            <Ionicons name="flame" size={20} color="#FF3B30" style={styles.flameIcon} />
            <Text style={styles.caloriesButtonText}>
              {isAnalyzing ? '0' : Math.round(scanResult?.calories || 0)} Calories
            </Text>
            <Ionicons name="pencil" size={16} color="#007AFF" style={styles.editIcon} />
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
              <Ionicons name="document-text" size={18} color="#000000" />
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
              <FontAwesome name="star" size={16} color={isAnalyzing ? '#8E8E93' : '#FFFFFF'} />
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

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topSection: {
    height: '40%',
    width: '100%',
    backgroundColor: colors.background,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  deleteButton: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sheet: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 85 : 60, // Leave space for tab bar
    backgroundColor: '#2C2C2E', // Dark blue-grey like in image
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
    color: '#FFFFFF',
    textAlign: 'left',
  },
  caloriesButton: {
    backgroundColor: '#FFE5E5', // Light pink
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
    color: '#000000',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
    color: '#8E8E93',
    textTransform: 'lowercase',
  },
  healthScoreSection: {
    marginBottom: 20,
  },
  healthScoreLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
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
    backgroundColor: '#3A3A3C', // Dark gray
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  fixResultsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#3A3A3C', // Dark gray
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
});
