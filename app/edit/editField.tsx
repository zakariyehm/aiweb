import { auth, db } from '@/lib/firebase';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditFieldModal() {
  const params = useLocalSearchParams();
  const field = String(params.field || '');
  const label = String(params.label || field || 'Edit');
  const initialValue = String(params.value || '');
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
    if (field !== 'username') return;
    (async () => {
      try {
        const { doc, getDoc } = require('firebase/firestore');
        const user = auth.currentUser;
        if (!user) return;
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};
        const p: any = data.profile || {};
        const lower = String(p.username || '').toLowerCase();
        setCurrentLower(lower);
        const manual = Boolean(p.usernameManualChanged);
        setHasManualChanged(manual);
        let lastMs: number | undefined = undefined;
        // Prefer usernameManualChangedAt; fall back to lastUsernameChangeAt for backward compatibility
        const lastAny = p.usernameManualChangedAt || p.lastUsernameChangeAt;
        if (typeof lastAny === 'number') lastMs = lastAny;
        else if (lastAny && typeof lastAny.toMillis === 'function') lastMs = lastAny.toMillis();
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
      } catch (e) {
        console.warn('[Username] Failed to load policy', e);
      }
    })();
  }, [field]);

  // Debounced availability check while typing
  useEffect(() => {
    if (field !== 'username') return;
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
        const { doc, getDoc } = require('firebase/firestore');
        const usernameRef = doc(db, 'usernames', lower);
        const snap = await getDoc(usernameRef);
        const uid = auth.currentUser?.uid;
        if (!snap.exists()) {
          console.log('[Username] Availability', { lower, state: 'available' });
          setAvailability('available');
        } else if (uid && snap.data()?.uid === uid) {
          console.log('[Username] Availability', { lower, state: 'own' });
          setAvailability('own');
        } else {
          console.log('[Username] Availability', { lower, state: 'taken' });
          setAvailability('taken');
        }
      } catch {
        setAvailability('idle');
      }
    }, 350);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [value, field, currentLower]);

  const save = async () => {
    if (!field) return router.back();
    try {
      setSaving(true);
      const { doc, setDoc, getDoc, serverTimestamp, writeBatch } = require('firebase/firestore');
      const user = auth.currentUser;
      if (!user) throw new Error('Not signed in');

      // Handle password change using Firebase Auth
      if (field === 'password') {
        const email = user.email;
        if (!email) throw new Error('Missing email for reauthentication');
        if (!currentPassword || !newPassword) throw new Error('Enter current and new password');
        if (newPassword.length < 6) throw new Error('New password must be at least 6 characters');
        if (newPassword === currentPassword) throw new Error('New password must be different');
        try {
          const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = require('firebase/auth');
          const cred = EmailAuthProvider.credential(email, currentPassword);
          await reauthenticateWithCredential(user, cred);
          await updatePassword(user, newPassword);
          console.log('[Password] Updated successfully');
          router.replace('/(tabs)/settings');
          return;
        } catch (e: any) {
          console.warn('[Password] Update error', e?.code || e?.message);
          const code = e?.code || '';
          if (code === 'auth/wrong-password') throw new Error('Current password is incorrect');
          if (code === 'auth/weak-password') throw new Error('New password is too weak');
          throw new Error('Could not update password. Please try again.');
        }
      }
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const profile = { ...(data.profile || {}) };
      let coerced: any = value;
      if (field === 'age') {
        const n = Number(value);
        coerced = Number.isFinite(n) ? n : undefined;
      }

      if (field === 'username') {
        const proposed = String(value || '').trim();
        const lower = proposed.toLowerCase();
        // Basic validation: 3-20 chars, letters numbers dot underscore only
        if (!/^[a-z0-9._]{3,20}$/.test(lower)) {
          throw new Error('Invalid username. Use 3-20 letters, numbers, dot, or underscore.');
        }
        // If not changing, no-op
        if ((profile.username || '').toLowerCase() === lower) {
          router.replace('/(tabs)/settings');
          return;
        }
        // Enforce one-time free manual change, then once-per-year afterwards
        const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
        const manualChanged = Boolean((profile as any).usernameManualChanged);
        let lastMs: number | undefined = undefined;
        const lastAny = (profile as any).usernameManualChangedAt || (profile as any).lastUsernameChangeAt;
        if (typeof lastAny === 'number') lastMs = lastAny;
        else if (lastAny && typeof lastAny.toMillis === 'function') lastMs = lastAny.toMillis();
        if (manualChanged && lastMs && Date.now() - lastMs < YEAR_MS) {
          const nextDate = new Date(lastMs + YEAR_MS).toLocaleDateString();
          throw new Error(`You can change your username again on ${nextDate}.`);
        }
        // Reserve username using a usernames/{lower} doc to avoid cross-user queries
        const usernameRef = doc(db, 'usernames', lower);
        const currentRef = (profile.usernameLower ? doc(db, 'usernames', String(profile.usernameLower)) : null);
        const existing = await getDoc(usernameRef);
        if (existing.exists() && existing.data()?.uid !== user.uid) {
          throw new Error('Username not available. Please choose another.');
        }

        const batch = writeBatch(db);
        // Point username to current user
        batch.set(usernameRef, { uid: user.uid, updatedAt: serverTimestamp() });
        // Clean old mapping if changing
        if (currentRef && ((profile.usernameLower || '').toLowerCase() !== lower)) {
          try {
            const oldSnap = await getDoc(currentRef);
            if (oldSnap.exists() && oldSnap.data()?.uid === user.uid) {
              batch.delete(currentRef);
            } else {
              console.log('[Username] No owned old mapping to delete or missing doc');
            }
          } catch (e) {
            console.warn('[Username] Failed to read old mapping', e);
          }
        }
        // Update profile fields
        profile.username = proposed;
        (profile as any).usernameLower = lower;
        (profile as any).usernameManualChangedAt = serverTimestamp();
        if (!manualChanged) {
          (profile as any).usernameManualChanged = true;
        }
        coerced = undefined; // handled above
        batch.set(ref, { profile }, { merge: true });
        await batch.commit();
        router.replace('/(tabs)/settings');
        return;
      }
      if (field === 'phone') {
        const code = phoneCountryCode.startsWith('+') ? phoneCountryCode : `+${phoneCountryCode}`;
        const digits = String(phoneNational).replace(/\D/g, '');
        const e164 = `${code}${digits}`;
        const valid = /^\+[1-9]\d{7,14}$/.test(e164);
        if (!valid) throw new Error('Enter a valid phone with country code.');
        (profile as any).phone = e164;
        (profile as any).phoneCountryCode = code;
        (profile as any).phoneNational = digits;
        await setDoc(ref, { profile }, { merge: true });
        router.replace('/(tabs)/settings');
        return;
      }
      profile[field] = coerced;
      await setDoc(ref, { profile }, { merge: true });
      router.replace('/(tabs)/settings');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message || 'Please try again');
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
              style={[styles.inputBase, styles.underlineInput]}
              autoCapitalize="none"
              secureTextEntry
              editable={!saving}
            />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>New Password</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              style={[styles.inputBase, styles.underlineInput]}
              autoCapitalize="none"
              secureTextEntry
              editable={!saving}
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
                  style={[styles.inputBase, styles.pillInput, { width: 90, marginRight: 8 }]}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!saving}
                />
                <TextInput
                  value={phoneNational}
                  onChangeText={setPhoneNational}
                  placeholder="5551234567"
                  style={[styles.inputBase, styles.pillInput, { flex: 1 }]}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  editable={!saving}
                />
              </View>
            ) : (
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={`Enter ${label.toLowerCase()}`}
                style={[styles.inputBase, inputStyle]}
                autoCapitalize={field === 'email' || field === 'username' ? 'none' : 'words'}
                keyboardType={keyboardType as any}
                secureTextEntry={field === 'password'}
                editable={!saving}
              />
            )}
          </>
        )}

        {field === 'username' ? (
          <Text
            style={[
              styles.availability,
              availability === 'available' && { color: '#16a34a' },
              availability === 'taken' && { color: '#dc2626' },
              availability === 'checking' && { color: '#6b7280' },
              availability === 'invalid' && { color: '#dc2626' },
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 12 },
  subtitle: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  availability: { fontSize: 13, marginTop: 8, color: '#6b7280' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 8 },
  inputBase: { fontSize: 16, paddingHorizontal: 12, paddingVertical: 12 },
  underlineInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pillInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f5f6f8',
    borderRadius: 18,
  },
  removeLink: { color: '#1D9BF0', fontWeight: '600' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cooldownText: { textAlign: 'center', color: '#6b7280', marginBottom: 8 },
  saveBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

