import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { DEPARTMENTS } from '@/constants/departments';
import { Spacing } from '@/constants/theme';
import { UNITS, formatQuantity } from '@/constants/units';
import { useStore } from '@/data/store';
import type { DepartmentId, Unit } from '@/data/types';
import { useT } from '@/i18n';

/** Adds a one-off item to the shopping list, or edits an existing one (`id`), e.g. to change its amount. */
export default function ListAddScreen() {
  const t = useT();
  const products = useStore((s) => s.products);
  const addListItem = useStore((s) => s.addListItem);
  const updateListItem = useStore((s) => s.updateListItem);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = useStore((s) => s.list.find((i) => i.id === id));

  const [name, setName] = useState(editing?.name ?? '');
  const [quantity, setQuantity] = useState(editing ? formatQuantity(editing.quantity) : '1');
  const [unit, setUnit] = useState<Unit>(editing?.unit ?? 'szt');
  const [department, setDepartment] = useState<DepartmentId>(editing?.departmentId ?? 'other');

  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q || products.some((p) => p.name.toLowerCase() === q)) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5);
  }, [name, products]);

  const save = () => {
    const trimmed = name.trim();
    const amount = parseFloat(quantity.replace(',', '.'));
    if (!trimmed) return Alert.alert(t('product_name_required'));
    if (!Number.isFinite(amount) || amount <= 0) return Alert.alert(t('list_quantity_invalid'));
    const data = { name: trimmed, quantity: amount, unit, departmentId: department };
    if (editing) updateListItem({ ...editing, ...data });
    else addListItem(data);
    router.back();
  };

  return (
    <Page>
      <Stack.Screen
        options={{
          title: editing ? t('list_edit') : t('list_add'),
          // saving without scrolling down past the unit and department chips
          headerRight: () => (
            <ThemedText color="tint" accessibilityRole="button" style={styles.headerAction} onPress={save}>
              {editing ? t('save') : t('add')}
            </ThemedText>
          ),
        }}
      />
      <Field label={t('product_name')} value={name} onChangeText={setName} placeholder={t('product_name_placeholder')} autoFocus={!editing} />
      {suggestions.length > 0 && (
        <View style={styles.wrap}>
          {suggestions.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              onPress={() => {
                setName(p.name);
                setUnit(p.defaultUnit);
                setDepartment(p.departmentId);
              }}
            />
          ))}
        </View>
      )}
      <Field label={t('quantity')} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" selectTextOnFocus />
      <View style={styles.section}>
        <ThemedText type="label">{t('unit')}</ThemedText>
        <View style={styles.wrap}>
          {UNITS.map((u) => (
            <Chip key={u} label={t(`unit_${u}`)} selected={unit === u} onPress={() => setUnit(u)} />
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <ThemedText type="label">{t('product_department')}</ThemedText>
        <View style={styles.wrap}>
          {DEPARTMENTS.map((d) => (
            <Chip key={d.id} label={`${d.emoji} ${t(`dept_${d.id}`)}`} selected={department === d.id} onPress={() => setDepartment(d.id)} />
          ))}
        </View>
      </View>
      <Button label={editing ? t('save') : t('list_add_confirm')} onPress={save} />
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  headerAction: { fontWeight: '700', fontSize: 16, paddingHorizontal: 6 },
});
