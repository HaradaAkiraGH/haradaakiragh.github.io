// Движок динамического контента Админки:
// 1) Хранение 3 форматов изображений персонажа (card, icon, splash) + их координат смещения (X%, Y%, Scale%)
// 2) Синхронизация тиров T0–T3 и тегов механик с глобальной таблицей PRYDWEN_CHAR_META
// 3) Наложение всех правок (лор, оружие с %, эхо со схемой костов, статы, команды с приоритетом и метками)
import { CHARACTERS } from '../data/characters';
import { IMAGES } from '../data/images';
import { PRYDWEN_CHAR_META, PrydwenTier, PrydwenRoleCol } from '../data/prydwenMeta';
import type { Character } from '../data/types';
import { apiGetCharacterOverrides, API_ENABLED } from './api';

const CUSTOM_CHARS_KEY = 'ww_admin_custom_chars_v1';
const CHAR_OVERRIDES_KEY = 'ww_admin_char_overrides_v1';
const CUSTOM_IMAGES_KEY = 'ww_admin_custom_images_v1';
const CUSTOM_ICONS_KEY = 'ww_admin_custom_icons_v1';
const CUSTOM_SPLASHES_KEY = 'ww_admin_custom_splashes_v1';
const CUSTOM_ART_POS_KEY = 'ww_admin_custom_art_pos_v1';
const CUSTOM_NEWS_KEY = 'ww_admin_news_v1';
const CUSTOM_GUIDES_KEY = 'ww_admin_guides_v1';

const ORIGINAL_CHARS_SNAPSHOT: Map<string, Character> = new Map(
  CHARACTERS.map((c) => [c.id, JSON.parse(JSON.stringify(c)) as Character]),
);
const ORIGINAL_IMAGES_SNAPSHOT: Record<string, string> = { ...IMAGES };

export const CHARACTER_ICONS: Record<string, string> = {};
export const CHARACTER_SPLASHES: Record<string, string> = {};

export interface ArtPosition {
  x: number; // 0..100 (%)
  y: number; // 0..100 (%)
  scale: number; // 80..200 (%)
}

export interface CharacterArtTransforms {
  card: ArtPosition;
  icon: ArtPosition;
  splash: ArtPosition;
}

export const DEFAULT_ART_TRANSFORMS: CharacterArtTransforms = {
  card: { x: 50, y: 15, scale: 100 },
  icon: { x: 50, y: 15, scale: 100 },
  splash: { x: 50, y: 25, scale: 100 },
};

export const CHARACTER_ART_TRANSFORMS: Record<string, CharacterArtTransforms> = {};

export interface CharacterArtBundle {
  card: string;
  icon: string;
  splash: string;
  transforms: CharacterArtTransforms;
}

export interface AdminNewsItem {
  id: string;
  title: string;
  category: 'Обновление' | 'Ивент' | 'Баннер' | 'Система';
  date: string;
  summary: string;
  image?: string;
}

export interface AdminGuideItem {
  id: string;
  title: string;
  category: 'Новичкам' | 'Боевая механика' | 'Эхо и Билды' | 'Эндгейм';
  readTime: string;
  author: string;
  content: string;
}

/* ---------- Чтение словарей из localStorage ---------- */
export const getCustomImagesMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(CUSTOM_IMAGES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

export const getCustomIconsMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(CUSTOM_ICONS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

export const getCustomSplashesMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(CUSTOM_SPLASHES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

export const getCustomArtPosMap = (): Record<string, CharacterArtTransforms> => {
  try {
    const raw = localStorage.getItem(CUSTOM_ART_POS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CharacterArtTransforms>) : {};
  } catch {
    return {};
  }
};

/* ---------- Получение всех 3 картинок и их координат смещения ---------- */
export const getCharacterArtUrls = (charId: string): CharacterArtBundle => {
  const cards = getCustomImagesMap();
  const icons = getCustomIconsMap();
  const splashes = getCustomSplashesMap();
  const posMap = getCustomArtPosMap();

  const cardUrl = cards[charId] || IMAGES[charId] || '';
  const iconUrl = icons[charId] || CHARACTER_ICONS[charId] || '';
  const splashUrl = splashes[charId] || CHARACTER_SPLASHES[charId] || '';

  const savedTransforms = posMap[charId] || CHARACTER_ART_TRANSFORMS[charId];
  const transforms: CharacterArtTransforms = {
    card: { ...DEFAULT_ART_TRANSFORMS.card, ...(savedTransforms?.card ?? {}) },
    icon: { ...DEFAULT_ART_TRANSFORMS.icon, ...(savedTransforms?.icon ?? {}) },
    splash: { ...DEFAULT_ART_TRANSFORMS.splash, ...(savedTransforms?.splash ?? {}) },
  };

  return {
    card: cardUrl,
    icon: iconUrl,
    splash: splashUrl,
    transforms,
  };
};

/* ---------- Сохранение всех 3 форматов картинок и их смещения ---------- */
export const saveCharacterArtBundle = (
  charId: string,
  bundle: {
    card?: string;
    icon?: string;
    splash?: string;
    transforms?: CharacterArtTransforms;
  },
): void => {
  try {
    if (bundle.card !== undefined) {
      const cards = getCustomImagesMap();
      if (bundle.card.trim()) {
        cards[charId] = bundle.card.trim();
        IMAGES[charId] = bundle.card.trim();
      } else {
        delete cards[charId];
        if (ORIGINAL_IMAGES_SNAPSHOT[charId]) {
          IMAGES[charId] = ORIGINAL_IMAGES_SNAPSHOT[charId];
        } else {
          delete IMAGES[charId];
        }
      }
      localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(cards));
    }

    if (bundle.icon !== undefined) {
      const icons = getCustomIconsMap();
      if (bundle.icon.trim()) {
        icons[charId] = bundle.icon.trim();
        CHARACTER_ICONS[charId] = bundle.icon.trim();
      } else {
        delete icons[charId];
        delete CHARACTER_ICONS[charId];
      }
      localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(icons));
    }

    if (bundle.splash !== undefined) {
      const splashes = getCustomSplashesMap();
      if (bundle.splash.trim()) {
        splashes[charId] = bundle.splash.trim();
        CHARACTER_SPLASHES[charId] = bundle.splash.trim();
      } else {
        delete splashes[charId];
        delete CHARACTER_SPLASHES[charId];
      }
      localStorage.setItem(CUSTOM_SPLASHES_KEY, JSON.stringify(splashes));
    }

    if (bundle.transforms !== undefined) {
      const posMap = getCustomArtPosMap();
      posMap[charId] = bundle.transforms;
      CHARACTER_ART_TRANSFORMS[charId] = bundle.transforms;
      localStorage.setItem(CUSTOM_ART_POS_KEY, JSON.stringify(posMap));
    }
  } catch {
    // игнорируем переполнение localStorage
  }
};

export const saveCustomCharacterImage = (charId: string, imageUrl: string): void => {
  saveCharacterArtBundle(charId, { card: imageUrl });
};

/* ---------- Чтение / запись новых персонажей ---------- */
export const getCustomCharacters = (): Character[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_CHARS_KEY);
    return raw ? (JSON.parse(raw) as Character[]) : [];
  } catch {
    return [];
  }
};

export const saveCustomCharacters = (list: Character[]): void => {
  try {
    localStorage.setItem(CUSTOM_CHARS_KEY, JSON.stringify(list));
    syncAdminContentToRuntime();
  } catch {
    // игнорируем ошибки
  }
};

/* ---------- Чтение / запись оверрайдов существующих героев ---------- */
export const getLocalCharOverrides = (): Record<string, Partial<Character>> => {
  try {
    const raw = localStorage.getItem(CHAR_OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Partial<Character>>) : {};
  } catch {
    return {};
  }
};

export const saveLocalCharOverride = (
  charId: string,
  patch: Partial<Character>,
): void => {
  try {
    const map = getLocalCharOverrides();
    map[charId] = patch;
    localStorage.setItem(CHAR_OVERRIDES_KEY, JSON.stringify(map));
    syncAdminContentToRuntime();
  } catch {
    // игнорируем
  }
};

export const removeLocalCharOverride = (charId: string): void => {
  try {
    const map = getLocalCharOverrides();
    delete map[charId];
    localStorage.setItem(CHAR_OVERRIDES_KEY, JSON.stringify(map));

    saveCharacterArtBundle(charId, {
      card: '',
      icon: '',
      splash: '',
      transforms: DEFAULT_ART_TRANSFORMS,
    });

    const customList = getCustomCharacters();
    if (customList.some((c) => c.id === charId)) {
      const nextCustom = customList.filter((c) => c.id !== charId);
      localStorage.setItem(CUSTOM_CHARS_KEY, JSON.stringify(nextCustom));
    }

    syncAdminContentToRuntime();
  } catch {
    // игнорируем
  }
};

/* ---------- Мгновенная синхронизация с CHARACTERS, IMAGES и PRYDWEN_CHAR_META ---------- */
export const syncAdminContentToRuntime = (
  serverEdits?: Record<string, Record<string, unknown>>,
): void => {
  const customImages = getCustomImagesMap();
  const customIcons = getCustomIconsMap();
  const customSplashes = getCustomSplashesMap();
  const customArtPos = getCustomArtPosMap();
  const customChars = getCustomCharacters();
  const localOverrides = getLocalCharOverrides();

  // 1. Восстанавливаем исходных персонажей
  CHARACTERS.length = 0;
  for (const [, orig] of ORIGINAL_CHARS_SNAPSHOT.entries()) {
    CHARACTERS.push(JSON.parse(JSON.stringify(orig)) as Character);
  }

  // 2. Добавляем кастомных персонажей
  for (const cc of customChars) {
    const existingIdx = CHARACTERS.findIndex((x) => x.id === cc.id);
    if (existingIdx === -1) {
      CHARACTERS.unshift(JSON.parse(JSON.stringify(cc)) as Character);
    } else {
      Object.assign(CHARACTERS[existingIdx], cc);
    }
  }

  // 3. Применяем серверные и локальные правки + 3 вида картинок + координаты + мета-тиры T0..T3
  const mergedEdits: Record<string, Record<string, unknown>> = {
    ...(serverEdits ?? {}),
    ...(localOverrides as Record<string, Record<string, unknown>>),
  };

  for (const [charId, patch] of Object.entries(mergedEdits)) {
    if (!patch || typeof patch !== 'object') continue;
    const rec = patch as Record<string, any>;

    if (typeof rec.__cardImage === 'string' && rec.__cardImage.trim()) {
      IMAGES[charId] = rec.__cardImage.trim();
    }
    if (typeof rec.__iconImage === 'string' && rec.__iconImage.trim()) {
      CHARACTER_ICONS[charId] = rec.__iconImage.trim();
    }
    if (typeof rec.__splashImage === 'string' && rec.__splashImage.trim()) {
      CHARACTER_SPLASHES[charId] = rec.__splashImage.trim();
    }
    if (rec.__artTransforms && typeof rec.__artTransforms === 'object') {
      CHARACTER_ART_TRANSFORMS[charId] = rec.__artTransforms as CharacterArtTransforms;
    }

    // Обновляем глобальный тир-лист Prydwen (T0 / T0.5 / T1 / T1.5 / T2 / T3)
    if (rec.prydwenMeta || rec.metaRating) {
      const existingPrydwen = PRYDWEN_CHAR_META[charId] ?? {
        toa: 'T1' as PrydwenTier,
        wastes: 'T1' as PrydwenTier,
        column: 'Main DPS' as PrydwenRoleCol,
        tags: [],
      };
      const toaTier = (rec.prydwenMeta?.toa || rec.metaRating?.tower || existingPrydwen.toa) as PrydwenTier;
      const wastesTier = (rec.prydwenMeta?.wastes || rec.metaRating?.realm || existingPrydwen.wastes) as PrydwenTier;
      const col = (rec.prydwenMeta?.column || existingPrydwen.column) as PrydwenRoleCol;
      const tags = Array.isArray(rec.prydwenMeta?.tags)
        ? rec.prydwenMeta.tags
        : existingPrydwen.tags;

      PRYDWEN_CHAR_META[charId] = {
        toa: toaTier,
        wastes: wastesTier,
        column: col,
        tags,
      };
    }

    const idx = CHARACTERS.findIndex((c) => c.id === charId);
    if (idx !== -1) {
      Object.assign(CHARACTERS[idx], patch);
    } else if (rec.name && rec.element) {
      CHARACTERS.unshift(patch as unknown as Character);
    }
  }

  // 4. Применяем локальные карты 3 форматов картинок и их позиций
  for (const [id, url] of Object.entries(customImages)) {
    if (url) IMAGES[id] = url;
  }
  for (const [id, url] of Object.entries(customIcons)) {
    if (url) CHARACTER_ICONS[id] = url;
  }
  for (const [id, url] of Object.entries(customSplashes)) {
    if (url) CHARACTER_SPLASHES[id] = url;
  }
  for (const [id, pos] of Object.entries(customArtPos)) {
    if (pos) CHARACTER_ART_TRANSFORMS[id] = pos;
  }
};

let initialized = false;
export const initAdminRuntimeSync = async (): Promise<void> => {
  syncAdminContentToRuntime();
  if (initialized || !API_ENABLED) return;
  initialized = true;
  try {
    const res: any = await apiGetCharacterOverrides();
    if (Array.isArray(res?.overrides)) {
      const map: Record<string, Record<string, unknown>> = {};
      for (const item of res.overrides) {
        const cid = item.characterId || item.character_id || item.id;
        if (cid) map[cid] = item.data || item.patch || item;
      }
      syncAdminContentToRuntime(map);
    } else if (res?.edits) {
      syncAdminContentToRuntime(res.edits);
    }
  } catch {
    // работаем на локальном кэше
  }
};

/* ---------- CMS Новостей и Гайдов ---------- */
export const getAdminNews = (): AdminNewsItem[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_NEWS_KEY);
    return raw ? (JSON.parse(raw) as AdminNewsItem[]) : [];
  } catch {
    return [];
  }
};

export const saveAdminNews = (items: AdminNewsItem[]): void => {
  try {
    localStorage.setItem(CUSTOM_NEWS_KEY, JSON.stringify(items));
  } catch {
    // игнорируем
  }
};

export const getAdminGuides = (): AdminGuideItem[] => {
  try {
    const raw = localStorage.getItem(CUSTOM_GUIDES_KEY);
    return raw ? (JSON.parse(raw) as AdminGuideItem[]) : [];
  } catch {
    return [];
  }
};

export const saveAdminGuides = (items: AdminGuideItem[]): void => {
  try {
    localStorage.setItem(CUSTOM_GUIDES_KEY, JSON.stringify(items));
  } catch {
    // игнорируем
  }
};