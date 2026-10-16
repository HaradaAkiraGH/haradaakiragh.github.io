// Клиент API Stellar Wiki
export interface ApiUser { id: number; email: string; nickname: string; role: 'user' | 'admin' | string; }
export interface AuthPayload { token: string; user: ApiUser; }
export interface RosterEntry {
  characterId: string; level: number; weapon: string; echoSet: string; source: 'manual' | 'game';
}
export interface ServerProfile { uid: string | null; importedAt: string | null; roster: RosterEntry[]; }
export interface PullEntry {
  id: number;
  bannerId: string;
  resourceId: string;
  name: string;
  rarity: 3 | 4 | 5;
  pullNumber: number;
  time: string;
}
export interface BannerStats {
  total: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  currentPity: number;
  avgPityAtFive: number;
  lastFiveName: string | null;
}
export interface PullsData {
  pulls: PullEntry[];
  stats: Record<string, BannerStats | null>;
  banners: { id: string; name: string }[];
}
export interface CharacterOverride {
  id: string;
  data: Record<string, unknown>;
  updatedAt: string;
}
export const API_ENABLED: boolean =
  Boolean(import.meta.env.VITE_API_URL) || import.meta.env.DEV;
export const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL as string}/api`
  : '/api';
async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error((data as { error?: string }).error ?? `Ошибка сервера (${res.status})`);
    err.payload = data;
    throw err;
  }
  return data as T;
}
export const apiRegister = (email: string, password: string, nickname: string) =>
  request<AuthPayload>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, nickname }) });
export const apiLogin = (email: string, password: string) =>
  request<AuthPayload>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const apiMe = (token: string) =>
  request<{ user: ApiUser }>('/auth/me', { method: 'GET' }, token);
export const apiGetProfile = (token: string) =>
  request<ServerProfile>('/profile', { method: 'GET' }, token);
export const apiSaveProfile = (token: string, payload: { uid?: string | null; roster?: RosterEntry[] }) =>
  request<ServerProfile>('/profile', { method: 'PUT', body: JSON.stringify(payload) }, token);
export const apiImportWuwa = (token: string, kuroToken: string) =>
  request<{ imported: number; uid?: string; roster: RosterEntry[]; debug?: unknown }>(
    '/wuwa/import', { method: 'POST', body: JSON.stringify({ token: kuroToken }) }, token,
  );
export const apiGetPulls = (token: string) =>
  request<PullsData>('/pulls', { method: 'GET' }, token);
export const apiImportPulls = (token: string, url: string) =>
  request<{ ok: boolean; imported: number; perBanner: Record<string, number>; playerId: string }>(
    '/pulls/import', { method: 'POST', body: JSON.stringify({ url }) }, token,
  );
export const apiDeletePulls = (token: string) =>
  request<{ ok: boolean }>('/pulls', { method: 'DELETE' }, token);
/* ----- Правки карточек персонажей ----- */
export const apiGetCharacterOverrides = () =>
  request<{ overrides: CharacterOverride[] }>('/characters/overrides');
export const apiSaveCharacterOverride = (token: string, id: string, patch: Record<string, unknown>) =>
  request<{ ok: boolean; id: string }>(
    '/admin/characters', { method: 'PUT', body: JSON.stringify({ id, patch }) }, token,
  );
export const apiDeleteCharacterOverride = (token: string, id: string) =>
  request<{ ok: boolean; id: string }>(
    `/admin/characters?id=${encodeURIComponent(id)}`, { method: 'DELETE' }, token,
  );