import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AddButton } from '@/components/add-button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { MenuSections } from '@/components/menu-sections';
import { RecipePhoto } from '@/components/recipe-photo';
import { Screen } from '@/components/screen';
import { Stars } from '@/components/stars';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { byGroupThenTitle, recipeEmoji } from '@/data/labels';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useT } from '@/i18n';

const NO_GROUP = 'none';

export default function RecipesScreen() {
  const theme = useTheme();
  const t = useT();
  const recipes = useStore((s) => s.recipes);
  const groups = useStore((s) => s.groups);
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes
      .filter((r) => {
        if (groupFilter === NO_GROUP && r.groupId !== null) return false;
        if (groupFilter && groupFilter !== NO_GROUP && r.groupId !== groupFilter) return false;
        return !q || r.title.toLowerCase().includes(q);
      })
      // with a group filter on this is plain alphabetical
      .sort(byGroupThenTitle(groups));
  }, [recipes, groups, query, groupFilter]);

  const hasUngrouped = recipes.some((r) => r.groupId === null);
  const groupOf = (id: string | null) => groups.find((g) => g.id === id);

  return (
    <Screen
      wide
      title={t('recipes_title')}
      action={
        <AddButton
          onPress={() => router.push({ pathname: '/recipe/form', params: groupFilter && groupFilter !== NO_GROUP ? { groupId: groupFilter } : {} })}
          accessibilityLabel={t('recipe_add')}
        />
      }>
      {recipes.length > 0 && (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search_placeholder')}
            placeholderTextColor={theme.icon}
            clearButtonMode="while-editing"
            style={[styles.search, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label={t('all')} selected={groupFilter === null} onPress={() => setGroupFilter(null)} />
            {groups.map((g) => (
              <Chip
                key={g.id}
                label={`${g.emoji} ${g.name}`}
                selected={groupFilter === g.id}
                onPress={() => setGroupFilter(groupFilter === g.id ? null : g.id)}
              />
            ))}
            {hasUngrouped && (
              <Chip label={t('no_group')} selected={groupFilter === NO_GROUP} onPress={() => setGroupFilter(NO_GROUP)} />
            )}
            <Chip label={t('groups_manage')} onPress={() => router.push('/groups')} />
          </ScrollView>
        </>
      )}

      {recipes.length === 0 ? (
        <EmptyState emoji="🍽️" title={t('recipes_empty_title')} subtitle={t('recipes_empty_subtitle')} />
      ) : visible.length === 0 ? (
        <EmptyState emoji="🔎" title={t('recipes_none_found')} />
      ) : (
        <MenuSections
          recipes={visible}
          flat={!!query.trim()}
          renderRecipe={(r) => {
            const group = groupOf(r.groupId);
            return (
              <Card onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })} style={styles.row}>
                <RecipePhoto photo={r.photo} emoji={recipeEmoji(r, group)} size={64} />
                <View style={styles.rowText}>
                  <ThemedText type="default" style={styles.rowTitle} numberOfLines={2}>
                    {r.title}
                  </ThemedText>
                  {r.rating ? <Stars value={r.rating} size={13} /> : null}
                  <ThemedText type="small" numberOfLines={1}>
                    {group ? `${group.emoji} ${group.name}` : t('no_group')} · {t('ingredients_count', { count: r.ingredients.length })}
                  </ThemedText>
                </View>
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 44, borderWidth: 1, borderRadius: Radius.control, paddingHorizontal: 12, fontSize: 16 },
  chips: { gap: Spacing.two, paddingVertical: 2 },
  // flexGrow: cards in one grid row get the same height
  row: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: 10 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '700' },
});
