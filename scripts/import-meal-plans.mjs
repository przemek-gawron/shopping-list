#!/usr/bin/env node
/**
 * Converts dietitian meal plans (.doc) into a JSON file the app can import
 * (Settings -> "Import recipes from a file").
 *
 *   node scripts/import-meal-plans.mjs --out ~/przepisy.json "plan I.doc" "plan II.doc" ...
 *
 * macOS only: .doc is read with the built-in `textutil`. Files are processed in the given
 * order and a recipe with the same title overwrites the earlier one.
 *
 * Add --raw-names to print every distinct ingredient name that has no entry in
 * meal-plan-products.json (used to extend that dictionary).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/** raw ingredient name (lower case) -> [product name, store department] or null to skip it */
const DICTIONARY = JSON.parse(readFileSync(join(here, 'meal-plan-products.json'), 'utf8'));

/** Spices are bought by the packet, so they go on the list as one piece whatever the recipe's amount. */
const SPICES = new Set([
  'Sól', 'Sól i pieprz', 'Pieprz czarny', 'Pieprz biały', 'Przyprawy', 'Oregano', 'Bazylia suszona', 'Tymianek',
  'Rozmaryn', 'Majeranek', 'Zioła prowansalskie', 'Curry', 'Kurkuma', 'Cynamon', 'Papryka słodka mielona',
  'Papryka wędzona', 'Chili w proszku', 'Czosnek granulowany', 'Imbir mielony', 'Kmin rzymski', 'Garam masala',
  'Kardamon', 'Czarnuszka',
]);

const SECTIONS = [
  { pattern: /^PRZYKŁADOWE ŚNIADANIA/, group: 'Śniadania', emoji: '🍳' },
  { pattern: /^PRZYKŁADOWE DRUGIE ŚNIADANIA/, group: 'Drugie śniadania', emoji: '🥪' },
  { pattern: /^PRZYKŁADOWE OBIADY/, group: 'Obiady', emoji: '🍲' },
  { pattern: /^PRZYKŁADOWE KOLACJE/, group: 'Kolacje', emoji: '🥗' },
  { pattern: /^Podwieczorki\s*$/i, group: 'Podwieczorki', emoji: '🍰' },
  { pattern: /^Dodatkowo w dniach/, group: 'Po treningu', emoji: '🥞' },
];
const END = /^Uwagi końcowe/;
/** Free text between recipes (the daily fruit list); nothing after it belongs to the recipe above. */
const NOT_A_RECIPE = /^Jako „piąty posiłek”/;
const KCAL = /^\(?\s*(\d+)\s*kcal\s*\)?\s*$/i;
const METHOD_HEADER = /^sposób\s+(przygotowania|wykonania)\s*:?\s*$/i;
/** "Składniki:", "Składniki na dwie porcje:" */
const INGREDIENTS_HEADER = /^składniki\b.{0,30}$/i;

const UNIT_WORDS = [
  [/^(g|gr|gram\w*)$/i, 'g'],
  [/^kg$/i, 'kg'],
  [/^ml$/i, 'ml'],
  [/^l$/i, 'l'],
  [/^łyżecz\w*$/i, 'lyzeczka'],
  [/^łyż\w*$/i, 'lyzka'],
  [/^szklan\w*$/i, 'szklanka'],
  [/^(szt\w*|ząb\w*|liś\w*|plast\w*|kromk\w*|garś\w*|szczypt\w*|pęcz\w*)\.?$/i, 'szt'],
];
const UNIT = '(g|gr|gram\\w*|kg|ml|l|łyżecz\\w*|łyż\\w*|szklan\\w*|szt\\w*|ząb\\w*|liś\\w*|plast\\w*|kromk\\w*)';
const NUMBER = '(\\d+(?:[.,]\\d+)?)';
/** "200g Jaja kurze, całe" */
// the unit is sometimes glued to the name ("250 mlBulion"), so a capital letter may follow directly
const QUANTITY_FIRST = new RegExp(`^${NUMBER}\\s*${UNIT}\\.?(?:\\s+|(?=[A-ZĄĆĘŁŃÓŚŹŻ]))(.+)$`);
/** "Ser twarogowy chudy-120g", "Czosnek- 3 ząbki", "jabłko: 200 g" */
const QUANTITY_LAST = new RegExp(`^(.+?)\\s*[-–:]\\s*${NUMBER}\\s*${UNIT}\\b`, 'i');
/** "Czosnek 2 ząbki", "Musztarda 0,5 łyżeczki" */
const QUANTITY_TRAILING = new RegExp(`^(\\p{L}.*?)\\s+${NUMBER}\\s*${UNIT}$`, 'iu');

function toUnit(word) {
  return UNIT_WORDS.find(([pattern]) => pattern.test(word))?.[1] ?? 'szt';
}

function parseIngredient(line) {
  const text = line.replace(/\s+/g, ' ').trim().replace(/[.,;]+$/, '');
  let match = text.match(QUANTITY_FIRST);
  if (match) return { raw: match[3], quantity: Number(match[1].replace(',', '.')), unit: toUnit(match[2]) };
  match = text.match(QUANTITY_LAST);
  if (match) return { raw: match[1], quantity: Number(match[2].replace(',', '.')), unit: toUnit(match[3]) };
  match = text.match(QUANTITY_TRAILING);
  if (match) return { raw: match[1], quantity: Number(match[2].replace(',', '.')), unit: toUnit(match[3]) };
  // "4 suszone pomidory", "1/2 cytryny", "120 banan": a bare number is pieces, or grams when it is large
  match = text.match(/^(\d+(?:[.,]\d+)?)(?:\/(\d+))?\s+(\p{L}.+)$/u);
  if (match) {
    const quantity = Number(match[1].replace(',', '.')) / (match[2] ? Number(match[2]) : 1);
    return { raw: match[3], quantity, unit: quantity >= 20 ? 'g' : 'szt' };
  }
  // no measurable amount ("garść rukoli", "szczypta soli", "sałata-dwa liście"): one piece
  return { raw: text.split(/\s*[-–:]\s*/)[0], quantity: 1, unit: 'szt' };
}

const looksLikeIngredient = (line) =>
  line.length < 70 && (QUANTITY_FIRST.test(line.trim()) || QUANTITY_LAST.test(line.trim()));

const tidyTitle = (line) => {
  const text = line.replace(/[^\p{L}\p{N}\p{P}\p{Zs}]/gu, '').replace(/\s+/g, ' ').trim().replace(/[.:]+$/, '').trim();
  const upper = text === text.toUpperCase();
  return upper ? text[0] + text.slice(1).toLowerCase() : text;
};

function parsePlan(text) {
  const lines = text.split('\n').map((l) => l.replace(/ /g, ' ').trimEnd());
  const recipes = [];
  let group = null;
  let current = null;
  let ignoring = false;

  const kcalAhead = (from) => {
    for (let i = from + 1; i < lines.length && i <= from + 3; i++) {
      if (lines[i].trim()) return KCAL.test(lines[i].trim());
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (END.test(line)) break;
    const section = SECTIONS.find((s) => s.pattern.test(line));
    if (section) {
      group = section;
      current = null;
      continue;
    }
    if (!group) continue;
    if (NOT_A_RECIPE.test(line)) {
      ignoring = true;
      current = null;
      continue;
    }
    if (kcalAhead(i)) {
      ignoring = false;
      current = { title: tidyTitle(line), group: group.group, kcal: null, method: [], ingredients: [], inIngredients: false };
      recipes.push(current);
      continue;
    }
    if (!current || ignoring) continue;
    const kcal = line.match(KCAL);
    if (kcal) {
      current.kcal = Number(kcal[1]);
      continue;
    }
    if (METHOD_HEADER.test(line)) continue;
    if (INGREDIENTS_HEADER.test(line)) {
      current.inIngredients = true;
      continue;
    }
    if (!current.inIngredients && looksLikeIngredient(line)) current.inIngredients = true;
    if (!current.inIngredients) {
      current.method.push(line.replace(/\s+/g, ' '));
      continue;
    }
    // sub-headings inside an ingredient list ("Surówka z marchewki:"), alternatives and stray headings
    if (/:$/.test(line) || /^lub$/i.test(line) || /^\(/.test(line) || (line.length > 12 && line === line.toUpperCase())) continue;
    if (line.length >= 70) {
      current.method.push(line.replace(/\s+/g, ' '));
      continue;
    }
    current.ingredients.push(parseIngredient(line));
  }
  return recipes;
}

function readDoc(path) {
  return execFileSync('textutil', ['-convert', 'txt', '-stdout', path], { encoding: 'utf8' });
}

// ---- main ----
const args = process.argv.slice(2);
const rawNames = args.includes('--raw-names');
const outIndex = args.indexOf('--out');
const out = outIndex >= 0 ? args[outIndex + 1] : null;
const files = args.filter((a, i) => !a.startsWith('--') && i !== outIndex + 1);
if (files.length === 0 || (!out && !rawNames)) {
  console.error('Usage: node scripts/import-meal-plans.mjs --out recipes.json plan1.doc [plan2.doc ...]');
  process.exit(1);
}

const byTitle = new Map();
let overwritten = 0;
for (const file of files) {
  for (const recipe of parsePlan(readDoc(file))) {
    const key = recipe.title.toLowerCase();
    if (byTitle.has(key)) overwritten++;
    byTitle.set(key, recipe);
  }
}

const unknown = new Map();
const recipes = [...byTitle.values()].map((recipe) => {
  // the same product listed twice in a recipe is added up when the unit matches
  const merged = new Map();
  for (const ing of recipe.ingredients) {
    const key = ing.raw.toLowerCase().replace(/\s+/g, ' ').trim();
    const entry = DICTIONARY[key];
    if (entry === null) continue;
    if (entry === undefined) unknown.set(key, (unknown.get(key) ?? 0) + 1);
    const [name, department] = entry ?? [ing.raw.trim(), 'other'];
    if (SPICES.has(name)) {
      merged.set(name, { name, quantity: 1, unit: 'szt', department });
      continue;
    }
    const id = `${name}|${ing.unit}`;
    const existing = merged.get(id);
    if (existing) existing.quantity += ing.quantity;
    else merged.set(id, { name, quantity: ing.quantity, unit: ing.unit, department });
  }
  const description = [recipe.kcal ? `${recipe.kcal} kcal` : null, recipe.method.join('\n')].filter(Boolean).join('\n\n');
  return { title: recipe.title, group: recipe.group, description, ingredients: [...merged.values()] };
});

if (rawNames) {
  [...unknown.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pl')).forEach(([name, count]) => console.log(`${count}\t${name}`));
  process.exit(0);
}

const groups = SECTIONS.filter((s) => recipes.some((r) => r.group === s.group)).map((s) => ({ name: s.group, emoji: s.emoji }));
writeFileSync(out, JSON.stringify({ format: 'shopping-list-recipes', version: 1, groups, recipes }, null, 2));

console.log(`${recipes.length} recipes written to ${out} (${overwritten} repeated recipes overwritten)`);
for (const g of groups) console.log(`  ${g.name}: ${recipes.filter((r) => r.group === g.name).length}`);
const empty = recipes.filter((r) => r.ingredients.length === 0).map((r) => r.title);
if (empty.length) console.log(`No ingredients found for: ${empty.join('; ')}`);
if (unknown.size) console.log(`${unknown.size} ingredient names are not in meal-plan-products.json (run with --raw-names to list them)`);
