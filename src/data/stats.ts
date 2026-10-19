import type { PlanEntry } from '@/data/types';
import { addDays, fromISO, startOfWeek, toISO } from '@/utils/dates';

/** What a meal (day + meal slot) was: cooked from a recipe, ordered in, or typed in without a recipe. */
export type MealKind = 'recipe' | 'ordered' | 'note';
export type Counts = Record<MealKind, number>;
export type StatsRange = '7' | '30' | '90' | '365' | 'all';

export interface StatsBucket {
  /** First day of the bar (YYYY-MM-DD). */
  start: string;
  /** Last day of the bar, cut to the range. */
  end: string;
  counts: Counts;
}

export interface PlanStats {
  from: string;
  to: string;
  counts: Counts;
  /** Meals with anything planned. */
  planned: number;
  /** Empty meals since the first day anything was planned. */
  unplanned: number;
  granularity: 'day' | 'week' | 'month';
  buckets: StatsBucket[];
  /** The same counts for the period of the same length just before; none for "all" or without data. */
  previous?: Counts;
  topOrdered: { name: string; count: number }[];
  /** `title` is set for recipes deleted since: their past meals keep it. */
  topRecipes: { recipeId: string; title?: string; count: number }[];
}

const emptyCounts = (): Counts => ({ recipe: 0, ordered: 0, note: 0 });
export const total = (c: Counts) => c.recipe + c.ordered + c.note;

/** A meal with any dish ordered in counts as ordered; otherwise any recipe makes it cooked from the menu. */
function mealKind(dishes: PlanEntry[]): MealKind {
  if (dishes.some((e) => e.ordered)) return 'ordered';
  if (dishes.some((e) => e.recipeId)) return 'recipe';
  return 'note';
}

/** Meals of the visible slots between `from` and `to` (inclusive). */
function meals(plan: PlanEntry[], slotIds: Set<string>, from: string, to: string) {
  const byMeal = new Map<string, PlanEntry[]>();
  for (const e of plan) {
    if (!slotIds.has(e.slotId) || e.date < from || e.date > to) continue;
    const key = `${e.date}|${e.slotId}`;
    byMeal.set(key, [...(byMeal.get(key) ?? []), e]);
  }
  return [...byMeal].map(([key, dishes]) => ({ date: key.slice(0, 10), kind: mealKind(dishes), dishes }));
}

function countKinds(list: { kind: MealKind }[]): Counts {
  const counts = emptyCounts();
  for (const m of list) counts[m.kind]++;
  return counts;
}

const daysBetween = (from: string, to: string) => Math.round((fromISO(to).getTime() - fromISO(from).getTime()) / 86_400_000) + 1;
const nextMonth = (iso: string) => {
  const date = fromISO(`${iso.slice(0, 7)}-01`);
  date.setMonth(date.getMonth() + 1);
  return toISO(date);
};

/** Bars of the chart: days for a week, weeks up to three months, months beyond. */
function bucketsFor(from: string, to: string, granularity: PlanStats['granularity'], list: { date: string; kind: MealKind }[]) {
  const buckets: StatsBucket[] = [];
  let start = from;
  while (start <= to) {
    const next = granularity === 'day' ? addDays(start, 1) : granularity === 'week' ? addDays(startOfWeek(start), 7) : nextMonth(start);
    const end = addDays(next, -1) < to ? addDays(next, -1) : to;
    buckets.push({ start, end, counts: countKinds(list.filter((m) => m.date >= start && m.date <= end)) });
    start = next;
  }
  // a first bar of only a few days would look like a dip: it joins the next one
  const [first, second] = buckets;
  if (granularity !== 'day' && second && daysBetween(first.start, first.end) < (granularity === 'week' ? 4 : 15)) {
    const counts = emptyCounts();
    for (const kind of Object.keys(counts) as MealKind[]) counts[kind] = first.counts[kind] + second.counts[kind];
    buckets.splice(0, 2, { start: first.start, end: second.end, counts });
  }
  return buckets;
}

function top<T>(keys: T[], limit: number) {
  const counts = new Map<T, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

/** How the plan went over the last `range` days up to `today`: only the past counts, the future is not eaten yet. */
export function planStats(plan: PlanEntry[], slotIds: string[], range: StatsRange, today: string): PlanStats {
  const visible = new Set(slotIds);
  const firstPlanned = plan
    .filter((e) => visible.has(e.slotId) && e.date <= today)
    .reduce<string | null>((min, e) => (!min || e.date < min ? e.date : min), null);
  const from = range === 'all' ? (firstPlanned ?? today) : addDays(today, -(Number(range) - 1));
  const days = daysBetween(from, today);
  const list = meals(plan, visible, from, today);
  const counts = countKinds(list);
  const planned = list.length;
  // empty meals before anything was ever planned say nothing
  const trackedFrom = firstPlanned && firstPlanned > from ? firstPlanned : from;
  const unplanned = firstPlanned ? Math.max(0, daysBetween(trackedFrom, today) * visible.size - planned) : 0;
  const granularity = days <= 7 ? 'day' : days <= 92 ? 'week' : 'month';

  let previous: Counts | undefined;
  if (range !== 'all') {
    const before = countKinds(meals(plan, visible, addDays(from, -days), addDays(from, -1)));
    if (total(before) > 0) previous = before;
  }

  // names are typed by hand: "pizza" and "Pizza" are the same order
  const ordered = list.flatMap((m) => m.dishes.filter((e) => e.ordered && e.note).map((e) => e.note as string));
  const display = new Map<string, string>();
  for (const name of ordered) if (!display.has(name.toLowerCase())) display.set(name.toLowerCase(), name);
  const topOrdered = top(
    ordered.map((name) => name.toLowerCase()),
    5,
  ).map(([key, count]) => ({ name: display.get(key) ?? key, count }));
  const dishes = list.flatMap((m) => m.dishes.filter((e) => e.recipeId));
  const topRecipes = top(
    dishes.map((e) => e.recipeId as string),
    5,
  ).map(([recipeId, count]) => ({ recipeId, title: dishes.find((e) => e.recipeId === recipeId && e.title)?.title, count }));

  return {
    from,
    to: today,
    counts,
    planned,
    unplanned,
    granularity,
    buckets: bucketsFor(from, today, granularity, list),
    previous,
    topOrdered,
    topRecipes,
  };
}
