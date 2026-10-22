// Командный центр Администратора Stellar Wiki (Solaris-3 Root Terminal):
// 1) Создание карточек новых персонажей с живым превью и загрузкой арта
// 2) Визуальный конструктор существующих и новых героев (без ручного JSON)
// 3) Управление Бестиарием (163 материала + оружие + эхо + враги)
// 4) CMS для Новостей и Гайдов + Полный экспорт/импорт базы
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UserPlus,
  Sliders,
  Archive,
  Newspaper,
  Database,
  Save,
  RotateCcw,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Upload,
  ExternalLink,
  Sparkles,
  Swords,
  Layers,
  BookOpen,
  Download,
  CloudUpload,
  X,
} from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { IMAGES } from '../data/images';
import {
  ELEMENTS,
  WEAPON_LABELS,
} from '../utils/constants';
import type {
  ElementType,
  WeaponType,
  CharacterRole,
} from '../data/types';
import { CharacterCard } from '../components/characters/CharacterCard';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useAuth } from '../hooks/useAuth';
import {
  apiGetCharacterOverrides,
  apiSaveCharacterOverride,
  apiDeleteCharacterOverride,
  apiGetBestiary,
  apiCreateBestiary,
  apiDeleteBestiary,
  BestiaryEntry,
} from '../utils/api';
import {
  getCustomCharacters,
  saveCustomCharacters,
  getLocalCharOverrides,
  saveLocalCharOverride,
  removeLocalCharOverride,
  saveCustomCharacterImage,
  syncAdminContentToRuntime,
  getAdminNews,
  saveAdminNews,
  getAdminGuides,
  saveAdminGuides,
  AdminNewsItem,
  AdminGuideItem,
} from '../utils/adminStorage';
import {
  BUILTIN_MATERIALS,
  getBuiltinMaterialsAsEntries,
} from '../data/materialsCatalog';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type TierRank = 'S' | 'A' | 'B' | 'C' | '-';

const ROLES: CharacterRole[] = [
  'Main DPS',
  'Sub DPS',
  'Support',
  'Healer',
  'Defender',
];
const TIERS: TierRank[] = ['S', 'A', 'B', 'C', '-'];

/* Транслитерация и генерация чистого ID (slug) из имени персонажа */
function slugifyName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* Сжатие загружаемого с ПК арта карточки через Canvas */
function compressCardArt(file: File, maxW = 720, maxH = 1080): Promise<string> {
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
        resolve(canvas.toDataURL('image/webp', 0.86));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const createEmptyCharacter = (): any => ({
  id: 'new-resonator',
  name: 'New Resonator',
  title: 'Астральный Странник',
  rarity: 5,
  element: 'Havoc',
  weapon: 'Sword',
  role: 'Main DPS',
  releaseDate: '2026-10',
  lore: 'Новый резонатор Соларис-3, добавленный через терминал администратора Stellar Wiki.',
  stats: { hp: 11800, atk: 445, def: 1150, energyRegen: 120 },
  targetStats: [
    { name: 'Crit Rate', value: '70–80%', note: 'Приоритет' },
    { name: 'Crit DMG', value: '260–285%' },
    { name: 'ATK', value: '2200+' },
    { name: 'Energy Regen', value: '120–130%' },
  ] as any[],
  skillPriority: [
    { name: 'Forte Circuit', priority: 5, level: '10' },
    { name: 'Resonance Liberation', priority: 5, level: '10' },
    { name: 'Resonance Skill', priority: 4, level: '8–10' },
  ] as any[],
  strengths: [
    'Огромный взрывной урон по одиночным и групповым целям',
    'Удобная ротация и высокая мобильность',
  ],
  weaknesses: ['Требует сигнатурное оружие для максимального потенциала'],
  echoSets: [
    {
      name: 'Midnight Veil (5pc)',
      description: '+10% элементального урона и бонус при смене резонатора',
      cost4: 'Nightmare: Impermanence Heron',
      substats: ['Crit Rate', 'Crit DMG', 'ATK%', 'Energy Regen'],
    },
  ] as any[],
  weapons: [
    {
      name: 'Сигнатурный клинок 5★',
      passive: 'Увеличивает атаку на 12% и бонус основного урона на 48%.',
      isBest: true,
      rank: 1,
    },
  ] as any[],
  rotation: [
    { step: 'Intro Skill при входе на поле', description: 'Intro Skill при входе на поле' },
    { step: 'Resonance Skill для набора стаков Форте', description: 'Resonance Skill для набора стаков Форте' },
    { step: 'Resonance Liberation (Ультимейт)', description: 'Resonance Liberation (Ультимейт)' },
    { step: 'Разрядка Forte Circuit ➔ Outro Skill', description: 'Разрядка Forte Circuit ➔ Outro Skill' },
  ] as any[],
  teams: [
    {
      members: ['camellya', 'roccia', 'shorekeeper'],
      note: 'Премиум Гиперкерри (Максимальный урон под баффами)',
    },
  ] as any[],
  materials: [
    { type: 'Ascension', name: 'Topological Confinement', count: '46' },
    { type: 'Forte', name: 'Dreamless Feather', count: '26' },
    { type: 'Ascension', name: 'Nova', count: '60' },
    { type: 'Skill', name: 'Heterized Metallic Drip', count: '67' },
    { type: 'Skill', name: 'FF Whisperin Core', count: '61' },
    { type: 'Forte', name: 'Shell Credits', count: '2 200 000' },
  ] as any[],
  skills: [
    {
      type: 'Basic',
      name: 'Базовая серия ударов',
      description: 'Выполняет до 4 последовательных атак стихией резонатора.',
    },
    {
      type: 'Skill',
      name: 'Резонансный навык',
      description: 'Наносит концентрированный урон и накапливает шкалу Форте.',
    },
    {
      type: 'Forte',
      name: 'Контур Форте',
      description: 'При полной шкале активирует усиленную стойку с повышенными множителями.',
    },
    {
      type: 'Liberation',
      name: 'Резонансное освобождение',
      description: 'Обрушивает сокрушительный ультимативный удар по области.',
    },
    {
      type: 'Intro',
      name: 'Интро-навык',
      description: 'Атакует цель при входе на поле боя.',
    },
    {
      type: 'Outro',
      name: 'Аутро-навык',
      description: 'Усиливает следующего входящего на поле резонатора.',
    },
  ] as any[],
  constellations: [
    { name: 'Цепь S1', description: 'Повышает шанс крит. удара и устойчивость к прерыванию.' },
    { name: 'Цепь S2', description: 'Увеличивает множитель взрывного урона на 40%.' },
    { name: 'Цепь S3', description: 'Увеличивает уровень ультимейта и навыка.' },
    { name: 'Цепь S4', description: 'Даёт 25% бонус к урону всей команде при активации ульты.' },
    { name: 'Цепь S5', description: 'Повышает уровень базовой атаки и контура Форте.' },
    { name: 'Цепь S6', description: 'Открывает финальную форму с игнорированием 40% защиты врагов.' },
  ] as any[],
  metaRating: { tower: 'S', realm: 'S' },
});

const inputCls =
  'w-full bg-[#090b12] border border-white/12 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ivory focus-ring';
const labelCls =
  'block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5';

export const AdminPage = () => {
  useDocumentMeta({
    title: 'Root-Терминал Администратора — Stellar Wiki',
    description:
      'Панель управления Stellar Wiki: добавление новых персонажей, визуальный редактор билдов, Бестиарий и CMS.',
  });

  const { token, user } = useAuth();

  // Главные разделы Админки
  const [mainTab, setMainTab] = useState<
    'create-char' | 'edit-char' | 'bestiary' | 'cms' | 'database'
  >('create-char');

  // Принудительный тик для обновления списков после сохранения
  const [refreshTick, setRefreshTick] = useState(0);

  // Статусные сообщения
  const [statusMsg, setStatusMsg] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const notify = (type: 'ok' | 'err', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  /* ==================== СОСТОЯНИЕ ВКЛАДКИ 1: СОЗДАНИЕ НОВОГО ПЕРСОНАЖА ==================== */
  const [newChar, setNewChar] = useState<any>(() => createEmptyCharacter());
  const [newCharArtUrl, setNewCharArtUrl] = useState<string>('/images/Camellya_Card.webp');
  const [autoSlug, setAutoSlug] = useState(true);
  const newCharFileRef = useRef<HTMLInputElement | null>(null);

  /* ==================== СОСТОЯНИЕ ВКЛАДКИ 2: РЕДАКТОР СУЩЕСТВУЮЩИХ И НОВЫХ ГЕРОЕВ ==================== */
  const [charSearch, setCharSearch] = useState('');
  const [charElFilter, setCharElFilter] = useState<'all' | ElementType>('all');
  const [selectedCharId, setSelectedCharId] = useState<string>(
    CHARACTERS[0]?.id ?? 'camellya',
  );
  const [editorSubTab, setEditorSubTab] = useState<
    'general' | 'gear' | 'skills' | 'teams' | 'json'
  >('general');
  const [draftChar, setDraftChar] = useState<any>(() =>
    JSON.parse(JSON.stringify(CHARACTERS[0] ?? createEmptyCharacter())),
  );
  const [draftArtUrl, setDraftArtUrl] = useState<string>(
    IMAGES[CHARACTERS[0]?.id ?? 'camellya'] ?? '',
  );
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const editCharFileRef = useRef<HTMLInputElement | null>(null);

  // Серверные оверрайды
  const [serverEdits, setServerEdits] = useState<
    Record<string, Record<string, unknown>>
  >({});

  /* ==================== СОСТОЯНИЕ ВКЛАДКИ 3: БЕСТИАРИЙ ==================== */
  const [bestiaryEntries, setBestiaryEntries] = useState<BestiaryEntry[]>([]);
  const [bestiarySearch, setBestiarySearch] = useState('');
  const [newBestiaryItem, setNewBestiaryItem] = useState({
    category: 'Материалы',
    name: '',
    rarity: 4,
    description: '',
    image: '',
    source: '',
  });

  /* ==================== СОСТОЯНИЕ ВКЛАДКИ 4: CMS НОВОСТЕЙ И ГАЙДОВ ==================== */
  const [newsList, setNewsList] = useState<AdminNewsItem[]>(() => getAdminNews());
  const [guidesList, setGuidesList] = useState<AdminGuideItem[]>(() => getAdminGuides());
  const [newNews, setNewNews] = useState<Omit<AdminNewsItem, 'id'>>({
    title: '',
    category: 'Обновление',
    date: new Date().toLocaleDateString('ru-RU'),
    summary: '',
    image: '',
  });
  const [newGuide, setNewGuide] = useState<Omit<AdminGuideItem, 'id'>>({
    title: '',
    category: 'Эхо и Билды',
    readTime: '5 мин',
    author: user?.nickname || 'HaradaAkira',
    content: '',
  });

  // Загрузка данных с сервера при открытии админки
  useEffect(() => {
    apiGetCharacterOverrides()
      .then((r: any) => {
        const edits = (r.edits ?? {}) as Record<string, Record<string, unknown>>;
        setServerEdits(edits);
        syncAdminContentToRuntime(edits);
        setRefreshTick((t: number) => t + 1);
      })
      .catch((_: any) => {});

    apiGetBestiary()
      .then((r: any) => setBestiaryEntries(r.entries ?? []))
      .catch((_: any) => {});
  }, []);

  // При переключении выбранного персонажа в редакторе — загружаем его актуальные данные
  useEffect(() => {
    const found = CHARACTERS.find((c) => c.id === selectedCharId);
    if (!found) return;
    const cloned = JSON.parse(JSON.stringify(found)) as any;
    setDraftChar(cloned);
    setDraftArtUrl(IMAGES[found.id] ?? '');
    setRawJsonText(JSON.stringify(cloned, null, 2));
  }, [selectedCharId, refreshTick]);

  // Метрики для верхней панели телеметрии
  const customCharsList = useMemo(() => getCustomCharacters(), [refreshTick]);
  const localOverridesMap = useMemo(() => getLocalCharOverrides(), [refreshTick]);
  const allBestiaryMerged = useMemo(() => {
    const builtin = getBuiltinMaterialsAsEntries();
    return [...bestiaryEntries, ...builtin];
  }, [bestiaryEntries]);

  /* ==================== ОБРАБОТЧИКИ ВКЛАДКИ 1: СОЗДАНИЕ НОВОГО ПЕРСОНАЖА ==================== */
  const handleNewCharNameChange = (name: string) => {
    const nextId = autoSlug ? slugifyName(name) || 'new-resonator' : newChar.id;
    setNewChar((prev: any) => ({ ...prev, name, id: nextId }));
  };

  const handleUploadNewCharArt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressCardArt(file);
      setNewCharArtUrl(dataUrl);
    } catch {
      notify('err', 'Не удалось обработать изображение');
    }
  };

  const handleCreateNewCharacter = async () => {
    const cleanId = slugifyName(newChar.id || newChar.name);
    if (!cleanId || !newChar.name.trim()) {
      notify('err', 'Укажи имя и корректный латинский ID персонажа');
      return;
    }

    setBusy(true);
    try {
      const finalChar = {
        ...newChar,
        id: cleanId,
        name: newChar.name.trim(),
        title: newChar.title.trim() || 'Резонатор Соларис-3',
      };

      // 1. Сохраняем картинку карточки
      if (newCharArtUrl.trim()) {
        saveCustomCharacterImage(cleanId, newCharArtUrl.trim());
      }

      // 2. Сохраняем в список кастомных персонажей и инжектируем в CHARACTERS
      const existingCustom = getCustomCharacters().filter((c) => c.id !== cleanId);
      saveCustomCharacters([finalChar, ...existingCustom]);

      // 3. Сохраняем в Supabase (в таблицу character_overrides с полем __cardImage)
      if (token) {
        await apiSaveCharacterOverride(token, cleanId, {
          ...(finalChar as unknown as Record<string, unknown>),
          __cardImage: newCharArtUrl.trim(),
          __isCustomCharacter: true,
        });
      }

      setRefreshTick((t) => t + 1);
      setSelectedCharId(cleanId);
      notify(
        'ok',
        `Персонаж «${finalChar.name}» создан и добавлен в каталог сайта!`,
      );
      setNewChar(createEmptyCharacter());
    } catch (e: any) {
      notify(
        'err',
        e instanceof Error
          ? `Создано локально, ошибка облака: ${e.message}`
          : 'Ошибка сохранения',
      );
    } finally {
      setBusy(false);
    }
  };

  /* ==================== ОБРАБОТЧИКИ ВКЛАДКИ 2: ВИЗУАЛЬНЫЙ РЕДАКТОР ГЕРОЕВ ==================== */
  const handleUploadEditCharArt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressCardArt(file);
      setDraftArtUrl(dataUrl);
    } catch {
      notify('err', 'Ошибка чтения файла');
    }
  };

  const handleSaveEditedCharacter = async () => {
    setBusy(true);
    try {
      let toSave = draftChar;
      if (editorSubTab === 'json') {
        try {
          toSave = JSON.parse(rawJsonText) as any;
        } catch {
          notify('err', 'Ошибка синтаксиса в RAW JSON');
          setBusy(false);
          return;
        }
      }

      // Сохраняем обновлённый арт карточки
      saveCustomCharacterImage(toSave.id, draftArtUrl);

      // Сохраняем оверрайд локально и обновляем CHARACTERS
      saveLocalCharOverride(toSave.id, toSave);

      // Если это кастомный персонаж — обновляем и его базовую запись
      const customList = getCustomCharacters();
      if (customList.some((c) => c.id === toSave.id)) {
        saveCustomCharacters(
          customList.map((c) => (c.id === toSave.id ? toSave : c)),
        );
      }

      // Отправляем в Supabase
      if (token) {
        await apiSaveCharacterOverride(token, toSave.id, {
          ...(toSave as unknown as Record<string, unknown>),
          __cardImage: draftArtUrl,
        });
        setServerEdits((prev) => ({
          ...prev,
          [toSave.id]: toSave as Record<string, unknown>,
        }));
      }

      setRefreshTick((t) => t + 1);
      notify('ok', `Все изменения для «${toSave.name}» успешно сохранены!`);
    } catch (e: any) {
      notify('err', e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setBusy(false);
    }
  };

  const handleResetCharacter = async () => {
    if (
      !window.confirm(
        `Сбросить все изменения для «${draftChar.name}» (или удалить, если это новый персонаж)?`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      removeLocalCharOverride(selectedCharId);
      saveCustomCharacterImage(selectedCharId, '');
      if (token) {
        await apiDeleteCharacterOverride(token, selectedCharId).catch((_: any) => {});
      }
      setServerEdits((prev) => {
        const copy = { ...prev };
        delete copy[selectedCharId];
        return copy;
      });
      setRefreshTick((t) => t + 1);
      if (!CHARACTERS.some((c) => c.id === selectedCharId)) {
        setSelectedCharId(CHARACTERS[0]?.id ?? 'camellya');
      }
      notify('ok', 'Персонаж возвращён к исходному состоянию');
    } finally {
      setBusy(false);
    }
  };

  /* ==================== ОБРАБОТЧИКИ ВКЛАДКИ 3: БЕСТИАРИЙ ==================== */
  const handleAddBestiaryEntry = async () => {
    if (!token || !newBestiaryItem.name.trim()) {
      notify('err', 'Укажи название предмета Бестиария');
      return;
    }
    setBusy(true);
    try {
      await apiCreateBestiary(token, {
        category: newBestiaryItem.category,
        name: newBestiaryItem.name.trim(),
        rarity: newBestiaryItem.rarity,
        description: newBestiaryItem.description,
        image: newBestiaryItem.image.trim() || null,
        props: newBestiaryItem.source ? { Источник: newBestiaryItem.source } : {},
        tags: newBestiaryItem.category.toLowerCase(),
      });
      const r = await apiGetBestiary();
      setBestiaryEntries(r.entries ?? []);
      setNewBestiaryItem({
        ...newBestiaryItem,
        name: '',
        description: '',
        image: '',
        source: '',
      });
      notify('ok', 'Предмет добавлен в Бестиарий!');
    } catch (e: any) {
      notify('err', e instanceof Error ? e.message : 'Ошибка создания');
    } finally {
      setBusy(false);
    }
  };

  const handleSync163Materials = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const existingNames = new Set(
        bestiaryEntries
          .filter((e) => e.category === 'Материалы')
          .map((e) => e.name.toLowerCase()),
      );
      const toUpload = BUILTIN_MATERIALS.filter(
        (m) => !existingNames.has(m.name.toLowerCase()),
      );
      let count = 0;
      for (const m of toUpload) {
        await apiCreateBestiary(token, {
          category: 'Материалы',
          name: m.name,
          rarity: m.rarity,
          description: m.description,
          image: m.image,
          props: { Подкатегория: m.subcategory, ...m.props },
          tags: `${m.subcategory.toLowerCase()}, ${m.tags}`,
        });
        count++;
      }
      const r = await apiGetBestiary();
      setBestiaryEntries(r.entries ?? []);
      notify(
        'ok',
        count > 0
          ? `В базу Supabase выгружено ${count} новых материалов!`
          : 'Все 163 материала уже синхронизированы с БД.',
      );
    } catch (e: any) {
      notify('err', e instanceof Error ? e.message : 'Ошибка синхронизации');
    } finally {
      setBusy(false);
    }
  };

  /* ==================== ОБРАБОТЧИКИ ВКЛАДКИ 4: НОВОСТИ И ГАЙДЫ ==================== */
  const handleAddNews = () => {
    if (!newNews.title.trim()) return;
    const item: AdminNewsItem = {
      ...newNews,
      id: `news-${Date.now()}`,
    };
    const next = [item, ...newsList];
    setNewsList(next);
    saveAdminNews(next);
    setNewNews({ ...newNews, title: '', summary: '', image: '' });
    notify('ok', 'Новостной материал опубликован!');
  };

  const handleDeleteNews = (id: string) => {
    const next = newsList.filter((n) => n.id !== id);
    setNewsList(next);
    saveAdminNews(next);
  };

  const handleAddGuide = () => {
    if (!newGuide.title.trim()) return;
    const item: AdminGuideItem = {
      ...newGuide,
      id: `guide-${Date.now()}`,
    };
    const next = [item, ...guidesList];
    setGuidesList(next);
    saveAdminGuides(next);
    setNewGuide({ ...newGuide, title: '', content: '' });
    notify('ok', 'Гайд опубликован!');
  };

  const handleDeleteGuide = (id: string) => {
    const next = guidesList.filter((g) => g.id !== id);
    setGuidesList(next);
    saveAdminGuides(next);
  };

  /* ==================== ОБРАБОТЧИК ВКЛАДКИ 5: ЭКСПОРТ БЭКАПА ==================== */
  const exportFullBackupJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      customCharacters: getCustomCharacters(),
      charOverrides: getLocalCharOverrides(),
      serverEdits,
      news: newsList,
      guides: guidesList,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stellar-wiki-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSidebarChars = useMemo(() => {
    const q = charSearch.trim().toLowerCase();
    return CHARACTERS.filter((c) => {
      if (charElFilter !== 'all' && c.element !== charElFilter) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [charSearch, charElFilter, refreshTick]);

  // Живая карточка для превью нового персонажа
  const previewNewChar = useMemo<any>(() => {
    const previewId = slugifyName(newChar.id || newChar.name) || 'new-resonator';
    if (newCharArtUrl) {
      IMAGES[previewId] = newCharArtUrl;
    }
    return {
      ...newChar,
      id: previewId,
    };
  }, [newChar, newCharArtUrl]);

  return (
    <div className="space-y-6 pb-12 w-full animate-fade-in">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* Скрытые инпуты загрузки картинок с ПК */}
      <input
        ref={newCharFileRef}
        type="file"
        accept="image/*"
        onChange={handleUploadNewCharArt}
        className="hidden"
      />
      <input
        ref={editCharFileRef}
        type="file"
        accept="image/*"
        onChange={handleUploadEditCharArt}
        className="hidden"
      />

      {/* ==================== ШАПКА КОМАНДНОГО ЦЕНТРА АДМИНА ==================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#171310] via-[#10121c] to-[#0b0d14] p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] solaris-crest">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-[11px] font-black uppercase tracking-widest mb-2.5">
              <ShieldCheck size={14} />
              <span>SOLARIS-3 ROOT TERMINAL · ACCESS GRANTED</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Панель управления Stellar Wiki
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Добавление новых карточек резонаторов, визуальный конструктор билдов, Бестиарий и CMS
            </p>
          </div>

          {/* 4 плитки телеметрии */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-black/45 border border-white/[0.06] text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Резонаторов
              </span>
              <strong className="text-2xl font-black text-white tabular-nums mt-0.5 block">
                {CHARACTERS.length}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/45 border border-white/[0.06] text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Новых карточек
              </span>
              <strong className="text-2xl font-black text-amber-300 tabular-nums mt-0.5 block">
                {customCharsList.length}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/45 border border-white/[0.06] text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                Правок героев
              </span>
              <strong className="text-2xl font-black text-purple-300 tabular-nums mt-0.5 block">
                {
                  new Set([
                    ...Object.keys(localOverridesMap),
                    ...Object.keys(serverEdits),
                  ]).size
                }
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-black/45 border border-white/[0.06] text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-400 block">
                В Бестиарии
              </span>
              <strong className="text-2xl font-black text-emerald-300 tabular-nums mt-0.5 block">
                {allBestiaryMerged.length}
              </strong>
            </div>
          </div>
        </div>

        {/* Навигация по 5 модулям Админки */}
        <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/[0.07]">
          {(
            [
              { id: 'create-char', label: '+ Создать персонажа', icon: UserPlus },
              { id: 'edit-char', label: 'Конструктор героев (61+)', icon: Sliders },
              { id: 'bestiary', label: 'Бестиарий (163+)', icon: Archive },
              { id: 'cms', label: 'Новости и Гайды', icon: Newspaper },
              { id: 'database', label: 'База и Бэкап', icon: Database },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMainTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] shadow-lg'
                    : 'bg-white/[0.05] hover:bg-white/[0.1] text-gray-300 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Всплывающее уведомление о результате операции */}
      {statusMsg && (
        <div
          className={`glass-panel px-5 py-3.5 flex items-center justify-between gap-3 border ${
            statusMsg.type === 'ok'
              ? 'border-emerald-400/50 text-emerald-200'
              : 'border-rose-400/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold">
            {statusMsg.type === 'ok' ? (
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =================================================================================
          МОДУЛЬ 1: СОЗДАНИЕ КАРТОЧКИ НОВОГО ПЕРСОНАЖА
         ================================================================================= */}
      {mainTab === 'create-char' && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-6 items-start">
          <div className="glass-panel p-6 sm:p-7 space-y-6 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <UserPlus size={20} className="text-accent-light" />
                  <span>Добавить нового резонатора в базу сайта</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  После нажатия «Создать персонажа» карточка сразу появится в каталоге `/characters` и получит свою страницу `/characters/:id`
                </p>
              </div>
            </div>

            {/* Основные поля карточки */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className={labelCls}>Имя персонажа (EN / RU)</span>
                <input
                  type="text"
                  value={newChar.name}
                  onChange={(e) => handleNewCharNameChange(e.target.value)}
                  placeholder="Например: Phrolova / Фролова"
                  className={inputCls}
                />
              </label>

              <label className="block">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                    URL ID (slug)
                  </span>
                  <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                    />
                    <span>Авто</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={newChar.id}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setNewChar({ ...newChar, id: slugifyName(e.target.value) });
                  }}
                  placeholder="phrolova-alter"
                  className={`${inputCls} font-mono`}
                />
              </label>

              <label className="block">
                <span className={labelCls}>Титул (Подзаголовок)</span>
                <input
                  type="text"
                  value={newChar.title}
                  onChange={(e) => setNewChar({ ...newChar, title: e.target.value })}
                  placeholder="Дирижёр Алого Реквиема"
                  className={inputCls}
                />
              </label>
            </div>

            {/* Стихия, Оружие, Редкость, Роль */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="block">
                <span className={labelCls}>Стихия</span>
                <select
                  value={newChar.element}
                  onChange={(e) =>
                    setNewChar({ ...newChar, element: e.target.value as ElementType })
                  }
                  className={inputCls}
                >
                  {(Object.keys(ELEMENTS) as ElementType[]).map((el) => (
                    <option key={el} value={el}>
                      {ELEMENTS[el].label} ({el})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>Оружие</span>
                <select
                  value={newChar.weapon}
                  onChange={(e) =>
                    setNewChar({ ...newChar, weapon: e.target.value as WeaponType })
                  }
                  className={inputCls}
                >
                  {(Object.keys(WEAPON_LABELS) as WeaponType[]).map((w) => (
                    <option key={w} value={w}>
                      {WEAPON_LABELS[w]} ({w})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>Редкость</span>
                <select
                  value={newChar.rarity}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      rarity: Number(e.target.value) as 4 | 5,
                    })
                  }
                  className={inputCls}
                >
                  <option value={5}>5★ (Легендарный)</option>
                  <option value={4}>4★ (Эпический)</option>
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>Боевая роль</span>
                <select
                  value={newChar.role}
                  onChange={(e) =>
                    setNewChar({ ...newChar, role: e.target.value as CharacterRole })
                  }
                  className={inputCls}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Загрузка или ссылка на Арт карточки */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-white">
                  Арт карточки персонажа (вертикальный портрет)
                </span>
                <button
                  type="button"
                  onClick={() => newCharFileRef.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-extrabold cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Загрузить файл с ПК</span>
                </button>
              </div>
              <input
                type="text"
                value={newCharArtUrl}
                onChange={(e) => setNewCharArtUrl(e.target.value)}
                placeholder="Вставь ссылку на картинку (https://... или /images/...) либо загрузи файл выше"
                className={inputCls}
              />
            </div>

            {/* Тиры и Базовые статы */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <label className="block">
                <span className={labelCls}>Тир (Башня)</span>
                <select
                  value={newChar.metaRating.tower}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      metaRating: {
                        ...newChar.metaRating,
                        tower: e.target.value as TierRank,
                      },
                    })
                  }
                  className={inputCls}
                >
                  {TIERS.map((t) => (
                    <option key={t} value={t}>
                      Tier {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>Тир (Wastes)</span>
                <select
                  value={newChar.metaRating.realm}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      metaRating: {
                        ...newChar.metaRating,
                        realm: e.target.value as TierRank,
                      },
                    })
                  }
                  className={inputCls}
                >
                  {TIERS.map((t) => (
                    <option key={t} value={t}>
                      Tier {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>HP (Ур. 90)</span>
                <input
                  type="number"
                  value={newChar.stats.hp}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      stats: { ...newChar.stats, hp: Number(e.target.value) },
                    })
                  }
                  className={inputCls}
                />
              </label>

              <label className="block">
                <span className={labelCls}>ATK (Ур. 90)</span>
                <input
                  type="number"
                  value={newChar.stats.atk}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      stats: { ...newChar.stats, atk: Number(e.target.value) },
                    })
                  }
                  className={inputCls}
                />
              </label>

              <label className="block">
                <span className={labelCls}>DEF (Ур. 90)</span>
                <input
                  type="number"
                  value={newChar.stats.def}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      stats: { ...newChar.stats, def: Number(e.target.value) },
                    })
                  }
                  className={inputCls}
                />
              </label>

              <label className="block">
                <span className={labelCls}>Патч / Дата</span>
                <input
                  type="text"
                  value={newChar.releaseDate ?? ''}
                  onChange={(e) =>
                    setNewChar({ ...newChar, releaseDate: e.target.value })
                  }
                  placeholder="2026-10 (3.7)"
                  className={inputCls}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelCls}>Описание и Лор резонатора</span>
              <textarea
                rows={3}
                value={newChar.lore}
                onChange={(e) => setNewChar({ ...newChar, lore: e.target.value })}
                className={inputCls}
              />
            </label>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={handleCreateNewCharacter}
                disabled={busy}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#caa07d] via-[#e5c5a8] to-[#f7ece6] text-[#09090b] text-sm font-black shadow-lg hover:brightness-105 transition-all disabled:opacity-50 cursor-pointer"
              >
                <UserPlus size={17} />
                <span>{busy ? 'Создание карточки...' : 'Создать карточку персонажа'}</span>
              </button>
            </div>
          </div>

          {/* Правая колонка: Живое превью карточки в каталоге */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent-light flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Превью в каталоге</span>
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                /characters/{previewNewChar.id}
              </span>
            </div>

            <div className="max-w-[250px] mx-auto">
              <CharacterCard character={previewNewChar} />
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              После создания ты сможешь детально настроить его оружие, эхо, навыки и созвездия во второй вкладке «Конструктор героев».
            </p>
          </div>
        </div>
      )}

      {/* =================================================================================
          МОДУЛЬ 2: ВИЗУАЛЬНЫЙ КОНСТРУКТОР СУЩЕСТВУЮЩИХ И НОВЫХ ПЕРСОНАЖЕЙ
         ================================================================================= */}
      {mainTab === 'edit-char' && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6 items-start">
          {/* Левая колонка: Выбор персонажа с поиском и иконками */}
          <div className="glass-panel p-4 space-y-3">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
                placeholder="Найти героя..."
                className="w-full pl-9 pr-3 py-2 bg-[#090b12] border border-white/10 rounded-xl text-xs text-ivory focus-ring"
              />
            </div>

            {/* Быстрый фильтр по стихии */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setCharElFilter('all')}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                  charElFilter === 'all'
                    ? 'bg-accent/25 text-accent-light'
                    : 'bg-white/[0.04] text-gray-400'
                }`}
              >
                Все
              </button>
              {(Object.keys(ELEMENTS) as ElementType[]).map((el) => (
                <button
                  key={el}
                  type="button"
                  onClick={() => setCharElFilter(charElFilter === el ? 'all' : el)}
                  className={`p-1 rounded-lg cursor-pointer ${
                    charElFilter === el ? 'bg-accent/30' : 'bg-white/[0.04]'
                  }`}
                  title={ELEMENTS[el].label}
                >
                  <img src={ELEMENTS[el].icon} alt="" className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Список персонажей */}
            <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
              {filteredSidebarChars.map((c) => {
                const isSelected = c.id === selectedCharId;
                const isCustom = customCharsList.some((x) => x.id === c.id);
                const isEdited =
                  Boolean(localOverridesMap[c.id]) || Boolean(serverEdits[c.id]);

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCharId(c.id)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent/25 text-white shadow-glow-sm'
                        : 'hover:bg-white/[0.05] text-gray-300'
                    }`}
                  >
                    <ImagePlaceholder
                      id={c.id}
                      initials={c.name.slice(0, 2)}
                      element={c.element}
                      className="w-9 h-11 rounded-lg object-cover object-top shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {ELEMENTS[c.element].label} · {c.role}
                      </p>
                    </div>
                    {isCustom ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[#09090b] text-[9px] font-black shrink-0">
                        NEW
                      </span>
                    ) : isEdited ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Правая колонка: Визуальный конструктор выбранного персонажа */}
          <div className="glass-panel p-6 space-y-6 min-w-0 animate-fade-in">
            {/* Шапка выбранного героя + кнопки Сохранить / Сбросить / Открыть страницу */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3.5">
                <ImagePlaceholder
                  id={draftChar.id}
                  initials={draftChar.name ? draftChar.name.slice(0, 2) : 'RE'}
                  element={draftChar.element}
                  className="w-14 h-16 rounded-2xl object-cover object-top"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{draftChar.name}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono text-gray-300">
                      {draftChar.id}
                    </span>
                  </div>
                  <p className="text-xs text-accent-light font-semibold mt-0.5">
                    {draftChar.title} · {ELEMENTS[draftChar.element as ElementType]?.label} ·{' '}
                    {WEAPON_LABELS[draftChar.weapon as WeaponType]}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/characters/${draftChar.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-gray-200"
                >
                  <ExternalLink size={14} />
                  <span>На страницу</span>
                </Link>

                <button
                  type="button"
                  onClick={handleResetCharacter}
                  disabled={busy}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-bold text-rose-300 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw size={14} />
                  <span>Сбросить</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveEditedCharacter}
                  disabled={busy}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-black shadow-lg hover:brightness-105 cursor-pointer disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{busy ? 'Сохранение...' : 'Сохранить в облако'}</span>
                </button>
              </div>
            </div>

            {/* Переключатель 5 подвкладок конструктора */}
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'general', label: '1. Основное и Арт' },
                  { id: 'gear', label: `2. Оружие (${draftChar.weapons?.length ?? 0}) и Эхо (${draftChar.echoSets?.length ?? 0})` },
                  { id: 'skills', label: `3. Навыки (${draftChar.skills?.length ?? 0}) и Цепи S1–S6` },
                  { id: 'teams', label: '4. Ротация, Команды и Ресурсы' },
                  { id: 'json', label: '5. RAW JSON' },
                ] as const
              ).map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    if (st.id === 'json') {
                      setRawJsonText(JSON.stringify(draftChar, null, 2));
                    }
                    setEditorSubTab(st.id);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    editorSubTab === st.id
                      ? 'bg-accent/25 text-accent-light border border-accent/50'
                      : 'bg-white/[0.04] text-gray-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* ПОДВКЛАДКА 1: ОСНОВНОЕ И АРТ */}
            {editorSubTab === 'general' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="block">
                    <span className={labelCls}>Имя персонажа</span>
                    <input
                      type="text"
                      value={draftChar.name ?? ''}
                      onChange={(e) =>
                        setDraftChar({ ...draftChar, name: e.target.value })
                      }
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Титул</span>
                    <input
                      type="text"
                      value={draftChar.title ?? ''}
                      onChange={(e) =>
                        setDraftChar({ ...draftChar, title: e.target.value })
                      }
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Патч / Дата релиза</span>
                    <input
                      type="text"
                      value={draftChar.releaseDate ?? ''}
                      onChange={(e) =>
                        setDraftChar({ ...draftChar, releaseDate: e.target.value })
                      }
                      className={inputCls}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <label className="block">
                    <span className={labelCls}>Стихия</span>
                    <select
                      value={draftChar.element}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          element: e.target.value as ElementType,
                        })
                      }
                      className={inputCls}
                    >
                      {(Object.keys(ELEMENTS) as ElementType[]).map((el) => (
                        <option key={el} value={el}>
                          {ELEMENTS[el].label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Оружие</span>
                    <select
                      value={draftChar.weapon}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          weapon: e.target.value as WeaponType,
                        })
                      }
                      className={inputCls}
                    >
                      {(Object.keys(WEAPON_LABELS) as WeaponType[]).map((w) => (
                        <option key={w} value={w}>
                          {WEAPON_LABELS[w]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Роль</span>
                    <select
                      value={draftChar.role}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          role: e.target.value as CharacterRole,
                        })
                      }
                      className={inputCls}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Редкость</span>
                    <select
                      value={draftChar.rarity ?? 5}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          rarity: Number(e.target.value) as 4 | 5,
                        })
                      }
                      className={inputCls}
                    >
                      <option value={5}>5★</option>
                      <option value={4}>4★</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Тир Башни</span>
                    <select
                      value={draftChar.metaRating?.tower ?? '-'}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          metaRating: {
                            ...(draftChar.metaRating ?? {}),
                            tower: e.target.value as TierRank,
                          },
                        })
                      }
                      className={inputCls}
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className={labelCls}>Тир Wastes</span>
                    <select
                      value={draftChar.metaRating?.realm ?? '-'}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          metaRating: {
                            ...(draftChar.metaRating ?? {}),
                            realm: e.target.value as TierRank,
                          },
                        })
                      }
                      className={inputCls}
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Смена арта карточки */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-white">
                      URL или файл вертикального арта карточки
                    </span>
                    <button
                      type="button"
                      onClick={() => editCharFileRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-ivory cursor-pointer"
                    >
                      <Upload size={13} />
                      <span>Загрузить с ПК</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={draftArtUrl ?? ''}
                    onChange={(e) => setDraftArtUrl(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <label className="block">
                  <span className={labelCls}>Лор и биография</span>
                  <textarea
                    rows={3}
                    value={draftChar.lore ?? ''}
                    onChange={(e) =>
                      setDraftChar({ ...draftChar, lore: e.target.value })
                    }
                    className={inputCls}
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className={labelCls}>
                      Сильные стороны (каждая с новой строки)
                    </span>
                    <textarea
                      rows={4}
                      value={draftChar.strengths ? draftChar.strengths.join('\n') : ''}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          strengths: e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className={inputCls}
                    />
                  </label>

                  <label className="block">
                    <span className={labelCls}>
                      Слабые стороны (каждая с новой строки)
                    </span>
                    <textarea
                      rows={4}
                      value={draftChar.weaknesses ? draftChar.weaknesses.join('\n') : ''}
                      onChange={(e) =>
                        setDraftChar({
                          ...draftChar,
                          weaknesses: e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* ПОДВКЛАДКА 2: ОРУЖИЕ И ЭХО */}
            {editorSubTab === 'gear' && (
              <div className="space-y-6 animate-fade-in">
                {/* Секция Оружия */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-accent-light flex items-center gap-2">
                      <Swords size={15} />
                      <span>Рекомендуемое оружие ({draftChar.weapons?.length ?? 0})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftChar({
                          ...draftChar,
                          weapons: [
                            ...(draftChar.weapons ?? []),
                            {
                              name: 'Новое оружие',
                              passive: 'Описание пассивного эффекта',
                              isBest: false,
                              rank: (draftChar.weapons?.length ?? 0) + 1,
                            },
                          ] as any[],
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/20 text-accent-light text-xs font-extrabold cursor-pointer"
                    >
                      <Plus size={14} /> Добавить оружие
                    </button>
                  </div>

                  {draftChar.weapons?.map((w: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-black/40 border border-white/[0.07] space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <input
                          value={w.name ?? ''}
                          onChange={(e) => {
                            const next = [...draftChar.weapons];
                            next[idx] = { ...w, name: e.target.value };
                            setDraftChar({ ...draftChar, weapons: next });
                          }}
                          placeholder="Название оружия"
                          className={`${inputCls} sm:col-span-2`}
                        />
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#090b12] border border-white/12 text-xs text-gray-300 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(w.isBest)}
                              onChange={(e) => {
                                const next = [...draftChar.weapons];
                                next[idx] = { ...w, isBest: e.target.checked };
                                setDraftChar({ ...draftChar, weapons: next });
                              }}
                            />
                            <span>Топ</span>
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setDraftChar({
                                ...draftChar,
                                weapons: draftChar.weapons.filter((_: any, i: number) => i !== idx),
                              })
                            }
                            className="p-2 text-gray-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <input
                        value={w.passive ?? ''}
                        onChange={(e) => {
                          const next = [...draftChar.weapons];
                          next[idx] = { ...w, passive: e.target.value };
                          setDraftChar({ ...draftChar, weapons: next });
                        }}
                        placeholder="Описание пассивки оружия"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>

                {/* Секция Эхо-наборов */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-accent-light flex items-center gap-2">
                      <Layers size={15} />
                      <span>Наборы Эхо ({draftChar.echoSets?.length ?? 0})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftChar({
                          ...draftChar,
                          echoSets: [
                            ...(draftChar.echoSets ?? []),
                            {
                              name: 'Новый набор Эхо (5pc)',
                              cost4: 'Главное Эхо Cost 4',
                              description: 'Описание бонуса 2pc и 5pc',
                              substats: ['Crit Rate', 'Crit DMG', 'ATK%'],
                            },
                          ] as any[],
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/20 text-accent-light text-xs font-extrabold cursor-pointer"
                    >
                      <Plus size={14} /> Добавить сет Эхо
                    </button>
                  </div>

                  {draftChar.echoSets?.map((es: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-black/40 border border-white/[0.07] space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          value={es.name ?? ''}
                          onChange={(e) => {
                            const next = [...draftChar.echoSets];
                            next[idx] = { ...es, name: e.target.value };
                            setDraftChar({ ...draftChar, echoSets: next });
                          }}
                          placeholder="Название сета (Frosty Resolve)"
                          className={inputCls}
                        />
                        <input
                          value={es.cost4 ?? ''}
                          onChange={(e) => {
                            const next = [...draftChar.echoSets];
                            next[idx] = { ...es, cost4: e.target.value };
                            setDraftChar({ ...draftChar, echoSets: next });
                          }}
                          placeholder="Главное Эхо (Cost 4)"
                          className={inputCls}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setDraftChar({
                                ...draftChar,
                                echoSets: draftChar.echoSets.filter((_: any, i: number) => i !== idx),
                              })
                            }
                            className="p-2 text-gray-500 hover:text-rose-400 cursor-pointer ml-auto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <input
                        value={es.description ?? ''}
                        onChange={(e) => {
                          const next = [...draftChar.echoSets];
                          next[idx] = { ...es, description: e.target.value };
                          setDraftChar({ ...draftChar, echoSets: next });
                        }}
                        placeholder="Эффект набора"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ПОДВКЛАДКА 3: НАВЫКИ И СОЗВЕЗДИЯ S1–S6 */}
            {editorSubTab === 'skills' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-accent-light">
                      Навыки резонатора ({draftChar.skills?.length ?? 0})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftChar({
                          ...draftChar,
                          skills: [
                            ...(draftChar.skills ?? []),
                            {
                              type: 'Skill',
                              name: 'Новый навык',
                              description: 'Описание механики навыка',
                            },
                          ] as any[],
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent/20 text-accent-light text-xs font-extrabold cursor-pointer"
                    >
                      <Plus size={14} /> Добавить навык
                    </button>
                  </div>

                  {draftChar.skills?.map((sk: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.07] space-y-2.5 animate-fade-in"
                    >
                      <div className="flex gap-2.5">
                        <select
                          value={sk.type}
                          onChange={(e) => {
                            const next = [...draftChar.skills];
                            next[idx] = { ...sk, type: e.target.value as any };
                            setDraftChar({ ...draftChar, skills: next });
                          }}
                          className="bg-[#090b12] border border-white/12 rounded-xl px-3 py-2 text-xs font-bold text-accent-light focus-ring"
                        >
                          <option value="Basic">Basic</option>
                          <option value="Skill">Skill</option>
                          <option value="Forte">Forte</option>
                          <option value="Liberation">Liberation</option>
                          <option value="Intro">Intro</option>
                          <option value="Outro">Outro</option>
                        </select>
                        <input
                          value={sk.name ?? ''}
                          onChange={(e) => {
                            const next = [...draftChar.skills];
                            next[idx] = { ...sk, name: e.target.value };
                            setDraftChar({ ...draftChar, skills: next });
                          }}
                          placeholder="Название навыка"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraftChar({
                              ...draftChar,
                              skills: draftChar.skills.filter((_: any, i: number) => i !== idx),
                            })
                          }
                          className="p-2 text-gray-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={sk.description ?? ''}
                        onChange={(e) => {
                          const next = [...draftChar.skills];
                          next[idx] = { ...sk, description: e.target.value };
                          setDraftChar({ ...draftChar, skills: next });
                        }}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>

                {/* Резонансные цепи S1–S6 */}
                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-300">
                      Резонансные цепи S1–S6 ({draftChar.constellations?.length ?? 0})
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftChar({
                          ...draftChar,
                          constellations: [
                            ...(draftChar.constellations ?? []),
                            {
                              name: `Цепь S${(draftChar.constellations?.length ?? 0) + 1}`,
                              description: 'Описание бонуса созвездия',
                            },
                          ] as any[],
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-extrabold cursor-pointer"
                    >
                      <Plus size={14} /> Добавить цепь
                    </button>
                  </div>

                  {draftChar.constellations?.map((con: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.07] space-y-2 animate-fade-in"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-[#09090b] text-xs font-black select-none">
                          S{idx + 1}
                        </span>
                        <input
                          value={con.name ?? ''}
                          onChange={(e) => {
                            const next = [...draftChar.constellations];
                            next[idx] = { ...con, name: e.target.value };
                            setDraftChar({ ...draftChar, constellations: next });
                          }}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraftChar({
                              ...draftChar,
                              constellations: draftChar.constellations.filter(
                                (_: any, i: number) => i !== idx,
                              ),
                            })
                          }
                          className="p-2 text-gray-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={con.description ?? ''}
                        onChange={(e) => {
                          const next = [...draftChar.constellations];
                          next[idx] = { ...con, description: e.target.value };
                          setDraftChar({ ...draftChar, constellations: next });
                        }}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ПОДВКЛАДКА 4: РОТАЦИЯ, КОМАНДЫ И РЕСУРСЫ */}
            {editorSubTab === 'teams' && (
              <div className="space-y-5 animate-fade-in">
                <label className="block">
                  <span className={labelCls}>
                    Пошаговая ротация (каждый шаг с новой строки)
                  </span>
                  <textarea
                    rows={5}
                    value={
                      draftChar.rotation
                        ? draftChar.rotation
                            .map((r: any) => (typeof r === 'string' ? r : (r.description ?? r.step ?? '')))
                            .join('\n')
                        : ''
                    }
                    onChange={(e) =>
                      setDraftChar({
                        ...draftChar,
                        rotation: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean)
                          .map((str) => ({ step: str, description: str })),
                      })
                    }
                    className={inputCls}
                  />
                </label>

                <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className={labelCls}>Материалы вознесения</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftChar({
                          ...draftChar,
                          materials: [
                            ...(draftChar.materials ?? []),
                            { type: 'Ascension', name: 'Новый материал', count: '46' },
                          ] as any[],
                        })
                      }
                      className="text-xs font-extrabold text-accent-light hover:underline cursor-pointer"
                    >
                      + Добавить ресурс
                    </button>
                  </div>

                  {draftChar.materials?.map((m: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 animate-fade-in">
                      <select
                        value={m.type}
                        onChange={(e) => {
                          const next = [...draftChar.materials];
                          next[idx] = { ...m, type: e.target.value as any };
                          setDraftChar({ ...draftChar, materials: next });
                        }}
                        className={inputCls}
                      >
                        <option value="Ascension">Босс (boss)</option>
                        <option value="Forte">Недельный (weekly)</option>
                        <option value="Skill">Цветок (flower)</option>
                        <option value="Forte">Оружие/Форте (forgery)</option>
                        <option value="Skill">Враги (enemy)</option>
                        <option value="Forte">Кредиты (credits)</option>
                      </select>
                      <input
                        value={m.name ?? ''}
                        onChange={(e) => {
                          const next = [...draftChar.materials];
                          next[idx] = { ...m, name: e.target.value };
                          setDraftChar({ ...draftChar, materials: next });
                        }}
                        placeholder="Название материала"
                        className={`${inputCls} sm:col-span-2`}
                      />
                      <div className="flex gap-2">
                        <input
                          value={m.count ?? ''}
                          onChange={(e) => {
                            const next = [...draftChar.materials];
                            next[idx] = { ...m, count: e.target.value };
                            setDraftChar({ ...draftChar, materials: next });
                          }}
                          placeholder="Кол-во"
                          className={inputCls}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraftChar({
                              ...draftChar,
                              materials: draftChar.materials.filter((_: any, i: number) => i !== idx),
                            })
                          }
                          className="p-2 text-gray-500 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ПОДВКЛАДКА 5: RAW JSON */}
            {editorSubTab === 'json' && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-xs text-gray-400">
                  Прямое редактирование JSON-структуры персонажа «{draftChar.name}»:
                </p>
                <textarea
                  rows={22}
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  className="w-full bg-[#07080d] border border-white/15 rounded-2xl p-4 text-xs font-mono text-ivory leading-relaxed focus-ring"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================================
          МОДУЛЬ 3: УПРАВЛЕНИЕ БЕСТИАРИЕМ (163+ МАТЕРИАЛА)
         ================================================================================= */}
      {mainTab === 'bestiary' && (
        <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-6 items-start">
          {/* Форма быстрого создания предмета */}
          <div className="glass-panel p-6 space-y-4 animate-fade-in">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Plus size={17} className="text-accent-light" />
              <span>Быстрое добавление в Бестиарий</span>
            </h3>

            <label className="block">
              <span className={labelCls}>Категория</span>
              <select
                value={newBestiaryItem.category}
                onChange={(e) =>
                  setNewBestiaryItem({ ...newBestiaryItem, category: e.target.value })
                }
                className={inputCls}
              >
                <option value="Материалы">Материалы</option>
                <option value="Оружие">Оружие</option>
                <option value="Эхо">Эхо</option>
                <option value="Враги">Враги</option>
              </select>
            </label>

            <label className="block">
              <span className={labelCls}>Название</span>
              <input
                value={newBestiaryItem.name}
                onChange={(e) =>
                  setNewBestiaryItem({ ...newBestiaryItem, name: e.target.value })
                }
                placeholder="Например: Blazing Brilliance"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className={labelCls}>Редкость</span>
              <select
                value={newBestiaryItem.rarity}
                onChange={(e) =>
                  setNewBestiaryItem({
                    ...newBestiaryItem,
                    rarity: Number(e.target.value),
                  })
                }
                className={inputCls}
              >
                <option value={5}>5★ (Золотой)</option>
                <option value={4}>4★ (Фиолетовый)</option>
                <option value={3}>3★ (Синий)</option>
                <option value={2}>2★ (Зелёный)</option>
              </select>
            </label>

            <label className="block">
              <span className={labelCls}>Ссылка на иконку / картинку</span>
              <input
                value={newBestiaryItem.image}
                onChange={(e) =>
                  setNewBestiaryItem({ ...newBestiaryItem, image: e.target.value })
                }
                placeholder="https://..."
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className={labelCls}>Источник добычи</span>
              <input
                value={newBestiaryItem.source}
                onChange={(e) =>
                  setNewBestiaryItem({ ...newBestiaryItem, source: e.target.value })
                }
                placeholder="Ивентовый баннер / Босс"
                className={inputCls}
              />
            </label>

            <label className="block">
              <span className={labelCls}>Описание</span>
              <textarea
                rows={3}
                value={newBestiaryItem.description}
                onChange={(e) =>
                  setNewBestiaryItem({
                    ...newBestiaryItem,
                    description: e.target.value,
                  })
                }
                className={inputCls}
              />
            </label>

            <button
              type="button"
              onClick={handleAddBestiaryEntry}
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-black cursor-pointer disabled:opacity-50"
            >
              Добавить в Бестиарий
            </button>

            <button
              type="button"
              onClick={handleSync163Materials}
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-accent-light flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CloudUpload size={15} />
              <span>Выгрузить все 163 материала в Supabase</span>
            </button>
          </div>

          {/* Список записей в Бестиарии */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-black text-white">
                Все записи Бестиария ({allBestiaryMerged.length})
              </h3>
              <input
                type="text"
                value={bestiarySearch}
                onChange={(e) => setBestiarySearch(e.target.value)}
                placeholder="Быстрый фильтр по названию..."
                className="bg-[#090b12] border border-white/12 rounded-xl px-3.5 py-2 text-xs text-ivory w-64"
              />
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {allBestiaryMerged
                .filter((x: any) =>
                  x.name?.toLowerCase().includes(bestiarySearch.toLowerCase()),
                )
                .slice(0, 120)
                .map((item: any) => (
                  <div
                    key={`${item.category}-${item.id}`}
                    className="p-3 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-between gap-3 animate-fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0 bg-[#121520]"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {item.category} · {item.rarity ?? 4}★
                        </p>
                      </div>
                    </div>
                    {item.id < 9000 && token && (
                      <button
                        type="button"
                        onClick={async () => {
                          await apiDeleteBestiary(token, item.id);
                          setBestiaryEntries((prev) =>
                            prev.filter((x) => x.id !== item.id),
                          );
                        }}
                        className="p-2 text-gray-500 hover:text-rose-400 shrink-0 cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================================
          МОДУЛЬ 4: CMS НОВОСТЕЙ И ГАЙДОВ
         ================================================================================= */}
      {mainTab === 'cms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fade-in">
          {/* Редактор Новостей */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Newspaper size={18} className="text-accent-light" />
              <span>Публикация Новостей ({newsList.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={newNews.title}
                onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                placeholder="Заголовок новости"
                className={inputCls}
              />
              <select
                value={newNews.category}
                onChange={(e) =>
                  setNewNews({ ...newNews, category: e.target.value as any })
                }
                className={inputCls}
              >
                <option value="Обновление">Обновление</option>
                <option value="Баннер">Баннер</option>
                <option value="Ивент">Ивент</option>
                <option value="Система">Система</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={newNews.summary}
              onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
              placeholder="Краткий текст новости..."
              className={inputCls}
            />

            <button
              type="button"
              onClick={handleAddNews}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-black cursor-pointer hover:brightness-105"
            >
              Опубликовать новость
            </button>

            <div className="space-y-2 pt-3 border-t border-white/[0.08]">
              {newsList.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-black/40 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{n.title}</p>
                    <p className="text-[10px] text-gray-400">
                      {n.category} · {n.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteNews(n.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Редактор Гайдов */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen size={18} className="text-accent-light" />
              <span>Публикация Гайдов ({guidesList.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={newGuide.title}
                onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                placeholder="Название гайда"
                className={inputCls}
              />
              <select
                value={newGuide.category}
                onChange={(e) =>
                  setNewGuide({ ...newGuide, category: e.target.value as any })
                }
                className={inputCls}
              >
                <option value="Новичкам">Новичкам</option>
                <option value="Боевая механика">Боевая механика</option>
                <option value="Эхо и Билды">Эхо и Билды</option>
                <option value="Эндгейм">Эндгейм</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={newGuide.content}
              onChange={(e) => setNewGuide({ ...newGuide, content: e.target.value })}
              placeholder="Содержание и ключевые советы гайда..."
              className={inputCls}
            />

            <button
              type="button"
              onClick={handleAddGuide}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-black cursor-pointer hover:brightness-105"
            >
              Опубликовать гайд
            </button>

            <div className="space-y-2 pt-3 border-t border-white/[0.08]">
              {guidesList.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-black/40 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{g.title}</p>
                    <p className="text-[10px] text-gray-400">
                      {g.category} · Автор: {g.author}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteGuide(g.id)}
                    className="p-1.5 text-gray-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================================
          МОДУЛЬ 5: БАЗА ДАННЫХ И РЕЗЕРВНОЕ КОПИРОВАНИЕ
         ================================================================================= */}
      {mainTab === 'database' && (
        <div className="glass-panel p-6 sm:p-8 space-y-5 animate-fade-in">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Database size={20} className="text-accent-light" />
              <span>Резервное копирование и синхронизация базы</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Скачай полный JSON-слепок всех созданных персонажей, билдов, новостей и гайдов или синхронизируй базу с облаком Supabase
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportFullBackupJson}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs sm:text-sm font-black shadow-lg cursor-pointer hover:brightness-105"
            >
              <Download size={16} />
              <span>Скачать полный JSON-бэкап админки</span>
            </button>

            <button
              type="button"
              onClick={handleSync163Materials}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs sm:text-sm font-bold text-ivory cursor-pointer disabled:opacity-50"
            >
              <CloudUpload size={16} className="text-accent-light" />
              <span>Синхронизировать все 163 материала с Supabase</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};