// Профиль игрока в стиле AnimeOn + Wuthering Waves:
// Кастомный баннер, аватарка, рамки (Пауэр, Король, Телекошечка и др.),
// игровые титулы WuWa, статус в сети, дата регистрации, уровень/XP, витрина и ростер
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Share2,
  Eye,
  EyeOff,
  Palette,
  Settings,
  Crown,
  Trophy,
  Clock,
  Users,
  Compass,
  Sparkles,
  Check,
  X,
  Upload,
  UserPlus,
  Trash2,
  Heart,
  LayoutGrid,
  Award,
  Layers,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { PlayerProfile } from '../data/types';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { MAP_MARKERS } from '../data/map';
import { IMAGES } from '../data/images';
import { ELEMENTS, WEAPON_LABELS } from '../utils/constants';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { apiGetProfile, apiSaveProfile, API_ENABLED } from '../utils/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/* ==================== КАТАЛОГ РАМОК АВАТАРКИ ==================== */
export interface AvatarFrameDef {
  id: string;
  name: string;
  rarity: 'Обычный' | 'Редкий' | 'Эпический' | 'Легендарный';
  previewBg: string;
  ringClass: string;
  glowStyle: string;
  badge?: 'power' | 'king' | 'telecat' | 'sakura' | 'band';
}

const AVATAR_FRAMES: AvatarFrameDef[] = [
  {
    id: 'power',
    name: 'Пауэр',
    rarity: 'Легендарный',
    previewBg: 'from-amber-950/60 via-red-950/40 to-[#0d0d12]',
    ringClass: 'border-[3px] border-rose-500 shadow-[0_0_28px_rgba(244,63,94,0.75)]',
    glowStyle: 'radial-gradient(circle, rgba(244,63,94,0.45) 0%, transparent 70%)',
    badge: 'power',
  },
  {
    id: 'king',
    name: '■THE_KING_IS_AWAKE■',
    rarity: 'Легендарный',
    previewBg: 'from-amber-900/50 via-purple-950/50 to-[#0d0d12]',
    ringClass: 'border-[3px] border-amber-400 shadow-[0_0_30px_rgba(168,85,247,0.8)]',
    glowStyle: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)',
    badge: 'king',
  },
  {
    id: 'telecat',
    name: 'Телекошечка',
    rarity: 'Эпический',
    previewBg: 'from-sky-900/50 via-cyan-950/40 to-[#0d0d12]',
    ringClass: 'border-[3px] border-sky-400 shadow-[0_0_26px_rgba(56,189,248,0.75)]',
    glowStyle: 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, transparent 70%)',
    badge: 'telecat',
  },
  {
    id: 'sakura',
    name: 'Сакура #4$04',
    rarity: 'Эпический',
    previewBg: 'from-fuchsia-900/50 via-purple-950/40 to-[#0d0d12]',
    ringClass: 'border-[3px] border-pink-300 shadow-[0_0_26px_rgba(244,114,182,0.75)]',
    glowStyle: 'radial-gradient(circle, rgba(244,114,182,0.45) 0%, transparent 70%)',
    badge: 'sakura',
  },
  {
    id: 'rainbow',
    name: 'Радуга',
    rarity: 'Эпический',
    previewBg: 'from-purple-900/50 via-pink-950/30 to-[#0d0d12]',
    ringClass: 'border-[3px] border-fuchsia-400 shadow-[0_0_25px_rgba(192,132,252,0.7)]',
    glowStyle: 'conic-gradient(from 0deg, #ec4899, #8b5cf6, #06b6d4, #eab308, #ec4899)',
  },
  {
    id: 'gold',
    name: 'Золотая',
    rarity: 'Редкий',
    previewBg: 'from-sky-950/50 via-[#121622] to-[#0d0d12]',
    ringClass: 'border-[3px] border-[#e6c9a8] shadow-[0_0_22px_rgba(202,160,125,0.7)]',
    glowStyle: 'radial-gradient(circle, rgba(202,160,125,0.4) 0%, transparent 70%)',
  },
  {
    id: 'cyan',
    name: 'Бирюзовая',
    rarity: 'Обычный',
    previewBg: 'from-cyan-950/40 to-[#0d0d12]',
    ringClass: 'border-[3px] border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]',
    glowStyle: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)',
  },
  {
    id: 'purple',
    name: 'Фиолетовая',
    rarity: 'Обычный',
    previewBg: 'from-violet-950/40 to-[#0d0d12]',
    ringClass: 'border-[3px] border-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.55)]',
    glowStyle: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
  },
  {
    id: 'crimson',
    name: 'Красная',
    rarity: 'Обычный',
    previewBg: 'from-red-950/40 to-[#0d0d12]',
    ringClass: 'border-[3px] border-red-500 shadow-[0_0_18px_rgba(239,68,68,0.55)]',
    glowStyle: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
  },
  {
    id: 'band',
    name: 'Stellar Team',
    rarity: 'Обычный',
    previewBg: 'from-slate-900/60 to-[#0d0d12]',
    ringClass: 'border-[3px] border-slate-300 shadow-[0_0_16px_rgba(255,255,255,0.35)]',
    glowStyle: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
    badge: 'band',
  },
  {
    id: 'none',
    name: 'Без рамки',
    rarity: 'Обычный',
    previewBg: 'from-zinc-900/40 to-[#0d0d12]',
    ringClass: 'border-2 border-white/20',
    glowStyle: 'none',
  },
];

/* ==================== КАТАЛОГ ТИТУЛОВ WUWA И ANIMEON ==================== */
export interface ProfileTitleDef {
  id: string;
  name: string;
  source: string;
  category: 'wuwa' | 'neon';
  bgClass: string;
  borderClass: string;
  textClass: string;
  glowClass: string;
  emblem: string;
  accentCharacterId?: string;
}

const PROFILE_TITLES: ProfileTitleDef[] = [
  {
    id: 'star-law',
    name: 'Закон звёзд',
    source: 'Wuthering Waves · Достижение Соларис-3',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#1c1813] via-[#33271a] to-[#1c1813]',
    borderClass: 'border-[#e6c9a8]/70',
    textClass: 'text-[#fff7ed]',
    glowClass: 'shadow-[0_0_18px_rgba(230,201,168,0.35)]',
    emblem: '☀️',
    accentCharacterId: 'rover-spectro',
  },
  {
    id: 'loyal-blade',
    name: 'Верный клинок',
    source: 'Wuthering Waves · Испытание генерала',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#0f2926] via-[#18453f] to-[#0f2926]',
    borderClass: 'border-[#6ee7b7]/65',
    textClass: 'text-[#ecfdf5]',
    glowClass: 'shadow-[0_0_18px_rgba(52,211,153,0.35)]',
    emblem: '⚔️',
    accentCharacterId: 'jiyan',
  },
  {
    id: 'chaos-order',
    name: 'Порядок хаоса',
    source: 'Wuthering Waves · Глубины Разлома',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#1b1336] via-[#2e1f5e] to-[#1b1336]',
    borderClass: 'border-indigo-400/70',
    textClass: 'text-indigo-100',
    glowClass: 'shadow-[0_0_20px_rgba(129,140,248,0.4)]',
    emblem: '🌌',
    accentCharacterId: 'rover-havoc',
  },
  {
    id: 'universe-modulator',
    name: 'Модулятор мироздания',
    source: 'Wuthering Waves · Чёрные Берега',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#14131f] via-[#25213b] to-[#14131f]',
    borderClass: 'border-amber-300/70',
    textClass: 'text-amber-100',
    glowClass: 'shadow-[0_0_20px_rgba(252,211,77,0.35)]',
    emblem: '💠',
    accentCharacterId: 'shorekeeper',
  },
  {
    id: 'heart-no-end',
    name: 'Сердце не знает конца',
    source: 'Wuthering Waves · Пламя Советника',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#3b1212] via-[#6e1c1c] to-[#3b1212]',
    borderClass: 'border-orange-300/75',
    textClass: 'text-orange-50',
    glowClass: 'shadow-[0_0_22px_rgba(249,115,22,0.45)]',
    emblem: '🦊',
    accentCharacterId: 'changli',
  },
  {
    id: 'until-moonlight-fades',
    name: 'Пока не померкнет лунный свет',
    source: 'Wuthering Waves · Огни полуночи',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#171d47] via-[#283582] to-[#143d59]',
    borderClass: 'border-sky-300/75',
    textClass: 'text-sky-50',
    glowClass: 'shadow-[0_0_22px_rgba(56,189,248,0.45)]',
    emblem: '🌕',
    accentCharacterId: 'carlotta',
  },
  {
    id: 'gods-and-demons',
    name: 'Слышат боги и демоны',
    source: 'Wuthering Waves · Магистрат Цзиньчжоу',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#262118] via-[#3d3426] to-[#262118]',
    borderClass: 'border-[#e6c9a8]/65',
    textClass: 'text-[#f7ece6]',
    glowClass: 'shadow-[0_0_16px_rgba(230,201,168,0.3)]',
    emblem: '🐉',
    accentCharacterId: 'jinhsi',
  },
  {
    id: 'sun-bringer',
    name: 'Доставщик солнца',
    source: 'Wuthering Waves · Триумф арены',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#2b1e16] via-[#4a3122] to-[#2b1e16]',
    borderClass: 'border-amber-300/65',
    textClass: 'text-amber-50',
    glowClass: 'shadow-[0_0_16px_rgba(251,191,36,0.3)]',
    emblem: '☀️',
    accentCharacterId: 'lupa',
  },
  {
    id: 'rarity-collector',
    name: 'Собиратель редкостей',
    source: 'Wuthering Waves · Коллекционер эхо',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#1f2421] via-[#2f3833] to-[#1f2421]',
    borderClass: 'border-[#e6c9a8]/65',
    textClass: 'text-[#f7ece6]',
    glowClass: 'shadow-[0_0_16px_rgba(230,201,168,0.3)]',
    emblem: '✦',
    accentCharacterId: 'camellya',
  },
  {
    id: 'tycoon',
    name: 'Делец',
    source: 'Wuthering Waves · Торговая гильдия',
    category: 'wuwa',
    bgClass: 'bg-gradient-to-r from-[#1c1b18] via-[#302d26] to-[#1c1b18]',
    borderClass: 'border-yellow-500/65',
    textClass: 'text-yellow-100',
    glowClass: 'shadow-[0_0_16px_rgba(234,179,8,0.3)]',
    emblem: '💎',
    accentCharacterId: 'calcharo',
  },
  {
    id: 'ghoul',
    name: 'ГУЛЬ',
    source: 'Эксклюзивный неоновый титул',
    category: 'neon',
    bgClass: 'bg-rose-950/60',
    borderClass: 'border-rose-500',
    textClass: 'text-rose-400',
    glowClass: 'shadow-[0_0_16px_rgba(244,63,94,0.65)]',
    emblem: '👁',
  },
  {
    id: 'hero-of-week',
    name: 'ГЕРОЙ НЕДЕЛИ',
    source: 'Эксклюзивный неоновый титул',
    category: 'neon',
    bgClass: 'bg-purple-950/60',
    borderClass: 'border-purple-400',
    textClass: 'text-purple-200',
    glowClass: 'shadow-[0_0_18px_rgba(168,85,247,0.65)]',
    emblem: '👑',
  },
  {
    id: 'catwife',
    name: 'КОШКОЖЕНА',
    source: 'Эксклюзивный неоновый титул',
    category: 'neon',
    bgClass: 'bg-pink-950/60',
    borderClass: 'border-pink-400',
    textClass: 'text-pink-200',
    glowClass: 'shadow-[0_0_18px_rgba(236,72,153,0.65)]',
    emblem: '🌙',
  },
];

/* ==================== ПРЕСЕТЫ ШАПОК ПРОФИЛЯ ==================== */
const BANNER_PRESETS = [
  {
    id: 'sunset-wings',
    name: 'Багровый закат (AnimeOn)',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'solaris-night',
    name: 'Ночной Соларис-3',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'black-shores',
    name: 'Чёрные Берега',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'crimson-moon',
    name: 'Кровавая луна Камеллии',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'rinascita-nebula',
    name: 'Звёздный горизонт',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80',
  },
];

/* ==================== ТИП КАСТОМИЗАЦИИ ПРОФИЛЯ ==================== */
export type OnlineStatusType = 'online' | 'ingame' | 'dnd' | 'offline';

export interface ProfileCustomization {
  username: string;
  avatarUrl: string;
  bannerUrl: string;
  frameId: string;
  titleId: string;
  secondaryBadge: string;
  status: OnlineStatusType;
  registeredAt: string;
  hexSignature: string;
  bio: string;
  level: number;
  xp: number;
  era: string;
  autoLevel: boolean;
  hoursSpent: number;
  favoriteCharIds: string[];
}

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '700134928',
  nickname: 'HaradaAkira',
  unionLevel: 80,
  signature: 'Apostle of the Epilogue and Eternity',
  roster: [],
};

const DEFAULT_CUSTOM: ProfileCustomization = {
  username: 'haradaakira',
  avatarUrl: '/images/Camellya_Card.webp',
  bannerUrl: BANNER_PRESETS[0].url,
  frameId: 'power',
  titleId: 'star-law',
  secondaryBadge: 'SOLARIS PASS',
  status: 'online',
  registeredAt: '26 августа 2026 г.',
  hexSignature: 'CAFE BABE 13E4 3AF4 6D2D 3881 6161 73C6',
  bio: `[ Apostle of the Epilogue and Eternity ] tg: haradaakiratt
[ Demon King of Salvation ] tt: teamconstellations
[ The Oldest Dream ] ds: haradaakira
[ Founder of Team Constellations ] twitch: haradaakira
[ King of a Kingless World ] youtube: @team.constellations`,
  level: 3110,
  xp: 186428,
  era: 'Магма',
  autoLevel: false,
  hoursSpent: 367,
  favoriteCharIds: ['camellya', 'changli', 'shorekeeper', 'jinhsi'],
};

const STATUS_META: Record<
  OnlineStatusType,
  { label: string; dotClass: string; textClass: string }
> = {
  online: {
    label: 'В сети',
    dotClass: 'bg-purple-400 shadow-[0_0_10px_#c084fc]',
    textClass: 'text-purple-300',
  },
  ingame: {
    label: 'В Соларис-3',
    dotClass: 'bg-emerald-400 shadow-[0_0_10px_#34d399]',
    textClass: 'text-emerald-300',
  },
  dnd: {
    label: 'Не беспокоить',
    dotClass: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]',
    textClass: 'text-rose-300',
  },
  offline: {
    label: 'Не в сети',
    dotClass: 'bg-gray-500',
    textClass: 'text-gray-400',
  },
};

function compressImageFile(file: File, maxW: number, maxH: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ==================== КОМПОНЕНТ АВАТАРА С РАМКОЙ ==================== */
const FramedAvatar = ({
  src,
  fallbackLetter,
  frame,
  size = 'lg',
}: {
  src: string;
  fallbackLetter: string;
  frame: AvatarFrameDef;
  size?: 'lg' | 'md';
}) => {
  const [imgErr, setImgErr] = useState(false);
  useEffect(() => setImgErr(false), [src]);

  const boxSize = size === 'lg' ? 'w-32 h-32 sm:w-36 sm:h-36' : 'w-20 h-20';

  return (
    <div className={`relative ${boxSize} select-none shrink-0 flex items-center justify-center`}>
      {frame.glowStyle !== 'none' && (
        <div
          aria-hidden="true"
          style={{ background: frame.glowStyle }}
          className="absolute -inset-2 rounded-full blur-md opacity-75 pointer-events-none"
        />
      )}

      {frame.badge === 'power' && (
        <>
          <svg
            viewBox="0 0 120 120"
            className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] pointer-events-none z-20 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"
          >
            <path d="M28 24 C22 6, 36 4, 42 18 Z" fill="#e11d48" stroke="#fecdd3" strokeWidth="1.2" />
            <path d="M92 24 C98 6, 84 4, 78 18 Z" fill="#e11d48" stroke="#fecdd3" strokeWidth="1.2" />
            <path
              d="M96 34 C118 55, 114 92, 86 108 C102 88, 104 60, 88 42 Z"
              fill="#fb7185"
              opacity="0.9"
            />
          </svg>
          <span className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-12 z-20 px-1.5 py-0.5 rounded bg-rose-600 text-[9px] font-black tracking-tighter text-white shadow-[0_0_10px_#e11d48] border border-rose-300 pointer-events-none">
            POWER!
          </span>
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -left-1 z-20 text-base drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] pointer-events-none"
          >
            🐱
          </span>
        </>
      )}

      {frame.badge === 'king' && (
        <span
          aria-hidden="true"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 text-xl drop-shadow-[0_0_12px_rgba(251,191,36,0.95)] pointer-events-none"
        >
          👑
        </span>
      )}

      {frame.badge === 'telecat' && (
        <>
          <svg
            viewBox="0 0 120 120"
            className="absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none z-20 drop-shadow-[0_0_8px_rgba(56,189,248,0.85)]"
          >
            <polygon points="18,32 14,6 38,18" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="2" />
            <polygon points="102,32 106,6 82,18" fill="#38bdf8" stroke="#e0f2fe" strokeWidth="2" />
          </svg>
          <span className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 text-xs drop-shadow pointer-events-none">
            🌙
          </span>
        </>
      )}

      {frame.badge === 'sakura' && (
        <>
          <span className="absolute -top-1 -right-1 z-20 text-sm pointer-events-none">🌸</span>
          <span className="absolute -bottom-1 -left-1 z-20 text-sm pointer-events-none">🌸</span>
        </>
      )}

      {frame.badge === 'band' && (
        <div className="absolute top-2 inset-x-2 z-20 py-0.5 rounded bg-gradient-to-r from-slate-700 via-slate-200 to-slate-700 text-[#09090b] text-[8px] font-black text-center tracking-widest uppercase shadow pointer-events-none">
          Stellar
        </div>
      )}

      <div
        className={`relative w-full h-full rounded-full overflow-hidden bg-[#12131c] flex items-center justify-center z-10 ${frame.ringClass}`}
      >
        {src && !imgErr ? (
          <img
            src={src}
            alt="Аватар"
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
        ) : (
          <span className="text-3xl font-extrabold text-ivory">
            {fallbackLetter.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
};

/* ==================== КОМПОНЕНТ ПЛАШКИ ТИТУЛА ==================== */
const TitleBadge = ({
  title,
  size = 'md',
}: {
  title: ProfileTitleDef;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const charArt = title.accentCharacterId ? IMAGES[title.accentCharacterId] : undefined;
  const pad =
    size === 'lg'
      ? 'px-5 py-2 text-sm'
      : size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px]'
      : 'px-3.5 py-1 text-xs';

  return (
    <span
      className={`relative inline-flex items-center gap-2 rounded-full border font-bold tracking-wide overflow-hidden select-none ${pad} ${title.bgClass} ${title.borderClass} ${title.textClass} ${title.glowClass}`}
    >
      {charArt && (
        <img
          src={charArt}
          alt=""
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-14 object-cover object-top opacity-35 pointer-events-none"
          style={{
            WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 25%, transparent 100%)',
          }}
        />
      )}
      <span className="relative z-10 text-[11px] opacity-90">{title.emblem}</span>
      <span className="relative z-10 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{title.name}</span>
      {title.category === 'wuwa' && (
        <span aria-hidden="true" className="relative z-10 text-[10px] text-[#e6c9a8] opacity-85">
          ✦
        </span>
      )}
    </span>
  );
};

/* ==================== ГЛАВНЫЙ КОМПОНЕНТ СТРАНИЦЫ ПРОФИЛЯ ==================== */
export const ProfilePage = () => {
  useDocumentMeta({
    title: 'Профиль — Stellar Wiki',
    description: 'Персональный профиль Ровера: кастомизация, титулы Wuthering Waves, уровень и ростер.',
  });

  const { user, token } = useAuth();
  const [profile, setProfile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [custom, setCustom] = useLocalStorage<ProfileCustomization>(
    'ww_profile_custom_v1',
    DEFAULT_CUSTOM,
  );
  const [collected] = useLocalStorage<string[]>('ww_map_collected', []);

  const [activeSection, setActiveSection] = useState<
    'main' | 'roster' | 'showcase' | 'favorites' | 'achievements'
  >('main');

  const [viewAsVisitor, setViewAsVisitor] = useState(false);

  const [appearanceModal, setAppearanceModal] = useState<
    null | 'frames' | 'titles' | 'banner' | 'avatar'
  >(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [syncingServer, setSyncingServer] = useState(false);

  const [pickId, setPickId] = useState('');
  const [pickLevel, setPickLevel] = useState(90);
  const [pickWeapon, setPickWeapon] = useState('');
  const [pickEcho, setPickEcho] = useState('');

  const avatarFileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!API_ENABLED || !token) return;
    apiGetProfile(token)
      .then((srv) => {
        if (srv.roster && srv.roster.length > 0) {
          setProfile((prev) => ({
            ...prev,
            uid: srv.uid || prev.uid,
            roster: srv.roster.map((r) => ({
              characterId: r.characterId,
              level: r.level,
              weapon: r.weapon,
              echoSet: r.echoSet,
            })),
          }));
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (user?.nickname && profile.nickname === 'Rover') {
      setProfile((prev) => ({ ...prev, nickname: user.nickname }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const currentFrame = useMemo(
    () => AVATAR_FRAMES.find((f) => f.id === custom.frameId) ?? AVATAR_FRAMES[0],
    [custom.frameId],
  );
  const currentTitle = useMemo(
    () => PROFILE_TITLES.find((t) => t.id === custom.titleId) ?? PROFILE_TITLES[0],
    [custom.titleId],
  );
  const statusInfo = STATUS_META[custom.status] ?? STATUS_META.online;

  const mapPercent = useMemo(
    () => Math.round((collected.length / Math.max(1, MAP_MARKERS.length)) * 100),
    [collected],
  );

  const computedLevelData = useMemo(() => {
    if (!custom.autoLevel) {
      const xpInCurrentLevel = custom.xp % 100;
      const pct = Math.max(5, Math.min(99, xpInCurrentLevel || 10));
      const remaining = 100 - pct;
      const shortLabel =
        custom.level >= 1000
          ? `${(custom.level / 1000).toFixed(1).replace('.0', '')}K`
          : String(custom.level);
      return {
        level: custom.level,
        shortLabel,
        xpFormatted: custom.xp.toLocaleString('ru-RU'),
        percent: pct,
        remainingXp: remaining,
        nextLevel: custom.level + 1,
        era: custom.era || 'Магма',
      };
    }
    const totalXp =
      profile.roster.length * 450 + collected.length * 120 + profile.unionLevel * 85 + 1200;
    const lvl = Math.max(1, Math.floor(totalXp / 250));
    const rem = totalXp % 250;
    const pct = Math.round((rem / 250) * 100);
    const era =
      lvl >= 100
        ? 'Астрал Соларис-3'
        : lvl >= 50
        ? 'Магма'
        : lvl >= 20
        ? 'Резонанс'
        : 'Пробуждение';
    return {
      level: lvl,
      shortLabel: lvl >= 1000 ? `${(lvl / 1000).toFixed(1)}K` : String(lvl),
      xpFormatted: totalXp.toLocaleString('ru-RU'),
      percent: pct,
      remainingXp: 250 - rem,
      nextLevel: lvl + 1,
      era,
    };
  }, [custom, profile.roster.length, profile.unionLevel, collected.length]);

  const cycleStatus = () => {
    if (viewAsVisitor) return;
    const order: OnlineStatusType[] = ['online', 'ingame', 'dnd', 'offline'];
    const next = order[(order.indexOf(custom.status) + 1) % order.length];
    setCustom({ ...custom, status: next });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 420, 420);
      setCustom({ ...custom, avatarUrl: dataUrl });
    } catch {
      // игнорируем ошибку чтения
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 1440, 520);
      setCustom({ ...custom, bannerUrl: dataUrl });
    } catch {
      // игнорируем ошибку чтения
    }
  };

  const syncRosterToServer = async (nextRoster: PlayerProfile['roster'], nextUid?: string) => {
    if (!API_ENABLED || !token) return;
    setSyncingServer(true);
    try {
      await apiSaveProfile(token, {
        uid: nextUid ?? profile.uid,
        roster: nextRoster.map((r) => ({
          characterId: r.characterId,
          level: r.level,
          weapon: r.weapon,
          echoSet: r.echoSet,
          source: 'manual' as const,
        })),
      });
    } catch {
      // локальная копия уже сохранена
    } finally {
      setSyncingServer(false);
    }
  };

  const addToRoster = () => {
    if (!pickId) return;
    if (profile.roster.some((r) => r.characterId === pickId)) return;
    const nextRoster = [
      ...profile.roster,
      {
        characterId: pickId,
        level: pickLevel,
        weapon: pickWeapon.trim() || 'Сигнатурное',
        echoSet: pickEcho.trim() || '4-3-3-1-1',
      },
    ];
    setProfile({ ...profile, roster: nextRoster });
    syncRosterToServer(nextRoster);
    setPickId('');
    setPickWeapon('');
    setPickEcho('');
  };

  const removeFromRoster = (charId: string) => {
    const nextRoster = profile.roster.filter((r) => r.characterId !== charId);
    setProfile({ ...profile, roster: nextRoster });
    syncRosterToServer(nextRoster);
  };

  const toggleFavoriteChar = (charId: string) => {
    const exists = custom.favoriteCharIds.includes(charId);
    const next = exists
      ? custom.favoriteCharIds.filter((id) => id !== charId)
      : [...custom.favoriteCharIds, charId];
    setCustom({ ...custom, favoriteCharIds: next });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const availableForRoster = useMemo(
    () => CHARACTERS.filter((c) => !profile.roster.some((r) => r.characterId === c.id)),
    [profile.roster],
  );

  const achievements = useMemo(
    () => [
      {
        id: 'a1',
        title: 'Первый шаг в Соларис-3',
        desc: 'Создать и кастомизировать личный профиль Ровера',
        done: true,
        reward: 'Титул «Закон звёзд»',
      },
      {
        id: 'a2',
        title: 'Тактический отряд',
        desc: 'Добавить минимум 3 резонаторов в личный ростер',
        done: profile.roster.length >= 3,
        reward: 'Рамка «Золотая»',
      },
      {
        id: 'a3',
        title: 'Коллекционер резонанса',
        desc: 'Собрать 10 или более персонажей в ростере',
        done: profile.roster.length >= 10,
        reward: 'Титул «Собиратель редкостей»',
      },
      {
        id: 'a4',
        title: 'Первопроходец Хуанлуна',
        desc: 'Отметить собранными минимум 5 точек на интерактивной карте',
        done: collected.length >= 5,
        reward: 'Титул «Доставщик солнца»',
      },
      {
        id: 'a5',
        title: 'Хранитель Эпохи',
        desc: 'Достичь 100+ уровня профиля',
        done: computedLevelData.level >= 100,
        reward: 'Рамка «■THE_KING_IS_AWAKE■»',
      },
    ],
    [profile.roster.length, collected.length, computedLevelData.level],
  );

  const bioLines = useMemo(
    () =>
      custom.bio
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    [custom.bio],
  );

  return (
    <div className="space-y-6 pb-10">
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />
      <input
        ref={bannerFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBannerUpload}
        className="hidden"
      />

      {/* ==================== ВЕРХНИЙ БЛОК: БАННЕР + ПРОФИЛЬ ==================== */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0b0c12] shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
        <div className="relative h-60 sm:h-72 md:h-80 w-full overflow-hidden">
          <img
            src={custom.bannerUrl || BANNER_PRESETS[0].url}
            alt="Шапка профиля"
            className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700"
            draggable={false}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0b0c12] via-[#0b0c12]/65 to-black/20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#0b0c12]/80 via-transparent to-[#0b0c12]/40"
          />

          {!viewAsVisitor && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAppearanceModal('banner')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/55 hover:bg-black/75 backdrop-blur-xl border border-white/15 text-xs font-semibold text-ivory transition-all focus-ring"
              >
                <Camera size={14} className="text-accent-light" />
                <span>Изменить фон</span>
              </button>
            </div>
          )}

          {viewAsVisitor && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewAsVisitor(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-bold shadow-lg transition-all"
              >
                <EyeOff size={14} />
                <span>Выйти из режима просмотра</span>
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 -mt-28 sm:-mt-32 px-5 sm:px-8 pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative group mx-auto md:mx-0">
              <FramedAvatar
                src={custom.avatarUrl}
                fallbackLetter={profile.nickname.charAt(0) || 'R'}
                frame={currentFrame}
                size="lg"
              />
              {!viewAsVisitor && (
                <button
                  type="button"
                  onClick={() => setAppearanceModal('avatar')}
                  title="Изменить аватар или рамку"
                  className="absolute inset-0 z-30 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-[11px] font-bold transition-opacity"
                >
                  <Camera size={18} className="text-accent-light" />
                  <span>Аватар</span>
                </button>
              )}
            </div>

            <div className="flex-1 min-w-0 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow">
                  {profile.nickname}
                </h1>
                <span className="text-sm font-medium text-gray-400">
                  @{custom.username.replace(/^@/, '')}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => !viewAsVisitor && setAppearanceModal('titles')}
                  className={viewAsVisitor ? 'cursor-default' : 'hover:scale-[1.03] transition-transform'}
                  title={viewAsVisitor ? currentTitle.name : 'Нажми, чтобы сменить титул'}
                >
                  <TitleBadge title={currentTitle} />
                </button>

                {custom.secondaryBadge && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-400/40 text-purple-200 text-xs font-bold shadow-[0_0_14px_rgba(168,85,247,0.25)]">
                    <Crown size={12} className="text-purple-300" />
                    <span>{custom.secondaryBadge}</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-gray-200">
                  <Sparkles size={12} className="text-accent-light" />
                  <span>
                    {profile.roster.length}/{CHARACTERS.length}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono text-gray-300">
                  UID: {profile.uid} · UL {profile.unionLevel}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 mt-3 text-xs">
                <button
                  type="button"
                  onClick={cycleStatus}
                  title={
                    viewAsVisitor
                      ? statusInfo.label
                      : 'Нажми, чтобы переключить статус (В сети / В Соларис-3 / Не беспокоить / Не в сети)'
                  }
                  className={`inline-flex items-center gap-2 font-semibold ${statusInfo.textClass} ${
                    viewAsVisitor ? 'cursor-default' : 'hover:opacity-85 cursor-pointer'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                  <span>{statusInfo.label}</span>
                </button>

                <span className="text-gray-600">•</span>

                <span className="inline-flex items-center gap-1.5 text-gray-400">
                  <Calendar size={12} className="text-gray-500" />
                  <span>На сайте с {custom.registeredAt}</span>
                </span>
              </div>

              {custom.hexSignature && (
                <p className="mt-2 font-mono text-[11px] tracking-[0.22em] text-gray-500/80 uppercase truncate">
                  {custom.hexSignature}
                </p>
              )}

              {bioLines.length > 0 && (
                <div className="mt-3.5 space-y-1 text-xs sm:text-[13px] text-gray-200/95 font-medium leading-relaxed max-w-2xl">
                  {bioLines.map((line, idx) => (
                    <p key={idx} className="truncate sm:whitespace-normal">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!viewAsVisitor && (
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 mt-6 pt-4 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 transition-all focus-ring"
              >
                {copiedShare ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-300">Ссылка скопирована</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} className="text-gray-400" />
                    <span>Поделиться</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setViewAsVisitor(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 transition-all focus-ring"
              >
                <Eye size={14} className="text-gray-400" />
                <span>Как видят другие</span>
              </button>

              <button
                type="button"
                onClick={() => setAppearanceModal('frames')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-gray-200 transition-all focus-ring"
              >
                <Palette size={14} className="text-accent-light" />
                <span>Внешний вид</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all focus-ring"
              >
                <Settings size={14} />
                <span>Настройки</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== НИЖНЯЯ СЕТКА: КОНТЕНТ СЛЕВА + МЕНЮ СПРАВА ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,260px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <div className="rounded-2xl p-4 sm:px-6 bg-gradient-to-r from-[#1c1635]/90 via-[#151324]/90 to-[#12121a]/90 border border-purple-500/25 flex items-center justify-between gap-4 shadow-lg">
            <div>
              <p className="text-sm font-extrabold text-purple-300 tracking-wide">
                {custom.secondaryBadge || 'Stellar Pass'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Полная кастомизация профиля, рамок и титулов Соларис-3 открыта
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-extrabold uppercase tracking-wider text-ivory shrink-0">
              АКТИВЕН
            </span>
          </div>

          {/* КАРТОЧКА УРОВНЯ ПРОФИЛЯ */}
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#261214]/90 via-[#141218]/95 to-[#121216]/95 border border-rose-500/25 shadow-[0_15px_45px_rgba(0,0,0,0.65)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-rose-600/20 blur-3xl"
            />
            <div className="relative flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-rose-500/25 to-orange-950/60 border-2 border-rose-500/60 shadow-[0_0_24px_rgba(244,63,94,0.45)] flex items-center justify-center shrink-0">
                <span className="text-sm sm:text-base font-black text-orange-100 tracking-tight">
                  {computedLevelData.shortLabel}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-lg sm:text-xl font-black text-white">
                      Уровень {computedLevelData.level}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      {computedLevelData.xpFormatted} XP
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-black text-rose-400">
                    {computedLevelData.percent}%
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-black/60 border border-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${computedLevelData.percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 shadow-[0_0_12px_rgba(249,115,22,0.8)]"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 mt-2 text-xs text-gray-400">
                  <span>
                    Эра: <strong className="text-gray-200">{computedLevelData.era}</strong>
                  </span>
                  <span>
                    ещё <strong className="text-gray-200">{computedLevelData.remainingXp} XP</strong> до{' '}
                    {computedLevelData.nextLevel} уровня
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 ПЛИТКИ СТАТИСТИКИ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="glass-panel p-4 relative overflow-hidden">
              <Clock size={15} className="absolute top-3.5 right-3.5 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {custom.hoursSpent} ч
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                В СОЛАРИС-3
              </p>
            </div>

            <div className="glass-panel p-4 relative overflow-hidden">
              <Users size={15} className="absolute top-3.5 right-3.5 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {profile.roster.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                В РОСТЕРЕ
              </p>
            </div>

            <div className="glass-panel p-4 relative overflow-hidden">
              <Compass size={15} className="absolute top-3.5 right-3.5 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {mapPercent}%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                ЗАЧИСТКА КАРТЫ
              </p>
            </div>

            <div className="glass-panel p-4 relative overflow-hidden">
              <Trophy size={15} className="absolute top-3.5 right-3.5 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {achievements.filter((a) => a.done).length}/{achievements.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                ДОСТИЖЕНИЯ
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {(activeSection === 'main' || activeSection === 'roster') && (
                <div className="glass-panel p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>Мой ростер резонаторов ({profile.roster.length})</span>
                        {syncingServer && (
                          <RefreshCw size={14} className="animate-spin text-accent-light" />
                        )}
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Персонажи в твоей коллекции, их уровень, оружие и эхо-сеты
                      </p>
                    </div>
                  </div>

                  {profile.roster.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-black/30 border border-white/[0.06] text-center">
                      <p className="text-sm text-gray-400">
                        В ростере пока пусто. Добавь своих персонажей через форму ниже!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.roster.map((r) => {
                        const char = getCharacterById(r.characterId);
                        if (!char) return null;
                        const el = ELEMENTS[char.element];
                        return (
                          <div
                            key={r.characterId}
                            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-center gap-3.5 transition-colors"
                          >
                            <Link to={`/characters/${char.id}`} className="shrink-0">
                              <ImagePlaceholder
                                id={char.id}
                                initials={char.name.slice(0, 2)}
                                element={char.element}
                                className="w-14 h-16 rounded-xl border border-white/15 object-top"
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/characters/${char.id}`}
                                  className="font-bold text-sm text-white hover:text-accent-light truncate"
                                >
                                  {char.name}
                                </Link>
                                <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent-light text-[10px] font-bold">
                                  Ур. {r.level}
                                </span>
                              </div>
                              <p className={`text-[11px] ${el.color} mt-0.5`}>
                                {el.label} · {WEAPON_LABELS[char.weapon]}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-1">
                                🗡 {r.weapon} · 🎒 {r.echoSet}
                              </p>
                            </div>
                            {!viewAsVisitor && (
                              <button
                                type="button"
                                onClick={() => removeFromRoster(r.characterId)}
                                className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                aria-label={`Удалить ${char.name}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {!viewAsVisitor && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                        <UserPlus size={14} className="text-accent-light" />
                        <span>Добавить резонатора в ростер</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        <select
                          value={pickId}
                          onChange={(e) => setPickId(e.target.value)}
                          className="bg-[#0b0d14] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-ivory focus-ring"
                        >
                          <option value="">— Персонаж —</option>
                          {availableForRoster.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.rarity}★)
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={pickLevel}
                          onChange={(e) => setPickLevel(Number(e.target.value))}
                          placeholder="Уровень"
                          className="bg-[#0b0d14] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-ivory focus-ring"
                        />
                        <input
                          type="text"
                          value={pickWeapon}
                          onChange={(e) => setPickWeapon(e.target.value)}
                          placeholder="Оружие"
                          className="bg-[#0b0d14] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-ivory focus-ring"
                        />
                        <input
                          type="text"
                          value={pickEcho}
                          onChange={(e) => setPickEcho(e.target.value)}
                          placeholder="Эхо-набор"
                          className="bg-[#0b0d14] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-ivory focus-ring"
                        />
                        <button
                          type="button"
                          onClick={addToRoster}
                          disabled={!pickId}
                          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] font-extrabold text-sm disabled:opacity-40 hover:brightness-105 transition-all"
                        >
                          Добавить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(activeSection === 'showcase' || activeSection === 'favorites') && (
                <div className="glass-panel p-5 sm:p-6 space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Любимые резонаторы на витрине ({custom.favoriteCharIds.length})
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Нажми на сердечко на карточке любого персонажа ниже, чтобы закрепить его на витрине профиля
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {custom.favoriteCharIds.map((cid) => {
                      const char = getCharacterById(cid);
                      if (!char) return null;
                      return (
                        <div
                          key={cid}
                          className="group relative rounded-2xl overflow-hidden border border-white/15 bg-[#0b0d14] aspect-[3/4]"
                        >
                          <Link to={`/characters/${char.id}`} className="block w-full h-full">
                            <ImagePlaceholder
                              id={char.id}
                              initials={char.name.slice(0, 2)}
                              element={char.element}
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                              <p className="font-bold text-sm text-white truncate">{char.name}</p>
                              <p className="text-[11px] text-accent-light truncate">{char.title}</p>
                            </div>
                          </Link>
                          {!viewAsVisitor && (
                            <button
                              type="button"
                              onClick={() => toggleFavoriteChar(char.id)}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-rose-400 hover:bg-black/80"
                              title="Убрать из любимого"
                            >
                              <Heart size={14} fill="currentColor" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!viewAsVisitor && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                        Быстрый выбор любимых персонажей:
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto p-1">
                        {CHARACTERS.map((c) => {
                          const fav = custom.favoriteCharIds.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => toggleFavoriteChar(c.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                                fav
                                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-200'
                                  : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
                              }`}
                            >
                              <Heart size={11} fill={fav ? 'currentColor' : 'none'} />
                              <span>{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'achievements' && (
                <div className="glass-panel p-5 sm:p-6 space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Достижения и награды профиля</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Прогресс выполнения активностей на сайте Stellar Wiki
                    </p>
                  </div>
                  <div className="space-y-3">
                    {achievements.map((a) => (
                      <div
                        key={a.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                          a.done
                            ? 'bg-emerald-500/10 border-emerald-400/30'
                            : 'bg-white/[0.03] border-white/10 opacity-70'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              a.done
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                : 'bg-white/5 text-gray-500 border border-white/10'
                            }`}
                          >
                            <Award size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">{a.title}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-semibold text-accent-light shrink-0">
                          {a.reward}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ПРАВАЯ КОЛОНКА НАВИГАЦИИ ПО ПРОФИЛЮ */}
        <div className="glass-panel p-2.5 space-y-1">
          {(
            [
              { id: 'main', label: 'Основное', icon: LayoutGrid },
              { id: 'showcase', label: 'Витрина', icon: Sparkles },
              { id: 'favorites', label: 'Любимое', icon: Heart },
              { id: 'roster', label: 'Мой ростер', icon: Layers },
              { id: 'achievements', label: 'Достижения', icon: Trophy },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                  active
                    ? 'bg-purple-600/25 text-purple-200 border border-purple-400/35 shadow-[0_0_16px_rgba(147,51,234,0.25)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={17} className={active ? 'text-purple-300' : 'text-gray-500'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== МОДАЛКА «ВНЕШНИЙ ВИД» ==================== */}
      <AnimatePresence>
        {appearanceModal && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setAppearanceModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[88vh] overflow-y-auto rounded-3xl bg-[#0e0f17] border border-white/15 shadow-[0_25px_90px_rgba(0,0,0,0.9)] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { id: 'frames', label: 'Рамки аватара' },
                      { id: 'titles', label: 'Титулы (WuWa)' },
                      { id: 'avatar', label: 'Аватарка' },
                      { id: 'banner', label: 'Шапка профиля' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAppearanceModal(t.id)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                        appearanceModal === t.id
                          ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] shadow'
                          : 'bg-white/[0.05] text-gray-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAppearanceModal(null)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {appearanceModal === 'frames' && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>
                      Сейчас надета: <strong className="text-white">{currentFrame.name}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustom({ ...custom, frameId: 'none' })}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕ Снять рамку
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {AVATAR_FRAMES.map((frame) => {
                      const active = custom.frameId === frame.id;
                      return (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() => setCustom({ ...custom, frameId: frame.id })}
                          className={`group relative rounded-2xl overflow-hidden border text-left transition-all ${
                            active
                              ? 'border-purple-400 ring-2 ring-purple-500/40'
                              : 'border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div
                            className={`h-40 bg-gradient-to-b ${frame.previewBg} flex items-center justify-center p-4 relative`}
                          >
                            <FramedAvatar
                              src={custom.avatarUrl}
                              fallbackLetter={profile.nickname.charAt(0) || 'R'}
                              frame={frame}
                              size="md"
                            />
                            {active && (
                              <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                                <Check size={14} />
                              </span>
                            )}
                          </div>
                          <div
                            className={`p-3 ${
                              active ? 'bg-purple-950/60' : 'bg-[#141520]'
                            } border-t border-white/5`}
                          >
                            <p className="font-bold text-xs text-white truncate">{frame.name}</p>
                            <p
                              className={`text-[11px] mt-0.5 ${
                                active ? 'text-purple-300 font-semibold' : 'text-gray-400'
                              }`}
                            >
                              {active ? 'В профиле' : frame.rarity}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {appearanceModal === 'titles' && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="flex items-center gap-2">
                      <span>Сейчас надет:</span>
                      <TitleBadge title={currentTitle} size="sm" />
                    </span>
                    <span>Собрано: {PROFILE_TITLES.length}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PROFILE_TITLES.map((t) => {
                      const active = custom.titleId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCustom({ ...custom, titleId: t.id })}
                          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                            active
                              ? 'bg-purple-950/35 border-amber-300/70 shadow-[0_0_20px_rgba(230,201,168,0.2)]'
                              : 'bg-[#141520] border-white/10 hover:border-white/25'
                          }`}
                        >
                          <div className="flex flex-col items-start gap-1.5 min-w-0">
                            <TitleBadge title={t} size="md" />
                            <span className="text-[11px] text-gray-400 truncate">{t.source}</span>
                          </div>
                          {active && (
                            <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 flex items-center justify-center shrink-0">
                              <Check size={14} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {appearanceModal === 'avatar' && (
                <div className="mt-6 space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <FramedAvatar
                      src={custom.avatarUrl}
                      fallbackLetter={profile.nickname.charAt(0) || 'R'}
                      frame={currentFrame}
                      size="md"
                    />
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => avatarFileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-extrabold"
                        >
                          <Upload size={14} />
                          <span>Загрузить файл с ПК</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={custom.avatarUrl}
                        onChange={(e) => setCustom({ ...custom, avatarUrl: e.target.value })}
                        placeholder="Или вставь прямую ссылку на картинку / GIF..."
                        className="w-full bg-[#0b0d14] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-ivory"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Или выбери портрет резонатора Wuthering Waves:
                    </p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5 max-h-64 overflow-y-auto p-1">
                      {CHARACTERS.map((c) => {
                        const url = IMAGES[c.id];
                        if (!url) return null;
                        const selected = custom.avatarUrl === url;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setCustom({ ...custom, avatarUrl: url })}
                            className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                              selected
                                ? 'border-amber-300 scale-105 shadow-lg'
                                : 'border-white/10 hover:border-white/40'
                            }`}
                            title={c.name}
                          >
                            <img
                              src={url}
                              alt={c.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </button>
                        );
                          })}
                    </div>
                  </div>
                </div>
              )}

              {appearanceModal === 'banner' && (
                <div className="mt-6 space-y-5">
                  <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-300">
                        Своя шапка профиля (широкое изображение)
                      </span>
                      <button
                        type="button"
                        onClick={() => bannerFileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-extrabold"
                      >
                        <Upload size={14} />
                        <span>Загрузить фон с ПК</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={custom.bannerUrl}
                      onChange={(e) => setCustom({ ...custom, bannerUrl: e.target.value })}
                      placeholder="Или вставь прямую ссылку на изображение шапки..."
                      className="w-full bg-[#0b0d14] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-ivory"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      Готовые атмосферные фоны:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {BANNER_PRESETS.map((b) => {
                        const active = custom.bannerUrl === b.url;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setCustom({ ...custom, bannerUrl: b.url })}
                            className={`relative h-28 rounded-2xl overflow-hidden border-2 text-left transition-all ${
                              active
                                ? 'border-amber-300 shadow-lg'
                                : 'border-white/10 hover:border-white/30'
                            }`}
                          >
                            <img src={b.url} alt={b.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                              <span className="text-xs font-bold text-white">{b.name}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== МОДАЛКА «НАСТРОЙКИ» ==================== */}
      <AnimatePresence>
        {settingsModalOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSettingsModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl bg-[#0e0f17] border border-white/15 shadow-[0_25px_90px_rgba(0,0,0,0.9)] p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-extrabold text-white">Настройки профиля</h3>
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">Никнейм</span>
                  <input
                    type="text"
                    value={profile.nickname}
                    onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">
                    Юзернейм (@username)
                  </span>
                  <input
                    type="text"
                    value={custom.username}
                    onChange={(e) =>
                      setCustom({ ...custom, username: e.target.value.replace(/^@/, '') })
                    }
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">Игровой UID</span>
                  <input
                    type="text"
                    value={profile.uid}
                    onChange={(e) => {
                      setProfile({ ...profile, uid: e.target.value });
                      syncRosterToServer(profile.roster, e.target.value);
                    }}
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">Union Level</span>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={profile.unionLevel}
                    onChange={(e) =>
                      setProfile({ ...profile, unionLevel: Number(e.target.value) })
                    }
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">
                    Статус в профиле
                  </span>
                  <select
                    value={custom.status}
                    onChange={(e) =>
                      setCustom({ ...custom, status: e.target.value as OnlineStatusType })
                    }
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  >
                    <option value="online">● В сети</option>
                    <option value="ingame">● В Соларис-3</option>
                    <option value="dnd">● Не беспокоить</option>
                    <option value="offline">○ Не в сети</option>
                  </select>
                </label>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">
                    Дата регистрации («На сайте с ...»)
                  </span>
                  <input
                    type="text"
                    value={custom.registeredAt}
                    onChange={(e) => setCustom({ ...custom, registeredAt: e.target.value })}
                    placeholder="26 августа 2026 г."
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">
                    Доп. бейдж (например PREMIUM / SOLARIS PASS)
                  </span>
                  <input
                    type="text"
                    value={custom.secondaryBadge}
                    onChange={(e) => setCustom({ ...custom, secondaryBadge: e.target.value })}
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-bold text-gray-300 mb-1.5">
                    Часов в Соларис-3
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={custom.hoursSpent}
                    onChange={(e) =>
                      setCustom({ ...custom, hoursSpent: Number(e.target.value) })
                    }
                    className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Параметры уровня и XP</span>
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custom.autoLevel}
                      onChange={(e) => setCustom({ ...custom, autoLevel: e.target.checked })}
                    />
                    <span>Считать автоматически от ростера и карты</span>
                  </label>
                </div>

                {!custom.autoLevel && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="block">
                      <span className="block text-[11px] text-gray-400 mb-1">Уровень</span>
                      <input
                        type="number"
                        value={custom.level}
                        onChange={(e) =>
                          setCustom({ ...custom, level: Number(e.target.value) })
                        }
                        className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] text-gray-400 mb-1">Опыт (XP)</span>
                      <input
                        type="number"
                        value={custom.xp}
                        onChange={(e) => setCustom({ ...custom, xp: Number(e.target.value) })}
                        className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-[11px] text-gray-400 mb-1">Название Эры</span>
                      <input
                        type="text"
                        value={custom.era}
                        onChange={(e) => setCustom({ ...custom, era: e.target.value })}
                        className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </label>
                  </div>
                )}
              </div>

              <label className="block">
                <span className="block text-xs font-bold text-gray-300 mb-1.5">
                  Декоративный HEX-код под статусом
                </span>
                <input
                  type="text"
                  value={custom.hexSignature}
                  onChange={(e) => setCustom({ ...custom, hexSignature: e.target.value })}
                  className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2 text-xs font-mono text-gray-300"
                />
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-gray-300 mb-1.5">
                  Описание профиля (поддерживает несколько строк, ссылки и теги)
                </span>
                <textarea
                  rows={5}
                  value={custom.bio}
                  onChange={(e) => setCustom({ ...custom, bio: e.target.value })}
                  className="w-full bg-[#090a0f] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono leading-relaxed"
                />
              </label>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] font-extrabold text-xs sm:text-sm"
                >
                  Готово
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};