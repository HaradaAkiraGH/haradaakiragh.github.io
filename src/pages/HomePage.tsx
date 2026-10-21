// Главная страница Stellar Wiki:
// Интерактивный Hero-шоукейс резонаторов, личный терминал Ровера, таймер серверов Соларис-3,
// Bento-навигация по разделам, срез S-тира меты и рулетка случайного персонажа
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Users,
  Dice5,
  Map,
  Trophy,
  Calculator,
  Archive,
  ArrowRight,
  Clock,
  Shuffle,
  ShieldCheck,
  ChevronRight,
  Star,
  Compass,
  BookOpen,
  Newspaper,
} from 'lucide-react';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { MAP_MARKERS } from '../data/map';
import {
  ELEMENTS,
  WEAPON_LABELS,
  WEAPON_ICONS,
  TIER_STYLES,
} from '../utils/constants';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import {
  getCachedLuckSummary,
  getCachedResonanceChains,
} from '../utils/pullMatch';
import { PlayerProfile } from '../data/types';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '700134928',
  nickname: 'HaradaAkira',
  unionLevel: 80,
  signature: '',
  roster: [],
};

// Персонажи для главной интерактивной витрины
const SPOTLIGHT_IDS = [
  'camellya',
  'cartethyia',
  'shorekeeper',
  'changli',
  'jinhsi',
  'phrolova',
];

const ELEMENT_AURA: Record<string, string> = {
  Spectro: 'from-amber-500/25 via-amber-900/10 to-transparent',
  Havoc: 'from-rose-500/30 via-fuchsia-900/15 to-transparent',
  Fusion: 'from-orange-500/30 via-red-900/15 to-transparent',
  Glacio: 'from-cyan-400/25 via-sky-900/15 to-transparent',
  Electro: 'from-purple-500/30 via-indigo-900/15 to-transparent',
  Aero: 'from-emerald-400/25 via-teal-900/15 to-transparent',
};

/* Расчёт оставшегося времени до ежедневного сброса сервера (04:00) */
function getDailyResetCountdown(): string {
  const now = new Date();
  const target = new Date(now);
  target.setHours(4, 0, 0, 0);
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  const diff = Math.max(0, target.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const HomePage = () => {
  useDocumentMeta({
    title: 'Главная — Stellar Wiki · Энциклопедия Wuthering Waves',
    description:
      'Интерактивная база знаний Wuthering Waves: все 61 резонатор, Pull Tracker с аналитикой 50/50, карта мира, Бестиарий и Оценщик Эхо.',
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [collected] = useLocalStorage<string[]>('ww_map_collected', []);

  // Кэш круток и созвездий S0–S6
  const [luckSummary] = useState(() => getCachedLuckSummary());
  const [pullChains] = useState(() => getCachedResonanceChains());

  // Индекс активного персонажа в Hero-витрине
  const spotlightChars = useMemo(
    () =>
      SPOTLIGHT_IDS.map((id) => getCharacterById(id)).filter(
        (c): c is NonNullable<typeof c> => Boolean(c),
      ),
    [],
  );
  const [spotIdx, setSpotIdx] = useState(0);
  const [pauseAutoSlide, setPauseAutoSlide] = useState(false);

  // Режим быстрого просмотра S-тира на главной
  const [metaMode, setMetaMode] = useState<'tower' | 'realm'>('tower');

  // Случайный резонатор («Испытать резонанс»)
  const [randomCharId, setRandomCharId] = useState<string>(() => {
    const idx = new Date().getDate() % CHARACTERS.length;
    return CHARACTERS[idx]?.id ?? 'camellya';
  });
  const [rollingRandom, setRollingRandom] = useState(false);

  // Живой таймер до сброса серверов
  const [resetTimer, setResetTimer] = useState(() => getDailyResetCountdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setResetTimer(getDailyResetCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Автопереключение Hero-слайдера каждые 7 секунд
  useEffect(() => {
    if (pauseAutoSlide || spotlightChars.length <= 1) return;
    const id = setInterval(() => {
      setSpotIdx((prev) => (prev + 1) % spotlightChars.length);
    }, 7000);
    return () => clearInterval(id);
  }, [pauseAutoSlide, spotlightChars.length]);

  const activeSpot = spotlightChars[spotIdx] ?? CHARACTERS[0];
  const activeSpotEl = ELEMENTS[activeSpot.element];

  const mapPercent = useMemo(
    () => Math.round((collected.length / Math.max(1, MAP_MARKERS.length)) * 100),
    [collected],
  );

  const sTierChars = useMemo(
    () =>
      CHARACTERS.filter((c) =>
        metaMode === 'tower' ? c.metaRating.tower === 'S' : c.metaRating.realm === 'S',
      ).slice(0, 8),
    [metaMode],
  );

  const randomChar = useMemo(
    () => getCharacterById(randomCharId) ?? CHARACTERS[0],
    [randomCharId],
  );

  const rollRandomResonator = () => {
    setRollingRandom(true);
    setTimeout(() => {
      const pool = CHARACTERS.filter((c) => c.id !== randomCharId);
      const picked = pool[Math.floor(Math.random() * pool.length)] ?? CHARACTERS[0];
      setRandomCharId(picked.id);
      setRollingRandom(false);
    }, 220);
  };

  const displayName = profile.nickname || user?.nickname || 'Ровер';

  return (
    <div className="space-y-7 pb-10 w-full">
      {/* Расширяем контейнер главной страницы до 1540px для просторной сетки */}
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* ==================== 1. ВЕРХНИЙ РЯД: HERO-ШОУКЕЙС + ТЕРМИНАЛ РОВЕРА ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-6 items-stretch">
        {/* ЛЕВАЯ ЧАСТЬ: ИНТЕРАКТИВНЫЙ HERO-БАННЕР */}
        <div
          onMouseEnter={() => setPauseAutoSlide(true)}
          onMouseLeave={() => setPauseAutoSlide(false)}
          className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#0b0d14] shadow-[0_25px_75px_rgba(0,0,0,0.85)] min-h-[390px] flex flex-col justify-between p-6 sm:p-9"
        >
          {/* Фоновое свечение под стихию выбранного персонажа */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSpot.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${
                ELEMENT_AURA[activeSpot.element] ?? ELEMENT_AURA.Spectro
              }`}
            />
          </AnimatePresence>

          {/* Крупный портрет персонажа справа на фоне */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`art-${activeSpot.id}`}
              initial={{ opacity: 0, x: 24, scale: 1.04 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, scale: 0.98 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="pointer-events-none select-none absolute right-0 top-0 bottom-0 w-[55%] max-w-[460px] hidden sm:block"
            >
              <ImagePlaceholder
                id={activeSpot.id}
                initials={activeSpot.name.slice(0, 2)}
                element={activeSpot.element}
                className="w-full h-full object-cover object-top opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d14] via-[#0b0d14]/45 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-transparent to-black/20" />
            </motion.div>
          </AnimatePresence>

          {/* Верхняя строка бейджей витрины */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent-light text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>В центре внимания Соларис-3</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Star size={12} fill="currentColor" />
              <span>{activeSpot.rarity}★ Резонатор</span>
            </span>

            {typeof pullChains[activeSpot.id] === 'number' && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-[#09090b] text-xs font-black">
                В коллекции: S{pullChains[activeSpot.id]}
              </span>
            )}
          </div>

          {/* Основной текст выбранного персонажа */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`info-${activeSpot.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28 }}
              className="relative z-10 my-6 max-w-xl space-y-3"
            >
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                  {activeSpot.name}
                </h1>
                <p className="text-base sm:text-lg font-semibold text-accent-light mt-1">
                  {activeSpot.title}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/45 border border-white/15 text-xs font-bold text-white backdrop-blur-md">
                  <img
                    src={activeSpotEl.icon}
                    alt=""
                    className="w-4 h-4"
                    draggable={false}
                  />
                  <span>{activeSpotEl.label}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/45 border border-white/15 text-xs font-bold text-white backdrop-blur-md">
                  <img
                    src={WEAPON_ICONS[activeSpot.weapon]}
                    alt=""
                    className="w-4 h-4"
                    draggable={false}
                  />
                  <span>{WEAPON_LABELS[activeSpot.weapon]}</span>
                </span>

                <span className="px-3 py-1 rounded-xl bg-black/45 border border-white/15 text-xs font-semibold text-gray-200">
                  {activeSpot.role}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${
                    TIER_STYLES[activeSpot.metaRating.tower]
                  }`}
                >
                  Башня: {activeSpot.metaRating.tower}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold ${
                    TIER_STYLES[activeSpot.metaRating.realm]
                  }`}
                >
                  Wastes: {activeSpot.metaRating.realm}
                </span>
              </div>

              {activeSpot.strengths.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed line-clamp-2 pt-1">
                  {activeSpot.strengths.join(' · ')}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/characters/${activeSpot.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] via-[#e5c5a8] to-[#f7ece6] text-[#09090b] text-xs sm:text-sm font-extrabold shadow-lg hover:brightness-105 transition-all focus-ring"
                >
                  <span>Открыть билд и гайд</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/calculator"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.13] border border-white/15 text-xs sm:text-sm font-bold text-ivory backdrop-blur-md transition-all focus-ring"
                >
                  <Calculator size={15} className="text-accent-light" />
                  <span>Оценить Эхо</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Нижняя панель миниатюр для быстрого переключения героев */}
          <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-white/10 overflow-x-auto no-scrollbar">
            {spotlightChars.map((ch, idx) => {
              const isSelected = idx === spotIdx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSpotIdx(idx)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all shrink-0 ${
                    isSelected
                      ? 'bg-accent/25 border-accent text-white shadow-glow-sm'
                      : 'bg-black/40 border-white/10 text-gray-400 hover:text-white hover:border-white/25'
                  }`}
                >
                  <ImagePlaceholder
                    id={ch.id}
                    initials={ch.name.slice(0, 2)}
                    element={ch.element}
                    className="w-7 h-8 rounded-lg object-cover object-top shrink-0"
                  />
                  <span className="text-xs font-bold">{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ЛИЧНЫЙ ТЕРМИНАЛ РОВЕРА И ТАЙМЕР СЕРВЕРОВ */}
        <div className="glass-panel p-6 flex flex-col justify-between gap-5 solaris-crest">
          {/* Шапка карточки игрока */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/profile"
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-light to-accent text-[#09090b] font-black text-xl flex items-center justify-center shrink-0 shadow-glow-sm"
              >
                {displayName.charAt(0).toUpperCase()}
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="text-base font-extrabold text-white hover:text-accent-light truncate"
                  >
                    {displayName}
                  </Link>
                  <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc] shrink-0" />
                </div>
                <p className="text-xs font-mono text-gray-400 truncate">
                  UID: {profile.uid} · UL {profile.unionLevel}
                </p>
              </div>
            </div>

            {user?.role === 'admin' ? (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-xl bg-accent/20 border border-accent/40 text-accent-light text-xs font-extrabold flex items-center gap-1.5 hover:bg-accent/30 transition-colors shrink-0"
              >
                <ShieldCheck size={14} />
                <span>Админ</span>
              </Link>
            ) : (
              <Link
                to="/profile"
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-ivory transition-colors shrink-0"
              >
                Профиль
              </Link>
            )}
          </div>

          {/* 3 мини-метрики аккаунта */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <Link
              to="/characters"
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                База героев
              </span>
              <strong className="text-lg font-black text-white mt-0.5 block tabular-nums">
                {CHARACTERS.length}
              </strong>
            </Link>

            <Link
              to="/pulls"
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Удача 50/50
              </span>
              <strong className="text-lg font-black text-amber-300 mt-0.5 block tabular-nums">
                {luckSummary?.winRate5050 !== null && luckSummary?.winRate5050 !== undefined
                  ? `${luckSummary.winRate5050}%`
                  : luckSummary?.luckGrade ?? '—'}
              </strong>
            </Link>

            <Link
              to="/map"
              className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Карта мира
              </span>
              <strong className="text-lg font-black text-emerald-300 mt-0.5 block tabular-nums">
                {mapPercent}%
              </strong>
            </Link>
          </div>

          {/* Таймер сброса серверов Соларис-3 */}
          <div className="p-4 rounded-2xl bg-[#090a10]/80 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-semibold flex items-center gap-1.5">
                <Clock size={14} className="text-accent-light" />
                <span>Сброс дейликов Соларис-3</span>
              </span>
              <span className="font-mono text-sm font-black text-accent-light tabular-nums">
                {resetTimer}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/[0.06]">
              <span>Недельные боссы и Волновые пластины</span>
              <span className="text-emerald-300 font-bold">Активны</span>
            </div>
          </div>

          {/* Быстрые кнопки Новостей и Гайдов */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/guides"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs font-bold text-gray-200 transition-all"
            >
              <BookOpen size={14} className="text-accent-light" />
              <span>Гайды</span>
            </Link>
            <Link
              to="/news"
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-xs font-bold text-gray-200 transition-all"
            >
              <Newspaper size={14} className="text-accent-light" />
              <span>Новости</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ==================== 2. BENTO-НАВИГАЦИЯ ПО ТЕРМИНАЛАМ САЙТА ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            to: '/characters',
            title: 'Каталог резонаторов',
            sub: `${CHARACTERS.length} игровых персонажей · Билды, эхо, ротации и прокачка`,
            badge: `${CHARACTERS.length} героев`,
            icon: Users,
            accent: 'text-amber-300 bg-amber-500/15 border-amber-400/30',
          },
          {
            to: '/pulls',
            title: 'Pull Tracker & Аналитика 50/50',
            sub: 'Импорт истории круток из игры, лента 5★ пити и авто-расчёт S0–S6',
            badge: luckSummary ? `${luckSummary.totalPulls} круток` : 'Трекер',
            icon: Dice5,
            accent: 'text-purple-300 bg-purple-500/15 border-purple-400/30',
          },
          {
            to: '/bestiary',
            title: 'Бестиарий Соларис-3',
            sub: 'Единая картотека оружия, эхо, боссов, врагов и материалов вознесения',
            badge: 'Архив',
            icon: Archive,
            accent: 'text-cyan-300 bg-cyan-500/15 border-cyan-400/30',
          },
          {
            to: '/calculator',
            title: 'Оценщик Эхо (Echo Scorer)',
            sub: 'Проверка сабстатов Эхо с рангами B–SSS, расчёт Crit Value и урона',
            badge: 'SSS Калькулятор',
            icon: Calculator,
            accent: 'text-rose-300 bg-rose-500/15 border-rose-400/30',
          },
          {
            to: '/map',
            title: 'Интерактивная карта',
            sub: 'Сундуки, боссы, головоломки и точки фарма Хуанлуна и Ринаты',
            badge: `Собрано ${mapPercent}%`,
            icon: Map,
            accent: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
          },
          {
            to: '/meta',
            title: 'Мета-тирлист патча',
            sub: 'Актуальный рейтинг резонаторов для Tower of Adversity и Whimpering Wastes',
            badge: 'Tier S–C',
            icon: Trophy,
            accent: 'text-orange-300 bg-orange-500/15 border-orange-400/30',
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className="glass-panel-hover p-5 flex flex-col justify-between gap-4 group focus-ring"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${card.accent}`}
                >
                  <Icon size={21} />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-bold text-gray-300">
                  {card.badge}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-white group-hover:text-accent-light transition-colors">
                    {card.title}
                  </h3>
                  <ChevronRight
                    size={16}
                    className="text-gray-500 group-hover:text-accent-light group-hover:translate-x-1 transition-all shrink-0"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ==================== 3. НИЖНИЙ РЯД: ЛИДЕРЫ МЕТЫ (S-TIER) + РУЛЕТКА РЕЗОНАТОРА ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-6 items-start">
        {/* ЛЕВАЯ КОЛОНКА: ТОП S-ТИРА МЕТЫ */}
        <div className="glass-panel p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Trophy size={20} className="text-accent-light" />
                <span>Лидеры меты (Tier S)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Сильнейшие резонаторы для закрытия эндгейм-режимов на максимальные награды
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex p-1 rounded-xl bg-black/45 border border-white/10">
                <button
                  type="button"
                  onClick={() => setMetaMode('tower')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    metaMode === 'tower'
                      ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Tower of Adversity
                </button>
                <button
                  type="button"
                  onClick={() => setMetaMode('realm')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    metaMode === 'realm'
                      ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Whimpering Wastes
                </button>
              </div>

              <Link
                to="/meta"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-accent-light hover:underline ml-1"
              >
                <span>Весь тир-лист</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {sTierChars.map((ch) => {
              const el = ELEMENTS[ch.element];
              const chain = pullChains[ch.id];
              return (
                <Link
                  key={ch.id}
                  to={`/characters/${ch.id}`}
                  className="group relative rounded-2xl overflow-hidden border border-white/15 bg-[#0b0d14] aspect-[3/4] focus-ring"
                >
                  <ImagePlaceholder
                    id={ch.id}
                    initials={ch.name.slice(0, 2)}
                    element={ch.element}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />

                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/25 border border-amber-400/50 backdrop-blur-md text-amber-200 text-[10px] font-black">
                      TIER S
                    </span>
                    {typeof chain === 'number' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-[#09090b] text-[10px] font-black">
                        S{chain}
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/95 via-black/65 to-transparent">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-extrabold text-sm text-white group-hover:text-accent-light transition-colors truncate">
                        {ch.name}
                      </p>
                      <img
                        src={el.icon}
                        alt={el.label}
                        className="w-4 h-4 shrink-0"
                        draggable={false}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{ch.role}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ВИДЖЕТ «ИСПЫТАТЬ РЕЗОНАНС» (СЛУЧАЙНЫЙ ПЕРСОНАЖ) */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Compass size={18} className="text-accent-light" />
                <span>Резонатор на сегодня</span>
              </h3>
              <p className="text-xs text-gray-400">
                Не знаешь, чей билд изучить? Испытай резонанс
              </p>
            </div>

            <button
              type="button"
              onClick={rollRandomResonator}
              className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-accent-light transition-all focus-ring"
              title="Случайный резонатор"
            >
              <Shuffle size={16} className={rollingRandom ? 'animate-spin' : ''} />
            </button>
          </div>

          <div
            onClick={() => navigate(`/characters/${randomChar.id}`)}
            className="cursor-pointer group relative rounded-2xl overflow-hidden border border-white/15 bg-[#0b0d14] h-64"
          >
            <ImagePlaceholder
              id={randomChar.id}
              initials={randomChar.name.slice(0, 2)}
              element={randomChar.element}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-[#090a10]/35 to-transparent" />

            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-black/65 border border-white/15 backdrop-blur-md text-xs font-bold text-ivory flex items-center gap-1.5">
                <img
                  src={ELEMENTS[randomChar.element].icon}
                  alt=""
                  className="w-3.5 h-3.5"
                  draggable={false}
                />
                <span>{ELEMENTS[randomChar.element].label}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/65 border border-amber-400/40 text-amber-300 text-xs font-bold">
                {'★'.repeat(randomChar.rarity)}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-xl font-black text-white group-hover:text-accent-light transition-colors">
                {randomChar.name}
              </p>
              <p className="text-xs text-gray-300 mt-0.5">
                {randomChar.title} · {WEAPON_LABELS[randomChar.weapon]} · {randomChar.role}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={rollRandomResonator}
              className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-ivory flex items-center justify-center gap-1.5 transition-all"
            >
              <Shuffle size={14} className="text-accent-light" />
              <span>Другой герой</span>
            </button>
            <Link
              to={`/characters/${randomChar.id}`}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-extrabold flex items-center justify-center gap-1.5 hover:brightness-105 transition-all"
            >
              <span>К сборке</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};