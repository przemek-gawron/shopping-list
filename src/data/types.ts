export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'szt' | 'lyzka' | 'lyzeczka' | 'szklanka';

export type DepartmentId =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'dry'
  | 'frozen'
  | 'drinks'
  | 'other';

export type Language = 'system' | 'pl' | 'en';

export interface Product {
  id: string;
  name: string;
  defaultUnit: Unit;
  departmentId: DepartmentId;
}

export interface Ingredient {
  id: string;
  productId: string;
  quantity: number;
  unit: Unit;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  /** null = not in any group */
  groupId: string | null;
  /** File name of the photo inside the app's document directory */
  photo?: string;
}

/** A meal slot of the day (breakfast, lunch...). `key` links a default slot to its translated name. */
export interface MealSlot {
  id: string;
  key?: 'breakfast' | 'second_breakfast' | 'lunch' | 'snack' | 'dinner';
  name?: string;
}

export interface PlanEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  slotId: string;
  recipeId: string;
  servings: number;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  checked: boolean;
  departmentId: DepartmentId;
}
