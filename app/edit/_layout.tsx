import { Stack } from 'expo-router';

export default function EditLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'card',
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="editField" options={{ title: 'Edit' }} />
    </Stack>
  );
}


