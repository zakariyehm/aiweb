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
      <View style={styles.topCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bigNumber}>{caloriesLeft}</Text>
          <Text style={styles.caption}>Calories left</Text>
        </View>
        <ProgressRing size={88} strokeWidth={10} progress={caloriesProgress} color="#111111" trackColor="#E9ECEF">
          <Ionicons name="flame" size={24} color="#111111" />
        </ProgressRing>
      </View>

      <View style={styles.bottomRow}>
        {macros.slice(0, 3).map((m, idx) => (
          <View key={idx} style={styles.smallCard}>
            <Text style={styles.macroValue}>{m.valueText}</Text>
            <Text style={styles.macroLabel}>{m.helper}</Text>
            <View style={{ marginTop: 8 }}>
              <ProgressRing size={50} strokeWidth={7} progress={m.progress} color={m.color} trackColor="#EFEFEF">
                <Ionicons name={m.icon} size={18} color={m.color} />
              </ProgressRing>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111111',
  },
  caption: {
    marginTop: 2,
    fontSize: 14,
    color: '#6B7280',
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    lineHeight: 14,
  },
  macroLabel: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default CardComponent;
