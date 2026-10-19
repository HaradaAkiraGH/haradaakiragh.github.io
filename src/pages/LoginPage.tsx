// Экран входа и регистрации Stellar Wiki:
// Видеофон, компактный плеер с выезжающей по ховеру громкостью и расширенные анимации
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Пути к твоим файлам в папке public/
const VIDEO_SRC = '/login-bg.mp4';
const AUDIO_SRC = '/login-bgm.mp3';

// Декоративные парящие частицы для глубины кадра
const PARTICLES = [
  { id: 1, left: '12%', top: '75%', size: 3, duration: 7, delay: 0 },
  { id: 2, left: '24%', top: '82%', size: 4, duration: 9, delay: 1.2 },
  { id: 3, left: '38%', top: '70%', size: 2, duration: 6, delay: 2.5 },
  { id: 4, left: '62%', top: '85%', size: 3, duration: 8, delay: 0.8 },
  { id: 5, left: '78%', top: '72%', size: 4, duration: 10, delay: 1.7 },
  { id: 6, left: '88%', top: '80%', size: 2, duration: 7.5, delay: 3.1 },
];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.94, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 110,
      damping: 18,
      staggerChildren: 0.07,
      delayChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 140, damping: 16 },
  },
};

export const LoginPage = () => {
  useDocumentMeta({
    title: 'Вход — Stellar Wiki',
    description: 'Авторизация в интерактивной энциклопедии Wuthering Waves.',
  });

  const { user, ready, demo, login, register } = useAuth();
  const navigate = useNavigate();

  // Режим формы: вход или регистрация
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояние компактного аудиоплеера
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('ww_login_volume');
    return saved !== null ? Number(saved) : 0.35;
  });
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem('ww_login_muted') === 'true';
  });
  const [volumeHover, setVolumeHover] = useState(false);

  // Синхронизация громкости с аудио-элементом
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
    localStorage.setItem('ww_login_volume', String(volume));
    localStorage.setItem('ww_login_muted', String(muted));
  }, [volume, muted]);

  // Попытка автозапуска музыки при входе на страницу (и фолбэк по первому клику)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;

    const tryPlay = () => {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    };

    tryPlay();

    const unlockOnInteraction = () => {
      if (audio.paused) {
        audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => {});
      }
      window.removeEventListener('pointerdown', unlockOnInteraction);
    };

    window.addEventListener('pointerdown', unlockOnInteraction, { once: true });
    return () => window.removeEventListener('pointerdown', unlockOnInteraction);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ready && user) {
    return <Navigate to="/home" replace />;
  }

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (muted) {
      setMuted(false);
      if (volume === 0) setVolume(0.35);
    } else {
      setMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setMuted(true);
    } else if (muted) {
      setMuted(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, nickname.trim());
      }
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setBusy(false);
    }
  };

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07080c] flex items-center justify-center p-4 select-none">
      {/* Фоновое аудио */}
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="auto" />

      {/* Видеофон */}
      <motion.video
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Затемняющие вуали и виньетка для читаемости стеклянной карточки */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-black/55 via-black/25 to-black/70"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.65)_100%)]"
      />

      {/* Анимированные парящие частицы */}
      <div aria-hidden="true" className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={{
              y: [0, -110, -220],
              x: [0, 15, -10],
              opacity: [0, 0.75, 0],
              scale: [0.6, 1.2, 0.5],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full bg-accent-light/80 shadow-[0_0_12px_rgba(247,236,230,0.8)]"
          />
        ))}
      </div>

      {/* Верхняя полоса: только минималистичный логотип слева */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-6 left-6 md:left-10 z-30 flex items-center gap-2.5"
      >
        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-glow-sm">
          <Sparkles size={15} className="text-accent-light" />
        </div>
        <span className="text-lg font-extrabold tracking-wider text-ivory/90 drop-shadow">
          STELLAR WIKI
        </span>
      </motion.header>

      {/* Компактный плеер: ползунок громкости появляется ТОЛЬКО при наведении на кнопку звука */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="fixed top-6 right-6 md:right-10 z-40 flex items-center gap-1 p-1 rounded-full bg-black/45 backdrop-blur-xl border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
      >
        {/* Кнопка Play / Pause */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={togglePlay}
          aria-label={playing ? 'Пауза' : 'Воспроизвести'}
          title={playing ? 'Пауза' : 'Включить музыку'}
          className="relative w-7 h-7 rounded-full flex items-center justify-center text-ivory/90 hover:text-white hover:bg-white/10 transition-colors focus-ring"
        >
          {playing && (
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-accent-light/30 pointer-events-none"
            />
          )}
          {playing ? <Pause size={13} /> : <Play size={13} className="translate-x-[0.5px]" />}
        </motion.button>

        {/* Контейнер громкости: раскрывает ползунок только при наведении */}
        <div
          onMouseEnter={() => setVolumeHover(true)}
          onMouseLeave={() => setVolumeHover(false)}
          className="flex items-center"
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleMute}
            aria-label={muted || volume === 0 ? 'Включить звук' : 'Отключить звук'}
            title={muted || volume === 0 ? 'Включить звук' : 'Отключить звук'}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors focus-ring ${
              muted || volume === 0
                ? 'text-red-300/90 hover:text-red-200 hover:bg-red-500/15'
                : 'text-ivory/90 hover:text-white hover:bg-white/10'
            }`}
          >
            <VolumeIcon size={14} />
          </motion.button>

          <AnimatePresence initial={false}>
            {volumeHover && (
              <motion.div
                initial={{ width: 0, opacity: 0, marginRight: 0 }}
                animate={{ width: 72, opacity: 1, marginRight: 8 }}
                exit={{ width: 0, opacity: 0, marginRight: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="overflow-hidden flex items-center pl-1"
              >
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Громкость музыки"
                  className="w-full h-1 bg-white/25 rounded-lg appearance-none cursor-pointer accent-[#caa07d]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Центральная стеклянная карточка входа */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 w-full max-w-[410px] rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.75)] p-7 sm:p-8 overflow-hidden"
      >
        {/* Мягкий внутренний блик сверху карточки */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full bg-accent-light/15 blur-3xl"
        />

        {/* Переключатель Вход / Регистрация */}
        <motion.div
          variants={itemVariants}
          className="relative grid grid-cols-2 p-1 mb-6 rounded-2xl bg-black/35 border border-white/10"
        >
          {(['login', 'register'] as const).map((tab) => {
            const active = mode === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setMode(tab);
                  setError(null);
                }}
                className={`relative z-10 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors focus-ring ${
                  active ? 'text-bg' : 'text-gray-300 hover:text-white'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="auth-mode-pill"
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 26 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#f7ece6] to-[#caa07d] shadow-glow-sm -z-10"
                  />
                )}
                {tab === 'login' ? 'Вход' : 'Регистрация'}
              </button>
            );
          })}
        </motion.div>

        {/* Заголовок */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="text-2xl sm:text-3xl font-bold text-ivory tracking-tight"
            >
              {mode === 'login' ? 'С возвращением, Ровер' : 'Создать аккаунт'}
            </motion.h1>
          </AnimatePresence>
          <p className="text-xs text-gray-300/80 mt-1.5">
            {mode === 'login'
              ? 'Войди для синхронизации ростера и круток'
              : 'Зарегистрируйся для сохранения прогресса в облаке'}
          </p>
        </motion.div>

        {/* Вывод ошибки */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-xs">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-300" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence initial={false}>
            {mode === 'register' && (
              <motion.div
                key="nickname-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <label className="block pb-1">
                  <span className="block text-[11px] font-medium text-gray-300 mb-1.5">
                    Никнейм (2–24 символа)
                  </span>
                  <div className="relative flex items-center">
                    <User size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      required={mode === 'register'}
                      minLength={2}
                      maxLength={24}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Rover"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-ivory placeholder-gray-400/70 focus:outline-none focus:border-accent-light/70 focus:bg-white/[0.1] transition-all"
                    />
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.label variants={itemVariants} className="block">
            <span className="block text-[11px] font-medium text-gray-300 mb-1.5">Email</span>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rover@solaris.gg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-ivory placeholder-gray-400/70 focus:outline-none focus:border-accent-light/70 focus:bg-white/[0.1] transition-all"
              />
            </div>
          </motion.label>

          <motion.label variants={itemVariants} className="block">
            <span className="block text-[11px] font-medium text-gray-300 mb-1.5">
              {mode === 'register' ? 'Пароль (мин. 8 символов, буквы и цифры)' : 'Пароль'}
            </span>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm text-ivory placeholder-gray-400/70 focus:outline-none focus:border-accent-light/70 focus:bg-white/[0.1] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                className="absolute right-3 text-gray-400 hover:text-ivory transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </motion.label>

          {/* Чекбокс «Запомнить меня» */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between text-xs text-gray-300 pt-0.5"
          >
            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-white/25 bg-black/40 accent-[#caa07d] cursor-pointer"
              />
              <span>Запомнить меня</span>
            </label>
            {demo && (
              <span className="text-[11px] text-accent-light/90">Демо-режим</span>
            )}
          </motion.div>

          {/* Кнопка отправки с анимацией блика */}
          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              whileHover={{ scale: 1.015, boxShadow: '0 0 28px rgba(202, 160, 125, 0.45)' }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={busy}
              className="group relative w-full py-3 rounded-xl bg-gradient-to-r from-[#caa07d] via-[#e5c5a8] to-[#f7ece6] text-[#0d0d0f] font-bold text-sm tracking-wide shadow-lg overflow-hidden transition-all disabled:opacity-50 focus-ring flex items-center justify-center gap-2"
            >
              {/* Пробегающий световой блик при наведении */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              />
              <span>
                {busy
                  ? 'Подождите...'
                  : mode === 'login'
                  ? 'Войти в систему'
                  : 'Зарегистрироваться'}
              </span>
              {!busy && (
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Подвал карточки */}
        <motion.div variants={itemVariants} className="mt-6 text-center text-xs text-gray-300">
          {mode === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-semibold text-ivory hover:text-accent-light underline underline-offset-4 transition-colors"
              >
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-semibold text-ivory hover:text-accent-light underline underline-offset-4 transition-colors"
              >
                Войти
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};