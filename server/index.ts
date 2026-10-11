// API Stellar Wiki: регистрация, вход, проверка токена.
// Безопасность: bcrypt-хеши, zod-валидация каждого входа, JWT на 7 дней, CORS-список.
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findByEmail, findById, insertUser } from './db.js';

const PORT = Number(process.env.PORT || 4000);
// TODO залп 4: читать из .env; сейчас dev-секрет по умолчанию
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'https://haradaakiragh.github.io'] }));
app.use(express.json());

/* ---------- Схемы валидации ---------- */
const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z
    .string()
    .min(8, 'Пароль минимум 8 символов')
    .regex(/[A-Za-zА-Яа-я]/, 'Пароль должен содержать буквы')
    .regex(/[0-9]/, 'Пароль должен содержать цифры'),
  nickname: z.string().min(2, 'Ник минимум 2 символа').max(24, 'Ник максимум 24 символа'),
});

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

const publicUser = (u: { id: number; email: string; nickname: string }) => ({
  id: u.id,
  email: u.email,
  nickname: u.nickname,
});

const signToken = (id: number) => jwt.sign({ uid: id }, JWT_SECRET, { expiresIn: '7d' });

/* ---------- Маршруты ---------- */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'wuwa-wiki-api', time: new Date().toISOString() });
});

app.post('/api/auth/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Некорректные данные' });
  }
  const email = parsed.data.email.toLowerCase().trim();
  const nickname = parsed.data.nickname.trim();

  if (findByEmail(email)) {
    return res.status(409).json({ error: 'Этот email уже зарегистрирован' });
  }

  const hash = bcrypt.hashSync(parsed.data.password, 10);
  insertUser(email, hash, nickname);
  const user = findByEmail(email)!;
  return res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Некорректные данные' });
  }
  const user = findByEmail(parsed.data.email.toLowerCase().trim());
  if (!user || !bcrypt.compareSync(parsed.data.password, user.password_hash)) {
    return res.status(401).json({ error: 'Неверный email или пароль' });
  }
  return res.json({ token: signToken(user.id), user: publicUser(user) });
});

app.get('/api/auth/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { uid: number };
    const user = findById(payload.uid);
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(401).json({ error: 'Токен недействителен или истёк' });
  }
});

app.listen(PORT, () => {
  console.log(`[api] Stellar Wiki API listening on http://localhost:${PORT}`);
});