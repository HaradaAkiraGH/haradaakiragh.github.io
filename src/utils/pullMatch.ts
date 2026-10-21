// Связка круток из игры с каталогом вики:
// 1) Сопоставление персонажей по имени (EN/RU)
// 2) Сопоставление оружия с подстановкой иконок типов оружия (/icons/weapon_*.webp)
// 3) Определение стандартных 5★ для подсчёта 50/50
// 4) Кэширование созвездий (S0–S6) и сводки удачи для Профиля и Билдов
import { CHARACTERS } from '../data/characters';
import { WEAPON_ICONS, WEAPON_LABELS } from './constants';
import type { Character, WeaponType } from '../data/types';
import type { PullEntry } from './api';

export const normalizeName = (s: string): string =>
  s
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, ' ')
    .trim();

const CHAR_ALIASES: Record<string, string> = {
  shorekeeper: 'shorekeeper',
  'the shorekeeper': 'shorekeeper',
  'yangyang xuanling': 'yangyang-xuanling',
  xuanling: 'yangyang-xuanling',
  'luuk herssen': 'luuk-herssen',
  'xiangli yao': 'xiangli-yao',
  rover: 'rover-spectro',
};

const BY_NAME: Map<string, Character> = (() => {
  const m = new Map<string, Character>();
  for (const c of CHARACTERS) {
    m.set(normalizeName(c.name), c);
  }
  for (const [alias, id] of Object.entries(CHAR_ALIASES)) {
    const c = CHARACTERS.find((x) => x.id === id);
    if (c && !m.has(alias)) m.set(alias, c);
  }
  return m;
})();

export const matchCharacter = (pullName: string): Character | undefined =>
  BY_NAME.get(normalizeName(pullName ?? ''));

/* ---------- Стандартные 5★ персонажи (для расчёта 50/50 на ивентовом баннере) ---------- */
const STANDARD_FIVE_STAR_IDS = new Set([
  'verina',
  'calcharo',
  'encore',
  'jianxin',
  'lingyang',
]);

export const isStandardFiveStar = (pullName: string): boolean => {
  const c = matchCharacter(pullName);
  return c ? STANDARD_FIVE_STAR_IDS.has(c.id) : false;
};

/* ---------- Распознавание оружия из круток ---------- */
export interface MatchedWeapon {
  name: string;
  weaponType: WeaponType;
  label: string;
  icon: string;
}

const KNOWN_WEAPONS: Record<string, WeaponType> = {
  // 5★ и 4★ Мечи (Sword)
  'emerald of genesis': 'Sword',
  'blazing brilliance': 'Sword',
  'red spring': 'Sword',
  'unflickering valor': 'Sword',
  'bloodpacts pledge': 'Sword',
  'commando of conviction': 'Sword',
  'lunar cutter': 'Sword',
  'lumingloss': 'Sword',
  'endless collapse': 'Sword',
  'scale slasher': 'Sword',
  'overture': 'Sword',
  'somnoire anchor': 'Sword',
  'sword of night': 'Sword',
  'originite type ii': 'Sword',
  'guardian sword': 'Sword',
  'багровый цветок': 'Sword',
  'пламя вечности': 'Sword',
  'пожиратель света': 'Sword',
  'клинок ночи': 'Sword',
  'клинок феникса': 'Sword',

  // 5★ и 4★ Тяжёлые мечи (Broadblade)
  'lustrous razor': 'Broadblade',
  'verdant summit': 'Broadblade',
  'ages of harvest': 'Broadblade',
  'wildfire mark': 'Broadblade',
  'kumokiri': 'Broadblade',
  'autumntrace': 'Broadblade',
  'helios cleaver': 'Broadblade',
  'dauntless evernight': 'Broadblade',
  'discord': 'Broadblade',
  'broadblade of night': 'Broadblade',
  'broadblade of voyager': 'Broadblade',
  'waning redshift': 'Broadblade',
  'originite type i': 'Broadblade',
  'guardian broadblade': 'Broadblade',
  'пожинатель веков': 'Broadblade',
  'зелёная вершина': 'Broadblade',
  'падение истины': 'Broadblade',
  'широкий клинок стража': 'Broadblade',

  // 5★ и 4★ Пистолеты (Pistol)
  'static mist': 'Pistol',
  'the last dance': 'Pistol',
  'woodland aria': 'Pistol',
  'thunderbolt': 'Pistol',
  'undying flame': 'Pistol',
  'novaburst': 'Pistol',
  'cadenza': 'Pistol',
  'pistols of night': 'Pistol',
  'pistols of voyager': 'Pistol',
  'relativistic jet': 'Pistol',
  'romance in farewell': 'Pistol',
  'originite type iii': 'Pistol',
  'guardian pistols': 'Pistol',

  // 5★ и 4★ Перчатки (Gauntlets)
  'abyss surges': 'Gauntlets',
  'veritys handle': 'Gauntlets',
  'tragicomedy': 'Gauntlets',
  'blazing justice': 'Gauntlets',
  'stonard': 'Gauntlets',
  'hollow mirage': 'Gauntlets',
  'amity accord': 'Gauntlets',
  'marcato': 'Gauntlets',
  'gauntlets of night': 'Gauntlets',
  'gauntlets of voyager': 'Gauntlets',
  'celestial spiral': 'Gauntlets',
  'legend of drunken hero': 'Gauntlets',
  'originite type iv': 'Gauntlets',
  'guardian gauntlets': 'Gauntlets',

  // 5★ и 4★ Резонаторы (Rectifier)
  'cosmic ripples': 'Rectifier',
  'stringmaster': 'Rectifier',
  'rime draped sprouts': 'Rectifier',
  'stellar symphony': 'Rectifier',
  'luminous hymn': 'Rectifier',
  'whispers of sirens': 'Rectifier',
  'letranger': 'Rectifier',
  'augment': 'Rectifier',
  'jinzhou keeper': 'Rectifier',
  'variation': 'Rectifier',
  'comet flare': 'Rectifier',
  'rectifier of night': 'Rectifier',
  'rectifier of voyager': 'Rectifier',
  'fusion accretion': 'Rectifier',
  'oceans gift': 'Rectifier',
  'call of the abyss': 'Rectifier',
  'originite type v': 'Rectifier',
  'guardian rectifier': 'Rectifier',
  'повелитель струн': 'Rectifier',
  'астральный маяк': 'Rectifier',
  'угасающий сдвиг': 'Rectifier',
  'звёздная симфония': 'Rectifier',
  'побеги инея': 'Rectifier',
  'абсолютный пульс': 'Rectifier',
};

export const matchWeapon = (pullName: string): MatchedWeapon | undefined => {
  if (!pullName) return undefined;
  // Если это персонаж — значит не оружие
  if (matchCharacter(pullName)) return undefined;

  const norm = normalizeName(pullName);
  let wt: WeaponType | undefined = KNOWN_WEAPONS[norm];

  if (!wt) {
    // Эвристика по ключевым словам в названии оружия игры
    if (norm.includes('broadblade') || norm.includes('razor') || norm.includes('cleaver') || norm.includes('summit') || norm.includes('harvest')) {
      wt = 'Broadblade';
    } else if (norm.includes('pistol') || norm.includes('mist') || norm.includes('cadenza') || norm.includes('burst') || norm.includes('aria')) {
      wt = 'Pistol';
    } else if (norm.includes('gauntlet') || norm.includes('surges') || norm.includes('handle') || norm.includes('mirage') || norm.includes('marcato') || norm.includes('accord')) {
      wt = 'Gauntlets';
    } else if (norm.includes('rectifier') || norm.includes('ripples') || norm.includes('stringmaster') || norm.includes('symphony') || norm.includes('sprouts') || norm.includes('keeper') || norm.includes('variation') || norm.includes('hymn')) {
      wt = 'Rectifier';
    } else {
      // Любой предмет крутки, не являющийся персонажем, в WuWa — это оружие
      wt = 'Sword';
    }
  }

  return {
    name: pullName,
    weaponType: wt,
    label: WEAPON_LABELS[wt],
    icon: WEAPON_ICONS[wt],
  };
};

/* ---------- Кэш созвездий (S0–S6) и аналитики удачи для Профиля и Билдов ---------- */
const CHAINS_CACHE_KEY = 'ww_pulls_chains_v1';
const LUCK_CACHE_KEY = 'ww_pulls_luck_v1';

export interface LuckSummaryCache {
  totalPulls: number;
  fiveStarCount: number;
  avgPity: number;
  winRate5050: number | null;
  luckGrade: string;
  updatedAt: string;
}

export const savePullsCache = (pulls: PullEntry[]): void => {
  try {
    const counts: Record<string, number> = {};
    for (const p of pulls) {
      const ch = matchCharacter(p.name);
      if (ch) {
        counts[ch.id] = (counts[ch.id] ?? 0) + 1;
      }
    }
    // Переводим количество копий в индекс резонансной цепи: 1 копия = S0, 2 = S1 ... 7+ = S6
    const chains: Record<string, number> = {};
    for (const [id, count] of Object.entries(counts)) {
      if (count > 0) {
        chains[id] = Math.min(6, count - 1);
      }
    }
    localStorage.setItem(CHAINS_CACHE_KEY, JSON.stringify(chains));
  } catch {
    // игнорируем ошибки хранилища
  }
};

export const saveLuckSummaryCache = (summary: LuckSummaryCache): void => {
  try {
    localStorage.setItem(LUCK_CACHE_KEY, JSON.stringify(summary));
  } catch {
    // игнорируем ошибки хранилища
  }
};

export const getCachedResonanceChains = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(CHAINS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
};

export const getCharacterResonanceChain = (charId: string): number | null => {
  const map = getCachedResonanceChains();
  return typeof map[charId] === 'number' ? map[charId] : null;
};

export const getCachedLuckSummary = (): LuckSummaryCache | null => {
  try {
    const raw = localStorage.getItem(LUCK_CACHE_KEY);
    return raw ? (JSON.parse(raw) as LuckSummaryCache) : null;
  } catch {
    return null;
  }
};