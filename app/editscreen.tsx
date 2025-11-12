import { Colors } from '@/constants/Colors';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useMutation, useQuery } from 'convex/react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const styles = createStyles(colors);
  
  const params = useLocalSearchParams();
  const field = String(params.field || '');
  const label = String(params.label || field || 'Edit');
  const initialValue = String(params.value || '');
  const { userSession } = useAuth();
  const userId = userSession?.userId as Id<"users"> | undefined;
  
  const keyboardType = useMemo(() => {
    if (field === 'age') return 'numeric';
    if (field === 'phone') return 'phone-pad';
    if (field === 'email') return 'email-address';
    return 'default';
  }, [field]);
  const [value, setValue] = useState<string>(initialValue);
  const [saving, setSaving] = useState(false);
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const [usernameHint, setUsernameHint] = useState<string | undefined>(undefined);
  const [availability, setAvailability] = useState<'idle' | 'checking' | 'available' | 'taken' | 'own' | 'invalid'>('idle');
  const [cooldownUntil, setCooldownUntil] = useState<Date | undefined>(undefined);
  const [hasManualChanged, setHasManualChanged] = useState<boolean>(false);
  const [currentLower, setCurrentLower] = useState<string>('');
  const debounceRef = useRef<any>(null);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  // Phone state
  const [phoneCountryCode, setPhoneCountryCode] = useState<string>('+1');
  const [phoneNational, setPhoneNational] = useState<string>('');
  
  // Convex mutations & queries
  const updateFieldMutation = useMutation(api.users.updateField);
  const updateUsernameMutation = useMutation(api.users.updateUsername);
  const checkUsernameAvailability = useMutation(api.usernames.checkAvailability);
  const sendEmailVerificationCode = useMutation(api.users.sendEmailVerificationCode);
  const userData = useQuery(api.users.get, userId ? { userId } : "skip");

  useEffect(() => {
    nav.setOptions({ title: label || 'Edit' });
  }, [label, nav]);

  // Initialize phone fields if editing phone
  useEffect(() => {
    if (field !== 'phone') return;
    const raw = String(initialValue || value || '').replace(/\s|-/g, '');
    if (raw.startsWith('+')) {
      const m = raw.match(/^(\+\d{1,4})(\d{4,})$/);
      if (m) {
        setPhoneCountryCode(m[1]);
        setPhoneNational(m[2]);
      } else {
        setPhoneNational(raw.replace(/^\+/, ''));
      }
    } else if (raw) {
      setPhoneNational(raw);
    }
  }, [field]);

  // Load current profile policy for username screen (hint + cooldown)
  useEffect(() => {
    if (field !== 'username' || !userData) return;
    
    const p: any = userData.profile || {};
    const lower = String(p.username || '').toLowerCase();
    setCurrentLower(lower);
    const manual = Boolean(p.usernameManualChanged);
    setHasManualChanged(manual);
    
    let lastMs: number | undefined = undefined;
    const lastAny = p.usernameManualChangedAt || p.lastUsernameChangeAt;
    if (typeof lastAny === 'number') lastMs = lastAny;
    
    console.log('[Username] Load policy', { manual, lastMs, lower });
    if (manual && lastMs) {
      const next = new Date(lastMs + 365 * 24 * 60 * 60 * 1000);
      setCooldownUntil(next);
      setUsernameHint(`You can change your username again on ${next.toLocaleDateString()}.`);
    } else if (!manual) {
      setUsernameHint('You have one free change available.');
    } else {
      setUsernameHint('You can now change your username.');
    }
  }, [field, userData]);

  // Debounced availability check while typing
  useEffect(() => {
    if (field !== 'username' || !userId) return;
    const proposed = String(value || '').trim();
    const lower = proposed.toLowerCase();
    if (!proposed) {
      setAvailability('idle');
      return;
    }
    if (!/^[a-z0-9._]{3,20}$/i.test(proposed)) {
      setAvailability('invalid');
      return;
    }
    if (lower === currentLower) {
      setAvailability('own');
      return;
    }
    setAvailability('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkUsernameAvailability({ username: lower, userId });
        console.log('[Username] Availability', { lower, result });
        setAvailability(result.available ? 'available' : 'taken');
      } catch {
        setAvailability('idle');
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [value, field, currentLower, userId, checkUsernameAvailability]);

  const save = async () => {
    if (!field || !userId) return router.back();
    try {
      setSaving(true);

      // Handle password change
      if (field === 'password') {
        if (!currentPassword || !newPassword) throw new Error('Enter current and new password');
        if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');
        if (newPassword === currentPassword) throw new Error('New password must be different');
        
        // TODO: Implement password update in Convex
        console.log('[Password] Update not yet implemented with Convex');
        Alert.alert('Not Implemented', 'Password updates coming soon!');
        router.replace('/(tabs)/settings');
        return;
      }

      let coerced: any = value;
      if (field === 'age') {
        const n = Number(value);
        coerced = Number.isFinite(n) ? n : undefined;
      }

      // Handle username update
      if (field === 'username') {
        const proposed = String(value || '').trim();
        const lower = proposed.toLowerCase();
        
        // Basic validation
        if (!/^[a-z0-9._]{3,20}$/.test(lower)) {
          throw new Error('Invalid username. Use 3-20 letters, numbers, dot, or underscore.');
        }
        
        // If not changing, no-op
        if ((userData?.profile?.username || '').toLowerCase() === lower) {
          router.replace('/(tabs)/settings');
          return;
        }
        
        // Enforce cooldown
        const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
        const manualChanged = Boolean((userData?.profile as any)?.usernameManualChanged);
        let lastMs: number | undefined = undefined;
        const lastAny = (userData?.profile as any)?.usernameManualChangedAt || (userData?.profile as any)?.lastUsernameChangeAt;
        if (typeof lastAny === 'number') lastMs = lastAny;
        
        if (manualChanged && lastMs && Date.now() - lastMs < YEAR_MS) {
          const nextDate = new Date(lastMs + YEAR_MS).toLocaleDateString();
          throw new Error(`You can change your username again on ${nextDate}.`);
        }
        
        // Update via Convex
        await updateUsernameMutation({ userId, newUsername: proposed });
        router.replace('/(tabs)/settings');
        return;
      }

      // Handle email update - requires verification
      if (field === 'email') {
        const newEmail = String(value || '').trim().toLowerCase();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
          throw new Error('Please enter a valid email address (e.g., name@example.com)');
        }
        
        // Check if email is the same as current email
        const currentEmail = userData?.email || userData?.profile?.email || '';
        if (currentEmail.toLowerCase() === newEmail) {
          Alert.alert(
            'No Change',
            'This is already your current email address.',
            [{ text: 'OK', onPress: () => router.replace('/(tabs)/settings') }]
          );
          return;
        }
        
        try {
          // Send verification code to new email
          const result = await sendEmailVerificationCode({ userId, newEmail });
          
          // Navigate to verification screen
          // Pass code if returned (fallback when domain is not verified)
          router.push({
            pathname: '/verifyEmail',
            params: {
              newEmail: newEmail,
              ...(result.code && { devCode: result.code }), // Show code if email sending might have failed
            },
          });
        } catch (error: any) {
          // Re-throw with better error message
          throw new Error(error.message || 'Unable to send verification code. Please try again.');
        }
        return;
      }

      // Handle phone update
      if (field === 'phone') {
        const code = phoneCountryCode.startsWith('+') ? phoneCountryCode : `+${phoneCountryCode}`;
        const digits = String(phoneNational).replace(/\D/g, '');
        const e164 = `${code}${digits}`;
        const valid = /^\+[1-9]\d{7,14}$/.test(e164);
        if (!valid) throw new Error('Enter a valid phone with country code.');
        
        await updateFieldMutation({ userId, field: 'phone', value: e164 });
        router.replace('/(tabs)/settings');
        return;
      }

      // Handle all other fields
      await updateFieldMutation({ userId, field, value: coerced });
      router.replace('/(tabs)/settings');
    } catch (e: any) {
      const errorMessage = e?.message || 'Unable to save changes. Please try again.';
      Alert.alert(
        'Unable to Save',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const subtitle = useMemo(() => {
    switch (field) {
      case 'name':
        return 'This is how you appear, so pick a name your friends know you by.';
      case 'username':
        return (
          usernameHint ||
          "This is how your friends can find you. You can only change your username once a year."
        );
      case 'email':
        return 'Use an email you own to help secure your account and recover it if needed.';
      case 'age':
        return 'Choose carefully — your birthday/age can be limited in how often it can be changed.';
      default:
        return undefined;
    }
  }, [field, usernameHint]);

  const inputStyle = field === 'username' ? styles.pillInput : styles.underlineInput;
  const saveBlockedByCooldown = field === 'username' && hasManualChanged && cooldownUntil && Date.now() < cooldownUntil.getTime();
  const saveBlockedByTaken = field === 'username' && (availability === 'taken' || availability === 'invalid' || availability === 'checking');
  const canSave = !saving && !(saveBlockedByCooldown || saveBlockedByTaken);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={[styles.content, { paddingBottom: 120 }]}
        keyboardShouldPersistTaps="handled"
      >
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {field === 'password' ? (
          <>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textTertiary}
              style={[styles.inputBase, styles.underlineInput]}
              autoCapitalize="none"
              secureTextEntry
              editable={!saving}
              keyboardAppearance={colorScheme}
            />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>New Password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={colors.textTertiary}
              style={[styles.inputBase, styles.underlineInput]}
              autoCapitalize="none"
              secureTextEntry
              editable={!saving}
              keyboardAppearance={colorScheme}
            />
          </>
        ) : (
          <>
            <Text style={styles.fieldLabel}>{label}</Text>
            {field === 'phone' ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  value={phoneCountryCode}
                  onChangeText={setPhoneCountryCode}
                  placeholder="+1"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.inputBase, styles.pillInput, { width: 90, marginRight: 8 }]}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!saving}
                  keyboardAppearance={colorScheme}
                />
                <TextInput
                  value={phoneNational}
                  onChangeText={setPhoneNational}
                  placeholder="5551234567"
                  placeholderTextColor={colors.textTertiary}
                  style={[styles.inputBase, styles.pillInput, { flex: 1 }]}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!saving}
                  keyboardAppearance={colorScheme}
                />
              </View>
            ) : (
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={`Enter ${label.toLowerCase()}`}
                placeholderTextColor={colors.textTertiary}
                style={[styles.inputBase, inputStyle]}
                autoCapitalize={field === 'email' || field === 'username' ? 'none' : 'words'}
                keyboardType={keyboardType as any}
                secureTextEntry={field === 'password'}
                editable={!saving}
                keyboardAppearance={colorScheme}
              />
            )}
          </>
        )}

        {field === 'username' ? (
          <Text
            style={[
              styles.availability,
              availability === 'available' && { color: colors.success },
              availability === 'taken' && { color: colors.error },
              availability === 'checking' && { color: colors.textSecondary },
              availability === 'invalid' && { color: colors.error },
            ]}
          >
            {availability === 'available' && 'Username is available.'}
            {availability === 'taken' && 'Username is already taken.'}
            {availability === 'own' && 'This is your current username.'}
            {availability === 'checking' && 'Checking availability…'}
            {availability === 'invalid' && 'Use 3–20 letters, numbers, dot, or underscore.'}
          </Text>
        ) : null}

        {field === 'name' ? (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              setValue('');
              save();
            }}
            disabled={saving}
            style={{ marginTop: 16 }}
          >
            <Text style={styles.removeLink}>Remove name</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        {saveBlockedByCooldown && cooldownUntil ? (
          <Text style={styles.cooldownText}>You can change again on {cooldownUntil.toLocaleDateString()}.</Text>
        ) : null}
        <TouchableOpacity
          style={[styles.saveBtn, (!canSave || (field === 'password' && (!currentPassword || !newPassword))) && { opacity: 0.5 }]}
          disabled={!canSave || (field === 'password' && (!currentPassword || !newPassword))}
          onPress={save}
        >
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'SAVE'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 12 },
  subtitle: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  availability: { fontSize: 13, marginTop: 8, color: colors.textSecondary },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 8 },
  inputBase: { 
    fontSize: 16, 
    paddingHorizontal: 12, 
    paddingVertical: 12,
    color: colors.textPrimary,
  },
  underlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pillInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    borderRadius: 18,
  },
  removeLink: { color: colors.info, fontWeight: '600' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cooldownText: { textAlign: 'center', color: colors.textSecondary, marginBottom: 8 },
  saveBtn: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveBtnText: { color: colors.buttonText, fontWeight: '700', fontSize: 16 },
});

