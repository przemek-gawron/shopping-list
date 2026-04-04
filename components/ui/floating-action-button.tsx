import React from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface FloatingActionButtonProps {
  onPress: () => void;
  badge?: number;
}

export function FloatingActionButton({ onPress, badge }: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 12) + 88;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.tint,
          bottom: bottomOffset,
          shadowColor: colors.shadowColor,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <IconSymbol name="cart.fill" size={26} color={colors.onPrimary} />
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.surfaceElevated }]}>
          <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
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
