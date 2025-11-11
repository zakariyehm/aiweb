import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UploadScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  
  const insets = useSafeAreaInsets();
  
  // Calculate tab bar height to leave space at bottom
  const tabBarHeight = Platform.OS === 'ios' ? 49 + insets.bottom : 60;
  
  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Transparent bottom area to allow tab bar touches */}
      <View 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: tabBarHeight,
          backgroundColor: 'transparent',
          pointerEvents: 'none',
          zIndex: 999,
        }}
      />
      
      {/* Header with close button */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Upload</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <FontAwesome name="times" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.content, { paddingBottom: tabBarHeight + 20 }]}>
        <View style={styles.iconContainer}>
          <FontAwesome name="upload" size={60} color={colors.textTertiary} />
        </View>
        <Text style={styles.subtitle}>Upload a photo to analyze</Text>
        <Text style={styles.description}>Choose a photo from your gallery to get instant calorie and nutrition information.</Text>
        
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Choose Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingHorizontal: 16 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: colors.textPrimary 
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  subtitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  uploadButtonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});


