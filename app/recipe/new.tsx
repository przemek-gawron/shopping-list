import React from 'react';
import { Stack } from 'expo-router';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { useRecipes } from '@/hooks/use-recipes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function NewRecipeScreen() {
  const { addRecipe } = useRecipes();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nowy przepis',
          headerStyle: { backgroundColor: colors.tint },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <RecipeForm onSave={addRecipe} />
    </>
  );
}
