import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { RecipeForm } from '@/components/recipes/recipe-form';
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

type Step = 'pick' | 'processing' | 'review';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export default function ImportPhotoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      Alert.alert('Brak klucza API', 'Skonfiguruj klucz EXPO_PUBLIC_ANTHROPIC_API_KEY.');
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
      });

      setStep('review');
    } catch (error) {
      console.error('[ImportPhoto] error:', error);
      if (error instanceof ApiKeyError) {
        Alert.alert('Nieprawidłowy klucz API', 'Sprawdź wartość EXPO_PUBLIC_ANTHROPIC_API_KEY.');
      } else if (error instanceof ParseError) {
        Alert.alert('Nie rozpoznano przepisu', 'Nie udało się rozpoznać przepisu na zdjęciu. Spróbuj z innym zdjęciem.');
      } else {
        const msg = error instanceof Error ? error.message : String(error);
        Alert.alert('Błąd importu', msg);
      }
      setStep('pick');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: step === 'review' ? 'Sprawdź przepis' : 'Importuj ze zdjęcia',
          headerStyle: { backgroundColor: colors.headerChrome },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
          headerShadowVisible: false,
        }}
      />

      {step === 'pick' && (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                Analizuj zdjęcia
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 'processing' && (
        <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.processingText, { color: colors.text }]}>Analizuję zdjęcia...</Text>
          <Text style={[styles.processingSubtext, { color: colors.textSecondary }]}>
            To może potrwać kilka sekund
          </Text>
        </View>
      )}

      {step === 'review' && prefilledRecipe && (
        <RecipeForm recipe={prefilledRecipe} onSave={addRecipe} />
      )}
    </>
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
