// Клиент API: dev — через vite-прокси /api, prod — через VITE_API_URL (Render)
export interface ApiUser {
  id: number;
  email: string;
  nickname: string;
}

export interface AuthPayload {
  token: string;
  user: ApiUser;
}

export const API_ENABLED: boolean =
  Boolean(import.meta.env.VITE_API_URL) || import.meta.env.DEV;

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL as string}/api`
  : '/api';

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