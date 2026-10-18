// Экран входа в стиле референса (прозрачное матовое стекло поверх панорамы Соларис-3,
// угловая кнопка закрытия карточки, поля с нижней линией и иконками справа,
// верхняя навигационная шапка и фоновая тема "Saving Light" из Wuthering Waves 1.0)
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, UserRound, AlertCircle, X, Volume2, VolumeX,
  Play, Pause, Compass, Sparkles, CheckCircle2, HelpCircle, Shield,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { savingLightPlayer } from '../utils/savingLightAudio';

const REMEMBER_KEY = 'ww_remember_email';

export const LoginPage = () => {
  useDocumentMeta({
    title: 'Вход · Saving Light',
    description: 'Терминал входа Stellar Wiki — архив и база знаний Соларис-3.',
  });
  const { login, register, demo, ready, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [cardOpen, setCardOpen] = useState(true);
  const [infoSection, setInfoSection] = useState<'about' | 'features' | 'ost' | null>(null);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_KEY) || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Состояние музыкального плеера "Saving Light"
  const [audioState, setAudioState] = useState(() => savingLightPlayer.getState());

  useEffect(() => {
    const unsub = savingLightPlayer.subscribe(() => {
      setAudioState(savingLightPlayer.getState());
    });
    return () => {
      unsub();
      savingLightPlayer.stop();
    };
  }, []);

  // Автозапуск "Saving Light" при первом клике/нажатии пользователя (политика браузеров)
  useEffect(() => {
    let triggered = false;
    const startOnGesture = (e: Event) => {
      if (triggered) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-audio-control="true"]')) return;
      triggered = true;
      if (!savingLightPlayer.getState().playing) {
        savingLightPlayer.start();
      }
    };
    window.addEventListener('pointerdown', startOnGesture, { once: true });
    window.addEventListener('keydown', startOnGesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startOnGesture);
      window.removeEventListener('keydown', startOnGesture);
    };
  }, []);

  if (ready && user) {
    return <Navigate to="/home" replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Укажи Email для восстановления доступа');
        return;
      }
      setNotice(
        demo
          ? 'В демо-режиме подойдёт любой пароль — просто вернись ко входу и нажми «Войти».'
          : `Инструкция по сбросу пароля отправлена на ${email.trim()}.`,
      );
      return;
    }

    if (mode === 'register' && password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setBusy(true);
    try {
      try {
        if (remember && email.trim()) {
          localStorage.setItem(REMEMBER_KEY, email.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
      } catch {
        /* ignore */
      }

      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, nickname.trim());
      }
      savingLightPlayer.stop();
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так');
    } finally {
      setBusy(false);
    }
  };

  const quickGuestLogin = async () => {
    setError(null);
    setBusy(true);
    try {
      await login(email.trim() || 'rover@solaris3.gg', password || 'solaris3');
      savingLightPlayer.stop();
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить быстрый вход');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden select-none sm:select-auto">
      {/* Фоновый арт экрана входа (image_bd3517.jpg) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-[1.02]"
        style={{
          backgroundImage: `url('/images/login-bg.jpg')`,
        }}
      />
      {/* Многослойная кинематографическая вуаль для идеальной читаемости матового стекла */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#07111e]/60 via-[#091526]/30 to-[#060b14]/80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_42%,transparent_25%,rgba(4,9,18,0.62)_100%)]"
      />

      {/* Верхняя навигационная панель как на референсе (Logo слева + ссылки и кнопка Login справа) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setInfoSection(null);
            setCardOpen(true);
          }}
          className="flex items-center gap-3 group focus-ring rounded-xl text-left"
        >
          <span className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-ivory shadow-lg group-hover:border-accent-light transition-colors">
            <Compass size={20} className="text-accent-light" />
          </span>
          <div>
            <span className="block text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow">
              Stellar Wiki
            </span>
            <span className="block text-[10px] uppercase tracking-[0.24em] text-white/70">
              Solaris-3 Terminal · v1.0
            </span>
          </div>
        </button>

        {/* Правое меню шапки + плеер Saving Light + кнопка Login в рамке */}
        <nav className="flex items-center gap-2 sm:gap-5">
          <button
            type="button"
            onClick={() => setInfoSection(infoSection === 'about' ? null : 'about')}
            className={`hidden md:inline-block text-sm font-semibold transition-colors relative py-1 ${
              infoSection === 'about'
                ? 'text-accent-light after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent-light'
                : 'text-white/85 hover:text-white'
            }`}
          >
            О проекте
          </button>
          <button
            type="button"
            onClick={() => setInfoSection(infoSection === 'features' ? null : 'features')}
            className={`hidden md:inline-block text-sm font-semibold transition-colors relative py-1 ${
              infoSection === 'features'
                ? 'text-accent-light after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent-light'
                : 'text-white/85 hover:text-white'
            }`}
          >
            Разделы
          </button>
          <button
            type="button"
            onClick={() => setInfoSection(infoSection === 'ost' ? null : 'ost')}
            className={`hidden lg:inline-block text-sm font-semibold transition-colors relative py-1 ${
              infoSection === 'ost'
                ? 'text-accent-light after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent-light'
                : 'text-white/85 hover:text-white'
            }`}
          >
            Саундтрек
          </button>

          {/* Компактный пульт управления музыкой "Saving Light (Wuthering Waves 1.0)" */}
          <div
            data-audio-control="true"
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#102030]/65 backdrop-blur-xl border border-white/25 text-white shadow-lg"
          >
            <button
              type="button"
              onClick={() => savingLightPlayer.toggle()}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-accent-light transition-colors focus-ring"
              aria-label={audioState.playing ? 'Пауза Saving Light' : 'Включить Saving Light'}
              title={audioState.playing ? 'Пауза: Saving Light' : 'Играть: Saving Light (WuWa 1.0)'}
            >
              {audioState.playing ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <div className="hidden sm:flex flex-col min-w-0 pr-1">
              <span className="text-[11px] font-bold leading-tight text-white flex items-center gap-1.5">
                Saving Light
                {audioState.playing && !audioState.muted && (
                  <span className="inline-flex items-end gap-0.5 h-2.5" aria-hidden="true">
                    <span className="w-0.5 h-2.5 bg-accent-light animate-pulse rounded-full" />
                    <span className="w-0.5 h-1.5 bg-accent-light animate-pulse rounded-full" />
                    <span className="w-0.5 h-2 bg-accent-light animate-pulse rounded-full" />
                  </span>
                )}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-white/65">
                WuWa 1.0 Login OST
              </span>
            </div>
            <button
              type="button"
              onClick={() => savingLightPlayer.setMuted(!audioState.muted)}
              className="p-1 text-white/75 hover:text-white transition-colors focus-ring rounded"
              aria-label={audioState.muted ? 'Включить звук' : 'Выключить звук'}
              title={audioState.muted ? 'Включить звук' : 'Выключить звук'}
            >
              {audioState.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>

          {/* Кнопка Login в рамке (как в правом верхнем углу на референсе) */}
          <button
            type="button"
            onClick={() => {
              setInfoSection(null);
              setCardOpen((v) => !v);
            }}
            className="px-4 sm:px-6 py-2 rounded-xl border-2 border-white/80 text-white text-sm font-bold tracking-wide hover:bg-white hover:text-[#162938] transition-all duration-200 shadow-lg focus-ring"
          >
            {cardOpen ? 'Вход' : 'Открыть вход'}
          </button>
        </nav>
      </header>

      {/* Информационная карточка разделов шапки (если выбрана вкладка О проекте / Разделы / Саундтрек) */}
      {infoSection && (
        <div className="relative z-20 max-w-xl mx-auto px-4 mt-3 w-full animate-fade-in">
          <div className="rounded-2xl bg-[#102030]/80 backdrop-blur-2xl border border-white/25 p-4 sm:p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-accent-light flex items-center gap-1.5">
                <Sparkles size={13} />
                {infoSection === 'about' && 'О терминале Stellar Wiki'}
                {infoSection === 'features' && 'Модули базы знаний'}
                {infoSection === 'ost' && 'Саундтрек экрана входа · Saving Light'}
              </span>
              <button
                type="button"
                onClick={() => setInfoSection(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white"
                aria-label="Закрыть справку"
              >
                <X size={15} />
              </button>
            </div>
            {infoSection === 'about' && (
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
                Stellar Wiki — интерактивная энциклопедия и командный центр по Wuthering Waves:
                61 резонатор с билдами и лором, тренажёр ротаций, интерактивная карта Соларис-3,
                трекер круток и двухуровневый бестиарий.
              </p>
            )}
            {infoSection === 'features' && (
              <div className="grid grid-cols-2 gap-2 text-xs text-white/85">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-accent-light block">Каталог и Мета</strong>
                  Билды, эхо-наборы, тир-листы Tower of Adversity и Whimpering Wastes.
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <strong className="text-accent-light block">Инструменты Rover</strong>
                  Pull Tracker, DPS-калькулятор, карта регионов и картотека бестиария.
                </div>
              </div>
            )}
            {infoSection === 'ost' && (
              <div className="space-y-2 text-xs text-white/85">
                <p>
                  На экране входа звучит тема <strong>«Saving Light (Menu Ver.)»</strong> из патча
                  Wuthering Waves 1.0 (тональность D minor / F major, композитор Thena A, Pioneer
                  Podcast).
                </p>
                <div className="flex items-center gap-3 pt-1" data-audio-control="true">
                  <span className="text-[11px] text-white/70">Громкость:</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round((audioState.muted ? 0 : audioState.volume) * 100)}
                    onChange={(e) => savingLightPlayer.setVolume(Number(e.target.value) / 100)}
                    className="w-40"
                    aria-label="Громкость музыки Saving Light"
                  />
                  <span className="text-[11px] font-mono text-accent-light">
                    {Math.round((audioState.muted ? 0 : audioState.volume) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Центральная зона: карточка из матового стекла точно по макету image_bd349e.jpg */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        {cardOpen ? (
          <div className="relative w-full max-w-[410px] rounded-[22px] bg-[#162938]/35 backdrop-blur-xl border-2 border-white/35 shadow-[0_20px_55px_rgba(0,0,0,0.65)] px-7 py-8 sm:px-9 sm:py-9 text-white animate-slide-up overflow-hidden">
            {/* Фирменная угловая кнопка закрытия «×» в правом верхнем углу карточки (как на референсе) */}
            <button
              type="button"
              onClick={() => setCardOpen(false)}
              className="absolute top-0 right-0 w-11 h-11 bg-[#162938] hover:bg-accent text-white hover:text-bg rounded-bl-[20px] flex items-center justify-center transition-colors shadow-md focus-ring"
              aria-label="Свернуть окно входа и смотреть арт"
              title="Скрыть форму (режим обоев)"
            >
              <X size={20} strokeWidth={2.5} />
            </button>

            {/* Заголовок */}
            <h1 className="text-2xl sm:text-[28px] font-extrabold text-white text-center tracking-tight mb-1">
              {mode === 'login' && 'Login'}
              {mode === 'register' && 'Регистрация'}
              {mode === 'forgot' && 'Сброс пароля'}
            </h1>
            <p className="text-center text-xs text-white/75 mb-6">
              {mode === 'login' && 'С возвращением в Соларис-3, Rover'}
              {mode === 'register' && 'Создай профиль резонатора Stellar Wiki'}
              {mode === 'forgot' && 'Восстановление доступа к терминалу'}
            </p>

            {error && (
              <p className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/25 border border-red-300/40 text-red-100 text-xs">
                <AlertCircle size={15} className="shrink-0" /> {error}
              </p>
            )}

            {notice && (
              <p className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/25 border border-emerald-300/40 text-emerald-100 text-xs">
                <CheckCircle2 size={15} className="shrink-0" /> {notice}
              </p>
            )}

            <form onSubmit={submit} className="space-y-5">
              {mode === 'register' && (
                <div className="relative border-b-2 border-white/75 focus-within:border-accent-light transition-colors pt-2 pb-1.5">
                  <label
                    htmlFor="login-nickname"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-white/75"
                  >
                    Позывной (Nickname)
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      id="login-nickname"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Rover"
                      className="w-full bg-transparent text-sm text-white placeholder-white/45 outline-none pr-2 font-medium"
                      required
                    />
                    <UserRound size={17} className="text-white/85 shrink-0" />
                  </div>
                </div>
              )}

              {/* Поле Email с нижней границей и иконкой конверта справа (как на референсе) */}
              <div className="relative border-b-2 border-white/75 focus-within:border-accent-light transition-colors pt-2 pb-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-white/75"
                >
                  Email
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rover@solaris3.gg"
                    className="w-full bg-transparent text-sm text-white placeholder-white/45 outline-none pr-2 font-medium"
                    required
                  />
                  <Mail size={17} className="text-white/85 shrink-0" />
                </div>
              </div>

              {/* Поле Password с нижней границей и иконкой замка справа */}
              {mode !== 'forgot' && (
                <div className="relative border-b-2 border-white/75 focus-within:border-accent-light transition-colors pt-2 pb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-white/75"
                  >
                    Password
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-white placeholder-white/45 outline-none pr-2 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="text-white/70 hover:text-white transition-colors"
                      aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                      title={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <Lock size={17} className="text-white/85 shrink-0" />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="relative border-b-2 border-white/75 focus-within:border-accent-light transition-colors pt-2 pb-1.5">
                  <label
                    htmlFor="login-confirm"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-white/75"
                  >
                    Повтори пароль
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      id="login-confirm"
                      type={showPass ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent text-sm text-white placeholder-white/45 outline-none pr-2 font-medium"
                      required
                    />
                    <Lock size={17} className="text-white/85 shrink-0" />
                  </div>
                </div>
              )}

              {/* Строка Remember me + Forgot Password? как на референсе */}
              {mode !== 'forgot' && (
                <div className="flex items-center justify-between gap-2 text-xs text-white/90 pt-0.5">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-white/50 accent-[#162938]"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setNotice(null);
                    }}
                    className="text-white/85 hover:text-accent-light hover:underline font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Главная тёмная кнопка Login во всю ширину карточки (как на макете image_bd349e.jpg) */}
              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 rounded-lg bg-[#162938] hover:bg-[#1f3a4f] text-white font-bold text-sm tracking-wide shadow-lg border border-white/15 hover:border-accent-light/50 transition-all duration-200 focus-ring disabled:opacity-50"
              >
                {busy
                  ? 'Синхронизация...'
                  : mode === 'login'
                  ? 'Login'
                  : mode === 'register'
                  ? 'Register'
                  : 'Восстановить доступ'}
              </button>
            </form>

            {/* Переключатель Don't have an account? Register */}
            <div className="mt-5 text-center text-xs text-white/90 space-y-2">
              {mode === 'login' && (
                <p>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError(null);
                      setNotice(null);
                    }}
                    className="font-bold text-white hover:text-accent-light hover:underline ml-1"
                  >
                    Register
                  </button>
                </p>
              )}
              {mode === 'register' && (
                <p>
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setNotice(null);
                    }}
                    className="font-bold text-white hover:text-accent-light hover:underline ml-1"
                  >
                    Login
                  </button>
                </p>
              )}
              {mode === 'forgot' && (
                <p>
                  Вспомнили пароль?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                      setNotice(null);
                    }}
                    className="font-bold text-white hover:text-accent-light hover:underline ml-1"
                  >
                    Вернуться ко входу
                  </button>
                </p>
              )}

              {/* Быстрый вход в 1 клик для демо-режима */}
              {demo && (
                <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-2 text-[11px] text-white/75">
                  <span className="inline-flex items-center gap-1">
                    <Shield size={12} className="text-accent-light" /> Демо-терминал открыт
                  </span>
                  <button
                    type="button"
                    onClick={quickGuestLogin}
                    className="text-accent-light hover:underline font-semibold"
                  >
                    Войти как Rover →
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Режим чистого экрана входа Wuthering Waves 1.0, когда окно свернуто кнопкой × */
          <div className="flex flex-col items-center text-center animate-fade-in">
            <button
              type="button"
              onClick={() => setCardOpen(true)}
              className="group px-7 py-3.5 rounded-2xl bg-[#162938]/55 hover:bg-[#162938]/80 backdrop-blur-xl border border-white/35 text-white font-bold text-sm tracking-[0.18em] uppercase shadow-2xl transition-all duration-300 hover:scale-105 focus-ring"
            >
              Нажмите, чтобы войти в Соларис-3
            </button>
            <p className="mt-2.5 text-xs text-white/75 drop-shadow">
              Звучит тема входа Wuthering Waves 1.0 — «Saving Light»
            </p>
          </div>
        )}
      </main>

      {/* Нижняя строка статуса как в игровом лобби Wuthering Waves 1.0 */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 pb-3 sm:pb-5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-white/70">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Сервер: Solaris-3 Archive · BGM: Saving Light (v1.0)
        </span>
        <span className="flex items-center gap-1">
          <HelpCircle size={12} /> Нажми на плеер сверху для управления звуком
        </span>
      </footer>
    </div>
  );
};