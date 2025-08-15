import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Color Palette for consistency
const theme = {
  primary: '#FFFFFF',
  secondary: '#F5F5F5',
  white: '#FFFFFF',
  black: '#000000',
  lightText: 'rgba(0, 0, 0, 0.6)',
  placeholder: 'rgba(0, 0, 0, 0.4)',
  gray: '#666666',
  lightGray: '#E5E5E5',
  error: '#FF6B6B',
  buttonInactive: '#E5E5E5',
  buttonActive: '#000000',
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

// Add new validation functions
const validateDesiredWeight = (value: string): { isValid: boolean; error: string } => {
  if (!value.trim()) {
    return { isValid: false, error: 'Desired weight is required' };
  }
  const numValue = parseInt(value);
  if (isNaN(numValue)) {
    return { isValid: false, error: 'Desired weight must be a number' };
  }
  if (numValue < 20 || numValue > 300) {
    return { isValid: false, error: 'Desired weight must be between 20 and 300 kg' };
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
  const [showTimeToGenerate, setShowTimeToGenerate] = useState(false);
  const [showLoadingSetup, setShowLoadingSetup] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [showSkipLoading, setShowSkipLoading] = useState(false);

  const questions = [
    { key: 'firstName', title: "What's your first name?", type: 'input', keyboard: 'default' as const, placeholder: 'John' },
    { key: 'age', title: 'How old are you?', type: 'input', keyboard: 'numeric' as const, placeholder: '25' },
    { key: 'height', title: 'What\'s your height (cm)?', type: 'input', keyboard: 'numeric' as const, placeholder: '175' },
    { key: 'weight', title: 'What\'s your weight (kg)?', type: 'input', keyboard: 'numeric' as const, placeholder: '70' },
    { key: 'gender', title: 'Which gender do you identify with?', type: 'select', options: ['Female', 'Male', 'Other'] },
    { key: 'workouts', title: 'How many times a week do you work out?', type: 'select', options: ['0-2 times', '3-5 times', '6+ times'] },
    { key: 'goal', title: 'What is your primary goal?', type: 'select', options: ['Lose Weight', 'Maintain', 'Gain Weight'] },
    { key: 'desiredWeight', title: 'What is your desired weight (kg)?', type: 'input', keyboard: 'numeric' as const, placeholder: '75' },
    { key: 'obstacles', title: 'What\'s stopping you from reaching your goal?', type: 'select', options: ['Lack of time', 'Lack of motivation', 'Unclear plan', 'Financial constraints', 'Health issues'] },
    { key: 'specificGoal', title: 'Do you follow a specific diet?', type: 'select', options: ['No specific diet', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean'] },
    { key: 'accomplishments', title: 'What would you like to accomplish?', type: 'select', options: ['Build muscle', 'Improve fitness', 'Better health', 'Confidence boost', 'Athletic performance'] },
    { key: 'source', title: 'How did you hear about us?', type: 'select', options: ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'Google', 'A Friend'] },
  ];

  // Add calorie calculation functions
  const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
    if (gender === 'Male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  const getActivityMultiplier = (workouts: string): number => {
    switch (workouts) {
      case '0-2 times': return 1.2; // Sedentary
      case '3-5 times': return 1.55; // Moderate
      case '6+ times': return 1.725; // Very active
      default: return 1.375;
    }
  };

  const calculateCalories = (goal: string, currentWeight: number, desiredWeight: number, tdee: number): number => {
    if (goal === 'Lose Weight') {
      const weeklyLoss = currentWeight - desiredWeight > 10 ? 0.5 : 0.25; // kg per week
      const dailyDeficit = weeklyLoss * 7700 / 7; // 7700 kcal = 1 kg fat
      return Math.round(tdee - dailyDeficit);
    } else if (goal === 'Gain Weight') {
      const weeklyGain = desiredWeight - currentWeight > 10 ? 0.5 : 0.25; // kg per week
      const dailySurplus = weeklyGain * 7700 / 7;
      return Math.round(tdee + dailySurplus);
    } else {
      return Math.round(tdee); // Maintain
    }
  };

  const calculateMacros = (calories: number, weight: number, goal: string) => {
    let proteinRatio, fatRatio;
    
    if (goal === 'Gain Weight') {
      proteinRatio = 2.0; // 2g per kg for muscle gain
      fatRatio = 0.25; // 25% of calories
    } else if (goal === 'Lose Weight') {
      proteinRatio = 2.2; // Higher protein for weight loss
      fatRatio = 0.30; // 30% of calories
    } else {
      proteinRatio = 1.8; // Moderate protein for maintenance
      fatRatio = 0.25; // 25% of calories
    }

    const protein = Math.round(weight * proteinRatio);
    const proteinCalories = protein * 4;
    const fatCalories = Math.round(calories * fatRatio);
    const fat = Math.round(fatCalories / 9);
    const carbCalories = calories - proteinCalories - fatCalories;
    const carbs = Math.round(carbCalories / 4);

    return { protein, fat, carbs, proteinCalories, fatCalories, carbCalories };
  };

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
      case 'desiredWeight':
        validationResult = validateDesiredWeight(value);
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
        setShowTimeToGenerate(true);
    } else {
        setStep(step + 1);
        setCurrentValue('');
        setValidationErrors({});
    }
  }

  const handleTimeToGenerateContinue = () => {
    setShowTimeToGenerate(false);
    setShowLoadingSetup(true);
    startSetupProcess();
  };

  const startSetupProcess = () => {
    const operations = [
      'Applying BMR formula...',
      'Calculating TDEE...',
      'Determining caloric needs...',
      'Optimizing macronutrients...',
      'Finalizing your plan...'
    ];
    
    let currentOpIndex = 0;
    setCurrentOperation(operations[currentOpIndex]);
    setSetupProgress(0);
    
    const interval = setInterval(() => {
      setSetupProgress(prev => {
        const newProgress = prev + 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowLoadingSetup(false);
            setPlanGenerated(true);
          }, 500);
          return 100;
        }
        
        if (newProgress % 20 === 0 && currentOpIndex < operations.length - 1) {
          currentOpIndex++;
          setCurrentOperation(operations[currentOpIndex]);
        }
        
        return newProgress;
      });
    }, 800);
  };

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
    setShowSkipLoading(true);
    // Simulate skip process
    setTimeout(() => {
      setShowSkipLoading(false);
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
      case 'desiredWeight':
        return validateDesiredWeight(currentValue).isValid;
      default:
        return true;
    }
  };

  // Add plan generation function
  const generatePlan = () => {
    const weight = parseInt(onboardingData.weight);
    const height = parseInt(onboardingData.height);
    const age = parseInt(onboardingData.age);
    const gender = onboardingData.gender;
    const workouts = onboardingData.workouts;
    const goal = onboardingData.goal;
    const desiredWeight = parseInt(onboardingData.desiredWeight);

    // Calculate BMR
    const bmr = calculateBMR(weight, height, age, gender);
    
    // Calculate TDEE
    const activityMultiplier = getActivityMultiplier(workouts);
    const tdee = bmr * activityMultiplier;
    
    // Calculate target calories
    const targetCalories = calculateCalories(goal, weight, desiredWeight, tdee);
    
    // Calculate macros
    const macros = calculateMacros(targetCalories, weight, goal);

    return {
      calories: targetCalories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goal,
      currentWeight: weight,
      desiredWeight: desiredWeight
    };
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

    if (showSkipLoading) {
      return (
        <View style={styles.centeredResult}>
          <View style={styles.skipLoadingContainer}>
            <ActivityIndicator size="large" color={theme.black} />
            <Text style={styles.skipLoadingText}>Setting up your account...</Text>
          </View>
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

    if (showTimeToGenerate) {
      return (
        <View style={styles.centeredResult}>
          <View style={styles.circularGraphic}>
            <View style={styles.fingerHeartContainer}>
              <View style={styles.fingerHeart}>
                <Text style={styles.heartSymbol}>♥</Text>
              </View>
              <View style={styles.decorativeDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </View>
          <View style={styles.completionMessage}>
            <View style={styles.checkmarkIcon}>
              <Text style={styles.checkmarkSymbol}>✓</Text>
            </View>
            <Text style={styles.allDoneText}>All done!</Text>
          </View>
          <Text style={styles.generatePlanTitle}>Time to generate your custom plan!</Text>
          <TouchableOpacity style={styles.finalContinueButton} onPress={handleTimeToGenerateContinue}>
            <Text style={styles.finalContinueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (showLoadingSetup) {
      return (
        <View style={styles.centeredResult}>
          <Text style={styles.setupProgressText}>{setupProgress}%</Text>
          <Text style={styles.setupSubHeader}>We're setting everything up for you</Text>
          <View style={styles.setupProgressBarContainer}>
            <View style={styles.setupProgressBar}>
              <View style={[styles.setupProgressFill, { width: `${setupProgress}%` }]} />
            </View>
          </View>
          <Text style={styles.currentOperationText}>{currentOperation}</Text>
          <View style={styles.dailyRecommendationCard}>
            <Text style={styles.recommendationTitle}>Daily recommendation for</Text>
            <View style={styles.recommendationList}>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>Calories</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>Carbs</Text>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>Protein</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>Fats</Text>
              </View>
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>Health score</Text>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    if (planGenerated) {
      const plan = generatePlan();
      return (
        <ScrollView contentContainerStyle={styles.centeredResult}>
          <Text style={styles.header}>Congratulations!{'\n'}Your plan is ready.</Text>
          <Text style={styles.subHeader}>
            Your goal: {plan.goal === 'Lose Weight' ? 'Lose' : plan.goal === 'Gain Weight' ? 'Gain' : 'Maintain'} weight
          </Text>
          <View style={styles.planContainer}>
            <View style={styles.planBox}>
              <Text style={styles.planBoxTitle}>Calories</Text>
              <Text style={styles.planValue}>{plan.calories}</Text>
            </View>
            <View style={styles.planBox}>
              <Text style={styles.planBoxTitle}>Protein</Text>
              <Text style={styles.planValue}>{plan.protein}g</Text>
            </View>
            <View style={styles.planBox}>
              <Text style={styles.planBoxTitle}>Carbs</Text>
              <Text style={styles.planValue}>{plan.carbs}g</Text>
            </View>
            <View style={styles.planBox}>
              <Text style={styles.planBoxTitle}>Fat</Text>
              <Text style={styles.planValue}>{plan.fat}g</Text>
            </View>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsText}>BMR: {plan.bmr} kcal/day</Text>
            <Text style={styles.detailsText}>TDEE: {plan.tdee} kcal/day</Text>
            <Text style={styles.detailsText}>Current: {plan.currentWeight}kg → Target: {plan.desiredWeight}kg</Text>
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
      <StatusBar style="dark" />
      {!planGenerated && !loading && !showCreateAccount && !accountLoading && !showTimeToGenerate && !showLoadingSetup && step > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
      )}
      {!planGenerated && !loading && !showCreateAccount && !accountLoading && !showTimeToGenerate && !showLoadingSetup && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${((step + 1) / questions.length) * 100}%` }]} />
          </View>
        </View>
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
    color: theme.black,
    fontSize: 34,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.lightGray,
    borderRadius: 2,
    marginLeft: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.black,
    borderRadius: 2,
  },
  // ---- Onboarding Screens (Input & Select) ----
  onboardingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  questionText: {
    color: theme.black,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    position: 'absolute',
    top: '25%',
    width: '100%',
  },
  textInput: {
    color: theme.black,
    fontSize: 52,
    fontWeight: '400',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: theme.black,
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
    backgroundColor: theme.black,
  },
  optionText: {
    fontSize: 18,
    color: theme.black,
    fontWeight: '600',
  },
  selectedOptionText: {
    color: theme.white,
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
    backgroundColor: theme.buttonInactive,
  },
  continueButtonActive: {
    backgroundColor: theme.buttonActive,
  },
  continueTextInactive: {
    color: theme.gray,
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  continueTextActive: {
    color: theme.white,
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
    color: theme.black,
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18, 
    textAlign: 'center', 
    marginBottom: 40, 
    color: theme.gray,
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
    color: theme.gray,
    fontWeight: '500',
  },
  planValue: {
    fontSize: 24, 
    fontWeight: '700', 
    color: theme.black, 
    marginTop: 5,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: theme.secondary,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  detailsText: {
    fontSize: 14,
    color: theme.gray,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  finalContinueButton: {
    backgroundColor: theme.white, 
    paddingVertical: 18, 
    borderRadius: 30, 
    alignItems: 'center', 
    width: '100%', 
    marginTop: 30,
    borderWidth: 1,
    borderColor: theme.black,
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
    color: theme.black,
    textAlign: 'center',
    marginBottom: 60,
    position: 'absolute',
    top: '25%',
    width: '100%',
  },
  googleButton: {
    width: '100%',
    backgroundColor: theme.lightGray,
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
    color: theme.gray,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    color: theme.gray,
    fontWeight: '500',
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
    color: theme.gray,
    textAlign: 'center',
  },
  loadingText: {
    color: theme.white,
    fontSize: 18,
    marginTop: 20,
    fontWeight: '500',
  },
  currentOperationText: {
    fontSize: 18,
    color: theme.gray,
    marginBottom: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  setupProgressText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.black,
    marginBottom: 20,
    textAlign: 'center',
  },
  setupSubHeader: {
    fontSize: 20,
    color: theme.gray,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  setupProgressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  setupProgressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: theme.lightGray,
    borderRadius: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  setupProgressBar: {
    height: '100%',
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  setupProgressFill: {
    height: '100%',
    backgroundColor: theme.black,
    borderRadius: 4,
  },
  dailyRecommendationCard: {
    width: '100%',
    backgroundColor: theme.secondary,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.black,
    marginBottom: 15,
  },
  recommendationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: theme.black,
    fontWeight: '500',
  },
  checkmark: {
    fontSize: 18,
    color: theme.black,
    marginLeft: 5,
  },
  // New styles for "Time to generate" screen
  circularGraphic: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  fingerHeartContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fingerHeart: {
    position: 'absolute',
    top: '30%',
    left: '40%',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartSymbol: {
    fontSize: 30,
    color: theme.white,
  },
  decorativeDots: {
    position: 'absolute',
    top: '50%',
    left: '30%',
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.black,
    margin: 2,
  },
  completionMessage: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmarkIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkmarkSymbol: {
    fontSize: 40,
    color: theme.white,
  },
  allDoneText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.black,
  },
  generatePlanTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.black,
    textAlign: 'center',
    marginBottom: 30,
  },
  skipLoadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  skipLoadingText: {
    fontSize: 18,
    color: theme.black,
    marginTop: 10,
    fontWeight: '500',
  },
});export default OnboardingScreen;

