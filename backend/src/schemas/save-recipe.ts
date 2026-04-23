export function buildSaveRecipeTool(languageName: string) {
  return {
    name: 'save_recipe',
    description: 'Save the extracted recipe data',
    input_schema: {
      type: 'object' as const,
      required: ['title', 'ingredients'],
      properties: {
        title: {
          type: 'string',
          description: `Recipe title in ${languageName}`,
        },
        description: {
          type: 'string',
          description: 'Brief description or notes (optional)',
        },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'quantity', 'unit'],
            properties: {
              name: {
                type: 'string',
                description: `Ingredient name in ${languageName}, lowercase`,
              },
              quantity: {
                type: 'number',
                description: 'Numeric quantity',
              },
              unit: {
                type: 'string',
                description: 'Unit: g, kg, ml, l, szt, lyzka, lyzeczka, or szklanka',
              },
            },
          },
        },
      },
    },
  };
}
