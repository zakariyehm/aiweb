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

  console.log('========================================');
  console.log('[ScanScreen] ✅ Component RENDERED/MOUNTED');
  console.log('[ScanScreen] Phase:', phase);
  console.log('[ScanScreen] Launching ref:', launchingRef.current);
  console.log('========================================');

  const handleOpenCamera = useCallback(async () => {
    console.log('[ScanScreen] handleOpenCamera called, launchingRef:', launchingRef.current, 'phase:', phase);
    
    if (launchingRef.current || phase !== 'idle') {
      console.log('[ScanScreen] Camera already launching or phase not idle, returning');
      return;
    }
    
    launchingRef.current = true;
    console.log('[ScanScreen] Requesting camera permission...');
    
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[ScanScreen] Camera permission result:', permission.granted);
      
      if (!permission.granted) {
        console.log('[ScanScreen] Camera permission denied');
        launchingRef.current = false;
        return;
      }
      
      console.log('[ScanScreen] Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.9,
        exif: false,
      });
      
      console.log('[ScanScreen] Camera result:', { 
        canceled: result.canceled, 
        hasAssets: !!result.assets?.length 
      });
      
      if (result.canceled || !result.assets?.length) {
        // User backed out without taking a photo → immediately go Home
        console.log('[ScanScreen] Camera cancelled, returning to home');
        // Use setTimeout to ensure navigation happens after camera closes
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        return;
      }
      // Use the original URI directly (no need to persist for OpenAI API)
      const originalUri = result.assets[0].uri;
      console.log('[ScanScreen] Image captured, URI:', originalUri);

      // Navigate immediately to results screen with just the image
      // Results screen will show loading state and run API call
      console.log('[ScanScreen] Navigating to scanResults with image');
      router.push({
        pathname: '/scanResults',
        params: {
          imageUri: encodeURIComponent(originalUri),
        }
      });
    } catch (error) {
      console.error('[ScanScreen] Camera error:', error);
      // On error, navigate to home after a small delay
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } finally {
      launchingRef.current = false;
      console.log('[ScanScreen] Camera launch completed, launchingRef reset');
    }
  }, [phase, router]);

  useFocusEffect(
    useCallback(() => {
      console.log('[ScanScreen] useFocusEffect triggered, phase:', phase);
      
      // Set up back handler first
      const onBack = () => {
        console.log('[ScanScreen] Back button pressed');
        // Always send user to home on hardware back
        router.replace('/(tabs)');
        return true; // Block default back behavior
      };
      
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      console.log('[ScanScreen] Back handler registered');
      
      // Open camera after back handler is set up
      if (phase === 'idle') {
        console.log('[ScanScreen] Phase is idle, calling handleOpenCamera');
        handleOpenCamera();
      } else {
        console.log('[ScanScreen] Phase is not idle, skipping camera open');
      }
      
      return () => {
        console.log('[ScanScreen] useFocusEffect cleanup - removing back handler');
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
