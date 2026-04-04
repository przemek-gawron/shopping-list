import React from 'react';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ProductForm } from '@/components/products/product-form';
import { AmbientBackground } from '@/components/ui/ambient-background';
import { useProducts } from '@/hooks/use-products';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function NewProductScreen() {
  const { addProduct } = useProducts();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const screenGradient =
    colorScheme === 'dark'
      ? ([colors.background, colors.background] as const)
      : ([colors.backgroundSecondary, colors.surfacePrimary] as const);

  return (
    <LinearGradient colors={screenGradient} style={{ flex: 1 }}>
      <AmbientBackground variant="products" />
      <Stack.Screen
        options={{
          title: 'Nowy produkt',
          headerStyle: { backgroundColor: colors.headerChrome },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <ProductForm onSave={addProduct} style={{ backgroundColor: 'transparent' }} />
    </LinearGradient>
  );
}
