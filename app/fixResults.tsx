import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ScanResult } from '@/types/scan';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FixResultsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Calculate tab bar height to leave space at bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 60;
  
  // Helper function to format nutritional values to one decimal place maximum
  const formatNutritionValue = (value: number): string => {
    if (value === 0) return '0g';
    // Round to 1 decimal place and remove trailing .0 if it's a whole number
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? `${rounded}g` : `${rounded}g`;
  };

  // Parse the scan result from navigation params
  const scanResult: ScanResult = {
    title: params.title as string || "Unknown dish",
    calories: Number(params.calories) || 0,
    carbsG: Number(params.carbsG) || 0,
    proteinG: Number(params.proteinG) || 0,
    fatG: Number(params.fatG) || 0,
    healthScore: Number(params.healthScore) || 0,
    imageUri: params.imageUri as string,
  };

  const handleBack = () => {
    router.back();
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
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
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to scan results"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Fix Results</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{scanResult.title}</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Current Nutrition Data</Text>
            <Text style={styles.infoText}>Calories: {Math.round(scanResult.calories)}</Text>
            <Text style={styles.infoText}>Protein: {formatNutritionValue(scanResult.proteinG)}</Text>
            <Text style={styles.infoText}>Carbs: {formatNutritionValue(scanResult.carbsG)}</Text>
            <Text style={styles.infoText}>Fat: {formatNutritionValue(scanResult.fatG)}</Text>
            <Text style={styles.infoText}>Health Score: {scanResult.healthScore}/10</Text>
          </View>

          <View style={styles.placeholderCard}>
            <Ionicons name="construct" size={48} color={colors.textSecondary} />
            <Text style={styles.placeholderTitle}>AI Fix Coming Soon</Text>
            <Text style={styles.placeholderText}>
              This feature will use AI to analyze and improve the nutrition data accuracy.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={[styles.actionContainer, { paddingBottom: tabBarHeight + 20 }]}>
        <TouchableOpacity 
          style={styles.doneButton} 
          onPress={handleDone}
          accessibilityRole="button"
          accessibilityLabel="Return to home screen"
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  placeholderCard: {
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  doneButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
  },
});
