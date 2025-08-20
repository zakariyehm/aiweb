import { Stack } from 'expo-router';
import React from 'react';

export default function ActionDialogLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen 
        name="scan" 
        options={{ 
          title: 'Scan',
          presentation: 'modal',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="upload" 
        options={{ 
          title: 'Upload',
          presentation: 'modal',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="saved" 
        options={{ 
          title: 'Food Saved',
          presentation: 'modal',
          headerShown: false
        }} 
      />
    </Stack>
  );
}


