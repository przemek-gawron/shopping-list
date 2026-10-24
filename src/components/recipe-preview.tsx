import { Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackdropLayer } from '@/components/backdrop';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { RecipePhoto } from '@/components/recipe-photo';
import { Stars } from '@/components/stars';
import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, screenFill, Spacing } from '@/constants/theme';
import { recipeEmoji } from '@/data/labels';
import { useStore } from '@/data/store';
import { useTheme } from '@/hooks/use-theme';
import { useFormatAmount, useT } from '@/i18n';

type Props = {
  /** The recipe shown; null hides the sheet. */
  recipeId: string | null;
  onClose: () => void;
  /** Picks the recipe, e.g. for the meal being added to the plan. */
  onChoose: (recipeId: string) => void;
};

/**
 * A recipe in a sheet over the current screen (photo, description, ingredients), so it can be looked
 * at before it is picked without leaving what is being filled in.
 */
export function RecipePreview({ recipeId, onClose, onChoose }: Props) {
  const t = useT();
  const theme = useTheme();
  const formatAmount = useFormatAmount();
  const insets = useSafeAreaInsets();
  const recipe = useStore((s) => s.recipes.find((r) => r.id === recipeId));
  const group = useStore((s) => s.groups.find((g) => g.id === recipe?.groupId));
  const products = useStore((s) => s.products);

  return (
    <Modal
      visible={!!recipe}
      animationType="slide"
      // iOS: a card sheet that is closed by swiping it down
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      {recipe && (
        <View style={[styles.root, screenFill(theme)]}>
          <BackdropLayer />
          <ScrollView
            contentContainerStyle={[
              styles.content,
              // a page sheet starts below the status bar; full-screen Android modals do not
              { paddingTop: Platform.OS === 'ios' ? Spacing.four : insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.four },
            ]}>
            <View style={styles.header}>
              <ThemedText type="label">{t('preview')}</ThemedText>
              <ThemedText color="tint" accessibilityRole="button" style={styles.close} onPress={onClose}>
                {t('close')}
              </ThemedText>
            </View>
            <RecipePhoto photo={recipe.photo} emoji={recipeEmoji(recipe, group)} height={recipe.photo ? 200 : 110} />
            <View style={styles.titleBlock}>
              <ThemedText type="title">{recipe.title}</ThemedText>
              {recipe.rating ? <Stars value={recipe.rating} size={20} /> : null}
              <ThemedText type="small">{group ? `${group.emoji} ${group.name}` : t('no_group')}</ThemedText>
            </View>
            {recipe.description ? <ThemedText>{recipe.description}</ThemedText> : null}
            <ThemedText type="label">{t('ingredients')}</ThemedText>
            <Card style={styles.ingredients}>
              {recipe.ingredients.length === 0 && <ThemedText type="small">{t('no_ingredients')}</ThemedText>}
              {recipe.ingredients.map((ing) => (
                <View key={ing.id} style={styles.ingredient}>
                  <ThemedText style={styles.ingredientName}>{products.find((p) => p.id === ing.productId)?.name ?? '?'}</ThemedText>
                  <ThemedText type="small">{formatAmount(ing.quantity, ing.unit)}</ThemedText>
                </View>
              ))}
            </Card>
            <Button label={t('preview_choose')} onPress={() => onChoose(recipe.id)} />
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three, gap: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { fontWeight: '700', fontSize: 16 },
  titleBlock: { gap: Spacing.one },
  ingredients: { gap: Spacing.two },
  ingredient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.three },
  ingredientName: { flex: 1 },
});
