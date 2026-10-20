import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';

import { UNITS } from '@/constants/units';
import { toRecipeFile, type RecipeFile } from '@/data/import';
import type { Group, MealSlot, PlanEntry, Product, Recipe, Unit } from '@/data/types';

/** Opens the app (Universal Link / App Link); the page behind it offers the stores when the app is missing. */
export const PLAN_LINK_BASE = 'https://przemek-gawron.github.io/dishdeck/p';

/**
 * Days of a plan sent to another phone. Recipes, products and groups go by name, since ids differ between phones;
 * the recipes are a `RecipeFile`, so they are validated and merged like an imported file.
 */
export interface PlanPayload {
  /** YYYY-MM-DD, inclusive; the receiver's plan for these days is replaced. */
  start: string;
  end: string;
  /** The sender's visible meals, in order. */
  slots: { key?: MealSlot['key']; name?: string }[];
  recipes: RecipeFile;
  entries: PlanPayloadEntry[];
}

export interface PlanPayloadEntry {
  date: string;
  /** Index in `slots`. */
  slot: number;
  /** Index in `recipes.recipes`; none for a meal without a recipe (`note`). */
  recipe?: number;
  note?: string;
  ordered?: boolean;
  servings: number;
  swaps?: { from: string; product: string; quantity: number; unit: Unit }[];
}

const FORMAT = 'dishdeck-plan';
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLOT_KEYS: NonNullable<MealSlot['key']>[] = ['breakfast', 'second_breakfast', 'lunch', 'snack', 'dinner'];

interface PlanData {
  plan: PlanEntry[];
  recipes: Recipe[];
  products: Product[];
  groups: Group[];
  slots: MealSlot[];
  mealCount: number;
}

/** The plan of the visible meals from `start` to `end` as a link; the data travels in the fragment, never to a server. */
export function encodePlanLink(data: PlanData, start: string, end: string): string {
  const slots = data.slots.slice(0, data.mealCount);
  const product = (id: string) => data.products.find((p) => p.id === id);
  const recipes: RecipeFile['recipes'] = [];
  const groups: RecipeFile['groups'] = [];
  const recipeIndex = new Map<string, number>();

  const addRecipe = (recipe: Recipe) => {
    if (!recipeIndex.has(recipe.id)) {
      const group = data.groups.find((g) => g.id === recipe.groupId);
      if (group && !groups.some((g) => g.name === group.name)) groups.push({ name: group.name, emoji: group.emoji });
      recipeIndex.set(recipe.id, recipes.length);
      recipes.push({
        title: recipe.title,
        group: group?.name ?? null,
        description: recipe.description,
        menus: [],
        ingredients: recipe.ingredients.flatMap((i) => {
          const p = product(i.productId);
          return p ? [{ name: p.name, quantity: i.quantity, unit: i.unit, department: p.departmentId }] : [];
        }),
      });
    }
    return recipeIndex.get(recipe.id)!;
  };

  const entries = data.plan
    .filter((e) => e.date >= start && e.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((e): PlanPayloadEntry[] => {
      const slot = slots.findIndex((s) => s.id === e.slotId);
      if (slot < 0) return [];
      if (e.note) return [{ date: e.date, slot, note: e.note, ordered: e.ordered, servings: e.servings }];
      const recipe = data.recipes.find((r) => r.id === e.recipeId);
      // a deleted recipe is only a name now
      if (!recipe) return e.title ? [{ date: e.date, slot, note: e.title, servings: e.servings }] : [];
      const swaps = e.swaps?.flatMap((w) => {
        const from = product(w.fromProductId);
        const to = product(w.productId);
        return from && to ? [{ from: from.name, product: to.name, quantity: w.quantity, unit: w.unit }] : [];
      });
      return [{ date: e.date, slot, recipe: addRecipe(recipe), servings: e.servings, swaps: swaps?.length ? swaps : undefined }];
    });

  const payload = {
    format: FORMAT,
    v: 1,
    start,
    end,
    slots: slots.map((s) => ({ key: s.key, name: s.name })),
    groups,
    recipes,
    entries,
  };
  return `${PLAN_LINK_BASE}#${toBase64Url(deflateSync(strToU8(JSON.stringify(payload)), { level: 9 }))}`;
}

/** The plan in a link's fragment; null when it is damaged or not a plan link. */
export function decodePlanLink(fragment: string): PlanPayload | null {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(strFromU8(inflateSync(fromBase64Url(fragment))));
  } catch {
    return null;
  }
  if (data?.format !== FORMAT || data.v !== 1) return null;
  const { start, end } = data;
  if (typeof start !== 'string' || typeof end !== 'string' || !DATE.test(start) || !DATE.test(end) || start > end) return null;
  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

  const slots = (Array.isArray(data.slots) ? data.slots : []).map((s) => ({
    key: SLOT_KEYS.includes(s?.key) ? (s.key as MealSlot['key']) : undefined,
    name: text(s?.name) || undefined,
  }));
  // recipes are validated as a recipe file; the indexes of entries must still match, so nothing may be dropped
  const recipes = toRecipeFile({ menus: [], groups: data.groups, recipes: data.recipes });
  if (!recipes || recipes.recipes.length !== (data.recipes as unknown[]).length) return null;

  const entries = (Array.isArray(data.entries) ? data.entries : []).flatMap((e): PlanPayloadEntry[] => {
    const date = text(e?.date);
    const slot = e?.slot;
    const servings = Number(e?.servings);
    if (!DATE.test(date) || date < start || date > end) return [];
    if (!Number.isInteger(slot) || slot < 0 || slot >= slots.length) return [];
    const base = { date, slot, servings: Number.isFinite(servings) && servings > 0 ? servings : 1 };
    const note = text(e?.note);
    if (note) return [{ ...base, note, ordered: e.ordered === true || undefined }];
    if (!Number.isInteger(e?.recipe) || e.recipe < 0 || e.recipe >= recipes.recipes.length) return [];
    const swaps = (Array.isArray(e.swaps) ? e.swaps : [])
      .map((w: Record<string, unknown>) => ({
        from: text(w?.from),
        product: text(w?.product),
        quantity: Number(w?.quantity),
        unit: w?.unit as Unit,
      }))
      .filter((w: { from: string; product: string; quantity: number; unit: Unit }) =>
        w.from && w.product && Number.isFinite(w.quantity) && w.quantity > 0 && UNITS.includes(w.unit),
      );
    return [{ ...base, recipe: e.recipe, swaps: swaps.length ? swaps : undefined }];
  });

  return { start, end, slots, recipes, entries };
}

/** The data of a plan link (`…/p#data` or `dishdeck://p#data`); null for any other address. */
export function planLinkData(url: string): string | null {
  return /\/p\/?#([A-Za-z0-9_-]+)$/.exec(url)?.[1] ?? null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
