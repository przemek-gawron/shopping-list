import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { buildSamples } from '@/data/sample-data';
import { buildShoppingList } from '@/data/shopping';
import type {
  Group,
  Language,
  ListItem,
  MealSlot,
  PlanEntry,
  Product,
  Recipe,
} from '@/data/types';
import { generateId } from '@/utils/id-generator';
import { deletePhoto } from '@/utils/photos';

export const MAX_MEALS = 8;

const DEFAULT_SLOTS: MealSlot[] = [
  { id: 'slot-breakfast', key: 'breakfast' },
  { id: 'slot-second-breakfast', key: 'second_breakfast' },
  { id: 'slot-lunch', key: 'lunch' },
  { id: 'slot-snack', key: 'snack' },
  { id: 'slot-dinner', key: 'dinner' },
];

interface Data {
  groups: Group[];
  products: Product[];
  recipes: Recipe[];
  plan: PlanEntry[];
  list: ListItem[];
  slots: MealSlot[];
  /** How many of `slots` (from the top) are shown each day. */
  mealCount: number;
  language: Language;
}

const initialData = (): Data => ({
  groups: [],
  products: [],
  recipes: [],
  plan: [],
  list: [],
  slots: DEFAULT_SLOTS,
  mealCount: DEFAULT_SLOTS.length,
  language: 'system',
});

interface Actions {
  addGroup: (group: Omit<Group, 'id'>) => string;
  updateGroup: (group: Group) => void;
  moveGroup: (id: string, direction: -1 | 1) => void;
  removeGroup: (id: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => string;
  updateProduct: (product: Product) => void;
  removeProduct: (id: string) => void;

  addRecipe: (recipe: Omit<Recipe, 'id'>) => string;
  updateRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;

  addPlanEntry: (entry: Omit<PlanEntry, 'id'>) => void;
  updatePlanEntry: (id: string, servings: number) => void;
  removePlanEntry: (id: string) => void;

  setMealCount: (count: number) => void;
  renameSlot: (id: string, name: string) => void;

  /** Replaces the shopping list with the ingredients of the given plan entries. */
  generateList: (entryIds: string[]) => void;
  addListItem: (item: Omit<ListItem, 'id' | 'checked'>) => void;
  toggleListItem: (id: string) => void;
  removeListItem: (id: string) => void;
  clearChecked: () => void;
  clearList: () => void;

  setLanguage: (language: Language) => void;
  /** Adds the built-in example recipes; returns how many recipes were new. */
  loadSamples: (language: 'pl' | 'en') => number;
  /** Wipes everything except the language setting. */
  clearAll: () => void;
}

export type Store = Data & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialData(),

      addGroup: (group) => {
        const id = generateId();
        set((s) => ({ groups: [...s.groups, { ...group, id }] }));
        return id;
      },
      updateGroup: (group) =>
        set((s) => ({ groups: s.groups.map((g) => (g.id === group.id ? group : g)) })),
      moveGroup: (id, direction) =>
        set((s) => {
          const index = s.groups.findIndex((g) => g.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= s.groups.length) return s;
          const groups = [...s.groups];
          [groups[index], groups[target]] = [groups[target], groups[index]];
          return { groups };
        }),
      removeGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          recipes: s.recipes.map((r) => (r.groupId === id ? { ...r, groupId: null } : r)),
        })),

      addProduct: (product) => {
        const id = generateId();
        set((s) => ({ products: [...s.products, { ...product, id }] }));
        return id;
      },
      updateProduct: (product) =>
        set((s) => ({ products: s.products.map((p) => (p.id === product.id ? product : p)) })),
      removeProduct: (id) =>
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          recipes: s.recipes.map((r) => ({
            ...r,
            ingredients: r.ingredients.filter((i) => i.productId !== id),
          })),
        })),

      addRecipe: (recipe) => {
        const id = generateId();
        set((s) => ({ recipes: [...s.recipes, { ...recipe, id }] }));
        return id;
      },
      updateRecipe: (recipe) => {
        const previous = get().recipes.find((r) => r.id === recipe.id);
        if (previous?.photo && previous.photo !== recipe.photo) deletePhoto(previous.photo);
        set((s) => ({ recipes: s.recipes.map((r) => (r.id === recipe.id ? recipe : r)) }));
      },
      removeRecipe: (id) => {
        const recipe = get().recipes.find((r) => r.id === id);
        if (recipe?.photo) deletePhoto(recipe.photo);
        set((s) => ({
          recipes: s.recipes.filter((r) => r.id !== id),
          plan: s.plan.filter((e) => e.recipeId !== id),
        }));
      },

      addPlanEntry: (entry) =>
        set((s) => ({ plan: [...s.plan, { ...entry, id: generateId() }] })),
      updatePlanEntry: (id, servings) =>
        set((s) => ({ plan: s.plan.map((e) => (e.id === id ? { ...e, servings } : e)) })),
      removePlanEntry: (id) => set((s) => ({ plan: s.plan.filter((e) => e.id !== id) })),

      setMealCount: (count) =>
        set((s) => {
          const mealCount = Math.min(MAX_MEALS, Math.max(1, count));
          const slots = [...s.slots];
          while (slots.length < mealCount) slots.push({ id: generateId() });
          return { mealCount, slots };
        }),
      renameSlot: (id, name) =>
        set((s) => ({
          slots: s.slots.map((slot) =>
            slot.id === id ? { ...slot, name: name.trim() || undefined } : slot,
          ),
        })),

      generateList: (entryIds) => {
        const { plan, recipes, products } = get();
        const chosen = plan.filter((e) => entryIds.includes(e.id));
        const items = buildShoppingList(chosen, recipes, products)
          .map((item) => ({ ...item, id: generateId() }))
          .sort((a, b) => a.name.localeCompare(b.name));
        set({ list: items });
      },
      addListItem: (item) =>
        set((s) => ({ list: [...s.list, { ...item, id: generateId(), checked: false }] })),
      toggleListItem: (id) =>
        set((s) => ({ list: s.list.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) })),
      removeListItem: (id) => set((s) => ({ list: s.list.filter((i) => i.id !== id) })),
      clearChecked: () => set((s) => ({ list: s.list.filter((i) => !i.checked) })),
      clearList: () => set({ list: [] }),

      setLanguage: (language) => set({ language }),

      loadSamples: (language) => {
        const samples = buildSamples(language);
        const { groups, products, recipes } = get();
        const newGroups = samples.groups.filter((g) => !groups.some((x) => x.id === g.id));
        const newProducts = samples.products.filter((p) => !products.some((x) => x.id === p.id));
        const newRecipes = samples.recipes.filter((r) => !recipes.some((x) => x.id === r.id));
        set({
          groups: [...groups, ...newGroups],
          products: [...products, ...newProducts],
          recipes: [...recipes, ...newRecipes],
        });
        return newRecipes.length;
      },

      clearAll: () => {
        get().recipes.forEach((r) => r.photo && deletePhoto(r.photo));
        set({ ...initialData(), language: get().language });
      },
    }),
    {
      name: 'shopping-list:v2',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // functions are not serialisable; persist the data only
      partialize: (s): Data => ({
        groups: s.groups,
        products: s.products,
        recipes: s.recipes,
        plan: s.plan,
        list: s.list,
        slots: s.slots,
        mealCount: s.mealCount,
        language: s.language,
      }),
    },
  ),
);
