import { ApiError } from '@/services/ai-errors';
import type { PublicUser } from '@/types/auth';

function getBaseUrl(): string {
  return (process.env.EXPO_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const base = getBaseUrl();
  if (!base) {
    throw new Error('EXPO_PUBLIC_BACKEND_URL is not configured');
  }
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const json = (await response.json()) as { message?: string; code?: string };
      if (typeof json.message === 'string' && json.message.length > 0) {
        message = json.message;
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<{ token: string; user: PublicUser }> {
  return postJson('/api/auth/register', { email, password, displayName });
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ token: string; user: PublicUser }> {
  return postJson('/api/auth/login', { email, password });
}

export async function oauthWithBackend(
  input:
    | { provider: 'google'; idToken: string }
    | { provider: 'apple'; idToken: string }
    | { provider: 'facebook'; accessToken: string }
): Promise<{ token: string; user: PublicUser }> {
  if (input.provider === 'facebook') {
    return postJson('/api/auth/oauth', {
      provider: 'facebook',
      accessToken: input.accessToken,
    });
  }
  return postJson('/api/auth/oauth', {
    provider: input.provider,
    idToken: input.idToken,
  });
}

export async function fetchMe(token: string): Promise<{ user: PublicUser }> {
  const base = getBaseUrl();
  if (!base) {
    throw new Error('EXPO_PUBLIC_BACKEND_URL is not configured');
  }
  const response = await fetch(`${base}/api/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const json = (await response.json()) as { message?: string };
      if (typeof json.message === 'string' && json.message.length > 0) {
        message = json.message;
      }
    } catch {
      /* ignore */
    }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<{ user: PublicUser }>;
}
