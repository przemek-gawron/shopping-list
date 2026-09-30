#!/usr/bin/env node
/**
 * Converts dietitian meal plans (.doc) into a JSON file the app can import
 * (Settings -> "Import recipes from a file"). The app can also import a .doc directly;
 * this script is for converting several plans at once and for extending the dictionary.
 *
 *   node scripts/import-meal-plans.mjs --out ~/przepisy.json "plan I.doc" "plan II.doc" ...
 *
 * Needs Node 24+ (it loads the app's TypeScript parser directly). Files are processed in the
 * given order and a recipe with the same title overwrites the earlier one.
 *
 * Add --raw-names to print every ingredient name that has no entry in
 * src/data/meal-plan-products.ts.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { extractDocText } from '../src/data/doc-text.ts';
import { MEAL_PLAN_PRODUCTS } from '../src/data/meal-plan-products.ts';
import { parseMealPlan } from '../src/data/meal-plan.ts';

const args = process.argv.slice(2);
const rawNames = args.includes('--raw-names');
const outIndex = args.indexOf('--out');
const out = outIndex >= 0 ? args[outIndex + 1] : null;
const files = args.filter((a, i) => !a.startsWith('--') && (outIndex < 0 || i !== outIndex + 1));
if (files.length === 0 || (!out && !rawNames)) {
  console.error('Usage: node scripts/import-meal-plans.mjs --out recipes.json plan1.doc [plan2.doc ...]');
  process.exit(1);
}

const byTitle = new Map();
const groups = new Map();
const unknown = new Set();
let overwritten = 0;
for (const file of files) {
  const plan = parseMealPlan(extractDocText(new Uint8Array(readFileSync(file))), MEAL_PLAN_PRODUCTS);
  plan.groups.forEach((g) => groups.set(g.name, g));
  plan.unknown.forEach((name) => unknown.add(name));
  for (const recipe of plan.recipes) {
    const key = recipe.title.toLowerCase();
    if (byTitle.has(key)) overwritten++;
    byTitle.set(key, recipe);
  }
}

if (rawNames) {
  [...unknown].sort((a, b) => a.localeCompare(b, 'pl')).forEach((name) => console.log(name));
  process.exit(0);
}

const recipes = [...byTitle.values()];
writeFileSync(out, JSON.stringify({ format: 'shopping-list-recipes', version: 1, groups: [...groups.values()], recipes }, null, 2));

console.log(`${recipes.length} recipes written to ${out} (${overwritten} repeated recipes overwritten)`);
for (const g of groups.values()) console.log(`  ${g.name}: ${recipes.filter((r) => r.group === g.name).length}`);
const empty = recipes.filter((r) => r.ingredients.length === 0).map((r) => r.title);
if (empty.length) console.log(`No ingredients found for: ${empty.join('; ')}`);
if (unknown.size) console.log(`${unknown.size} ingredient names are not in the dictionary (run with --raw-names to list them)`);
