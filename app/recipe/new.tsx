import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { RecipeForm, RecipeFormHandle } from '@/components/recipes/recipe-form';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { useRecipes } from '@/hooks/use-recipes';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NewRecipeScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const { addRecipe } = useRecipes();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const formRef = useRef<RecipeFormHandle>(null);

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="recipes" />
      <Stack.Screen
        options={{
          title: 'Nowy przepis',
          headerStyle: { backgroundColor: colors.headerChrome },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  { backgroundColor: colors.tintSecondary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => formRef.current?.submit()}
              >
                <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>Zapisz</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.headerButton,
                  { backgroundColor: colors.tintSecondary, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => router.push(categoryId ? `/recipe/import-photo?categoryId=${categoryId}` : '/recipe/import-photo')}
              >
                <IconSymbol name="sparkles" size={22} color={colors.onPrimary} />
              </Pressable>
            </View>
          ),
        }}
      />
      <RecipeForm ref={formRef} onSave={addRecipe} defaultCategoryId={categoryId} style={{ backgroundColor: 'transparent' }} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
});
