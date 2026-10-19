// Экран входа и регистрации Stellar Wiki:
// Видеофон, автозапуск музыки (15% громкости), вертикальный регулятор громкости и обновлённая типографика
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
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Пути к файлам в папке public/
const VIDEO_SRC = '/login-bg.mp4';
const AUDIO_SRC = '/login-bgm.mp3';

// Стартовая громкость (15% — мягкий фоновый уровень)
const DEFAULT_VOLUME = 0.15;
const VOL_STORAGE_KEY = 'ww_login_volume_v2';
const MUTE_STORAGE_KEY = 'ww_login_muted_v2';

// Декоративные парящие частицы
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

  // Состояние формы
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояние аудиоплеера
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem(VOL_STORAGE_KEY);
    return saved !== null ? Number(saved) : DEFAULT_VOLUME;
  });
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  });
  const [volumeHover, setVolumeHover] = useState(false);

  // Применяем громкость и сохраняем настройки
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
    localStorage.setItem(VOL_STORAGE_KEY, String(volume));
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
  }, [volume, muted]);

  // Автозапуск музыки при входе на страницу + мгновенный подхват при блокировке браузером
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;

    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];

    const removeUnlockListeners = () => {
      events.forEach((ev) => window.removeEventListener(ev, tryStartAudio));
    };

    function tryStartAudio() {
      const el = audioRef.current;
      if (!el) return;
      if (!el.paused) {
        setPlaying(true);
        removeUnlockListeners();
        return;
      }
      el.play()
        .then(() => {
          setPlaying(true);
          removeUnlockListeners();
        })
        .catch(() => {
          // Браузер ждёт первого жеста пользователя — слушатели остаются активными
        });
    }

    tryStartAudio();
    events.forEach((ev) => window.addEventListener(ev, tryStartAudio, { passive: true }));

    return () => removeUnlockListeners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ready && user) {
    return <Navigate to="/home" replace />;
  }

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (muted) {
      setMuted(false);
      if (volume === 0) setVolume(DEFAULT_VOLUME);
      if (audio && audio.paused) {
        audio.play().catch(() => {});
      }
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
    const audio = audioRef.current;
    if (audio && audio.paused && val > 0) {
      audio.play().catch(() => {});
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

  const effectiveVolume = muted ? 0 : volume;
  const VolumeIcon = effectiveVolume === 0 ? VolumeX : effectiveVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07080c] flex items-center justify-center p-4 select-none">
      {/* Подключение шрифтов Jost и Montserrat для карточки логина */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Montserrat:wght@500;600;700&display=swap');
        .login-card-font {
          font-family: 'Jost', sans-serif;
        }
        .login-title-font {
          font-family: 'Montserrat', sans-serif;
        }
      `}</style>

      {/* Фоновое аудио с автозапуском */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        autoPlay
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

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

      {/* Затемняющие вуали и виньетка */}
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

      {/* Верхняя полоса: только название сайта с прежним шрифтом (без лого-иконки слева) */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-6 left-6 md:left-10 z-30 flex items-center"
      >
        <span className="font-sans text-lg font-extrabold tracking-wider text-ivory/90 drop-shadow">
          STELLAR WIKI
        </span>
      </motion.header>

      {/* Компактный плеер: кнопки стоят на месте, а ползунок громкости выпадает ВЕРТИКАЛЬНО вниз */}
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

        {/* Кнопка звука + выпадающий вниз вертикальный ползунок */}
        <div
          onMouseEnter={() => setVolumeHover(true)}
          onMouseLeave={() => setVolumeHover(false)}
          className="relative flex items-center justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleMute}
            aria-label={effectiveVolume === 0 ? 'Включить звук' : 'Отключить звук'}
            title={effectiveVolume === 0 ? 'Включить звук' : 'Отключить звук'}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors focus-ring ${
              effectiveVolume === 0
                ? 'text-red-300/90 hover:text-red-200 hover:bg-red-500/15'
                : 'text-ivory/90 hover:text-white hover:bg-white/10'
            }`}
          >
            <VolumeIcon size={14} />
          </motion.button>

          <AnimatePresence>
            {volumeHover && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.92 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50"
              >
                <div className="w-9 py-3 rounded-2xl bg-black/65 backdrop-blur-2xl border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.65)] flex flex-col items-center gap-2">
                  {/* Область вертикального ползунка */}
                  <div className="relative w-6 h-24 flex items-center justify-center">
                    {/* Визуальная дорожка */}
                    <div className="w-1.5 h-full rounded-full bg-white/20 overflow-hidden relative pointer-events-none">
                      <div
                        style={{ height: `${effectiveVolume * 100}%` }}
                        className="absolute bottom-0 inset-x-0 rounded-full bg-gradient-to-t from-[#caa07d] to-[#f7ece6]"
                      />
                    </div>
                    {/* Светящийся бегунок */}
                    <div
                      style={{ bottom: `calc(${effectiveVolume * 100}% - 5px)` }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-[#f7ece6] shadow-[0_0_8px_rgba(247,236,230,0.9)] pointer-events-none"
                    />
                    {/* Интерактивный input поверх дорожки (0 внизу, 1 вверху) */}
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={effectiveVolume}
                      onChange={handleVolumeChange}
                      aria-label="Громкость музыки"
                      className="absolute w-24 h-6 -rotate-90 opacity-0 cursor-pointer z-10"
                    />
                  </div>

                  {/* Процент громкости */}
                  <span className="login-card-font text-[10px] font-medium text-ivory/75 tabular-nums">
                    {Math.round(effectiveVolume * 100)}%
                  </span>
                </div>
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
        className="login-card-font relative z-20 w-full max-w-[415px] rounded-3xl bg-black/35 backdrop-blur-2xl border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.75)] p-7 sm:p-8 overflow-hidden"
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
                className={`login-title-font relative z-10 py-2 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors focus-ring ${
                  active ? 'text-[#0d0d0f]' : 'text-gray-300 hover:text-white'
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
              className="login-title-font text-2xl sm:text-[26px] font-semibold tracking-[0.03em] bg-gradient-to-r from-white via-[#f7ece6] to-[#caa07d] bg-clip-text text-transparent"
            >
              {mode === 'login' ? 'С возвращением, Ровер' : 'Создать аккаунт'}
            </motion.h1>
          </AnimatePresence>
          <p className="text-sm font-light tracking-[0.02em] text-gray-300/80 mt-1.5">
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
                  <span className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#e5c5a8]/85 mb-1.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm tracking-wide text-ivory placeholder-gray-400/70 focus:outline-none focus:border-accent-light/70 focus:bg-white/[0.1] transition-all"
                    />
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.label variants={itemVariants} className="block">
            <span className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#e5c5a8]/85 mb-1.5">
              Email
            </span>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rover@solaris.gg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm tracking-wide text-ivory placeholder-gray-400/70 focus:outline-none focus:border-accent-light/70 focus:bg-white/[0.1] transition-all"
              />
            </div>
          </motion.label>

          <motion.label variants={itemVariants} className="block">
            <span className="block text-[11px] uppercase tracking-[0.14em] font-medium text-[#e5c5a8]/85 mb-1.5">
              {mode === 'register' ? 'Пароль (мин. 8 символов)' : 'Пароль'}
            </span>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-gray-400 pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-sm tracking-wide text-ivory placeholder-gray-400/70 focus:outline-none focus:border-accent-light/70 focus:bg-white/[0.1] transition-all"
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
            className="flex items-center justify-between text-xs tracking-wide text-gray-300 pt-0.5"
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

          {/* Кнопка отправки */}
          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              whileHover={{ scale: 1.015, boxShadow: '0 0 28px rgba(202, 160, 125, 0.45)' }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={busy}
              className="login-title-font group relative w-full py-3 rounded-xl bg-gradient-to-r from-[#caa07d] via-[#e5c5a8] to-[#f7ece6] text-[#0d0d0f] font-bold text-xs uppercase tracking-[0.12em] shadow-lg overflow-hidden transition-all disabled:opacity-50 focus-ring flex items-center justify-center gap-2"
            >
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
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Подвал карточки */}
        <motion.div variants={itemVariants} className="mt-6 text-center text-xs tracking-wide text-gray-300">
          {mode === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-medium text-ivory hover:text-accent-light underline underline-offset-4 transition-colors"
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
                className="font-medium text-ivory hover:text-accent-light underline underline-offset-4 transition-colors"
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