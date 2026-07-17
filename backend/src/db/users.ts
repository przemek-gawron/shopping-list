import { randomUUID } from 'crypto';
import { db } from './index';
import { HttpError } from '../errors';

export type AuthProvider = 'email' | 'google' | 'apple' | 'facebook';

export interface UserRow {
  id: string;
  email: string | null;
  password_hash: string | null;
  provider: string | null;
  provider_user_id: string | null;
  display_name: string | null;
  created_at: number;
}

function mapRow(row: unknown): UserRow | undefined {
  if (!row) {
    return undefined;
  }
  return row as UserRow;
}

const selectById = db.prepare('SELECT id, email, password_hash, provider, provider_user_id, display_name, created_at FROM users WHERE id = ?');
const selectByEmail = db.prepare('SELECT id, email, password_hash, provider, provider_user_id, display_name, created_at FROM users WHERE LOWER(email) = LOWER(?)');
const selectByProvider = db.prepare('SELECT id, email, password_hash, provider, provider_user_id, display_name, created_at FROM users WHERE provider = ? AND provider_user_id = ?');
const insert = db.prepare(
  'INSERT INTO users (id, email, password_hash, provider, provider_user_id, display_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const updateUserFields = db.prepare('UPDATE users SET email = COALESCE(?, email), display_name = COALESCE(?, display_name) WHERE id = ?');

export function getUserById(id: string): UserRow | undefined {
  return mapRow(selectById.get(id));
}

export function getUserByEmail(email: string): UserRow | undefined {
  return mapRow(selectByEmail.get(email));
}

export function getUserByProvider(
  provider: string,
  providerUserId: string
): UserRow | undefined {
  return mapRow(selectByProvider.get(provider, providerUserId));
}

export function createEmailUser(params: {
  email: string;
  passwordHash: string;
  displayName: string;
}): UserRow {
  const id = randomUUID();
  const now = Date.now();
  try {
    insert.run(
      id,
      params.email,
      params.passwordHash,
      'email',
      null,
      params.displayName,
      now
    );
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new HttpError(409, 'EMAIL_IN_USE', 'This email is already registered');
    }
    throw e;
  }
  return getUserById(id)!;
}

export function getOrCreateOAuthUser(params: {
  provider: Exclude<AuthProvider, 'email'>;
  providerUserId: string;
  email: string | null;
  displayName: string | null;
}): UserRow {
  const existing = getUserByProvider(params.provider, params.providerUserId);
  if (existing) {
    const email = params.email ?? existing.email;
    const display = params.displayName ?? existing.display_name;
    updateUserFields.run(email, display, existing.id);
    return getUserById(existing.id)!;
  }
  const id = randomUUID();
  const now = Date.now();
  try {
    insert.run(id, params.email, null, params.provider, params.providerUserId, params.displayName, now);
  } catch (e) {
    const err = e as { code?: string };
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new HttpError(409, 'ACCOUNT_CONFLICT', 'This account could not be created');
    }
    throw e;
  }
  return getUserById(id)!;
}

export function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    provider: row.provider,
  };
}
