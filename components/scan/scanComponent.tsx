import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  View
} from 'react-native';

type ScanPhase = 'idle';

export default function ScanScreen(): React.ReactElement {
  const router = useRouter();
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const launchingRef = useRef(false);

  const handleOpenCamera = useCallback(async () => {
    if (launchingRef.current || phase !== 'idle') return;
    launchingRef.current = true;
    
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) return;
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.9,
        exif: false,
      });
      
      if (result.canceled || !result.assets?.length) {
        // User backed out without taking a photo → immediately go Home
        console.log('[Scan] Camera cancelled, returning to home');
        // Use setTimeout to ensure navigation happens after camera closes
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        return;
      }
      // Use the original URI directly (no need to persist for OpenAI API)
      const originalUri = result.assets[0].uri;
      console.log('[Scan] Using image URI:', originalUri);

      // Navigate immediately to results screen with just the image
      // Results screen will show loading state and run API call
      router.push({
        pathname: '/scanResults',
        params: {
          imageUri: encodeURIComponent(originalUri),
        }
      });
    } catch (error) {
      console.error('[Scan] Camera error', error);
      // On error, navigate to home after a small delay
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } finally {
      launchingRef.current = false;
    }
  }, [phase, router]);

  useFocusEffect(
    useCallback(() => {
      // Set up back handler first
      const onBack = () => {
        // Always send user to home on hardware back
        router.replace('/(tabs)');
        return true; // Block default back behavior
      };
      
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      
      // Open camera after back handler is set up
      if (phase === 'idle') {
        handleOpenCamera();
      }
      
      return () => {
        sub.remove();
      };
    }, [phase, handleOpenCamera, router])
  );

  return (
    <View style={styles.container}>
      {/* Invisible pressable to trigger camera */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleOpenCamera} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
