// @ts-nocheck — файл живёт в Deno (Supabase Edge); VS Code его типы не знает, и это норма
// Stellar Wiki Auth API: /api/health, /api/auth/register, /api/auth/login, /api/auth/me
import { createClient } from 'npm:@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@2.4.3';
import jwt from 'npm:jsonwebtoken@9.0.2';

const ALLOWED = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://haradaakiragh.github.io',
];

const corsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[2],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
};

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'dev-secret-change-me';

const signToken = (id: number) => jwt.sign({ uid: id }, JWT_SECRET, { expiresIn: '7d' });

const passwordOk = (p: string) =>
  p.length >= 8 && /[A-Za-zА-Яа-я]/.test(p) && /[0-9]/.test(p);

Deno.serve(async (req) => {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers });

  // Надежно вырезаем префикс функции, в каком бы виде он ни пришёл:
  // '/functions/v1/auth-api/api/health' | '/auth-api/api/health' | '/api/health'
  const rawPath = new URL(req.url).pathname;
  const marker = '/auth-api';
  const path = rawPath.includes(marker)
    ? rawPath.slice(rawPath.indexOf(marker) + marker.length)
    : rawPath;

  try {
    if (path === '/api/health' || path === '/' || path === '') {
      return json({ ok: true, service: 'wuwa-wiki-api (edge)', time: new Date().toISOString() }, 200, headers);
    }

    if (path === '/api/auth/register' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const email = String(body.email ?? '').toLowerCase().trim();
      const password = String(body.password ?? '');
      const nickname = String(body.nickname ?? '').trim();

      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Некорректный email' }, 400, headers);
      if (!passwordOk(password)) return json({ error: 'Пароль минимум 8 символов, буквы и цифры' }, 400, headers);
      if (nickname.length < 2 || nickname.length > 24) return json({ error: 'Ник от 2 до 24 символов' }, 400, headers);

      const exists = await sb.from('users').select('id').eq('email', email).maybeSingle();
      if (exists.data) return json({ error: 'Этот email уже зарегистрирован' }, 409, headers);

      const hash = bcrypt.hashSync(password, 10);
      const { error } = await sb.from('users').insert({ email, password_hash: hash, nickname });
      if (error) return json({ error: 'Ошибка сохранения пользователя' }, 500, headers);

      const { data: user } = await sb.from('users').select('*').eq('email', email).single();
      return json(
        { token: signToken(user.id), user: { id: user.id, email: user.email, nickname: user.nickname } },
        201,
        headers,
      );
    }

    if (path === '/api/auth/login' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const email = String(body.email ?? '').toLowerCase().trim();
      const password = String(body.password ?? '');

      const { data: user } = await sb.from('users').select('*').eq('email', email).maybeSingle();
      if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return json({ error: 'Неверный email или пароль' }, 401, headers);
      }
      return json(
        { token: signToken(user.id), user: { id: user.id, email: user.email, nickname: user.nickname } },
        200,
        headers,
      );
    }

    if (path === '/api/auth/me' && req.method === 'GET') {
      const auth = req.headers.get('authorization') ?? '';
      if (!auth.startsWith('Bearer ')) return json({ error: 'Нет токена' }, 401, headers);
      try {
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { uid: number };
        const { data: user } = await sb.from('users').select('*').eq('id', payload.uid).maybeSingle();
        if (!user) return json({ error: 'Пользователь не найден' }, 401, headers);
        return json({ user: { id: user.id, email: user.email, nickname: user.nickname } }, 200, headers);
      } catch {
        return json({ error: 'Токен недействителен или истёк' }, 401, headers);
      }
    }

    return json({ error: 'Не найдено', debugPath: path }, 404, headers);
  } catch (e) {
    console.error(e);
    return json({ error: 'Ошибка сервера' }, 500, headers);
  }
});