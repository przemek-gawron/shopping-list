export function buildSaveMealPlanTool() {
  return {
    name: 'save_meal_plan',
    description: 'Save all extracted recipes from the meal plan',
    input_schema: {
      type: 'object' as const,
      required: ['recipes'],
      properties: {
        recipes: {
          type: 'array',
          items: {
            type: 'object',
            required: ['title', 'meal_type', 'ingredients'],
            properties: {
              title: { type: 'string', description: 'Recipe title in Polish' },
              description: { type: 'string', description: 'Brief description (optional)' },
              meal_type: {
                type: 'string',
                enum: ['sniadanie', 'drugie_sniadanie', 'obiad', 'podwieczorek', 'kolacja', 'inne'],
                description:
                  'sniadanie=breakfast, drugie_sniadanie=second breakfast/mid-morning, obiad=lunch/main dinner, podwieczorek=afternoon snack, kolacja=supper/dinner',
              },
              ingredients: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['name', 'quantity', 'unit'],
                  properties: {
                    name: { type: 'string', description: 'Ingredient name in Polish, lowercase' },
                    quantity: { type: 'number', description: 'Numeric quantity' },
                    unit: {
                      type: 'string',
                      description: 'g, kg, ml, l, szt, lyzka, lyzeczka, or szklanka',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}
