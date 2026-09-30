import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { DEPARTMENTS } from '@/constants/departments';
import { Spacing } from '@/constants/theme';
import { UNITS } from '@/constants/units';
import { useStore } from '@/data/store';
import type { DepartmentId, Unit } from '@/data/types';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const t = useT();
  const editing = useStore((s) => s.products.find((p) => p.id === id));
  const products = useStore((s) => s.products);
  const addProduct = useStore((s) => s.addProduct);
  const updateProduct = useStore((s) => s.updateProduct);
  const removeProduct = useStore((s) => s.removeProduct);

  const [name, setName] = useState(editing?.name ?? '');
  const [unit, setUnit] = useState<Unit>(editing?.defaultUnit ?? 'szt');
  const [department, setDepartment] = useState<DepartmentId>(editing?.departmentId ?? 'other');

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return Alert.alert(t('product_name_required'));
    if (products.some((p) => p.id !== editing?.id && p.name.toLowerCase() === trimmed.toLowerCase())) {
      return Alert.alert(t('product_duplicate'));
    }
    const data = { name: trimmed, defaultUnit: unit, departmentId: department };
    if (editing) updateProduct({ ...data, id: editing.id });
    else addProduct(data);
    router.back();
  };

  return (
    <Page>
      <Stack.Screen options={{ title: editing ? t('product_edit') : t('product_new') }} />
      <Field label={t('product_name')} value={name} onChangeText={setName} placeholder={t('product_name_placeholder')} autoFocus={!editing} />
      <View style={styles.section}>
        <ThemedText type="label">{t('product_unit')}</ThemedText>
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
      <Button label={t('save')} onPress={save} />
      {editing && (
        <Button
          label={t('delete')}
          variant="destructive"
          onPress={() =>
            confirm(t('product_delete'), t('product_delete_message', { name: editing.name }), t('delete'), t('cancel'), () => {
              removeProduct(editing.id);
              router.back();
            })
          }
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
});
