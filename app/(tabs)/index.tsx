import React, { useMemo, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
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
import { Category } from '@/types';
import { t } from '@/i18n';

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isLoading } = useAppContext();
  const { categories, updateCategory, deleteCategory } = useCategories();
  const { recipes } = useRecipes();
  const { totalSelections, hasSelections } = useSelections();
  const [editMode, setEditMode] = useState(false);

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

  const handleDragEnd = useCallback(
    ({ data }: { data: Category[] }) => {
      data.forEach((cat, index) => {
        if (cat.sortOrder !== index) {
          updateCategory({ ...cat, sortOrder: index });
        }
      });
    },
    [updateCategory]
  );

  const handleDelete = useCallback(
    (category: Category) => {
      Alert.alert(
        t('categories_delete_title'),
        t('categories_delete_message', { name: category.name }),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete'),
            style: 'destructive',
            onPress: () => deleteCategory(category.id),
          },
        ]
      );
    },
    [deleteCategory]
  );

  const renderDraggableItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Category>) => (
      <ScaleDecorator activeScale={1.03}>
        <Pressable
          onLongPress={drag}
          style={[
            styles.editRow,
            {
              backgroundColor: isActive ? colors.surfaceCard : colors.surfaceElevated,
              borderColor: isActive ? colors.tint : colors.borderSubtle,
            },
          ]}
        >
          <IconSymbol name="line.3.horizontal" size={20} color={colors.textSecondary} />
          <Text style={styles.editRowEmoji}>{item.emoji}</Text>
          <Text style={[styles.editRowName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {recipeCounts[item.id] !== undefined && (
            <View style={[styles.editRowChip, { backgroundColor: colors.border }]}>
              <Text style={[styles.editRowChipText, { color: colors.tint }]}>
                {t('category_recipe_count', { count: recipeCounts[item.id] ?? 0 })}
              </Text>
            </View>
          )}
          <Pressable
            hitSlop={8}
            onPress={() => handleDelete(item)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <IconSymbol name="trash" size={18} color={colors.destructive} />
          </Pressable>
        </Pressable>
      </ScaleDecorator>
    ),
    [colors, recipeCounts, handleDelete]
  );

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
          onAdd={editMode ? undefined : () => router.push('/category/manage')}
          rightElement={
            editMode ? (
              <Pressable
                style={({ pressed }) => [
                  styles.editDoneButton,
                  { backgroundColor: colors.overlayOnPrimary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => setEditMode(false)}
              >
                <Text style={[styles.editDoneText, { color: colors.onPrimary }]}>
                  {t('categories_edit_done')}
                </Text>
              </Pressable>
            ) : (
              <View style={styles.headerButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    { backgroundColor: colors.overlayOnPrimary, opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() => setEditMode(true)}
                >
                  <IconSymbol name="pencil" size={17} color={colors.onPrimary} />
                </Pressable>
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
              </View>
            )
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
        ) : editMode ? (
          <DraggableFlatList
            data={categories}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            renderItem={renderDraggableItem}
            contentContainerStyle={styles.editListContent}
            activationDistance={5}
          />
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

        {hasSelections && !editMode && (
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
  // Edit mode
  editListContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 8,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  editRowEmoji: {
    fontSize: 24,
  },
  editRowName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  editRowChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editRowChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  // Header buttons
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
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
  editDoneButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 19,
  },
  editDoneText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
