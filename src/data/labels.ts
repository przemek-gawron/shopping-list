import { useCallback } from 'react';

import type { Group, MealSlot } from '@/data/types';
import { useT } from '@/i18n';

/** Display name of a meal slot: the user's own name, else the translated default, else "Meal N". */
export function useSlotName() {
  const t = useT();
  return useCallback(
    (slot: MealSlot, index: number) =>
      slot.name ?? (slot.key ? t(`slot_${slot.key}`) : t('slot_numbered', { number: index + 1 })),
    [t],
  );
}

/** Words that tie a default meal to a recipe group in either language, e.g. "Obiad" -> "Obiady" / "Lunches". */
const GROUP_KEYWORDS: Record<NonNullable<MealSlot['key']>, string[]> = {
  second_breakfast: ['drugie śniadani', 'ii śniadani', '2 śniadani', 'second breakfast'],
  breakfast: ['śniadani', 'breakfast'],
  lunch: ['obiad', 'lunch'],
  snack: ['podwieczor', 'snack', 'przekąs'],
  dinner: ['kolacj', 'dinner', 'supper'],
};

/**
 * The recipe group that belongs to a meal, so adding "Obiad" to the plan offers the recipes from "Obiady".
 * Matched by name: first the meal's own name, then the default meal's keywords. Undefined when nothing fits.
 */
export function groupForSlot(slot: MealSlot, displayName: string, groups: Group[]): Group | undefined {
  const name = (g: Group) => g.name.toLowerCase();
  // "Kolacja" and "Kolacje" share everything but the ending
  const stem = displayName.toLowerCase().slice(0, Math.max(4, displayName.length - 2));
  const isSecondBreakfast = (g: Group) => GROUP_KEYWORDS.second_breakfast.some((k) => name(g).includes(k));
  const byName = groups.find((g) => name(g).startsWith(stem));
  if (byName) return byName;
  if (!slot.key || slot.name) return undefined;
  return groups.find(
    (g) => GROUP_KEYWORDS[slot.key!].some((k) => name(g).includes(k)) && (slot.key !== 'breakfast' || !isSecondBreakfast(g)),
  );
}
