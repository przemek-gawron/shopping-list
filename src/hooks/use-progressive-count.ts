import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

/** If the screen never reports the end of its opening transition (no animation), start anyway. */
const FALLBACK_MS = 600;

/**
 * How many of `total` rows to render: `first` at once, the rest `step` per frame once the screen's
 * opening transition has ended. A pushed screen with a few hundred heavy rows (swipe gestures,
 * animations) otherwise stalls its slide-in until every row is mounted; mounting them during the
 * slide stalls it too.
 */
export function useProgressiveCount(total: number, first = 16, step = 30) {
  const navigation = useNavigation();
  const [opened, setOpened] = useState(false);
  const [count, setCount] = useState(first);
  useEffect(() => {
    const timer = setTimeout(() => setOpened(true), FALLBACK_MS);
    const unsubscribe = navigation.addListener('transitionEnd' as never, () => setOpened(true));
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [navigation]);
  useEffect(() => {
    if (!opened || count >= total) return;
    const frame = requestAnimationFrame(() => setCount((n) => n + step));
    return () => cancelAnimationFrame(frame);
  }, [opened, count, total, step]);
  return count;
}
