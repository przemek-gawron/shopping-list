import { ShoppingListItem } from '@/types';
import { t } from '@/i18n';
import { ApiKeyError, ApiError } from '@/services/ai-errors';
import { backendPost } from '@/services/backend-client';

export { ApiKeyError, ApiError };

export interface ProductGroup {
  name: string;
  emoji: string;
  items: string[];
}

export async function groupShoppingItems(productNames: string[]): Promise<ProductGroup[]> {
  const { groups } = await backendPost<{ groups: ProductGroup[] }>('/api/shopping-list/group', {
    productNames,
    categoryDescription: t('ai_grouper_category_description'),
    instruction: t('ai_grouper_instruction', { items: productNames.join('\n') }),
  });

  if (!Array.isArray(groups)) {
    throw new Error('Claude did not return groups');
  }

  return groups;
}

export function applyGroupsToItems(
  groups: ProductGroup[],
  allItems: ShoppingListItem[]
): { name: string; emoji: string; data: ShoppingListItem[] }[] {
  const unchecked = allItems.filter((i) => !i.checked);
  const checked = allItems.filter((i) => i.checked);

  const assigned = new Set<string>();

  const sections = groups
    .map((group) => {
      const data = group.items
        .map((name) =>
          unchecked.find((i) => i.productName.toLowerCase() === name.toLowerCase())
        )
        .filter((i): i is ShoppingListItem => i !== undefined);

      data.forEach((i) => assigned.add(i.productId));
      return { name: group.name, emoji: group.emoji, data };
    })
    .filter((s) => s.data.length > 0);

  // Any unchecked items not matched by AI fall into the fallback group
  const fallbackName = t('ai_grouper_other');
  const unmatched = unchecked.filter((i) => !assigned.has(i.productId));
  if (unmatched.length > 0) {
    const fallback = sections.find((s) => s.name === fallbackName);
    if (fallback) {
      fallback.data.push(...unmatched);
    } else {
      sections.push({ name: fallbackName, emoji: '📋', data: unmatched });
    }
  }

  // Checked items go to a separate section at the bottom
  if (checked.length > 0) {
    sections.push({ name: t('ai_grouper_checked'), emoji: '✅', data: checked });
  }

  return sections;
}
