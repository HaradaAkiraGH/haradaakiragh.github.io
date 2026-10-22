// Движок динамического контента Админки:
// 1) Хранение и инъекция новых персонажей (созданных в /admin) прямо в глобальный каталог CHARACTERS и IMAGES
// 2) Наложение визуальных правок (overrides) на существующих персонажей
// 3) Хранение кастомных новостей и гайдов + синхронизация с Supabase (character_overrides)
import { CHARACTERS } from '../data/characters';
import { IMAGES } from '../data/images';
import type { Character } from '../data/types';
import { apiGetCharacterOverrides, API_ENABLED } from './api';

const CUSTOM_CHARS_KEY = 'ww_admin_custom_chars_v1';
const CHAR_OVERRIDES_KEY = 'ww_admin_char_overrides_v1';
const CUSTOM_IMAGES_KEY = 'ww_admin_custom_images_v1';
const CUSTOM_NEWS_KEY = 'ww_admin_news_v1';
const CUSTOM_GUIDES_KEY = 'ww_admin_guides_v1';

// Снимок исходных персонажей при первом запуске для чистого сброса правок
const ORIGINAL_CHARS_SNAPSHOT: Map<string, Character> = new Map(
  CHARACTERS.map((c) => [c.id, JSON.parse(JSON.stringify(c)) as Character]),
);
const ORIGINAL_IMAGES_SNAPSHOT: Record<string, string> = { ...IMAGES };

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

/* ---------- Чтение / запись кастомных картинок карточек ---------- */
export const getCustomImagesMap = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(CUSTOM_IMAGES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
};

export const saveCustomCharacterImage = (charId: string, imageUrl: string): void => {
  try {
    const map = getCustomImagesMap();
    if (imageUrl.trim()) {
      map[charId] = imageUrl.trim();
      IMAGES[charId] = imageUrl.trim();
    } else {
      delete map[charId];
      if (ORIGINAL_IMAGES_SNAPSHOT[charId]) {
        IMAGES[charId] = ORIGINAL_IMAGES_SNAPSHOT[charId];
      } else {
        delete IMAGES[charId];
      }
    }
    localStorage.setItem(CUSTOM_IMAGES_KEY, JSON.stringify(map));
  } catch {
    // игнорируем переполнение
  }
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

    // Если это был полностью кастомный персонаж — удаляем и из списка новых
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

/* ---------- Мгновенная синхронизация с глобальным массивом CHARACTERS и IMAGES ---------- */
export const syncAdminContentToRuntime = (
  serverEdits?: Record<string, Record<string, unknown>>,
): void => {
  const customImages = getCustomImagesMap();
  const customChars = getCustomCharacters();
  const localOverrides = getLocalCharOverrides();

  // 1. Восстанавливаем исходных персонажей из снапшота
  CHARACTERS.length = 0;
  for (const [, orig] of ORIGINAL_CHARS_SNAPSHOT.entries()) {
    CHARACTERS.push(JSON.parse(JSON.stringify(orig)) as Character);
  }

  // 2. Добавляем кастомных персонажей, созданных в админке
  for (const cc of customChars) {
    const existingIdx = CHARACTERS.findIndex((x) => x.id === cc.id);
    if (existingIdx === -1) {
      CHARACTERS.unshift(JSON.parse(JSON.stringify(cc)) as Character);
    } else {
      CHARACTERS[existingIdx] = { ...CHARACTERS[existingIdx], ...cc };
    }
  }

  // 3. Применяем серверные и локальные правки (и выделяем новых персонажей, пришедших с сервера)
  const mergedEdits: Record<string, Record<string, unknown>> = {
    ...(serverEdits ?? {}),
    ...(localOverrides as Record<string, Record<string, unknown>>),
  };

  for (const [charId, patch] of Object.entries(mergedEdits)) {
    if (!patch || typeof patch !== 'object') continue;
    const customImg = (patch as Record<string, unknown>).__cardImage;
    if (typeof customImg === 'string' && customImg.trim()) {
      IMAGES[charId] = customImg.trim();
    }

    const idx = CHARACTERS.findIndex((c) => c.id === charId);
    if (idx !== -1) {
      Object.assign(CHARACTERS[idx], patch);
    } else if ((patch as Record<string, unknown>).name && (patch as Record<string, unknown>).element) {
      // Это новый персонаж, сохранённый в таблице character_overrides на сервере
      CHARACTERS.unshift(patch as unknown as Character);
    }
  }

  // 4. Применяем кастомные изображения карточек
  for (const [id, url] of Object.entries(customImages)) {
    if (url) IMAGES[id] = url;
  }
};

/* Инициализация при загрузке приложения (подтягивает и локальные, и серверные карточки) */
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