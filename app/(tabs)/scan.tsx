import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
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
const TrialOfferView = () => {
  const handleStartTrial = () => {
    console.log('Start 3-Day Free Trial pressed');
    // Halkan, waxaad aadi kartaa shaashadda xigta ee ah xaqiijinta
    // router.push('/confirmation-screen'); 
  };
  
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
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionTitle}>Monthly</Text>
          <Text style={styles.optionPrice}>$9.99 /mo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, styles.selectedOption]}>
          <Text style={[styles.optionTitle, styles.selectedText]}>Yearly</Text>
          <Text style={[styles.optionPrice, styles.selectedText]}>$2.49/mo</Text>
          <View style={styles.badge}><Text style={styles.badgeText}>3 DAYS FREE</Text></View>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.checkmarkText}>✓ No Payment Due Now</Text>

      <TouchableOpacity style={styles.ctaButton} onPress={handleStartTrial}>
        <Text style={styles.ctaButtonText}>Start My 3-Day Free Trial</Text>
      </TouchableOpacity>

      <Text style={styles.subscriptionInfo}>3 days free, then $29.99 per year ($2.49/mo)</Text>
    </>
  );
};


export default function ScanScreen() {
  const [showTrialDetails, setShowTrialDetails] = useState(false);

  const handleBack = () => {
    if (showTrialDetails) {
      // Haddii aan ku jirno shaashadda labaad, ku noqo tii hore
      setShowTrialDetails(false);
    } else {
      // Haddii aan ku jirno shaashadda hore, gebi ahaanba bax
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
        {/* Cinwaanka waxaad ka saari kartaa haddii aadan rabin inuu ka muuqdo shaashadda labaad */}
        {/* {!showTrialDetails && <Text style={styles.headerTitle}>Subscription</Text>} */}
      </View>

      {/* Qaybta hoose ee isbeddelaysa */}
      <View style={styles.content}>
        {showTrialDetails ? (
          <TrialOfferView />
        ) : (
          <InitialView onContinue={() => setShowTrialDetails(true)} />
        )}
      </View>
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
    paddingHorizontal: 10, // La yareeyay si back button-ka gees uugu dhawaado
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

  // Styles-ka Shaashadda Hore (InitialView)
  mainHeading: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    lineHeight: 40,
    marginTop: 60, // Si qoraalka hoos ugu dego
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
  
  // Styles-ka Shaashadda Labaad (TrialOfferView)
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
    marginLeft: 18, // Si ay ula simanto icon-ka
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: '#000',
    borderWidth: 2,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
}); 