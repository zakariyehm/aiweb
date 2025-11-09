/**
 * Auth Hook - Convex Version
 * Replaces Firebase Authentication with Convex + AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

interface UserSession {
  userId: string;
  email?: string;
  isGuest?: boolean;
  displayName?: string;
}

const USER_SESSION_KEY = '@user_session';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const sessionData = await AsyncStorage.getItem(USER_SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setUserSession(session);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  const login = async (userData: UserSession) => {
    try {
      await AsyncStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
      setUserSession(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.log('Error saving user session:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_SESSION_KEY);
      setUserSession(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.log('Error removing user session:', error);
    }
  };

  const getCurrentUserId = (): string | null => {
    return userSession?.userId || null;
  };

  return {
    isLoggedIn,
    userSession,
    login,
    logout,
    checkLoginStatus,
    getCurrentUserId,
  };
}
