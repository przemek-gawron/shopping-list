import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { AddButton } from '@/components/add-button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DEPARTMENTS } from '@/constants/departments';
import { Spacing } from '@/constants/theme';
import { formatQuantity } from '@/constants/units';
import { useStore } from '@/data/store';
import type { ListItem } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

export default function ListScreen() {
  const theme = useTheme();
  const t = useT();
  const list = useStore((s) => s.list);
  const toggle = useStore((s) => s.toggleListItem);
  const remove = useStore((s) => s.removeListItem);
  const clearChecked = useStore((s) => s.clearChecked);
  const clearList = useStore((s) => s.clearList);

  const sections = useMemo(
    () =>
      DEPARTMENTS.map((d) => ({
        ...d,
        items: list.filter((i) => i.departmentId === d.id && !i.checked),
      })).filter((s) => s.items.length > 0),
    [list],
  );
  const checked = useMemo(() => list.filter((i) => i.checked), [list]);
  const done = checked.length;

  const copy = async () => {
    const lines = [...sections.flatMap((s) => s.items), ...checked].map(
      (i) => `${i.checked ? '[x]' : '[ ]'} ${i.name}: ${formatQuantity(i.quantity)} ${t(`unit_${i.unit}`)}`,
    );
    await Clipboard.setStringAsync(lines.join('\n'));
    Alert.alert(t('list_copied'));
  };

  const row = (item: ListItem) => (
    <View key={item.id} style={styles.item}>
      <Pressable
        onPress={() => toggle(item.id)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.checked }}
        accessibilityLabel={item.name}
        style={[styles.checkbox, { borderColor: theme.tint, backgroundColor: item.checked ? theme.tint : 'transparent' }]}>
        {item.checked && <IconSymbol name="checkmark" size={14} color={theme.onPrimary} />}
      </Pressable>
      {/* tapping the name or amount opens the item for editing */}
      <Pressable
        style={({ pressed }) => [styles.itemBody, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${t('list_edit')} – ${item.name}`}
        onPress={() => router.push({ pathname: '/list/add', params: { id: item.id } })}>
        <ThemedText style={[styles.itemName, item.checked && styles.doneText]} color={item.checked ? 'textSecondary' : 'text'}>
          {item.name}
        </ThemedText>
        <ThemedText type="small" style={item.checked && styles.doneText}>
          {formatQuantity(item.quantity)} {t(`unit_${item.unit}`)}
        </ThemedText>
      </Pressable>
      <Pressable hitSlop={8} accessibilityRole="button" onPress={() => remove(item.id)} accessibilityLabel={t('delete')}>
        <IconSymbol name="xmark" size={18} color={theme.icon} />
      </Pressable>
    </View>
  );

  return (
    <Screen title={t('list_title')} action={<AddButton onPress={() => router.push('/list/add')} accessibilityLabel={t('list_add')} />}>
      {list.length === 0 ? (
        <EmptyState emoji="🛒" title={t('list_empty_title')} subtitle={t('list_empty_subtitle')} />
      ) : (
        <>
          <Card style={styles.progress}>
            <View style={styles.progressText}>
              <ThemedText type="label">{t('list_progress')}</ThemedText>
              <ThemedText style={styles.count}>
                {done} / {list.length}
              </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: theme.surfaceCard }]}>
              <View style={[styles.fill, { width: `${(done / list.length) * 100}%`, backgroundColor: theme.tint }]} />
            </View>
          </Card>

          <View style={styles.actions}>
            <Chip label={t('list_copy')} onPress={() => void copy()} />
            {done > 0 && <Chip label={t('list_clear_checked')} onPress={clearChecked} />}
            <Chip
              label={t('list_clear')}
              onPress={() => confirm(t('list_clear'), t('list_clear_message'), t('delete'), t('cancel'), clearList)}
            />
          </View>

          {sections.map((section) => (
            <Card key={section.id} style={styles.section}>
              <ThemedText type="label">
                {section.emoji} {t(`dept_${section.id}`)}
              </ThemedText>
              {section.items.map(row)}
            </Card>
          ))}

          {checked.length > 0 && (
            <Card style={styles.section}>
              <ThemedText type="label">✅ {t('list_checked')}</ThemedText>
              {checked.map(row)}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { gap: Spacing.two },
  progressText: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontWeight: '700' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  section: { gap: Spacing.two },
  item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 4 },
  itemBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pressed: { opacity: 0.6 },
  itemName: { flex: 1, fontWeight: '600' },
  doneText: { textDecorationLine: 'line-through' },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
