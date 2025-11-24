import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useAction, useMutation, useQuery } from 'convex/react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Qaybta shaashadda hore (Initial View)
const InitialView = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <>
      {/* Main heading */}
      <Text style={styles.mainHeading}>
        We want you to try CalAI for free.
      </Text>

      {/* Offer details */}
      <View style={styles.offerDetails}>
        <View style={styles.checkmarkRow}>
          <Text style={{ color: '#4CAF50', fontWeight: 'bold', fontSize: 18 }}>✓</Text>
          <Text style={styles.checkmarkText}>No Payment Due Now</Text>
        </View>
      </View>

      {/* Call to action button */}
      <TouchableOpacity style={styles.ctaButton} onPress={onContinue}>
        <Text style={styles.ctaButtonText}>Try for $0.00</Text>
      </TouchableOpacity>

      {/* Subscription information */}
      <Text style={styles.subscriptionInfo}>
        Just $0.01 per year (for testing)
      </Text>
    </>
  );
};

type PlanType = 'monthly' | 'yearly';

// Qaybta shaashadda labaad (Trial Offer View)
const TrialOfferView = ({ selectedPlan, onSelectPlan, onStart }: { selectedPlan: PlanType; onSelectPlan: (p: PlanType) => void; onStart: () => void; }) => {
  return (
    <>
      <Text style={styles.trialTitle}>Start your 3-day FREE trial to continue.</Text>

      {/* Timeline Section */}
      <View style={styles.timelineContainer}>
        {/* Item 1 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineIconContainer}><Text style={styles.iconText}>🛍️</Text></View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineHeader}>Today</Text>
            <Text style={styles.timelineSubHeader}>Unlock all the app's features like AI calorie scanning and more.</Text>
          </View>
        </View>
        <View style={styles.timelineConnector} />
        {/* Item 2 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineIconContainer}><Text style={styles.iconText}>🔔</Text></View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineHeader}>In 2 Days - Reminder</Text>
            <Text style={styles.timelineSubHeader}>We'll send you a reminder that your trial is ending soon.</Text>
          </View>
        </View>
        <View style={styles.timelineConnector} />
        {/* Item 3 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineIconContainer}><Text style={styles.iconText}>👑</Text></View>
          <View style={styles.timelineTextContainer}>
            <Text style={styles.timelineHeader}>In 3 Days - Billing Starts</Text>
            <Text style={styles.timelineSubHeader}>You'll be charged on Aug 09, 2025 unless you cancel anytime before.</Text>
          </View>
        </View>
      </View>

      {/* Subscription Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={[styles.option, selectedPlan === 'monthly' && styles.selectedOption]}
          onPress={() => onSelectPlan('monthly')}
        >
          <Text style={[styles.optionTitle, selectedPlan === 'monthly' && styles.selectedText]}>Monthly</Text>
          <Text style={[styles.optionPrice, selectedPlan === 'monthly' && styles.selectedText]}>$0.01 /mo</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.option, selectedPlan === 'yearly' && styles.selectedOption]}
          onPress={() => onSelectPlan('yearly')}
        >
          <Text style={[styles.optionTitle, selectedPlan === 'yearly' && styles.selectedText]}>Yearly</Text>
          <Text style={[styles.optionPrice, selectedPlan === 'yearly' && styles.selectedText]}>$2.49/mo</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>3 DAYS FREE</Text></View>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.checkmarkText}>✓ No Payment Due Now</Text>

      <TouchableOpacity style={styles.ctaButton} onPress={onStart}>
        <Text style={styles.ctaButtonText}>Start My 3-Day Free Trial</Text>
      </TouchableOpacity>

      <Text style={styles.subscriptionInfo}>3 days free, then $0.01 per year (for testing)</Text>
    </>
  );
};

export default function BillingScreen() {
  const [showTrialDetails, setShowTrialDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('252');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const insets = useSafeAreaInsets();
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | null;
  const updateSubscriptionMutation = useMutation(api.users.updateSubscription);
  const waafiPreAuthorizeAction = useAction(api.actions.waafiPreAuthorize);
  const waafiCommitAction = useAction(api.actions.waafiPreAuthorizeCommit);
  const waafiCancelAction = useAction(api.actions.waafiPreAuthorizeCancel);
  
  // Check if subscription is required (admin setting)
  const isSubscriptionRequired = useQuery(api.users.isSubscriptionRequired);
  
  // Check if user already has active subscription
  const subscriptionStatus = useQuery(
    api.users.hasActiveSubscription,
    userId ? { userId } : "skip"
  );

  const navigateToHome = useCallback(() => {
    console.log('[Billing] Navigating to home');
    router.replace('/(tabs)');
  }, []);
  
  // Redirect if subscription is not required (free mode) or user already has subscription
  useEffect(() => {
    console.log('[Billing] Subscription status check:', {
      userId,
      isSubscriptionRequired,
      subscriptionStatus: subscriptionStatus !== undefined ? {
        hasSubscription: subscriptionStatus.hasSubscription,
        isActive: subscriptionStatus.isActive,
        planType: subscriptionStatus.planType,
        startDate: subscriptionStatus.startDate ? new Date(subscriptionStatus.startDate).toISOString() : null,
        endDate: subscriptionStatus.endDate ? new Date(subscriptionStatus.endDate).toISOString() : null,
        now: new Date().toISOString(),
      } : 'loading...',
    });
    
    // If subscription is not required, redirect to home (free mode)
    if (isSubscriptionRequired === false) {
      console.log('[Billing] ✅ Subscription not required (free mode) - redirecting to home');
      navigateToHome();
      return;
    }
    
    if (userId && subscriptionStatus !== undefined) {
      if (subscriptionStatus.hasSubscription && subscriptionStatus.isActive) {
        console.log('[Billing] ✅ User already has active subscription - redirecting to home');
        console.log('[Billing] Subscription details:', {
          planType: subscriptionStatus.planType,
          startDate: subscriptionStatus.startDate ? new Date(subscriptionStatus.startDate).toISOString() : null,
          endDate: subscriptionStatus.endDate ? new Date(subscriptionStatus.endDate).toISOString() : null,
          isInRange: subscriptionStatus.startDate && subscriptionStatus.endDate 
            ? Date.now() >= subscriptionStatus.startDate && Date.now() <= subscriptionStatus.endDate
            : 'N/A',
        });
        navigateToHome();
      } else {
        console.log('[Billing] ❌ User does not have active subscription - showing billing screen');
      }
    }
  }, [userId, subscriptionStatus, isSubscriptionRequired, navigateToHome]);

  const handleClose = () => {
    navigateToHome();
  };

  const handleBack = () => {
    if (showPaymentScreen) {
      setShowPaymentScreen(false);
    } else if (showTrialDetails) {
      setShowTrialDetails(false);
    } else {
      navigateToHome();
    }
  };

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (showPaymentScreen) {
          setShowPaymentScreen(false);
          return true; // Prevent default behavior
        } else if (showTrialDetails) {
          setShowTrialDetails(false);
          return true; // Prevent default behavior
        } else {
          navigateToHome();
          return true; // Prevent default behavior
        }
      });

      return () => backHandler.remove();
    }
  }, [showPaymentScreen, showTrialDetails, navigateToHome]);

  const handleSubscription = async () => {
    console.log('[Billing] handleSubscription called');
    
    if (phoneNumber.length < 10) {
      console.log('[Billing] ❌ Invalid phone number');
      Alert.alert('Error', 'Please enter a valid Somali phone number (e.g., 25261xxxxxxx).');
      return;
    }
    
    if (!userId) {
      console.log('[Billing] ❌ No userId');
      Alert.alert('Error', 'User not found. Please try again.');
      return;
    }
    
    // Calculate amount based on plan
    const amount = selectedPlan === 'monthly' ? '0.01' : '0.01';
    const currency = 'USD';
    const referenceId = `sub_${userId}_${Date.now()}`;
    
    console.log('[Billing] Starting WaafiPay preauthorization:', {
      userId,
      planType: selectedPlan,
      phoneNumber,
      amount,
      referenceId,
    });
    
    setIsSubscribing(true);
    let waafiTransactionId: string | null = null;
    
    try {
      // Step 1: Preauthorize (hold funds)
      console.log('[Billing] Step 1: Preauthorizing payment...');
      const preAuthResult = await waafiPreAuthorizeAction({
        phoneNumber: phoneNumber,
        amount: amount,
        currency: currency,
        planType: selectedPlan,
        referenceId: referenceId,
      });
      
      if (!preAuthResult.success || !preAuthResult.transactionId) {
        console.error('[Billing] ❌ Preauthorization failed:', preAuthResult);
        const errorMessage = preAuthResult.error || 'Your payment could not be processed. Please check your phone number and try again.';
        Alert.alert(
          'Payment Failed',
          errorMessage,
          [{ text: 'OK', style: 'default' }]
        );
        setIsSubscribing(false);
        return;
      }
      
      waafiTransactionId = preAuthResult.transactionId;
      console.log('[Billing] ✅ Preauthorization successful, transaction ID:', waafiTransactionId);
      
      // Step 2: Commit the transaction (charge the customer)
      console.log('[Billing] Step 2: Committing transaction...');
      if (!waafiTransactionId) {
        throw new Error('Transaction ID is missing');
      }
      
      const commitResult = await waafiCommitAction({
        transactionId: waafiTransactionId,
        description: `CalAI ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
      });
      
      if (!commitResult.success) {
        console.error('[Billing] ❌ Commit failed:', commitResult);
        // Try to cancel the preauthorization
        try {
          if (waafiTransactionId) {
            await waafiCancelAction({
              transactionId: waafiTransactionId,
              description: 'Subscription commit failed',
            });
          }
        } catch (cancelError) {
          console.error('[Billing] Failed to cancel after commit error:', cancelError);
        }
        
        const commitErrorMessage = commitResult.error || 'Failed to process your payment. Please try again.';
        Alert.alert(
          'Payment Failed',
          commitErrorMessage,
          [{ text: 'OK', style: 'default' }]
        );
        setIsSubscribing(false);
        return;
      }
      
      console.log('[Billing] ✅ Transaction committed successfully');
      
      // Step 3: Update subscription in database
      console.log('[Billing] Step 3: Updating subscription...');
      const result = await updateSubscriptionMutation({
        userId,
        planType: selectedPlan,
        phoneNumber: phoneNumber,
        waafiTransactionId: waafiTransactionId || undefined,
      });
      
      console.log('[Billing] ✅ Subscription successful:', result);
      console.log('[Billing] Subscription should now be active from', new Date().toISOString());
      
      Alert.alert('Success', `You have subscribed to the ${selectedPlan} plan!`);
      // Navigate to home after successful subscription
      navigateToHome();
    } catch (error: any) {
      console.error('[Billing] ❌ Subscription error:', error);
      
      // If we have a transaction ID, try to cancel it
      if (waafiTransactionId) {
        try {
          console.log('[Billing] Attempting to cancel transaction:', waafiTransactionId);
          await waafiCancelAction({
            transactionId: waafiTransactionId,
            description: 'Subscription error - cancelling',
          });
          console.log('[Billing] ✅ Transaction cancelled');
        } catch (cancelError) {
          console.error('[Billing] Failed to cancel transaction:', cancelError);
        }
      }
      
      // Get user-friendly error message
      let errorMessage = 'Failed to subscribe. Please try again.';
      
      if (error?.message) {
        // Check if it's a WaafiPay error
        if (error.message.includes('account balance') || error.message.includes('not sufficient')) {
          errorMessage = 'Your account balance is not sufficient. Please add funds to your mobile wallet and try again.';
        } else if (error.message.includes('phone number') || error.message.includes('Invalid')) {
          errorMessage = 'Please check your phone number and try again. Make sure it starts with 252.';
        } else if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('cancelled') || error.message.includes('declined')) {
          errorMessage = 'Payment was cancelled or declined. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Payment Error',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const handlePhoneChange = (text: string) => {
    if (text.startsWith('252')) {
      setPhoneNumber(text);
    }
  };

  const planDetails: Record<PlanType, { name: string; price: string }> = {
    monthly: { name: 'Cal AI Monthly Plan', price: '$0.01/month (testing)' },
    yearly: { name: 'Cal AI Yearly Plan', price: '$0.01/year (testing)' }
  };

  const currentPlan = planDetails[selectedPlan];

  // Payment Screen View
  if (showPaymentScreen) {
    return (
      <View style={styles.container}>
        <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
        
        {/* Header with back button */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.paymentContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.paymentTitle}>{currentPlan.name}</Text>
          <Text style={styles.paymentPrice}>Starting today {currentPlan.price}</Text>
          
          <View style={styles.paymentForm}>
            <Text style={styles.inputLabel}>Enter your phone number</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="252xxxxxxxxx"
              placeholderTextColor="#999"
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={12}
              autoFocus={false}
            />
            
            <TouchableOpacity 
              style={[styles.continueButton, isSubscribing && { opacity: 0.7 }]} 
              onPress={handleSubscription}
              disabled={isSubscribing}
            >
              <Text style={styles.continueButtonText}>
                {isSubscribing ? 'Subscribing...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleBack} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Main Billing Screen View
  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
      
      {/* Header with close button */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {showTrialDetails ? (
          <TrialOfferView 
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onStart={() => setShowPaymentScreen(true)}
          />
        ) : (
          <InitialView onContinue={() => setShowTrialDetails(true)} />
        )}
      </ScrollView>
    </View>
  );
}

// Dhammaan Styles-ka oo la isku geeyay
const styles = StyleSheet.create({
  // Styles-ka Guud
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%',
  },
  ctaButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscriptionInfo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  checkmarkText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  mainHeading: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 20,
    marginBottom: 40,
  },
  offerDetails: {
    marginBottom: 30,
  },
  checkmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trialTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 38,
  },
  timelineContainer: {
    marginBottom: 30,
    width: '100%',
    alignSelf: 'flex-start',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  timelineIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timelineSubHeader: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  timelineConnector: {
    width: 2,
    height: 25,
    backgroundColor: '#ccc',
    marginLeft: 18,
    marginBottom: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    gap: 10,
  },
  option: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#000',
    borderWidth: 2.5,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  selectedText: {
    color: '#000',
  },
  optionPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // [CUSUB] Styles-ka Payment Screen-ga
  paymentContentContainer: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  paymentTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentPrice: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  paymentForm: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontWeight: '500',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    fontSize: 18,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  }
});
