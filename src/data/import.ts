import { DEPARTMENT_ORDER } from '@/constants/departments';
import { UNITS } from '@/constants/units';
import { extractDocText, isDocFile } from '@/data/doc-text';
import { parseMealPlan } from '@/data/meal-plan';
import { MEAL_PLAN_PRODUCTS } from '@/data/meal-plan-products';
import type { DepartmentId, Unit } from '@/data/types';

/** Recipes to import: a JSON file produced by `scripts/import-meal-plans.mjs`, or a parsed .doc meal plan. */
export interface RecipeFile {
  groups: { name: string; emoji: string }[];
  recipes: {
    title: string;
    group: string | null;
    description?: string;
    ingredients: { name: string; quantity: number; unit: Unit; department: DepartmentId }[];
  }[];
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

/** Recipes of a dietitian meal plan in Word format; `unknown` counts ingredient names the dictionary lacks. */
export function parseMealPlanDoc(bytes: Uint8Array): { file: RecipeFile; unknown: number } | null {
  if (!isDocFile(bytes)) return null;
  const plan = parseMealPlan(extractDocText(bytes), MEAL_PLAN_PRODUCTS);
  const file = toRecipeFile(plan);
  return file && { file, unknown: plan.unknown.length };
}

/** Validates a JSON recipe file; returns null when it is not one. */
export function parseRecipeFile(json: string): RecipeFile | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if ((data as { format?: unknown })?.format !== 'shopping-list-recipes') return null;
  return toRecipeFile(data);
}

/** Keeps only well-formed groups, recipes and ingredients. */
function toRecipeFile(data: unknown): RecipeFile | null {
  const file = data as { groups?: unknown; recipes?: unknown };
  if (!Array.isArray(file?.recipes)) return null;

  const groups = (Array.isArray(file.groups) ? file.groups : [])
    .map((g) => ({ name: text(g?.name), emoji: text(g?.emoji) || '🍽️' }))
    .filter((g) => g.name);

  const recipes = file.recipes
    .map((r) => ({
      title: text(r?.title),
      group: text(r?.group) || null,
      description: text(r?.description) || undefined,
      ingredients: (Array.isArray(r?.ingredients) ? r.ingredients : [])
        .map((i: Record<string, unknown>) => ({
          name: text(i?.name),
          quantity: Number(i?.quantity),
          unit: (UNITS.includes(i?.unit as Unit) ? i.unit : 'szt') as Unit,
          department: (DEPARTMENT_ORDER.includes(i?.department as DepartmentId) ? i.department : 'other') as DepartmentId,
        }))
        .filter((i: { name: string; quantity: number }) => i.name && Number.isFinite(i.quantity) && i.quantity > 0),
    }))
    .filter((r) => r.title);

  return { groups, recipes };
}
