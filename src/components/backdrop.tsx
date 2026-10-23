import { StyleSheet, View } from 'react-native';

import { Backdrop } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * The theme's decorative shapes behind a screen; they stay put while the content scrolls. They are
 * still on purpose: an endless animation here holds up the screens' layout animations, leaving
 * cards half faded in or out of place.
 */
export function BackdropLayer() {
  const shapes = Backdrop[useColorScheme()];
  if (shapes.length === 0) return null;
  return (
    <View pointerEvents="none" style={styles.layer}>
      {shapes.map((shape, i) => (
        <View key={i} style={[styles.shape, shape.style, shape.rotate ? { transform: [{ rotate: `${shape.rotate}deg` }] } : null]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  shape: { position: 'absolute' },
});
