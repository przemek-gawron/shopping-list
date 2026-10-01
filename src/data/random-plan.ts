import type { PlanEntry } from '@/data/types';
import { addDays } from '@/utils/dates';

interface Options {
  /** Days to fill, in order (YYYY-MM-DD). */
  dates: string[];
  /** Meals to fill, each with the recipes it may get. */
  slots: { id: string; recipeIds: string[] }[];
  plan: PlanEntry[];
  /** Also replace meals that are already planned. */
  replace: boolean;
  random?: () => number;
}

/**
 * Picks random recipes for empty (or, with `replace`, all) meals. A meal never gets the recipe it
 * has the day before or after, and a recipe is not used twice on the same day, unless there is nothing else.
 */
export function randomPlan({ dates, slots, plan, replace, random = Math.random }: Options): Omit<PlanEntry, 'id'>[] {
  const entry = (date: string, slotId: string) => plan.find((e) => e.date === date && e.slotId === slotId);
  const filled = new Set(slots.map((s) => s.id));
  const result: Omit<PlanEntry, 'id'>[] = [];
  // what each meal had the previous day, starting from the day before the range
  const previous = new Map(slots.map((s) => [s.id, dates[0] ? entry(addDays(dates[0], -1), s.id)?.recipeId : undefined]));

  for (const date of dates) {
    // meals outside the selection keep their recipes; count them as used that day
    const used = new Set(plan.filter((e) => e.date === date && !filled.has(e.slotId)).map((e) => e.recipeId));
    for (const slot of slots) {
      const existing = entry(date, slot.id);
      if (existing && !replace) {
        previous.set(slot.id, existing.recipeId);
        used.add(existing.recipeId);
        continue;
      }
      const pool = slot.recipeIds;
      if (pool.length === 0) continue;
      const yesterday = previous.get(slot.id);
      // a meal kept on the next day counts as a neighbour too
      const tomorrow = replace && filled.has(slot.id) && dates.includes(addDays(date, 1)) ? undefined : entry(addDays(date, 1), slot.id)?.recipeId;
      const neighbour = (id: string) => id === yesterday || id === tomorrow;
      const fresh = pool.filter((id) => !neighbour(id) && !used.has(id));
      const notYesterday = pool.filter((id) => !neighbour(id));
      const choices = fresh.length > 0 ? fresh : notYesterday.length > 0 ? notYesterday : pool;
      const recipeId = choices[Math.floor(random() * choices.length)];
      result.push({ date, slotId: slot.id, recipeId, servings: existing?.servings ?? 1 });
      previous.set(slot.id, recipeId);
      used.add(recipeId);
    }
  }
  return result;
}
