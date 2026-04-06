import { ShoppingListItem } from '@/types';
import { t } from '@/i18n';
import { ApiKeyError, ApiError } from './claude-recipe-importer';

export { ApiKeyError, ApiError };

function buildGroupItemsTool() {
  return {
    name: 'group_shopping_items',
    description: 'Group shopping list items into logical food categories',
    input_schema: {
      type: 'object' as const,
      required: ['groups'],
      properties: {
        groups: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'emoji', 'items'],
            properties: {
              name: {
                type: 'string',
                description: t('ai_grouper_category_description'),
              },
              emoji: {
                type: 'string',
                description: 'A single emoji representing the category',
              },
              items: {
                type: 'array',
                items: { type: 'string' },
                description: 'Product names that belong to this category (exact names from input)',
              },
            },
          },
        },
      },
    },
  };
}

export interface ProductGroup {
  name: string;
  emoji: string;
  items: string[];
}

export async function groupShoppingItems(
  productNames: string[],
  apiKey: string
): Promise<ProductGroup[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [buildGroupItemsTool()],
      tool_choice: { type: 'tool', name: 'group_shopping_items' },
      messages: [
        {
          role: 'user',
          content: t('ai_grouper_instruction', { items: productNames.join('\n') }),
        },
      ],
    }),
  });

  if (response.status === 401) throw new ApiKeyError();
  if (!response.ok) throw new ApiError(response.status, `API error: ${response.status}`);

  const data = await response.json();
  const toolUse = data.content?.find((c: { type: string }) => c.type === 'tool_use');

  if (!toolUse?.input?.groups) {
    throw new Error('Claude did not return groups');
  }

  return toolUse.input.groups as ProductGroup[];
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
