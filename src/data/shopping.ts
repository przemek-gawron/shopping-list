import { convertFromBase, convertToBase } from '@/constants/units';
import type { ListItem, PlanEntry, Product, Recipe, Unit } from '@/data/types';

/**
 * The swaps of a planned meal that still apply: the recipe has the replaced ingredient and the
 * substitute product exists. Others are left over after the recipe or the products were edited.
 */
export function appliedSwaps(entry: PlanEntry, recipe: Recipe | undefined, products: Product[]) {
  return (entry.swaps ?? []).filter(
    (s) => recipe?.ingredients.some((i) => i.productId === s.fromProductId) && products.some((p) => p.id === s.productId),
  );
}

/**
 * Weight, volume and spoons of one product are added up together, approximating 1 ml as 1 g (close
 * enough for oil, milk or yogurt) and a tablespoon as 15 ml, a teaspoon as 5 ml. Pieces stay apart:
 * "2 tomatoes" cannot honestly be turned into grams.
 */
const MEASURE: Partial<Record<Unit, { family: 'g' | 'ml' | 'lyzka' | 'lyzeczka'; ml: number }>> = {
  g: { family: 'g', ml: 1 },
  kg: { family: 'g', ml: 1000 },
  ml: { family: 'ml', ml: 1 },
  l: { family: 'ml', ml: 1000 },
  szklanka: { family: 'ml', ml: 250 },
  lyzka: { family: 'lyzka', ml: 15 },
  lyzeczka: { family: 'lyzeczka', ml: 5 },
};

type Total = { product: Product; baseUnit: Unit; value: number; byFamily: Map<string, number> };

/** A measured total in the unit that most of it came in: 20 ml + 15 g + 1 tbsp -> 50 ml. */
function measuredAmount(total: Total): { quantity: number; unit: Unit } {
  const [family] = [...total.byFamily.entries()].sort((a, b) => b[1] - a[1])[0];
  if (family === 'g' || family === 'ml') return convertFromBase(total.value, family);
  // spoons are measured by eye: round up to half a spoon instead of 2.67 tbsp
  return { quantity: Math.ceil((total.value / MEASURE[family as Unit]!.ml) * 2) / 2, unit: family as Unit };
}

/**
 * Adds up the ingredients of the chosen plan entries into one line per product (matched by name,
 * ignoring case): 200 g + 0.3 kg = 500 g, 20 ml + 15 g of oil = 35 ml; pieces get a line of their own.
 */
export function buildShoppingList(
  entries: PlanEntry[],
  recipes: Recipe[],
  products: Product[],
): Omit<ListItem, 'id'>[] {
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const productById = new Map(products.map((p) => [p.id, p]));
  const totals = new Map<string, Total>();

  for (const entry of entries) {
    const recipe = recipeById.get(entry.recipeId);
    if (!recipe) continue;
    for (const ingredient of recipe.ingredients) {
      // a substitute chosen for this meal replaces the recipe's ingredient, unless its product is gone
      const swap = entry.swaps?.find((s) => s.fromProductId === ingredient.productId && productById.has(s.productId));
      const used = swap ?? ingredient;
      const product = productById.get(used.productId);
      if (!product) continue;
      const amount = used.quantity * entry.servings;
      const measure = MEASURE[used.unit];
      const name = product.name.trim().toLowerCase();
      const key = measure ? `${name}:measured` : `${name}:${convertToBase(amount, used.unit).baseUnit}`;
      // measured amounts are kept in ml-equivalents; pieces in their own base unit
      const value = measure ? amount * measure.ml : convertToBase(amount, used.unit).value;
      const total = totals.get(key) ?? { product, baseUnit: measure ? 'ml' : used.unit, value: 0, byFamily: new Map() };
      total.value += value;
      if (measure) total.byFamily.set(measure.family, (total.byFamily.get(measure.family) ?? 0) + value);
      totals.set(key, total);
    }
  }

  return [...totals.values()].map((total) => {
    const { quantity, unit } = total.byFamily.size ? measuredAmount(total) : convertFromBase(total.value, total.baseUnit);
    return {
      name: total.product.name,
      quantity: Math.round(quantity * 100) / 100,
      unit,
      checked: false,
      departmentId: total.product.departmentId,
    };
  });
}
