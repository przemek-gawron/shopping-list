import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  importMealPlanFromPdf,
  getCategoryIdForMealType,
  ParsedMealPlanRecipe,
  ApiKeyError,
  ParseError,
} from '@/services/claude-meal-plan-importer';
import { useProducts } from '@/hooks/use-products';
import { useRecipes } from '@/hooks/use-recipes';
import { useCategories } from '@/hooks/use-categories';
import { generateId } from '@/utils/id-generator';
import { Recipe, Ingredient, Product } from '@/types';
import { t } from '@/i18n';

type Step = 'pick' | 'processing' | 'review';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export default function ImportMealPlanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { findProductByName, addProduct } = useProducts();
  const { addRecipe } = useRecipes();
  const { getCategoryById } = useCategories();

  const [step, setStep] = useState<Step>('pick');
  const [pdfName, setPdfName] = useState<string>('');
  const [parsedRecipes, setParsedRecipes] = useState<ParsedMealPlanRecipe[]>([]);

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  const handlePickPdf = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setPdfName(asset.name ?? 'plan.pdf');

    if (!API_KEY) {
      Alert.alert(t('recipe_import_api_key_title'), t('recipe_import_api_key_message'));
      return;
    }

    setStep('processing');

    try {
      const recipes = await importMealPlanFromPdf(asset.uri, API_KEY);
      setParsedRecipes(recipes);
      setStep('review');
    } catch (error) {
      console.error('[ImportMealPlan] error:', error);
      if (error instanceof ApiKeyError) {
        Alert.alert(t('recipe_import_invalid_key_title'), t('recipe_import_invalid_key_message'));
      } else if (error instanceof ParseError) {
        Alert.alert(t('meal_plan_import_not_recognized_title'), t('meal_plan_import_not_recognized_message'));
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        Alert.alert(t('recipe_import_error_title'), msg);
      }
      setStep('pick');
    }
  }, []);

  const handleSaveAll = useCallback(() => {
    for (const parsed of parsedRecipes) {
      const resolvedIngredients: Ingredient[] = [];
      const newProducts: Product[] = [];

      for (const ing of parsed.ingredients) {
        let product = findProductByName(ing.name);
        if (!product) {
          product = { id: generateId(), name: ing.name, defaultUnit: ing.unit };
          newProducts.push(product);
        }
        resolvedIngredients.push({
          id: generateId(),
          productId: product.id,
          quantity: ing.quantity,
          unit: ing.unit,
        });
      }

      for (const p of newProducts) {
        addProduct(p);
      }

      const recipe: Recipe = {
        id: generateId(),
        title: parsed.title,
        description: parsed.description,
        ingredients: resolvedIngredients,
        categoryId: getCategoryIdForMealType(parsed.mealType),
      };

      addRecipe(recipe);
    }

    router.replace('/');
  }, [parsedRecipes, findProductByName, addProduct, addRecipe, router]);

  const categoryLabel = (mealType: string): string => {
    const catId = getCategoryIdForMealType(mealType);
    const cat = getCategoryById(catId);
    return cat ? `${cat.emoji} ${cat.name}` : mealType;
  };

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="recipes" />
      <Stack.Screen
        options={{
          title: step === 'review' ? t('meal_plan_import_review_title') : t('meal_plan_import_pick_title'),
          headerStyle: { backgroundColor: colors.headerChrome },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
          headerShadowVisible: false,
          headerRight:
            step === 'review'
              ? () => (
                  <Pressable
                    style={({ pressed }) => [
                      styles.headerSaveButton,
                      { backgroundColor: colors.tintSecondary, opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={handleSaveAll}
                  >
                    <Text style={[styles.headerSaveText, { color: colors.onPrimary }]}>
                      {t('meal_plan_import_save_all', { count: parsedRecipes.length })}
                    </Text>
                  </Pressable>
                )
              : undefined,
        }}
      />

      {step === 'pick' && (
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
            <View style={styles.iconContainer}>
              <IconSymbol name="doc.fill" size={40} color={colors.tint} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t('meal_plan_import_pick_hint')}
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {t('meal_plan_import_pick_subtitle')}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.pickButton,
                { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handlePickPdf}
            >
              <IconSymbol name="doc.badge.plus" size={18} color="#fff" />
              <Text style={styles.pickButtonText}>{t('meal_plan_import_pick_button')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 'processing' && (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.processingText, { color: colors.text }]}>
            {t('meal_plan_import_processing')}
          </Text>
          <Text style={[styles.processingSubtext, { color: colors.textSecondary }]}>
            {pdfName ? `„${pdfName}"` : ''}
          </Text>
          <Text style={[styles.processingSubtext, { color: colors.textSecondary }]}>
            {t('meal_plan_import_processing_sub')}
          </Text>
        </View>
      )}

      {step === 'review' && (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.reviewList}>
            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
              {t('meal_plan_import_found', { count: parsedRecipes.length })}
            </Text>
            {parsedRecipes.map((recipe, index) => (
              <View
                key={index}
                style={[styles.recipeRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}
              >
                <View style={styles.recipeInfo}>
                  <Text style={[styles.recipeTitle, { color: colors.text }]} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                  <Text style={[styles.recipeIngredientCount, { color: colors.textSecondary }]}>
                    {recipe.ingredients.length} {t('recipe_ingredients_abbr')}
                  </Text>
                </View>
                <View style={[styles.categoryPill, { backgroundColor: colors.border }]}>
                  <Text style={[styles.categoryPillText, { color: colors.tint }]}>
                    {categoryLabel(recipe.mealType)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={[styles.saveBar, { backgroundColor: colors.surfaceElevated, borderTopColor: colors.borderSubtle }]}>
            <Pressable
              style={({ pressed }) => [
                styles.saveAllButton,
                { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleSaveAll}
            >
              <Text style={styles.saveAllButtonText}>
                {t('meal_plan_import_save_all', { count: parsedRecipes.length })}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  pickButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  processingText: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  processingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  reviewList: {
    padding: 16,
    gap: 10,
    paddingBottom: 16,
  },
  reviewCount: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  recipeInfo: {
    flex: 1,
    gap: 2,
  },
  recipeTitle: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  recipeIngredientCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  saveBar: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  saveAllButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveAllButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
  headerSaveButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSaveText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
