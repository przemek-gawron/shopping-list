import React from 'react';
import { StyleSheet, Pressable, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from './icon-symbol';

interface FloatingActionButtonProps {
  onPress: () => void;
  badge?: number;
}

export function FloatingActionButton({ onPress, badge }: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const gradient = isDark ? Colors.gradients.primaryDark : Colors.gradients.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { transform: [{ scale: pressed ? 0.95 : 1 }] },
      ]}
      onPress={onPress}
    >
      <LinearGradient colors={gradient} style={styles.gradient}>
        <IconSymbol name="cart.fill" size={24} color="#fff" />
      </LinearGradient>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
