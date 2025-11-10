import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function ActionDialogLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        animation: 'slide_from_bottom',
        gestureEnabled: true,
        gestureDirection: 'vertical',
        contentStyle: { 
          backgroundColor: colors.background 
        },
      }}
    >
      {/* Camera Scan - Full Screen Modal */}
      <Stack.Screen 
        name="scan"
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
          animation: 'fade',
          contentStyle: { 
            backgroundColor: '#000' 
          },
        }}
      />
      
      {/* Scan Results - Form Sheet (iOS) / Modal (Android) */}
      <Stack.Screen
        name="scanResults"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          gestureEnabled: false, // Prevent accidental dismiss
          contentStyle: { 
            backgroundColor: colors.background 
          },
        }}
      />
      
      {/* Fix Results - Standard Modal */}
      <Stack.Screen 
        name="fixResults"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          contentStyle: { 
            backgroundColor: colors.background 
          },
        }}
      />
      
      {/* Upload - Standard Modal */}
      <Stack.Screen 
        name="upload"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          contentStyle: { 
            backgroundColor: colors.background 
          },
        }}
      />
      
      {/* Saved Meals - Standard Modal */}
      <Stack.Screen 
        name="saved"
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          contentStyle: { 
            backgroundColor: colors.background 
          },
        }}
      />
    </Stack>
  );
}


