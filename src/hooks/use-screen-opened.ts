import { useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';

/** If the screen never reports the end of its opening transition (no animation), go on anyway. */
const FALLBACK_MS = 600;

/**
 * Whether the pushed screen has finished sliding in. Rows mounted with layout animations
 * (`layout`, `exiting`) during the slide hold it for seconds on iOS, and heavy rows mounted
 * meanwhile stall it too, so those wait for this.
 */
export function useScreenOpened() {
  const navigation = useNavigation();
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setOpened(true), FALLBACK_MS);
    const unsubscribe = navigation.addListener('transitionEnd' as never, () => setOpened(true));
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [navigation]);
  return opened;
}
