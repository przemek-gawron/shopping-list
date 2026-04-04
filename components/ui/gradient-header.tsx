import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface GradientHeaderProps {
  title: string;
  onAdd?: () => void;
  rightElement?: React.ReactNode;
  children?: React.ReactNode;
}

export function GradientHeader({ title, onAdd, rightElement, children }: GradientHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const gradientColors = [colors.headerGradientStart, colors.headerGradientEnd] as const;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 14 }]}
    >
      {/* Soft highlight — glass-like depth without a bitmap */}
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)', 'transparent']}
        locations={[0, 0.35, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.9, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.onPrimary }]}>{title}</Text>
        <View style={styles.actions}>
          {rightElement}
          {onAdd && (
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: colors.overlayOnPrimary, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onAdd}
            >
              <IconSymbol name="plus" size={20} color={colors.onPrimary} />
            </Pressable>
          )}
        </View>
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    overflow: 'hidden',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});
