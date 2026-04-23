import * as FileSystem from 'expo-file-system/legacy';
import { Unit } from '@/types';
import { UNCATEGORIZED_CATEGORY_ID } from '@/constants/categories';
import { normalizeUnit, ApiKeyError, ApiError, ParseError } from '@/services/claude-recipe-importer';
import { backendPost } from '@/services/backend-client';

export type MealType = 'sniadanie' | 'drugie_sniadanie' | 'obiad' | 'podwieczorek' | 'kolacja' | 'inne';

export interface ParsedMealPlanRecipe {
  title: string;
  description?: string;
  mealType: MealType;
  ingredients: Array<{ name: string; quantity: number; unit: Unit }>;
}

const MEAL_TYPE_TO_CATEGORY_ID: Record<MealType, string> = {
  sniadanie: 'cat-sniadania',
  drugie_sniadanie: 'cat-drugie-sniadania',
  obiad: 'cat-obiady',
  podwieczorek: 'cat-podwieczorki',
  kolacja: 'cat-kolacje',
  inne: UNCATEGORIZED_CATEGORY_ID,
};

export function getCategoryIdForMealType(mealType: string): string {
  return MEAL_TYPE_TO_CATEGORY_ID[mealType as MealType] ?? UNCATEGORIZED_CATEGORY_ID;
}

export { ApiKeyError, ApiError, ParseError };

export async function importMealPlanFromPdf(fileUri: string): Promise<ParsedMealPlanRecipe[]> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: 'base64' as FileSystem.EncodingType,
  });

  const { recipes } = await backendPost<{
    recipes: Array<{
      title: string;
      description?: string;
      meal_type: string;
      ingredients: Array<{ name: string; quantity: number; unit: string }>;
    }>;
  }>('/api/meal-plans/import-from-pdf', { pdf: { data: base64 } });

  if (!Array.isArray(recipes) || recipes.length === 0) {
    throw new ParseError('No recipes found in PDF');
  }

  return recipes.map((r) => ({
    title: String(r.title),
    description: r.description ? String(r.description) : undefined,
    mealType: (r.meal_type ?? 'inne') as MealType,
    ingredients: (r.ingredients ?? []).map((ing) => ({
      name: String(ing.name).toLowerCase(),
      quantity: Number(ing.quantity) || 1,
      unit: normalizeUnit(String(ing.unit)),
    })),
  }));
}
