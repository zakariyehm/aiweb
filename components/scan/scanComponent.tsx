import { analyzeFoodFromImage, type Nutrition } from '@/constants/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
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

export default function ScanComponent(): React.ReactElement {
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
        router.back();
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
        router.back();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [phase, handleOpenCamera, router])
  );

  const healthUnits = useMemo(() => {
    if (!analysis) return 0;
    return Math.max(0, Math.min(10, analysis.healthScore));
  }, [analysis]);

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
      {phase !== 'idle' && (
        <SafeAreaView style={[styles.bottomCardContainer, { bottom: insets.bottom + 20 }]}>
          <View style={styles.bottomCard}>
            {phase === 'loading' && (
              <View style={styles.loadingBlock}>
                <Text style={styles.bottomTitle}>Loading</Text>
                <ActivityIndicator size="small" color="#888" style={{ marginTop: 8 }} />
                <Text style={styles.loadingText}>Uploading Data</Text>
              </View>
            )}

            {phase === 'results' && analysis && (
              <View style={styles.resultsContainer}>
                <View style={styles.titleChip}>
                  <Text style={styles.titleChipText} numberOfLines={1}>{analysis.title}</Text>
                </View>

                <View style={styles.caloriePill}>
                  <Ionicons name="flame" size={18} color="#D92C20" />
                  <Text style={styles.calorieText}>{analysis.calories} Calories</Text>
                  <Ionicons name="pencil" size={16} color="#111" style={{ marginLeft: 'auto' }} />
                </View>

                <View style={styles.macroRow}>
                  <MacroStat label="carbs" valueG={analysis.carbsG} />
                  <MacroStat label="protein" valueG={analysis.proteinG} />
                  <MacroStat label="fat" valueG={analysis.fatG} />
                </View>

                <View style={styles.healthCard}>
                  <Text style={styles.healthLabel}>Health Score ({analysis.healthScore}/10)</Text>
                  <View style={styles.healthBarTrack}>
                    <View style={[styles.healthBarFill, { flex: healthUnits }]} />
                    <View style={{ flex: 10 - healthUnits }} />
                  </View>
                </View>

                <Pressable style={styles.tertiaryButton} onPress={() => {}}>
                  <Ionicons name="document-text-outline" size={16} color="#111827" />
                  <Text style={styles.tertiaryButtonText}>View Vitamin Data</Text>
                </Pressable>

                <View style={styles.buttonRow}>
                  <PillButton label="AI Fix" variant="secondary" icon="star" onPress={() => {}} />
                  <PillButton
                    label="Done"
                    variant="primary"
                    onPress={() => {
                      setAnalysis(null);
                      setPhotoUri(null);
                      setPhase('idle');
                      router.back();
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
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

function PillButton(props: {
  label: string;
  variant: 'primary' | 'secondary';
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}): React.ReactElement {
  const { label, variant, icon, onPress } = props;
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillButton,
        isPrimary ? styles.pillPrimary : styles.pillSecondary,
        pressed && { opacity: 0.9 },
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={isPrimary ? '#fff' : '#111'} /> : null}
      <Text style={[styles.pillText, isPrimary ? styles.pillTextPrimary : styles.pillTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MacroStat(props: { label: string; valueG: number }): React.ReactElement {
  const { label, valueG } = props;
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{valueG.toFixed(1)}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
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
  bottomCardContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 18,
    minHeight: MEDIUM_SHEET_MIN_HEIGHT,
    gap: 12,
    backgroundColor: '#111827',
  },
  bottomTitle: {
    alignSelf: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  loadingBlock: {
    alignItems: 'center',
    gap: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  resultsContainer: {
    gap: 12,
  },
  titleChip: {
    alignSelf: 'center',
    backgroundColor: '#0b1020',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    maxWidth: '90%',
  },
  titleChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  caloriePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#ffd6d6',
    gap: 8,
  },
  calorieText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  macroRow: {
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  macroValue: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  macroLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  healthCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  healthLabel: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  healthBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#111827',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  tertiaryButton: {
    alignSelf: 'center',
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  tertiaryButtonText: {
    color: '#111827',
    fontWeight: '700',
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
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  buttonRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 100,
    justifyContent: 'center',
  },
  pillPrimary: {
    backgroundColor: '#111827',
  },
  pillSecondary: {
    backgroundColor: '#ffffff',
  },
  pillText: {
    fontWeight: '700',
    fontSize: 14,
  },
  pillTextPrimary: {
    color: '#fff',
  },
  pillTextSecondary: {
    color: '#111',
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
});
