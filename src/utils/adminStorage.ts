// Движок динамического контента Админки:
// 1) Хранение 3 форматов изображений персонажа: Большая карточка (card), Маленькая иконка (icon), Горизонтальный арт (splash)
// 2) Инъекция новых и отредактированных персонажей в глобальный каталог CHARACTERS и IMAGES
// 3) Синхронизация с базой Supabase (character_overrides)
import { CHARACTERS } from '../data/characters';
import { IMAGES } from '../data/images';
import type { Character } from '../data/types';
import { apiGetCharacterOverrides, API_ENABLED } from './api';

const CUSTOM_CHARS_KEY = 'ww_admin_custom_chars_v1';
const CHAR_OVERRIDES_KEY = 'ww_admin_char_overrides_v1';
const CUSTOM_IMAGES_KEY = 'ww_admin_custom_images_v1';
const CUSTOM_ICONS_KEY = 'ww_admin_custom_icons_v1';
const CUSTOM_SPLASHES_KEY = 'ww_admin_custom_splashes_v1';
const CUSTOM_NEWS_KEY = 'ww_admin_news_v1';
const CUSTOM_GUIDES_KEY = 'ww_admin_guides_v1';

const ORIGINAL_CHARS_SNAPSHOT: Map<string, Character> = new Map(
  CHARACTERS.map((c) => [c.id, JSON.parse(JSON.stringify(c)) as Character]),
);
const ORIGINAL_IMAGES_SNAPSHOT: Record<string, string> = { ...IMAGES };

// Оперативные словари для маленьких иконок (Скрин 2) и горизонтальных баннеров (Скрин 3)
export const CHARACTER_ICONS: Record<string, string> = {};
export const CHARACTER_SPLASHES: Record<string, string> = {};

export interface CharacterArtBundle {
  card: string;
  icon: string;
  splash: string;
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

/* ---------- Получение всех 3 картинок персонажа ---------- */
export const getCharacterArtUrls = (charId: string): CharacterArtBundle => {
  const cards = getCustomImagesMap();
  const icons = getCustomIconsMap();
  const splashes = getCustomSplashesMap();

  const cardUrl = cards[charId] || CHARACTER_ICONS[charId + '__card'] || IMAGES[charId] || '';
  const iconUrl = icons[charId] || CHARACTER_ICONS[charId] || '';
  const splashUrl = splashes[charId] || CHARACTER_SPLASHES[charId] || '';

  return {
    card: cardUrl,
    icon: iconUrl,
    splash: splashUrl,
  };
};

/* ---------- Сохранение всех 3 форматов картинок персонажа ---------- */
export const saveCharacterArtBundle = (
  charId: string,
  bundle: Partial<CharacterArtBundle>,
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

    saveCharacterArtBundle(charId, { card: '', icon: '', splash: '' });

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

/* ---------- Мгновенная синхронизация с CHARACTERS и тремя словарями картинок ---------- */
export const syncAdminContentToRuntime = (
  serverEdits?: Record<string, Record<string, unknown>>,
): void => {
  const customImages = getCustomImagesMap();
  const customIcons = getCustomIconsMap();
  const customSplashes = getCustomSplashesMap();
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
      CHARACTERS[existingIdx] = { ...CHARACTERS[existingIdx], ...cc };
    }
  }

  // 3. Применяем серверные и локальные правки + 3 вида картинок
  const mergedEdits: Record<string, Record<string, unknown>> = {
    ...(serverEdits ?? {}),
    ...(localOverrides as Record<string, Record<string, unknown>>),
  };

  for (const [charId, patch] of Object.entries(mergedEdits)) {
    if (!patch || typeof patch !== 'object') continue;
    const rec = patch as Record<string, unknown>;

    if (typeof rec.__cardImage === 'string' && rec.__cardImage.trim()) {
      IMAGES[charId] = rec.__cardImage.trim();
    }
    if (typeof rec.__iconImage === 'string' && rec.__iconImage.trim()) {
      CHARACTER_ICONS[charId] = rec.__iconImage.trim();
    }
    if (typeof rec.__splashImage === 'string' && rec.__splashImage.trim()) {
      CHARACTER_SPLASHES[charId] = rec.__splashImage.trim();
    }

    const idx = CHARACTERS.findIndex((c) => c.id === charId);
    if (idx !== -1) {
      Object.assign(CHARACTERS[idx], patch);
    } else if (rec.name && rec.element) {
      CHARACTERS.unshift(patch as unknown as Character);
    }
  }

  // 4. Применяем локальные карты 3 форматов картинок
  for (const [id, url] of Object.entries(customImages)) {
    if (url) IMAGES[id] = url;
  }
  for (const [id, url] of Object.entries(customIcons)) {
    if (url) CHARACTER_ICONS[id] = url;
  }
  for (const [id, url] of Object.entries(customSplashes)) {
    if (url) CHARACTER_SPLASHES[id] = url;
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