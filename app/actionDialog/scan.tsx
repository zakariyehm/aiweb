import { useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import ScanScreenComponent from '../../components/scan/scanComponent';

export default function ScanScreen() {
  // If navigated with reopen=1, we'll just render the component which auto-opens camera on focus
  // This hook ensures params are consumed so back/forward works predictably
  const params = useLocalSearchParams();
  useEffect(() => {
    // no-op: reading params triggers rerender if needed
  }, [params]);
  return <ScanScreenComponent />;
}


