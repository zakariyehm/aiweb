import { analyzeFoodFromImage, type Nutrition } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MEDIUM_SHEET_MIN_HEIGHT = Math.round(Dimensions.get('window').height * 0.43);

type ScanPhase = 'idle' | 'loading' | 'results';

type Analysis = {
  title: string;
  calories: number; // kcal
  carbsG: number;
  proteinG: number;
  fatG: number;
  healthScore: number; // 0..10
};

export default function ScanScreen(): React.ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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
        setAnalysis(null);
        setPhase('idle');
        setPhotoUri(null);
        router.replace('/(tabs)');
        return;
      }
      // Persist the captured image to a stable cache path so it survives navigation
      const originalUri = result.assets[0].uri;
      const scansDir = `${FileSystem.cacheDirectory}scans`;
      try {
        await FileSystem.makeDirectoryAsync(scansDir, { intermediates: true });
      } catch (e) {
        // Directory may already exist
      }
      const timestamp = Date.now();
      const persistedUri = `${scansDir}/${timestamp}.jpg`;
      try {
        await FileSystem.copyAsync({ from: originalUri, to: persistedUri });
      } catch (copyErr) {
        console.warn('[Scan] Failed to persist image to cache, falling back to original URI', copyErr);
      }

      const safeUri = (await FileSystem.getInfoAsync(persistedUri)).exists ? persistedUri : originalUri;
      console.log('[Scan] Persisted image URI:', safeUri);

      setPhotoUri(safeUri);
      setPhase('loading');
      
      try {
        console.log('[Scan] Starting analysis');
        const analyzed = await analyzeFoodFromImage(safeUri);
        
        if ((analyzed as any).notFood) {
          console.warn('[Scan] No food detected');
          setAnalysis({
            title: "Ma cunto baa tani?",
            calories: 0,
            carbsG: 0,
            proteinG: 0,
            fatG: 0,
            healthScore: 5,
          });
          setPhase('results');
        } else {
          console.log('[Scan] Analysis success');
          const nutritionData = analyzed as Nutrition;
          
          // Navigate to modal screen with results
          router.push({
            pathname: '/actionDialog/scanResults',
            params: {
              title: nutritionData.title,
              calories: nutritionData.calories.toString(),
              carbsG: nutritionData.carbsG.toString(),
              proteinG: nutritionData.proteinG.toString(),
              fatG: nutritionData.fatG.toString(),
              healthScore: nutritionData.healthScore.toString(),
              // Encode once; the router will decode automatically. We'll decode intentionally on the destination.
              imageUri: encodeURIComponent(safeUri),
            }
          });
        }
      } catch (err) {
        console.error('[Scan] analyzeFoodFromImage error', err);
        
        // Navigate to modal with fallback data
        router.push({
          pathname: '/actionDialog/scanResults',
          params: {
            title: "Analysis failed",
            calories: "0",
            carbsG: "0",
            proteinG: "0",
            fatG: "0",
            healthScore: "5",
            imageUri: encodeURIComponent(safeUri),
          }
        });
      }
    } catch (error) {
      console.error('[Scan] Camera error', error);
      // Reset state and stay on scan screen
      setAnalysis(null);
      setPhase('idle');
      setPhotoUri(null);
    } finally {
      launchingRef.current = false;
    }
  }, [phase, router]);

  useFocusEffect(
    useCallback(() => {
      if (phase === 'idle') {
        handleOpenCamera();
      }
      
      const onBack = () => {
        // Always send user to home tabs on hardware back from scan flow
        setAnalysis(null);
        setPhotoUri(null);
        setPhase('idle');
        router.replace('/(tabs)');
        return true;
      };
      
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [phase, handleOpenCamera, router])
  );

  return (
    <View style={styles.container}>
      {/* Close button for modal */}
      <SafeAreaView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <View style={styles.modalHeader}>
          <Pressable
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>

      {phase !== 'idle' && photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.capturedImage} resizeMode="cover" />
      ) : null}
      {phase !== 'idle' && <View pointerEvents="none" style={styles.imageScrim} />}
      
      {/* Loading State */}
      {phase === 'loading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* No Food Detected State */}
      {phase === 'results' && analysis && analysis.title === "Ma cunto baa tani?" && (
        <View style={styles.noFoodContainer}>
          <View style={styles.noFoodContent}>
            <Ionicons name="restaurant-outline" size={64} color="#9ca3af" />
            <Text style={styles.noFoodTitle}>Ma cunto baa tani?</Text>
            <Text style={styles.noFoodDescription}>
              Waxaan ka war hayn karin sawirka la bixiyey. Fadlan hubi in aad sawirto cunto sax ah oo muuqata.
            </Text>
            <Text style={styles.noFoodHint}>
              Tusaale: cunto, khudaar, midhaha, hilib, iwm.
            </Text>
            <View style={styles.noFoodButtons}>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => {
                  setAnalysis(null);
                  setPhotoUri(null);
                  setPhase('idle');
                }}
              >
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.retryButtonText}>Isku day mar kale</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.noFoodBackButton}
                onPress={() => {
                  setAnalysis(null);
                  setPhotoUri(null);
                  setPhase('idle');
                  router.back();
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.noFoodBackButtonText}>Dib u noqo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {phase !== 'idle' && (
        <SafeAreaView pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <View style={styles.headerBar}>
            <Pressable
              onPress={() => {
                setAnalysis(null);
                setPhotoUri(null);
                setPhase('idle');
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {phase === 'idle' && (
        <Pressable style={StyleSheet.absoluteFill} onPress={handleOpenCamera} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  capturedImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  headerBar: {
    paddingHorizontal: 12,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
    zIndex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  noFoodContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  noFoodContent: {
    alignItems: 'center',
    padding: 20,
  },
  noFoodTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  noFoodDescription: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  noFoodHint: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 15,
    textAlign: 'center',
  },
  noFoodButtons: {
    flexDirection: 'row',
    marginTop: 30,
    width: '100%',
    justifyContent: 'space-around',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noFoodBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  noFoodBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
