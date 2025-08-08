import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Qaybta shaashadda hore (Initial View)
const InitialView = ({ onContinue }: { onContinue: () => void }) => {
  return (
    <>
      {/* Main heading */}
      <Text style={styles.mainHeading}>
        We want you to try CalAI for free.
      </Text>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Offer details */}
      <View style={styles.offerDetails}>
        <View style={styles.checkmarkRow}>
          <Text style={{color: '#4CAF50', fontWeight: 'bold', fontSize: 18}}>✓</Text>
          <Text style={styles.checkmarkText}>No Payment Due Now</Text>
        </View>
      </View>

      {/* Call to action button */}
      <TouchableOpacity style={styles.ctaButton} onPress={onContinue}>
        <Text style={styles.ctaButtonText}>Try for $0.00</Text>
      </TouchableOpacity>

      {/* Subscription information */}
      <Text style={styles.subscriptionInfo}>
        Just $29.99 per year ($2.49/mo)
      </Text>
    </>
  );
};

// Qaybta shaashadda labaad (Trial Offer View)
const TrialOfferView = ({ selectedPlan, onSelectPlan, onStart }) => {
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
          <Text style={[styles.optionPrice, selectedPlan === 'monthly' && styles.selectedText]}>$9.99 /mo</Text>
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

      <Text style={styles.subscriptionInfo}>3 days free, then $29.99 per year ($2.49/mo)</Text>
    </>
  );
};


// [CUSUB] Shaashadda yar ee lacag bixinta (Payment Dialog Component)
const PaymentDialog = ({ visible, onClose, selectedPlan }) => {
  const [phoneNumber, setPhoneNumber] = useState('252');

  const handleSubscription = () => {
    // Hubi in lambarku sax yahay (ugu yaraan 10 xarafood oo leh 252)
    if (phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid Somali phone number (e.g., 25261xxxxxxx).");
      return;
    }
    console.log(`Subscribing to ${selectedPlan} plan with phone number: ${phoneNumber}`);
    // Halkan ku dar logic-ka dhabta ah ee lacag bixinta
    Alert.alert("Success", `You have subscribed to the ${selectedPlan} plan!`);
    onClose(); // Xir shaashadda kadib guusha
  };
  
  // Hubi in user-ku uusan masixi karin '252'
  const handlePhoneChange = (text) => {
    if (text.startsWith('252')) {
      setPhoneNumber(text);
    }
  };

  const planDetails = {
    monthly: { name: 'Cal AI Monthly Plan', price: '$9.99/month' },
    yearly: { name: 'Cal AI Yearly Plan', price: '$29.99/year' }
  };

  const currentPlan = planDetails[selectedPlan];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContainer}>
          <Text style={styles.dialogTitle}>{currentPlan.name}</Text>
          <Text style={styles.dialogPrice}>Starting today {currentPlan.price}</Text>
          
          <Text style={styles.inputLabel}>Enter your phone number</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="252xxxxxxxxx"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={12}
          />
          
          <TouchableOpacity style={styles.continueButton} onPress={handleSubscription}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
             <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};


export default function ScanScreen() {
  const [showTrialDetails, setShowTrialDetails] = useState(false);
  // [CUSUB] State lagu maareeyo doorashada iyo dialog-ga
  const [selectedPlan, setSelectedPlan] = useState('yearly'); // Default waa yearly
  const [isDialogVisible, setDialogVisible] = useState(false);

  const handleBack = () => {
    if (showTrialDetails) {
      setShowTrialDetails(false);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header-ka guud */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Qaybta hoose ee isbeddelaysa */}
      <View style={styles.content}>
        {showTrialDetails ? (
          <TrialOfferView 
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            onStart={() => setDialogVisible(true)} // Fur dialog-ga
          />
        ) : (
          <InitialView onContinue={() => setShowTrialDetails(true)} />
        )}
      </View>

      {/* [CUSUB] Render-ka dialog-ga lacag bixinta */}
      <PaymentDialog 
        visible={isDialogVisible}
        onClose={() => setDialogVisible(false)}
        selectedPlan={selectedPlan}
      />
    </SafeAreaView>
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
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 60,
  },
  spacer: {
    flex: 1,
  },
  offerDetails: {
    marginBottom: 20,

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

  // [CUSUB] Styles-ka Dialog-ga Lacag Bixinta
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dialogContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dialogPrice: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    fontSize: 16,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF', // Midabka buluugga ah
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#007AFF',
    marginTop: 15,
    fontSize: 16,
  }
});
