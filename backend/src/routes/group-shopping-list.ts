import { Router } from 'express';
import { config } from '../config';
import { callAnthropic, extractToolInput } from '../anthropic';
import { buildGroupItemsTool } from '../schemas/group-shopping-items';
import { HttpError, ParseToolError } from '../errors';

const router = Router();

router.post('/group', async (req, res, next) => {
  try {
    if (!config.anthropicApiKey) {
      throw new HttpError(503, 'MISSING_KEY', 'Server ANTHROPIC_API_KEY is not configured');
    }

    const body = req.body as {
      productNames?: string[];
      categoryDescription?: string;
      instruction?: string;
    };

    if (!Array.isArray(body.productNames) || body.productNames.length === 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'productNames must be a non-empty array');
    }
    const categoryDescription =
      typeof body.categoryDescription === 'string' && body.categoryDescription.length > 0
        ? body.categoryDescription
        : 'Category name in Polish, e.g. Warzywa, Owoce, Nabiał';
    const instruction =
      typeof body.instruction === 'string' && body.instruction.length > 0
        ? body.instruction
        : `Group these items. Call the group_shopping_items tool.\n\nItems:\n${body.productNames.join('\n')}`;

    const data = await callAnthropic(config.anthropicApiKey, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [buildGroupItemsTool(categoryDescription)],
      tool_choice: { type: 'tool', name: 'group_shopping_items' },
      messages: [
        {
          role: 'user',
          content: instruction,
        },
      ],
    });

    let input: Record<string, unknown>;
    try {
      input = extractToolInput(data, 'group_shopping_items');
    } catch {
      throw new ParseToolError('Claude did not return groups');
    }

    if (!Array.isArray(input.groups)) {
      throw new ParseToolError('Claude did not return groups');
    }

    res.json({ groups: input.groups });
  } catch (e) {
    next(e);
  }
});

export default router;
