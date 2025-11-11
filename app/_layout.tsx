import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ConvexClientProvider } from '@/lib/convex';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ConvexClientProvider>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            {/* Modal Screens - Configured to not block tab bar */}
            <Stack.Screen 
              name="scanResults" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                animation: 'slide_from_bottom',
                gestureEnabled: true,
                contentStyle: { backgroundColor: 'transparent' },
              }} 
            />
            <Stack.Screen 
              name="fixResults" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                contentStyle: { backgroundColor: 'transparent' },
              }} 
            />
            <Stack.Screen 
              name="upload" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                contentStyle: { backgroundColor: 'transparent' },
              }} 
            />
            <Stack.Screen 
              name="saved" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                contentStyle: { backgroundColor: 'transparent' },
              }} 
            />
            <Stack.Screen 
              name="viewMeals" 
              options={{ 
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                contentStyle: { backgroundColor: 'transparent' },
              }} 
            />
            
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </ConvexClientProvider>
  );
}
