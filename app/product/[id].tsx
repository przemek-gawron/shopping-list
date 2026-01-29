import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ProductForm } from '@/components/products/product-form';
import { useProducts } from '@/hooks/use-products';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById, updateProduct, deleteProduct } = useProducts();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const product = getProductById(id);

  if (!product) {
    return (
      <>
        <Stack.Screen options={{ title: 'Produkt' }} />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Nie znaleziono produktu
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edytuj produkt' }} />
      <ProductForm
        product={product}
        onSave={updateProduct}
        onDelete={() => deleteProduct(id)}
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
