import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { useRecipes } from '@/hooks/use-recipes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NewRecipeScreen() {
  const { addRecipe } = useRecipes();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nowy przepis',
          headerStyle: { backgroundColor: colors.tint },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => (
            <Pressable
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push('/recipe/import-photo')}
            >
              <IconSymbol name="sparkles" size={22} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <RecipeForm onSave={addRecipe} />
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
