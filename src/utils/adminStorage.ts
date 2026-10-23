// Движок динамического контента Админки:
// 1) Хранение и синхронизация горизонтальных плиток Главной страницы (HomeTileItem[])
// 2) Хранение 3 форматов изображений персонажа (card, icon, splash) + их координат смещения (X%, Y%, Scale%)
// 3) Синхронизация тиров T0–T3 и тегов механик с глобальной таблицей PRYDWEN_CHAR_META
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
const HOME_TILES_KEY = 'ww_admin_home_tiles_v1';

// Специальный ключ в таблице character_overrides для облачной синхронизации плиток Главной
export const HOME_TILES_CLOUD_ID = '__home_tiles_config__';

const ORIGINAL_CHARS_SNAPSHOT: Map<string, Character> = new Map(
  CHARACTERS.map((c) => [c.id, JSON.parse(JSON.stringify(c)) as Character]),
);
const ORIGINAL_IMAGES_SNAPSHOT: Record<string, string> = { ...IMAGES };

export const CHARACTER_ICONS: Record<string, string> = {};
export const CHARACTER_SPLASHES: Record<string, string> = {};

export interface ArtPosition {
  x: number;
  y: number;
  scale: number;
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

/* ==================== ГОРИЗОНТАЛЬНЫЕ ПЛИТКИ ГЛАВНОЙ СТРАНИЦЫ ==================== */
export interface HomeTileItem {
  id: string;
  title: string;
  badge: string;
  description: string;
  path: string;
  image: string;
  imagePosX?: number;
  imagePosY?: number;
  imageScale?: number;
}

export const DEFAULT_HOME_TILES: HomeTileItem[] = [
  {
    id: 'tile-characters',
    title: 'Каталог Резонаторов',
    badge: 'БАЗА ГЕРОЕВ',
    description:
      'Все 61+ резонаторов Соларис-3 с подробными билдами, созвездиями S1–S6, оружием и материалами вознесения.',
    path: '/characters',
    image: '/images/Camellya_Card.webp',
    imagePosX: 50,
    imagePosY: 18,
    imageScale: 105,
  },
  {
    id: 'tile-bestiary',
    title: 'Бестиарий и Материалы',
    badge: 'АРХИВ 163+',
    description:
      'Полный каталог всех 163 материалов вознесения, боссов, диковинок, оружия и поглощённых частот Эхо.',
    path: '/bestiary',
    image:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
    imagePosX: 50,
    imagePosY: 50,
    imageScale: 105,
  },
  {
    id: 'tile-meta',
    title: 'Мета и Тир-лист',
    badge: 'PRYDWEN T0–T3',
    description:
      'Актуальный рейтинг эффективности персонажей и топовых отрядов для Tower of Adversity и Whimpering Wastes.',
    path: '/meta',
    image:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
    imagePosX: 50,
    imagePosY: 50,
    imageScale: 105,
  },
  {
    id: 'tile-pulls',
    title: 'Трекер Круток (Convene)',
    badge: 'АНАЛИТИКА ГАЧИ',
    description:
      'Импорт истории призывов из логов игры в 1 клик, подсчёт пити, 50/50 и автоматический учёт созвездий.',
    path: '/pulls',
    image:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
    imagePosX: 50,
    imagePosY: 50,
    imageScale: 105,
  },
  {
    id: 'tile-map',
    title: 'Интерактивная Карта',
    badge: 'НАВИГАТОР МИРА',
    description:
      'Сундуки, Сонанс-каскеты, боссы, телепорты и маршруты фарма диковинок с отметкой собранного прогресса.',
    path: '/map',
    image:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
    imagePosX: 50,
    imagePosY: 50,
    imageScale: 105,
  },
  {
    id: 'tile-calculator',
    title: 'Калькулятор Эхо и Статов',
    badge: 'ОПТИМИЗАТОР',
    description:
      'Расчёт итогового крит-баланса, ценности саб-статов Эхо и симуляция урона резонатора перед прокачкой.',
    path: '/calculator',
    image:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=900&q=80',
    imagePosX: 50,
    imagePosY: 50,
    imageScale: 105,
  },
];

export const getHomeTiles = (): HomeTileItem[] => {
  try {
    const raw = localStorage.getItem(HOME_TILES_KEY);
    if (!raw) return DEFAULT_HOME_TILES;
    const parsed = JSON.parse(raw) as HomeTileItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HOME_TILES;
  } catch {
    return DEFAULT_HOME_TILES;
  }
};

export const saveHomeTiles = (tiles: HomeTileItem[]): void => {
  try {
    localStorage.setItem(HOME_TILES_KEY, JSON.stringify(tiles));
  } catch {
    // игнорируем переполнение
  }
};

export const resetHomeTiles = (): HomeTileItem[] => {
  try {
    localStorage.removeItem(HOME_TILES_KEY);
  } catch {
    // игнорируем
  }
  return DEFAULT_HOME_TILES;
};

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
    // игнорируем
  }
};

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

export const syncAdminContentToRuntime = (
  serverEdits?: Record<string, Record<string, unknown>>,
): void => {
  const customImages = getCustomImagesMap();
  const customIcons = getCustomIconsMap();
  const customSplashes = getCustomSplashesMap();
  const customArtPos = getCustomArtPosMap();
  const customChars = getCustomCharacters();
  const localOverrides = getLocalCharOverrides();

  // Если с сервера пришли сохранённые плитки Главной — синхронизируем их
  if (serverEdits && serverEdits[HOME_TILES_CLOUD_ID]) {
    const cloudTiles = (serverEdits[HOME_TILES_CLOUD_ID] as any)?.tiles;
    if (Array.isArray(cloudTiles) && cloudTiles.length > 0) {
      saveHomeTiles(cloudTiles);
    }
  }

  CHARACTERS.length = 0;
  for (const [, orig] of ORIGINAL_CHARS_SNAPSHOT.entries()) {
    CHARACTERS.push(JSON.parse(JSON.stringify(orig)) as Character);
  }

  for (const cc of customChars) {
    const existingIdx = CHARACTERS.findIndex((x) => x.id === cc.id);
    if (existingIdx === -1) {
      CHARACTERS.unshift(JSON.parse(JSON.stringify(cc)) as Character);
    } else {
      Object.assign(CHARACTERS[existingIdx], cc);
    }
  }

  const mergedEdits: Record<string, Record<string, unknown>> = {
    ...(serverEdits ?? {}),
    ...(localOverrides as Record<string, Record<string, unknown>>),
  };

  for (const [charId, patch] of Object.entries(mergedEdits)) {
    if (charId === HOME_TILES_CLOUD_ID) continue;
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

    if (rec.prydwenMeta || rec.metaRating) {
      const existingPrydwen = PRYDWEN_CHAR_META[charId] ?? {
        toa: 'T1' as PrydwenTier,
        wastes: 'T1' as PrydwenTier,
        column: 'Main DPS' as PrydwenRoleCol,
        tags: [],
      };
      const toaTier = (rec.prydwenMeta?.toa ||
        rec.metaRating?.tower ||
        existingPrydwen.toa) as PrydwenTier;
      const wastesTier = (rec.prydwenMeta?.wastes ||
        rec.metaRating?.realm ||
        existingPrydwen.wastes) as PrydwenTier;
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