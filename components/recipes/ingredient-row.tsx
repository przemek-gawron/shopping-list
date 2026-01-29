import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Ingredient, Unit } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { UNIT_OPTIONS } from '@/constants/units';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { useProducts } from '@/hooks/use-products';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface IngredientRowProps {
  ingredient: Ingredient & { productName: string };
  onChange: (ingredient: Ingredient & { productName: string }) => void;
  onRemove: () => void;
}

export function IngredientRow({ ingredient, onChange, onRemove }: IngredientRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { products } = useProducts();

  const productItems = products.map((p) => ({ id: p.id, label: p.name }));

  const handleProductSelect = (item: { id: string; label: string }) => {
    const product = products.find((p) => p.id === item.id);
    onChange({
      ...ingredient,
      productId: item.id,
      productName: item.label,
      unit: product?.defaultUnit ?? ingredient.unit,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={[styles.quantityInput, { color: colors.text, borderColor: colors.icon }]}
          value={ingredient.quantity ? ingredient.quantity.toString() : ''}
          onChangeText={(text) => {
            const qty = parseFloat(text) || 0;
            onChange({ ...ingredient, quantity: qty });
          }}
          keyboardType="decimal-pad"
          placeholder="Ilosc"
          placeholderTextColor={colors.icon}
        />

        <View style={styles.unitSelector}>
          <Pressable
            style={[styles.unitButton, { borderColor: colors.icon }]}
            onPress={() => {
              const currentIndex = UNIT_OPTIONS.findIndex((u) => u.value === ingredient.unit);
              const nextIndex = (currentIndex + 1) % UNIT_OPTIONS.length;
              onChange({ ...ingredient, unit: UNIT_OPTIONS[nextIndex].value });
            }}
          >
            <Text style={[styles.unitText, { color: colors.text }]}>{ingredient.unit}</Text>
          </Pressable>
        </View>

        <Pressable style={styles.removeButton} onPress={onRemove}>
          <IconSymbol name="xmark.circle.fill" size={24} color="#e53935" />
        </Pressable>
      </View>

      <View style={styles.productRow}>
        <AutocompleteInput
          value={ingredient.productName}
          onChangeText={(text) => onChange({ ...ingredient, productName: text, productId: '' })}
          onSelect={handleProductSelect}
          items={productItems}
          placeholder="Wybierz produkt"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  quantityInput: {
    width: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
  },
  unitSelector: {
    flex: 1,
  },
  unitButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 16,
  },
  removeButton: {
    padding: 4,
  },
  productRow: {
    zIndex: 1,
  },
});
