import { auth, db } from '@/lib/firebase';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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

  const handleSignIn = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      setInfoMessage('');
      return;
    }

    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists()) {
        setIsLoading(false);
        console.warn('Login succeeded but no user doc found in Firestore for uid:', cred.user.uid);
        setErrorMessage('We could not find your profile. Please create your account first.');
        setInfoMessage('');
        return;
      }
      setIsLoading(false);
      console.log('Sign in success for uid:', cred.user.uid);
      setErrorMessage('');
      setInfoMessage('Signed in successfully. Redirecting...');
      setTimeout(() => router.replace('/(tabs)'), 600);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Sign in error:', error);
      setInfoMessage('');
      const code = error?.code as string | undefined;
      if (code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address.');
        return;
      }
      if (code === 'auth/user-disabled') {
        setErrorMessage('This account has been disabled.');
        return;
      }
      if (code === 'auth/too-many-requests') {
        setErrorMessage('Too many attempts. Try again later.');
        return;
      }
      if (code === 'auth/network-request-failed') {
        setErrorMessage('Network error. Check your connection and try again.');
        return;
      }
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email.trim());
          if (!methods || methods.length === 0) {
            setErrorMessage('No account found for this email. Please create an account.');
          } else if (methods.includes('password')) {
            setErrorMessage('Incorrect password. Please try again.');
          } else {
            setErrorMessage('This email is registered with a different sign-in method.');
          }
        } catch {
          setErrorMessage('Sign in failed. Please try again.');
        }
        return;
      }
      setErrorMessage('Sign in failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google sign in logic
      // For now, simulate a successful login
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/(tabs)');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Google sign in failed. Please try again.');
    }
  };

  const handleBackToWelcome = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      <View style={[styles.content, Platform.OS === 'android' && { paddingTop: 20 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToWelcome}>
            <FontAwesome name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome back</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <FontAwesome name="cutlery" size={40} color="#007AFF" />
          </View>
          <Text style={styles.appName}>Cal AI</Text>
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

          {/* Phone sign-in removed */}
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
    backgroundColor: '#F5F5F5',
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
    color: '#000000',
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
    backgroundColor: '#FFFFFF',
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
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
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
    color: '#000000',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
  },
  continueButton: {
    backgroundColor: '#000000',
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
    color: '#FFFFFF',
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
    color: '#007AFF',
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
