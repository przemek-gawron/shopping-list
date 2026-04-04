import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type TileDecorationVariant = 'recipe' | 'product' | 'shopping';

interface TileDecorationProps {
  variant?: TileDecorationVariant;
}

const CARD_RADIUS = 16;

const placements = {
  recipe: {
    wash: { top: 0, right: -24, bottom: 0, left: -24 },
    waveOne: { top: -12 },
    waveTwo: { top: 16 },
    waveThree: { top: 42 },
  },
  product: {
    wash: { top: 0, right: -20, bottom: 0, left: -20 },
    waveOne: { top: -8 },
    waveTwo: { top: 20 },
    waveThree: { top: 48 },
  },
  shopping: {
    wash: { top: 0, right: -22, bottom: 0, left: -22 },
    waveOne: { top: -14 },
    waveTwo: { top: 14 },
    waveThree: { top: 40 },
  },
};

export function TileDecoration({ variant = 'recipe' }: TileDecorationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const placement = placements[variant];

  const waveColorStrong = colorScheme === 'dark' ? 'rgba(255,255,255,0.09)' : colors.tint + '18';
  const waveColorSoft = colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : colors.tint + '12';
  const baseTint = colorScheme === 'dark' ? 'rgba(255,255,255,0.02)' : colors.tint + '0B';
  const washStart = colorScheme === 'dark' ? 'rgba(255,255,255,0.035)' : colors.tint + '18';
  const washMid = colorScheme === 'dark' ? 'rgba(255,255,255,0.018)' : colors.tint + '0D';
  const washEnd = 'transparent';

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={[styles.baseTint, { backgroundColor: baseTint }]} />
      <LinearGradient
        colors={[washStart, washMid, washEnd]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.wash, placement.wash]}
      />
      <View style={[styles.waveLarge, placement.waveOne, { borderColor: waveColorStrong }]} />
      <View style={[styles.waveLarge, placement.waveTwo, { borderColor: waveColorSoft }]} />
      <View style={[styles.waveMedium, placement.waveThree, { borderColor: waveColorStrong }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  baseTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
  },
  wash: {
    position: 'absolute',
    borderRadius: 999,
  },
  waveLarge: {
    position: 'absolute',
    width: '170%',
    height: 146,
    left: '-35%',
    borderRadius: 180,
    borderWidth: 1.5,
  },
  waveMedium: {
    position: 'absolute',
    width: '160%',
    height: 128,
    left: '-30%',
    borderRadius: 160,
    borderWidth: 1.5,
  },
});
