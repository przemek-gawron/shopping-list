import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Product, Recipe, RecipeSelection } from '@/types';
import { appReducer, AppState, initialState } from './app-reducer';
import { loadProducts, loadRecipes, loadSelections, saveProducts, saveRecipes, saveSelections } from '@/services/storage';

interface AppContextValue extends AppState {
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  setSelection: (recipeId: string, count: number) => void;
  clearSelections: () => void;
  getSelectionCount: (recipeId: string) => number;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    async function loadData() {
      const [products, recipes, selections] = await Promise.all([
        loadProducts(),
        loadRecipes(),
        loadSelections(),
      ]);
      dispatch({ type: 'LOAD_DATA', payload: { products, recipes, selections } });
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      saveProducts(state.products);
    }
  }, [state.products, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveRecipes(state.recipes);
    }
  }, [state.recipes, state.isLoading]);

  useEffect(() => {
    if (!state.isLoading) {
      saveSelections(state.selections);
    }
  }, [state.selections, state.isLoading]);

  const addProduct = useCallback((product: Product) => {
    dispatch({ type: 'ADD_PRODUCT', payload: product });
  }, []);

  const updateProduct = useCallback((product: Product) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: product });
  }, []);

  const deleteProduct = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  }, []);

  const addRecipe = useCallback((recipe: Recipe) => {
    dispatch({ type: 'ADD_RECIPE', payload: recipe });
  }, []);

  const updateRecipe = useCallback((recipe: Recipe) => {
    dispatch({ type: 'UPDATE_RECIPE', payload: recipe });
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    dispatch({ type: 'DELETE_RECIPE', payload: id });
  }, []);

  const setSelection = useCallback((recipeId: string, count: number) => {
    dispatch({ type: 'SET_SELECTION', payload: { recipeId, count } });
  }, []);

  const clearSelections = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTIONS' });
  }, []);

  const getSelectionCount = useCallback(
    (recipeId: string) => {
      const selection = state.selections.find((s) => s.recipeId === recipeId);
      return selection?.count ?? 0;
    },
    [state.selections]
  );

  const value: AppContextValue = {
    ...state,
    addProduct,
    updateProduct,
    deleteProduct,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    setSelection,
    clearSelections,
    getSelectionCount,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
