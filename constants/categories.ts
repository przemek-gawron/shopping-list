import { Category } from '@/types';

export const UNCATEGORIZED_CATEGORY_ID = 'cat-inne';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-sniadania', name: 'Śniadania', emoji: '🍳', sortOrder: 0 },
  { id: 'cat-drugie-sniadania', name: 'Drugie śniadania', emoji: '🥪', sortOrder: 1 },
  { id: 'cat-obiady', name: 'Obiady', emoji: '🍲', sortOrder: 2 },
  { id: 'cat-podwieczorki', name: 'Podwieczorki', emoji: '🍰', sortOrder: 3 },
  { id: 'cat-kolacje', name: 'Kolacje', emoji: '🥗', sortOrder: 4 },
];

export const UNCATEGORIZED_CATEGORY: Category = {
  id: UNCATEGORIZED_CATEGORY_ID,
  name: 'Inne',
  emoji: '📋',
  sortOrder: 99,
};

export const ALL_DEFAULT_CATEGORIES: Category[] = [...DEFAULT_CATEGORIES, UNCATEGORIZED_CATEGORY];
