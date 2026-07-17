import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { PublicUser } from '@/types/auth';

const SESSION_KEY = 'shopping-list:session';

// SecureStore is unavailable on web, where AsyncStorage (localStorage) is the
// best option available.
const isWeb = Platform.OS === 'web';

function getItem(key: string): Promise<string | null> {
  return isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
}

function setItem(key: string, value: string): Promise<void> {
  return isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);
}

function deleteItem(key: string): Promise<void> {
  return isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);
}

const VERSION = 1 as const;

export type StoredSession =
  | {
      v: typeof VERSION;
      isGuest: true;
    }
  | {
      v: typeof VERSION;
      isGuest: false;
      token: string;
      user: PublicUser;
    };

export async function loadSession(): Promise<StoredSession | null> {
  try {
    const raw = await getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    const o = parsed as Record<string, unknown>;
    if (o.v !== VERSION) {
      return null;
    }
    if (o.isGuest === true) {
      return { v: VERSION, isGuest: true };
    }
    if (o.isGuest === false && typeof o.token === 'string' && o.user && typeof o.user === 'object') {
      return {
        v: VERSION,
        isGuest: false,
        token: o.token,
        user: o.user as PublicUser,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function saveGuestSession(): Promise<void> {
  const payload: StoredSession = { v: VERSION, isGuest: true };
  await setItem(SESSION_KEY, JSON.stringify(payload));
}

export async function saveUserSession(token: string, user: PublicUser): Promise<void> {
  const payload: StoredSession = { v: VERSION, isGuest: false, token, user };
  await setItem(SESSION_KEY, JSON.stringify(payload));
}

export async function clearSession(): Promise<void> {
  try {
    await deleteItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
