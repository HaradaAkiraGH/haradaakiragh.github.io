// Вход и регистрация; если уже залогинен — аккуратный <Navigate>, без падений
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export const LoginPage = () => {
  useDocumentMeta({ title: 'Вход', description: 'Войди или создай аккаунт Stellar Wiki.' });
  const { login, register, demo, ready, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Уже залогинен — мягко уводим на Главную
  if (ready && user) {
    return <Navigate to="/home" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, nickname.trim());
      }
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full bg-bg-secondary/80 border border-glass-border rounded-xl pl-10 pr-10 py-3 text-sm text-ivory placeholder-gray-500 focus-ring';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-5%] w-[480px] h-[140%] rotate-[25deg] bg-gradient-to-b from-accent/[0.08] to-transparent blur-2xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[520px] h-[520px] rounded-full bg-accent/10 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 backdrop-blur-2xl animate-slide-up">
        {demo && (
          <p className="mb-4 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs text-center">
            Демо-режим: облачный API не подключён, вход принимает любые данные
          </p>
        )}

        <h1 className="text-3xl font-extrabold text-ivory text-center">
          {mode === 'login' ? (
            <>С возвращением, <span className="text-gradient">Rover</span></>
          ) : (
            <>Новое путешествие, <span className="text-gradient">Rover</span></>
          )}
        </h1>
        <p className="text-center text-gray-400 text-sm mt-2">
          {mode === 'login'
            ? 'Войди, чтобы продолжить путь по Соларис-3'
            : 'Создай аккаунт резонатора: email, пароль и позывной'}
        </p>

        {error && (
          <p className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            <AlertCircle size={15} className="shrink-0" /> {error}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5" htmlFor="nickname">Позывной</label>
              <div className="relative">
                <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Как тебя звать в Соларис-3?"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-gray-400 mb-1.5" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rover@solaris3.gg"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5" htmlFor="password">Пароль</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Минимум 8 символов, буквы и цифры' : '••••••••'}
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-ivory transition-colors focus-ring rounded"
                aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs text-gray-400 mb-1.5" htmlFor="confirm">Повтори пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="confirm"
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all focus-ring disabled:opacity-50"
          >
            {busy ? 'Секунду...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            {!busy && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="text-accent-light font-semibold hover:underline focus-ring rounded"
          >
            {mode === 'login' ? 'Создать' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
};