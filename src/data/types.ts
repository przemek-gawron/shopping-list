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
  /** None for a meal typed in without a recipe (`note`); such a meal never goes on the shopping list. */
  recipeId?: string;
  /** Name of a meal from outside the app, e.g. "Pizza at Marco's". */
  note?: string;
  /** The `note` meal is ordered in (takeaway, delivery): marked in the plan and kept by random plans. */
  ordered?: boolean;
  /** Title of the recipe after it was deleted; past meals keep it (and `recipeId`) so the statistics do not change. */
  title?: string;
  servings: number;
  /** Ingredients replaced for this meal only; the recipe itself is unchanged. */
  swaps?: Swap[];
  /** "Already shopped for": the meal is left out of the shopping list. Dropped when the meal gets another recipe. */
  shopped?: boolean;
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
  /** The planned meals the item was generated from; none for items added by hand. */
  sources?: ListSource[];
}

/** One planned meal that needs a list item, with the amount it adds (servings included). */
export interface ListSource {
  /** The plan entry; it may be gone since (plan cleared, meal replaced). */
  entryId: string;
  recipeId: string;
  /** Recipe title when the list was generated, shown even if the recipe is deleted since. */
  title: string;
  date: string;
  slotId: string;
  quantity: number;
  unit: Unit;
  /** The item is a substitute chosen for this meal, not the recipe's own ingredient. */
  swap?: boolean;
}
