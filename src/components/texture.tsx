import { Image, StyleSheet, View } from 'react-native';

import { Texture } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** The theme's texture tiled over the parent; draws nothing when the theme has none. */
export function TextureOverlay() {
  const source = Texture[useColorScheme()];
  if (source == null) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: Texture.opacity }]}>
      <Image source={source} resizeMode="repeat" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
