import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/onboarding/personal-info');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Ionicons name="restaurant" size={60} color="#FF6B35" />
          </View>
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
        </View>

        {/* Welcome Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to Cal AI</Text>
          <Text style={styles.subtitle}>
            Your personal nutrition assistant that helps you track calories, 
            monitor your health goals, and make better food choices.
          </Text>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5D9',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: '20%',
    left: '10%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
