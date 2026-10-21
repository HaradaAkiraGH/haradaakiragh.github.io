// Главная страница Stellar Wiki:
// 1) Широкоформатные горизонтальные промо-сцены персонажей в Hero-витрине (без белых рамок карточек)
// 2) Мини-профиль Ровера справа с реальной аватаркой, титулом и красивым фоновым баннером
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
import { IMAGES } from '../data/images';
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

const SPOTLIGHT_IDS = [
  'camellya',
  'cartethyia',
  'shorekeeper',
  'changli',
  'jinhsi',
  'phrolova',
];

/* Широкоформатные горизонтальные сплеш-фоны и промо-арты под каждого героя витрины */
const SPOTLIGHT_WIDE_SCENES: Record<
  string,
  {
    backdropUrl: string;
    auraGrad: string;
    accentGlow: string;
    focalPos: string;
  }
> = {
  camellya: {
    backdropUrl:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#2b0916] via-[#170912]/90 to-transparent',
    accentGlow: 'bg-rose-500/35',
    focalPos: 'object-[center_18%] scale-[1.32]',
  },
  cartethyia: {
    backdropUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#072622] via-[#09191b]/90 to-transparent',
    accentGlow: 'bg-emerald-400/30',
    focalPos: 'object-[center_16%] scale-[1.32]',
  },
  shorekeeper: {
    backdropUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#081b33] via-[#0a1324]/90 to-transparent',
    accentGlow: 'bg-sky-400/35',
    focalPos: 'object-[center_18%] scale-[1.32]',
  },
  changli: {
    backdropUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#2e1108] via-[#1c0c08]/90 to-transparent',
    accentGlow: 'bg-orange-500/35',
    focalPos: 'object-[center_16%] scale-[1.32]',
  },
  jinhsi: {
    backdropUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#29200e] via-[#17140d]/90 to-transparent',
    accentGlow: 'bg-amber-300/35',
    focalPos: 'object-[center_16%] scale-[1.32]',
  },
  phrolova: {
    backdropUrl:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#260b2c] via-[#14091c]/90 to-transparent',
    accentGlow: 'bg-fuchsia-500/35',
    focalPos: 'object-[center_18%] scale-[1.32]',
  },
};

const DEFAULT_PROFILE_BANNER =
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80';

function getDailyResetCountdown(): string {
  const now = new Date();
  const target = new Date(now);
  target.setHours(4, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
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

  // Подтягиваем аватарку и фоновую шапку из кастомизации профиля
  const [profileCustom, setProfileCustom] = useState<{
    avatarUrl?: string;
    bannerUrl?: string;
    username?: string;
  }>({});

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem('ww_profile_custom_v2') ||
        localStorage.getItem('ww_profile_custom_v1');
      if (raw) setProfileCustom(JSON.parse(raw));
    } catch {
      // игнорируем
    }
  }, []);

  const [luckSummary] = useState(() => getCachedLuckSummary());
  const [pullChains] = useState(() => getCachedResonanceChains());

  const spotlightChars = useMemo(
    () =>
      SPOTLIGHT_IDS.map((id) => getCharacterById(id)).filter(
        (c): c is NonNullable<typeof c> => Boolean(c),
      ),
    [],
  );
  const [spotIdx, setSpotIdx] = useState(0);
  const [pauseAutoSlide, setPauseAutoSlide] = useState(false);

  const [metaMode, setMetaMode] = useState<'tower' | 'realm'>('tower');

  const [randomCharId, setRandomCharId] = useState<string>(() => {
    const idx = new Date().getDate() % CHARACTERS.length;
    return CHARACTERS[idx]?.id ?? 'camellya';
  });
  const [rollingRandom, setRollingRandom] = useState(false);

  const [resetTimer, setResetTimer] = useState(() => getDailyResetCountdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setResetTimer(getDailyResetCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pauseAutoSlide || spotlightChars.length <= 1) return;
    const id = setInterval(() => {
      setSpotIdx((prev) => (prev + 1) % spotlightChars.length);
    }, 7000);
    return () => clearInterval(id);
  }, [pauseAutoSlide, spotlightChars.length]);

  const activeSpot = spotlightChars[spotIdx] ?? CHARACTERS[0];
  const activeSpotEl = ELEMENTS[activeSpot.element];
  const wideScene =
    SPOTLIGHT_WIDE_SCENES[activeSpot.id] ?? SPOTLIGHT_WIDE_SCENES.camellya;

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

  const displayName = profile.nickname || user?.nickname || 'HaradaAkira';
  const avatarSrc = profileCustom.avatarUrl || '/images/Camellya_Card.webp';
  const bannerSrc = profileCustom.bannerUrl || DEFAULT_PROFILE_BANNER;

  return (
    <div className="space-y-7 pb-10 w-full">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* ==================== 1. ВЕРХНИЙ РЯД: ГОРИЗОНТАЛЬНЫЙ HERO-ШОУКЕЙС + ПРОФИЛЬ С ФОНОМ ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,390px] gap-6 items-stretch">
        {/* ЛЕВАЯ ЧАСТЬ: ШИРОКОФОРМАТНАЯ ПАНОРАМА РЕЗОНАТОРА (СКРИН 1 ИСПРАВЛЕН) */}
        <div
          onMouseEnter={() => setPauseAutoSlide(true)}
          onMouseLeave={() => setPauseAutoSlide(false)}
          className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#090a10] shadow-[0_25px_75px_rgba(0,0,0,0.85)] min-h-[400px] flex flex-col justify-between p-6 sm:p-9"
        >
          {/* Панорамный широкоформатный задник 16:9 + бесшовный кроп персонажа без рамок карточки */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`wide-${activeSpot.id}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pointer-events-none select-none absolute inset-0 overflow-hidden"
            >
              {/* Атмосферный широкоформатный пейзаж */}
              <img
                src={wideScene.backdropUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
                draggable={false}
              />

              {/* Элементальное свечение вокруг персонажа */}
              <div
                className={`absolute right-12 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[110px] ${wideScene.accentGlow}`}
              />

              {/* Горизонтальный кинематографичный портрет резонатора справа (с мягкой маской краёв, чтобы скрыть рамку карточки) */}
              <div
                className="hidden sm:block absolute right-[-2%] top-0 bottom-0 w-[62%] max-w-[560px] overflow-hidden"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 78% 92% at 62% 48%, black 42%, transparent 96%)',
                  maskImage:
                    'radial-gradient(ellipse 78% 92% at 62% 48%, black 42%, transparent 96%)',
                }}
              >
                <img
                  src={IMAGES[activeSpot.id]}
                  alt={activeSpot.name}
                  className={`w-full h-full object-cover ${wideScene.focalPos} brightness-105 contrast-105`}
                  draggable={false}
                />
              </div>

              {/* Градиентная вуаль слева направо под текст */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${wideScene.auraGrad}`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#090a10] via-[#090a10]/75 to-transparent sm:w-[68%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090a10] via-transparent to-black/25" />
            </motion.div>
          </AnimatePresence>

          {/* Верхняя строка бейджей витрины */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent-light text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-md">
              <Sparkles size={12} />
              <span>В центре внимания Соларис-3</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 border border-amber-400/40 text-amber-300 text-xs font-bold backdrop-blur-md">
              <Star size={12} fill="currentColor" />
              <span>{activeSpot.rarity}★ Резонатор</span>
            </span>

            {typeof pullChains[activeSpot.id] === 'number' && (
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-[#09090b] text-xs font-black shadow">
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
              className="relative z-10 my-6 max-w-xl space-y-3.5"
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
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/55 border border-white/15 text-xs font-bold text-white backdrop-blur-md">
                  <img
                    src={activeSpotEl.icon}
                    alt=""
                    className="w-4 h-4"
                    draggable={false}
                  />
                  <span>{activeSpotEl.label}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/55 border border-white/15 text-xs font-bold text-white backdrop-blur-md">
                  <img
                    src={WEAPON_ICONS[activeSpot.weapon]}
                    alt=""
                    className="w-4 h-4"
                    draggable={false}
                  />
                  <span>{WEAPON_LABELS[activeSpot.weapon]}</span>
                </span>

                <span className="px-3 py-1 rounded-xl bg-black/55 border border-white/15 text-xs font-semibold text-gray-200 backdrop-blur-md">
                  {activeSpot.role}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold backdrop-blur-md ${
                    TIER_STYLES[activeSpot.metaRating.tower]
                  }`}
                >
                  Башня: {activeSpot.metaRating.tower}
                </span>

                <span
                  className={`px-2.5 py-1 rounded-xl border text-xs font-bold backdrop-blur-md ${
                    TIER_STYLES[activeSpot.metaRating.realm]
                  }`}
                >
                  Wastes: {activeSpot.metaRating.realm}
                </span>
              </div>

              {activeSpot.strengths.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-200/90 leading-relaxed line-clamp-2 pt-1">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/50 hover:bg-white/[0.14] border border-white/15 text-xs sm:text-sm font-bold text-ivory backdrop-blur-md transition-all focus-ring"
                >
                  <Calculator size={15} className="text-accent-light" />
                  <span>Оценить Эхо</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Нижняя панель переключения героев */}
          <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-white/10 overflow-x-auto no-scrollbar">
            {spotlightChars.map((ch, idx) => {
              const isSelected = idx === spotIdx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSpotIdx(idx)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all shrink-0 backdrop-blur-md ${
                    isSelected
                      ? 'bg-accent/30 border-accent text-white shadow-glow-sm'
                      : 'bg-black/45 border-white/10 text-gray-300 hover:text-white hover:border-white/25'
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

        {/* ПРАВАЯ ЧАСТЬ: КАРТОЧКА ПРОФИЛЯ С ФОНОВЫМ БАННЕРОМ И РЕАЛЬНОЙ АВАТАРКОЙ (СКРИН 2 ИСПРАВЛЕН) */}
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-[#0b0d14] shadow-[0_25px_75px_rgba(0,0,0,0.85)] flex flex-col justify-between">
          {/* Атмосферная фоновая картинка профиля сверху и позади карточки */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
            <img
              src={bannerSrc}
              alt=""
              className="w-full h-56 object-cover object-center opacity-55 scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-[#0b0d14]/85 to-[#0b0d14]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-[#0b0d14]/90 to-transparent" />
          </div>

          <div className="relative z-10 p-6 flex flex-col justify-between h-full gap-5">
            {/* Шапка профиля с настоящей аватаркой и рамкой */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <Link to="/profile" className="flex items-center gap-3.5 min-w-0 group">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#e6c9a8] shadow-[0_0_24px_rgba(202,160,125,0.5)] bg-[#141520]">
                    <img
                      src={avatarSrc}
                      alt={displayName}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                      draggable={false}
                    />
                  </div>
                  <span
                    title="В сети"
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-400 border-2 border-[#0b0d14] shadow-[0_0_10px_#c084fc]"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white group-hover:text-accent-light truncate drop-shadow">
                      {displayName}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-300/90 truncate">
                    UID: {profile.uid} · UL {profile.unionLevel}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-300/40 text-[10px] font-bold text-amber-200">
                    ☀️ Доставщик солнца
                  </span>
                </div>
              </Link>

              {user?.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="px-3.5 py-2 rounded-xl bg-black/55 hover:bg-accent/25 border border-accent/45 text-accent-light text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md transition-colors shrink-0"
                >
                  <ShieldCheck size={14} />
                  <span>Админ</span>
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="px-3.5 py-2 rounded-xl bg-black/55 hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-ivory backdrop-blur-md transition-colors shrink-0"
                >
                  Профиль
                </Link>
              )}
            </div>

            {/* 3 плитки статистики аккаунта */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <Link
                to="/characters"
                className="p-3 rounded-2xl bg-black/45 hover:bg-white/[0.08] border border-white/12 backdrop-blur-md transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  База героев
                </span>
                <strong className="text-xl font-black text-white mt-0.5 block tabular-nums">
                  {CHARACTERS.length}
                </strong>
              </Link>

              <Link
                to="/pulls"
                className="p-3 rounded-2xl bg-black/45 hover:bg-white/[0.08] border border-white/12 backdrop-blur-md transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Удача 50/50
                </span>
                <strong className="text-xl font-black text-amber-300 mt-0.5 block tabular-nums">
                  {luckSummary?.winRate5050 !== null && luckSummary?.winRate5050 !== undefined
                    ? `${luckSummary.winRate5050}%`
                    : luckSummary?.luckGrade ?? '75%'}
                </strong>
              </Link>

              <Link
                to="/map"
                className="p-3 rounded-2xl bg-black/45 hover:bg-white/[0.08] border border-white/12 backdrop-blur-md transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Карта мира
                </span>
                <strong className="text-xl font-black text-emerald-300 mt-0.5 block tabular-nums">
                  {mapPercent}%
                </strong>
              </Link>
            </div>

            {/* Таймер сброса серверов Соларис-3 */}
            <div className="p-4 rounded-2xl bg-black/55 border border-white/12 backdrop-blur-md space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-300 font-semibold flex items-center gap-1.5">
                  <Clock size={14} className="text-accent-light" />
                  <span>Сброс дейликов Соларис-3</span>
                </span>
                <span className="font-mono text-sm font-black text-accent-light tabular-nums">
                  {resetTimer}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-white/[0.08]">
                <span>Недельные боссы и Волновые пластины</span>
                <span className="text-emerald-300 font-bold">Активны</span>
              </div>
            </div>

            {/* Кнопки Гайдов и Новостей */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/guides"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/12 text-xs font-bold text-gray-200 transition-all"
              >
                <BookOpen size={14} className="text-accent-light" />
                <span>Гайды</span>
              </Link>
              <Link
                to="/news"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/12 text-xs font-bold text-gray-200 transition-all"
              >
                <Newspaper size={14} className="text-accent-light" />
                <span>Новости</span>
              </Link>
            </div>
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
            sub: 'Полная база всех материалов вознесения (патч 3.7), оружия, эхо и боссов',
            badge: 'Архив 3.7',
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
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,390px] gap-6 items-start">
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

        {/* ПРАВАЯ КОЛОНКА: ВИДЖЕТ «РЕЗОНАТОР НА СЕГОДНЯ» */}
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