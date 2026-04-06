import { Category } from '@/types';
import { t } from '@/i18n';

export const UNCATEGORIZED_CATEGORY_ID = 'cat-inne';

export function getDefaultCategories(): Category[] {
  return [
    { id: 'cat-sniadania', name: t('default_category_breakfasts'), emoji: '🍳', sortOrder: 0 },
    { id: 'cat-drugie-sniadania', name: t('default_category_second_breakfasts'), emoji: '🥪', sortOrder: 1 },
    { id: 'cat-obiady', name: t('default_category_lunches'), emoji: '🍲', sortOrder: 2 },
    { id: 'cat-podwieczorki', name: t('default_category_snacks'), emoji: '🍰', sortOrder: 3 },
    { id: 'cat-kolacje', name: t('default_category_dinners'), emoji: '🥗', sortOrder: 4 },
  ];
}

export function getUncategorizedCategory(): Category {
  return {
    id: UNCATEGORIZED_CATEGORY_ID,
    name: t('default_category_other'),
    emoji: '📋',
    sortOrder: 99,
  };
}

export function getAllDefaultCategories(): Category[] {
  return [...getDefaultCategories(), getUncategorizedCategory()];
}
