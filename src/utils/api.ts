// Клиент API Stellar Wiki
export interface ApiUser {
  id: number;
  email: string;
  nickname: string;
}

export interface AuthPayload {
  token: string;
  user: ApiUser;
}

// API включён: локально (dev) всегда; в прод — только если задан VITE_API_URL
export const API_ENABLED: boolean =
  Boolean(import.meta.env.VITE_API_URL) || import.meta.env.DEV;

const BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? `Ошибка сервера (${res.status})`);
  }
  return data as T;
}

export const apiRegister = (email: string, password: string, nickname: string) =>
  request<AuthPayload>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, nickname }),
  });

export const apiLogin = (email: string, password: string) =>
  request<AuthPayload>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiMe = (token: string) =>
  request<{ user: ApiUser }>('/auth/me', { method: 'GET' }, token);