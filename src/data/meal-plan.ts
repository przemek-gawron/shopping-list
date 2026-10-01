/**
 * Turns the text of a dietitian meal plan into recipes the app can import. Shared by the in-app
 * .doc import and `scripts/import-meal-plans.mjs`, so it must not import anything app-specific
 * (the script loads this file directly with Node).
 */
type Unit = 'g' | 'kg' | 'ml' | 'l' | 'szt' | 'lyzka' | 'lyzeczka' | 'szklanka';

interface RawIngredient {
  raw: string;
  quantity: number;
  unit: Unit;
}

interface RawRecipe {
  title: string;
  group: string;
  kcal: number | null;
  method: string[];
  ingredients: RawIngredient[];
  inIngredients: boolean;
}

export interface MealPlanRecipe {
  title: string;
  group: string;
  description: string;
  ingredients: { name: string; quantity: number; unit: Unit; department: string }[];
}

export interface MealPlanResult {
  groups: { name: string; emoji: string }[];
  recipes: MealPlanRecipe[];
  /** Ingredient names (lower case) missing from the dictionary; imported as written, in "other". */
  unknown: string[];
}

export type ProductDictionary = Record<string, [name: string, department: string] | null>;

/** Spices are bought by the packet, so they go on the list as one piece whatever the recipe's amount. */
const SPICES = new Set([
  'Sól', 'Sól i pieprz', 'Pieprz czarny', 'Pieprz biały', 'Przyprawy', 'Oregano', 'Bazylia suszona', 'Tymianek',
  'Rozmaryn', 'Majeranek', 'Zioła prowansalskie', 'Curry', 'Kurkuma', 'Cynamon', 'Papryka słodka mielona',
  'Papryka wędzona', 'Chili w proszku', 'Czosnek granulowany', 'Imbir mielony', 'Kmin rzymski', 'Garam masala',
  'Kardamon', 'Czarnuszka',
]);

const SECTIONS: { pattern: RegExp; group: string; emoji: string }[] = [
  { pattern: /^PRZYKŁADOWE ŚNIADANIA/, group: 'Śniadania', emoji: '🍳' },
  { pattern: /^PRZYKŁADOWE DRUGIE ŚNIADANIA/, group: 'Drugie śniadania', emoji: '🥪' },
  { pattern: /^PRZYKŁADOWE OBIADY/, group: 'Obiady', emoji: '🍲' },
  { pattern: /^PRZYKŁADOWE KOLACJE/, group: 'Kolacje', emoji: '🥗' },
  { pattern: /^Podwieczorki\s*$/i, group: 'Podwieczorki', emoji: '🍰' },
  { pattern: /^Dodatkowo w dniach/, group: 'Po treningu', emoji: '🥞' },
];
const END = /^Uwagi końcowe/;
/**
 * The daily fruit list that some plans give instead of afternoon-snack recipes:
 * "Truskawki, maliny borówki, jagody: 450g / lub / banan-200g". Each fruit becomes a snack "recipe".
 */
const FRUIT_LIST = /^Jako „piąty posiłek”/;
const FRUIT_LINE = /^(.+?)\s*[:\-–]\s*(\d+)\s*g\b/i;
const FRUIT_NOTE = 'Owoce na podwieczorek z jadłospisu: w całości, jako koktajl, sałatka owocowa lub sorbet.';
const KCAL = /^\(?\s*(\d+)\s*kcal\s*\)?\s*$/i;
const METHOD_HEADER = /^sposób\s+(przygotowania|wykonania)\s*:?\s*$/i;
/** "Składniki:", "Składniki na dwie porcje:" */
const INGREDIENTS_HEADER = /^składniki\b.{0,30}$/i;

const UNIT_WORDS: [RegExp, Unit][] = [
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
// explicit letters instead of \p{L}: Unicode property escapes are not available on every JS engine
const LETTER = '[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]';
const BARE_NUMBER = new RegExp(`^(\\d+(?:[.,]\\d+)?)(?:\\/(\\d+))?\\s+(${LETTER}.+)$`);
/** "200g Jaja kurze, całe" */
// the unit is sometimes glued to the name ("250 mlBulion"), so a capital letter may follow directly
const QUANTITY_FIRST = new RegExp(`^${NUMBER}\\s*${UNIT}\\.?(?:\\s+|(?=[A-ZĄĆĘŁŃÓŚŹŻ]))(.+)$`);
/** "Ser twarogowy chudy-120g", "Czosnek- 3 ząbki", "jabłko: 200 g" */
const QUANTITY_LAST = new RegExp(`^(.+?)\\s*[-–:]\\s*${NUMBER}\\s*${UNIT}\\b`, 'i');
/** "Czosnek 2 ząbki", "Musztarda 0,5 łyżeczki" */
const QUANTITY_TRAILING = new RegExp(`^(${LETTER}.*?)\\s+${NUMBER}\\s*${UNIT}$`, 'i');

function toUnit(word: string): Unit {
  return UNIT_WORDS.find(([pattern]) => pattern.test(word))?.[1] ?? 'szt';
}

function parseIngredient(line: string): RawIngredient {
  const text = line.replace(/\s+/g, ' ').trim().replace(/[.,;]+$/, '');
  let match = text.match(QUANTITY_FIRST);
  if (match) return { raw: match[3], quantity: Number(match[1].replace(',', '.')), unit: toUnit(match[2]) };
  match = text.match(QUANTITY_LAST);
  if (match) return { raw: match[1], quantity: Number(match[2].replace(',', '.')), unit: toUnit(match[3]) };
  match = text.match(QUANTITY_TRAILING);
  if (match) return { raw: match[1], quantity: Number(match[2].replace(',', '.')), unit: toUnit(match[3]) };
  // "4 suszone pomidory", "1/2 cytryny", "120 banan": a bare number is pieces, or grams when it is large
  match = text.match(BARE_NUMBER);
  if (match) {
    const quantity = Number(match[1].replace(',', '.')) / (match[2] ? Number(match[2]) : 1);
    return { raw: match[3], quantity, unit: quantity >= 20 ? 'g' : 'szt' };
  }
  // no measurable amount ("garść rukoli", "szczypta soli", "sałata-dwa liście"): one piece
  return { raw: text.split(/\s*[-–:]\s*/)[0], quantity: 1, unit: 'szt' };
}

const looksLikeIngredient = (line: string) =>
  line.length < 70 && (QUANTITY_FIRST.test(line.trim()) || QUANTITY_LAST.test(line.trim()));

const tidyTitle = (line: string) => {
  const text = line.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\ufeff]/g, '').replace(/\s+/g, ' ').trim().replace(/[.:]+$/, '').trim();
  const upper = text === text.toUpperCase();
  return upper ? text[0] + text.slice(1).toLowerCase() : text;
};

function parseSections(text: string): RawRecipe[] {
  const lines = text.split('\n').map((l) => l.replace(/ /g, ' ').trimEnd());
  const recipes: RawRecipe[] = [];
  let group: (typeof SECTIONS)[number] | null = null;
  let current: RawRecipe | null = null;
  let inFruits = false;

  const kcalAhead = (from: number) => {
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
    if (FRUIT_LIST.test(line)) {
      inFruits = true;
      current = null;
      continue;
    }
    if (kcalAhead(i)) {
      inFruits = false;
      current = { title: tidyTitle(line), group: group.group, kcal: null, method: [], ingredients: [], inIngredients: false };
      recipes.push(current);
      continue;
    }
    if (inFruits) {
      const fruit = line.match(FRUIT_LINE);
      if (!fruit) continue;
      // fruit names are single words; the list does not always separate them with commas
      for (const name of fruit[1].split(/[,\s]+/).filter(Boolean)) {
        recipes.push({
          title: name[0].toUpperCase() + name.slice(1).toLowerCase(),
          group: 'Podwieczorki',
          kcal: null,
          method: [FRUIT_NOTE],
          ingredients: [{ raw: name.toLowerCase(), quantity: Number(fruit[2]), unit: 'g' }],
          inIngredients: true,
        });
      }
      continue;
    }
    if (!current) continue;
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

/**
 * Recipes of one meal plan. Ingredient names are unified through `dictionary`; the same product
 * listed twice in a recipe is added up, and spices become one piece.
 */
export function parseMealPlan(text: string, dictionary: ProductDictionary): MealPlanResult {
  const unknown = new Set<string>();
  const recipes = parseSections(text).map((recipe): MealPlanRecipe => {
    const merged = new Map<string, MealPlanRecipe['ingredients'][number]>();
    for (const ing of recipe.ingredients) {
      const key = ing.raw.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!key) continue;
      const entry = dictionary[key];
      if (entry === null) continue;
      if (entry === undefined) unknown.add(key);
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
  const groups = SECTIONS.filter((s) => recipes.some((r) => r.group === s.group)).map((s) => ({ name: s.group, emoji: s.emoji }));
  return { groups, recipes, unknown: [...unknown].sort() };
}
