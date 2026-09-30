import { useCallback } from 'react';

import type { MealSlot } from '@/data/types';
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
