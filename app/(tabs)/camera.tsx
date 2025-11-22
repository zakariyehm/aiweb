import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const launchingRef = useRef(false);
  const hasOpenedCameraRef = useRef(false);
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  
  // Check subscription status
  const subscriptionStatus = useQuery(
    api.users.hasActiveSubscription,
    userId ? { userId } : "skip"
  );

  const handleOpenCamera = useCallback(async () => {
    if (launchingRef.current || hasOpenedCameraRef.current) {
      console.log('[Camera] Already launching or opened, skipping');
      return;
    }
    
    console.log('[Camera] handleOpenCamera - Subscription status:', {
      hasSubscription: subscriptionStatus?.hasSubscription,
      isActive: subscriptionStatus?.isActive,
      planType: subscriptionStatus?.planType,
      startDate: subscriptionStatus?.startDate ? new Date(subscriptionStatus.startDate).toISOString() : null,
      endDate: subscriptionStatus?.endDate ? new Date(subscriptionStatus.endDate).toISOString() : null,
      now: new Date().toISOString(),
    });
    
    // Wait for subscription status to load
    if (subscriptionStatus === undefined) {
      console.log('[Camera] Subscription status still loading, waiting...');
      return;
    }
    
    // Check subscription first - isActive already validates: startDate <= now <= endDate
    if (!subscriptionStatus.hasSubscription || !subscriptionStatus.isActive) {
      console.log('[Camera] ❌ No active subscription - redirecting to billing');
      console.log('[Camera] Details:', {
        hasSubscription: subscriptionStatus.hasSubscription,
        isActive: subscriptionStatus.isActive,
      });
      router.push('/billing');
      return;
    }
    
    console.log('[Camera] ✅ User has active subscription - opening camera');
    
    hasOpenedCameraRef.current = true;
    launchingRef.current = true;
    
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permission.granted) {
        // Permission denied, navigate back to home
        launchingRef.current = false;
        hasOpenedCameraRef.current = false;
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.9,
        exif: false,
      });
      
      if (result.canceled || !result.assets?.length) {
        // User closed camera, navigate back to home
        launchingRef.current = false;
        hasOpenedCameraRef.current = false;
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        return;
      }
      
      const originalUri = result.assets[0].uri;
      
      // Navigate to scanResults screen with the image for analysis
      router.push({
        pathname: '/scanResults',
        params: {
          imageUri: encodeURIComponent(originalUri),
        }
      });
    } catch (error) {
      console.error('Camera error:', error);
      hasOpenedCameraRef.current = false;
      // On error, navigate back to home
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } finally {
      launchingRef.current = false;
    }
  }, [router, subscriptionStatus]);

  useFocusEffect(
    useCallback(() => {
      console.log('[Camera] useFocusEffect triggered', {
        userId: userId || 'undefined',
        userSession: userSession ? 'exists' : 'null',
        subscriptionStatus: subscriptionStatus !== undefined ? 'loaded' : 'loading',
      });
      
      // Wait for userSession to load - don't redirect if it's still loading
      if (!userSession) {
        console.log('[Camera] ⏳ User session loading... waiting');
        return;
      }
      
      // If no userId after session loaded, navigate to billing
      if (!userId) {
        console.log('[Camera] ❌ No userId after session loaded - redirecting to billing');
        router.push('/billing');
        return;
      }
      
      // Wait for subscription check to complete before deciding what to do
      if (subscriptionStatus === undefined) {
        console.log('[Camera] ⏳ Subscription status loading...');
        return;
      }
      
      console.log('[Camera] Subscription check result:', {
        hasSubscription: subscriptionStatus.hasSubscription,
        isActive: subscriptionStatus.isActive,
        planType: subscriptionStatus.planType,
        startDate: subscriptionStatus.startDate ? new Date(subscriptionStatus.startDate).toISOString() : null,
        endDate: subscriptionStatus.endDate ? new Date(subscriptionStatus.endDate).toISOString() : null,
        now: new Date().toISOString(),
        isInRange: subscriptionStatus.startDate && subscriptionStatus.endDate 
          ? Date.now() >= subscriptionStatus.startDate && Date.now() <= subscriptionStatus.endDate
          : 'N/A',
      });
      
      // Check subscription and navigate to billing if needed
      // isActive validates subscription period (startDate <= now <= endDate)
      if (!subscriptionStatus.hasSubscription || !subscriptionStatus.isActive) {
        console.log('[Camera] ❌ Subscription check failed - redirecting to billing');
        console.log('[Camera] Reason:', {
          hasSubscription: subscriptionStatus.hasSubscription,
          isActive: subscriptionStatus.isActive,
        });
        router.push('/billing');
        return;
      }
      
      // User has active subscription within valid period (startDate <= now <= endDate)
      console.log('[Camera] ✅ User has active subscription - opening camera');
      if (!hasOpenedCameraRef.current) {
        handleOpenCamera();
      }
      
      return () => {
        // Reset when screen loses focus so camera can be opened again next time
        hasOpenedCameraRef.current = false;
      };
    }, [handleOpenCamera, subscriptionStatus, userId, userSession, router])
  );
  
  // Show loading state while checking subscription or user session
  if ((!userSession || subscriptionStatus === undefined) && userId) {
    console.log('[Camera] Showing loading state - waiting for data');
    return (
      <View style={styles.container} />
    );
  }

  return (
    <View style={styles.container} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

