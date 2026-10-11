// API Stellar Wiki: register / login / me. bcrypt + zod + JWT, хранилище — db.ts
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findByEmail, findById, insertUser, initDb } from './db.js';

const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

const app = express();
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://haradaakiragh.github.io',
  ],
}));
app.use(express.json());

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
  id: Number(u.id),
  email: u.email,
  nickname: u.nickname,
});

const signToken = (id: number) => jwt.sign({ uid: Number(id) }, JWT_SECRET, { expiresIn: '7d' });

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'wuwa-wiki-api', time: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Некорректные данные' });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const nickname = parsed.data.nickname.trim();

    if (await findByEmail(email)) {
      return res.status(409).json({ error: 'Этот email уже зарегистрирован' });
    }
    const hash = bcrypt.hashSync(parsed.data.password, 10);
    await insertUser(email, hash, nickname);
    const user = (await findByEmail(email))!;
    return res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    console.error('[register]', e);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }
    const user = await findByEmail(parsed.data.email.toLowerCase().trim());
    if (!user || !bcrypt.compareSync(parsed.data.password, user.password_hash)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    return res.json({ token: signToken(user.id), user: publicUser(user) });
  } catch (e) {
    console.error('[login]', e);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Нет токена' });
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as { uid: number };
    const user = await findById(Number(payload.uid));
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' });
    return res.json({ user: publicUser(user) });
  } catch {
    return res.status(401).json({ error: 'Токен недействителен или истёк' });
  }
});

const boot = async () => {
  await initDb();
  app.listen(PORT, () => console.log(`[api] Stellar Wiki API listening on port ${PORT}`));
};

boot().catch((e) => {
  console.error('[api] boot failed', e);
  process.exit(1);
});