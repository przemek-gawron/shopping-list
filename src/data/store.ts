import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { RecipeFile } from '@/data/import';
import type { PlanPayload } from '@/data/plan-link';
import { buildSamples } from '@/data/sample-data';
import { DEFAULT_SUBSTITUTES } from '@/constants/substitutes';
import { buildShoppingList } from '@/data/shopping';
import type {
  DepartmentId,
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
import { today } from '@/utils/dates';
import { generateId } from '@/utils/id-generator';
import { deletePhoto } from '@/utils/photos';

export const MAX_MEALS = 8;

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

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
  /** Adds a dish to a meal; the same recipe (or note) in that meal, or the entry `replaceId`, is replaced in place. */
  setPlanEntry: (entry: Omit<PlanEntry, 'id'>, replaceId?: string) => void;
  /** Several meals at once (random plan); each replaces what its day and meal had. */
  setPlanEntries: (entries: Omit<PlanEntry, 'id'>[]) => void;
  updatePlanEntry: (id: string, servings: number) => void;
  /** Marks a planned meal as already shopped for, which keeps it off the shopping list. */
  setShopped: (id: string, shopped: boolean) => void;
  removePlanEntry: (id: string) => void;
  /** Removes every planned meal from `from` to `to` (YYYY-MM-DD, inclusive), hidden meal slots included. */
  clearPlan: (from: string, to: string) => void;
  /** Brings back the plan as it was before its last change. */
  undoPlan: () => void;
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
  /** Brings back the shopping list as it was before its last change. */
  undoList: () => void;

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
  /** Puts a plan sent from another phone on its days, replacing what they had; adds its recipes that are missing (by title). */
  importPlan: (payload: PlanPayload) => { added: number };
  /** Wipes everything except the language setting. */
  clearAll: () => void;
}

/** Kept in memory only, not saved with the rest of the data. */
interface Session {
  /** Earlier versions of the shopping list, oldest first, for `undoList`. */
  listHistory: ListItem[][];
  /** Earlier versions of the plan, oldest first, for `undoPlan`. */
  planHistory: PlanEntry[][];
}

/** How many shopping list or plan changes can be undone. */
const HISTORY_LIMIT = 20;

export type Store = Data & Session & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      /** Changes the shopping list and remembers the previous one for undo. */
      const changeList = (change: (list: ListItem[]) => ListItem[]) =>
        set((s) => ({ list: change(s.list), listHistory: [...s.listHistory, s.list].slice(-HISTORY_LIMIT) }));
      /** Changes the plan and remembers the previous one for undo. */
      const changePlan = (change: (plan: PlanEntry[]) => PlanEntry[]) =>
        set((s) => ({ plan: change(s.plan), planHistory: [...s.planHistory, s.plan].slice(-HISTORY_LIMIT) }));

      /**
       * Merges the recipes of a file into copies of the data, by title; products and groups by name.
       * `keep` leaves recipes that already exist as they are, else they are overwritten (photo and rating stay).
       * Nothing is saved; `ids` are the recipes' ids in the file's order.
       */
      const mergeRecipes = (file: RecipeFile, keep: boolean) => {
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
        const product = (name: string, unit: Unit, departmentId: DepartmentId) => {
          let found = products.find((p) => same(p.name, name));
          if (!found) {
            found = { id: generateId(), name, defaultUnit: unit, departmentId };
            products.push(found);
          }
          return found.id;
        };

        const ids = file.recipes.map((incoming) => {
          const index = recipes.findIndex((r) => same(r.title, incoming.title));
          if (index >= 0 && keep) return recipes[index].id;
          const data = {
            title: incoming.title,
            description: incoming.description,
            groupId: groupId(incoming.group),
            ingredients: incoming.ingredients.map((ing) => ({
              id: generateId(),
              productId: product(ing.name, ing.unit, ing.department),
              quantity: ing.quantity,
              unit: ing.unit,
            })),
          };
          const menuIds = [...new Set([...((index >= 0 && recipes[index].menuIds) || []), ...incoming.menus.map(menuId)])];
          if (index >= 0) {
            recipes[index] = { ...recipes[index], ...data, menuIds };
            updated++;
            return recipes[index].id;
          }
          const id = generateId();
          recipes.push({ ...data, menuIds, id });
          added++;
          return id;
        });
        return { groups, products, recipes, menus, ids, product, added, updated };
      };

      return {
        ...initialData(),
        listHistory: [],
        planHistory: [],

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
            // a swap to (or from) the deleted product would otherwise drop the ingredient from the list
            plan: s.plan.map((e) =>
              e.swaps?.some((w) => w.productId === id || w.fromProductId === id)
                ? { ...e, swaps: e.swaps.filter((w) => w.productId !== id && w.fromProductId !== id) }
                : e,
            ),
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
          // meals up to today stay, under the recipe's title, so the statistics do not change; future ones go
          set((s) => ({
            recipes: s.recipes.filter((r) => r.id !== id),
            plan: s.plan.flatMap((e) =>
              e.recipeId !== id ? [e] : e.date <= today() ? [{ ...e, title: recipe?.title ?? e.title, shopped: undefined }] : [],
            ),
          }));
        },

        setPlanEntry: (entry, replaceId) =>
          changePlan((plan) => {
            const same = (e: PlanEntry) =>
              e.id === replaceId ||
              (e.date === entry.date && e.slotId === entry.slotId && (entry.recipeId ? e.recipeId === entry.recipeId : e.note === entry.note));
            const added = { ...entry, id: generateId() };
            const index = plan.findIndex(same);
            return index < 0 ? [...plan, added] : [...plan.slice(0, index), added, ...plan.slice(index + 1).filter((e) => !same(e))];
          }),
        setPlanEntries: (entries) =>
          changePlan((plan) => [
            ...plan.filter((e) => !entries.some((n) => n.date === e.date && n.slotId === e.slotId)),
            ...entries.map((e) => ({ ...e, id: generateId() })),
          ]),
        updatePlanEntry: (id, servings) => changePlan((plan) => plan.map((e) => (e.id === id ? { ...e, servings } : e))),
        setShopped: (id, shopped) =>
          changePlan((plan) => plan.map((e) => (e.id === id ? { ...e, shopped: shopped || undefined } : e))),
        removePlanEntry: (id) => changePlan((plan) => plan.filter((e) => e.id !== id)),
        clearPlan: (from, to) => changePlan((plan) => plan.filter((e) => e.date < from || e.date > to)),
        undoPlan: () =>
          set((s) => (s.planHistory.length ? { plan: s.planHistory[s.planHistory.length - 1], planHistory: s.planHistory.slice(0, -1) } : s)),
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
          changePlan((plan) =>
            plan.map((e) =>
              e.id === entryId ? { ...e, swaps: [...(e.swaps ?? []).filter((w) => w.fromProductId !== fromProductId), swap] } : e,
            ),
          );
        },
        clearSwap: (entryId, fromProductId) =>
          changePlan((plan) =>
            plan.map((e) => (e.id === entryId ? { ...e, swaps: (e.swaps ?? []).filter((w) => w.fromProductId !== fromProductId) } : e)),
          ),
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
          const chosen = plan.filter((e) => entryIds.includes(e.id) && !e.shopped);
          const items = buildShoppingList(chosen, recipes, products)
            .map((item) => ({ ...item, id: generateId() }))
            .sort((a, b) => a.name.localeCompare(b.name));
          changeList(() => items);
        },
        addListItem: (item) => changeList((list) => [...list, { ...item, id: generateId(), checked: false }]),
        updateListItem: (item) => changeList((list) => list.map((i) => (i.id === item.id ? item : i))),
        toggleListItem: (id) => changeList((list) => list.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))),
        removeListItem: (id) => changeList((list) => list.filter((i) => i.id !== id)),
        clearChecked: () => changeList((list) => list.filter((i) => !i.checked)),
        clearList: () => changeList(() => []),
        undoList: () =>
          set((s) => (s.listHistory.length ? { list: s.listHistory[s.listHistory.length - 1], listHistory: s.listHistory.slice(0, -1) } : s)),

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
          const { groups, products, recipes, menus, added, updated } = mergeRecipes(file, false);
          set({ groups, products, recipes, menus });
          return { added, updated };
        },
        importPlan: (payload) => {
          const merged = mergeRecipes(payload.recipes, true);
          const slots = [...get().slots];
          const slotIds: string[] = [];
          const free = (slot: MealSlot | undefined) => slot && !slotIds.includes(slot.id);
          // the same default meal or the same name first, then the same position, any free meal, or a new one
          payload.slots.forEach((incoming, i) => {
            const slot = slots.find(
              (s) => free(s) && ((incoming.key && s.key === incoming.key) || (incoming.name && s.name && same(s.name, incoming.name))),
            );
            if (slot) slotIds[i] = slot.id;
          });
          payload.slots.forEach((incoming, i) => {
            if (slotIds[i]) return;
            let slot = free(slots[i]) ? slots[i] : slots.find(free);
            if (!slot) {
              slot = { id: generateId(), key: incoming.key, name: incoming.name };
              slots.push(slot);
            }
            slotIds[i] = slot.id;
          });
          // meals the plan uses are shown even if fewer meals a day were set
          const lastUsed = Math.max(-1, ...payload.entries.map((e) => slots.findIndex((s) => s.id === slotIds[e.slot])));
          const mealCount = Math.min(MAX_MEALS, Math.max(get().mealCount, lastUsed + 1));

          const entries = payload.entries.map((e): PlanEntry => {
            const base = { id: generateId(), date: e.date, slotId: slotIds[e.slot], servings: e.servings };
            if (e.recipe === undefined) return { ...base, note: e.note, ordered: e.ordered };
            const swaps = e.swaps?.map((w): Swap => {
              const from = merged.product(w.from, w.unit, 'other');
              const departmentId = merged.products.find((p) => p.id === from)?.departmentId ?? 'other';
              return { fromProductId: from, productId: merged.product(w.product, w.unit, departmentId), quantity: w.quantity, unit: w.unit };
            });
            return { ...base, recipeId: merged.ids[e.recipe], swaps };
          });
          const { groups, products, recipes, menus } = merged;
          set((s) => ({
            groups,
            products,
            recipes,
            menus,
            slots,
            mealCount,
            plan: [...s.plan.filter((e) => e.date < payload.start || e.date > payload.end), ...entries],
            planHistory: [...s.planHistory, s.plan].slice(-HISTORY_LIMIT),
          }));
          return { added: merged.added };
        },

        clearAll: () => {
          get().recipes.forEach((r) => r.photo && deletePhoto(r.photo));
          set({ ...initialData(), listHistory: [], planHistory: [], language: get().language });
        },
      };
    },
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
