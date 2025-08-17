import DailyRecommendationCard, { Recommendation } from '@/components/DailyRecommendationCard';
import { auth, db } from '@/lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createUserWithEmailAndPassword, signInAnonymously, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Simple responsive sizing helpers based on device width
const isSmallWidth = width < 360;
const titleFontSize = isSmallWidth ? 24 : width < 400 ? 26 : 28;
const optionFontSize = isSmallWidth ? 16 : 18;
const inputFontSize = isSmallWidth ? 40 : width < 400 ? 46 : 52;
const verticalGapAfterTitle = isSmallWidth ? 16 : 20;

// Map social source to Ionicons names
const getSourceIconName = (source: string): any => {
  switch (source) {
    case 'Instagram':
      return 'logo-instagram';
    case 'Facebook':
      return 'logo-facebook';
    case 'TikTok':
      return 'logo-tiktok';
    case 'YouTube':
      return 'logo-youtube';
    default:
      return undefined;
  }
};

// Return emoji for option groups (e.g., diets)
const getOptionEmoji = (key: string, option: string): string | undefined => {
  if (key === 'specificGoal') {
    switch (option) {
      case 'No specific diet':
        return '🍽️';
      case 'Vegetarian':
        return '🥦';
      case 'Vegan':
        return '🌱';
      case 'Keto':
        return '🥓';
      case 'Paleo':
        return '🍖';
      case 'Mediterranean':
        return '🫒';
      default:
        return undefined;
    }
  }
  return undefined;
};

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
  buttonActive: '#4C367D',
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
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [currentValue, setCurrentValue] = useState('');
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
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
    { key: 'source', title: 'How did you hear about us?', type: 'select', options: ['Instagram', 'Facebook', 'TikTok', 'YouTube'] },
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
    // Create an anonymous account and persist the collected onboarding data
    signInAnonymously(auth)
      .then(async (cred) => {
        const uid = cred.user.uid;
        const plan = planGenerated ? (() => {
          const base = generatePlan();
          const edits = (onboardingData as any).edits || {};
          return {
            calories: edits.calories ?? base.calories,
            protein: edits.protein ?? base.protein,
            carbs: edits.carbs ?? base.carbs,
            fat: edits.fat ?? base.fat,
            bmr: base.bmr,
            tdee: base.tdee,
            goal: base.goal,
            currentWeight: base.currentWeight,
            desiredWeight: base.desiredWeight,
          };
        })() : null;
        await setDoc(doc(db, 'users', uid), {
          profile: {
            ...onboardingData,
          },
          plan,
          createdAt: serverTimestamp(),
          isGuest: true,
        }, { merge: true });
        setShowSkipLoading(false);
        router.replace('/(tabs)');
      })
      .catch((err) => {
        setShowSkipLoading(false);
        const code = (err && (err.code || err?.message)) || '';
        if (String(code).includes('auth/operation-not-allowed')) {
          setAccountError('Please enable Anonymous sign-in in Firebase Authentication to use Skip.');
        } else {
          setAccountError('Failed to skip. Please try again.');
        }
      });
  };

  const saveUserToFirestore = async (uid: string, userEmail?: string | null) => {
    const plan = planGenerated ? (() => {
      const base = generatePlan();
      const edits = (onboardingData as any).edits || {};
      return {
        calories: edits.calories ?? base.calories,
        protein: edits.protein ?? base.protein,
        carbs: edits.carbs ?? base.carbs,
        fat: edits.fat ?? base.fat,
        bmr: base.bmr,
        tdee: base.tdee,
        goal: base.goal,
        currentWeight: base.currentWeight,
        desiredWeight: base.desiredWeight,
      };
    })() : null;
    await setDoc(doc(db, 'users', uid), {
      profile: {
        ...onboardingData,
        email: userEmail ?? onboardingData.email ?? '',
      },
      plan,
      createdAt: serverTimestamp(),
      isGuest: false,
    }, { merge: true });
  };

  const handleEmailPasswordSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      setAccountError('Please enter email and password');
      setAccountInfo('');
      return;
    }
    setAccountError('');
    setAccountInfo('');
    setAccountLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      const firstName = onboardingData.firstName || 'User';
      try { await updateProfile(cred.user, { displayName: firstName }); } catch {}
      await saveUserToFirestore(cred.user.uid, cred.user.email ?? email.trim());
      setAccountLoading(false);
      setAccountInfo('Account created successfully. Redirecting...');
      setTimeout(() => router.replace('/(tabs)'), 800);
    } catch (err: any) {
      setAccountLoading(false);
      setAccountInfo('');
      const code = err?.code as string | undefined;
      switch (code) {
        case 'auth/operation-not-allowed':
          setAccountError('Enable Email/Password in Firebase → Authentication → Sign-in method.');
          break;
        case 'auth/email-already-in-use':
          setAccountError('This email is already in use. Try signing in.');
          break;
        case 'auth/invalid-email':
          setAccountError('Invalid email address.');
          break;
        case 'auth/weak-password':
          setAccountError('Password should be at least 6 characters.');
          break;
        default:
          setAccountError(err?.message || 'Failed to create account');
      }
    }
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
  
  // Build recommendation data for the ring card while loading
  const getLoadingRecommendations = (): Recommendation[] => {
    return [
      { key: 'calories', label: 'Calories', value: 0, unit: '', progress: 0.2, color: theme.black, trackColor: theme.lightGray, icon: <Ionicons name="flame" size={18} color={theme.black} /> },
      { key: 'carbs', label: 'Carbs', value: 0, unit: 'g', progress: 0.2, color: '#D9822B', trackColor: theme.lightGray, icon: <Ionicons name="leaf" size={18} color="#D9822B" /> },
      { key: 'protein', label: 'Protein', value: 0, unit: 'g', progress: 0.2, color: '#E35D6A', trackColor: theme.lightGray, icon: <Ionicons name="flash" size={18} color="#E35D6A" /> },
      { key: 'fat', label: 'Fats', value: 0, unit: 'g', progress: 0.2, color: '#5B8DEF', trackColor: theme.lightGray, icon: <Ionicons name="water" size={18} color="#5B8DEF" /> },
    ];
  };

  // Build real recommendations from the generated plan
  const getPlanRecommendations = (plan: ReturnType<typeof generatePlan>): Recommendation[] => {
    // Apply user edits if they exist
    const edits = (onboardingData as any).edits || {};
    const calories = edits.calories ?? plan.calories;
    const carbs = edits.carbs ?? plan.carbs;
    const protein = edits.protein ?? plan.protein;
    const fat = edits.fat ?? plan.fat;
    return [
      { key: 'calories', label: 'Calories', value: calories, unit: '', progress: 0.8, color: theme.black, trackColor: theme.lightGray, icon: <Ionicons name="flame" size={18} color={theme.black} /> },
      { key: 'carbs', label: 'Carbs', value: carbs, unit: 'g', progress: 0.6, color: '#D9822B', trackColor: theme.lightGray, icon: <Ionicons name="leaf" size={18} color="#D9822B" /> },
      { key: 'protein', label: 'Protein', value: protein, unit: 'g', progress: 0.6, color: '#E35D6A', trackColor: theme.lightGray, icon: <Ionicons name="flash" size={18} color="#E35D6A" /> },
      { key: 'fat', label: 'Fats', value: fat, unit: 'g', progress: 0.6, color: '#5B8DEF', trackColor: theme.lightGray, icon: <Ionicons name="water" size={18} color="#5B8DEF" /> },
    ];
  };

  // Edit modal state
  const [editKey, setEditKey] = useState<null | Recommendation['key']>(null);
  const [editValue, setEditValue] = useState('');

  const onEditRecommendation = (key: Recommendation['key']) => {
    setEditKey(key);
    // seed value from existing plan if available
    if (planGenerated) {
      const plan = generatePlan();
      const map: Record<string, number> = { calories: plan.calories, carbs: plan.carbs, protein: plan.protein, fat: plan.fat };
      setEditValue(String(map[key] ?? 0));
    } else {
      setEditValue('0');
    }
  };

  const commitEdit = () => {
    if (!editKey) return;
    const valueNum = parseInt(editValue || '0');
    // Store edits in onboardingData under a dedicated namespace
    setOnboardingData(prev => ({ ...prev, edits: { ...(prev.edits || {}), [editKey]: valueNum } }));
    setEditKey(null);
  };
  
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={theme.white} />;
    }

    if (accountLoading && !showCreateAccount) {
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
        <View style={[styles.createAccountContainer, { paddingTop: Math.max(24, insets.top + 8) }]}>
          <Text style={styles.createAccountTitle}>Create an account</Text>
          <View style={{ width: '100%', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: theme.gray, marginBottom: 6 }}>Email</Text>
            <TextInput
              style={[styles.modalInput, { width: '100%' }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={{ width: '100%', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: theme.gray, marginBottom: 6 }}>Password</Text>
            <TextInput
              style={[styles.modalInput, { width: '100%' }]}
              placeholder="Enter your password"
              placeholderTextColor={theme.placeholder}
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {!!accountError && (
            <Text style={{ color: theme.error, width: '100%', marginBottom: 8 }}>{accountError}</Text>
          )}
          {!!accountInfo && (
            <Text style={{ color: '#2E7D32', width: '100%', marginTop: 4 }}>{accountInfo}</Text>
          )}
          <TouchableOpacity 
            style={[styles.finalContinueButton, accountLoading && { opacity: 0.8 }]} 
            onPress={handleEmailPasswordSignUp}
            disabled={accountLoading}
          >
            {accountLoading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.black} style={{ marginRight: 8 }} />
                <Text style={styles.finalContinueText}>Creating...</Text>
              </View>
            ) : (
              <Text style={styles.finalContinueText}>Create account</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.googleButton, { marginTop: 16 }]} onPress={handleGoogleSignIn}>
            <View style={styles.googleButtonContent}>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </View>
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
          <DailyRecommendationCard
            title="Daily recommendation"
            subtitle="You can edit this any time"
            items={getLoadingRecommendations()}
            onEdit={(key) => onEditRecommendation(key)}
          />
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
          <DailyRecommendationCard
            title="Daily recommendation"
            subtitle="You can edit this any time"
            items={getPlanRecommendations(plan)}
            onEdit={(key) => onEditRecommendation(key)}
          />
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
                        const iconName = currentQuestion.key === 'source' ? getSourceIconName(opt) : undefined;
                        const iconColor = isSelected ? theme.white : theme.black;
                        const emoji = getOptionEmoji(currentQuestion.key, opt);
                        return (
                            <TouchableOpacity 
                                key={opt} 
                                style={[styles.optionButton, isSelected && styles.selectedOptionButton]} 
                                onPress={() => handleSelectOption(currentQuestion.key, opt)}
                            >
                                <View style={styles.optionContent}>
                                  {iconName && (
                                    <Ionicons name={iconName as any} size={22} color={iconColor} style={styles.optionIcon} />
                                  )}
                                  {!iconName && emoji && (
                                    <Text style={[styles.optionEmoji, isSelected && styles.selectedOptionText]}>{emoji}</Text>
                                  )}
                                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                      {opt}
                                  </Text>
                                </View>
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
      {/* Edit modal */}
      <Modal visible={!!editKey} transparent animationType="slide" onRequestClose={() => setEditKey(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit {editKey ? editKey.charAt(0).toUpperCase() + editKey.slice(1) : ''} Goal</Text>
            <View style={{ height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 26, fontWeight: '700' }}>{editValue}{editKey === 'calories' ? '' : 'g'}</Text>
            </View>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={editValue}
              onChangeText={setEditValue}
              placeholder="Enter value"
              placeholderTextColor={theme.placeholder}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => setEditKey(null)}>
                <Text style={styles.modalSecondaryText}>Revert</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimary} onPress={commitEdit}>
                <Text style={styles.modalPrimaryText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  questionText: {
    color: theme.black,
    fontSize: titleFontSize,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    lineHeight: titleFontSize * 1.2,
    marginBottom: verticalGapAfterTitle,
  },
  textInput: {
    color: theme.black,
    fontSize: inputFontSize,
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
    marginTop: 0,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 18,
    backgroundColor: theme.secondary,
    borderRadius: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIcon: {
    marginRight: 10,
  },
  optionEmoji: {
    marginRight: 8,
    fontSize: optionFontSize,
  },
  selectedOptionButton: {
    backgroundColor: theme.black,
  },
  optionText: {
    fontSize: optionFontSize,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.black,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.lightGray,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    color: theme.black,
  },
  modalActions: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalSecondary: {
    borderWidth: 1,
    borderColor: theme.black,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    width: '45%',
    alignItems: 'center',
  },
  modalSecondaryText: {
    color: theme.black,
    fontWeight: '700',
    fontSize: 16,
  },
  modalPrimary: {
    backgroundColor: theme.black,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    width: '45%',
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: theme.white,
    fontWeight: '700',
    fontSize: 16,
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
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 24,
    paddingTop: 32,
    backgroundColor: theme.primary,
  },
  createAccountTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.black,
    textAlign: 'left',
    marginBottom: 24,
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

