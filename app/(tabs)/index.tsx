import React, { useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCategories } from '@/hooks/use-categories';
import { useRecipes } from '@/hooks/use-recipes';
import { useSelections } from '@/hooks/use-selections';
import { useAppContext } from '@/context/app-context';
import { CategoryCard } from '@/components/categories/category-card';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { GradientHeader } from '@/components/ui/gradient-header';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { t } from '@/i18n';

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isLoading } = useAppContext();
  const { categories } = useCategories();
  const { recipes } = useRecipes();
  const { totalSelections, hasSelections } = useSelections();

  const recipeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const recipe of recipes) {
      counts[recipe.categoryId] = (counts[recipe.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [recipes]);

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  if (isLoading) {
    return (
      <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
        <AmbientBackground variant="categories" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="categories" />
      <View style={styles.container}>
        <GradientHeader
          title={t('categories_header')}
          onAdd={() => router.push('/category/manage')}
          rightElement={
            <Pressable
              style={({ pressed }) => [
                styles.importPdfButton,
                { backgroundColor: colors.overlayOnPrimary, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => router.push('/recipe/import-meal-plan')}
            >
              <IconSymbol name="doc.fill" size={16} color={colors.onPrimary} />
              <Text style={[styles.importPdfLabel, { color: colors.onPrimary }]}>
                {t('meal_plan_import_button_label')}
              </Text>
            </Pressable>
          }
        />

        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📂</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('categories_empty_title')}</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('categories_empty_subtitle')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                recipeCount={recipeCounts[item.id] ?? 0}
                onPress={() => router.push(`/category/${item.id}`)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}

        {hasSelections && (
          <FloatingActionButton
            onPress={() => router.push('/shopping-list')}
            badge={totalSelections}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 170,
    paddingTop: 10,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  importPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 19,
  },
  importPdfLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});
