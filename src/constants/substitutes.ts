import type { SubstituteGroup } from '@/data/types';

const each = (products: string[], quantity: number, unit: 'g' | 'ml' = 'g') => products.map((product) => ({ product, quantity, unit }));

/**
 * Substitutes from the dietitian's notes (newer plans): one slice of wholegrain bread (30 g) equals
 * 20 g of groats, rice or wholegrain pasta, or 80 g of potatoes; poultry, lean fish, oily fish and
 * the two oils swap 1:1. Names match the products created by the meal-plan import. Editable in Settings.
 */
export const DEFAULT_SUBSTITUTES: SubstituteGroup[] = [
  {
    id: 'carbs',
    name: 'Pieczywo, kasze, ryż, makaron, ziemniaki',
    items: [
      ...each(['Chleb pełnoziarnisty'], 30),
      ...each(
        ['Kasza jaglana', 'Kasza gryczana', 'Kasza bulgur', 'Kasza jęczmienna', 'Kasza kuskus', 'Komosa ryżowa', 'Ryż basmati', 'Ryż brązowy'],
        20,
      ),
      ...each(['Makaron pełnoziarnisty'], 20),
      ...each(['Ziemniaki', 'Batat'], 80),
    ],
  },
  { id: 'poultry', name: 'Drób', items: each(['Pierś z kurczaka', 'Filet z indyka'], 100) },
  { id: 'lean-fish', name: 'Ryby chude', items: each(['Dorsz', 'Mintaj', 'Pstrąg', 'Tuńczyk w sosie własnym'], 100) },
  { id: 'oily-fish', name: 'Ryby tłuste', items: each(['Łosoś', 'Makrela', 'Halibut'], 100) },
  { id: 'oils', name: 'Tłuszcze', items: each(['Oliwa z oliwek', 'Olej rzepakowy'], 10, 'ml') },
];
