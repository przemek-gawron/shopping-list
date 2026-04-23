import { ApiError, ParseError } from '@/services/ai-errors';

function getBaseUrl(): string {
  return (process.env.EXPO_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
}

export function isBackendConfigured(): boolean {
  return getBaseUrl().length > 0;
}

interface ErrorBody {
  code?: string;
  message?: string;
}

export async function backendPost<T>(path: string, body: unknown): Promise<T> {
  const base = getBaseUrl();
  if (!base) {
    throw new ApiError(0, 'EXPO_PUBLIC_BACKEND_URL is not configured');
  }

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = process.env.EXPO_PUBLIC_BACKEND_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let code: string | undefined;
    let message = `Request failed (${response.status})`;
    try {
      const json = (await response.json()) as ErrorBody;
      code = json.code;
      if (typeof json.message === 'string' && json.message.length > 0) {
        message = json.message;
      } else if (typeof json.code === 'string') {
        message = json.code;
      }
    } catch {
      /* keep defaults */
    }

    if (code === 'PARSE_ERROR') {
      throw new ParseError(message);
    }

    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}
