import { UpstreamAuthError, UpstreamError } from './errors';

export async function callAnthropic(
  apiKey: string,
  body: object,
  extraHeaders?: Record<string, string>
): Promise<unknown> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 401) {
    throw new UpstreamAuthError();
  }

  if (!response.ok) {
    const text = await response.text();
    throw new UpstreamError(response.status, text.slice(0, 500));
  }

  return response.json();
}

type ContentBlock = { type: string; name?: string; input?: unknown };

export function extractToolInput(
  data: unknown,
  expectedToolName: string
): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid Anthropic response');
  }
  const content = (data as { content?: ContentBlock[] }).content;
  if (!Array.isArray(content)) {
    throw new Error('Missing content array');
  }
  const toolUse = content.find(
    (c): c is ContentBlock & { type: 'tool_use'; input: Record<string, unknown> } =>
      c.type === 'tool_use' && c.name === expectedToolName && c.input != null && typeof c.input === 'object'
  );
  if (!toolUse?.input) {
    throw new Error(`Expected tool_use ${expectedToolName}`);
  }
  return toolUse.input as Record<string, unknown>;
}
