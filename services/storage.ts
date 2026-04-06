import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Recipe, RecipeSelection, Category } from '@/types';

const KEYS = {
  PRODUCTS: 'shopping-list:products',
  RECIPES: 'shopping-list:recipes',
  SELECTIONS: 'shopping-list:selections',
  CATEGORIES: 'shopping-list:categories',
};

export async function loadProducts(): Promise<Product[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load products:', error);
    return [];
  }
}

export async function saveProducts(products: Product[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Failed to save products:', error);
  }
}

export async function loadRecipes(): Promise<Recipe[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.RECIPES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load recipes:', error);
    return [];
  }
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.RECIPES, JSON.stringify(recipes));
  } catch (error) {
    console.error('Failed to save recipes:', error);
  }
}

export async function loadSelections(): Promise<RecipeSelection[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SELECTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load selections:', error);
    return [];
  }
}

export async function saveSelections(selections: RecipeSelection[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SELECTIONS, JSON.stringify(selections));
  } catch (error) {
    console.error('Failed to save selections:', error);
  }
}

export async function loadCategories(): Promise<Category[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load categories:', error);
    return [];
  }
}

export async function saveCategories(categories: Category[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to save categories:', error);
  }
}
