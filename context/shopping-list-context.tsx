import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ShoppingListItem, Unit } from '@/types';

interface ShoppingListOverrides {
  manualItems: ShoppingListItem[];
  deletedIds: string[];
  quantityOverrides: Record<string, { quantity: number; unit: Unit }>;
  checkedIds: string[];
}

interface ShoppingListContextValue extends ShoppingListOverrides {
  addManualItem: (item: ShoppingListItem) => void;
  deleteItem: (productId: string) => void;
  updateItem: (productId: string, quantity: number, unit: Unit) => void;
  toggleItem: (productId: string) => void;
  resetAll: () => void;
}

const ShoppingListContext = createContext<ShoppingListContextValue | null>(null);

const emptyState: ShoppingListOverrides = {
  manualItems: [],
  deletedIds: [],
  quantityOverrides: {},
  checkedIds: [],
};

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [manualItems, setManualItems] = useState<ShoppingListItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, { quantity: number; unit: Unit }>>({});
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const addManualItem = useCallback((item: ShoppingListItem) => {
    setManualItems((prev) => [...prev, item]);
  }, []);

  const deleteItem = useCallback((productId: string) => {
    setDeletedIds((prev) => [...prev, productId]);
  }, []);

  const updateItem = useCallback((productId: string, quantity: number, unit: Unit) => {
    setQuantityOverrides((prev) => ({ ...prev, [productId]: { quantity, unit } }));
  }, []);

  const toggleItem = useCallback((productId: string) => {
    setCheckedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const resetAll = useCallback(() => {
    setManualItems(emptyState.manualItems);
    setDeletedIds(emptyState.deletedIds);
    setQuantityOverrides(emptyState.quantityOverrides);
    setCheckedIds(emptyState.checkedIds);
  }, []);

  return (
    <ShoppingListContext.Provider
      value={{ manualItems, deletedIds, quantityOverrides, checkedIds, addManualItem, deleteItem, updateItem, toggleItem, resetAll }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingListContext() {
  const context = useContext(ShoppingListContext);
  if (!context) throw new Error('useShoppingListContext must be used within ShoppingListProvider');
  return context;
}
