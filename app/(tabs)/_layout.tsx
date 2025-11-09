import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const openScan = () => {
    try { router.push('/actionDialog/scan'); } catch {}
  };

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontWeight: '600', 
          marginBottom: Platform.OS === 'ios' ? 0 : 2 
        },
        tabBarStyle: Platform.select({
          ios: { 
            position: 'absolute', 
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: colorScheme === 'dark' ? 1 : 0,
          },
          default: { 
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
          },
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
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color }) => <FontAwesome name="line-chart" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="actionDialog"
        options={{
          title: 'action',
          tabBarLabel: () => null,
          // Prevent navigation to a real screen; use dialog instead
          tabBarButton: (props) => (
            <TouchableOpacity onPress={openScan} activeOpacity={0.8} style={props.style}> 
              <View
                style={{
                  backgroundColor: colors.buttonPrimary,
                  borderRadius: 20,
                  width: 64,
                  height: 36,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: colors.shadow,
                  shadowOpacity: Platform.OS === 'ios' ? 0.12 : 0,
                  shadowRadius: 4,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: Platform.OS === 'android' ? 2 : 0,
                }}
              >
                <FontAwesome name="plus" size={24} color={colors.background} />
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: focused ? colors.tint : 'transparent',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FontAwesome 
                name="user" 
                size={18} 
                color={focused ? colors.background : color} 
              />
            </View>
          ),
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
    </>
  );
}


