import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { useRecipes } from '@/hooks/use-recipes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipeById, updateRecipe, deleteRecipe } = useRecipes();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const recipe = getRecipeById(id);

  if (!recipe) {
    return (
      <>
        <Stack.Screen options={{ title: 'Przepis' }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Nie znaleziono przepisu
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edytuj przepis',
          headerStyle: { backgroundColor: colors.tint },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <RecipeForm
        recipe={recipe}
        onSave={updateRecipe}
        onDelete={() => deleteRecipe(id)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
});
