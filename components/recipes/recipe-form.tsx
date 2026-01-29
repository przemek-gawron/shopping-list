import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Recipe, Ingredient } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { generateId } from '@/utils/id-generator';
import { IngredientRow } from './ingredient-row';
import { useProducts } from '@/hooks/use-products';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface RecipeFormProps {
  recipe?: Recipe;
  onSave: (recipe: Recipe) => void;
  onDelete?: () => void;
}

type IngredientWithName = Ingredient & { productName: string };

export function RecipeForm({ recipe, onSave, onDelete }: RecipeFormProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getProductById, findProductByName } = useProducts();

  const [title, setTitle] = useState(recipe?.title ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [ingredients, setIngredients] = useState<IngredientWithName[]>(() => {
    if (recipe?.ingredients) {
      return recipe.ingredients.map((ing) => ({
        ...ing,
        productName: getProductById(ing.productId)?.name ?? '',
      }));
    }
    return [];
  });

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: generateId(),
        productId: '',
        productName: '',
        quantity: 0,
        unit: 'szt',
      },
    ]);
  };

  const updateIngredient = (index: number, updated: IngredientWithName) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = updated;
    setIngredients(newIngredients);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Blad', 'Tytul przepisu jest wymagany');
      return;
    }

    const resolvedIngredients = ingredients.map((ing) => {
      if (ing.productId) return ing;
      const product = findProductByName(ing.productName);
      if (product) {
        return { ...ing, productId: product.id };
      }
      return ing;
    });

    const validIngredients = resolvedIngredients.filter(
      (ing) => ing.productId && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      Alert.alert('Blad', 'Dodaj co najmniej jeden skladnik z listy produktow');
      return;
    }

    const recipeIngredients: Ingredient[] = validIngredients.map((ing) => ({
      id: ing.id,
      productId: ing.productId,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    onSave({
      id: recipe?.id ?? generateId(),
      title: trimmedTitle,
      description: description.trim() || undefined,
      ingredients: recipeIngredients,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Usun przepis', `Czy na pewno chcesz usunac "${title}"?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usun',
        style: 'destructive',
        onPress: () => {
          onDelete?.();
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Tytul</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
          value={title}
          onChangeText={setTitle}
          placeholder="np. Kurczak curry"
          placeholderTextColor={colors.icon}
          autoFocus={!recipe}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Opis (opcjonalny)</Text>
        <TextInput
          style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.icon }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Krotki opis przepisu..."
          placeholderTextColor={colors.icon}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.field}>
        <View style={styles.ingredientsHeader}>
          <Text style={[styles.label, { color: colors.text }]}>Skladniki</Text>
          <Pressable
            style={[styles.addIngredientButton, { backgroundColor: colors.tint }]}
            onPress={addIngredient}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <Text style={styles.addIngredientText}>Dodaj</Text>
          </Pressable>
        </View>

        {ingredients.length === 0 ? (
          <Text style={[styles.noIngredients, { color: colors.icon }]}>
            Brak skladnikow. Kliknij "Dodaj" aby dodac skladnik.
          </Text>
        ) : (
          ingredients.map((ing, index) => (
            <IngredientRow
              key={ing.id}
              ingredient={ing}
              onChange={(updated) => updateIngredient(index, updated)}
              onRemove={() => removeIngredient(index)}
            />
          ))
        )}
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: colors.tint }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Zapisz</Text>
      </Pressable>

      {onDelete && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Usun przepis</Text>
        </Pressable>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addIngredientText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  noIngredients: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  deleteButtonText: {
    color: '#e53935',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
