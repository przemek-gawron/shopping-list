import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { photoUri } from '@/utils/photos';

type Props = { photo?: string; /** A local image not yet saved to app storage; takes precedence over `photo`. */ uri?: string; emoji: string; size?: number; height?: number };

/** Recipe photo, or a placeholder with the group's emoji. Pass `size` for a square, or `height` for a full-width banner. */
export function RecipePhoto({ photo, uri, emoji, size, height }: Props) {
  const theme = useTheme();
  const box = size ? { width: size, height: size } : { width: '100%' as const, height: height ?? 200 };
  return (
    <View style={[styles.box, box, { backgroundColor: theme.surfaceCard }]}>
      {uri || photo ? (
        <Image source={{ uri: uri ?? photoUri(photo!) }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <ThemedText style={{ fontSize: size ? size * 0.45 : 56, lineHeight: size ? size * 0.6 : 68 }}>{emoji}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
