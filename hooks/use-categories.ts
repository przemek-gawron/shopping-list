import { useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';

export function useCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAppContext();

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  return {
    categories: sortedCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  };
}
