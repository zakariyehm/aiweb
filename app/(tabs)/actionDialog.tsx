// Placeholder screen kept only to maintain the center tab identity.
// Navigation to this route is disabled in the tab config; the + button opens a modal instead.
import React from 'react';
import { View } from 'react-native';

export default function ActionDialogPlaceholder() {
  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}
