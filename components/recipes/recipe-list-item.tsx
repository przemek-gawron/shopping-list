import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Recipe } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CounterButton } from '@/components/ui/counter-button';

interface RecipeListItemProps {
  recipe: Recipe;
  count: number;
  onCountChange: (count: number) => void;
}

export function RecipeListItem({ recipe, count, onCountChange }: RecipeListItemProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    router.push(`/recipe/${recipe.id}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={handlePress}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
        {recipe.description && (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={1}>
            {recipe.description}
          </Text>
        )}
        <Text style={[styles.ingredients, { color: colors.tint }]}>
          {recipe.ingredients.length} skladnikow
        </Text>
      </View>
      <CounterButton count={count} onChange={onCountChange} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    paddingRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 3,
  },
  ingredients: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  },
});
