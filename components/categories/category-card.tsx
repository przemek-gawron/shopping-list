import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Category } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { TileDecoration } from '@/components/ui/tile-decoration';

interface CategoryCardProps {
  category: Category;
  recipeCount: number;
  onPress: () => void;
}

export function CategoryCard({ category, recipeCount, onPress }: CategoryCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surfaceCard,
          borderLeftColor: colors.tint + '40',
          borderColor: colors.borderSubtle,
          shadowColor: colors.shadowColor,
          opacity: pressed ? 0.94 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
      onPress={onPress}
    >
      <TileDecoration variant="category" />
      <View style={styles.content}>
        <Text style={styles.emoji}>{category.emoji}</Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {category.name}
        </Text>
        <View style={[styles.chip, { backgroundColor: colors.tint }]}>
          <Text style={[styles.chipText, { color: colors.onPrimary }]}>
            {recipeCount} {recipeCount === 1 ? 'przepis' : recipeCount < 5 ? 'przepisy' : 'przepisów'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    minHeight: 140,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.1,
    flex: 1,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  chipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.1,
  },
});
