import { Router } from 'express';
import { config } from '../config';
import { callAnthropic, extractToolInput } from '../anthropic';
import { buildSaveRecipeTool } from '../schemas/save-recipe';
import { HttpError, ParseToolError } from '../errors';

const router = Router();

type ImagePart = { mediaType: 'image/jpeg' | 'image/png'; data: string };

router.post('/import-from-photos', async (req, res, next) => {
  try {
    if (!config.anthropicApiKey) {
      throw new HttpError(503, 'MISSING_KEY', 'Server ANTHROPIC_API_KEY is not configured');
    }

    const body = req.body as {
      images?: ImagePart[];
      languageName?: string;
      languageInstruction?: string;
    };

    if (!Array.isArray(body.images) || body.images.length === 0) {
      throw new HttpError(400, 'BAD_REQUEST', 'images must be a non-empty array');
    }
    const languageName = typeof body.languageName === 'string' ? body.languageName : 'Polish';
    const languageInstruction =
      typeof body.languageInstruction === 'string'
        ? body.languageInstruction
        : 'Use Polish for all text (title, description, ingredient names).';

    const imageContents: object[] = [];
    for (const img of body.images) {
      if (
        !img ||
        typeof img.data !== 'string' ||
        (img.mediaType !== 'image/jpeg' && img.mediaType !== 'image/png')
      ) {
        throw new HttpError(400, 'BAD_REQUEST', 'Each image must have mediaType (jpeg|png) and data (base64)');
      }
      imageContents.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mediaType,
          data: img.data,
        },
      });
    }

    imageContents.push({
      type: 'text',
      text: `Extract the recipe from the image(s) above. ${languageInstruction} Use only these units: g, kg, ml, l, szt, lyzka, lyzeczka, szklanka. Call the save_recipe tool with the extracted data.`,
    });

    const data = await callAnthropic(config.anthropicApiKey, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      tools: [buildSaveRecipeTool(languageName)],
      tool_choice: { type: 'tool', name: 'save_recipe' },
      messages: [
        {
          role: 'user',
          content: imageContents,
        },
      ],
    });

    let input: Record<string, unknown>;
    try {
      input = extractToolInput(data, 'save_recipe');
    } catch {
      throw new ParseToolError('Claude did not return a recipe');
    }

    if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) {
      throw new ParseToolError('No ingredients found in the recipe');
    }

    res.json({
      title: input.title ?? 'Przepis',
      description: input.description,
      ingredients: input.ingredients,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
