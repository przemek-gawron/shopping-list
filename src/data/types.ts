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

/** A dietitian meal plan (one imported .doc) that recipes came from. */
export interface Menu {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients: Ingredient[];
  /** null = not in any group */
  groupId: string | null;
  /** Meal plans this recipe appeared in; none for recipes added by hand. */
  menuIds?: string[];
  /** How much we liked it, 1–5 stars; none = not rated yet. */
  rating?: number;
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
  /** Ingredients replaced for this meal only; the recipe itself is unchanged. */
  swaps?: Swap[];
}

/** One ingredient of a planned meal replaced by a substitute (amounts are per serving). */
export interface Swap {
  /** Product of the recipe's ingredient being replaced. */
  fromProductId: string;
  productId: string;
  quantity: number;
  unit: Unit;
}

/** Interchangeable products with equivalent amounts, e.g. bread 30 g = groats 20 g = potatoes 80 g. */
export interface SubstituteGroup {
  id: string;
  name: string;
  items: { product: string; quantity: number; unit: Unit }[];
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  checked: boolean;
  departmentId: DepartmentId;
}
