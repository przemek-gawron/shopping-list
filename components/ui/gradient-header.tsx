import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface GradientHeaderProps {
  title: string;
  onAdd?: () => void;
  rightElement?: React.ReactNode;
  children?: React.ReactNode; // slot for search bar etc
}

export function GradientHeader({ title, onAdd, rightElement, children }: GradientHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const bgColor = isDark ? '#064E3B' : colors.tint;

  return (
    <View style={[styles.header, { backgroundColor: bgColor, paddingTop: insets.top + 14 }]}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.actions}>
          {rightElement}
          {onAdd && (
            <Pressable
              style={({ pressed }) => [styles.addButton, { opacity: pressed ? 0.7 : 1 }]}
              onPress={onAdd}
            >
              <IconSymbol name="plus" size={20} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
    color: '#fff',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
