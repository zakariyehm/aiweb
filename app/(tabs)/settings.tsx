import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors); // Create dynamic styles based on theme
  const [addBurnedCalories, setAddBurnedCalories] = useState(true);
  const [rolloverCalories, setRolloverCalories] = useState(true);
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<any>({});
  const [referral, setReferral] = useState<any>({});
  const { logout, userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  
  // Fetch user data (reactive)
  const userData = useQuery(api.users.get, userId ? { userId } : "skip");

  useEffect(() => {
    if (userData) {
      const p = userData.profile || {};
      const r = userData.referral || {};
      
      // Provide hint for username policy
      if (p.lastUsernameChangeAt) {
        let lastMs: number | undefined = undefined;
        const last = p.lastUsernameChangeAt;
        if (typeof last === 'number') lastMs = last;
        if (lastMs) {
          const nextDate = new Date(lastMs + 365 * 24 * 60 * 60 * 1000);
          (p as any)._usernameNextChange = nextDate;
        }
      }
      setProfile(p);
      setReferral(r);
    }
  }, [userData]);

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
      <View style={[styles.header, Platform.OS === 'android' && { paddingTop: 10 }]}> 
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        removeClippedSubviews={false}
      >
        {/* Profile quick info */}
        <View style={styles.profileCard}>
          <View style={styles.profileImagePlaceholder}>
            <FontAwesome name="user" size={24} color="#666" />
          </View>
          <View>
            <Text style={styles.profileName}>{profile.name || profile.firstName || 'Your Name'}</Text>
            <Text style={styles.profileAge}>{profile.email || userSession?.email || 'example@email.com'}</Text>
          </View>
        </View>

        {/* Referral info */}
        <View style={styles.listSection}>
          <Text style={styles.sectionBadge}>REFERRALS</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Promo Code</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{referral.promoCode || '—'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Referred People</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{Number(referral.referredCount || 0)}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowLabel}>Earnings</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>${((Number(referral.earningsCents || 0)) / 100).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* MY ACCOUNT */}
        <View style={styles.listSection}>
          <Text style={styles.sectionBadge}>MY ACCOUNT</Text>
          {[
            { label: 'Name', value: profile.name || profile.firstName || '', key: 'name' },
            { label: 'Username', value: profile.username || '', key: 'username' },
            { label: 'Age', value: profile.age ? String(profile.age) : '—', key: 'age' },
            { label: 'Mobile Number', value: profile.phone || '—', key: 'phone' },
            { label: 'Email', value: profile.email || userSession?.email || '', key: 'email' },
            { label: 'Password', value: '', key: 'password' },
            { label: 'Gender', value: profile.gender || '—', key: 'gender' },
          ].map((row, idx) => (
            <TouchableOpacity
              key={row.label + idx}
              style={styles.row}
              onPress={() =>
                router.push({
                  pathname: '/edit/editField',
                  params: { field: row.key, label: row.label, value: row.value || '' },
                })
              }
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>{row.label}</Text>
              </View>
              <View style={styles.rowRight}>
                {row.value ? (
                  <Text style={styles.rowValue}>
                    {row.key === 'username' && profile._usernameNextChange
                      ? `${row.value}`
                      : row.value}
                  </Text>
                ) : null}
                <FontAwesome name="chevron-right" size={16} color="#bbb" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACCOUNT ACTIONS */}
        <View style={styles.listSection}>
          <Text style={styles.sectionBadge}>ACCOUNT ACTIONS</Text>
          {[
            { label: 'Notifications' },
            { label: 'Delete Account' },
            { label: 'Privacy Policy' },
            { label: 'Terms of Service' },
            { label: 'Version', value: '1.0.98', showChevron: false },
          ].map((row, idx) => (
            <TouchableOpacity key={row.label + idx} style={styles.row} onPress={() => {}}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowLabel}>{row.label}</Text>
              </View>
              <View style={styles.rowRight}>
                {row.value ? <Text style={styles.rowValue}>{row.value}</Text> : null}
                {row.showChevron === false ? null : <FontAwesome name="chevron-right" size={16} color="#bbb" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={[styles.listSection, { marginBottom: 24 }]}> 
          <TouchableOpacity
            style={[styles.row, { justifyContent: 'center' }]}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Yes, sign out',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await logout();
                        router.replace('/onboarding/splash');
                      } catch (e) {
                        console.error('Logout error:', e);
                      }
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Version container removed; version shown above inside actions */}
      </ScrollView>
    </View>
  );
}

// Dynamic StyleSheet that adapts to theme
const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: colors.cardSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  profileAge: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inviteCard: {
    backgroundColor: colors.card,
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
    color: colors.textPrimary,
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
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  referralButton: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  referralButtonText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: colors.card,
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
  listSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionBadge: {
    color: colors.tint,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowValue: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  logoutText: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
    color: colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
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
    color: colors.textTertiary,
  },
  scrollContent: {
    paddingBottom: 120, // Add padding for the tab bar and extra space
  },
}); 