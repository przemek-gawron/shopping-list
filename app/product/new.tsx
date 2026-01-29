import React from 'react';
import { Stack } from 'expo-router';
import { ProductForm } from '@/components/products/product-form';
import { useProducts } from '@/hooks/use-products';

export default function NewProductScreen() {
  const { addProduct } = useProducts();

  return (
    <>
      <Stack.Screen options={{ title: 'Nowy produkt' }} />
      <ProductForm onSave={addProduct} />
    </>
  );
}
