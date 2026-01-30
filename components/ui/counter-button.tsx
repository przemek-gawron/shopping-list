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

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: count > 0 ? colors.tint : colors.border,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          },
        ]}
        onPress={() => onChange(Math.max(0, count - 1))}
      >
        <Text style={[styles.buttonText, { color: count > 0 ? '#fff' : colors.textSecondary }]}>-</Text>
      </Pressable>

      <View style={[styles.countContainer, { backgroundColor: count > 0 ? colors.tint + '15' : 'transparent' }]}>
        <Text style={[styles.count, { color: count > 0 ? colors.tint : colors.textSecondary }]}>{count}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.tint,
            transform: [{ scale: pressed ? 0.9 : 1 }],
          },
        ]}
        onPress={() => onChange(count + 1)}
      >
        <Text style={styles.buttonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  countContainer: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    borderRadius: 8,
  },
  count: {
    fontSize: 17,
    fontWeight: '700',
  },
});
