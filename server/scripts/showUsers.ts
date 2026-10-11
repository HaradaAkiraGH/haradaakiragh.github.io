// Смотрелка пользователей. Локально: npx tsx server/scripts/showUsers.ts
// Облако: сначала выставь $env:TURSO_DATABASE_URL и $env:TURSO_AUTH_TOKEN
import { allUsers } from '../db.js';

const users = await allUsers();
console.log('=== Пользователи ===');
console.table(users.map(({ password_hash, ...rest }) => rest));
console.log('=== Хеши паролей ===');
console.table(users.map((u) => ({ email: u.email, password_hash: u.password_hash })));