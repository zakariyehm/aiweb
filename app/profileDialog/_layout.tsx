import { Stack } from 'expo-router';

export default function ProfileDialogLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'card',
        headerShown: true,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="editField" options={{ title: 'Edit' }} />
    </Stack>
  );
}



