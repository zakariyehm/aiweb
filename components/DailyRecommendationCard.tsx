import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressRing from './ProgressRing';

export type Recommendation = {
  key: 'calories' | 'carbs' | 'protein' | 'fat' | 'health';
  label: string;
  value: number;
  unit?: string;
  progress?: number; // 0..1
  color: string;
  trackColor?: string;
  icon: React.ReactNode;
};

type Props = {
  title?: string;
  subtitle?: string;
  items: Recommendation[];
  onEdit?: (key: Recommendation['key']) => void;
};

const DailyRecommendationCard: React.FC<Props> = ({ title = 'Daily recommendation', subtitle = 'You can edit this any time', items, onEdit }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.grid}>
        {items.map(item => (
          <View key={item.key} style={styles.cell}>
            <View style={styles.ringRow}>
              <ProgressRing size={64} strokeWidth={7} progress={item.progress ?? 0} color={item.color} trackColor={item.trackColor}>
                {item.icon}
              </ProgressRing>
              <TouchableOpacity onPress={() => onEdit?.(item.key)} accessibilityRole="button">
                <Ionicons name="pencil" size={18} color="#555" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}{item.unit ?? ''}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  value: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
});

export default DailyRecommendationCard;


