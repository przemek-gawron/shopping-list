import { convertFromBase, convertToBase } from '@/constants/units';
import type { ListItem, PlanEntry, Product, Recipe, Unit } from '@/data/types';

/**
 * Adds up the ingredients of the chosen plan entries. The same product in the same kind of unit
 * (weight, volume, pieces...) is merged into one line, e.g. 200 g + 0.3 kg = 500 g.
 */
export function buildShoppingList(
  entries: PlanEntry[],
  recipes: Recipe[],
  products: Product[],
): Omit<ListItem, 'id'>[] {
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const productById = new Map(products.map((p) => [p.id, p]));
  const totals = new Map<string, { product: Product; baseUnit: Unit; value: number }>();

  for (const entry of entries) {
    const recipe = recipeById.get(entry.recipeId);
    if (!recipe) continue;
    for (const ingredient of recipe.ingredients) {
      // a substitute chosen for this meal replaces the recipe's ingredient, unless its product is gone
      const swap = entry.swaps?.find((s) => s.fromProductId === ingredient.productId && productById.has(s.productId));
      const used = swap ?? ingredient;
      const product = productById.get(used.productId);
      if (!product) continue;
      const { value, baseUnit } = convertToBase(used.quantity * entry.servings, used.unit);
      const key = `${product.id}:${baseUnit}`;
      const current = totals.get(key);
      if (current) current.value += value;
      else totals.set(key, { product, baseUnit, value });
    }
  }

  return [...totals.values()].map(({ product, baseUnit, value }) => {
    const { quantity, unit } = convertFromBase(value, baseUnit);
    return {
      name: product.name,
      quantity: Math.round(quantity * 100) / 100,
      unit,
      checked: false,
      departmentId: product.departmentId,
    };
  });
}
