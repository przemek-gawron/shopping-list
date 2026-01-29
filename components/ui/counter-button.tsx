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
            backgroundColor: count > 0 ? colors.tint : colors.icon + '40',
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={() => onChange(Math.max(0, count - 1))}
      >
        <Text style={styles.buttonText}>-</Text>
      </Pressable>

      <View style={[styles.countContainer, { borderColor: colors.icon + '40' }]}>
        <Text style={[styles.count, { color: colors.text }]}>{count}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 },
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
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  countContainer: {
    minWidth: 36,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  count: {
    fontSize: 16,
    fontWeight: '600',
  },
});
