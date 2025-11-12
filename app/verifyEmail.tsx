import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMutation } from 'convex/react';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors, colorScheme);
  const insets = useSafeAreaInsets();
  
  const params = useLocalSearchParams();
  const newEmail = params.newEmail as string;
  const devCode = params.devCode as string | undefined; // For development only
  
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  
  const [code, setCode] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const verifyEmailCode = useMutation(api.users.verifyEmailCode);
  const sendEmailVerificationCode = useMutation(api.users.sendEmailVerificationCode);
  
  // Show dev code in alert for development (remove in production)
  useEffect(() => {
    if (devCode && __DEV__) {
      Alert.alert(
        'Development Mode',
        `Verification code: ${devCode}\n\nThis is only shown in development.`,
        [{ text: 'OK' }]
      );
    }
  }, [devCode]);
  
  const handleVerify = async () => {
    // Clear previous error
    setErrorMessage('');
    
    if (!userId) {
      setErrorMessage('Unable to verify email. Please try signing in again.');
      return;
    }
    
    if (!code.trim() || code.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }
    
    try {
      setVerifying(true);
      setErrorMessage(''); // Clear error before attempting verification
      
      // Call mutation - now returns { success: boolean, error?: string, newEmail?: string }
      const result = await verifyEmailCode({ userId, code: code.trim() });
      
      // Check if verification was successful
      if (result.success) {
        // Success - show alert and navigate
        Alert.alert(
          'Email Verified Successfully',
          'Your email address has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/settings'),
            },
          ]
        );
      } else {
        // Validation error - show user-friendly message
        setErrorMessage(result.error || 'Unable to verify email. Please try again.');
      }
    } catch (error: any) {
      // Only unexpected errors (like network errors, user not found) will be caught here
      let userFriendlyMessage = 'Unable to verify email. Please try again.';
      
      if (error?.message) {
        const errorMsg = String(error.message).trim();
        if (errorMsg.includes('Account not found')) {
          userFriendlyMessage = 'Unable to verify email. Please try signing in again.';
        } else {
          // Use the error message if it's already user-friendly
          userFriendlyMessage = errorMsg;
        }
      }
      
      // Set error message (this will show inline, not as Convex overlay)
      setErrorMessage(userFriendlyMessage);
      
      // Log error in development only (not shown to user)
      if (__DEV__) {
        console.error('[Email Verification Error]', error);
      }
    } finally {
      setVerifying(false);
    }
  };
  
  const handleResendCode = async () => {
    // Clear any existing error
    setErrorMessage('');
    
    if (!userId || !newEmail) {
      setErrorMessage('Unable to resend verification code. Please try again.');
      return;
    }
    
    try {
      setResending(true);
      const result = await sendEmailVerificationCode({ userId, newEmail });
      
      // Clear the code input and any errors
      setCode('');
      setErrorMessage('');
      
      // Show dev code in development
      if (result.code && __DEV__) {
        Alert.alert(
          'Code Resent (Development Mode)',
          `A new verification code has been sent.\n\nVerification code: ${result.code}\n\n(This is only shown in development mode)`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Code Resent',
          'A new 6-digit verification code has been sent to your email. Please check your inbox.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      // Convert Convex errors to user-friendly messages
      let userFriendlyMessage = 'Unable to resend verification code. Please try again.';
      
      if (error.message) {
        if (error.message.includes('already registered') || error.message.includes('already in use')) {
          userFriendlyMessage = 'This email is already registered. Please use a different email.';
        } else if (error.message.includes('Invalid email')) {
          userFriendlyMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('already your current')) {
          userFriendlyMessage = 'This is already your current email address.';
        } else {
          userFriendlyMessage = error.message;
        }
      }
      
      setErrorMessage(userFriendlyMessage);
    } finally {
      setResending(false);
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Email</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.description}>
          We've sent a 6-digit verification code to:
        </Text>
        <Text style={styles.email}>{newEmail}</Text>
        
        <View style={styles.codeContainer}>
          <TextInput
            style={[
              styles.codeInput,
              errorMessage && styles.codeInputError
            ]}
            value={code}
            onChangeText={(text) => {
              // Clear error when user starts typing
              if (errorMessage) {
                setErrorMessage('');
              }
              // Only allow digits, max 6 characters
              const digits = text.replace(/\D/g, '').slice(0, 6);
              setCode(digits);
            }}
            placeholder="000000"
            placeholderTextColor={colors.textTertiary}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            selectTextOnFocus
          />
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
        
        <TouchableOpacity
          style={[styles.verifyButton, (!code || code.length !== 6 || verifying) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={!code || code.length !== 6 || verifying}
          accessibilityRole="button"
          accessibilityLabel="Verify email code"
        >
          <Text style={[styles.verifyButtonText, (!code || code.length !== 6 || verifying) && styles.verifyButtonTextDisabled]}>
            {verifying ? 'Verifying...' : 'Verify Email'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={resending}
          accessibilityRole="button"
          accessibilityLabel="Resend verification code"
        >
          <Text style={[styles.resendButtonText, resending && styles.resendButtonTextDisabled]}>
            {resending ? 'Sending...' : "Didn't receive code? Resend"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, colorScheme: 'light' | 'dark' = 'light') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.tint,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 22,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.tint,
    marginBottom: 32,
  },
  codeContainer: {
    marginBottom: 24,
  },
  codeInput: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  codeInputError: {
    borderColor: colors.error,
    backgroundColor: colorScheme === 'dark' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 59, 48, 0.05)',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: colors.cardSecondary,
    opacity: 0.5,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.buttonText,
  },
  verifyButtonTextDisabled: {
    color: colors.textTertiary,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendButtonText: {
    fontSize: 14,
    color: colors.tint,
    fontWeight: '500',
  },
  resendButtonTextDisabled: {
    opacity: 0.5,
  },
});

