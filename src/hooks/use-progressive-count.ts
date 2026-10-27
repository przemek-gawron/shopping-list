import { useEffect, useState } from 'react';

/**
 * How many of `total` rows to render: `first` at once, the rest `step` per frame once `ready`
 * (the screen has slid in, `useScreenOpened`). A pushed screen with a few hundred heavy rows
 * (swipe gestures, animations) otherwise stalls its slide-in until every row is mounted.
 */
export function useProgressiveCount(total: number, ready: boolean, first = 16, step = 30) {
  const [count, setCount] = useState(first);
  useEffect(() => {
    if (!ready || count >= total) return;
    const frame = requestAnimationFrame(() => setCount((n) => n + step));
    return () => cancelAnimationFrame(frame);
  }, [ready, count, total, step]);
  return count;
}
