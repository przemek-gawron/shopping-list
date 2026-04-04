import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CounterButtonProps {
  count: number;
  onChange: (count: number) => void;
}

const ICON_SIZE = 17;

export function CounterButton({ count, onChange }: CounterButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isActive = count > 0;

  const minusColor = isActive ? colors.tint : colors.icon;
  const ripple = { color: `${colors.tint}33` };

  return (
    <View
      style={[
        styles.pill,
        {
          borderColor: isActive ? `${colors.tint}28` : colors.borderSubtle,
          backgroundColor: isActive ? `${colors.tint}3D` : colors.surfaceElevated,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Zmniejsz liczbę porcji"
        disabled={!isActive}
        onPress={() => onChange(Math.max(0, count - 1))}
        android_ripple={ripple}
        style={({ pressed }) => [
          styles.side,
          styles.sideLeft,
          pressed && isActive && { backgroundColor: `${colors.tint}18` },
        ]}
      >
        <IconSymbol name="minus" size={ICON_SIZE} color={minusColor} weight="medium" />
      </Pressable>

      <View style={styles.countSlot}>
        <Text
          style={[styles.count, { color: isActive ? colors.text : colors.textSecondary }]}
          numberOfLines={1}
        >
          {count}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Zwiększ liczbę porcji"
        onPress={() => onChange(count + 1)}
        android_ripple={ripple}
        style={({ pressed }) => [
          styles.side,
          styles.sideRight,
          pressed && { backgroundColor: `${colors.tint}18` },
        ]}
      >
        <IconSymbol name="plus" size={ICON_SIZE} color={colors.tint} weight="medium" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  side: {
    minWidth: 36,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideLeft: {
    borderTopLeftRadius: 999,
    borderBottomLeftRadius: 999,
  },
  sideRight: {
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  countSlot: {
    minWidth: 30,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontVariant: ['tabular-nums'],
  },
});
