import { Fragment, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Grid } from '@/components/columns';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

const OWN = 'own';

type Props<T extends { id: string; menuIds?: string[] }> = {
  recipes: T[];
  renderRecipe: (recipe: T) => ReactNode;
  /** Forces a plain list, e.g. while searching, so matches are never hidden in a collapsed section. */
  flat?: boolean;
};

/**
 * A recipe list that, when "group by meal plan" is on, is split into collapsible sections:
 * one per imported meal plan (newest first, open by default) and "Own" for the rest.
 * A recipe that appeared in several plans is listed under each of them.
 */
export function MenuSections<T extends { id: string; menuIds?: string[] }>({ recipes, renderRecipe, flat }: Props<T>) {
  const theme = useTheme();
  const t = useT();
  const menus = useStore((s) => s.menus);
  const groupByMenu = useStore((s) => s.groupByMenu);
  // sections the user opened or closed by hand; the rest follow the default
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  if (flat || !groupByMenu || menus.length === 0) {
    return <Grid>{recipes.map((r) => <Fragment key={r.id}>{renderRecipe(r)}</Fragment>)}</Grid>;
  }

  const known = new Set(menus.map((m) => m.id));
  const sections = [
    ...menus.map((m) => ({ id: m.id, title: m.name, recipes: recipes.filter((r) => r.menuIds?.includes(m.id)) })),
    { id: OWN, title: t('menu_own'), recipes: recipes.filter((r) => !r.menuIds?.some((id) => known.has(id))) },
  ].filter((section) => section.recipes.length > 0);

  return (
    <View style={styles.list}>
      {sections.map((section, index) => {
        const open = toggled[section.id] ?? index === 0;
        return (
          <View key={section.id} style={styles.list}>
            <Pressable
              onPress={() => setToggled((current) => ({ ...current, [section.id]: !open }))}
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              style={({ pressed }) => [styles.header, { backgroundColor: theme.surfaceCard }, pressed && styles.pressed]}>
              <IconSymbol name={open ? 'chevron.down' : 'chevron.right'} size={16} color={theme.textSecondary} />
              <ThemedText style={styles.title} numberOfLines={1}>
                {section.title}
              </ThemedText>
              <ThemedText type="small">{section.recipes.length}</ThemedText>
            </Pressable>
            {open && <Grid>{section.recipes.map((r) => <Fragment key={r.id}>{renderRecipe(r)}</Fragment>)}</Grid>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  title: { flex: 1, fontWeight: '700' },
  pressed: { opacity: 0.6 },
});
