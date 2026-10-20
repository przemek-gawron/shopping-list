import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useSlotName } from '@/data/labels';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useFormatAmount, useLocale, useT } from '@/i18n';
import { formatDate } from '@/utils/dates';

/** The planned meals a shopping list item was generated from, to check which recipe needs it. */
export default function ListSourcesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const theme = useTheme();
  const locale = useLocale();
  const formatAmount = useFormatAmount();
  const slotName = useSlotName();
  const item = useStore((s) => s.list.find((i) => i.id === id));
  const recipes = useStore((s) => s.recipes);
  const slots = useStore((s) => s.slots);
  const plan = useStore((s) => s.plan);

  if (!item) return <Stack.Screen options={{ title: '' }} />;

  return (
    <Page>
      <Stack.Screen options={{ title: item.name }} />
      <ThemedText type="small">
        {t('list_sources_total', { amount: formatAmount(item.quantity, item.unit) })}
      </ThemedText>
      {(item.sources ?? []).map((source, index) => {
        const recipe = recipes.find((r) => r.id === source.recipeId);
        // still planned: the recipe opens with that meal's servings and substitutes
        const entry = plan.find((e) => e.id === source.entryId && e.recipeId === source.recipeId);
        const slotIndex = slots.findIndex((s) => s.id === source.slotId);
        const when = [
          formatDate(source.date, locale, { weekday: 'short', day: 'numeric', month: 'short' }),
          slotIndex >= 0 ? slotName(slots[slotIndex], slotIndex) : undefined,
        ]
          .filter(Boolean)
          .join(' · ');
        return (
          <Card
            key={`${source.recipeId}-${source.date}-${source.slotId}-${index}`}
            style={styles.source}
            onPress={
              recipe
                ? () => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id, ...(entry && { entryId: entry.id }) } })
                : undefined
            }>
            <View style={styles.text}>
              <ThemedText style={styles.title}>{recipe?.title ?? source.title}</ThemedText>
              <ThemedText type="small">{when}</ThemedText>
              {!recipe && <ThemedText type="caption">{t('plan_recipe_deleted')}</ThemedText>}
              {source.swap && <ThemedText type="caption">{t('list_source_swap')}</ThemedText>}
            </View>
            <ThemedText style={styles.amount}>{formatAmount(source.quantity, source.unit)}</ThemedText>
            {recipe && <IconSymbol name="chevron.right" size={16} color={theme.icon} />}
          </Card>
        );
      })}
    </Page>
  );
}

const styles = StyleSheet.create({
  source: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  text: { flex: 1, gap: 2 },
  title: { fontWeight: '700' },
  amount: { fontWeight: '600' },
});
