import * as SecureStore from 'expo-secure-store';

const SECURE_STORE_KEY = 'anthropic-api-key';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_STORE_KEY);
}

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(SECURE_STORE_KEY, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
}
