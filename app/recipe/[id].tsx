import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { useRecipes } from '@/hooks/use-recipes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { t } from '@/i18n';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipeById, updateRecipe, deleteRecipe } = useRecipes();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const recipe = getRecipeById(id);

  if (!recipe) {
    return (
      <>
        <Stack.Screen options={{ title: t('recipe_screen_title') }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            {t('recipe_not_found')}
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: t('recipe_edit_title'),
          headerStyle: { backgroundColor: colors.headerChrome },
          headerTintColor: colors.onPrimary,
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
