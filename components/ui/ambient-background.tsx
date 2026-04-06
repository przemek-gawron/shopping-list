import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useColorScheme } from '@/hooks/use-color-scheme';

type AmbientBackgroundVariant = 'recipes' | 'products' | 'shopping' | 'categories';

interface AmbientBackgroundProps {
  variant?: AmbientBackgroundVariant;
  /** Stronger, darker ambient when the screen shows a populated list (e.g. shopping list with items). */
  listHasItems?: boolean;
}

const positions = {
  recipes: {
    gridPrimary: { top: 54, right: -84, transform: [{ rotate: '-14deg' }] as const },
    gridSecondary: { bottom: 170, left: -92, transform: [{ rotate: '12deg' }] as const },
    glowPrimary: { top: -34, right: -56 },
    glowSecondary: { bottom: 112, left: -36 },
  },
  products: {
    gridPrimary: { top: 76, left: -86, transform: [{ rotate: '11deg' }] as const },
    gridSecondary: { bottom: 170, right: -96, transform: [{ rotate: '-13deg' }] as const },
    glowPrimary: { top: -24, left: -40 },
    glowSecondary: { bottom: 138, right: -28 },
  },
  shopping: {
    gridPrimary: { top: 120, right: -86, transform: [{ rotate: '-12deg' }] as const },
    gridSecondary: { bottom: 196, left: -98, transform: [{ rotate: '9deg' }] as const },
    glowPrimary: { top: 18, right: -40 },
    glowSecondary: { bottom: 116, left: -24 },
  },
  categories: {
    gridPrimary: { top: 64, left: -80, transform: [{ rotate: '10deg' }] as const },
    gridSecondary: { bottom: 180, right: -90, transform: [{ rotate: '-15deg' }] as const },
    glowPrimary: { top: -28, left: -48 },
    glowSecondary: { bottom: 126, right: -32 },
  },
};

export function AmbientBackground({
  variant = 'recipes',
  listHasItems = false,
}: AmbientBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const placement = positions[variant];
  const boost = listHasItems;

  const greenStart = isDark
    ? `rgba(16, 185, 129, ${boost ? 0.4 : 0.24})`
    : `rgba(4, 120, 87, ${boost ? 0.4 : 0.24})`;
  const greenMid = isDark
    ? `rgba(16, 185, 129, ${boost ? 0.2 : 0.1})`
    : `rgba(52, 211, 153, ${boost ? 0.22 : 0.12})`;
  const greenEnd = 'transparent';
  const amberStart = isDark
    ? `rgba(245, 158, 11, ${boost ? 0.26 : 0.14})`
    : `rgba(245, 158, 11, ${boost ? 0.28 : 0.16})`;
  const gridBorder = isDark
    ? `rgba(255,255,255,${boost ? 0.12 : 0.08})`
    : `rgba(4, 120, 87, ${boost ? 0.2 : 0.12})`;
  const gridLine = isDark
    ? `rgba(255,255,255,${boost ? 0.09 : 0.06})`
    : `rgba(4, 120, 87, ${boost ? 0.14 : 0.08})`;
  const gridSurface = isDark
    ? `rgba(255,255,255,${boost ? 0.045 : 0.025})`
    : `rgba(255,255,255,${boost ? 0.32 : 0.22})`;
  const gridHighlight = isDark
    ? `rgba(16, 185, 129, ${boost ? 0.2 : 0.12})`
    : `rgba(4, 120, 87, ${boost ? 0.2 : 0.12})`;
  const depthTint = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(4, 77, 58, 0.13)';

  return (
    <View pointerEvents="none" style={styles.container}>
      <LinearGradient
        colors={[greenStart, greenMid, greenEnd]}
        style={[styles.glowLarge, placement.glowPrimary]}
        start={{ x: 0.12, y: 0.08 }}
        end={{ x: 0.88, y: 0.86 }}
      />
      <LinearGradient
        colors={[amberStart, greenEnd]}
        style={[styles.glowMedium, placement.glowSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {[placement.gridPrimary, placement.gridSecondary].map((gridPlacement, index) => (
        <View
          key={index}
          style={[
            index === 0 ? styles.gridPrimary : styles.gridSecondary,
            gridPlacement,
            {
              backgroundColor: gridSurface,
              borderColor: gridBorder,
            },
          ]}>
          <LinearGradient
            colors={[gridHighlight, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {Array.from({ length: 8 }).map((_, lineIndex) => (
            <View
              key={`v-${index}-${lineIndex}`}
              style={[
                styles.verticalLine,
                {
                  left: 24 + lineIndex * 34,
                  backgroundColor: gridLine,
                },
              ]}
            />
          ))}
          {Array.from({ length: 8 }).map((_, lineIndex) => (
            <View
              key={`h-${index}-${lineIndex}`}
              style={[
                styles.horizontalLine,
                {
                  top: 20 + lineIndex * 26,
                  backgroundColor: gridLine,
                },
              ]}
            />
          ))}
        </View>
      ))}
      {boost && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: depthTint }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowLarge: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  glowMedium: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  gridPrimary: {
    position: 'absolute',
    width: 280,
    height: 220,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridSecondary: {
    position: 'absolute',
    width: 240,
    height: 180,
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
});
