import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Unit } from '@/types';

export interface ParsedRecipe {
  title: string;
  description?: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: Unit;
  }>;
}

export class ApiKeyError extends Error {
  constructor() {
    super('Invalid API key');
    this.name = 'ApiKeyError';
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

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

const SAVE_RECIPE_TOOL = {
  name: 'save_recipe',
  description: 'Save the extracted recipe data',
  input_schema: {
    type: 'object' as const,
    required: ['title', 'ingredients'],
    properties: {
      title: {
        type: 'string',
        description: 'Recipe title in Polish',
      },
      description: {
        type: 'string',
        description: 'Brief description or notes (optional)',
      },
      ingredients: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'quantity', 'unit'],
          properties: {
            name: {
              type: 'string',
              description: 'Ingredient name in Polish, lowercase',
            },
            quantity: {
              type: 'number',
              description: 'Numeric quantity',
            },
            unit: {
              type: 'string',
              description: 'Unit: g, kg, ml, l, szt, lyzka, lyzeczka, or szklanka',
            },
          },
        },
      },
    },
  },
};

export async function importRecipeFromPhotos(
  photoUris: string[],
  apiKey: string
): Promise<ParsedRecipe> {
  const imageContents: object[] = [];

  for (const uri of photoUris) {
    const resizedUri = await resizeImage(uri);
    const base64 = await encodeImageToBase64(resizedUri);
    imageContents.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: base64,
      },
    });
  }

  imageContents.push({
    type: 'text',
    text: 'Extract the recipe from the image(s) above. Use Polish for all text (title, description, ingredient names). Use only these units: g, kg, ml, l, szt, lyzka, lyzeczka, szklanka. Call the save_recipe tool with the extracted data.',
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [SAVE_RECIPE_TOOL],
      tool_choice: { type: 'tool', name: 'save_recipe' },
      messages: [
        {
          role: 'user',
          content: imageContents,
        },
      ],
    }),
  });

  if (response.status === 401) {
    throw new ApiKeyError();
  }

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.status}`);
  }

  const data = await response.json();
  const toolUse = data.content?.find((c: { type: string }) => c.type === 'tool_use');

  if (!toolUse || !toolUse.input) {
    throw new ParseError('Claude did not return a recipe');
  }

  const input = toolUse.input;

  if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) {
    throw new ParseError('No ingredients found in the recipe');
  }

  return {
    title: input.title ?? 'Przepis',
    description: input.description,
    ingredients: input.ingredients.map((ing: { name: string; quantity: number; unit: string }) => ({
      name: String(ing.name).toLowerCase(),
      quantity: Number(ing.quantity) || 1,
      unit: normalizeUnit(String(ing.unit)),
    })),
  };
}
