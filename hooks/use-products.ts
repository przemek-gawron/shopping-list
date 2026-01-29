import { useCallback, useMemo } from 'react';
import { useAppContext } from '@/context/app-context';
import { Product } from '@/types';

export function useProducts() {
  const { products, addProduct, updateProduct, deleteProduct } = useAppContext();

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const findProductByName = useCallback(
    (name: string) => {
      const lower = name.toLowerCase();
      return products.find(
        (p) =>
          p.name.toLowerCase() === lower ||
          p.aliases?.some((a) => a.toLowerCase() === lower)
      );
    },
    [products]
  );

  const searchProducts = useCallback(
    (query: string) => {
      if (!query.trim()) return products;
      const lower = query.toLowerCase();
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.aliases?.some((a) => a.toLowerCase().includes(lower))
      );
    },
    [products]
  );

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name, 'pl')),
    [products]
  );

  return {
    products: sortedProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    findProductByName,
    searchProducts,
  };
}
