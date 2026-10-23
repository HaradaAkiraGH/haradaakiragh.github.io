// Главная страница Stellar Wiki (на базе оригинального HomePage.tsx в эстетике Liquid Glass):
// 1) Верхний ряд: Широкоформатная интерактивная Hero-витрина персонажей + Карточка профиля Ровера с таймером и статистикой
// 2) Второй ряд: Горизонтальные плитки разделов в стиле Liquid Glass БЕЗ иконок, с картинкой на 50% справа (плавно исчезающей влево), полностью редактируемые и добавляемые через /admin
// 3) Блоки «Лидеры меты» и «Резонатор на сегодня» убраны
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calculator,
  ArrowRight,
  Clock,
  ShieldCheck,
  ChevronRight,
  Star,
  BookOpen,
  Newspaper,
  Sliders,
} from 'lucide-react';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { MAP_MARKERS } from '../data/map';
import { IMAGES } from '../data/images';
import {
  ELEMENTS,
  WEAPON_LABELS,
  WEAPON_ICONS,
} from '../utils/constants';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import {
  getCachedLuckSummary,
  getCachedResonanceChains,
} from '../utils/pullMatch';
import { PRYDWEN_CHAR_META } from '../data/prydwenMeta';
import {
  getHomeTiles,
  initAdminRuntimeSync,
  getCharacterArtUrls,
  HomeTileItem,
} from '../utils/adminStorage';
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
    auraGrad: 'from-[#2b0916]/75 via-[#170912]/55 to-transparent',
    accentGlow: 'bg-rose-500/35',
    focalPos: 'object-[center_18%] scale-[1.32]',
  },
  cartethyia: {
    backdropUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#072622]/75 via-[#09191b]/55 to-transparent',
    accentGlow: 'bg-emerald-400/30',
    focalPos: 'object-[center_16%] scale-[1.32]',
  },
  shorekeeper: {
    backdropUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#081b33]/75 via-[#0a1324]/55 to-transparent',
    accentGlow: 'bg-sky-400/35',
    focalPos: 'object-[center_18%] scale-[1.32]',
  },
  changli: {
    backdropUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#2e1108]/75 via-[#1c0c08]/55 to-transparent',
    accentGlow: 'bg-orange-500/35',
    focalPos: 'object-[center_16%] scale-[1.32]',
  },
  jinhsi: {
    backdropUrl:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#29200e]/75 via-[#17140d]/55 to-transparent',
    accentGlow: 'bg-amber-300/35',
    focalPos: 'object-[center_16%] scale-[1.32]',
  },
  phrolova: {
    backdropUrl:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1400&q=80',
    auraGrad: 'from-[#260b2c]/75 via-[#14091c]/55 to-transparent',
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

  const { user } = useAuth();
  const [profile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [collected] = useLocalStorage<string[]>('ww_map_collected', []);

  // Плитки разделов сайта (управляются и добавляются через /admin)
  const [homeTiles, setHomeTiles] = useState<HomeTileItem[]>(() => getHomeTiles());
  const [, setSyncTick] = useState(0);

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

    initAdminRuntimeSync().then(() => {
      setHomeTiles(getHomeTiles());
      setSyncTick((t) => t + 1);
    });
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
  const activeSpotAny = activeSpot as any;
  const activeSpotEl = ELEMENTS[activeSpot.element];
  const wideScene =
    SPOTLIGHT_WIDE_SCENES[activeSpot.id] ?? SPOTLIGHT_WIDE_SCENES.camellya;
  const activeSpotArts = getCharacterArtUrls(activeSpot.id);
  const activeSpotPrydwen = PRYDWEN_CHAR_META[activeSpot.id];

  const towerTier =
    activeSpotAny.prydwenMeta?.toa ??
    activeSpotPrydwen?.toa ??
    activeSpot.metaRating.tower;
  const wastesTier =
    activeSpotAny.prydwenMeta?.wastes ??
    activeSpotPrydwen?.wastes ??
    activeSpot.metaRating.realm;

  const mapPercent = useMemo(
    () => Math.round((collected.length / Math.max(1, MAP_MARKERS.length)) * 100),
    [collected],
  );

  const displayName = profile.nickname || user?.nickname || 'HaradaAkira';
  const avatarSrc = profileCustom.avatarUrl || '/images/Camellya_Card.webp';
  const bannerSrc = profileCustom.bannerUrl || DEFAULT_PROFILE_BANNER;

  // Подстановка живых счётчиков в бейджи стандартных плиток (если они используют дефолтные пути)
  const resolveTileBadge = (tile: HomeTileItem): string => {
    if (tile.id === 'tile-characters' && tile.badge === 'БАЗА ГЕРОЕВ') {
      return `${CHARACTERS.length} героев`;
    }
    if (tile.id === 'tile-pulls' && tile.badge === 'АНАЛИТИКА ГАЧИ') {
      return luckSummary ? `${luckSummary.totalPulls} круток` : 'Трекер';
    }
    if (tile.id === 'tile-map' && tile.badge === 'НАВИГАТОР МИРА') {
      return `Собрано ${mapPercent}%`;
    }
    return tile.badge;
  };

  return (
    <div className="space-y-7 pb-10 w-full animate-fade-in">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* ==================== 1. ВЕРХНИЙ РЯД: ГОРИЗОНТАЛЬНЫЙ HERO-ШОУКЕЙС + ПРОФИЛЬ РОВЕРА (LIQUID GLASS) ==================== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,390px] gap-6 items-stretch">
        {/* ЛЕВАЯ ЧАСТЬ: ШИРОКОФОРМАТНАЯ ПАНОРАМА РЕЗОНАТОРА В СТИЛЕ LIQUID GLASS */}
        <div
          onMouseEnter={() => setPauseAutoSlide(true)}
          onMouseLeave={() => setPauseAutoSlide(false)}
          className="glass-panel relative overflow-hidden min-h-[410px] flex flex-col justify-between p-6 sm:p-9"
        >
          {/* Панорамный широкоформатный задник + бесшовный портрет персонажа справа */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`wide-${activeSpot.id}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="pointer-events-none select-none absolute inset-0 overflow-hidden"
            >
              {/* Элементальное свечение вокруг персонажа */}
              <div
                className={`absolute right-12 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[110px] ${wideScene.accentGlow}`}
              />

              {/* Горизонтальный кинематографичный портрет резонатора справа с плавным растворением влево */}
              <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-[62%] max-w-[590px] overflow-hidden tile-image-fade-left">
                <img
                  src={
                    activeSpotArts.splash ||
                    activeSpotArts.card ||
                    IMAGES[activeSpot.id]
                  }
                  alt={activeSpot.name}
                  className={`w-full h-full object-cover ${
                    activeSpotArts.splash ? 'object-center' : wideScene.focalPos
                  } brightness-105 contrast-105`}
                  draggable={false}
                />
              </div>

              {/* Лёгкая градиентная вуаль слева направо под текст (пропускает видеофон сквозь стекло) */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${wideScene.auraGrad}`}
              />
            </motion.div>
          </AnimatePresence>

          {/* Верхняя строка бейджей витрины */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full liquid-pill text-accent-light text-[11px] font-extrabold uppercase tracking-wider">
              <Sparkles size={12} />
              <span>В центре внимания Соларис-3</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full liquid-pill text-amber-300 text-xs font-bold">
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
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
                  {activeSpot.name}
                </h1>
                <p className="text-base sm:text-lg font-semibold text-accent-light mt-1 drop-shadow">
                  {activeSpot.title}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl liquid-pill text-xs font-bold text-white">
                  <img
                    src={activeSpotEl.icon}
                    alt=""
                    className="w-4 h-4"
                    draggable={false}
                  />
                  <span>{activeSpotEl.label}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl liquid-pill text-xs font-bold text-white">
                  <img
                    src={WEAPON_ICONS[activeSpot.weapon]}
                    alt=""
                    className="w-4 h-4"
                    draggable={false}
                  />
                  <span>{WEAPON_LABELS[activeSpot.weapon]}</span>
                </span>

                <span className="px-3 py-1 rounded-xl liquid-pill text-xs font-semibold text-gray-100">
                  {activeSpot.role}
                </span>

                <span className="px-2.5 py-1 rounded-xl liquid-pill text-xs font-extrabold text-amber-200">
                  Башня: {towerTier}
                </span>

                <span className="px-2.5 py-1 rounded-xl liquid-pill text-xs font-extrabold text-cyan-200">
                  Wastes: {wastesTier}
                </span>
              </div>

              {activeSpot.strengths.length > 0 && (
                <p className="text-xs sm:text-sm text-gray-100/95 leading-relaxed line-clamp-2 pt-1 drop-shadow">
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-pill hover:border-white/40 text-xs sm:text-sm font-bold text-ivory transition-all focus-ring"
                >
                  <Calculator size={15} className="text-accent-light" />
                  <span>Оценить Эхо</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Нижняя панель переключения героев */}
          <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-white/15 overflow-x-auto no-scrollbar">
            {spotlightChars.map((ch, idx) => {
              const isSelected = idx === spotIdx;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setSpotIdx(idx)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-accent/35 border-accent text-white shadow-glow-sm backdrop-blur-md'
                      : 'liquid-pill text-gray-200 hover:text-white'
                  }`}
                >
                  <ImagePlaceholder
                    id={ch.id}
                    initials={ch.name.slice(0, 2)}
                    element={ch.element}
                    variant="icon"
                    className="w-7 h-7 aspect-square rounded-lg object-cover shrink-0"
                  />
                  <span className="text-xs font-bold">{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: КАРТОЧКА ПРОФИЛЯ С ФОНОВЫМ БАННЕРОМ И РЕАЛЬНОЙ АВАТАРКОЙ В СТИЛЕ LIQUID GLASS */}
        <div className="glass-panel relative overflow-hidden flex flex-col justify-between">
          {/* Полупрозрачный баннер профиля сверху (сохраняет преломление видеофона) */}
          <div className="absolute inset-x-0 top-0 h-48 pointer-events-none select-none overflow-hidden">
            <img
              src={bannerSrc}
              alt=""
              className="w-full h-full object-cover object-center opacity-40 scale-105"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-transparent" />
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
                  <p className="text-xs font-mono text-gray-200 truncate">
                    UID: {profile.uid} · UL {profile.unionLevel}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md liquid-pill text-[10px] font-bold text-amber-200">
                    ☀️ Доставщик солнца
                  </span>
                </div>
              </Link>

              {user?.role === 'admin' ? (
                <Link
                  to="/admin"
                  className="px-3.5 py-2 rounded-xl liquid-pill hover:border-amber-300/50 text-accent-light text-xs font-extrabold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <ShieldCheck size={14} />
                  <span>Админ</span>
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="px-3.5 py-2 rounded-xl liquid-pill text-xs font-bold text-ivory transition-colors shrink-0"
                >
                  Профиль
                </Link>
              )}
            </div>

            {/* 3 стеклянные плитки статистики аккаунта */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <Link
                to="/characters"
                className="p-3 rounded-2xl liquid-pill hover:border-white/40 transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-gray-300 block">
                  База героев
                </span>
                <strong className="text-xl font-black text-white mt-0.5 block tabular-nums">
                  {CHARACTERS.length}
                </strong>
              </Link>

              <Link
                to="/pulls"
                className="p-3 rounded-2xl liquid-pill hover:border-white/40 transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-gray-300 block">
                  Удача 50/50
                </span>
                <strong className="text-xl font-black text-amber-300 mt-0.5 block tabular-nums">
                  {luckSummary?.winRate5050 !== null &&
                  luckSummary?.winRate5050 !== undefined
                    ? `${luckSummary.winRate5050}%`
                    : luckSummary?.luckGrade ?? '75%'}
                </strong>
              </Link>

              <Link
                to="/map"
                className="p-3 rounded-2xl liquid-pill hover:border-white/40 transition-colors"
              >
                <span className="text-[10px] font-bold uppercase text-gray-300 block">
                  Карта мира
                </span>
                <strong className="text-xl font-black text-emerald-300 mt-0.5 block tabular-nums">
                  {mapPercent}%
                </strong>
              </Link>
            </div>

            {/* Таймер сброса серверов Соларис-3 */}
            <div className="p-4 rounded-2xl liquid-pill space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-200 font-semibold flex items-center gap-1.5">
                  <Clock size={14} className="text-accent-light" />
                  <span>Сброс дейликов Соларис-3</span>
                </span>
                <span className="font-mono text-sm font-black text-accent-light tabular-nums">
                  {resetTimer}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-300 pt-2 border-t border-white/15">
                <span>Недельные боссы и Волновые пластины</span>
                <span className="text-emerald-300 font-bold">Активны</span>
              </div>
            </div>

            {/* Кнопки Гайдов и Новостей */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/guides"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl liquid-pill hover:border-white/40 text-xs font-bold text-gray-100 transition-all"
              >
                <BookOpen size={14} className="text-accent-light" />
                <span>Гайды</span>
              </Link>
              <Link
                to="/news"
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl liquid-pill hover:border-white/40 text-xs font-bold text-gray-100 transition-all"
              >
                <Newspaper size={14} className="text-accent-light" />
                <span>Новости</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. ГОРИЗОНТАЛЬНЫЕ ПЛИТКИ НАВИГАЦИИ (БЕЗ ИКОНОК, КАРТИНКА НА 50% СПРАВА С РАСТВОРЕНИЕМ ВЛЕВО, РЕДАКТИРУЕМЫЕ В /ADMIN) ==================== */}
      <div className="space-y-3">
        {user?.role === 'admin' && (
          <div className="flex justify-end">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl liquid-pill text-xs font-extrabold text-amber-200 hover:text-white transition-colors"
            >
              <Sliders size={13} />
              <span>Редактировать / добавить плитки в Админке</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {homeTiles.map((tile) => {
            const posX = tile.imagePosX ?? 50;
            const posY = tile.imagePosY ?? 30;
            const scale = tile.imageScale ?? 105;
            const badgeText = resolveTileBadge(tile);

            return (
              <Link
                key={tile.id}
                to={tile.path || '/characters'}
                className="glass-panel-hover relative overflow-hidden min-h-[168px] p-5 sm:p-6 flex flex-col justify-between gap-4 group focus-ring"
              >
                {/* ПРАВАЯ ПОЛОВИНА ПЛИТКИ (50% ширины): Картинка, плавно исчезающая влево */}
                {tile.image && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute inset-y-0 right-0 w-1/2 overflow-hidden tile-image-fade-left"
                  >
                    <img
                      src={tile.image}
                      alt=""
                      draggable={false}
                      style={{
                        objectPosition: `${posX}% ${posY}%`,
                        transformOrigin: `${posX}% ${posY}%`,
                        transform: `scale(${scale / 100})`,
                      }}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 ease-out"
                    />
                  </div>
                )}

                {/* Верхний ряд плитки: Бейдж без иконки */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  {badgeText ? (
                    <span className="px-3 py-1 rounded-full liquid-pill text-[11px] font-extrabold text-ivory">
                      {badgeText}
                    </span>
                  ) : (
                    <span />
                  )}
                </div>

                {/* Нижний текстовый блок плитки (слева, чтобы не перекрывать правую картинку) */}
                <div className="relative z-10 max-w-[64%] space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-accent-light transition-colors leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
                      {tile.title}
                    </h3>
                    <ChevronRight
                      size={16}
                      className="text-gray-300 group-hover:text-accent-light group-hover:translate-x-1 transition-all shrink-0"
                    />
                  </div>
                  <p className="text-xs text-gray-200/95 leading-relaxed line-clamp-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {tile.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HomePage;