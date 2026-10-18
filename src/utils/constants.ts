// Дизайн-токены, словари и темы персонажей
import { Character, ElementType, MapMarkerType, Tier, WeaponType } from '../data/types';

// Меню сайдбара
export const NAV_ITEMS = [
  { id: 'home', label: 'Главная', icon: 'home', path: '/home' },
  { id: 'characters', label: 'Персонажи', icon: 'users', path: '/characters' },
  { id: 'bestiary', label: 'Бестиарий', icon: 'bestiary', path: '/bestiary' },
  { id: 'pulls', label: 'Крутки', icon: 'dice', path: '/pulls' },
  { id: 'map', label: 'Карта', icon: 'map', path: '/map' },
  { id: 'meta', label: 'Мета', icon: 'trophy', path: '/meta' },
  { id: 'calculator', label: 'Калькулятор', icon: 'calculator', path: '/calculator' },
  { id: 'news', label: 'Новости', icon: 'news', path: '/news' },
  { id: 'guides', label: 'Гайды', icon: 'guides', path: '/guides' },
  { id: 'settings', label: 'Настройки', icon: 'settings', path: '/settings' },
];

// Мобильный таб-бар: 4 вкладки + «Ещё»
export const MOBILE_NAV_ITEMS = [
  { id: 'home', label: 'Дом', icon: 'home', path: '/home' },
  { id: 'characters', label: 'Персы', icon: 'users', path: '/characters' },
  { id: 'map', label: 'Карта', icon: 'map', path: '/map' },
  { id: 'meta', label: 'Мета', icon: 'trophy', path: '/meta' },
  { id: 'more', label: 'Ещё', icon: 'more', path: '#more' },
];

// Шторка «Ещё»
export const MORE_ITEMS = [
  { id: 'bestiary', label: 'Бестиарий', icon: 'bestiary', path: '/bestiary' },
  { id: 'pulls', label: 'Крутки', icon: 'dice', path: '/pulls' },
  { id: 'calculator', label: 'Калькулятор', icon: 'calculator', path: '/calculator' },
  { id: 'profile', label: 'Профиль', icon: 'user', path: '/profile' },
  { id: 'news', label: 'Новости', icon: 'news', path: '/news' },
  { id: 'guides', label: 'Гайды', icon: 'guides', path: '/guides' },
  { id: 'settings', label: 'Настройки', icon: 'settings', path: '/settings' },
];

// Элементы: официальные иконки игры из public/icons
export const ELEMENTS: Record<ElementType, { color: string; badge: string; icon: string; label: string }> = {
  Spectro: {
    color: 'text-amber-300',
    badge: 'border-amber-400/35 bg-amber-500/10 text-amber-200',
    icon: '/icons/element_spectro.webp',
    label: 'Спектро',
  },
  Havoc: {
    color: 'text-rose-400',
    badge: 'border-rose-400/35 bg-rose-500/10 text-rose-200',
    icon: '/icons/element_havoc.webp',
    label: 'Хаос',
  },
  Fusion: {
    color: 'text-orange-400',
    badge: 'border-orange-400/35 bg-orange-500/10 text-orange-200',
    icon: '/icons/element_fusion.webp',
    label: 'Фьюжн',
  },
  Glacio: {
    color: 'text-cyan-300',
    badge: 'border-cyan-400/35 bg-cyan-500/10 text-cyan-200',
    icon: '/icons/element_glacio.webp',
    label: 'Глацио',
  },
  Electro: {
    color: 'text-violet-400',
    badge: 'border-violet-400/35 bg-violet-500/10 text-violet-200',
    icon: '/icons/element_electro.webp',
    label: 'Электро',
  },
  Aero: {
    color: 'text-emerald-400',
    badge: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200',
    icon: '/icons/element_aero.webp',
    label: 'Аэро',
  },
};

// Оружие: официальные иконки игры из public/icons
export const WEAPON_ICONS: Record<WeaponType, string> = {
  Sword: '/icons/weapon_sword.webp',
  Broadblade: '/icons/weapon_broadblade.webp',
  Pistol: '/icons/weapon_pistols.webp',
  Gauntlets: '/icons/weapon_gauntlets.webp',
  Rectifier: '/icons/weapon_rectifier.webp',
};

export const ELEMENT_THEME: Record<ElementType, { gradient: string; glow: string; borderHover: string }> = {
  Spectro: {
    gradient: 'from-amber-950/95 via-amber-800/40 to-transparent',
    glow: 'group-hover:shadow-[0_14px_38px_-8px_rgba(251,191,36,0.32)]',
    borderHover: 'group-hover:border-amber-400/45',
  },
  Havoc: {
    gradient: 'from-rose-950/95 via-rose-800/45 to-transparent',
    glow: 'group-hover:shadow-[0_14px_38px_-8px_rgba(244,63,94,0.38)]',
    borderHover: 'group-hover:border-rose-400/45',
  },
  Fusion: {
    gradient: 'from-orange-950/95 via-orange-800/40 to-transparent',
    glow: 'group-hover:shadow-[0_14px_38px_-8px_rgba(249,115,22,0.35)]',
    borderHover: 'group-hover:border-orange-400/45',
  },
  Glacio: {
    gradient: 'from-cyan-950/95 via-cyan-800/40 to-transparent',
    glow: 'group-hover:shadow-[0_14px_38px_-8px_rgba(34,211,238,0.35)]',
    borderHover: 'group-hover:border-cyan-400/45',
  },
  Electro: {
    gradient: 'from-violet-950/95 via-violet-800/45 to-transparent',
    glow: 'group-hover:shadow-[0_14px_38px_-8px_rgba(167,139,250,0.38)]',
    borderHover: 'group-hover:border-violet-400/45',
  },
  Aero: {
    gradient: 'from-emerald-950/95 via-emerald-800/40 to-transparent',
    glow: 'group-hover:shadow-[0_14px_38px_-8px_rgba(52,211,153,0.35)]',
    borderHover: 'group-hover:border-emerald-400/45',
  },
};

export const WEAPON_LABELS: Record<WeaponType, string> = {
  Sword: 'Меч',
  Broadblade: 'Тяжёлый меч',
  Pistol: 'Пистолеты',
  Gauntlets: 'Перчатки',
  Rectifier: 'Резонатор',
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
  S: 'bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-amber-900/25 text-amber-200 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]',
  A: 'bg-gradient-to-br from-purple-500/25 via-fuchsia-500/15 to-purple-900/25 text-purple-200 border-purple-400/50 shadow-[0_0_18px_rgba(168,85,247,0.18)]',
  B: 'bg-gradient-to-br from-sky-500/25 via-cyan-500/15 to-sky-900/25 text-sky-200 border-sky-400/50',
  C: 'bg-gradient-to-br from-slate-500/20 to-slate-800/30 text-slate-300 border-slate-500/40',
  '-': 'bg-zinc-900/50 text-zinc-500 border-zinc-700/50',
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
  heroGradient: 'from-accent/60 via-[#2a2017]/80 to-[#110e0b]/95',
  heroFade: 'via-[#19140f]/60 to-[#110e0b]',
  spot: 'bg-accent/25',
  tabActive: 'bg-accent/20 text-ivory border-accent/45 shadow-glow-sm',
  skillCard: 'bg-accent/20 border-accent-light/30 hover:bg-accent/30',
  medallion: 'bg-ivory/15 border-ivory/30',
  skills: { resonance: 'Резонансный навык', liberation: 'Резонансный взрыв' },
};

// Автоматические темы по стихии для всех новых персонажей (чтобы каждый из 61 резонатора имел свой атмосферный цвет)
export const ELEMENT_HERO_THEMES: Record<ElementType, CharacterTheme> = {
  Spectro: {
    heroGradient: 'from-amber-500/55 via-amber-900/65 to-zinc-950/95',
    heroFade: 'via-amber-950/55 to-zinc-950',
    spot: 'bg-amber-500/25',
    tabActive: 'bg-amber-500/20 text-amber-100 border-amber-400/45 shadow-[0_0_16px_rgba(245,158,11,0.3)]',
    skillCard: 'bg-amber-500/20 border-amber-300/30 hover:bg-amber-500/30',
    medallion: 'bg-amber-200/20 border-amber-200/35',
    skills: { resonance: 'Спектральный резонанс', liberation: 'Сияющий приговор' },
  },
  Havoc: {
    heroGradient: 'from-rose-600/65 via-rose-950/75 to-zinc-950/95',
    heroFade: 'via-rose-950/60 to-zinc-950',
    spot: 'bg-rose-600/25',
    tabActive: 'bg-rose-500/20 text-rose-100 border-rose-400/45 shadow-[0_0_16px_rgba(244,63,94,0.35)]',
    skillCard: 'bg-rose-500/20 border-rose-300/30 hover:bg-rose-500/30',
    medallion: 'bg-rose-200/20 border-rose-200/35',
    skills: { resonance: 'Импульс Затмения', liberation: 'Разлом Хаоса' },
  },
  Fusion: {
    heroGradient: 'from-orange-600/65 via-red-950/75 to-zinc-950/95',
    heroFade: 'via-red-950/60 to-zinc-950',
    spot: 'bg-orange-600/25',
    tabActive: 'bg-orange-500/20 text-orange-100 border-orange-400/45 shadow-[0_0_16px_rgba(249,115,22,0.35)]',
    skillCard: 'bg-orange-500/20 border-orange-300/30 hover:bg-orange-500/30',
    medallion: 'bg-orange-200/20 border-orange-200/35',
    skills: { resonance: 'Пирокластический натиск', liberation: 'Сердце сверхновой' },
  },
  Glacio: {
    heroGradient: 'from-cyan-500/60 via-sky-950/75 to-zinc-950/95',
    heroFade: 'via-sky-950/60 to-zinc-950',
    spot: 'bg-cyan-500/25',
    tabActive: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/45 shadow-[0_0_16px_rgba(34,211,238,0.35)]',
    skillCard: 'bg-cyan-500/20 border-cyan-300/30 hover:bg-cyan-500/30',
    medallion: 'bg-cyan-200/20 border-cyan-200/35',
    skills: { resonance: 'Криогенный узор', liberation: 'Абсолютный ноль' },
  },
  Electro: {
    heroGradient: 'from-violet-600/65 via-indigo-950/75 to-zinc-950/95',
    heroFade: 'via-indigo-950/60 to-zinc-950',
    spot: 'bg-violet-600/25',
    tabActive: 'bg-violet-500/20 text-violet-100 border-violet-400/45 shadow-[0_0_16px_rgba(139,92,246,0.35)]',
    skillCard: 'bg-violet-500/20 border-violet-300/30 hover:bg-violet-500/30',
    medallion: 'bg-violet-200/20 border-violet-200/35',
    skills: { resonance: 'Грозовой контур', liberation: 'Высоковольтный шторм' },
  },
  Aero: {
    heroGradient: 'from-emerald-500/60 via-teal-950/75 to-zinc-950/95',
    heroFade: 'via-teal-950/60 to-zinc-950',
    spot: 'bg-emerald-500/25',
    tabActive: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/45 shadow-[0_0_16px_rgba(16,185,129,0.35)]',
    skillCard: 'bg-emerald-500/20 border-emerald-300/30 hover:bg-emerald-500/30',
    medallion: 'bg-emerald-200/20 border-emerald-200/35',
    skills: { resonance: 'Штормовой росчерк', liberation: 'Дыхание стратосферы' },
  },
};

export const CHARACTER_THEME: Record<string, CharacterTheme> = {
  camellya: {
    heroGradient: 'from-rose-500/70 via-rose-900/70 to-zinc-950/95',
    heroFade: 'via-rose-950/55 to-zinc-950',
    spot: 'bg-rose-600/25',
    tabActive: 'bg-rose-500/20 text-rose-100 border-rose-400/45 shadow-[0_0_16px_rgba(244,63,94,0.35)]',
    skillCard: 'bg-rose-500/25 border-rose-200/30 hover:bg-rose-500/35',
    medallion: 'bg-rose-100/20 border-rose-100/30',
    skills: { resonance: 'Вальс цветов и погибели', liberation: 'Пышный расцвет' },
  },
  phoebe: {
    heroGradient: 'from-sky-500/60 via-sky-900/70 to-zinc-950/95',
    heroFade: 'via-sky-950/55 to-zinc-950',
    spot: 'bg-sky-500/25',
    tabActive: 'bg-sky-500/20 text-sky-100 border-sky-400/45 shadow-[0_0_16px_rgba(14,165,233,0.35)]',
    skillCard: 'bg-sky-500/25 border-sky-200/30 hover:bg-sky-500/35',
    medallion: 'bg-sky-100/20 border-sky-100/30',
    skills: { resonance: 'Гимн рассвета', liberation: 'Сияющий покров' },
  },
  jinhsi: {
    heroGradient: 'from-cyan-500/60 via-cyan-900/70 to-zinc-950/95',
    heroFade: 'via-cyan-950/55 to-zinc-950',
    spot: 'bg-cyan-500/25',
    tabActive: 'bg-cyan-500/20 text-cyan-100 border-cyan-400/45 shadow-[0_0_16px_rgba(34,211,238,0.35)]',
    skillCard: 'bg-cyan-500/25 border-cyan-200/30 hover:bg-cyan-500/35',
    medallion: 'bg-cyan-100/20 border-cyan-100/30',
    skills: { resonance: 'Блеск вечности', liberation: 'Великое царство' },
  },
  changli: {
    heroGradient: 'from-orange-500/70 via-orange-900/70 to-zinc-950/95',
    heroFade: 'via-orange-950/55 to-zinc-950',
    spot: 'bg-orange-600/25',
    tabActive: 'bg-orange-500/20 text-orange-100 border-orange-400/45 shadow-[0_0_16px_rgba(249,115,22,0.35)]',
    skillCard: 'bg-orange-500/25 border-orange-200/30 hover:bg-orange-500/35',
    medallion: 'bg-orange-100/20 border-orange-100/30',
    skills: { resonance: 'Пылающее перо', liberation: 'Танец феникса' },
  },
  yinlin: {
    heroGradient: 'from-violet-500/70 via-violet-900/70 to-zinc-950/95',
    heroFade: 'via-violet-950/55 to-zinc-950',
    spot: 'bg-violet-600/25',
    tabActive: 'bg-violet-500/20 text-violet-100 border-violet-400/45 shadow-[0_0_16px_rgba(139,92,246,0.35)]',
    skillCard: 'bg-violet-500/25 border-violet-200/30 hover:bg-violet-500/35',
    medallion: 'bg-violet-100/20 border-violet-100/30',
    skills: { resonance: 'Громовой дозор', liberation: 'Казнящая молния' },
  },
  encore: {
    heroGradient: 'from-red-500/70 via-red-900/70 to-zinc-950/95',
    heroFade: 'via-red-950/55 to-zinc-950',
    spot: 'bg-red-600/25',
    tabActive: 'bg-red-500/20 text-red-100 border-red-400/45 shadow-[0_0_16px_rgba(239,68,68,0.35)]',
    skillCard: 'bg-red-500/25 border-red-200/30 hover:bg-red-500/35',
    medallion: 'bg-red-100/20 border-red-100/30',
    skills: { resonance: 'Овация огня', liberation: 'Финальный аккорд' },
  },
  verina: {
    heroGradient: 'from-emerald-500/60 via-emerald-900/70 to-zinc-950/95',
    heroFade: 'via-emerald-950/55 to-zinc-950',
    spot: 'bg-emerald-500/25',
    tabActive: 'bg-emerald-500/20 text-emerald-100 border-emerald-400/45 shadow-[0_0_16px_rgba(16,185,129,0.35)]',
    skillCard: 'bg-emerald-500/25 border-emerald-200/30 hover:bg-emerald-500/35',
    medallion: 'bg-emerald-100/20 border-emerald-100/30',
    skills: { resonance: 'Весенний побег', liberation: 'Цветущий покров' },
  },
  calcharo: {
    heroGradient: 'from-indigo-500/70 via-indigo-900/70 to-zinc-950/95',
    heroFade: 'via-indigo-950/55 to-zinc-950',
    spot: 'bg-indigo-600/25',
    tabActive: 'bg-indigo-500/20 text-indigo-100 border-indigo-400/45 shadow-[0_0_16px_rgba(99,102,241,0.35)]',
    skillCard: 'bg-indigo-500/25 border-indigo-200/30 hover:bg-indigo-500/35',
    medallion: 'bg-indigo-100/20 border-indigo-100/30',
    skills: { resonance: 'Приговор тени', liberation: 'Экзекуция' },
  },
  jiyan: {
    heroGradient: 'from-teal-500/60 via-teal-900/70 to-zinc-950/95',
    heroFade: 'via-teal-950/55 to-zinc-950',
    spot: 'bg-teal-500/25',
    tabActive: 'bg-teal-500/20 text-teal-100 border-teal-400/45 shadow-[0_0_16px_rgba(20,184,166,0.35)]',
    skillCard: 'bg-teal-500/25 border-teal-200/30 hover:bg-teal-500/35',
    medallion: 'bg-teal-100/20 border-teal-100/30',
    skills: { resonance: 'Вихрь дракона', liberation: 'Гнев небес' },
  },
  zhezhi: {
    heroGradient: 'from-blue-500/60 via-blue-900/70 to-zinc-950/95',
    heroFade: 'via-blue-950/55 to-zinc-950',
    spot: 'bg-blue-500/25',
    tabActive: 'bg-blue-500/20 text-blue-100 border-blue-400/45 shadow-[0_0_16px_rgba(59,130,246,0.35)]',
    skillCard: 'bg-blue-500/25 border-blue-200/30 hover:bg-blue-500/35',
    medallion: 'bg-blue-100/20 border-blue-100/30',
    skills: { resonance: 'Морозная кисть', liberation: 'Полотно зимы' },
  },
};

// Возвращает персональную тему или стихийную тему для любого из 61 персонажа
export const getCharacterTheme = (char: Character): CharacterTheme =>
  CHARACTER_THEME[char.id] ?? ELEMENT_HERO_THEMES[char.element] ?? DEFAULT_THEME;