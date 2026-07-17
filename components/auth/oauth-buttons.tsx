import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuthRequest } from 'expo-auth-session/providers/facebook';
import { useIdTokenAuthRequest } from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { useAuth } from '@/context/auth-context';
import { oauthWithBackend } from '@/services/auth-api';
import { ApiError } from '@/services/ai-errors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { t } from '@/i18n';
import type { PublicUser } from '@/types/auth';

WebBrowser.maybeCompleteAuthSession();

const googleIos = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const googleAndroid = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const googleWeb = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const fbAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '';

export function hasGoogleConfig(): boolean {
  return (
    Boolean(googleWeb) &&
    (Platform.OS === 'web' ||
      (Platform.OS === 'ios' && Boolean(googleIos)) ||
      (Platform.OS === 'android' && Boolean(googleAndroid)))
  );
}

/**
 * Renders when Google env is complete for this platform. Must not be mounted
 * otherwise: `useIdTokenAuthRequest` throws on iOS if `iosClientId` is missing.
 */
function GoogleSignInBlock({
  colors,
  busy,
  onBusy,
  onSession,
}: {
  colors: (typeof Colors)['light'];
  busy: boolean;
  onBusy: (v: boolean) => void;
  onSession: (data: { token: string; user: PublicUser }) => Promise<void>;
}) {
  const [googleRequest, googleResponse, googlePrompt] = useIdTokenAuthRequest({
    iosClientId: googleIos,
    androidClientId: googleAndroid,
    webClientId: googleWeb,
  });

  useEffect(() => {
    if (!googleResponse || googleResponse.type !== 'success') {
      return;
    }
    const idToken = googleResponse.params.id_token;
    if (!idToken) {
      return;
    }
    let cancelled = false;
    (async () => {
      onBusy(true);
      try {
        const data = await oauthWithBackend({ provider: 'google', idToken });
        if (cancelled) {
          return;
        }
        await onSession(data);
      } catch (e) {
        if (cancelled) {
          return;
        }
        const message = e instanceof ApiError ? e.message : t('auth_error_generic');
        Alert.alert(t('auth_error_title'), message);
      } finally {
        if (!cancelled) {
          onBusy(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [googleResponse, onSession, onBusy]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
      disabled={busy || !googleRequest}
      onPress={() => {
        void googlePrompt();
      }}
    >
      {busy ? (
        <ActivityIndicator color={colors.tint} />
      ) : (
        <Text style={[styles.btnText, { color: colors.text }]}>{t('auth_google')}</Text>
      )}
    </Pressable>
  );
}

function FacebookSignInBlock({
  colors,
  busy,
  onBusy,
  onSession,
}: {
  colors: (typeof Colors)['light'];
  busy: boolean;
  onBusy: (v: boolean) => void;
  onSession: (data: { token: string; user: PublicUser }) => Promise<void>;
}) {
  const [fbRequest, fbResponse, fbPrompt] = useAuthRequest({
    clientId: fbAppId,
  });

  useEffect(() => {
    if (!fbResponse || fbResponse.type !== 'success') {
      return;
    }
    const accessToken =
      fbResponse.params.access_token ??
      fbResponse.authentication?.accessToken ??
      (fbResponse.authentication as { access_token?: string } | null)?.access_token;
    if (!accessToken) {
      return;
    }
    let cancelled = false;
    (async () => {
      onBusy(true);
      try {
        const data = await oauthWithBackend({ provider: 'facebook', accessToken });
        if (cancelled) {
          return;
        }
        await onSession(data);
      } catch (e) {
        if (cancelled) {
          return;
        }
        const message = e instanceof ApiError ? e.message : t('auth_error_generic');
        Alert.alert(t('auth_error_title'), message);
      } finally {
        if (!cancelled) {
          onBusy(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fbResponse, onSession, onBusy]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
      disabled={busy || !fbRequest}
      onPress={() => {
        void fbPrompt();
      }}
    >
      {busy ? (
        <ActivityIndicator color={colors.tint} />
      ) : (
        <Text style={[styles.btnText, { color: colors.text }]}>{t('auth_facebook')}</Text>
      )}
    </Pressable>
  );
}

export function OAuthButtons() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setSessionFromOAuth } = useAuth();
  const [busy, setBusy] = useState(false);

  const showGoogle = hasGoogleConfig();
  const showFacebook = Boolean(fbAppId);

  const onApple = async () => {
    try {
      setBusy(true);
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        Alert.alert(t('auth_error_title'), t('auth_apple_unavailable'));
        return;
      }
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!cred.identityToken) {
        return;
      }
      const data = await oauthWithBackend({ provider: 'apple', idToken: cred.identityToken });
      await setSessionFromOAuth(data);
    } catch (e: unknown) {
      const err = e as { code?: string };
      if (err.code === 'ERR_REQUEST_CANCELED' || err.code === 'ERR_CANCELED') {
        return;
      }
      const message = e instanceof ApiError ? e.message : t('auth_error_generic');
      Alert.alert(t('auth_error_title'), message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.dividerRow, { borderColor: colors.border }]}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>{t('auth_or')}</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      {showGoogle && (
        <GoogleSignInBlock
          colors={colors}
          busy={busy}
          onBusy={setBusy}
          onSession={setSessionFromOAuth}
        />
      )}

      {Platform.OS === 'ios' && (
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
            pressed && { opacity: 0.85 },
          ]}
          disabled={busy}
          onPress={() => {
            void onApple();
          }}
        >
          {busy ? (
            <ActivityIndicator color={colors.tint} />
          ) : (
            <Text style={[styles.btnText, { color: colors.text }]}>{t('auth_apple')}</Text>
          )}
        </Pressable>
      )}

      {showFacebook && (
        <FacebookSignInBlock
          colors={colors}
          busy={busy}
          onBusy={setBusy}
          onSession={setSessionFromOAuth}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  btn: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  btnText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
