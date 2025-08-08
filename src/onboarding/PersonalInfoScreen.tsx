import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// Color Palette for consistency
const theme = {
  primary: '#FF0100',
  secondary: '#FE6666',
  white: '#FFFFFF',
  black: '#000000',
  lightText: 'rgba(255, 255, 255, 0.8)',
  placeholder: 'rgba(255, 255, 255, 0.7)',
  gray: '#666666',
  lightGray: '#E5E5E5',
  error: '#FF6B6B',
};

// Validation functions
const validateFirstName = (value: string): { isValid: boolean; error: string } => {
  if (!value.trim()) {
    return { isValid: false, error: 'First name is required' };
  }
  if (value.trim().length < 2) {
    return { isValid: false, error: 'First name must be at least 2 characters' };
  }
  if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
    return { isValid: false, error: 'Only alphabetic characters are allowed' };
  }
  return { isValid: true, error: '' };
};

const validateAge = (value: string): { isValid: boolean; error: string } => {
  if (!value.trim()) {
    return { isValid: false, error: 'Age is required' };
  }
  const numValue = parseInt(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Age must be a number' };
  }
  if (numValue < 10 || numValue > 100) {
    return { isValid: false, error: 'Age must be between 10 and 100' };
  }
  return { isValid: true, error: '' };
};

const validateHeight = (value: string): { isValid: boolean; error: string } => {
  if (!value.trim()) {
    return { isValid: false, error: 'Height is required' };
  }
  const numValue = parseInt(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Height must be a number' };
  }
  if (numValue < 50 || numValue > 250) {
    return { isValid: false, error: 'Height must be between 50 and 250 cm' };
  }
  return { isValid: true, error: '' };
};

const validateWeight = (value: string): { isValid: boolean; error: string } => {
  if (!value.trim()) {
    return { isValid: false, error: 'Weight is required' };
  }
  const numValue = parseInt(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Weight must be a number' };
  }
  if (numValue < 20 || numValue > 300) {
    return { isValid: false, error: 'Weight must be between 20 and 300 kg' };
  }
  return { isValid: true, error: '' };
};

const OnboardingScreen = () => {
  const [step, setStep] = useState(0);
  const [currentValue, setCurrentValue] = useState('');
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const questions = [
    { key: 'firstName', title: "What's your first name?", type: 'input', keyboard: 'default' as const, placeholder: 'John' },
    { key: 'age', title: 'How old are you?', type: 'input', keyboard: 'numeric' as const, placeholder: '25' },
    { key: 'height', title: 'What\'s your height (cm)?', type: 'input', keyboard: 'numeric' as const, placeholder: '175' },
    { key: 'weight', title: 'What\'s your weight (kg)?', type: 'input', keyboard: 'numeric' as const, placeholder: '70' },
    { key: 'gender', title: 'Which gender do you identify with?', type: 'select', options: ['Female', 'Male', 'Other'] },
    { key: 'workouts', title: 'How many times a week do you work out?', type: 'select', options: ['0-2 times', '3-5 times', '6+ times'] },
    { key: 'goal', title: 'What is your primary goal?', type: 'select', options: ['Lose Weight', 'Maintain', 'Gain Weight'] },
    { key: 'source', title: 'How did you hear about us?', type: 'select', options: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Google', 'A Friend'] },
  ];

  // Validation function based on current step
  const validateCurrentInput = (value: string): boolean => {
    const currentQuestion = questions[step];
    let validationResult;

    switch (currentQuestion.key) {
      case 'firstName':
        validationResult = validateFirstName(value);
        break;
      case 'age':
        validationResult = validateAge(value);
        break;
      case 'height':
        validationResult = validateHeight(value);
        break;
      case 'weight':
        validationResult = validateWeight(value);
        break;
      default:
        return true;
    }

    setValidationErrors(prev => ({
      ...prev,
      [currentQuestion.key]: validationResult.error
    }));

    return validationResult.isValid;
  };

  // Handle input change with real-time validation
  const handleInputChange = (value: string) => {
    setCurrentValue(value);
    
    // Clear error when user starts typing
    if (value.trim() === '') {
      setValidationErrors(prev => ({
        ...prev,
        [questions[step].key]: ''
      }));
    } else {
      // Validate in real-time
      validateCurrentInput(value);
    }
  };

  const proceedToNextStep = () => {
    if (step === questions.length - 1) {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setPlanGenerated(true);
        }, 1500);
    } else {
        setStep(step + 1);
        setCurrentValue('');
        setValidationErrors({});
    }
  }

  const handleNextInput = () => {
    if (currentValue.trim() === '') return;
    
    const currentQuestion = questions[step];
    const isValid = validateCurrentInput(currentValue);
    
    if (!isValid) return;
    
    setOnboardingData({ ...onboardingData, [currentQuestion.key]: currentValue });
    setCurrentValue('');
    setValidationErrors(prev => ({
      ...prev,
      [currentQuestion.key]: ''
    }));
    proceedToNextStep();
  };
  
  const handleSelectOption = (key: string, option: string) => {
    setOnboardingData({ ...onboardingData, [key]: option });
    setTimeout(proceedToNextStep, 200); // Small delay for visual feedback
  };

  const handleBack = () => {
    if (step > 0) {
        setCurrentValue('');
        const prevKey = questions[step - 1].key;
        // Clear previous answer to allow re-selection
        setOnboardingData(prevData => {
            const newData = { ...prevData };
            delete newData[prevKey];
            return newData;
        });
        setStep(step - 1);
        setValidationErrors({});
    }
  };

  const navigateToHome = () => {
    setShowCreateAccount(true);
  };

  const handleGoogleSignIn = () => {
    setAccountLoading(true);
    // Simulate Google sign-in process
    setTimeout(() => {
      setAccountLoading(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  const handleSkip = () => {
    setAccountLoading(true);
    // Simulate skip process
    setTimeout(() => {
      setAccountLoading(false);
      router.replace('/(tabs)');
    }, 1500);
  };

  // Check if current input is valid
  const isCurrentInputValid = () => {
    const currentQuestion = questions[step];
    if (currentQuestion.type === 'select') return true;
    
    if (currentValue.trim() === '') return false;
    
    switch (currentQuestion.key) {
      case 'firstName':
        return validateFirstName(currentValue).isValid;
      case 'age':
        return validateAge(currentValue).isValid;
      case 'height':
        return validateHeight(currentValue).isValid;
      case 'weight':
        return validateWeight(currentValue).isValid;
      default:
        return true;
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={theme.white} />;
    }

    if (accountLoading) {
      return (
        <View style={styles.centeredResult}>
          <ActivityIndicator size="large" color={theme.white} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (showCreateAccount) {
      return (
        <View style={styles.createAccountContainer}>
          <Text style={styles.createAccountTitle}>Create an account</Text>
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
            <View style={styles.googleButtonContent}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (planGenerated) {
      return (
        <ScrollView contentContainerStyle={styles.centeredResult}>
          <Text style={styles.header}>Congratulations!{'\n'}Your plan is ready.</Text>
          <Text style={styles.subHeader}>Your goal: Maintain 54.0 kg</Text>
          <View style={styles.planContainer}>
            <View style={styles.planBox}><Text style={styles.planBoxTitle}>Calories</Text><Text style={styles.planValue}>1431</Text></View>
            <View style={styles.planBox}><Text style={styles.planBoxTitle}>Carbs</Text><Text style={styles.planValue}>150g</Text></View>
            <View style={styles.planBox}><Text style={styles.planBoxTitle}>Protein</Text><Text style={styles.planValue}>117g</Text></View>
            <View style={styles.planBox}><Text style={styles.planBoxTitle}>Fats</Text><Text style={styles.planValue}>39g</Text></View>
          </View>
          <TouchableOpacity style={styles.finalContinueButton} onPress={navigateToHome}>
            <Text style={styles.finalContinueText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }
    
    const currentQuestion = questions[step];
    const currentError = validationErrors[currentQuestion.key];
    
    return (
        <View style={styles.onboardingContent}>
            <Text style={styles.questionText}>{currentQuestion.title}</Text>
            {currentQuestion.type === 'select' ? (
                <View style={styles.optionsContainer}>
                    {currentQuestion.options?.map(opt => {
                        const isSelected = onboardingData[currentQuestion.key] === opt;
                        return (
                            <TouchableOpacity 
                                key={opt} 
                                style={[styles.optionButton, isSelected && styles.selectedOptionButton]} 
                                onPress={() => handleSelectOption(currentQuestion.key, opt)}
                            >
                                <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                    {opt}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ) : (
                <>
                    <TextInput
                        style={[
                          styles.textInput,
                          currentError && styles.textInputError
                        ]}
                        value={currentValue}
                        onChangeText={handleInputChange}
                        keyboardType={currentQuestion.keyboard}
                        autoFocus={true}
                        selectionColor={theme.white}
                        placeholder={currentQuestion.placeholder}
                        placeholderTextColor={theme.placeholder}
                    />
                    {currentError && (
                      <Text style={styles.errorText}>{currentError}</Text>
                    )}
                    <TouchableOpacity 
                        style={[
                            styles.continueButton, 
                            isCurrentInputValid() ? styles.continueButtonActive : styles.continueButtonInactive
                        ]} 
                        onPress={handleNextInput} 
                        disabled={!isCurrentInputValid()}
                    >
                        <Text style={isCurrentInputValid() ? styles.continueTextActive : styles.continueTextInactive}>
                            continue
                        </Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar style="light" />
      {!planGenerated && !loading && !showCreateAccount && !accountLoading && step > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
      )}
      {renderContent()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // ---- Global Styles ----
  container: {
    flex: 1,
    backgroundColor: theme.primary,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  backIcon: {
    color: theme.white,
    fontSize: 34,
    fontWeight: 'bold',
  },
  // ---- Onboarding Screens (Input & Select) ----
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  questionText: {
    color: theme.white,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    position: 'absolute',
    top: '25%',
    width: '100%',
  },
  textInput: {
    color: theme.white,
    fontSize: 52,
    fontWeight: '400',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.white,
    paddingBottom: 10,
    marginBottom: 10,
  },
  textInputError: {
    borderBottomColor: theme.error,
  },
  errorText: {
    color: theme.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  optionsContainer: {
    width: '100%',
    marginTop: 60,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: theme.secondary,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  selectedOptionButton: {
    backgroundColor: theme.white,
  },
  optionText: {
    fontSize: 18,
    color: theme.white,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: theme.black,
  },
  continueButton: {
    position: 'absolute',
    bottom: 50,
    width: width * 0.9,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonInactive: {
    backgroundColor: theme.secondary,
  },
  continueButtonActive: {
    backgroundColor: theme.white,
  },
  continueTextInactive: {
    color: theme.white,
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  continueTextActive: {
    color: theme.black,
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  // ---- Result Screen Styles ----
  centeredResult: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: theme.white,
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 40, 
    color: theme.lightText,
  },
  planContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    width: '100%',
  },
  planBox: {
    width: '48%', 
    paddingVertical: 25,
    backgroundColor: theme.secondary, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginBottom: 15,
  },
  planBoxTitle: {
    fontSize: 16, 
    color: theme.lightText,
    fontWeight: '500',
  },
  planValue: {
    fontSize: 24, 
    fontWeight: '700', 
    color: theme.white, 
    marginTop: 5,
  },
  finalContinueButton: {
    backgroundColor: theme.white, 
    paddingVertical: 18, 
    borderRadius: 30, 
    alignItems: 'center', 
    width: '100%', 
    marginTop: 30,
  },
  finalContinueText: {
    color: theme.black,
    fontSize: 18, 
    fontWeight: 'bold',
  },
  // ---- Create Account Screen Styles ----
  createAccountContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: theme.primary,
  },
  createAccountTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.white,
    textAlign: 'center',
    marginBottom: 60,
    position: 'absolute',
    top: '25%',
    width: '100%',
  },
  googleButton: {
    width: '100%',
    backgroundColor: theme.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.white,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: theme.white,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: theme.lightText,
    textAlign: 'center',
  },
  loadingText: {
    color: theme.white,
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
