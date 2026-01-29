import { Product, Recipe, RecipeSelection } from '@/types';

export interface AppState {
  products: Product[];
  recipes: Recipe[];
  selections: RecipeSelection[];
  isLoading: boolean;
}

export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: { products: Product[]; recipes: Recipe[]; selections: RecipeSelection[] } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'SET_SELECTION'; payload: { recipeId: string; count: number } }
  | { type: 'CLEAR_SELECTIONS' };

export const initialState: AppState = {
  products: [],
  recipes: [],
  selections: [],
  isLoading: true,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'LOAD_DATA':
      return {
        ...state,
        products: action.payload.products,
        recipes: action.payload.recipes,
        selections: action.payload.selections,
        isLoading: false,
      };

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

    default:
      return state;
  }
}
