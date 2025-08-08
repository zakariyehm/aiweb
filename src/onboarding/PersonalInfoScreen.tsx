import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Goal = 'lose' | 'maintain' | 'gain';

export default function PersonalInfoScreen() {
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleContinue = () => {
    // Here you would typically save the user data
    // For now, just navigate to the home screen
    router.replace('/(tabs)');
  };

  const isFormValid = firstName.trim() && age && height && weight && selectedGoal;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tell us about yourself</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your nutrition plan
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Age */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Height */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter your height"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Weight */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter your weight"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* Goal Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>What's your goal?</Text>
              <View style={styles.goalContainer}>
                <TouchableOpacity
                  style={[
                    styles.goalButton,
                    selectedGoal === 'lose' && styles.selectedGoalButton
                  ]}
                  onPress={() => setSelectedGoal('lose')}
                >
                  <Ionicons 
                    name="trending-down" 
                    size={24} 
                    color={selectedGoal === 'lose' ? '#fff' : '#FF6B35'} 
                  />
                  <Text style={[
                    styles.goalText,
                    selectedGoal === 'lose' && styles.selectedGoalText
                  ]}>
                    Lose Weight
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.goalButton,
                    selectedGoal === 'maintain' && styles.selectedGoalButton
                  ]}
                  onPress={() => setSelectedGoal('maintain')}
                >
                  <Ionicons 
                    name="remove" 
                    size={24} 
                    color={selectedGoal === 'maintain' ? '#fff' : '#FF6B35'} 
                  />
                  <Text style={[
                    styles.goalText,
                    selectedGoal === 'maintain' && styles.selectedGoalText
                  ]}>
                    Maintain Weight
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.goalButton,
                    selectedGoal === 'gain' && styles.selectedGoalButton
                  ]}
                  onPress={() => setSelectedGoal('gain')}
                >
                  <Ionicons 
                    name="trending-up" 
                    size={24} 
                    color={selectedGoal === 'gain' ? '#fff' : '#FF6B35'} 
                  />
                  <Text style={[
                    styles.goalText,
                    selectedGoal === 'gain' && styles.selectedGoalText
                  ]}>
                    Gain Weight
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.continueButton,
              !isFormValid && styles.disabledButton
            ]} 
            onPress={handleContinue}
            disabled={!isFormValid}
          >
            <Text style={[
              styles.continueButtonText,
              !isFormValid && styles.disabledButtonText
            ]}>
              Continue
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={20} 
              color={isFormValid ? '#fff' : '#ccc'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  goalContainer: {
    gap: 12,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  selectedGoalButton: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B35',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 12,
  },
  selectedGoalText: {
    color: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  continueButton: {
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
  disabledButton: {
    backgroundColor: '#F0F0F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  disabledButtonText: {
    color: '#ccc',
  },
});
