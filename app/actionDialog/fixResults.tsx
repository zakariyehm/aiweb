import { ScanResult } from '@/types/scan';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FixResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Go back to scan results"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Fix Results</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{scanResult.title}</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Current Nutrition Data</Text>
            <Text style={styles.infoText}>Calories: {scanResult.calories}</Text>
            <Text style={styles.infoText}>Protein: {scanResult.proteinG}g</Text>
            <Text style={styles.infoText}>Carbs: {scanResult.carbsG}g</Text>
            <Text style={styles.infoText}>Fat: {scanResult.fatG}g</Text>
            <Text style={styles.infoText}>Health Score: {scanResult.healthScore}/10</Text>
          </View>

          <View style={styles.placeholderCard}>
            <Ionicons name="construct" size={48} color="#666" />
            <Text style={styles.placeholderTitle}>AI Fix Coming Soon</Text>
            <Text style={styles.placeholderText}>
              This feature will use AI to analyze and improve the nutrition data accuracy.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={[styles.actionContainer, { paddingBottom: insets.bottom + 20 }]}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
    color: '#000',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#374151',
  },
  placeholderCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  doneButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
