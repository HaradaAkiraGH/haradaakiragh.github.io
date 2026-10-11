// База данных SQLite через встроенный модуль node:sqlite (Node 22.5+/24).
// Храним пользователей: email уникален, пароль только в виде bcrypt-хеша.
// @ts-ignore — типов node:sqlite может не быть в старых @types/node
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(here, 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, 'wiki.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nickname      TEXT NOT NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export interface RowUser {
  id: number;
  email: string;
  password_hash: string;
  nickname: string;
  created_at: string;
}

export const findByEmail = (email: string) =>
  db.prepare('SELECT * FROM users WHERE email = ?').get(email) as RowUser | undefined;

export const findById = (id: number) =>
  db.prepare('SELECT * FROM users WHERE id = ?').get(id) as RowUser | undefined;

export const insertUser = (email: string, hash: string, nickname: string) =>
  db.prepare('INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)').run(email, hash, nickname);