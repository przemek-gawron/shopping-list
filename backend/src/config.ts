import dotenv from 'dotenv';

dotenv.config();

function parseAllowedOrigins(raw: string | undefined): string[] | true {
  if (!raw || raw.trim() === '*') {
    return true;
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  clientToken: process.env.CLIENT_TOKEN?.trim() ?? '',
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
} as const;
