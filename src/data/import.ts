import { DEPARTMENT_ORDER } from '@/constants/departments';
import { UNITS } from '@/constants/units';
import type { DepartmentId, Unit } from '@/data/types';

/** Recipe file produced by `scripts/import-meal-plans.mjs`. */
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

/** Validates the file's content; returns null when it is not a recipe file. Bad entries are dropped. */
export function parseRecipeFile(json: string): RecipeFile | null {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return null;
  }
  const file = data as { format?: unknown; groups?: unknown; recipes?: unknown };
  if (file?.format !== 'shopping-list-recipes' || !Array.isArray(file.recipes)) return null;

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
