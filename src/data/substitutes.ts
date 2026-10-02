import { convertToBase } from '@/constants/units';
import type { SubstituteGroup, Unit } from '@/data/types';

export interface SubstituteOption {
  product: string;
  quantity: number;
  unit: Unit;
}

/** 237 g reads badly on a shopping list; round to 5 g / 5 ml above 20, else to one decimal. */
function round(quantity: number): number {
  return quantity >= 20 ? Math.round(quantity / 5) * 5 : Math.round(quantity * 10) / 10;
}

/**
 * What an ingredient can be replaced with, and how much of it: the amount is scaled by the
 * group's equivalents (60 g of groats -> 240 g of potatoes). When the units cannot be compared
 * (a recipe lists "1 łyżka" of oil) only 1:1 swaps are offered, keeping the recipe's amount.
 */
export function substituteOptions(
  productName: string,
  quantity: number,
  unit: Unit,
  groups: SubstituteGroup[],
): SubstituteOption[] {
  const name = productName.toLowerCase();
  const options = new Map<string, SubstituteOption>();
  for (const group of groups) {
    const source = group.items.find((i) => i.product.toLowerCase() === name);
    if (!source || source.quantity <= 0) continue;
    const from = convertToBase(quantity, unit);
    const per = convertToBase(source.quantity, source.unit);
    for (const target of group.items) {
      // a row added in Settings but not named yet
      if (!target.product.trim()) continue;
      if (target === source || target.product.toLowerCase() === name || options.has(target.product.toLowerCase())) continue;
      let option: SubstituteOption | null = null;
      if (from.baseUnit === per.baseUnit) {
        option = { product: target.product, quantity: round((from.value / per.value) * target.quantity), unit: target.unit };
      } else if (target.quantity === source.quantity && target.unit === source.unit) {
        option = { product: target.product, quantity, unit };
      }
      if (option && option.quantity > 0) options.set(target.product.toLowerCase(), option);
    }
  }
  return [...options.values()];
}
