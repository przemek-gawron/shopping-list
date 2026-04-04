import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface CounterButtonProps {
  count: number;
  onChange: (count: number) => void;
}

export function CounterButton({ count, onChange }: CounterButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isActive = count > 0;

  return (
    <View style={[styles.container, { borderColor: isActive ? colors.tint : colors.border }]}>
      <Pressable
        style={({ pressed }) => [
          styles.sideButton,
          {
            backgroundColor: isActive ? colors.tint : colors.background,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
        onPress={() => onChange(Math.max(0, count - 1))}
        disabled={!isActive}
      >
        <Text style={[styles.sideButtonText, { color: isActive ? '#fff' : colors.icon }]}>−</Text>
      </Pressable>

      <View style={[styles.countArea, { backgroundColor: isActive ? colors.tint + '14' : 'transparent' }]}>
        <Text style={[styles.count, { color: isActive ? colors.tint : colors.textSecondary }]}>
          {count}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.sideButton,
          { backgroundColor: colors.tint, opacity: pressed ? 0.75 : 1 },
        ]}
        onPress={() => onChange(count + 1)}
      >
        <Text style={styles.sideButtonTextActive}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  sideButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideButtonText: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  sideButtonTextActive: {
    fontSize: 20,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
    color: '#fff',
  },
  countArea: {
    minWidth: 30,
    paddingHorizontal: 6,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
