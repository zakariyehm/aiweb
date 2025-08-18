import { FontAwesome } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isActionOpen, setIsActionOpen] = useState(false);

  const openScan = () => {
    setIsActionOpen(false);
    try { router.push('/actionDialog/scan'); } catch {}
  };

  const openUpload = () => {
    setIsActionOpen(false);
    try { router.push('/actionDialog/upload'); } catch {}
  };

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#A78BFA',
        tabBarInactiveTintColor: '#C9C9CF',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: Platform.OS === 'ios' ? 0 : 2 },
        tabBarStyle: Platform.select({
          ios: { position: 'absolute' },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: color === '#A78BFA' ? '#6D28D9' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FontAwesome name="user" size={18} color={color === '#A78BFA' ? '#fff' : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="actionDialog"
        options={{
          title: 'action',
          tabBarLabel: () => null,
          // Prevent navigation to a real screen; use dialog instead
          tabBarButton: (props) => (
            <TouchableOpacity onPress={() => setIsActionOpen(true)} activeOpacity={0.8} style={props.style}> 
              <View
                style={{
                  backgroundColor: '#2E2E2E',
                  borderRadius: 20,
                  width: 64,
                  height: 36,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: Platform.OS === 'android' ? 2 : 0,
                }}
              >
                <FontAwesome name="plus" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <FontAwesome name="line-chart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="cog" size={22} color={color} />,
        }}
      />
    </Tabs>

    <Modal visible={isActionOpen} transparent animationType="fade" onRequestClose={() => setIsActionOpen(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.sheetHandle} />
          <TouchableOpacity style={styles.actionItem} onPress={openScan}>
            <View style={styles.actionIcon}>
              <FontAwesome name="camera" size={18} color="#fff" />
            </View>
            <Text style={styles.actionText}>Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={openUpload}>
            <View style={styles.actionIcon}>
              <FontAwesome name="upload" size={18} color="#fff" />
            </View>
            <Text style={styles.actionText}>Upload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsActionOpen(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A3A3A',
    marginBottom: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E2E2E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    backgroundColor: '#2E2E2E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
