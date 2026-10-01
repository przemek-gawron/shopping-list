import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEFAULT_SUBSTITUTES } from '@/constants/substitutes';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import type { SubstituteGroup, Unit } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';
import { generateId } from '@/utils/id-generator';

const UNIT_CYCLE: Unit[] = ['g', 'ml', 'szt'];

/** Amounts are edited as text so "2," can be typed on the way to "2,5". */
type Draft = { id: string; name: string; items: { product: string; quantity: string; unit: Unit }[] };

const toDraft = (groups: SubstituteGroup[]): Draft[] =>
  groups.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, quantity: String(i.quantity).replace('.', ',') })) }));

const fromDraft = (drafts: Draft[]): SubstituteGroup[] =>
  drafts.map((g) => ({
    ...g,
    items: g.items.map((i) => ({ ...i, product: i.product.trim(), quantity: parseFloat(i.quantity.replace(',', '.')) || 0 })),
  }));

/** View and edit the substitute groups used when swapping ingredients in the plan. */
export default function SubstitutesScreen() {
  const t = useT();
  const theme = useTheme();
  const stored = useStore((s) => s.substitutes);
  const setSubstitutes = useStore((s) => s.setSubstitutes);
  const [drafts, setDrafts] = useState<Draft[]>(() => toDraft(stored));

  const update = (next: Draft[]) => {
    setDrafts(next);
    setSubstitutes(fromDraft(next));
  };
  const patchGroup = (id: string, patch: (g: Draft) => Draft) => update(drafts.map((g) => (g.id === id ? patch(g) : g)));
  const patchItem = (id: string, index: number, patch: Partial<Draft['items'][number]>) =>
    patchGroup(id, (g) => ({ ...g, items: g.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) }));

  const inputStyle = { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border };

  return (
    <Page>
      <ThemedText type="small">{t('substitutes_hint')}</ThemedText>
      {drafts.map((group) => (
        <Card key={group.id} style={styles.group}>
          <Field label={t('substitutes_group')} value={group.name} onChangeText={(name) => patchGroup(group.id, (g) => ({ ...g, name }))} />
          {group.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <TextInput
                value={item.product}
                onChangeText={(product) => patchItem(group.id, index, { product })}
                placeholder={t('product_name')}
                placeholderTextColor={theme.icon}
                style={[styles.input, styles.name, inputStyle]}
              />
              <TextInput
                value={item.quantity}
                onChangeText={(quantity) => patchItem(group.id, index, { quantity })}
                keyboardType="decimal-pad"
                style={[styles.input, styles.quantity, inputStyle]}
              />
              <Chip
                label={t(`unit_${item.unit}`)}
                onPress={() => patchItem(group.id, index, { unit: UNIT_CYCLE[(UNIT_CYCLE.indexOf(item.unit) + 1) % UNIT_CYCLE.length] })}
              />
              <Pressable
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${t('delete')} – ${item.product}`}
                onPress={() => patchGroup(group.id, (g) => ({ ...g, items: g.items.filter((_, i) => i !== index) }))}>
                <IconSymbol name="xmark" size={18} color={theme.icon} />
              </Pressable>
            </View>
          ))}
          <View style={styles.actions}>
            <Chip
              label={`+ ${t('substitutes_add_item')}`}
              onPress={() => patchGroup(group.id, (g) => ({ ...g, items: [...g.items, { product: '', quantity: '100', unit: 'g' }] }))}
            />
            <Chip
              label={t('substitutes_delete_group')}
              onPress={() =>
                confirm(t('substitutes_delete_group'), group.name, t('delete'), t('cancel'), () =>
                  update(drafts.filter((g) => g.id !== group.id)),
                )
              }
            />
          </View>
        </Card>
      ))}
      <Button
        label={t('substitutes_add_group')}
        variant="secondary"
        onPress={() => update([...drafts, { id: generateId(), name: t('substitutes_new_group'), items: [] }])}
      />
      <Button
        label={t('substitutes_reset')}
        variant="destructive"
        onPress={() =>
          confirm(t('substitutes_reset'), t('substitutes_reset_message'), t('substitutes_reset'), t('cancel'), () =>
            update(toDraft(DEFAULT_SUBSTITUTES)),
          )
        }
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  input: { minHeight: 40, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, fontSize: 15 },
  name: { flex: 1 },
  quantity: { width: 60, textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
