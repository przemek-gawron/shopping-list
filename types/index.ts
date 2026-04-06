export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'szt' | 'lyzka' | 'lyzeczka' | 'szklanka';

export interface Product {
  id: string;
  name: string;
  aliases?: string[];
  defaultUnit: Unit;
}

export interface Ingredient {
  id: string;
  productId: string;
  quantity: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
}

export interface RecipeSelection {
  recipeId: string;
  count: number;
}

export interface ShoppingListItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: Unit;
  checked: boolean;
}
