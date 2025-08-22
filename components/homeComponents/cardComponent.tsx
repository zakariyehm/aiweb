import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProgressRing from '../ProgressRing';

type Macro = {
  valueText: string; // e.g. "45g"
  helper: string; // e.g. "Protein over"
  progress: number; // 0..1
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type Props = {
  caloriesLeft?: number;
  caloriesProgress?: number; // 0..1
  macros?: Macro[]; // length <= 3 for layout
};

const defaultMacros: Macro[] = [
  { valueText: '45g', helper: 'Protein over', progress: 0.8, color: '#F97373', icon: 'flash' },
  { valueText: '89g', helper: 'Carbs left', progress: 0.55, color: '#F59E0B', icon: 'leaf' },
  { valueText: '48g', helper: 'Fats left', progress: 0.6, color: '#3B82F6', icon: 'water' },
];

const CardComponent: React.FC<Props> = ({
  caloriesLeft = 2500,
  caloriesProgress = 0.75,
  macros = defaultMacros,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Section - Calories */}
      <View style={styles.leftSection}>
        <ProgressRing 
          size={120} 
          strokeWidth={12} 
          progress={caloriesProgress} 
          color="#000000" 
          trackColor="#E5E7EB"
        >
          <View style={styles.caloriesContent}>
            <Text style={styles.caloriesNumber}>{caloriesLeft}</Text>
            <Text style={styles.caloriesLabel}>Calories left</Text>
          </View>
        </ProgressRing>
      </View>

      {/* Right Section - Macronutrients */}
      <View style={styles.rightSection}>
        {macros.slice(0, 3).map((m, idx) => (
          <View key={idx} style={styles.macroItem}>
            <Text style={styles.macroTitle}>{m.helper.split(' ')[0]}</Text>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(m.progress, 1) * 100}%`,
                      backgroundColor: m.color
                    }
                  ]} 
                />
              </View>
            </View>
            <Text style={styles.macroValue}>{m.valueText}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesContent: {
    alignItems: 'center',
  },
  caloriesNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
  },
  rightSection: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: 20,
  },
  macroItem: {
    marginBottom: 16,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  macroValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '400',
  },
});

export default CardComponent;
