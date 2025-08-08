import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AnalyticsScreen() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('90 Days');
  const insets = useSafeAreaInsets();

  const timeframes = ['90 Days', '6 Months', '1 Year', 'All time'];

  const BMICategories = [
    { label: 'Underweight', color: '#007AFF', range: [0, 18.5] },
    { label: 'Healthy', color: '#34C759', range: [18.5, 25] },
    { label: 'Overweight', color: '#FF9500', range: [25, 30] },
    { label: 'Obese', color: '#FF3B30', range: [30, 100] },
  ];

  const currentBMI = 21.55;
  const currentWeight = 63;
  const goalWeight = 63;

  const getBMICategory = (bmi: number) => {
    return BMICategories.find(cat => bmi >= cat.range[0] && bmi < cat.range[1]) || BMICategories[1];
  };

  const bmiCategory = getBMICategory(currentBMI);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header - now outside ScrollView so it doesn't scroll */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <Text style={styles.headerTitle}>Overview</Text>
      </View>

      {/* ScrollView - now only contains the scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Weight Goal & Current Weight Section */}
        <View style={styles.section}>
          <View style={styles.weightHeader}>
            <Text style={styles.sectionTitle}>Weight Goal</Text>
            <TouchableOpacity style={styles.updateButton}>
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.weightValue}>{goalWeight} kg</Text>
          
          <Text style={styles.sectionTitle}>Current Weight</Text>
          <Text style={styles.weightValue}>{currentWeight} kg</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Try to update once a week so we can adjust your plan to ensure you hit your goal.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.logWeightButton}>
            <Text style={styles.logWeightButtonText}>Log weight</Text>
          </TouchableOpacity>
        </View>

        {/* BMI Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your BMI</Text>
          <View style={styles.bmiCard}>
            <View style={styles.bmiHeader}>
              <Text style={styles.bmiText}>Your weight is</Text>
              <View style={[styles.bmiLabel, { backgroundColor: bmiCategory.color }]}>
                <Text style={styles.bmiLabelText}>{bmiCategory.label}</Text>
              </View>
              <Ionicons name="information-circle" size={20} color="#666" />
            </View>
            
            <Text style={styles.bmiValue}>{currentBMI}</Text>
            
            {/* BMI Scale */}
            <View style={styles.bmiScale}>
              <View style={styles.bmiBar}>
                {BMICategories.map((category, index) => (
                  <View
                    key={category.label}
                    style={[
                      styles.bmiBarSegment,
                      { backgroundColor: category.color, flex: category.range[1] - category.range[0] }
                    ]}
                  />
                ))}
                <View
                  style={[
                    styles.bmiMarker,
                    {
                      left: `${((currentBMI - 15) / (40 - 15)) * 100}%`,
                    }
                  ]}
                />
              </View>
              <View style={styles.bmiLegend}>
                {BMICategories.map(category => (
                  <View key={category.label} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: category.color }]} />
                    <Text style={styles.legendText}>{category.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Goal Progress Section */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Goal Progress</Text>
            <Text style={styles.progressPercentage}>0.0% Goal achieved</Text>
          </View>
          
          {/* Timeframe Tabs */}
          <View style={styles.timeframeTabs}>
            {timeframes.map(timeframe => (
              <TouchableOpacity
                key={timeframe}
                style={[
                  styles.timeframeTab,
                  selectedTimeframe === timeframe && styles.timeframeTabActive
                ]}
                onPress={() => setSelectedTimeframe(timeframe)}
              >
                <Text style={[
                  styles.timeframeTabText,
                  selectedTimeframe === timeframe && styles.timeframeTabTextActive
                ]}>
                  {timeframe}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Progress Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartYAxis}>
              <Text style={styles.chartYLabel}>64 kg</Text>
              <Text style={styles.chartYLabel}>63.6 kg</Text>
              <Text style={styles.chartYLabel}>63.2 kg</Text>
              <Text style={styles.chartYLabel}>62.8 kg</Text>
            </View>
            <View style={styles.chartArea}>
              <View style={styles.chartGrid}>
                {[0, 1, 2, 3].map(i => (
                  <View key={i} style={styles.chartGridLine} />
                ))}
              </View>
              <View style={styles.chartDataPoint}>
                <View style={styles.dataPoint} />
                <Text style={styles.dataPointValue}>63.0</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  updateButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  logWeightButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logWeightButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bmiCard: {
    padding: 16,
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  bmiText: {
    fontSize: 16,
    color: '#333',
  },
  bmiLabel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  bmiScale: {
    marginTop: 16,
  },
  bmiBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 12,
  },
  bmiBarSegment: {
    height: '100%',
  },
  bmiMarker: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 16,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  bmiLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#666',
  },
  timeframeTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  timeframeTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeframeTabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeframeTabTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
  },
  chartYAxis: {
    width: 60,
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  chartYLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chartGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  chartGridLine: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginTop: 50,
  },
  chartDataPoint: {
    position: 'absolute',
    top: '50%',
    left: '20%',
    alignItems: 'center',
  },
  dataPoint: {
    width: 8,
    height: 8,
    backgroundColor: '#007AFF',
    borderRadius: 4,
    marginBottom: 4,
  },
  dataPointValue: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
}); 