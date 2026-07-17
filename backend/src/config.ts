import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function parseAllowedOrigins(raw: string | undefined): string[] | true {
  if (!raw || raw.trim() === '*') {
    return true;
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseCommaList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

const dbPathEnv = process.env.DB_PATH?.trim();
const resolvedDb = dbPathEnv
  ? path.isAbsolute(dbPathEnv)
    ? dbPathEnv
    : path.resolve(process.cwd(), dbPathEnv)
  : path.resolve(process.cwd(), 'data', 'app.db');

export const config = {
  port: Number(process.env.PORT) || 3000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  /** SQLite file path */
  dbPath: resolvedDb,
  jwtSecret: process.env.JWT_SECRET?.trim() ?? '',
  /** Google OAuth: comma-separated client IDs to accept for ID token `aud` */
  googleClientIds: parseCommaList(process.env.GOOGLE_CLIENT_IDS),
  /** Apple “Services ID” or app bundle id used as `aud` for Sign in with Apple */
  appleClientId: process.env.APPLE_CLIENT_ID?.trim() ?? '',
  facebookAppId: process.env.FACEBOOK_APP_ID?.trim() ?? '',
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET?.trim() ?? '',
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
} as const;
