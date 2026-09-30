import { Stack, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { RecipePhoto } from '@/components/recipe-photo';
import { Page } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatQuantity } from '@/constants/units';
import { useStore } from '@/data/store';
import { useT } from '@/i18n';
import { confirm } from '@/utils/confirm';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();
  const recipe = useStore((s) => s.recipes.find((r) => r.id === id));
  const group = useStore((s) => s.groups.find((g) => g.id === recipe?.groupId));
  const products = useStore((s) => s.products);
  const removeRecipe = useStore((s) => s.removeRecipe);

  if (!recipe) return <Stack.Screen options={{ title: '' }} />;

  return (
    <Page>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <ThemedText
              color="tint"
              style={styles.edit}
              onPress={() => router.push({ pathname: '/recipe/form', params: { id: recipe.id } })}>
              {t('edit')}
            </ThemedText>
          ),
        }}
      />
      <RecipePhoto photo={recipe.photo} emoji={group?.emoji ?? '🍽️'} height={recipe.photo ? 220 : 120} />
      <View style={styles.titleBlock}>
        <ThemedText type="title">{recipe.title}</ThemedText>
        <ThemedText type="small">{group ? `${group.emoji} ${group.name}` : t('no_group')}</ThemedText>
      </View>
      {recipe.description ? <ThemedText>{recipe.description}</ThemedText> : null}

      <ThemedText type="label">{t('ingredients')}</ThemedText>
      <Card style={styles.ingredients}>
        {recipe.ingredients.length === 0 && <ThemedText type="small">{t('no_ingredients')}</ThemedText>}
        {recipe.ingredients.map((ing) => {
          const product = products.find((p) => p.id === ing.productId);
          return (
            <View key={ing.id} style={styles.ingredient}>
              <ThemedText style={styles.ingredientName}>{product?.name ?? '?'}</ThemedText>
              <ThemedText type="small">
                {formatQuantity(ing.quantity)} {t(`unit_${ing.unit}`)}
              </ThemedText>
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
  ingredient: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
  ingredientName: { flex: 1 },
});
