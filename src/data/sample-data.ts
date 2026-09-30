import type { DepartmentId, Group, Product, Recipe, Unit } from '@/data/types';

type Lang = 'pl' | 'en';

/** [pl name, en name, default unit, department] */
type ProductDef = [string, string, Unit, DepartmentId];

const PRODUCTS: Record<string, ProductDef> = {
  onion: ['Cebula', 'Onion', 'szt', 'produce'],
  garlic: ['Czosnek (ząbek)', 'Garlic clove', 'szt', 'produce'],
  tomato: ['Pomidor', 'Tomato', 'szt', 'produce'],
  cucumber: ['Ogórek', 'Cucumber', 'szt', 'produce'],
  carrot: ['Marchew', 'Carrot', 'szt', 'produce'],
  potato: ['Ziemniaki', 'Potatoes', 'kg', 'produce'],
  pepper: ['Papryka', 'Bell pepper', 'szt', 'produce'],
  broccoli: ['Brokuł', 'Broccoli', 'szt', 'produce'],
  spinach: ['Szpinak', 'Spinach', 'g', 'produce'],
  lettuce: ['Sałata', 'Lettuce', 'szt', 'produce'],
  banana: ['Banan', 'Banana', 'szt', 'produce'],
  apple: ['Jabłko', 'Apple', 'szt', 'produce'],
  lemon: ['Cytryna', 'Lemon', 'szt', 'produce'],
  avocado: ['Awokado', 'Avocado', 'szt', 'produce'],
  mushrooms: ['Pieczarki', 'Mushrooms', 'g', 'produce'],
  zucchini: ['Cukinia', 'Zucchini', 'szt', 'produce'],
  strawberries: ['Truskawki', 'Strawberries', 'g', 'produce'],
  berries: ['Owoce leśne', 'Mixed berries', 'g', 'produce'],
  parsley: ['Natka pietruszki', 'Parsley', 'szt', 'produce'],
  milk: ['Mleko', 'Milk', 'l', 'dairy'],
  butter: ['Masło', 'Butter', 'g', 'dairy'],
  eggs: ['Jajka', 'Eggs', 'szt', 'dairy'],
  yogurt: ['Jogurt naturalny', 'Plain yogurt', 'g', 'dairy'],
  cheese: ['Ser żółty', 'Cheddar cheese', 'g', 'dairy'],
  mozzarella: ['Mozzarella', 'Mozzarella', 'g', 'dairy'],
  cottage: ['Twaróg', 'Cottage cheese', 'g', 'dairy'],
  cream: ['Śmietana 18%', 'Cream', 'ml', 'dairy'],
  feta: ['Feta', 'Feta', 'g', 'dairy'],
  parmesan: ['Parmezan', 'Parmesan', 'g', 'dairy'],
  chicken: ['Pierś z kurczaka', 'Chicken breast', 'g', 'meat'],
  minced: ['Mięso mielone', 'Minced beef', 'g', 'meat'],
  ham: ['Szynka', 'Ham', 'g', 'meat'],
  salmon: ['Łosoś', 'Salmon', 'g', 'meat'],
  bread: ['Chleb (kromki)', 'Bread (slices)', 'szt', 'bakery'],
  tortilla: ['Tortilla', 'Tortilla', 'szt', 'bakery'],
  oats: ['Płatki owsiane', 'Rolled oats', 'g', 'dry'],
  flour: ['Mąka pszenna', 'Flour', 'g', 'dry'],
  sugar: ['Cukier', 'Sugar', 'g', 'dry'],
  rice: ['Ryż', 'Rice', 'g', 'dry'],
  pasta: ['Makaron', 'Pasta', 'g', 'dry'],
  olive_oil: ['Oliwa z oliwek', 'Olive oil', 'lyzka', 'dry'],
  oil: ['Olej', 'Oil', 'lyzka', 'dry'],
  honey: ['Miód', 'Honey', 'lyzka', 'dry'],
  cocoa: ['Kakao', 'Cocoa', 'lyzeczka', 'dry'],
  baking_powder: ['Proszek do pieczenia', 'Baking powder', 'lyzeczka', 'dry'],
  passata: ['Passata pomidorowa', 'Tomato passata', 'ml', 'dry'],
  tomato_paste: ['Koncentrat pomidorowy', 'Tomato paste', 'lyzka', 'dry'],
  chickpeas: ['Ciecierzyca (puszka)', 'Chickpeas (can)', 'szt', 'dry'],
  peanut_butter: ['Masło orzechowe', 'Peanut butter', 'lyzka', 'dry'],
  chocolate: ['Czekolada', 'Chocolate', 'g', 'dry'],
  nuts: ['Orzechy', 'Nuts', 'g', 'dry'],
  soy_sauce: ['Sos sojowy', 'Soy sauce', 'lyzka', 'dry'],
  stock: ['Kostka rosołowa', 'Stock cube', 'szt', 'dry'],
  tuna: ['Tuńczyk (puszka)', 'Tuna (can)', 'szt', 'dry'],
  chia: ['Nasiona chia', 'Chia seeds', 'lyzka', 'dry'],
  bread_crumbs: ['Bułka tarta', 'Bread crumbs', 'g', 'dry'],
  jam: ['Dżem', 'Jam', 'lyzka', 'dry'],
  cinnamon: ['Cynamon', 'Cinnamon', 'lyzeczka', 'dry'],
  paprika_powder: ['Papryka słodka mielona', 'Sweet paprika', 'lyzeczka', 'dry'],
  basil: ['Bazylia suszona', 'Dried basil', 'lyzeczka', 'dry'],
  lentils: ['Soczewica', 'Lentils', 'g', 'dry'],
  coconut_milk: ['Mleczko kokosowe', 'Coconut milk', 'ml', 'dry'],
  curry: ['Curry', 'Curry powder', 'lyzeczka', 'dry'],
};

const GROUPS: { key: string; emoji: string; pl: string; en: string }[] = [
  { key: 'breakfast', emoji: '🍳', pl: 'Śniadania', en: 'Breakfasts' },
  { key: 'lunch', emoji: '🍲', pl: 'Obiady', en: 'Lunches' },
  { key: 'dinner', emoji: '🥗', pl: 'Kolacje', en: 'Dinners' },
  { key: 'dessert', emoji: '🍰', pl: 'Desery', en: 'Desserts' },
];

type Ing = [product: string, quantity: number, unit: Unit];
type RecipeDef = { group: string; pl: string; en: string; ing: Ing[] };

const RECIPES: RecipeDef[] = [
  // Breakfasts
  { group: 'breakfast', pl: 'Owsianka z bananem', en: 'Banana oatmeal', ing: [['oats', 60, 'g'], ['milk', 250, 'ml'], ['banana', 1, 'szt'], ['honey', 1, 'lyzka'], ['cinnamon', 0.5, 'lyzeczka']] },
  { group: 'breakfast', pl: 'Jajecznica na maśle', en: 'Buttery scrambled eggs', ing: [['eggs', 3, 'szt'], ['butter', 10, 'g'], ['bread', 2, 'szt'], ['tomato', 1, 'szt']] },
  { group: 'breakfast', pl: 'Naleśniki z twarogiem', en: 'Pancakes with cottage cheese', ing: [['flour', 150, 'g'], ['milk', 250, 'ml'], ['eggs', 2, 'szt'], ['cottage', 200, 'g'], ['sugar', 20, 'g'], ['oil', 1, 'lyzka']] },
  { group: 'breakfast', pl: 'Jogurt z owocami i orzechami', en: 'Yogurt with berries and nuts', ing: [['yogurt', 200, 'g'], ['berries', 100, 'g'], ['nuts', 20, 'g'], ['honey', 1, 'lyzka']] },
  { group: 'breakfast', pl: 'Kanapki z szynką i serem', en: 'Ham and cheese sandwiches', ing: [['bread', 4, 'szt'], ['ham', 80, 'g'], ['cheese', 60, 'g'], ['tomato', 1, 'szt'], ['butter', 10, 'g']] },
  { group: 'breakfast', pl: 'Tosty z awokado i jajkiem', en: 'Avocado egg toast', ing: [['bread', 2, 'szt'], ['avocado', 1, 'szt'], ['eggs', 2, 'szt'], ['lemon', 0.5, 'szt']] },
  { group: 'breakfast', pl: 'Omlet ze szpinakiem i fetą', en: 'Spinach and feta omelette', ing: [['eggs', 3, 'szt'], ['spinach', 50, 'g'], ['feta', 50, 'g'], ['butter', 10, 'g']] },
  { group: 'breakfast', pl: 'Placuszki bananowe', en: 'Banana pancakes', ing: [['banana', 2, 'szt'], ['eggs', 2, 'szt'], ['flour', 60, 'g'], ['oil', 1, 'lyzka']] },
  { group: 'breakfast', pl: 'Owsianka czekoladowa', en: 'Chocolate porridge', ing: [['oats', 60, 'g'], ['milk', 250, 'ml'], ['cocoa', 2, 'lyzeczka'], ['peanut_butter', 1, 'lyzka'], ['honey', 1, 'lyzka']] },

  // Lunches
  { group: 'lunch', pl: 'Spaghetti bolognese', en: 'Spaghetti bolognese', ing: [['pasta', 200, 'g'], ['minced', 250, 'g'], ['onion', 1, 'szt'], ['garlic', 2, 'szt'], ['passata', 400, 'ml'], ['tomato_paste', 1, 'lyzka'], ['olive_oil', 1, 'lyzka'], ['parmesan', 30, 'g']] },
  { group: 'lunch', pl: 'Zupa pomidorowa z ryżem', en: 'Tomato soup with rice', ing: [['passata', 500, 'ml'], ['rice', 80, 'g'], ['carrot', 1, 'szt'], ['onion', 1, 'szt'], ['stock', 1, 'szt'], ['cream', 100, 'ml'], ['butter', 10, 'g']] },
  { group: 'lunch', pl: 'Kurczak z ryżem i brokułem', en: 'Chicken with rice and broccoli', ing: [['chicken', 300, 'g'], ['rice', 150, 'g'], ['broccoli', 1, 'szt'], ['garlic', 2, 'szt'], ['soy_sauce', 2, 'lyzka'], ['oil', 1, 'lyzka']] },
  { group: 'lunch', pl: 'Kotlety mielone z ziemniakami', en: 'Meat patties with potatoes', ing: [['minced', 400, 'g'], ['potato', 0.8, 'kg'], ['onion', 1, 'szt'], ['eggs', 1, 'szt'], ['bread_crumbs', 40, 'g'], ['oil', 2, 'lyzka']] },
  { group: 'lunch', pl: 'Curry z ciecierzycy', en: 'Chickpea curry', ing: [['chickpeas', 2, 'szt'], ['coconut_milk', 200, 'ml'], ['passata', 300, 'ml'], ['onion', 1, 'szt'], ['garlic', 2, 'szt'], ['curry', 2, 'lyzeczka'], ['rice', 150, 'g'], ['oil', 1, 'lyzka']] },
  { group: 'lunch', pl: 'Zapiekanka makaronowa z mozzarellą', en: 'Mozzarella pasta bake', ing: [['pasta', 250, 'g'], ['passata', 400, 'ml'], ['mozzarella', 125, 'g'], ['garlic', 2, 'szt'], ['basil', 1, 'lyzeczka'], ['olive_oil', 1, 'lyzka']] },
  { group: 'lunch', pl: 'Łosoś z pieczonymi warzywami', en: 'Salmon with roasted vegetables', ing: [['salmon', 300, 'g'], ['potato', 0.5, 'kg'], ['zucchini', 1, 'szt'], ['pepper', 1, 'szt'], ['olive_oil', 2, 'lyzka'], ['lemon', 1, 'szt']] },
  { group: 'lunch', pl: 'Krem z brokułów', en: 'Broccoli cream soup', ing: [['broccoli', 1, 'szt'], ['potato', 0.3, 'kg'], ['onion', 1, 'szt'], ['stock', 1, 'szt'], ['cream', 100, 'ml'], ['butter', 10, 'g']] },
  { group: 'lunch', pl: 'Placki ziemniaczane', en: 'Potato pancakes', ing: [['potato', 1, 'kg'], ['onion', 1, 'szt'], ['eggs', 1, 'szt'], ['flour', 40, 'g'], ['oil', 3, 'lyzka'], ['cream', 100, 'ml']] },

  // Dinners
  { group: 'dinner', pl: 'Sałatka grecka', en: 'Greek salad', ing: [['tomato', 3, 'szt'], ['cucumber', 1, 'szt'], ['pepper', 1, 'szt'], ['onion', 0.5, 'szt'], ['feta', 100, 'g'], ['olive_oil', 2, 'lyzka']] },
  { group: 'dinner', pl: 'Tortilla z kurczakiem', en: 'Chicken wrap', ing: [['tortilla', 2, 'szt'], ['chicken', 200, 'g'], ['lettuce', 0.5, 'szt'], ['tomato', 1, 'szt'], ['yogurt', 60, 'g']] },
  { group: 'dinner', pl: 'Kanapki z tuńczykiem', en: 'Tuna sandwiches', ing: [['bread', 4, 'szt'], ['tuna', 1, 'szt'], ['cucumber', 1, 'szt'], ['yogurt', 50, 'g']] },
  { group: 'dinner', pl: 'Zupa z soczewicy', en: 'Lentil soup', ing: [['lentils', 150, 'g'], ['carrot', 2, 'szt'], ['onion', 1, 'szt'], ['garlic', 2, 'szt'], ['passata', 200, 'ml'], ['stock', 1, 'szt'], ['olive_oil', 1, 'lyzka']] },
  { group: 'dinner', pl: 'Pizza na tortilli', en: 'Tortilla pizza', ing: [['tortilla', 2, 'szt'], ['passata', 100, 'ml'], ['mozzarella', 125, 'g'], ['ham', 60, 'g'], ['mushrooms', 80, 'g'], ['basil', 0.5, 'lyzeczka']] },
  { group: 'dinner', pl: 'Szakszuka', en: 'Shakshuka', ing: [['eggs', 4, 'szt'], ['passata', 400, 'ml'], ['pepper', 1, 'szt'], ['onion', 1, 'szt'], ['garlic', 2, 'szt'], ['paprika_powder', 1, 'lyzeczka']] },
  { group: 'dinner', pl: 'Sałatka z kurczakiem i awokado', en: 'Chicken avocado salad', ing: [['chicken', 200, 'g'], ['avocado', 1, 'szt'], ['lettuce', 1, 'szt'], ['tomato', 2, 'szt'], ['lemon', 0.5, 'szt'], ['olive_oil', 1, 'lyzka']] },
  { group: 'dinner', pl: 'Makaron ze szpinakiem w śmietanie', en: 'Creamy spinach pasta', ing: [['pasta', 200, 'g'], ['spinach', 150, 'g'], ['cream', 150, 'ml'], ['garlic', 2, 'szt'], ['parmesan', 30, 'g']] },
  { group: 'dinner', pl: 'Omlet z pieczarkami', en: 'Mushroom omelette', ing: [['eggs', 3, 'szt'], ['mushrooms', 100, 'g'], ['butter', 10, 'g'], ['cheese', 40, 'g'], ['parsley', 0.25, 'szt']] },

  // Desserts
  { group: 'dessert', pl: 'Naleśniki z dżemem', en: 'Pancakes with jam', ing: [['flour', 150, 'g'], ['milk', 250, 'ml'], ['eggs', 2, 'szt'], ['jam', 3, 'lyzka'], ['oil', 1, 'lyzka']] },
  { group: 'dessert', pl: 'Brownie', en: 'Brownie', ing: [['chocolate', 150, 'g'], ['butter', 100, 'g'], ['sugar', 120, 'g'], ['eggs', 3, 'szt'], ['flour', 60, 'g'], ['cocoa', 2, 'lyzeczka']] },
  { group: 'dessert', pl: 'Szarlotka', en: 'Apple pie', ing: [['apple', 5, 'szt'], ['flour', 300, 'g'], ['butter', 150, 'g'], ['sugar', 100, 'g'], ['eggs', 1, 'szt'], ['cinnamon', 2, 'lyzeczka'], ['baking_powder', 1, 'lyzeczka']] },
  { group: 'dessert', pl: 'Ciasteczka owsiane', en: 'Oat cookies', ing: [['oats', 150, 'g'], ['flour', 100, 'g'], ['butter', 100, 'g'], ['sugar', 80, 'g'], ['eggs', 1, 'szt'], ['baking_powder', 1, 'lyzeczka'], ['chocolate', 50, 'g']] },
  { group: 'dessert', pl: 'Pudding chia', en: 'Chia pudding', ing: [['chia', 3, 'lyzka'], ['milk', 200, 'ml'], ['honey', 1, 'lyzka'], ['berries', 80, 'g']] },
  { group: 'dessert', pl: 'Sałatka owocowa', en: 'Fruit salad', ing: [['apple', 2, 'szt'], ['banana', 2, 'szt'], ['strawberries', 150, 'g'], ['lemon', 0.5, 'szt'], ['honey', 1, 'lyzka']] },
  { group: 'dessert', pl: 'Lody bananowe', en: 'Banana ice cream', ing: [['banana', 3, 'szt'], ['peanut_butter', 1, 'lyzka'], ['cocoa', 1, 'lyzeczka']] },
  { group: 'dessert', pl: 'Muffinki z owocami leśnymi', en: 'Berry muffins', ing: [['flour', 250, 'g'], ['sugar', 100, 'g'], ['butter', 80, 'g'], ['eggs', 2, 'szt'], ['milk', 150, 'ml'], ['berries', 150, 'g'], ['baking_powder', 2, 'lyzeczka']] },
  { group: 'dessert', pl: 'Ryż na mleku z jabłkiem', en: 'Rice pudding with apple', ing: [['rice', 100, 'g'], ['milk', 500, 'ml'], ['apple', 1, 'szt'], ['sugar', 20, 'g'], ['cinnamon', 1, 'lyzeczka']] },
];

/**
 * Example groups, products and recipes in the chosen language. Ids are fixed, so loading the
 * samples twice does not create duplicates.
 */
export function buildSamples(language: Lang): {
  groups: Group[];
  products: Product[];
  recipes: Recipe[];
} {
  const groups: Group[] = GROUPS.map((g) => ({
    id: `sample-g-${g.key}`,
    name: g[language],
    emoji: g.emoji,
  }));

  const products: Product[] = Object.entries(PRODUCTS).map(([key, [pl, en, unit, dept]]) => ({
    id: `sample-p-${key}`,
    name: language === 'pl' ? pl : en,
    defaultUnit: unit,
    departmentId: dept,
  }));

  const counters: Record<string, number> = {};
  const recipes: Recipe[] = RECIPES.map((r) => {
    counters[r.group] = (counters[r.group] ?? 0) + 1;
    const id = `sample-r-${r.group}-${counters[r.group]}`;
    return {
      id,
      title: r[language],
      groupId: `sample-g-${r.group}`,
      ingredients: r.ing.map(([product, quantity, unit], index) => ({
        id: `${id}-i${index}`,
        productId: `sample-p-${product}`,
        quantity,
        unit,
      })),
    };
  });

  return { groups, products, recipes };
}
