import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Chip } from '@/components/chip';
import { RecipePhoto } from '@/components/recipe-photo';
import { Page } from '@/components/screen';
import { Stars } from '@/components/stars';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatQuantity } from '@/constants/units';
import { recipeEmoji } from '@/data/labels';
import { appliedSwaps } from '@/data/shopping';
import { useStore } from '@/data/store';
import { substituteOptions } from '@/data/substitutes';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

/**
 * A recipe. Opened from the plan (`entryId`), it also lets you swap ingredients for substitutes
 * for that one meal; the recipe itself stays as it is.
 */
export default function RecipeScreen() {
  const { id, entryId } = useLocalSearchParams<{ id: string; entryId?: string }>();
  const t = useT();
  const entry = useStore((s) => (entryId ? s.plan.find((e) => e.id === entryId) : undefined));
  const substitutes = useStore((s) => s.substitutes);
  const setSwap = useStore((s) => s.setSwap);
  const clearSwap = useStore((s) => s.clearSwap);
  // ingredient whose substitutes are listed
  const [choosing, setChoosing] = useState<string | null>(null);
  const recipe = useStore((s) => s.recipes.find((r) => r.id === id));
  const group = useStore((s) => s.groups.find((g) => g.id === recipe?.groupId));
  const products = useStore((s) => s.products);
  const removeRecipe = useStore((s) => s.removeRecipe);
  const setRating = useStore((s) => s.setRating);

  if (!recipe) return <Stack.Screen options={{ title: '' }} />;
  // swaps to a product deleted since are ignored, as on the shopping list
  const swaps = entry ? appliedSwaps(entry, recipe, products) : [];

  return (
    <Page>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <ThemedText
              color="tint"
              accessibilityRole="button"
              style={styles.edit}
              onPress={() => router.push({ pathname: '/recipe/form', params: { id: recipe.id } })}>
              {t('edit')}
            </ThemedText>
          ),
        }}
      />
      <RecipePhoto photo={recipe.photo} emoji={recipeEmoji(recipe, group)} height={recipe.photo ? 220 : 120} />
      <View style={styles.titleBlock}>
        <ThemedText type="title">{recipe.title}</ThemedText>
        <Stars value={recipe.rating} onChange={(rating) => setRating(recipe.id, rating)} size={28} />
        <ThemedText type="small">{group ? `${group.emoji} ${group.name}` : t('no_group')}</ThemedText>
      </View>
      {recipe.description ? <ThemedText>{recipe.description}</ThemedText> : null}

      <ThemedText type="label">{t('ingredients')}</ThemedText>
      {entry && <ThemedText type="small">{t('swap_hint')}</ThemedText>}
      <Card style={styles.ingredients}>
        {recipe.ingredients.length === 0 && <ThemedText type="small">{t('no_ingredients')}</ThemedText>}
        {recipe.ingredients.map((ing) => {
          const product = products.find((p) => p.id === ing.productId);
          const swap = swaps.find((w) => w.fromProductId === ing.productId);
          const shown = swap ? { name: products.find((p) => p.id === swap.productId)?.name ?? '?', ...swap } : { name: product?.name ?? '?', ...ing };
          const options = entry && product && !swap ? substituteOptions(product.name, ing.quantity, ing.unit, substitutes) : [];
          return (
            <View key={ing.id} style={styles.ingredientBlock}>
              <View style={styles.ingredient}>
                <View style={styles.ingredientName}>
                  <ThemedText color={swap ? 'tint' : 'text'}>{shown.name}</ThemedText>
                  {swap && <ThemedText type="caption">{t('swap_instead_of', { name: product?.name ?? '?' })}</ThemedText>}
                </View>
                <ThemedText type="small">
                  {formatQuantity(shown.quantity)} {t(`unit_${shown.unit}`)}
                </ThemedText>
                {swap && entry && (
                  <ThemedText color="tint" style={styles.action} accessibilityRole="button" onPress={() => clearSwap(entry.id, ing.productId)}>
                    {t('swap_restore')}
                  </ThemedText>
                )}
                {options.length > 0 && entry && (
                  <ThemedText
                    color="tint"
                    style={styles.action}
                    accessibilityRole="button"
                    onPress={() => setChoosing(choosing === ing.id ? null : ing.id)}>
                    {t('swap')}
                  </ThemedText>
                )}
              </View>
              {choosing === ing.id && entry && (
                <View style={styles.options}>
                  {options.map((o) => (
                    <Chip
                      key={o.product}
                      label={`${o.product} · ${formatQuantity(o.quantity)} ${t(`unit_${o.unit}`)}`}
                      onPress={() => {
                        setSwap(entry.id, ing.productId, o);
                        setChoosing(null);
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </Card>

      <Button
        label={t('add_to_plan')}
        onPress={() => router.push({ pathname: '/plan/add', params: { recipeId: recipe.id } })}
      />
      <Button
        label={t('delete_recipe')}
        variant="destructive"
        onPress={() =>
          confirm(t('delete_recipe'), t('delete_recipe_message', { name: recipe.title }), t('delete'), t('cancel'), () => {
            removeRecipe(recipe.id);
            router.back();
          })
        }
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  edit: { fontWeight: '700', fontSize: 16 },
  titleBlock: { gap: Spacing.one },
  ingredients: { gap: Spacing.two },
  ingredientBlock: { gap: Spacing.two },
  ingredient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  action: { fontWeight: '700', fontSize: 14 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  ingredientName: { flex: 1 },
});
