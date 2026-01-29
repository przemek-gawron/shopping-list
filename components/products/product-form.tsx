import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Product, Unit } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { UNIT_OPTIONS } from '@/constants/units';
import { generateId } from '@/utils/id-generator';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Product) => void;
  onDelete?: () => void;
}

export function ProductForm({ product, onSave, onDelete }: ProductFormProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [name, setName] = useState(product?.name ?? '');
  const [aliases, setAliases] = useState(product?.aliases?.join(', ') ?? '');
  const [defaultUnit, setDefaultUnit] = useState<Unit>(product?.defaultUnit ?? 'szt');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Blad', 'Nazwa produktu jest wymagana');
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
          style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
          value={name}
          onChangeText={setName}
          placeholder="np. Marchewka"
          placeholderTextColor={colors.icon}
          autoFocus={!product}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Aliasy (oddzielone przecinkami)</Text>
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
          value={aliases}
          onChangeText={setAliases}
          placeholder="np. marchew, karota"
          placeholderTextColor={colors.icon}
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
  unitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '500',
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
});
