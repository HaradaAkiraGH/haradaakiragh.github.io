// Экран входа и регистрации Stellar Wiki:
// Видеофон, автозапуск музыки (15%), вертикальный ползунок громкости и единый шрифт Manrope
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

// Пути к медиафайлам в папке public/
const VIDEO_SRC = '/login-bg.mp4';
const AUDIO_SRC = '/login-bgm.mp3';

// Стартовая громкость (15%)
const DEFAULT_VOLUME = 0.15;
const VOL_STORAGE_KEY = 'ww_login_volume_v3';
const MUTE_STORAGE_KEY = 'ww_login_muted_v3';

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
  hidden: { opacity: 0, y: 24, scale: 0.95, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 115,
      damping: 18,
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
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

  // Сохранение и синхронизация громкости
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = muted ? 0 : volume;
    audio.muted = muted;
    localStorage.setItem(VOL_STORAGE_KEY, String(volume));
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
  }, [volume, muted]);

  // Многоступенчатый автозапуск музыки (Web Audio API + muted-старт + перехват движения мыши)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const targetVol = muted ? 0 : volume;
    audio.volume = targetVol;

    const events = [
      'mouseover',
      'mousemove',
      'pointermove',
      'pointerenter',
      'focus',
      'keydown',
      'wheel',
      'pointerdown',
      'touchstart',
    ];

    const removeUnlockListeners = () => {
      events.forEach((ev) => window.removeEventListener(ev, unlockAudio));
    };

    function unlockAudio() {
      const el = audioRef.current;
      if (!el) return;
      el.muted = muted;
      el.volume = muted ? 0 : volume;
      el.play()
        .then(() => {
          setPlaying(true);
          removeUnlockListeners();
        })
        .catch(() => {});
    }

    const startImmediately = async () => {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
          }
        }
        audio.muted = muted;
        audio.volume = targetVol;
        await audio.play();
        setPlaying(true);
        removeUnlockListeners();
      } catch {
        // Если браузер заблокировал прямой звук — запускаем поток без звука и снимаем mute при первом движении
        try {
          audio.muted = true;
          await audio.play();
          setTimeout(() => {
            if (!audioRef.current) return;
            audioRef.current.muted = muted;
            audioRef.current.volume = targetVol;
            setPlaying(!audioRef.current.paused);
          }, 60);
        } catch {
          // Слушатели событий подхватят при малейшем наведении курсора на окно
        }
      }
    };

    startImmediately();
    events.forEach((ev) => window.addEventListener(ev, unlockAudio, { passive: true }));

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
      audio.muted = muted;
      audio.volume = muted ? 0 : volume;
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
    <div
      style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
      className="relative min-h-screen w-full overflow-hidden bg-[#07080c] flex items-center justify-center p-4 select-none"
    >
      {/* Фоновое аудио */}
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
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Многослойное затемнение и виньетка */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#07080c]/60 via-[#07080c]/20 to-[#07080c]/75"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(5,6,10,0.7)_100%)]"
      />

      {/* Парящие частицы */}
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

      {/* Верхняя полоса: только название сайта */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-6 left-6 md:left-10 z-30 flex items-center"
      >
        <span className="text-lg font-extrabold tracking-wider text-ivory/90 drop-shadow">
          STELLAR WIKI
        </span>
      </motion.header>

      {/* Компактный плеер с вертикальным ползунком громкости вниз */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        className="fixed top-6 right-6 md:right-10 z-40 flex items-center gap-1 p-1 rounded-full bg-[#0b0d14]/60 backdrop-blur-2xl border border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
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
                <div className="w-9 py-3 rounded-2xl bg-[#0b0d14]/85 backdrop-blur-2xl border border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.75)] flex flex-col items-center gap-2">
                  <div className="relative w-6 h-24 flex items-center justify-center">
                    <div className="w-1.5 h-full rounded-full bg-white/15 overflow-hidden relative pointer-events-none">
                      <div
                        style={{ height: `${effectiveVolume * 100}%` }}
                        className="absolute bottom-0 inset-x-0 rounded-full bg-gradient-to-t from-[#caa07d] to-[#f7ece6]"
                      />
                    </div>
                    <div
                      style={{ bottom: `calc(${effectiveVolume * 100}% - 5px)` }}
                      className="absolute w-2.5 h-2.5 rounded-full bg-[#f7ece6] shadow-[0_0_8px_rgba(247,236,230,0.9)] pointer-events-none"
                    />
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

                  <span className="text-[10px] font-bold text-ivory/85 tabular-nums">
                    {Math.round(effectiveVolume * 100)}%
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Центральная стеклянная карточка в стиле терминала Wuthering Waves */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 w-full max-w-[420px] rounded-[28px] bg-[#0b0d14]/55 backdrop-blur-2xl border border-white/[0.12] shadow-[0_30px_90px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)] p-7 sm:p-9 overflow-hidden"
      >
        {/* Золотистая световая линия на верхней грани */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-[#caa07d]/60 to-transparent"
        />

        {/* Декоративные уголки-скобы интерфейса Соларис-3 */}
        <span aria-hidden="true" className="pointer-events-none absolute top-3.5 left-3.5 w-2.5 h-2.5 border-t border-l border-[#caa07d]/40 rounded-tl-sm" />
        <span aria-hidden="true" className="pointer-events-none absolute top-3.5 right-3.5 w-2.5 h-2.5 border-t border-r border-[#caa07d]/40 rounded-tr-sm" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3.5 left-3.5 w-2.5 h-2.5 border-b border-l border-[#caa07d]/40 rounded-bl-sm" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-3.5 right-3.5 w-2.5 h-2.5 border-b border-r border-[#caa07d]/40 rounded-br-sm" />

        {/* Мягкое внутреннее свечение сверху */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-36 rounded-full bg-[#caa07d]/15 blur-3xl"
        />

        {/* Переключатель Вход / Регистрация */}
        <motion.div
          variants={itemVariants}
          className="relative grid grid-cols-2 p-1 mb-7 rounded-2xl bg-black/45 border border-white/[0.08]"
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
                className={`relative z-10 py-2.5 text-[13px] font-bold tracking-tight rounded-xl transition-colors focus-ring ${
                  active ? 'text-[#0b0d14]' : 'text-gray-400 hover:text-ivory'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="auth-mode-pill"
                    transition={{ type: 'spring' as const, stiffness: 320, damping: 26 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#f7ece6] via-[#e5c5a8] to-[#caa07d] shadow-[0_2px_16px_rgba(202,160,125,0.35)] -z-10"
                  />
                )}
                {tab === 'login' ? 'Вход' : 'Регистрация'}
              </button>
            );
          })}
        </motion.div>

        {/* Заголовок карточки (тем же шрифтом и жирностью, что и STELLAR WIKI) */}
        <motion.div variants={itemVariants} className="text-center mb-7">
          <AnimatePresence mode="wait">
            <motion.h1
              key={mode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-white leading-snug"
            >
              {mode === 'login' ? (
                <>
                  С возвращением,{' '}
                  <span className="bg-gradient-to-r from-[#f7ece6] to-[#caa07d] bg-clip-text text-transparent">
                    Ровер
                  </span>
                </>
              ) : (
                <>
                  Новый{' '}
                  <span className="bg-gradient-to-r from-[#f7ece6] to-[#caa07d] bg-clip-text text-transparent">
                    аккаунт
                  </span>
                </>
              )}
            </motion.h1>
          </AnimatePresence>
          <p className="text-[13px] font-medium text-gray-400 mt-1.5">
            {mode === 'login'
              ? 'Войди для синхронизации ростера и истории круток'
              : 'Создай профиль для сохранения данных в облаке'}
          </p>
        </motion.div>

        {/* Уведомление об ошибке */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-xs font-medium">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-300" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Поля ввода */}
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
                  <span className="block text-xs font-bold text-ivory/90 mb-1.5 ml-0.5">
                    Никнейм <span className="text-gray-500 font-medium">(2–24 символа)</span>
                  </span>
                  <div className="relative flex items-center group">
                    <User size={16} className="absolute left-3.5 text-gray-400 group-focus-within:text-[#caa07d] transition-colors pointer-events-none" />
                    <input
                      type="text"
                      required={mode === 'register'}
                      minLength={2}
                      maxLength={24}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="Rover"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/35 border border-white/[0.1] text-sm font-medium text-ivory placeholder-gray-500 focus:outline-none focus:border-[#caa07d]/60 focus:bg-black/50 transition-all"
                    />
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.label variants={itemVariants} className="block">
            <span className="block text-xs font-bold text-ivory/90 mb-1.5 ml-0.5">
              Электронная почта
            </span>
            <div className="relative flex items-center group">
              <Mail size={16} className="absolute left-3.5 text-gray-400 group-focus-within:text-[#caa07d] transition-colors pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rover@solaris.gg"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/35 border border-white/[0.1] text-sm font-medium text-ivory placeholder-gray-500 focus:outline-none focus:border-[#caa07d]/60 focus:bg-black/50 transition-all"
              />
            </div>
          </motion.label>

          <motion.label variants={itemVariants} className="block">
            <span className="block text-xs font-bold text-ivory/90 mb-1.5 ml-0.5">
              Пароль {mode === 'register' && <span className="text-gray-500 font-medium">(мин. 8 символов)</span>}
            </span>
            <div className="relative flex items-center group">
              <Lock size={16} className="absolute left-3.5 text-gray-400 group-focus-within:text-[#caa07d] transition-colors pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/35 border border-white/[0.1] text-sm font-medium text-ivory placeholder-gray-500 focus:outline-none focus:border-[#caa07d]/60 focus:bg-black/50 transition-all"
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

          {/* Чекбокс */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between text-xs font-medium text-gray-300 pt-0.5"
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
              <span className="text-[11px] font-semibold text-[#caa07d]">Демо-режим</span>
            )}
          </motion.div>

          {/* Кнопка отправки */}
          <motion.div variants={itemVariants} className="pt-2">
            <motion.button
              whileHover={{ scale: 1.015, boxShadow: '0 0 30px rgba(202, 160, 125, 0.4)' }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              disabled={busy}
              className="group relative w-full py-3 rounded-xl bg-gradient-to-r from-[#caa07d] via-[#e5c5a8] to-[#f7ece6] text-[#0b0d14] font-extrabold text-sm tracking-tight shadow-lg overflow-hidden transition-all disabled:opacity-50 focus-ring flex items-center justify-center gap-2"
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
                  : 'Создать аккаунт'}
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

        {/* Подвал */}
        <motion.div variants={itemVariants} className="mt-6 text-center text-xs font-medium text-gray-400">
          {mode === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-bold text-ivory hover:text-[#caa07d] underline underline-offset-4 transition-colors"
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
                className="font-bold text-ivory hover:text-[#caa07d] underline underline-offset-4 transition-colors"
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