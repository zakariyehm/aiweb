import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

export default function CameraScreen() {
  const router = useRouter();
  const launchingRef = useRef(false);
  const hasOpenedCameraRef = useRef(false);

  const handleOpenCamera = useCallback(async () => {
    if (launchingRef.current || hasOpenedCameraRef.current) {
      return;
    }
    
    hasOpenedCameraRef.current = true;
    launchingRef.current = true;
    
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permission.granted) {
        // Permission denied, navigate back to home
        launchingRef.current = false;
        hasOpenedCameraRef.current = false;
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.9,
        exif: false,
      });
      
      if (result.canceled || !result.assets?.length) {
        // User closed camera, navigate back to home
        launchingRef.current = false;
        hasOpenedCameraRef.current = false;
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
        return;
      }
      
      const originalUri = result.assets[0].uri;
      
      // Navigate to scanResults screen with the image for analysis
      router.push({
        pathname: '/scanResults',
        params: {
          imageUri: encodeURIComponent(originalUri),
        }
      });
    } catch (error) {
      console.error('Camera error:', error);
      hasOpenedCameraRef.current = false;
      // On error, navigate back to home
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } finally {
      launchingRef.current = false;
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      // Open camera when screen is focused, only if we haven't opened it yet
      if (!hasOpenedCameraRef.current) {
        handleOpenCamera();
      }
      
      return () => {
        // Reset when screen loses focus so camera can be opened again next time
        hasOpenedCameraRef.current = false;
      };
    }, [handleOpenCamera])
  );

  return (
    <View style={styles.container} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

