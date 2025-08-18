import { Stack } from 'expo-router';
import React from 'react';

export default function ActionDialogLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="scan" options={{ title: 'Scan' }} />
      <Stack.Screen name="upload" options={{ title: 'Upload' }} />
    </Stack>
  );
}


