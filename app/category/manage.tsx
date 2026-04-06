import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { useCategories } from '@/hooks/use-categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { generateId } from '@/utils/id-generator';

const EMOJI_OPTIONS = ['🍳', '🥪', '🍲', '🍰', '🥗', '🍝', '🥘', '🍜', '🥞', '🍕', '🥙', '🍱', '🫕', '🥣', '🍛', '📋'];

export default function ManageCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  const existingCategory = categoryId ? categories.find((c) => c.id === categoryId) : undefined;
  const isEditing = !!existingCategory;

  const [name, setName] = useState(existingCategory?.name ?? '');
  const [emoji, setEmoji] = useState(existingCategory?.emoji ?? '🍽️');

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Blad', 'Nazwa kategorii jest wymagana');
      return;
    }

    if (isEditing && existingCategory) {
      updateCategory({
        ...existingCategory,
        name: trimmedName,
        emoji,
      });
    } else {
      const maxSortOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), -1);
      addCategory({
        id: generateId(),
        name: trimmedName,
        emoji,
        sortOrder: maxSortOrder + 1,
      });
    }

    router.back();
  };

  const handleDelete = () => {
    if (!existingCategory) return;
    Alert.alert(
      'Usun kategorie',
      `Czy na pewno chcesz usunac "${existingCategory.name}"? Przepisy z tej kategorii zostana przeniesione do "Inne".`,
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usun',
          style: 'destructive',
          onPress: () => {
            deleteCategory(existingCategory.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="categories" />
      <Stack.Screen
        options={{
          title: isEditing ? 'Edytuj kategorie' : 'Nowa kategoria',
          headerStyle: { backgroundColor: colors.headerChrome },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => (
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                { backgroundColor: colors.tintSecondary, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleSave}
            >
              <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>Zapisz</Text>
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Nazwa</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.surfaceElevated }]}
              value={name}
              onChangeText={setName}
              placeholder="np. Śniadania"
              placeholderTextColor={colors.textSecondary}
              autoFocus={!isEditing}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Ikona</Text>
            <View style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((e) => (
                <Pressable
                  key={e}
                  style={[
                    styles.emojiButton,
                    {
                      backgroundColor: emoji === e ? colors.tint : colors.surfaceElevated,
                      borderColor: emoji === e ? colors.tint : colors.borderSubtle,
                    },
                  ]}
                  onPress={() => setEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {isEditing && (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={[styles.deleteButtonText, { color: colors.destructive }]}>Usun kategorie</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiText: {
    fontSize: 24,
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
  deleteButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
