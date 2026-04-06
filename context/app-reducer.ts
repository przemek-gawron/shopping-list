import { Product, Recipe, RecipeSelection, Category } from '@/types';
import { getAllDefaultCategories, getDefaultCategories, getUncategorizedCategory, UNCATEGORIZED_CATEGORY_ID } from '@/constants/categories';

// Map known default category IDs to their translated names so that categories
// stored in AsyncStorage (possibly in a different language) always display in
// the current device locale. User-created categories are unaffected.
function resolveDefaultCategoryName(category: Category): Category {
  const defaults = [...getDefaultCategories(), getUncategorizedCategory()];
  const match = defaults.find((d) => d.id === category.id);
  return match ? { ...category, name: match.name } : category;
}

export interface AppState {
  products: Product[];
  recipes: Recipe[];
  selections: RecipeSelection[];
  categories: Category[];
  isLoading: boolean;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { products: Product[]; recipes: Recipe[]; selections: RecipeSelection[]; categories: Category[] } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'SET_SELECTION'; payload: { recipeId: string; count: number } }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string };

export const initialState: AppState = {
  products: [],
  recipes: [],
  selections: [],
  categories: [],
  isLoading: true,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_DATA': {
      const categories = (action.payload.categories.length > 0
        ? action.payload.categories
        : getAllDefaultCategories()
      ).map(resolveDefaultCategoryName);

      const recipes = action.payload.recipes.map((r) =>
        r.categoryId ? r : { ...r, categoryId: UNCATEGORIZED_CATEGORY_ID }
      );

      return {
        ...state,
        products: action.payload.products,
        recipes,
        selections: action.payload.selections,
        categories,
        isLoading: false,
      };
    }

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      };

    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.payload] };

    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map((r) => (r.id === action.payload.id ? action.payload : r)),
      };

    case 'DELETE_RECIPE': {
      const newSelections = state.selections.filter((s) => s.recipeId !== action.payload);
      return {
        ...state,
        recipes: state.recipes.filter((r) => r.id !== action.payload),
        selections: newSelections,
      };
    }

    case 'SET_SELECTION': {
      const { recipeId, count } = action.payload;
      if (count <= 0) {
        return {
          ...state,
          selections: state.selections.filter((s) => s.recipeId !== recipeId),
        };
      }
      const existing = state.selections.find((s) => s.recipeId === recipeId);
      if (existing) {
        return {
          ...state,
          selections: state.selections.map((s) => (s.recipeId === recipeId ? { ...s, count } : s)),
        };
      }
      return {
        ...state,
        selections: [...state.selections, { recipeId, count }],
      };
    }

    case 'CLEAR_SELECTIONS':
      return { ...state, selections: [] };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };

    case 'DELETE_CATEGORY': {
      const categoryId = action.payload;
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== categoryId),
        recipes: state.recipes.map((r) =>
          r.categoryId === categoryId ? { ...r, categoryId: UNCATEGORIZED_CATEGORY_ID } : r
        ),
      };
    }

    default:
      return state;
  }
}
