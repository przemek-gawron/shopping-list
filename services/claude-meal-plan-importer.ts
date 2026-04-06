import * as FileSystem from 'expo-file-system/legacy';
import { Unit } from '@/types';
import { UNCATEGORIZED_CATEGORY_ID } from '@/constants/categories';
import { normalizeUnit, ApiKeyError, ApiError, ParseError } from './claude-recipe-importer';

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

function buildSaveMealPlanTool() {
  return {
    name: 'save_meal_plan',
    description: 'Save all extracted recipes from the meal plan',
    input_schema: {
      type: 'object' as const,
      required: ['recipes'],
      properties: {
        recipes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['title', 'meal_type', 'ingredients'],
            properties: {
              title: { type: 'string', description: 'Recipe title in Polish' },
              description: { type: 'string', description: 'Brief description (optional)' },
              meal_type: {
                type: 'string',
                enum: ['sniadanie', 'drugie_sniadanie', 'obiad', 'podwieczorek', 'kolacja', 'inne'],
                description: 'sniadanie=breakfast, drugie_sniadanie=second breakfast/mid-morning, obiad=lunch/main dinner, podwieczorek=afternoon snack, kolacja=supper/dinner',
              },
              ingredients: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'quantity', 'unit'],
                  properties: {
                    name: { type: 'string', description: 'Ingredient name in Polish, lowercase' },
                    quantity: { type: 'number', description: 'Numeric quantity' },
                    unit: { type: 'string', description: 'g, kg, ml, l, szt, lyzka, lyzeczka, or szklanka' },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

export async function importMealPlanFromPdf(
  fileUri: string,
  apiKey: string
): Promise<ParsedMealPlanRecipe[]> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: 'base64' as FileSystem.EncodingType,
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-beta': 'pdfs-2024-09-25',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      tools: [buildSaveMealPlanTool()],
      tool_choice: { type: 'tool', name: 'save_meal_plan' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Extract ALL recipes from this Polish meal plan PDF. For each recipe, identify its meal type: sniadanie (śniadanie/breakfast), drugie_sniadanie (drugie śniadanie/mid-morning), obiad (obiad/main meal), podwieczorek (podwieczorek/afternoon snack), kolacja (kolacja/supper). Use Polish for all text and ingredient names (lowercase). Extract ingredients with quantities and units — use only: g, kg, ml, l, szt, lyzka, lyzeczka, szklanka. Call save_meal_plan with every recipe found.',
            },
          ],
        },
      ],
    }),
  });

  if (response.status === 401) throw new ApiKeyError();
  if (!response.ok) throw new ApiError(response.status, `API error: ${response.status}`);

  const data = await response.json();
  const toolUse = data.content?.find((c: { type: string }) => c.type === 'tool_use');
  if (!toolUse?.input?.recipes) throw new ParseError('Claude did not return recipes');

  const recipes = toolUse.input.recipes;
  if (!Array.isArray(recipes) || recipes.length === 0) throw new ParseError('No recipes found in PDF');

  return recipes.map((r: {
    title: string;
    description?: string;
    meal_type: string;
    ingredients: Array<{ name: string; quantity: number; unit: string }>;
  }) => ({
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
