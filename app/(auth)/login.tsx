import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { useAuth } from '@/context/auth-context';
import { ApiError } from '@/services/ai-errors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { t } from '@/i18n';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { signInWithEmail, continueAsGuest } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t('auth_error_title'), t('auth_validation_fields'));
      return;
    }
    setBusy(true);
    try {
      await signInWithEmail(email.trim(), password);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : t('auth_error_generic');
      Alert.alert(t('auth_error_title'), message);
    } finally {
      setBusy(false);
    }
  };

  const onGuest = async () => {
    setBusy(true);
    try {
      await continueAsGuest();
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.kav, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth_email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.cardBackground }]}
            placeholder={t('auth_placeholder_email')}
            placeholderTextColor={colors.textSecondary}
            editable={!busy}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>{t('auth_password')}</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.cardBackground }]}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
            editable={!busy}
          />

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.tint, opacity: pressed || busy ? 0.88 : 1 },
            ]}
            onPress={() => {
              void onSubmit();
            }}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={[styles.primaryBtnText, { color: colors.onPrimary }]}>{t('auth_sign_in')}</Text>
            )}
          </Pressable>

          <View style={styles.row}>
            <Text style={[styles.muted, { color: colors.textSecondary }]}>{t('auth_no_account')}</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text style={[styles.link, { color: colors.tint }]}>{t('auth_go_register')}</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <OAuthButtons />

        <Pressable
          style={({ pressed }) => [styles.ghost, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => {
            void onGuest();
          }}
          disabled={busy}
        >
          <Text style={[styles.ghostText, { color: colors.tint }]}>{t('auth_continue_guest')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40, gap: 20 },
  form: { gap: 8, width: '100%' },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 2 },
  input: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  muted: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  link: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  ghost: { paddingVertical: 8, alignItems: 'center' },
  ghostText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
});
