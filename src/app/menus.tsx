import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Field } from '@/components/field';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import type { Menu } from '@/data/types';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

/** Rename, reorder (newest on top) and remove imported meal plans. Removing one keeps its recipes. */
export default function MenusScreen() {
  const t = useT();
  const theme = useTheme();
  const menus = useStore((s) => s.menus);
  const recipes = useStore((s) => s.recipes);
  const renameMenu = useStore((s) => s.renameMenu);
  const moveMenu = useStore((s) => s.moveMenu);
  const removeMenu = useStore((s) => s.removeMenu);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const arrow = (menu: Menu, direction: -1 | 1, disabled: boolean) => (
    <Pressable
      hitSlop={8}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${t(direction < 0 ? 'move_up' : 'move_down')} – ${menu.name}`}
      onPress={() => moveMenu(menu.id, direction)}>
      <IconSymbol name={direction < 0 ? 'chevron.up' : 'chevron.down'} size={20} color={disabled ? theme.border : theme.textSecondary} />
    </Pressable>
  );

  return (
    <Page>
      <ThemedText type="small">{t('menus_hint')}</ThemedText>
      {menus.length === 0 && <EmptyState emoji="📄" title={t('menus_empty_title')} subtitle={t('menus_empty_subtitle')} />}
      {menus.map((menu, index) => (
        <View key={menu.id} style={styles.item}>
          <View style={styles.row}>
            <View style={styles.field}>
              <Field
                value={drafts[menu.id] ?? menu.name}
                onChangeText={(text) => {
                  setDrafts((d) => ({ ...d, [menu.id]: text }));
                  renameMenu(menu.id, text);
                }}
              />
            </View>
            {arrow(menu, -1, index === 0)}
            {arrow(menu, 1, index === menus.length - 1)}
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${t('delete')} – ${menu.name}`}
              onPress={() =>
                confirm(t('menu_delete'), t('menu_delete_message', { name: menu.name }), t('delete'), t('cancel'), () => removeMenu(menu.id))
              }>
              <IconSymbol name="trash" size={20} color={theme.destructive} />
            </Pressable>
          </View>
          <ThemedText type="caption">{t('recipes_count', { count: recipes.filter((r) => r.menuIds?.includes(menu.id)).length })}</ThemedText>
        </View>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  item: { gap: Spacing.one },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  field: { flex: 1 },
});
