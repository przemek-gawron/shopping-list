import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface GradientHeaderProps {
  title: string;
  onAdd?: () => void;
  rightElement?: React.ReactNode;
}

export function GradientHeader({ title, onAdd, rightElement }: GradientHeaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const gradient = isDark ? Colors.gradients.headerDark : Colors.gradients.header;

  return (
    <LinearGradient colors={gradient} style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {onAdd && (
        <Pressable style={styles.addButton} onPress={onAdd}>
          <IconSymbol name="plus" size={20} color="#fff" />
        </Pressable>
      )}
      {rightElement}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
