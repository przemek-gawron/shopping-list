import { useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, type View } from 'react-native';

/**
 * Android only: how much of the returned view the open keyboard covers. Edge-to-edge windows no
 * longer shrink for the keyboard (on iOS scroll views use automaticallyAdjustKeyboardInsets), so
 * screens pad their bottom by this much; the smaller native ScrollView then keeps the focused field
 * in view and the content below it can still be scrolled to.
 */
export function useKeyboardInset() {
  const ref = useRef<View>(null);
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      // the view's own height is unaffected by its padding, so measuring again on a resize is fine
      ref.current?.measureInWindow((_x, y, _width, height) =>
        setInset(Math.max(0, Math.round(y + height - e.endCoordinates.screenY))),
      );
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setInset(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return { ref, inset };
}
