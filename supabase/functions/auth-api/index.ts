// @ts-nocheck — Deno (Supabase Edge)
// Stellar Wiki API: auth + профиль/ростер + pull tracker (идемпотентный импорт)
import { createClient } from 'npm:@supabase/supabase-js@2';
import bcrypt from 'npm:bcryptjs@2.4.3';
import jwt from 'npm:jsonwebtoken@9.0.2';

const ALLOWED = ['http://localhost:5173', 'http://localhost:5174', 'https://haradaakiragh.github.io'];
const corsHeaders = (req: Request): Record<string, string> => {
  const origin = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ALLOWED.includes(origin) ? origin : ALLOWED[2],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
};
const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const JWT_SECRET = Deno.env.get('JWT_SECRET') ?? 'dev-secret-change-me';
const signToken = (id: number) => jwt.sign({ uid: id }, JWT_SECRET, { expiresIn: '7d' });
const passwordOk = (p: string) => p.length >= 8 && /[A-Za-zА-Яа-я]/.test(p) && /[0-9]/.test(p);

const authUser = async (req: Request) => {
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { uid: number };
    const { data } = await sb.from('users').select('*').eq('id', payload.uid).maybeSingle();
    return data ?? null;
  } catch { return null; }
};

const ALIASES = {
  player: ['player_id', 'pid', 'player', 'playerId'],
  record: ['record_id', 'rid', 'record', 'recordId'],
  server: ['svr_id', 'server_id', 'sid', 'sv', 'svr', 'server', 'serverId'],
  resources: ['resources_id', 'res', 'resources', 'resourcesId'],
  gacha: ['gacha_id', 'gachaId', 'gacha'],
};

function parseConveneUrl(url: string) {
  try {
    let query = '';
    const hashIdx = url.indexOf('#/record');
    if (hashIdx !== -1) {
      const qIdx = url.indexOf('?', hashIdx);
      query = qIdx !== -1 ? url.slice(qIdx + 1) : '';
    } else {
      const qIdx = url.indexOf('?');
      query = qIdx !== -1 ? url.slice(qIdx + 1) : '';
    }
    const params = new URLSearchParams(query);
    const pick = (list: string[]) => { for (const k of list) { const v = params.get(k); if (v) return v; } return ''; };
    return {
      player_id: pick(ALIASES.player),
      record_id: pick(ALIASES.record),
      server_id: pick(ALIASES.server),
      resources_id: pick(ALIASES.resources) || '',
      gacha_id: pick(ALIASES.gacha) || '',
      keys: [...params.keys()],
      query,
    };
  } catch { return null; }
}

const GACHA_HOST = 'https://gmserver-api.aki-game2.net';

const KNOWN_POOL_IDS: Record<number, string[]> = {
  1: ['100001', '100002', ''],
  2: ['100084', '100085', ''],
  3: ['100041', '100042', ''],
  4: ['100003', ''],
  5: ['100086', ''],
  6: ['100087', ''],
  7: ['100088', ''],
  8: ['100089', ''],
};

async function queryPool(params: any, poolType: number) {
  const candidates: string[] = [];
  if (params.resources_id) candidates.push(params.resources_id);
  if (params.gacha_id && !candidates.includes(params.gacha_id)) candidates.push(params.gacha_id);
  for (const id of KNOWN_POOL_IDS[poolType] ?? []) {
    if (!candidates.includes(id)) candidates.push(id);
  }
  if (!candidates.length) candidates.push('');

  for (const cardPoolId of candidates) {
    try {
      const res = await fetch(`${GACHA_HOST}/gacha/record/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 11; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.122 Mobile Safari/537.36',
          'Accept': 'application/json',
          'version': '2.3.9',
          'source': 'android',
        },
        body: JSON.stringify({
          playerId: params.player_id,
          cardPoolId,
          cardPoolType: poolType,
          languageCode: 'en',
          recordId: params.record_id,
          serverId: params.server_id,
        }),
      });
      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { /* не json */ }
      if (res.status === 200 && data?.code === 0 && Array.isArray(data.data) && data.data.length > 0) {
        return { ok: true, list: data.data, cardPoolId };
      }
    } catch { /* пробуем следующего кандидата */ }
  }
  return { ok: false, list: null, cardPoolId: null };
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  const rawPath = new URL(req.url).pathname;
  const marker = '/auth-api';
  let path = rawPath.includes(marker) ? rawPath.slice(rawPath.indexOf(marker) + marker.length) : rawPath;
  path = path.replace(/\/\/+/g, '/').replace(/\/+$/, '');
  if (path.startsWith('/api/api/')) path = path.slice(4);
  if (path === '') path = '/api/health';

  try {
    if (path === '/api/health' || path === '/') {
      return json({ ok: true, service: 'wuwa-wiki-api (edge)', time: new Date().toISOString() }, 200, headers);
    }

    /* ----- AUTH ----- */
    if (path === '/api/auth/register' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const email = String(body.email ?? '').toLowerCase().trim();
      const password = String(body.password ?? '');
      const nickname = String(body.nickname ?? '').trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Некорректный email' }, 400, headers);
      if (!passwordOk(password)) return json({ error: 'Пароль минимум 8 символов, буквы и цифры' }, 400, headers);
      if (nickname.length < 2 || nickname.length > 24) return json({ error: 'Ник от 2 до 24 символов' }, 400, headers);
      const exists = await sb.from('users').select('id').eq('email', email).maybeSingle();
      if (exists.error) return json({ error: `Ошибка базы: ${exists.error.message}` }, 500, headers);
      if (exists.data) return json({ error: 'Этот email уже зарегистрирован' }, 409, headers);
      const hash = bcrypt.hashSync(password, 10);
      const { error } = await sb.from('users').insert({ email, password_hash: hash, nickname });
      if (error) return json({ error: `Ошибка сохранения: ${error.message}` }, 500, headers);
      const { data: user } = await sb.from('users').select('*').eq('email', email).single();
      return json({ token: signToken(user.id), user: { id: user.id, email: user.email, nickname: user.nickname } }, 201, headers);
    }
    if (path === '/api/auth/login' && req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const email = String(body.email ?? '').toLowerCase().trim();
      const password = String(body.password ?? '');
      const { data: user, error } = await sb.from('users').select('*').eq('email', email).maybeSingle();
      if (error) return json({ error: `Ошибка базы: ${error.message}` }, 500, headers);
      if (!user || !bcrypt.compareSync(password, user.password_hash)) return json({ error: 'Неверный email или пароль' }, 401, headers);
      return json({ token: signToken(user.id), user: { id: user.id, email: user.email, nickname: user.nickname } }, 200, headers);
    }
    if (path === '/api/auth/me' && req.method === 'GET') {
      const user = await authUser(req);
      if (!user) return json({ error: 'Токен недействителен' }, 401, headers);
      return json({ user: { id: user.id, email: user.email, nickname: user.nickname } }, 200, headers);
    }

    /* ----- PROFILE ----- */
    if (path === '/api/profile' && req.method === 'GET') {
      const user = await authUser(req);
      if (!user) return json({ error: 'Нет токена' }, 401, headers);
      const { data: prof } = await sb.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      const { data: rows } = await sb.from('roster').select('*').eq('user_id', user.id).order('id');
      return json({
        uid: prof?.game_uid ?? null, importedAt: prof?.imported_at ?? null,
        roster: (rows ?? []).map((r: any) => ({ characterId: r.character_id, level: r.level, weapon: r.weapon, echoSet: r.echo_set, source: r.source })),
      }, 200, headers);
    }
    if (path === '/api/profile' && req.method === 'PUT') {
      const user = await authUser(req);
      if (!user) return json({ error: 'Нет токена' }, 401, headers);
      const body = await req.json().catch(() => ({}));
      if (body.uid !== undefined) {
        await sb.from('profiles').upsert({ user_id: user.id, game_uid: body.uid || null, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      }
      if (Array.isArray(body.roster)) {
        await sb.from('roster').delete().eq('user_id', user.id);
        if (body.roster.length) {
          await sb.from('roster').insert(body.roster.map((r: any) => ({
            user_id: user.id, character_id: String(r.characterId), level: Number(r.level ?? 1),
            weapon: String(r.weapon ?? ''), echo_set: String(r.echoSet ?? ''), source: r.source === 'game' ? 'game' : 'manual',
          })));
        }
      }
      const { data: prof } = await sb.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      const { data: rows } = await sb.from('roster').select('*').eq('user_id', user.id).order('id');
      return json({
        uid: prof?.game_uid ?? null, importedAt: prof?.imported_at ?? null,
        roster: (rows ?? []).map((r: any) => ({ characterId: r.character_id, level: r.level, weapon: r.weapon, echoSet: r.echo_set, source: r.source })),
      }, 200, headers);
    }

    /* ----- PULLS GET: номера круток пересчитываются при чтении ----- */
    if (path === '/api/pulls' && req.method === 'GET') {
      const user = await authUser(req);
      if (!user) return json({ error: 'Нет токена' }, 401, headers);
      const { data: rows } = await sb.from('pulls').select('*').eq('user_id', user.id);
      const asc = [...(rows ?? [])].sort((a: any, b: any) =>
        String(a.time).localeCompare(String(b.time)) || (a.seq - b.seq) || (a.id - b.id));
      const counter: Record<string, number> = {};
      const numbered = asc.map((r: any) => {
        counter[r.banner_id] = (counter[r.banner_id] ?? 0) + 1;
        return { ...r, pull_number: counter[r.banner_id] };
      });
      const pulls = [...numbered].reverse().map((r: any) => ({
        id: r.id, bannerId: r.banner_id, resourceId: r.resource_id, name: r.name,
        rarity: r.rarity, pullNumber: r.pull_number, time: r.time,
      }));
      const { data: bannerRows } = await sb.from('banners').select('id, name').order('id');
      const banners = (bannerRows ?? []).map((b: any) => ({ id: b.id, name: b.name }));

      const stats: Record<string, any> = {};
      const bannerIds = [...new Set(numbered.map((p: any) => p.banner_id))] as string[];
      for (const bannerId of bannerIds) {
        const bp = numbered.filter((p: any) => p.banner_id === bannerId); // по возрастанию
        const fives = bp.filter((p: any) => p.rarity === 5);
        const fours = bp.filter((p: any) => p.rarity === 4);
        const lastFive = fives.length ? fives[fives.length - 1] : null;
        const currentPity = lastFive ? bp[bp.length - 1].pull_number - lastFive.pull_number : bp[bp.length - 1].pull_number;
        const pityAtFive: number[] = [];
        let prev = 0;
        for (const f of fives) { pityAtFive.push(f.pull_number - prev); prev = f.pull_number; }
        stats[bannerId] = {
          total: bp.length, fiveStars: fives.length, fourStars: fours.length,
          threeStars: bp.filter((p: any) => p.rarity === 3).length,
          currentPity, avgPityAtFive: pityAtFive.length ? Math.round(pityAtFive.reduce((a: number, b: number) => a + b, 0) / pityAtFive.length) : 0,
          lastFiveName: lastFive?.name ?? null,
        };
      }
      return json({ pulls, stats, banners }, 200, headers);
    }

    /* ----- PULLS IMPORT: seq + upsert-ignore ----- */
    if (path === '/api/pulls/import' && req.method === 'POST') {
      const user = await authUser(req);
      if (!user) return json({ error: 'Нет токена' }, 401, headers);
      const body = await req.json().catch(() => ({}));
      const url = String(body.url ?? '').trim();
      if (!url) return json({ error: 'Вставь URL истории круток' }, 400, headers);

      const params = parseConveneUrl(url);
      if (!params || !params.player_id || !params.record_id || !params.server_id) {
        return json({ error: 'Не удалось распарсить URL', debug: { keys: params?.keys ?? null } }, 400, headers);
      }

      const bannerUpserts: any[] = [];
      let total = 0;
      const perBanner: Record<string, number> = {};
      const debug: any[] = [];

      for (let poolType = 1; poolType <= 8; poolType++) {
        const r = await queryPool(params, poolType);
        if (!r.ok || !r.list || r.list.length === 0) {
          debug.push({ pool: poolType, ok: false, usedCardPoolId: r.cardPoolId });
          continue;
        }

        const poolName = String(r.list[0]?.cardPoolType ?? `Пуль ${poolType}`);
        bannerUpserts.push({ id: String(poolType), name: poolName, type: 'pool', is_limited: false });

        const sorted = [...r.list].sort((a, b) => String(a.time).localeCompare(String(b.time)));
        const seqCount: Record<string, number> = {};
        const toInsert = sorted.map((p) => {
          const key = `${p.time}|${p.resourceId}`;
          const seq = seqCount[key] ?? 0;
          seqCount[key] = seq + 1;
          return {
            user_id: user.id, banner_id: String(poolType), resource_id: String(p.resourceId ?? ''),
            name: String(p.name ?? `ID ${p.resourceId ?? '?'}`),
            rarity: Math.min(5, Math.max(3, Number(p.qualityLevel ?? 3))),
            pull_number: 0, seq, time: String(p.time),
          };
        });
        for (let i = 0; i < toInsert.length; i += 50) {
          const { error } = await sb.from('pulls').upsert(toInsert.slice(i, i + 50), {
            onConflict: 'user_id,banner_id,time,resource_id,seq',
            ignoreDuplicates: true,
          });
          if (error) return json({ error: `Ошибка сохранения: ${error.message}` }, 500, headers);
        }
        perBanner[String(poolType)] = toInsert.length;
        total += toInsert.length;
      }

      if (bannerUpserts.length) {
        await sb.from('banners').upsert(bannerUpserts, { onConflict: 'id' });
      }

      if (total === 0) {
        return json({
          error: 'Kuro отклонил запрос. Вероятнее всего, URL протух — добудь свежий через PowerShell-команду.',
          debug,
        }, 502, headers);
      }
      return json({ ok: true, imported: total, perBanner, playerId: params.player_id }, 200, headers);
    }

    /* ----- PULLS DELETE ----- */
    if (path === '/api/pulls' && req.method === 'DELETE') {
      const user = await authUser(req);
      if (!user) return json({ error: 'Нет токена' }, 401, headers);
      await sb.from('pulls').delete().eq('user_id', user.id);
      return json({ ok: true }, 200, headers);
    }

    return json({ error: 'Не найдено', debugPath: path, rawPath }, 404, headers);
  } catch (e) {
    console.error('unhandled:', e);
    return json({ error: 'Ошибка сервера' }, 500, headers);
  }
});