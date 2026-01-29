import React from 'react';
import { Stack } from 'expo-router';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { useRecipes } from '@/hooks/use-recipes';

export default function NewRecipeScreen() {
  const { addRecipe } = useRecipes();

  return (
    <>
      <Stack.Screen options={{ title: 'Nowy przepis' }} />
      <RecipeForm onSave={addRecipe} />
    </>
  );
}
