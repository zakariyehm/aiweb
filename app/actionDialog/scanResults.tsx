import { ScanResult } from '@/types/scan';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ScanResultsModal() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [formattedTime, setFormattedTime] = useState<string>('');
  
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

  const handleClose = () => {
    // Go back to camera and reopen it
    router.replace({ pathname: '/actionDialog/scan', params: { reopen: '1' } });
  };

  const handleDone = () => {
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
      {/* Top Section - 40% of screen (Image) */}
      <View style={styles.topSection}>
        {/* Food Image - Full background */}
        {scanResult.imageUri ? (
          <Image source={{ uri: scanResult.imageUri }} style={styles.foodImage} resizeMode="cover" />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="restaurant" size={64} color="#ccc" />
            <Text style={styles.noImageText}>No image available</Text>
          </View>
        )}
        
        {/* Removed overlay to avoid blocking image area */}
        
        {/* Close Button - Safe area aware */}
        <TouchableOpacity 
          style={[styles.closeButton, { top: insets.top + 20 }]} 
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Close scan results"
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Bottom Section - 60% of screen (Content) */}
      <Animated.View 
        style={[
          styles.bottomSection,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <ScrollView 
          style={styles.contentContainer} 
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Title and Timestamp */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              
              <Text style={styles.timestamp}>{formattedTime}</Text>
            </View>
            <Text style={styles.foodTitle}>{scanResult.title}</Text>
          </View>

          {/* Calories Card */}
          <View style={styles.caloriesCard}>
            <Ionicons name="flame" size={24} color="#000" />
            <Text style={styles.caloriesLabel}>Calories</Text>
            <Text style={styles.caloriesValue}>{scanResult.calories}</Text>
          </View>

          {/* Macronutrients Row */}
          <View style={styles.macrosRow}>
            <View style={styles.macroCard}>
              <View style={styles.macroIconContainer}>
                <Ionicons name="water" size={20} color="#FF6B9D" />
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{scanResult.proteinG}g</Text>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroIconContainer}>
                <Ionicons name="leaf" size={20} color="#FFB366" />
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{scanResult.carbsG}g</Text>
            </View>

            <View style={styles.macroCard}>
              <View style={styles.macroIconContainer}>
                <Ionicons name="water" size={20} color="#66B3FF" />
              </View>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{scanResult.fatG}g</Text>
            </View>
          </View>

          {/* Health Score Card */}
          <View style={styles.healthScoreCard}>
            <View style={styles.healthScoreHeader}>
              <View style={styles.healthIconContainer}>
                <Ionicons name="heart" size={20} color="#FF6B9D" />
                <Ionicons name="flash" size={12} color="#FF6B9D" style={styles.flashIcon} />
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
              <FontAwesome name="star" size={16} color="#000" />
              <Text style={styles.fixResultsText}>Fix Results</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={handleDone}
              accessibilityRole="button"
              accessibilityLabel="Return to home screen"
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    height: '40%', // 40% of screen height
    backgroundColor: '#fff',
    position: 'relative',
  },
  bottomSection: {
    flex: 1, // Takes remaining 60% of screen
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  foodImage: {
    width: '100%',
    height: '100%', // Cover the full height of the top section
  },
  noImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  noImageText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  caloriesCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    marginBottom: 2,
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  macroCard: {
    flex: 1,
    minWidth: 80, // Ensure cards don't get too small
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
  macroIconContainer: {
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  healthScoreCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
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
    color: '#000',
  },
  healthScoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  healthBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e9ecef',
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#28a745',
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fixResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
