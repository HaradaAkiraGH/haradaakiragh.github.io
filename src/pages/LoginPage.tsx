// Логин в стиле WuWa: стеклянная карточка, золото, соц-кнопки-монограммы.
// Это фан-прототип: подходят ЛЮБЫЕ email и пароль.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Монограммы вместо брендовых иконок (их убрали из lucide-react).
// Захочешь настоящие логотипы — просто вставь сюда SVG-компоненты.
const SOCIALS = [
  { label: 'Google', mono: 'G' },
  { label: 'GitHub', mono: 'GH' },
  { label: 'LinkedIn', mono: 'IN' },
];

export const LoginPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [, setAuth] = useLocalStorage<{ email: string } | null>('ww_auth', null);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuth({ email: email || 'rover@solaris3.gg' });
    navigate('/');
  };

  const inputClass =
    'w-full bg-bg-secondary/80 border border-glass-border rounded-xl pl-10 pr-10 py-3 text-sm text-ivory placeholder-gray-500 focus-ring';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Фон: золотые лучи и пятна */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-[-5%] w-[480px] h-[140%] rotate-[25deg] bg-gradient-to-b from-accent/[0.08] to-transparent blur-2xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[520px] h-[520px] rounded-full bg-accent/10 blur-[140px]" />
        <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-ivory/[0.04] blur-[100px]" />
      </div>

      {/* Карточка */}
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 backdrop-blur-2xl animate-slide-up">
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
            : 'Создай профиль резонатора и начни коллекцию'}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
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
                placeholder="••••••••"
                className={inputClass}
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

          {mode === 'login' && (
            <div className="text-right">
              <button type="button" className="text-xs text-accent-light hover:underline focus-ring rounded">
                Забыли пароль?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all focus-ring"
          >
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <span className="flex-1 h-px bg-glass-border" />
          <span className="text-xs text-gray-500">или продолжить с</span>
          <span className="flex-1 h-px bg-glass-border" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {SOCIALS.map((s) => (
            <button
              key={s.label}
              onClick={submit}
              className="h-12 rounded-xl bg-glass border border-glass-border flex items-center justify-center text-sm font-extrabold tracking-wider text-gray-300 hover:text-bg hover:bg-gradient-to-r hover:from-accent hover:to-accent-light hover:border-accent/40 transition-all focus-ring"
              aria-label={`Войти через ${s.label}`}
            >
              {s.mono}
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          {mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-accent-light font-semibold hover:underline focus-ring rounded"
          >
            {mode === 'login' ? 'Создать' : 'Войти'}
          </button>
        </p>

        <p className="text-center text-[11px] text-gray-600 mt-4">
          Фан-прототип: подойдут любые email и пароль
        </p>
      </div>
    </div>
  );
};