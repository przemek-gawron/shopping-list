import React from 'react';
import { StyleSheet, Pressable, View, Text, Platform } from 'react-native';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface FloatingActionButtonProps {
  onPress: () => void;
  badge?: number;
  hasTabBar?: boolean;
}

export function FloatingActionButton({ onPress, badge, hasTabBar = true }: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12) + (hasTabBar ? 88 : 16);
  const supportsLiquidGlass =
    Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  const buttonContent = (
    <View
      style={[
        styles.buttonContent,
        supportsLiquidGlass
          ? [
              styles.buttonContentGlass,
              {
                backgroundColor:
                  colorScheme === 'dark' ? 'rgba(15, 23, 42, 0.22)' : 'rgba(4, 120, 87, 0.2)',
              },
            ]
          : { backgroundColor: colors.tint, shadowColor: colors.shadowColor },
      ]}
    >
      <IconSymbol name="cart.fill" size={26} color={colors.onPrimary} />
    </View>
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.wrapper,
        {
          bottom: bottomOffset,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      {supportsLiquidGlass ? (
        <GlassView
          isInteractive
          glassEffectStyle="regular"
          colorScheme={colorScheme === 'dark' ? 'dark' : 'light'}
          tintColor={colors.tint}
          style={[
            styles.buttonGlass,
            {
              borderColor: colors.tint + '55',
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          {buttonContent}
        </GlassView>
      ) : (
        buttonContent
      )}
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.surfaceElevated }]}>
          <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 24,
    width: 58,
    height: 58,
  },
  buttonGlass: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  buttonContent: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonContentGlass: {
    borderRadius: 29,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
  },
});
