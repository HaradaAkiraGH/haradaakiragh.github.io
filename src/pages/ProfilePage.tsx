// Профиль игрока Stellar Wiki:
// Расширенный макет, анимированные SVG-рамки аватара, игровые титулы WuWa,
// фактическая дата регистрации, автоматический статус онлайна и расчёт уровня
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
  Trophy,
  Clock,
  Users,
  Compass,
  Sparkles,
  Check,
  X,
  Upload,
  Heart,
  LayoutGrid,
  Award,
  Calendar,
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { PlayerProfile } from '../data/types';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { MAP_MARKERS } from '../data/map';
import { IMAGES } from '../data/images';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { apiGetProfile, apiSaveProfile, API_ENABLED } from '../utils/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/* ==================== КАТАЛОГ КАСТОМНЫХ SVG-РАМОК АВАТАРКИ ==================== */
export interface AvatarFrameDef {
  id: string;
  name: string;
  rarity: 'Обычный' | 'Редкий' | 'Эпический' | 'Легендарный';
  previewBg: string;
  ringClass: string;
  glowStyle: string;
}

const AVATAR_FRAMES: AvatarFrameDef[] = [
  {
    id: 'solaris-astrolabe',
    name: 'Астролябия Соларис',
    rarity: 'Легендарный',
    previewBg: 'from-[#2b2114] via-[#14110d] to-[#0a0b10]',
    ringClass: 'border-2 border-[#f7ece6]/80 shadow-[0_0_28px_rgba(230,201,168,0.65)]',
    glowStyle: 'radial-gradient(circle, rgba(230,201,168,0.45) 0%, transparent 70%)',
  },
  {
    id: 'camellya-bloom',
    name: 'Алый Расцвет Камеллии',
    rarity: 'Легендарный',
    previewBg: 'from-rose-950/80 via-[#1a0b12] to-[#0a0b10]',
    ringClass: 'border-2 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.8)]',
    glowStyle: 'radial-gradient(circle, rgba(244,63,94,0.5) 0%, transparent 70%)',
  },
  {
    id: 'shorekeeper-butterfly',
    name: 'Хранительница Берега',
    rarity: 'Легендарный',
    previewBg: 'from-cyan-950/80 via-[#0b1528] to-[#0a0b10]',
    ringClass: 'border-2 border-cyan-300 shadow-[0_0_30px_rgba(56,189,248,0.8)]',
    glowStyle: 'radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)',
  },
  {
    id: 'jinhsi-dragon',
    name: 'Магистрат Цзиньчжоу',
    rarity: 'Легендарный',
    previewBg: 'from-amber-900/60 via-teal-950/50 to-[#0a0b10]',
    ringClass: 'border-2 border-amber-200 shadow-[0_0_28px_rgba(253,230,138,0.75)]',
    glowStyle: 'radial-gradient(circle, rgba(251,191,36,0.45) 0%, transparent 70%)',
  },
  {
    id: 'changli-phoenix',
    name: 'Перо Вечного Феникса',
    rarity: 'Эпический',
    previewBg: 'from-orange-950/80 via-red-950/40 to-[#0a0b10]',
    ringClass: 'border-2 border-orange-400 shadow-[0_0_26px_rgba(249,115,22,0.75)]',
    glowStyle: 'radial-gradient(circle, rgba(249,115,22,0.45) 0%, transparent 70%)',
  },
  {
    id: 'havoc-abyss',
    name: 'Сингулярность Хаоса',
    rarity: 'Эпический',
    previewBg: 'from-purple-950/80 via-fuchsia-950/40 to-[#0a0b10]',
    ringClass: 'border-2 border-fuchsia-400 shadow-[0_0_28px_rgba(192,132,252,0.8)]',
    glowStyle: 'radial-gradient(circle, rgba(168,85,247,0.5) 0%, transparent 70%)',
  },
  {
    id: 'glacio-frost',
    name: 'Хрустальный Иней',
    rarity: 'Эпический',
    previewBg: 'from-sky-950/80 via-indigo-950/40 to-[#0a0b10]',
    ringClass: 'border-2 border-sky-200 shadow-[0_0_25px_rgba(125,211,252,0.75)]',
    glowStyle: 'radial-gradient(circle, rgba(125,211,252,0.45) 0%, transparent 70%)',
  },
  {
    id: 'aero-tempest',
    name: 'Ветра Хуанлуна',
    rarity: 'Редкий',
    previewBg: 'from-emerald-950/80 via-teal-950/40 to-[#0a0b10]',
    ringClass: 'border-2 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.7)]',
    glowStyle: 'radial-gradient(circle, rgba(52,211,153,0.4) 0%, transparent 70%)',
  },
  {
    id: 'royal-gold',
    name: 'Золото Архонта',
    rarity: 'Редкий',
    previewBg: 'from-yellow-950/60 to-[#0a0b10]',
    ringClass: 'border-2 border-[#e6c9a8] shadow-[0_0_20px_rgba(202,160,125,0.65)]',
    glowStyle: 'radial-gradient(circle, rgba(202,160,125,0.35) 0%, transparent 70%)',
  },
  {
    id: 'none',
    name: 'Без рамки',
    rarity: 'Обычный',
    previewBg: 'from-zinc-900/40 to-[#0a0b10]',
    ringClass: 'border-2 border-white/20',
    glowStyle: 'none',
  },
];

/* ==================== ВЕКТОРНЫЙ ОРНАМЕНТ РАМОК (SVG + АНИМАЦИЯ) ==================== */
const FrameOrnamentSVG = ({ frameId }: { frameId: string }) => {
  switch (frameId) {
    case 'solaris-astrolabe':
      return (
        <div className="absolute -inset-3.5 pointer-events-none z-20">
          {/* Внешнее вращающееся кольцо астролябии */}
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full animate-[spin_24s_linear_infinite] drop-shadow-[0_0_8px_rgba(230,201,168,0.8)]"
          >
            <defs>
              <linearGradient id="astrolabeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff7ed" />
                <stop offset="50%" stopColor="#caa07d" />
                <stop offset="100%" stopColor="#78553a" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r="64"
              fill="none"
              stroke="url(#astrolabeGrad)"
              strokeWidth="1.5"
              strokeDasharray="10 6 2 6"
            />
            <circle
              cx="70"
              cy="70"
              r="59"
              fill="none"
              stroke="#f7ece6"
              strokeWidth="0.8"
              strokeOpacity="0.5"
              strokeDasharray="24 12"
            />
            {/* Четыре орбитальных узла */}
            <polygon points="70,2 73,8 70,14 67,8" fill="#fff7ed" />
            <polygon points="70,138 73,132 70,126 67,132" fill="#caa07d" />
            <polygon points="2,70 8,73 14,70 8,67" fill="#caa07d" />
            <polygon points="138,70 132,73 126,70 132,67" fill="#fff7ed" />
          </svg>
          {/* Статичная верхняя корона-звезда Соларис */}
          <svg
            viewBox="0 0 140 140"
            className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(255,247,237,0.95)]"
          >
            <path
              d="M70 0 L73 9 L82 9 L75 13 L77 21 L70 16 L63 21 L65 13 L58 9 L67 9 Z"
              fill="#fff7ed"
            />
          </svg>
        </div>
      );

    case 'camellya-bloom':
      return (
        <div className="absolute -inset-3.5 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full animate-[spin_32s_linear_infinite_reverse] drop-shadow-[0_0_10px_rgba(244,63,94,0.9)]"
          >
            <defs>
              <linearGradient id="camellyaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="50%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#881337" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="url(#camellyaGrad)"
              strokeWidth="2"
              strokeDasharray="16 8"
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 70 70)`}>
                <path
                  d="M70 4 C74 10, 74 14, 70 18 C66 14, 66 10, 70 4 Z"
                  fill="#fb7185"
                />
              </g>
            ))}
          </svg>
          {/* Крупный багровый цветок Камеллии в правом нижнем углу */}
          <svg
            viewBox="0 0 140 140"
            className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(225,29,72,0.95)]"
          >
            <g transform="translate(110, 110)">
              {[0, 60, 120, 180, 240, 300].map((d) => (
                <path
                  key={d}
                  transform={`rotate(${d})`}
                  d="M0 -14 C5 -8, 5 -2, 0 0 C-5 -2, -5 -8, 0 -14 Z"
                  fill="#e11d48"
                  stroke="#fecdd3"
                  strokeWidth="0.8"
                />
              ))}
              <circle cx="0" cy="0" r="3" fill="#fff1f2" />
            </g>
          </svg>
        </div>
      );

    case 'shorekeeper-butterfly':
      return (
        <div className="absolute -inset-3.5 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full animate-[spin_28s_linear_infinite] drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]"
          >
            <defs>
              <linearGradient id="shoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r="63"
              fill="none"
              stroke="url(#shoreGrad)"
              strokeWidth="1.8"
              strokeDasharray="6 6"
            />
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1"
              strokeDasharray="30 15"
            />
          </svg>
          {/* Эфирные бабочки Хранительницы Берега */}
          <svg
            viewBox="0 0 140 140"
            className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(56,189,248,1)]"
          >
            <g transform="translate(24, 22) rotate(-25)">
              <path
                d="M0 0 C-10 -10, -16 2, -4 6 C-12 10, -6 18, 0 8 C6 18, 12 10, 4 6 C16 2, 10 -10, 0 0 Z"
                fill="#7dd3fc"
                stroke="#e0f2fe"
                strokeWidth="0.8"
              />
            </g>
            <g transform="translate(118, 108) rotate(20) scale(0.85)">
              <path
                d="M0 0 C-10 -10, -16 2, -4 6 C-12 10, -6 18, 0 8 C6 18, 12 10, 4 6 C16 2, 10 -10, 0 0 Z"
                fill="#38bdf8"
                stroke="#e0f2fe"
                strokeWidth="0.8"
              />
            </g>
          </svg>
        </div>
      );

    case 'jinhsi-dragon':
      return (
        <div className="absolute -inset-3.5 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full drop-shadow-[0_0_10px_rgba(253,230,138,0.85)]"
          >
            <defs>
              <linearGradient id="jinhsiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#99f6e4" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="url(#jinhsiGrad)"
              strokeWidth="2.2"
            />
            {/* Рога и корона небесного дракона сверху */}
            <path
              d="M45 14 C36 2, 52 0, 60 10 L70 2 L80 10 C88 0, 104 2, 95 14"
              fill="none"
              stroke="#fef08a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="70" cy="132" r="4" fill="#99f6e4" stroke="#fef08a" strokeWidth="1.2" />
          </svg>
        </div>
      );

    case 'changli-phoenix':
      return (
        <div className="absolute -inset-3.5 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full drop-shadow-[0_0_10px_rgba(249,115,22,0.9)]"
          >
            <defs>
              <linearGradient id="phoenixGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="url(#phoenixGrad)"
              strokeWidth="2.2"
              strokeDasharray="28 6"
            />
            {/* Огненные перья по бокам */}
            <path
              d="M10 85 C2 65, 10 40, 24 24 C16 45, 16 65, 20 82 Z"
              fill="url(#phoenixGrad)"
            />
            <path
              d="M130 85 C138 65, 130 40, 116 24 C124 45, 124 65, 120 82 Z"
              fill="url(#phoenixGrad)"
            />
            <polygon points="70,1 74,10 70,7 66,10" fill="#fef08a" />
          </svg>
        </div>
      );

    case 'havoc-abyss':
      return (
        <div className="absolute -inset-3.5 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full animate-[spin_18s_linear_infinite] drop-shadow-[0_0_12px_rgba(192,132,252,0.95)]"
          >
            <defs>
              <linearGradient id="havocGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r="63"
              fill="none"
              stroke="url(#havocGrad)"
              strokeWidth="2"
              strokeDasharray="18 10 4 10"
            />
            {[0, 60, 120, 180, 240, 300].map((d) => (
              <polygon
                key={d}
                transform={`rotate(${d} 70 70)`}
                points="70,2 73,9 67,9"
                fill="#e879f9"
              />
            ))}
          </svg>
        </div>
      );

    case 'glacio-frost':
      return (
        <div className="absolute -inset-3.5 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full drop-shadow-[0_0_10px_rgba(125,211,252,0.9)]"
          >
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1.8"
              strokeDasharray="12 4"
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
              <polygon
                key={d}
                transform={`rotate(${d} 70 70)`}
                points="70,1 73,8 70,13 67,8"
                fill="#e0f2fe"
                stroke="#38bdf8"
                strokeWidth="0.6"
              />
            ))}
          </svg>
        </div>
      );

    case 'aero-tempest':
      return (
        <div className="absolute -inset-3 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full animate-[spin_20s_linear_infinite] drop-shadow-[0_0_10px_rgba(52,211,153,0.85)]"
          >
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="2"
              strokeDasharray="32 14"
            />
          </svg>
        </div>
      );

    case 'royal-gold':
      return (
        <div className="absolute -inset-2.5 pointer-events-none z-20">
          <svg
            viewBox="0 0 140 140"
            className="w-full h-full drop-shadow-[0_0_8px_rgba(230,201,168,0.75)]"
          >
            <circle cx="70" cy="70" r="63" fill="none" stroke="#e6c9a8" strokeWidth="1.4" />
            <polygon points="70,1 73,7 70,11 67,7" fill="#fff7ed" />
            <polygon points="70,139 73,133 70,129 67,133" fill="#fff7ed" />
            <polygon points="1,70 7,73 11,70 7,67" fill="#fff7ed" />
            <polygon points="139,70 133,73 129,70 133,67" fill="#fff7ed" />
          </svg>
        </div>
      );

    default:
      return null;
  }
};

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
    name: 'Багровый закат',
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
export interface ProfileCustomization {
  username: string;
  avatarUrl: string;
  bannerUrl: string;
  frameId: string;
  titleId: string;
  bio: string;
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
  frameId: 'solaris-astrolabe',
  titleId: 'sun-bringer',
  bio: `[ Apostle of the Epilogue and Eternity ] tg: haradaakiratt
[ Demon King of Salvation ] tt: teamconstellations
[ The Oldest Dream ] ds: haradaakira
[ Founder of Team Constellations ] twitch: haradaakira
[ King of a Kingless World ] youtube: @team.constellations`,
  hoursSpent: 367,
  favoriteCharIds: ['camellya', 'changli', 'shorekeeper', 'jinhsi'],
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
          className="absolute -inset-2.5 rounded-full blur-md opacity-80 pointer-events-none"
        />
      )}

      {/* Векторный SVG-орнамент поверх аватара */}
      <FrameOrnamentSVG frameId={frame.id} />

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
    description: 'Персональный профиль Ровера: кастомизация, титулы Wuthering Waves, уровень и достижения.',
  });

  const { user, token } = useAuth();
  const [profile, setProfile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [custom, setCustom] = useLocalStorage<ProfileCustomization>(
    'ww_profile_custom_v2',
    DEFAULT_CUSTOM,
  );
  const [collected] = useLocalStorage<string[]>('ww_map_collected', []);

  // Вкладки правой панели
  const [activeSection, setActiveSection] = useState<
    'main' | 'showcase' | 'favorites' | 'achievements'
  >('main');

  const [viewAsVisitor, setViewAsVisitor] = useState(false);

  const [appearanceModal, setAppearanceModal] = useState<
    null | 'frames' | 'titles' | 'banner' | 'avatar'
  >(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Реальный статус «В сети» / «Не в сети» (отслеживается автоматически, без ручного редактирования)
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const onOnline = () => setIsBrowserOnline(true);
    const onOffline = () => setIsBrowserOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Фактическая дата регистрации аккаунта (нередактируемая)
  const factualRegistrationDate = useMemo(() => {
    const anyUser = user as unknown as Record<string, unknown> | null;
    const serverDate = anyUser?.createdAt || anyUser?.created_at;
    if (typeof serverDate === 'string' && serverDate) {
      const parsed = new Date(serverDate);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    }
    const storageKey = `ww_factual_reg_date_${user?.id ?? 'local'}`;
    let savedIso = localStorage.getItem(storageKey);
    if (!savedIso) {
      savedIso = new Date().toISOString();
      localStorage.setItem(storageKey, savedIso);
    }
    const d = new Date(savedIso);
    if (isNaN(d.getTime())) return '20 октября 2026 г.';
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [user]);

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

  const mapPercent = useMemo(
    () => Math.round((collected.length / Math.max(1, MAP_MARKERS.length)) * 100),
    [collected],
  );

  // Достижения профиля
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
        desc: 'Собрать минимум 3 любимых резонатора на витрине',
        done: custom.favoriteCharIds.length >= 3,
        reward: 'Рамка «Золото Архонта»',
      },
      {
        id: 'a3',
        title: 'Коллекционер резонанса',
        desc: 'Добавить персонажей в ростер или витрину',
        done: profile.roster.length >= 5 || custom.favoriteCharIds.length >= 4,
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
        title: 'Ветеран Соларис-3',
        desc: 'Достичь 60+ Union Level в профиле',
        done: profile.unionLevel >= 60,
        reward: 'Рамка «Астролябия Соларис»',
      },
    ],
    [profile.roster.length, custom.favoriteCharIds.length, collected.length, profile.unionLevel],
  );

  // Автоматический расчёт уровня и XP от реальных показателей (без ручной накрутки)
  const computedLevelData = useMemo(() => {
    const doneAchievements = achievements.filter((a) => a.done).length;
    const totalXp =
      profile.unionLevel * 120 +
      collected.length * 150 +
      profile.roster.length * 350 +
      custom.favoriteCharIds.length * 180 +
      doneAchievements * 500 +
      custom.hoursSpent * 25;
    const lvl = Math.max(1, Math.floor(totalXp / 500));
    const rem = totalXp % 500;
    const pct = Math.max(4, Math.round((rem / 500) * 100));
    const era =
      lvl >= 50
        ? 'Астрал Соларис-3'
        : lvl >= 25
        ? 'Магма'
        : lvl >= 10
        ? 'Резонанс'
        : 'Пробуждение';
    return {
      level: lvl,
      shortLabel: lvl >= 1000 ? `${(lvl / 1000).toFixed(1)}K` : String(lvl),
      xpFormatted: totalXp.toLocaleString('ru-RU'),
      percent: pct,
      remainingXp: 500 - rem,
      nextLevel: lvl + 1,
      era,
    };
  }, [
    achievements,
    profile.unionLevel,
    collected.length,
    profile.roster.length,
    custom.favoriteCharIds.length,
    custom.hoursSpent,
  ]);

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

  const syncUidToServer = async (nextUid: string) => {
    if (!API_ENABLED || !token) return;
    try {
      await apiSaveProfile(token, {
        uid: nextUid,
        roster: profile.roster.map((r) => ({
          characterId: r.characterId,
          level: r.level,
          weapon: r.weapon,
          echoSet: r.echoSet,
          source: 'manual' as const,
        })),
      });
    } catch {
      // локальная копия уже сохранена
    }
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

  const bioLines = useMemo(
    () =>
      custom.bio
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    [custom.bio],
  );

  return (
    <div className="space-y-6 pb-10 w-full">
      {/* Расширяем контейнер страницы профиля до 1540px, чтобы убрать лишнюю пустоту по бокам */}
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

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

      {/* ==================== ВЕРХНИЙ БЛОК: ШАПКА + ПРОФИЛЬ ==================== */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0b0c12] shadow-[0_25px_70px_rgba(0,0,0,0.8)]">
        <div className="relative h-64 sm:h-72 md:h-80 w-full overflow-hidden">
          <img
            src={custom.bannerUrl || BANNER_PRESETS[0].url}
            alt="Шапка профиля"
            className="w-full h-full object-cover object-center scale-[1.01] transition-transform duration-700"
            draggable={false}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0b0c12] via-[#0b0c12]/60 to-black/20"
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

        <div className="relative z-10 -mt-28 sm:-mt-32 px-6 sm:px-10 pb-7">
          <div className="flex flex-col md:flex-row gap-7 items-start">
            {/* Аватар с новой векторной рамкой */}
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

            {/* Основная информация */}
            <div className="flex-1 min-w-0 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow">
                  {profile.nickname}
                </h1>
                <span className="text-sm font-medium text-gray-400">
                  @{custom.username.replace(/^@/, '')}
                </span>
              </div>

              {/* Ряд бейджей: Титул WuWa + Коллекция + UID (без SOLARIS PASS) */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-3">
                <button
                  type="button"
                  onClick={() => !viewAsVisitor && setAppearanceModal('titles')}
                  className={
                    viewAsVisitor ? 'cursor-default' : 'hover:scale-[1.03] transition-transform'
                  }
                  title={viewAsVisitor ? currentTitle.name : 'Нажми, чтобы сменить титул'}
                >
                  <TitleBadge title={currentTitle} />
                </button>

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

              {/* Фактический статус онлайна + фактическая дата регистрации */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 mt-3 text-xs">
                <span
                  className={`inline-flex items-center gap-2 font-semibold ${
                    isBrowserOnline ? 'text-purple-300' : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isBrowserOnline
                        ? 'bg-purple-400 shadow-[0_0_10px_#c084fc]'
                        : 'bg-gray-500'
                    }`}
                  />
                  <span>{isBrowserOnline ? 'В сети' : 'Не в сети'}</span>
                </span>

                <span className="text-gray-600">•</span>

                <span className="inline-flex items-center gap-1.5 text-gray-400">
                  <Calendar size={12} className="text-gray-500" />
                  <span>На сайте с {factualRegistrationDate}</span>
                </span>
              </div>

              {/* Описание профиля (без декоративного HEX-кода) */}
              {bioLines.length > 0 && (
                <div className="mt-4 space-y-1 text-xs sm:text-[13px] text-gray-200/95 font-medium leading-relaxed max-w-3xl">
                  {bioLines.map((line, idx) => (
                    <p key={idx} className="truncate sm:whitespace-normal">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,270px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          {/* КАРТОЧКА УРОВНЯ ПРОФИЛЯ (автоматический расчёт) */}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-5 relative overflow-hidden">
              <Clock size={16} className="absolute top-4 right-4 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {custom.hoursSpent} ч
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                В СОЛАРИС-3
              </p>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden">
              <Users size={16} className="absolute top-4 right-4 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {custom.favoriteCharIds.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                ИЗБРАННЫХ
              </p>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden">
              <Compass size={16} className="absolute top-4 right-4 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {mapPercent}%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                ЗАЧИСТКА КАРТЫ
              </p>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden">
              <Trophy size={16} className="absolute top-4 right-4 text-gray-500" />
              <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                {achievements.filter((a) => a.done).length}/{achievements.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
                ДОСТИЖЕНИЯ
              </p>
            </div>
          </div>

          {/* ДОПОЛНИТЕЛЬНЫЕ ВКЛАДКИ (Витрина / Любимое / Достижения) */}
          <AnimatePresence mode="wait">
            {activeSection !== 'main' && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {(activeSection === 'showcase' || activeSection === 'favorites') && (
                  <div className="glass-panel p-5 sm:p-6 space-y-5">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Любимые резонаторы ({custom.favoriteCharIds.length})
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Отметь сердечком любимых персонажей для своей витрины
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
                                <p className="text-[11px] text-accent-light truncate">
                                  {char.title}
                                </p>
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
                      <h2 className="text-xl font-bold text-white">Достижения профиля</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Выполняй активности на сайте, чтобы повышать уровень профиля
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
            )}
          </AnimatePresence>
        </div>

        {/* ПРАВАЯ КОЛОНКА НАВИГАЦИИ ПО ПРОФИЛЮ */}
        <div className="glass-panel p-2.5 space-y-1">
          {(
            [
              { id: 'main', label: 'Основное', icon: LayoutGrid },
              { id: 'showcase', label: 'Витрина', icon: Sparkles },
              { id: 'favorites', label: 'Любимое', icon: Heart },
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
                            className={`h-44 bg-gradient-to-b ${frame.previewBg} flex items-center justify-center p-4 relative`}
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

      {/* ==================== МОДАЛКА «НАСТРОЙКИ» (без фейковых дат, статусов и уровней) ==================== */}
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
                      syncUidToServer(e.target.value);
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

                <label className="block sm:col-span-2">
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