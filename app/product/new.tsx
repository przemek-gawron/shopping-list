import React from 'react';
import { Stack } from 'expo-router';
import { ProductForm } from '@/components/products/product-form';
import { useProducts } from '@/hooks/use-products';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function NewProductScreen() {
  const { addProduct } = useProducts();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nowy produkt',
          headerStyle: { backgroundColor: colors.headerChrome },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <ProductForm onSave={addProduct} />
    </>
  );
}
