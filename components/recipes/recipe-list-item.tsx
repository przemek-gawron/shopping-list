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
    <View style={[styles.container, { borderBottomColor: colors.icon + '40' }]}>
      <Pressable
        style={({ pressed }) => [
          styles.content,
          { backgroundColor: pressed ? colors.icon + '20' : 'transparent' },
        ]}
        onPress={handlePress}
      >
        <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
        {recipe.description && (
          <Text style={[styles.description, { color: colors.icon }]} numberOfLines={1}>
            {recipe.description}
          </Text>
        )}
        <Text style={[styles.ingredients, { color: colors.icon }]}>
          {recipe.ingredients.length} skladnikow
        </Text>
      </Pressable>
      <CounterButton count={count} onChange={onCountChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  ingredients: {
    fontSize: 12,
    marginTop: 4,
  },
});
