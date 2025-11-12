import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ConvexClientProvider } from '@/lib/convex';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Suppress Convex error overlays by catching unhandled promise rejections
  useEffect(() => {
    // Handle unhandled promise rejections (for web/Expo Go)
    // This prevents Convex error overlays from showing
    if (typeof global !== 'undefined') {
      const unhandledRejectionHandler = (event: any) => {
        // Suppress Convex error overlays - errors are handled in try-catch blocks
        // Only log in development, don't show technical errors to users
        if (__DEV__) {
          console.error('[Suppressed Promise Rejection]', event.reason);
        }
        // Prevent default error overlay
        if (event.preventDefault) {
          event.preventDefault();
        }
        // Stop propagation to prevent Convex error overlay
        if (event.stopPropagation) {
          event.stopPropagation();
        }
      };
      
      // Add listener for unhandled promise rejections
      if ((global as any).addEventListener) {
        (global as any).addEventListener('unhandledrejection', unhandledRejectionHandler);
      }
      
      return () => {
        if ((global as any).removeEventListener) {
          (global as any).removeEventListener('unhandledrejection', unhandledRejectionHandler);
        }
      };
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ConvexClientProvider>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
                <Stack.Screen name="scan" options={{ presentation: 'modal', title: 'Scan' }} />
                <Stack.Screen name="scanResults" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="fixResults" options={{ presentation: 'modal', title: 'Fix Results' }} />
                <Stack.Screen name="upload" options={{ presentation: 'modal', title: 'Upload' }} />
                <Stack.Screen name="saved" options={{ presentation: 'modal', title: 'Saved' }} />
                <Stack.Screen name="viewMeals" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="editscreen" options={{ presentation: 'modal', title: 'Edit' }} />
                <Stack.Screen name="verifyEmail" options={{ presentation: 'modal', headerShown: false }} />
            
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </ConvexClientProvider>
  );
}
