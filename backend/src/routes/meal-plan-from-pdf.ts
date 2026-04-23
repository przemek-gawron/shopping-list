import { Router } from 'express';
import { config } from '../config';
import { callAnthropic, extractToolInput } from '../anthropic';
import { buildSaveMealPlanTool } from '../schemas/save-meal-plan';
import { HttpError, ParseToolError } from '../errors';

const router = Router();

router.post('/import-from-pdf', async (req, res, next) => {
  try {
    if (!config.anthropicApiKey) {
      throw new HttpError(503, 'MISSING_KEY', 'Server ANTHROPIC_API_KEY is not configured');
    }

    const body = req.body as { pdf?: { data?: string } };
    const base64 = body.pdf?.data;
    if (typeof base64 !== 'string' || !base64.length) {
      throw new HttpError(400, 'BAD_REQUEST', 'pdf.data must be a non-empty base64 string');
    }

    const data = await callAnthropic(
      config.anthropicApiKey,
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 8192,
        tools: [buildSaveMealPlanTool()],
        tool_choice: { type: 'tool', name: 'save_meal_plan' },
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: 'Extract ALL recipes from this Polish meal plan PDF. For each recipe, identify its meal type: sniadanie (śniadanie/breakfast), drugie_sniadanie (drugie śniadanie/mid-morning), obiad (obiad/main meal), podwieczorek (podwieczorek/afternoon snack), kolacja (kolacja/supper). Use Polish for all text and ingredient names (lowercase). Extract ingredients with quantities and units — use only: g, kg, ml, l, szt, lyzka, lyzeczka, szklanka. Call save_meal_plan with every recipe found.',
              },
            ],
          },
        ],
      },
      { 'anthropic-beta': 'pdfs-2024-09-25' }
    );

    let input: Record<string, unknown>;
    try {
      input = extractToolInput(data, 'save_meal_plan');
    } catch {
      throw new ParseToolError('Claude did not return recipes');
    }

    const recipes = input.recipes;
    if (!Array.isArray(recipes) || recipes.length === 0) {
      throw new ParseToolError('No recipes found in PDF');
    }

    res.json({ recipes });
  } catch (e) {
    next(e);
  }
});

export default router;
