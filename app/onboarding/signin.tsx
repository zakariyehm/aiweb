/**
 * Sign In Screen - Convex Version
 * Replaces Firebase Authentication with Convex
 */

import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import { FontAwesome } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  // Convex mutation for sign in
  const signInMutation = useMutation(api.auth.signIn);

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      setInfoMessage('');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      // Call Convex sign in mutation
      const result = await signInMutation({
        email: email.trim(),
        password: password.trim(),
      });

      if (!result || !result.userId) {
        throw new Error('Invalid response from server');
      }

      // Save session locally
      await login({
        userId: result.userId,
        email: result.email,
        displayName: result.profile?.firstName || result.profile?.name || 'User',
      });

      setIsLoading(false);
      setInfoMessage('Signed in successfully. Redirecting...');

      // Navigate to home after successful login
      setTimeout(() => router.replace('/(tabs)'), 1000);
    } catch (error: any) {
      setIsLoading(false);
      setInfoMessage('');

      const errorMsg = error?.message || String(error);

      if (errorMsg.includes('User not found')) {
        setErrorMessage('No account found for this email. Please create an account.');
      } else if (errorMsg.includes('password') || errorMsg.includes('credentials')) {
        setErrorMessage('Incorrect password. Please try again.');
      } else if (errorMsg.includes('network') || errorMsg.includes('Network')) {
        setErrorMessage('Network error. Check your connection and try again.');
      } else {
        setErrorMessage('Sign in failed. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('Google sign-in not yet implemented with Convex.');
    setIsLoading(false);
  };

  const handleBackToWelcome = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.content, Platform.OS === 'android' && { paddingTop: 20 }]}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logoApp.svg')}
            style={styles.logoSvg}
            contentFit="contain"
          />
          <Text style={styles.appName}>NutroAi</Text>
        </View>

        {/* Sign In Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueButton, isLoading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Signing in...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {!!errorMessage && (
            <Text style={{ color: '#E53935', marginTop: 10, textAlign: 'center' }}>{errorMessage}</Text>
          )}
          {!!infoMessage && (
            <Text style={{ color: '#2E7D32', marginTop: 10, textAlign: 'center' }}>{infoMessage}</Text>
          )}

          {/* Don't have account */}
          <View style={styles.noAccountContainer}>
            <Text style={styles.noAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/onboarding/welcome')}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* OR Separator */}
        <View style={styles.separatorContainer}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>OR</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Alternative Sign In Methods */}
        <View style={styles.alternativeMethods}>
          <TouchableOpacity
            style={[styles.socialButton, isLoading && styles.disabledButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <FontAwesome name="google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Links */}
        <View style={[styles.footer, Platform.OS === 'android' && { marginBottom: 24 }]}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}> | </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoSvg: {
    width: 80,
    height: 60,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  continueButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  noAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noAccountText: {
    fontSize: 16,
    color: '#666666',
  },
  signUpLink: {
    fontSize: 16,
    color: Colors.light.tint,
    textDecorationLine: 'underline',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  alternativeMethods: {
    marginBottom: 32,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  footerLink: {
    fontSize: 14,
    color: '#666666',
  },
  footerSeparator: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 8,
  },
});
