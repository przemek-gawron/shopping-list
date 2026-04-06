import { useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';

export function useRecipes() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useAppContext();

  const getRecipeById = useCallback(
    (id: string) => recipes.find((r) => r.id === id),
    [recipes]
  );

  const sortedRecipes = useMemo(
    () => [...recipes].sort((a, b) => a.title.localeCompare(b.title, 'pl')),
    [recipes]
  );

  const getRecipesByCategory = useCallback(
    (categoryId: string) =>
      [...recipes]
        .filter((r) => r.categoryId === categoryId)
        .sort((a, b) => a.title.localeCompare(b.title, 'pl')),
    [recipes]
  );

  return {
    recipes: sortedRecipes,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeById,
    getRecipesByCategory,
  };
}
