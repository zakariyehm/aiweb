import { analyzeFoodFromImage, type Nutrition } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
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
        setAnalysis(null);
        setPhase('idle');
        setPhotoUri(null);
        router.navigate('/');
        return;
      }
      
      setPhotoUri(result.assets[0].uri);
      setPhase('loading');
      
      try {
        console.log('[Scan] Starting analysis');
        const analyzed = await analyzeFoodFromImage(result.assets[0].uri);
        if ((analyzed as any).notFood) {
          console.warn('[Scan] No food detected');
          setAnalysis({
            title: "Ma cunto baa tani? Waxaan ka war hayn karin sawirka la bixiyey, fadlan hubi in aad sawirto cunto sax ah oo muuqata, haddii kale isku day mar kale.",
            calories: 0,
            carbsG: 0,
            proteinG: 0,
            fatG: 0,
            healthScore: 5,
          });
        } else {
          console.log('[Scan] Analysis success');
          setAnalysis(analyzed as Nutrition);
          
          // Navigate to modal screen with results
          router.push({
            pathname: '/actionDialog/scanResults',
            params: {
              title: analyzed.title,
              calories: analyzed.calories.toString(),
              carbsG: analyzed.carbsG.toString(),
              proteinG: analyzed.proteinG.toString(),
              fatG: analyzed.fatG.toString(),
              healthScore: analyzed.healthScore.toString(),
              imageUri: result.assets[0].uri,
            }
          });
        }
      } catch (err) {
        console.error('[Scan] analyzeFoodFromImage error', err);
        setAnalysis({
          title: 'Analysis failed. Check API keys/network',
          calories: 0,
          carbsG: 0,
          proteinG: 0,
          fatG: 0,
          healthScore: 5,
        });
      }
      setPhase('results');
    } finally {
      launchingRef.current = false;
    }
  }, [phase]);

  useFocusEffect(
    useCallback(() => {
      if (phase === 'idle') {
        handleOpenCamera();
      }
      
      const onBack = () => {
        router.navigate('/');
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
});
