import { type ReactNode, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useAuth } from '@/context/auth-context';

/**
 * When there is no session, sends the user to the auth stack. When a full
 * account session exists, leaves the auth group. Guests keep access to the
 * auth screens so they can sign in later.
 */
export function AuthNavigationGuard({ children }: { children: ReactNode }) {
  const { isLoading, hasSession, isGuest } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const inAuth = segments[0] === '(auth)';
    if (!hasSession && !inAuth) {
      router.replace('/(auth)/login');
    } else if (hasSession && !isGuest && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isLoading, hasSession, isGuest, segments, router]);

  return <>{children}</>;
}
