import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Product, Unit } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { UNIT_OPTIONS } from '@/constants/units';
import { generateId } from '@/utils/id-generator';
import { useProducts } from '@/hooks/use-products';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onDelete?: () => void;
}

export function ProductForm({ product, onSave, onDelete }: ProductFormProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { findProductByName } = useProducts();

  const [name, setName] = useState(product?.name ?? '');
  const [aliases, setAliases] = useState(product?.aliases?.join(', ') ?? '');
  const [defaultUnit, setDefaultUnit] = useState<Unit>(product?.defaultUnit ?? 'szt');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Blad', 'Nazwa produktu jest wymagana');
      return;
    }

    const existing = findProductByName(trimmedName);
    if (existing && existing.id !== product?.id) {
      Alert.alert('Produkt juz istnieje', `Produkt o nazwie "${existing.name}" juz istnieje.`);
      return;
    }

    const aliasArray = aliases
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    onSave({
      id: product?.id ?? generateId(),
      name: trimmedName,
      aliases: aliasArray.length > 0 ? aliasArray : undefined,
      defaultUnit,
    });

    router.back();
  };

  const handleDelete = () => {
    Alert.alert('Usun produkt', `Czy na pewno chcesz usunac "${name}"?`, [
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Nazwa</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.cardBackground }]}
          value={name}
          onChangeText={setName}
          placeholder="np. Marchewka"
          placeholderTextColor={colors.textSecondary}
          autoFocus={!product}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Aliasy (oddzielone przecinkami)</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.cardBackground }]}
          value={aliases}
          onChangeText={setAliases}
          placeholder="np. marchew, karota"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Domyslna jednostka</Text>
        <View style={styles.unitContainer}>
          {UNIT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.unitButton,
                {
                  backgroundColor:
                    defaultUnit === option.value ? colors.tint : colors.background,
                  borderColor: colors.tint,
                },
              ]}
              onPress={() => setDefaultUnit(option.value)}
            >
              <Text
                style={[
                  styles.unitText,
                  { color: defaultUnit === option.value ? '#fff' : colors.tint },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: colors.tint }]}
        onPress={handleSave}
      >
        <Text style={styles.saveButtonText}>Zapisz</Text>
      </Pressable>

      {onDelete && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Usun produkt</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  unitText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  deleteButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
});
