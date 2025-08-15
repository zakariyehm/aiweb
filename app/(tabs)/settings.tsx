import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingItemProps {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  showArrow?: boolean;
}

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
}

export default function SettingsScreen() {
  const [addBurnedCalories, setAddBurnedCalories] = useState(true);
  const [rolloverCalories, setRolloverCalories] = useState(true);
  const insets = useSafeAreaInsets();

  const SettingItem = ({ icon, title, subtitle, onPress, showToggle, toggleValue, onToggleChange, showArrow = true }: SettingItemProps) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingItemLeft}>
        <FontAwesome name={icon} size={24} color="#555" style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingItemRight}>
        {showToggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: '#e0e0e0', true: '#333' }}
            thumbColor={toggleValue ? '#fff' : '#f4f3f4'}
          />
        ) : showArrow ? (
          <FontAwesome name="chevron-right" size={20} color="#ccc" />
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const SectionCard = ({ title, children }: SectionCardProps) => (
    <View style={styles.sectionCard}>
      {title && (
        <View style={styles.sectionHeader}>
          <FontAwesome name="cog" size={20} color="#666" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header - now outside ScrollView so it doesn't scroll */}
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* ScrollView - now only contains the scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://via.placeholder.com/60' }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.profileName}>Abu Zkrr</Text>
            <Text style={styles.profileAge}>23 years old</Text>
          </View>
        </View>

        {/* Invite friends section */}
        <View style={styles.inviteCard}>
          <View style={styles.inviteHeader}>
            <FontAwesome name="users" size={20} color="#333" />
            <Text style={styles.inviteTitle}>Invite friends</Text>
          </View>
          <View style={styles.referralCard}>
            <View style={styles.referralImageBackground} />
            <Text style={styles.referralText}>The journey is easier together.</Text>
            <TouchableOpacity style={styles.referralButton}>
              <Text style={styles.referralButtonText}>Refer a friend to earn $</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Options */}
        <SectionCard>
          <SettingItem icon="user-o" title="Personal details" onPress={() => {}} />
          <SettingItem icon="refresh" title="Adjust macronutrients" onPress={() => {}} />
          <SettingItem icon="flag-o" title="Goal & current weight" onPress={() => {}} />
          <SettingItem icon="clock-o" title="Weight history" onPress={() => {}} />
        </SectionCard>

        {/* Preferences Section */}
        <SectionCard title="Preferences">
          <SettingItem
            icon="fire"
            title="Add Burned Calories"
            subtitle="Add burned calories to daily goal"
            showToggle={true}
            toggleValue={addBurnedCalories}
            onToggleChange={setAddBurnedCalories}
            showArrow={false}
          />
          <SettingItem
            icon="refresh"
            title="Rollover calories"
            subtitle="Add up to 200 left over calories from yesterday into today's daily goal"
            showToggle={true}
            toggleValue={rolloverCalories}
            onToggleChange={setRolloverCalories}
            showArrow={false}
          />
        </SectionCard>

        {/* Legal/Support Section */}
        <SectionCard>
          <SettingItem
            icon="file-text-o"
            title="Terms and Conditions"
            onPress={() => console.log('Terms and Conditions')}
          />
          <SettingItem
            icon="shield"
            title="Privacy Policy"
            onPress={() => console.log('Privacy Policy')}
          />
          <SettingItem
            icon="envelope-o"
            title="Support Email"
            onPress={() => console.log('Support Email')}
          />
          <SettingItem
            icon="user-times"
            title="Delete Account?"
            onPress={() => console.log('Delete Account')}
          />
        </SectionCard>

        {/* Account Action Section */}
        <SectionCard>
          <SettingItem
            icon="sign-out"
            title="Logout"
            onPress={() => console.log('Logout')}
          />
        </SectionCard>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>VERSION 1.0.98</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Updated styles to match the new layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileAge: {
    fontSize: 14,
    color: 'gray',
  },
  inviteCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    marginTop: 20,
    padding: 16,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  referralCard: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  referralImageBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#4A90E2',
  },
  referralText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  referralButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  referralButtonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  settingItemRight: {
    alignItems: 'center',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
}); 