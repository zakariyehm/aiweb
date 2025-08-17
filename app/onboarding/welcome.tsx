import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  
  const handleGetStarted = () => {
    router.push('/onboarding/personal-info');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.content, Platform.OS === 'android' && { paddingTop: 20 }]}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <FontAwesome name="cutlery" size={60} color="#666666" />
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
          <FontAwesome name="arrow-right" size={20} color="#000000" />
        </TouchableOpacity>

        {/* Already have an account text button */}
        <TouchableOpacity style={styles.alreadyHaveAccountButton} onPress={() => router.push('/onboarding/signin')}>
          <Text style={styles.alreadyHaveAccountText}>Already have an account? Enter your code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
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
    backgroundColor: '#F5F5F5',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: '20%',
    left: '10%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',    // Black text
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',    // Gray text
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#6442A4',   // Light gray button background
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',    // Gray text
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  alreadyHaveAccountButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alreadyHaveAccountText: {
    color: '##2C2540',    // Blue text for link
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  // Icon color ma beddelay JSX gudihiisa
});
