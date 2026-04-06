import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { RecipeForm, RecipeFormHandle } from '@/components/recipes/recipe-form';
import { ImportPhotoPicker } from '@/components/recipes/import-photo-picker';
import {
  importRecipeFromPhotos,
  ApiKeyError,
  ParseError,
} from '@/services/claude-recipe-importer';
import { useProducts } from '@/hooks/use-products';
import { useRecipes } from '@/hooks/use-recipes';
import { generateId } from '@/utils/id-generator';
import { Recipe, Ingredient, Product } from '@/types';
import { UNCATEGORIZED_CATEGORY_ID } from '@/constants/categories';
import { t } from '@/i18n';

type Step = 'pick' | 'processing' | 'review';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export default function ImportPhotoScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const formRef = useRef<RecipeFormHandle>(null);

  const { findProductByName, addProduct } = useProducts();
  const { addRecipe } = useRecipes();

  const [step, setStep] = useState<Step>('pick');
  const [photos, setPhotos] = useState<string[]>([]);
  const [prefilledRecipe, setPrefilledRecipe] = useState<Recipe | null>(null);

  const handleAddFromCamera = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  }, []);

  const handleAddFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.9,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  }, []);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleAnalyze = async () => {
    if (photos.length === 0) return;

    console.log('[ImportPhoto] API_KEY present:', !!API_KEY, 'length:', API_KEY.length);

    if (!API_KEY) {
      Alert.alert(t('recipe_import_api_key_title'), t('recipe_import_api_key_message'));
      return;
    }

    setStep('processing');

    try {
      const parsed = await importRecipeFromPhotos(photos, API_KEY);

      const resolvedIngredients: Ingredient[] = [];
      const newProducts: Product[] = [];

      for (const ing of parsed.ingredients) {
        let product = findProductByName(ing.name);
        if (!product) {
          product = {
            id: generateId(),
            name: ing.name,
            defaultUnit: ing.unit,
          };
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

      setPrefilledRecipe({
        id: generateId(),
        title: parsed.title,
        description: parsed.description,
        ingredients: resolvedIngredients,
        categoryId: categoryId ?? UNCATEGORIZED_CATEGORY_ID,
      });

      setStep('review');
    } catch (error) {
      console.error('[ImportPhoto] error:', error);
      if (error instanceof ApiKeyError) {
        Alert.alert(t('recipe_import_invalid_key_title'), t('recipe_import_invalid_key_message'));
      } else if (error instanceof ParseError) {
        Alert.alert(t('recipe_import_not_recognized_title'), t('recipe_import_not_recognized_message'));
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        Alert.alert(t('recipe_import_error_title'), msg);
      }
      setStep('pick');
    }
  };

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="recipes" />
      <Stack.Screen
        options={{
          title: step === 'review' ? t('recipe_import_review_title') : t('recipe_import_pick_title'),
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
                    onPress={() => formRef.current?.submit()}
                  >
                    <Text style={[styles.headerSaveText, { color: colors.onPrimary }]}>{t('recipe_save')}</Text>
                  </Pressable>
                )
              : undefined,
        }}
      />

      {step === 'pick' && (
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
            <ImportPhotoPicker
              photos={photos}
              onAddFromCamera={handleAddFromCamera}
              onAddFromLibrary={handleAddFromLibrary}
              onRemove={handleRemovePhoto}
            />
            <Pressable
              style={({ pressed }) => [
                styles.analyzeButton,
                {
                  backgroundColor: photos.length > 0 ? colors.tint : colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              onPress={handleAnalyze}
              disabled={photos.length === 0}
            >
              <Text style={[styles.analyzeButtonText, { color: photos.length > 0 ? '#fff' : colors.textSecondary }]}>
                {t('recipe_import_analyze')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 'processing' && (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.processingText, { color: colors.text }]}>{t('recipe_import_processing')}</Text>
          <Text style={[styles.processingSubtext, { color: colors.textSecondary }]}>
            {t('recipe_import_processing_sub')}
          </Text>
        </View>
      )}

      {step === 'review' && prefilledRecipe && (
        <RecipeForm
          ref={formRef}
          recipe={prefilledRecipe}
          onSave={addRecipe}
          onSaved={() => router.replace('/')}
          defaultCategoryId={categoryId}
          style={{ backgroundColor: 'transparent' }}
        />
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
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  analyzeButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
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
});
