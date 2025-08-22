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
      <Stack.Screen name="scanResults" />
      <Stack.Screen name="fixResults" />
    </Stack>
  );
}


