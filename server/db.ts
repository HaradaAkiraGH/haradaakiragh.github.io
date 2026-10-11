// Хранилище: SQLite. Локально — файл server/data/wiki.db,
// в проде — облако Turso (libsql). Переключение через env, запросы одинаковые.
import { createClient } from '@libsql/client';
import type { Client } from '@libsql/client';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const localFile = path.join(here, 'data', 'wiki.db');

export const db: Client = process.env.TURSO_DATABASE_URL
  ? createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN })
  : (() => {
      fs.mkdirSync(path.dirname(localFile), { recursive: true });
      return createClient({ url: `file:${localFile}` });
    })();

export interface RowUser {
  id: number;
  email: string;
  password_hash: string;
  nickname: string;
  created_at: string;
}

export async function initDb() {
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nickname      TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );`);
}

export async function findByEmail(email: string): Promise<RowUser | undefined> {
  const r = await db.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  return r.rows[0] as unknown as RowUser | undefined;
}

export async function findById(id: number): Promise<RowUser | undefined> {
  const r = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
  return r.rows[0] as unknown as RowUser | undefined;
}

export async function insertUser(email: string, hash: string, nickname: string) {
  await db.execute({
    sql: 'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
    args: [email, hash, nickname],
  });
}

export async function allUsers(): Promise<RowUser[]> {
  const r = await db.execute('SELECT id, email, nickname, created_at, password_hash FROM users');
  return r.rows as unknown as RowUser[];
}