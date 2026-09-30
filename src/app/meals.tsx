import { useState } from 'react';
import { Field } from '@/components/field';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useSlotName } from '@/data/labels';
import { useStore } from '@/data/store';
import type { MealSlot } from '@/data/types';
import { useT } from '@/i18n';

/** Rename the meals of the day; empty resets a meal to its default name. */
export default function MealsScreen() {
  const t = useT();
  const slotName = useSlotName();
  const slots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);
  const renameSlot = useStore((s) => s.renameSlot);
  const visible = slots.slice(0, mealCount);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(visible.map((s) => [s.id, s.name ?? ''])),
  );

  const placeholder = (slot: MealSlot, index: number) => slotName({ ...slot, name: undefined }, index);

  return (
    <Page>
      <ThemedText type="small">{t('meals_names_hint')}</ThemedText>
      {visible.map((slot, index) => (
        <Field
          key={slot.id}
          label={`${index + 1}`}
          value={drafts[slot.id] ?? ''}
          placeholder={placeholder(slot, index)}
          onChangeText={(text) => {
            setDrafts((d) => ({ ...d, [slot.id]: text }));
            renameSlot(slot.id, text);
          }}
        />
      ))}
    </Page>
  );
}
