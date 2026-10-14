// Дизайн-токены, словари и темы персонажей
import { ElementType, MapMarkerType, Tier, WeaponType } from '../data/types';

// Меню сайдбара
export const NAV_ITEMS = [
  { id: 'home', label: 'Главная', icon: 'home', path: '/home' },
  { id: 'pulls', label: 'Крутки', path: '/pulls', icon: 'trophy' },
  { id: 'characters', label: 'Персонажи', icon: 'users', path: '/characters' },
  { id: 'map', label: 'Карта', icon: 'map', path: '/map' },
  { id: 'meta', label: 'Мета', icon: 'trophy', path: '/meta' },
  { id: 'calculator', label: 'Калькулятор', icon: 'calculator', path: '/calculator' },
  { id: 'news', label: 'Новости', icon: 'news', path: '/news' },
  { id: 'guides', label: 'Гайды', icon: 'guides', path: '/guides' },
  { id: 'settings', label: 'Настройки', icon: 'settings', path: '/settings' },
];

// Мобильный таб-бар
export const MOBILE_NAV_ITEMS = [
  { id: 'home', label: 'Дом', icon: 'home', path: '/home' },
  { id: 'characters', label: 'Персы', icon: 'users', path: '/characters' },
  { id: 'map', label: 'Карта', icon: 'map', path: '/map' },
  { id: 'meta', label: 'Мета', icon: 'trophy', path: '/meta' },
  { id: 'more', label: 'Ещё', icon: 'more', path: '#more' },
];

// Шторка «Ещё»
export const MORE_ITEMS = [
  { id: 'calculator', label: 'Калькулятор', icon: 'calculator', path: '/calculator' },
  { id: 'profile', label: 'Профиль', icon: 'user', path: '/profile' },
  { id: 'news', label: 'Новости', icon: 'news', path: '/news' },
  { id: 'guides', label: 'Гайды', icon: 'guides', path: '/guides' },
  { id: 'settings', label: 'Настройки', icon: 'settings', path: '/settings' },
];

// Элементы: официальные иконки игры из public/icons
export const ELEMENTS: Record<ElementType, { color: string; icon: string; label: string }> = {
  Spectro: { color: 'text-yellow-300', icon: '/icons/element_spectro.webp', label: 'Спектро' },
  Havoc:   { color: 'text-fuchsia-400', icon: '/icons/element_havoc.webp', label: 'Хаос' },
  Fusion:  { color: 'text-red-400', icon: '/icons/element_fusion.webp', label: 'Фьюжн' },
  Glacio:  { color: 'text-cyan-300', icon: '/icons/element_glacio.webp', label: 'Глацио' },
  Electro: { color: 'text-purple-400', icon: '/icons/element_electro.webp', label: 'Электро' },
  Aero:    { color: 'text-green-400', icon: '/icons/element_aero.webp', label: 'Аэро' },
};

// Оружие: официальные иконки игры из public/icons
export const WEAPON_ICONS: Record<WeaponType, string> = {
  Sword: '/icons/weapon_sword.webp',
  Broadblade: '/icons/weapon_broadblade.webp',
  Pistol: '/icons/weapon_pistols.webp',
  Gauntlets: '/icons/weapon_gauntlets.webp',
  Rectifier: '/icons/weapon_rectifier.webp',
};

export const ELEMENT_THEME: Record<ElementType, { gradient: string; glow: string }> = {
  Spectro: { gradient: 'from-amber-950/95 via-amber-800/40 to-transparent', glow: 'group-hover:shadow-[0_0_35px_rgba(251,191,36,0.25)]' },
  Havoc:   { gradient: 'from-rose-950/95 via-rose-800/45 to-transparent',  glow: 'group-hover:shadow-[0_0_35px_rgba(244,63,94,0.35)]' },
  Fusion:  { gradient: 'from-orange-950/95 via-orange-800/40 to-transparent', glow: 'group-hover:shadow-[0_0_35px_rgba(249,115,22,0.30)]' },
  Glacio:  { gradient: 'from-cyan-950/95 via-cyan-800/40 to-transparent',  glow: 'group-hover:shadow-[0_0_35px_rgba(34,211,238,0.30)]' },
  Electro: { gradient: 'from-violet-950/95 via-violet-800/45 to-transparent', glow: 'group-hover:shadow-[0_0_35px_rgba(167,139,250,0.35)]' },
  Aero:    { gradient: 'from-emerald-950/95 via-emerald-800/40 to-transparent', glow: 'group-hover:shadow-[0_0_35px_rgba(52,211,153,0.30)]' },
};

export const WEAPON_LABELS: Record<WeaponType, string> = {
  Sword: 'Меч', Broadblade: 'Тяжёлый меч', Pistol: 'Пистолет', Gauntlets: 'Перчатки', Rectifier: 'Резонатор',
};

export const MARKER_TYPES: Record<MapMarkerType, { label: string; color: string; icon: string }> = {
  chest:     { label: 'Сундуки',       color: '#fbbf24', icon: '/icons/z3.png'  },
  puzzle:    { label: 'Головоломки',   color: '#a855f7', icon: '/icons/z12.png' },
  resource:  { label: 'Ресурсы',       color: '#22c55e', icon: '/icons/z6.png'  },
  echo:      { label: 'Эхо и элиты',   color: '#3b82f6', icon: '/icons/z8.png'  },
  boss:      { label: 'Боссы',         color: '#ef4444', icon: '/icons/z9.png'  },
  viewpoint: { label: 'Точки обзора',  color: '#06b6d4', icon: '/icons/z4.png'  },
};

export const TIER_STYLES: Record<Tier, string> = {
  S: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
  A: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
  B: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  C: 'bg-gray-500/15 text-gray-300 border-gray-500/40',
};

export interface CharacterTheme {
  heroGradient: string;
  heroFade: string;
  spot: string;
  tabActive: string;
  skillCard: string;
  medallion: string;
  skills: { resonance: string; liberation: string };
}

export const DEFAULT_THEME: CharacterTheme = {
  heroGradient: 'from-accent/60 via-[#3a2d20]/60 to-[#1a1410]/80',
  heroFade: 'via-[#1a1410]/40 to-[#1a1410]',
  spot: 'bg-accent/25',
  tabActive: 'bg-accent/20 text-ivory border-accent/40 shadow-glow-sm',
  skillCard: 'bg-accent/25 border-accent-light/30 hover:bg-accent/35',
  medallion: 'bg-ivory/20 border-ivory/30',
  skills: { resonance: 'Резонансный навык', liberation: 'Резонансный взрыв' },
};

export const CHARACTER_THEME: Record<string, CharacterTheme> = {
  camellya: {
    heroGradient: 'from-rose-500/70 via-rose-800/60 to-rose-950/80',
    heroFade: 'via-rose-950/40 to-rose-950',
    spot: 'bg-rose-600/25',
    tabActive: 'bg-rose-500/20 text-rose-100 border-rose-400/40 shadow-[0_0_14px_rgba(244,63,94,0.35)]',
    skillCard: 'bg-rose-500/25 border-rose-200/30 hover:bg-rose-500/35',
    medallion: 'bg-rose-100/20 border-rose-100/30',
    skills: { resonance: 'Вальс цветов и погибели', liberation: 'Пышный расцвет' },
  },
  phoebe: {
    heroGradient: 'from-sky-500/60 via-sky-800/60 to-sky-950/80',
    heroFade: 'via-sky-950/40 to-sky-950',
    spot: 'bg-sky-500/25',
    tabActive: 'bg-sky-500/20 text-sky-100 border-sky-400/40 shadow-[0_0_14px_rgba(14,165,233,0.35)]',
    skillCard: 'bg-sky-500/25 border-sky-200/30 hover:bg-sky-500/35',
    medallion: 'bg-sky-100/20 border-sky-100/30',
    skills: { resonance: 'Гимн рассвета', liberation: 'Сияющий покров' },
  },
  jinhsi: {
    heroGradient: 'from-cyan-500/60 via-cyan-800/60 to-cyan-950/80',
    heroFade: 'via-cyan-950/40 to-cyan-950',
    spot: 'bg-cyan-500/25',
    tabActive: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/40 shadow-[0_0_14px_rgba(34,211,238,0.35)]',
    skillCard: 'bg-cyan-500/25 border-cyan-200/30 hover:bg-cyan-500/35',
    medallion: 'bg-cyan-100/20 border-cyan-100/30',
    skills: { resonance: 'Блеск вечности', liberation: 'Великое царство' },
  },
  changli: {
    heroGradient: 'from-orange-500/70 via-orange-800/60 to-orange-950/80',
    heroFade: 'via-orange-950/40 to-orange-950',
    spot: 'bg-orange-600/25',
    tabActive: 'bg-orange-500/20 text-orange-100 border-orange-400/40 shadow-[0_0_14px_rgba(249,115,22,0.35)]',
    skillCard: 'bg-orange-500/25 border-orange-200/30 hover:bg-orange-500/35',
    medallion: 'bg-orange-100/20 border-orange-100/30',
    skills: { resonance: 'Пылающее перо', liberation: 'Танец феникса' },
  },
  yinlin: {
    heroGradient: 'from-violet-500/70 via-violet-800/60 to-violet-950/80',
    heroFade: 'via-violet-950/40 to-violet-950',
    spot: 'bg-violet-600/25',
    tabActive: 'bg-violet-500/20 text-violet-100 border-violet-400/40 shadow-[0_0_14px_rgba(139,92,246,0.35)]',
    skillCard: 'bg-violet-500/25 border-violet-200/30 hover:bg-violet-500/35',
    medallion: 'bg-violet-100/20 border-violet-100/30',
    skills: { resonance: 'Громовой дозор', liberation: 'Казнящая молния' },
  },
  encore: {
    heroGradient: 'from-red-500/70 via-red-800/60 to-red-950/80',
    heroFade: 'via-red-950/40 to-red-950',
    spot: 'bg-red-600/25',
    tabActive: 'bg-red-500/20 text-red-100 border-red-400/40 shadow-[0_0_14px_rgba(239,68,68,0.35)]',
    skillCard: 'bg-red-500/25 border-red-200/30 hover:bg-red-500/35',
    medallion: 'bg-red-100/20 border-red-100/30',
    skills: { resonance: 'Овация огня', liberation: 'Финальный аккорд' },
  },
  verina: {
    heroGradient: 'from-emerald-500/60 via-emerald-800/60 to-emerald-950/80',
    heroFade: 'via-emerald-950/40 to-emerald-950',
    spot: 'bg-emerald-500/25',
    tabActive: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 shadow-[0_0_14px_rgba(16,185,129,0.35)]',
    skillCard: 'bg-emerald-500/25 border-emerald-200/30 hover:bg-emerald-500/35',
    medallion: 'bg-emerald-100/20 border-emerald-100/30',
    skills: { resonance: 'Весенний побег', liberation: 'Цветущий покров' },
  },
  calcharo: {
    heroGradient: 'from-indigo-500/70 via-indigo-800/60 to-indigo-950/80',
    heroFade: 'via-indigo-950/40 to-indigo-950',
    spot: 'bg-indigo-600/25',
    tabActive: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/40 shadow-[0_0_14px_rgba(99,102,241,0.35)]',
    skillCard: 'bg-indigo-500/25 border-indigo-200/30 hover:bg-indigo-500/35',
    medallion: 'bg-indigo-100/20 border-indigo-100/30',
    skills: { resonance: 'Приговор тени', liberation: 'Экзекуция' },
  },
  jiyan: {
    heroGradient: 'from-teal-500/60 via-teal-800/60 to-teal-950/80',
    heroFade: 'via-teal-950/40 to-teal-950',
    spot: 'bg-teal-500/25',
    tabActive: 'bg-teal-500/20 text-teal-100 border-teal-400/40 shadow-[0_0_14px_rgba(20,184,166,0.35)]',
    skillCard: 'bg-teal-500/25 border-teal-200/30 hover:bg-teal-500/35',
    medallion: 'bg-teal-100/20 border-teal-100/30',
    skills: { resonance: 'Вихрь дракона', liberation: 'Гнев небес' },
  },
  zhezhi: {
    heroGradient: 'from-blue-500/60 via-blue-800/60 to-blue-950/80',
    heroFade: 'via-blue-950/40 to-blue-950',
    spot: 'bg-blue-500/25',
    tabActive: 'bg-blue-500/20 text-blue-100 border-blue-400/40 shadow-[0_0_14px_rgba(59,130,246,0.35)]',
    skillCard: 'bg-blue-500/25 border-blue-200/30 hover:bg-blue-500/35',
    medallion: 'bg-blue-100/20 border-blue-100/30',
    skills: { resonance: 'Морозная кисть', liberation: 'Полотно зимы' },
  },
};