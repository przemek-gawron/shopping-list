import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { RecipeFile } from '@/data/import';
import { buildSamples } from '@/data/sample-data';
import { DEFAULT_SUBSTITUTES } from '@/constants/substitutes';
import { buildShoppingList } from '@/data/shopping';
import type {
  Group,
  Language,
  ListItem,
  Menu,
  MealSlot,
  PlanEntry,
  Product,
  Recipe,
  SubstituteGroup,
  Swap,
  Unit,
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
  /** Imported meal plans, newest first. */
  menus: Menu[];
  /** Show recipe lists split into collapsible sections per meal plan. */
  groupByMenu: boolean;
  plan: PlanEntry[];
  list: ListItem[];
  slots: MealSlot[];
  substitutes: SubstituteGroup[];
  /** How many of `slots` (from the top) are shown each day. */
  mealCount: number;
  language: Language;
}

const initialData = (): Data => ({
  groups: [],
  products: [],
  recipes: [],
  menus: [],
  groupByMenu: false,
  plan: [],
  list: [],
  slots: DEFAULT_SLOTS,
  substitutes: DEFAULT_SUBSTITUTES,
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
  setRating: (id: string, rating: number | undefined) => void;

  /** Puts a recipe in a day's meal slot; a slot holds one recipe, so it replaces what was there. */
  setPlanEntry: (entry: Omit<PlanEntry, 'id'>) => void;
  /** Several meals at once (random plan); each replaces what its day and meal had. */
  setPlanEntries: (entries: Omit<PlanEntry, 'id'>[]) => void;
  updatePlanEntry: (id: string, servings: number) => void;
  removePlanEntry: (id: string) => void;
  /** Replaces one ingredient of a planned meal; creates the substitute product when it is new. */
  setSwap: (entryId: string, fromProductId: string, substitute: { product: string; quantity: number; unit: Unit }) => void;
  clearSwap: (entryId: string, fromProductId: string) => void;
  setSubstitutes: (groups: SubstituteGroup[]) => void;

  setMealCount: (count: number) => void;
  renameSlot: (id: string, name: string) => void;
  /** Reorders the visible meals; plan entries follow their slot. */
  moveSlot: (id: string, direction: -1 | 1) => void;

  /** Replaces the shopping list with the ingredients of the given plan entries. */
  generateList: (entryIds: string[]) => void;
  addListItem: (item: Omit<ListItem, 'id' | 'checked'>) => void;
  updateListItem: (item: ListItem) => void;
  toggleListItem: (id: string) => void;
  removeListItem: (id: string) => void;
  clearChecked: () => void;
  clearList: () => void;

  setLanguage: (language: Language) => void;
  setGroupByMenu: (value: boolean) => void;
  renameMenu: (id: string, name: string) => void;
  moveMenu: (id: string, direction: -1 | 1) => void;
  /** Removes the meal plan label only; its recipes stay. */
  removeMenu: (id: string) => void;
  /** Adds the built-in example recipes; returns how many recipes were new. */
  loadSamples: (language: 'pl' | 'en') => number;
  /** Adds recipes from a file; a recipe with the same title is overwritten (its photo and rating are kept). */
  importRecipes: (file: RecipeFile) => { added: number; updated: number };
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
      setRating: (id, rating) =>
        set((s) => ({ recipes: s.recipes.map((r) => (r.id === id ? { ...r, rating } : r)) })),
      removeRecipe: (id) => {
        const recipe = get().recipes.find((r) => r.id === id);
        if (recipe?.photo) deletePhoto(recipe.photo);
        set((s) => ({
          recipes: s.recipes.filter((r) => r.id !== id),
          plan: s.plan.filter((e) => e.recipeId !== id),
        }));
      },

      setPlanEntry: (entry) =>
        set((s) => ({
          plan: [
            ...s.plan.filter((e) => !(e.date === entry.date && e.slotId === entry.slotId)),
            { ...entry, id: generateId() },
          ],
        })),
      setPlanEntries: (entries) =>
        set((s) => ({
          plan: [
            ...s.plan.filter((e) => !entries.some((n) => n.date === e.date && n.slotId === e.slotId)),
            ...entries.map((e) => ({ ...e, id: generateId() })),
          ],
        })),
      updatePlanEntry: (id, servings) =>
        set((s) => ({ plan: s.plan.map((e) => (e.id === id ? { ...e, servings } : e)) })),
      removePlanEntry: (id) => set((s) => ({ plan: s.plan.filter((e) => e.id !== id) })),
      setSwap: (entryId, fromProductId, substitute) => {
        const { products } = get();
        let product = products.find((p) => p.name.toLowerCase() === substitute.product.toLowerCase());
        if (!product) {
          // a new substitute goes to the same store department as what it replaces
          const departmentId = products.find((p) => p.id === fromProductId)?.departmentId ?? 'other';
          product = { id: generateId(), name: substitute.product, defaultUnit: substitute.unit, departmentId };
          set({ products: [...products, product] });
        }
        const swap: Swap = { fromProductId, productId: product.id, quantity: substitute.quantity, unit: substitute.unit };
        set((s) => ({
          plan: s.plan.map((e) =>
            e.id === entryId ? { ...e, swaps: [...(e.swaps ?? []).filter((w) => w.fromProductId !== fromProductId), swap] } : e,
          ),
        }));
      },
      clearSwap: (entryId, fromProductId) =>
        set((s) => ({
          plan: s.plan.map((e) => (e.id === entryId ? { ...e, swaps: (e.swaps ?? []).filter((w) => w.fromProductId !== fromProductId) } : e)),
        })),
      setSubstitutes: (substitutes) => set({ substitutes }),

      setMealCount: (count) =>
        set((s) => {
          const mealCount = Math.min(MAX_MEALS, Math.max(1, count));
          const slots = [...s.slots];
          while (slots.length < mealCount) slots.push({ id: generateId() });
          return { mealCount, slots };
        }),
      moveSlot: (id, direction) =>
        set((s) => {
          const index = s.slots.findIndex((slot) => slot.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= s.mealCount) return s;
          const slots = [...s.slots];
          [slots[index], slots[target]] = [slots[target], slots[index]];
          return { slots };
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
      updateListItem: (item) => set((s) => ({ list: s.list.map((i) => (i.id === item.id ? item : i)) })),
      toggleListItem: (id) =>
        set((s) => ({ list: s.list.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)) })),
      removeListItem: (id) => set((s) => ({ list: s.list.filter((i) => i.id !== id) })),
      clearChecked: () => set((s) => ({ list: s.list.filter((i) => !i.checked) })),
      clearList: () => set({ list: [] }),

      setLanguage: (language) => set({ language }),
      setGroupByMenu: (groupByMenu) => set({ groupByMenu }),
      renameMenu: (id, name) =>
        set((s) => ({ menus: s.menus.map((m) => (m.id === id && name.trim() ? { ...m, name: name.trim() } : m)) })),
      moveMenu: (id, direction) =>
        set((s) => {
          const index = s.menus.findIndex((m) => m.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= s.menus.length) return s;
          const menus = [...s.menus];
          [menus[index], menus[target]] = [menus[target], menus[index]];
          return { menus };
        }),
      removeMenu: (id) =>
        set((s) => ({
          menus: s.menus.filter((m) => m.id !== id),
          recipes: s.recipes.map((r) => (r.menuIds?.includes(id) ? { ...r, menuIds: r.menuIds.filter((m) => m !== id) } : r)),
        })),

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

      importRecipes: (file) => {
        const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
        const groups = [...get().groups];
        const products = [...get().products];
        const recipes = [...get().recipes];
        let menus = [...get().menus];
        // newest first; a plan imported again keeps its place
        const menuId = (name: string) => {
          let menu = menus.find((m) => same(m.name, name));
          if (!menu) {
            menu = { id: generateId(), name };
            menus = [menu, ...menus];
          }
          return menu.id;
        };
        file.menus.forEach(menuId);
        let added = 0;
        let updated = 0;

        const groupId = (name: string | null) => {
          if (!name) return null;
          let group = groups.find((g) => same(g.name, name));
          if (!group) {
            const emoji = file.groups.find((g) => same(g.name, name))?.emoji ?? '🍽️';
            group = { id: generateId(), name, emoji };
            groups.push(group);
          }
          return group.id;
        };

        for (const incoming of file.recipes) {
          const ingredients = incoming.ingredients.map((ing) => {
            let product = products.find((p) => same(p.name, ing.name));
            if (!product) {
              product = { id: generateId(), name: ing.name, defaultUnit: ing.unit, departmentId: ing.department };
              products.push(product);
            }
            return { id: generateId(), productId: product.id, quantity: ing.quantity, unit: ing.unit };
          });
          const data = {
            title: incoming.title,
            description: incoming.description,
            groupId: groupId(incoming.group),
            ingredients,
          };
          const index = recipes.findIndex((r) => same(r.title, incoming.title));
          const menuIds = [...new Set([...((index >= 0 && recipes[index].menuIds) || []), ...incoming.menus.map(menuId)])];
          if (index >= 0) {
            recipes[index] = { ...recipes[index], ...data, menuIds };
            updated++;
          } else {
            recipes.push({ ...data, menuIds, id: generateId() });
            added++;
          }
        }
        set({ groups, products, recipes, menus });
        return { added, updated };
      },

      clearAll: () => {
        get().recipes.forEach((r) => r.photo && deletePhoto(r.photo));
        set({ ...initialData(), language: get().language });
      },
    }),
    {
      name: 'shopping-list:v2',
      version: 2,
      // v1 allowed several recipes in one meal slot; keep the most recently added one
      migrate: (persisted, version) => {
        const data = persisted as Data;
        if (version < 2 && Array.isArray(data?.plan)) {
          const bySlot = new Map(data.plan.map((e) => [`${e.date}:${e.slotId}`, e]));
          data.plan = [...bySlot.values()];
        }
        return data;
      },
      storage: createJSONStorage(() => AsyncStorage),
      // functions are not serialisable; persist the data only
      partialize: (s): Data => ({
        groups: s.groups,
        products: s.products,
        recipes: s.recipes,
        menus: s.menus,
        groupByMenu: s.groupByMenu,
        plan: s.plan,
        list: s.list,
        slots: s.slots,
        substitutes: s.substitutes,
        mealCount: s.mealCount,
        language: s.language,
      }),
    },
  ),
);
