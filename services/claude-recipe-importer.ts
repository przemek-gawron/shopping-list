import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Unit } from '@/types';
import { t } from '@/i18n';
import { backendPost } from '@/services/backend-client';
import { ApiKeyError, ApiError, ParseError } from '@/services/ai-errors';

export interface ParsedRecipe {
  title: string;
  description?: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: Unit;
  }>;
}

export { ApiKeyError, ApiError, ParseError };

const UNIT_MAP: Record<string, Unit> = {
  g: 'g', gram: 'g', gramy: 'g', gramów: 'g', grams: 'g',
  kg: 'kg', kilogram: 'kg', kilogramy: 'kg', kilogramów: 'kg', kilograms: 'kg',
  ml: 'ml', mililitr: 'ml', mililitry: 'ml', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml',
  l: 'l', litr: 'l', litry: 'l', litrów: 'l', liter: 'l', liters: 'l', litre: 'l',
  szt: 'szt', sztuka: 'szt', sztuki: 'szt', sztuk: 'szt', piece: 'szt', pieces: 'szt', pcs: 'szt',
  lyzka: 'lyzka', łyżka: 'lyzka', łyżki: 'lyzka', łyżek: 'lyzka', tablespoon: 'lyzka', tbsp: 'lyzka',
  lyzeczka: 'lyzeczka', łyżeczka: 'lyzeczka', łyżeczki: 'lyzeczka', łyżeczek: 'lyzeczka', teaspoon: 'lyzeczka', tsp: 'lyzeczka',
  szklanka: 'szklanka', szklanki: 'szklanka', szklanek: 'szklanka', cup: 'szklanka', cups: 'szklanka',
};

export function normalizeUnit(raw: string): Unit {
  const normalized = raw.toLowerCase().trim();
  return UNIT_MAP[normalized] ?? 'szt';
}

async function resizeImage(uri: string): Promise<string> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1600 } }],
    { compress: 0.8, format: 'jpeg' as ImageManipulator.SaveFormat }
  );
  return result.uri;
}

async function encodeImageToBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, {
    encoding: 'base64' as FileSystem.EncodingType,
  });
}

export async function importRecipeFromPhotos(photoUris: string[]): Promise<ParsedRecipe> {
  const images: Array<{ mediaType: 'image/jpeg'; data: string }> = [];

  for (const uri of photoUris) {
    const resizedUri = await resizeImage(uri);
    const base64 = await encodeImageToBase64(resizedUri);
    images.push({
      mediaType: 'image/jpeg',
      data: base64,
    });
  }

  const input = await backendPost<{
    title: string;
    description?: string;
    ingredients: Array<{ name: string; quantity: number; unit: string }>;
  }>('/api/recipes/import-from-photos', {
    images,
    languageName: t('ai_language_name'),
    languageInstruction: t('ai_language_instruction'),
  });

  if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) {
    throw new ParseError('No ingredients found in the recipe');
  }

  return {
    title: input.title ?? 'Przepis',
    description: input.description,
    ingredients: input.ingredients.map((ing) => ({
      name: String(ing.name).toLowerCase(),
      quantity: Number(ing.quantity) || 1,
      unit: normalizeUnit(String(ing.unit)),
    })),
  };
}
