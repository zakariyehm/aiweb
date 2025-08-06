import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
export default function HomeScreen() {
  const [selectedDate, setSelectedDate] = useState(5);



  const days = [
    { day: 'F', date: '01' },
    { day: 'S', date: '02' },
    { day: 'S', date: '03' },
    { day: 'M', date: '04' },
    { day: 'T', date: '05' },
    { day: 'W', date: '06' },
    { day: 'T', date: '07' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Inta kale ee koodhkaaga waa sidii hore... */}
        <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="logo-apple" size={24} color="#000" />
          <Text style={styles.appName}>Cal AI</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="flame" size={20} color="#FF6B35" />
          <Text style={styles.streakText}>0</Text>
        </View>
      </View>

      <View style={styles.dateSelector}>
        {days.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dateCircle,
              selectedDate === index && styles.selectedDateCircle
            ]}
            onPress={() => setSelectedDate(index)}
          >
            <Text style={[
              styles.dayText,
              selectedDate === index && styles.selectedDayText
            ]}>
              {item.day}
            </Text>
            <Text style={[
              styles.dateText,
              selectedDate === index && styles.selectedDateText
            ]}>
              {item.date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.calorieCard}>
        <View style={styles.calorieLeft}>
          <Text style={styles.calorieNumber}>1896</Text>
          <Text style={styles.calorieLabel}>Calories left</Text>
        </View>
        <View style={styles.calorieRight}>
          <View style={styles.progressCircle}>
            <View style={styles.progressArc} />
            <Ionicons name="flame" size={24} color="#000" style={styles.progressIcon} />
          </View>
        </View>
      </View>

      <View style={styles.macroContainer}>
        <View style={styles.macroCard}>
          <Text style={styles.macroNumber}>136g</Text>
          <Text style={styles.macroLabel}>Protein left</Text>
          <View style={[styles.macroIcon, { backgroundColor: '#FF6B6B' }]}>
            <Ionicons name="flash" size={16} color="white" />
          </View>
        </View>
        
        <View style={styles.macroCard}>
          <Text style={styles.macroNumber}>219g</Text>
          <Text style={styles.macroLabel}>Carbs left</Text>
          <View style={[styles.macroIcon, { backgroundColor: '#8B4513' }]}>
            <Ionicons name="leaf" size={16} color="white" />
          </View>
        </View>
        
        <View style={styles.macroCard}>
          <Text style={styles.macroNumber}>52g</Text>
          <Text style={styles.macroLabel}>Fats left</Text>
          <View style={[styles.macroIcon, { backgroundColor: '#4A90E2' }]}>
            <Ionicons name="water" size={16} color="white" />
          </View>
        </View>
      </View>

      <View style={styles.paginationDots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={styles.recentlyEatenSection}>
        <Text style={styles.sectionTitle}>Recently eaten</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>You haven't uploaded any food</Text>
          <Text style={styles.emptyDescription}>
            Start tracking today's meals by taking a quick pictures
          </Text>
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-down" size={24} color="#666" style={styles.arrow} />
          </View>
        </View>
      </View>
            </ScrollView>
    </View>
  );
}

// Styles-ka intiisa kale waa sidii hore oo kale...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateCircle: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  dayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  selectedDayText: {
    color: '#fff',
  },
  dateText: {
    fontSize: 10,
    color: '#666',
  },
  selectedDateText: {
    color: '#fff',
  },
  calorieCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calorieLeft: {
    flex: 1,
  },
  calorieNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  calorieRight: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressArc: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#333',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-45deg' }],
  },
  progressIcon: {
    position: 'absolute',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  macroCard: {
    backgroundColor: '#fff',
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  macroNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  macroIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    marginHorizontal: 3,
  },
  recentlyEatenSection: {
    paddingHorizontal: 20,
    marginBottom: 100, // Space for FAB
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  arrowContainer: {
    marginTop: 15,
  },
  arrow: {
    transform: [{ rotate: '45deg' }],
  },
});