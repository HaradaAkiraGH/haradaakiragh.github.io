// Утилита: показать таблицу users и хеши паролей (для проверки руками)
// Запуск: npx tsx server/scripts/showUsers.ts
// @ts-ignore — типов node:sqlite может не быть в старых @types/node
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(here, '..', 'data', 'wiki.db'));

const users = db.prepare('SELECT id, email, nickname, created_at FROM users').all();
const hashes = db.prepare('SELECT email, password_hash FROM users').all();

console.log('=== Пользователи ===');
console.table(users);
console.log('=== Хеши паролей (bcrypt; самого пароля тут нет и быть не должно) ===');
console.table(hashes);