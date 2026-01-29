import { Unit } from '@/types';

export type UnitCategory = 'weight' | 'volume' | 'count' | 'spoon';

export interface UnitDefinition {
  category: UnitCategory;
  baseUnit: Unit;
  toBase: number;
  displayName: string;
}

export const UNIT_DEFINITIONS: Record<Unit, UnitDefinition> = {
  g: { category: 'weight', baseUnit: 'g', toBase: 1, displayName: 'g' },
  kg: { category: 'weight', baseUnit: 'g', toBase: 1000, displayName: 'kg' },
  ml: { category: 'volume', baseUnit: 'ml', toBase: 1, displayName: 'ml' },
  l: { category: 'volume', baseUnit: 'ml', toBase: 1000, displayName: 'l' },
  szt: { category: 'count', baseUnit: 'szt', toBase: 1, displayName: 'szt' },
  lyzka: { category: 'spoon', baseUnit: 'lyzka', toBase: 1, displayName: 'lyzka' },
  lyzeczka: { category: 'spoon', baseUnit: 'lyzeczka', toBase: 1, displayName: 'lyzeczka' },
  szklanka: { category: 'volume', baseUnit: 'ml', toBase: 250, displayName: 'szklanka' },
};

export const UNIT_OPTIONS: { value: Unit; label: string }[] = [
  { value: 'g', label: 'g' },
  { value: 'kg', label: 'kg' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'szt', label: 'szt' },
  { value: 'lyzka', label: 'lyzka' },
  { value: 'lyzeczka', label: 'lyzeczka' },
  { value: 'szklanka', label: 'szklanka' },
];

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
