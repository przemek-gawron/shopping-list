import { Recipe, RecipeSelection, Product, ShoppingListItem, Unit } from '@/types';
import { UNIT_DEFINITIONS, convertToBase, convertFromBase, formatQuantity } from '@/constants/units';

interface AggregatedItem {
  productId: string;
  productName: string;
  baseValue: number;
  baseUnit: Unit;
}

export function generateShoppingList(
  recipes: Recipe[],
  selections: RecipeSelection[],
  products: Product[]
): ShoppingListItem[] {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const aggregated = new Map<string, AggregatedItem>();

  for (const selection of selections) {
    const recipe = recipes.find((r) => r.id === selection.recipeId);
    if (!recipe) continue;

    for (const ingredient of recipe.ingredients) {
      const product = productMap.get(ingredient.productId);
      if (!product) continue;

      const multipliedQuantity = ingredient.quantity * selection.count;
      const { value, baseUnit } = convertToBase(multipliedQuantity, ingredient.unit);

      const existing = aggregated.get(ingredient.productId);
      if (existing) {
        if (existing.baseUnit === baseUnit) {
          existing.baseValue += value;
        } else {
          existing.baseValue += value;
        }
      } else {
        aggregated.set(ingredient.productId, {
          productId: ingredient.productId,
          productName: product.name,
          baseValue: value,
          baseUnit,
        });
      }
    }
  }

  const items: ShoppingListItem[] = [];

  for (const item of aggregated.values()) {
    const { quantity, unit } = convertFromBase(item.baseValue, item.baseUnit);

    items.push({
      productId: item.productId,
      productName: item.productName,
      quantity,
      unit,
      checked: false,
    });
  }

  items.sort((a, b) => a.productName.localeCompare(b.productName, 'pl'));

  return items;
}

export function formatShoppingListForClipboard(items: ShoppingListItem[]): string {
  const lines = items.map((item) => {
    const checked = item.checked ? '[x]' : '[ ]';
    return `${checked} ${item.productName}: ${formatQuantity(item.quantity)} ${item.unit}`;
  });

  return lines.join('\n');
}
