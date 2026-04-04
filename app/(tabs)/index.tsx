import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRecipes } from '@/hooks/use-recipes';
import { useSelections } from '@/hooks/use-selections';
import { useAppContext } from '@/context/app-context';
import { RecipeListItem } from '@/components/recipes/recipe-list-item';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { GradientHeader } from '@/components/ui/gradient-header';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RecipesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isLoading } = useAppContext();
  const { recipes, deleteRecipe } = useRecipes();
  const { totalSelections, hasSelections, setSelection, getSelectionCount } = useSelections();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipes;
    const query = searchQuery.toLowerCase();
    return recipes.filter((recipe) => recipe.title.toLowerCase().includes(query));
  }, [recipes, searchQuery]);

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  if (isLoading) {
    return (
      <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
        <AmbientBackground variant="recipes" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="recipes" />
      <View style={styles.container}>
        <GradientHeader title="Przepisy" onAdd={() => router.push('/recipe/new')}>
          {recipes.length > 0 && (
            <View style={[styles.searchContainer, { backgroundColor: colors.overlayOnPrimarySubtle }]}>
              <IconSymbol name="magnifyingglass" size={16} color={colors.onPrimaryMuted} />
              <TextInput
                style={[styles.searchInput, { color: colors.onPrimary }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Szukaj przepisu..."
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

        {recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Brak przepisow</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Dodaj pierwszy przepis, aby zaczac planowac zakupy
            </Text>
          </View>
        ) : filteredRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Brak wynikow</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {`Nie znaleziono przepisow dla „${searchQuery}”`}
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
    paddingBottom: 110,
    paddingTop: 10,
  },
});
