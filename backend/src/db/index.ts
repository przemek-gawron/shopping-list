import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { config } from '../config';

const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: Database.Database = new Database(config.dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    provider TEXT,
    provider_user_id TEXT,
    display_name TEXT,
    created_at INTEGER NOT NULL
  );
`);

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider_uid
  ON users(provider, provider_user_id)
  WHERE provider IS NOT NULL AND provider_user_id IS NOT NULL;
`);
