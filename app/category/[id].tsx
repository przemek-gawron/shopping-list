import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRecipes } from '@/hooks/use-recipes';
import { useCategories } from '@/hooks/use-categories';
import { useSelections } from '@/hooks/use-selections';
import { RecipeListItem } from '@/components/recipes/recipe-list-item';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { GradientHeader } from '@/components/ui/gradient-header';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { t } from '@/i18n';

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getRecipesByCategory, deleteRecipe } = useRecipes();
  const { getCategoryById } = useCategories();
  const { totalSelections, hasSelections, setSelection, getSelectionCount } = useSelections();
  const [searchQuery, setSearchQuery] = useState('');

  const category = getCategoryById(id);
  const categoryRecipes = getRecipesByCategory(id);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return categoryRecipes;
    const query = searchQuery.toLowerCase();
    return categoryRecipes.filter((recipe) => recipe.title.toLowerCase().includes(query));
  }, [categoryRecipes, searchQuery]);

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  if (!category) {
    return (
      <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            {t('category_not_found')}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
        <AmbientBackground variant="recipes" />
        <View style={styles.container}>
          <GradientHeader
            title={category.name}
            onAdd={() => router.push(`/recipe/new?categoryId=${id}`)}
            rightElement={
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  { backgroundColor: colors.overlayOnPrimary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => router.back()}
              >
                <IconSymbol name="chevron.left" size={18} color={colors.onPrimary} />
              </Pressable>
            }
          >
            {categoryRecipes.length > 0 && (
              <View style={[styles.searchContainer, { backgroundColor: colors.overlayOnPrimarySubtle }]}>
                <IconSymbol name="magnifyingglass" size={16} color={colors.onPrimaryMuted} />
                <TextInput
                  style={[styles.searchInput, { color: colors.onPrimary }]}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={t('category_search_placeholder')}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <IconSymbol name="xmark.circle.fill" size={16} color={colors.onPrimaryMuted} />
                  </Pressable>
                )}
              </View>
            )}
          </GradientHeader>

          {categoryRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>{category.emoji}</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('category_recipes_empty_title')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('category_recipes_empty_subtitle')}
              </Text>
            </View>
          ) : filteredRecipes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('category_search_empty_title')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {t('category_search_empty_subtitle', { query: searchQuery })}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredRecipes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RecipeListItem
                  recipe={item}
                  count={getSelectionCount(item.id)}
                  onCountChange={(count) => setSelection(item.id, count)}
                  onDelete={() => deleteRecipe(item.id)}
                />
              )}
              contentContainerStyle={styles.listContent}
            />
          )}

          {hasSelections && (
            <FloatingActionButton
              onPress={() => router.push('/shopping-list')}
              badge={totalSelections}
              hasTabBar={false}
            />
          )}
        </View>
      </LinearGradient>
    </>
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
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
    fontFamily: 'Inter_400Regular',
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
    paddingBottom: 170,
    paddingTop: 10,
  },
});
