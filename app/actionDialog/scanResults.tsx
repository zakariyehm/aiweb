import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

type ScanResult = {
  title: string;
  calories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  healthScore: number;
  imageUri?: string;
};

export default function ScanResultsModal() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Parse the scan result from navigation params
  const scanResult: ScanResult = {
    title: params.title as string || "Grilled Chicken Salad",
    calories: Number(params.calories) || 320,
    carbsG: Number(params.carbsG) || 15.2,
    proteinG: Number(params.proteinG) || 28.5,
    fatG: Number(params.fatG) || 18.3,
    healthScore: Number(params.healthScore) || 8,
    imageUri: params.imageUri as string,
  };

  const handleClose = () => {
    router.back();
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      {scanResult.imageUri && (
        <Image source={{ uri: scanResult.imageUri }} style={styles.backgroundImage} resizeMode="cover" />
      )}
      
      {/* Overlay */}
      <View style={styles.overlay} />
      
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Results Modal */}
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Title */}
          <View style={styles.titleChip}>
            <Text style={styles.titleText} numberOfLines={1}>{scanResult.title}</Text>
          </View>

          {/* Calories */}
          <View style={styles.caloriePill}>
            <Ionicons name="flame" size={18} color="#D92C20" />
            <Text style={styles.calorieText}>{scanResult.calories} Calories</Text>
            <Ionicons name="pencil" size={16} color="#111" style={{ marginLeft: 'auto' }} />
          </View>

          {/* Macronutrients */}
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{scanResult.carbsG.toFixed(1)}g</Text>
              <Text style={styles.macroLabel}>carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{scanResult.proteinG.toFixed(1)}g</Text>
              <Text style={styles.macroLabel}>protein</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{scanResult.fatG.toFixed(1)}g</Text>
              <Text style={styles.macroLabel}>fat</Text>
            </View>
          </View>

          {/* Health Score */}
          <View style={styles.healthCard}>
            <Text style={styles.healthLabel}>Health Score ({scanResult.healthScore}/10)</Text>
            <View style={styles.healthBarTrack}>
              <View 
                style={[
                  styles.healthBarFill, 
                  { width: `${(scanResult.healthScore / 10) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Vitamin Data Button */}
          <TouchableOpacity style={styles.tertiaryButton}>
            <Ionicons name="document-text-outline" size={16} color="#111827" />
            <Text style={styles.tertiaryButtonText}>View Vitamin Data</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryButton}>
              <FontAwesome name="star" size={14} color="#111" />
              <Text style={styles.secondaryButtonText}>AI Fix</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleDone}>
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    minHeight: '60%',
  },
  modalContent: {
    gap: 16,
  },
  titleChip: {
    alignSelf: 'center',
    backgroundColor: '#0b1020',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: '90%',
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  caloriePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#ffd6d6',
    gap: 8,
  },
  calorieText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroItem: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  macroLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  healthCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  healthLabel: {
    color: '#e5e7eb',
    fontWeight: '600',
    fontSize: 16,
  },
  healthBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#111827',
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 999,
  },
  tertiaryButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  tertiaryButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: '#111',
    fontWeight: '700',
    fontSize: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
