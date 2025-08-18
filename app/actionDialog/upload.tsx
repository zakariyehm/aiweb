import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UploadScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <Text style={styles.title}>Upload</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginTop: 8 },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});


