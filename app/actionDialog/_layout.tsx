import { Stack } from 'expo-router';

export default function ActionDialogLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        animation: 'slide_from_bottom',
        gestureEnabled: true,
        gestureDirection: 'vertical',
      }}
    >
      <Stack.Screen name="scan" />
      <Stack.Screen
        name="scanResults"
        options={{
          // Present as a form sheet and disable gesture/tap dismiss
          presentation: 'formSheet',
          gestureEnabled: false, // Prevent swipe-to-dismiss
          contentStyle: { backgroundColor: '#fff' },
        }}
      />
      <Stack.Screen name="fixResults" />
    </Stack>
  );
}


