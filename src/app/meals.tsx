import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Field } from '@/components/field';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useSlotName } from '@/data/labels';
import { useStore } from '@/data/store';
import type { MealSlot } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

/** Rename and reorder the meals of the day; an empty name resets a meal to its default. */
export default function MealsScreen() {
  const t = useT();
  const theme = useTheme();
  const slotName = useSlotName();
  const slots = useStore((s) => s.slots);
  const mealCount = useStore((s) => s.mealCount);
  const renameSlot = useStore((s) => s.renameSlot);
  const moveSlot = useStore((s) => s.moveSlot);
  const visible = slots.slice(0, mealCount);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(visible.map((s) => [s.id, s.name ?? ''])),
  );

  const placeholder = (slot: MealSlot, index: number) => slotName({ ...slot, name: undefined }, index);

  const arrow = (slot: MealSlot, direction: -1 | 1, disabled: boolean) => (
    <Pressable
      hitSlop={8}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${t(direction < 0 ? 'move_up' : 'move_down')} – ${slotName(slot, visible.indexOf(slot))}`}
      onPress={() => moveSlot(slot.id, direction)}>
      <IconSymbol name={direction < 0 ? 'chevron.up' : 'chevron.down'} size={20} color={disabled ? theme.border : theme.textSecondary} />
    </Pressable>
  );

  return (
    <Page>
      <ThemedText type="small">{t('meals_names_hint')}</ThemedText>
      {visible.map((slot, index) => (
        <View key={slot.id} style={styles.row}>
          <ThemedText type="label" style={styles.number}>
            {index + 1}
          </ThemedText>
          <View style={styles.field}>
            <Field
              value={drafts[slot.id] ?? ''}
              placeholder={placeholder(slot, index)}
              onChangeText={(text) => {
                setDrafts((d) => ({ ...d, [slot.id]: text }));
                renameSlot(slot.id, text);
              }}
            />
          </View>
          {arrow(slot, -1, index === 0)}
          {arrow(slot, 1, index === visible.length - 1)}
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  number: { width: 14 },
  field: { flex: 1 },
});
