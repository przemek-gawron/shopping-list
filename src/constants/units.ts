import type { Unit } from '@/data/types';

export type UnitCategory = 'weight' | 'volume' | 'count' | 'spoon';

export interface UnitDefinition {
  category: UnitCategory;
  baseUnit: Unit;
  toBase: number;
}

export const UNIT_DEFINITIONS: Record<Unit, UnitDefinition> = {
  g: { category: 'weight', baseUnit: 'g', toBase: 1 },
  kg: { category: 'weight', baseUnit: 'g', toBase: 1000 },
  ml: { category: 'volume', baseUnit: 'ml', toBase: 1 },
  l: { category: 'volume', baseUnit: 'ml', toBase: 1000 },
  szt: { category: 'count', baseUnit: 'szt', toBase: 1 },
  lyzka: { category: 'spoon', baseUnit: 'lyzka', toBase: 1 },
  lyzeczka: { category: 'spoon', baseUnit: 'lyzeczka', toBase: 1 },
  szklanka: { category: 'volume', baseUnit: 'ml', toBase: 250 },
};

export const UNITS = Object.keys(UNIT_DEFINITIONS) as Unit[];

export function convertToBase(quantity: number, unit: Unit): { value: number; baseUnit: Unit } {
  const def = UNIT_DEFINITIONS[unit];
  return {
    value: quantity * def.toBase,
    baseUnit: def.baseUnit,
  };
}

export function convertFromBase(value: number, baseUnit: Unit): { quantity: number; unit: Unit } {
  if (baseUnit === 'g') {
    if (value >= 1000) {
      return { quantity: value / 1000, unit: 'kg' };
    }
    return { quantity: value, unit: 'g' };
  }

  if (baseUnit === 'ml') {
    if (value >= 1000) {
      return { quantity: value / 1000, unit: 'l' };
    }
    return { quantity: value, unit: 'ml' };
  }

  return { quantity: value, unit: baseUnit };
}

export function formatQuantity(quantity: number): string {
  if (Number.isInteger(quantity)) {
    return quantity.toString();
  }
  return quantity.toFixed(2).replace(/\.?0+$/, '');
}
