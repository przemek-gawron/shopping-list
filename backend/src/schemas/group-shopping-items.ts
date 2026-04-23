export function buildGroupItemsTool(categoryDescription: string) {
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
                description: categoryDescription,
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
