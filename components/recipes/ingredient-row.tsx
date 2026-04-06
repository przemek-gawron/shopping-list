import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ingredient } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { UNIT_OPTIONS, getUnitLabel } from '@/constants/units';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { useProducts } from '@/hooks/use-products';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { generateId } from '@/utils/id-generator';
import { t } from '@/i18n';

interface IngredientRowProps {
  ingredient: Ingredient & { productName: string };
  onChange: (ingredient: Ingredient & { productName: string }) => void;
  onRemove: () => void;
}

export function IngredientRow({ ingredient, onChange, onRemove }: IngredientRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { products, addProduct } = useProducts();

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

  const handleCreateNewProduct = (name: string) => {
    const newProduct = {
      id: generateId(),
      name: name,
      defaultUnit: ingredient.unit,
    };
    addProduct(newProduct);
    onChange({
      ...ingredient,
      productId: newProduct.id,
      productName: name,
    });
  };

  const renderRightActions = () => (
    <View style={[styles.deleteAction, { backgroundColor: colors.destructive }]}>
      <IconSymbol name="trash.fill" size={20} color={colors.onPrimary} />
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={onRemove}
        rightThreshold={60}
        friction={2}
        overshootRight={false}
        containerStyle={styles.swipeableContainer}
      >
        <View style={[styles.container, { backgroundColor: colors.surfaceElevated, borderColor: colors.borderSubtle }]}>
          <View style={styles.row}>
            <View style={styles.productSection}>
              <AutocompleteInput
                value={ingredient.productName}
                onChangeText={(text) => onChange({ ...ingredient, productName: text, productId: '' })}
                onSelect={handleProductSelect}
                items={productItems}
                placeholder={t('ingredient_product_placeholder')}
                onCreateNew={handleCreateNewProduct}
                createNewLabel={t('ingredient_add_new')}
              />
            </View>

            <TextInput
              style={[styles.quantityInput, { color: colors.text, borderColor: colors.borderSubtle, backgroundColor: colors.background }]}
              value={ingredient.quantity ? ingredient.quantity.toString() : ''}
              onChangeText={(text) => {
                const qty = parseFloat(text) || 0;
                onChange({ ...ingredient, quantity: qty });
              }}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
            />

            <Pressable
              style={[styles.unitButton, { backgroundColor: colors.tint + '15' }]}
              onPress={() => {
                const currentIndex = UNIT_OPTIONS.findIndex((u) => u.value === ingredient.unit);
                const nextIndex = (currentIndex + 1) % UNIT_OPTIONS.length;
                onChange({ ...ingredient, unit: UNIT_OPTIONS[nextIndex].value });
              }}
            >
              <Text style={[styles.unitText, { color: colors.tint }]}>{getUnitLabel(ingredient.unit)}</Text>
            </Pressable>
          </View>
        </View>
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 1,
    marginBottom: 8,
  },
  swipeableContainer: {
    overflow: 'visible',
  },
  container: {
    marginHorizontal: 2,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    overflow: 'visible',
  },
  productSection: {
    flex: 1,
    zIndex: 10,
    overflow: 'visible',
  },
  quantityInput: {
    width: 55,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  unitButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginRight: 2,
    borderRadius: 10,
  },
});
