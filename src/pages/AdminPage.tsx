// Командный центр Администратора Stellar Wiki (Solaris-3 Root Terminal):
// 1) Вкладка «Главная (Плитки)»: добавление новых горизонтальных панелек на домашнюю страницу,
//    редактирование заголовка, бейджа, описания, ссылки, загрузка картинки с ПК и живое превью
//    с плавным растворением картинки влево на 50% ширины
// 2) Интерактивное перемещение картинки мышкой + ползунки X%, Y% и Масштаб% для всех 3 форматов героев
// 3) Редактирование мета-позиции Prydwen (T0–T3), % пользы оружия, наборов Эхо, статов Lv.90 и Команд
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
  Image as ImageIcon,
  Move,
  ArrowUp,
  ArrowDown,
  Users,
  LayoutGrid,
  ArrowUpRight,
} from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { IMAGES } from '../data/images';
import { ELEMENTS, WEAPON_LABELS } from '../utils/constants';
import type {
  ElementType,
  WeaponType,
  CharacterRole,
} from '../data/types';
import {
  PRYDWEN_CHAR_META,
  PrydwenTier,
  PrydwenRoleCol,
} from '../data/prydwenMeta';
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
  getCharacterArtUrls,
  saveCharacterArtBundle,
  CHARACTER_ICONS,
  CHARACTER_SPLASHES,
  CHARACTER_ART_TRANSFORMS,
  CharacterArtTransforms,
  DEFAULT_ART_TRANSFORMS,
  ArtPosition,
  syncAdminContentToRuntime,
  getAdminNews,
  saveAdminNews,
  getAdminGuides,
  saveAdminGuides,
  AdminNewsItem,
  AdminGuideItem,
  getHomeTiles,
  saveHomeTiles,
  resetHomeTiles,
  HomeTileItem,
  HOME_TILES_CLOUD_ID,
} from '../utils/adminStorage';
import {
  BUILTIN_MATERIALS,
  getBuiltinMaterialsAsEntries,
} from '../data/materialsCatalog';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const ROLES: CharacterRole[] = [
  'Main DPS',
  'Sub DPS',
  'Support',
  'Healer',
  'Defender',
];

const PRYDWEN_TIERS: PrydwenTier[] = ['T0', 'T0.5', 'T1', 'T1.5', 'T2', 'T3'];
const PRYDWEN_COLUMNS: PrydwenRoleCol[] = [
  'Main DPS',
  'Hybrid / Sub DPS',
  'Support / Sustain',
];
const PRYDWEN_MECHANIC_TAGS = [
  'Bane',
  'Chafe',
  'Frazzle',
  'Erosion',
  'Burst',
  'Coord',
  'Amp',
  'Heal',
  'Shield',
  'AoE',
];
const TEAM_PRESET_TAGS = [
  'Hypercarry',
  'Quickswap',
  'Dual DPS',
  'F2P',
  'BiS',
  'Bane',
  'Chafe',
  'Frazzle',
  'Erosion',
  'Burst',
  'AoE',
];

function slugifyName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function compressImage(file: File, maxW: number, maxH: number): Promise<string> {
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
  stats: { hp: 12450, atk: 445, def: 1180, energyRegen: 120 },
  targetStats: [
    { name: 'Crit Rate', value: '70–80%', note: 'Приоритет' },
    { name: 'Crit DMG', value: '265–285%', note: 'С учётом базовых 150%' },
    { name: 'ATK', value: '2200–2450+', note: 'На 90 ур.' },
    { name: 'Energy Regen', value: '120–130%', note: 'Для ульты по КД' },
  ],
  skillPriority: [
    { name: 'Forte Circuit', priority: 5, level: '10' },
    { name: 'Resonance Liberation', priority: 5, level: '10' },
    { name: 'Resonance Skill', priority: 4, level: '8–10' },
  ],
  strengths: [
    'Огромный взрывной урон по одиночным и групповым целям',
    'Удобная ротация и высокая мобильность',
  ],
  weaknesses: ['Требует сигнатурное оружие для максимального потенциала'],
  echoSets: [
    {
      name: 'Midnight Veil (5pc)',
      cost4: 'Nightmare: Impermanence Heron',
      costLayout: '4-3-3-1-1',
      cost4Main: 'Crit Rate / Crit DMG',
      cost3Main: 'Havoc DMG% / Havoc DMG%',
      cost1Main: 'ATK% / ATK%',
      substatsPriority: 'Crit Rate = Crit DMG > ATK% > Energy Regen > Basic Attack DMG%',
      description: '+10% Havoc DMG и бонус при смене резонатора',
      substats: ['Crit Rate', 'Crit DMG', 'ATK%', 'Energy Regen'],
    },
  ],
  weapons: [
    {
      name: 'Сигнатурный клинок 5★',
      stat: 'Crit DMG 48.6%',
      percent: 100,
      passive: 'Увеличивает атаку на 12% и бонус основного урона на 48%.',
      isBest: true,
      rank: 1,
      note: 'BiS (Сигнатурное)',
    },
  ],
  teams: [
    {
      name: 'Премиум Гиперкерри',
      priority: 1,
      tags: ['Hypercarry', 'BiS', 'Bane'],
      members: ['camellya', 'roccia', 'shorekeeper'],
      note: 'Максимальный урон под баффами Roccia и Shorekeeper.',
    },
  ],
  materials: [
    { type: 'Ascension', name: 'Topological Confinement', count: '46' },
    { type: 'Forte', name: 'Dreamless Feather', count: '26' },
    { type: 'Ascension', name: 'Nova', count: '60' },
    { type: 'Skill', name: 'Heterized Metallic Drip', count: '67' },
    { type: 'Skill', name: 'FF Whisperin Core', count: '61' },
    { type: 'Forte', name: 'Shell Credits', count: '2 200 000' },
  ],
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
  ],
  constellations: [
    { name: 'Цепь S1', description: 'Повышает шанс крит. удара и устойчивость к прерыванию.' },
    { name: 'Цепь S2', description: 'Увеличивает множитель взрывного урона на 40%.' },
    { name: 'Цепь S3', description: 'Увеличивает уровень ультимейта и навыка.' },
    { name: 'Цепь S4', description: 'Даёт 25% бонус к урону всей команде при активации ульты.' },
    { name: 'Цепь S5', description: 'Повышает уровень базовой атаки и контура Форте.' },
    { name: 'Цепь S6', description: 'Открывает финальную форму с игнорированием 40% защиты врагов.' },
  ],
  metaRating: { tower: 'S', realm: 'S' },
  prydwenMeta: {
    toa: 'T0' as PrydwenTier,
    wastes: 'T0' as PrydwenTier,
    column: 'Main DPS' as PrydwenRoleCol,
    tags: ['Bane', 'AoE'],
  },
});

const inputCls =
  'w-full bg-[#090b12]/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ivory focus-ring';
const labelCls =
  'block text-[11px] font-extrabold uppercase tracking-wider text-gray-400 mb-1.5';

/* Интерактивный слот одного формата картинки с перетаскиванием мышкой и ползунками X / Y / Scale */
const DraggableArtSlot = ({
  title,
  subtitle,
  badgeColor,
  aspectClass,
  imageUrl,
  fallbackUrl,
  pos,
  onChangeUrl,
  onChangePos,
  onResetPos,
  maxW,
  maxH,
}: {
  title: string;
  subtitle: string;
  badgeColor: string;
  aspectClass: string;
  imageUrl: string;
  fallbackUrl?: string;
  pos: ArtPosition;
  onChangeUrl: (url: string) => void;
  onChangePos: (next: ArtPosition) => void;
  onResetPos: () => void;
  maxW: number;
  maxH: number;
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  }>({ active: false, startX: 0, startY: 0, origX: 50, origY: 20 });

  const displaySrc = imageUrl || fallbackUrl || '';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, maxW, maxH);
      onChangeUrl(dataUrl);
    } catch {
      // игнорируем
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!displaySrc) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const nextX = Math.max(0, Math.min(100, Math.round(dragRef.current.origX - dx * 0.45)));
    const nextY = Math.max(0, Math.min(100, Math.round(dragRef.current.origY - dy * 0.45)));
    onChangePos({ ...pos, x: nextX, y: nextY });
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // игнорируем
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-black/45 border border-white/[0.08] flex flex-col justify-between gap-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-xs font-extrabold block ${badgeColor}`}>
            {title}
          </span>
          <span className="text-[11px] text-gray-400">{subtitle}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onResetPos}
            className="px-2 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-[10px] font-bold text-gray-300 cursor-pointer"
          >
            Сброс
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-[11px] font-extrabold shrink-0 cursor-pointer"
          >
            <Upload size={11} />
            <span>Файл</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-xl bg-[#07080d] border border-white/10 p-2 flex flex-col items-center justify-center">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className={`relative overflow-hidden rounded-xl border border-white/15 bg-[#0e1018] select-none cursor-grab active:cursor-grabbing ${aspectClass}`}
        >
          {displaySrc ? (
            <img
              src={displaySrc}
              alt={title}
              draggable={false}
              style={{
                objectPosition: `${pos.x}% ${pos.y}%`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
                transform: `scale(${pos.scale / 100})`,
              }}
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <span className="text-[11px] text-gray-500 flex items-center justify-center h-full px-3 text-center">
              Загрузи картинку
            </span>
          )}
        </div>
        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-gray-400">
          <Move size={11} className="text-accent-light" />
          <span>Зажми мышкой для сдвига ракурса</span>
        </span>
      </div>

      <div className="space-y-1.5 bg-[#090b12]/90 p-2.5 rounded-xl border border-white/[0.06] text-[10px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 w-20">Горизонт. X:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos.x}
            onChange={(e) => onChangePos({ ...pos, x: Number(e.target.value) })}
            className="flex-1 accent-[#caa07d] cursor-pointer"
          />
          <span className="font-mono text-ivory w-9 text-right">{pos.x}%</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 w-20">Вертикаль Y:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pos.y}
            onChange={(e) => onChangePos({ ...pos, y: Number(e.target.value) })}
            className="flex-1 accent-[#caa07d] cursor-pointer"
          />
          <span className="font-mono text-ivory w-9 text-right">{pos.y}%</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-gray-400 w-20">Масштаб:</span>
          <input
            type="range"
            min={80}
            max={200}
            value={pos.scale}
            onChange={(e) =>
              onChangePos({ ...pos, scale: Number(e.target.value) })
            }
            className="flex-1 accent-[#caa07d] cursor-pointer"
          />
          <span className="font-mono text-amber-300 w-9 text-right">
            {pos.scale}%
          </span>
        </div>
      </div>

      <input
        type="text"
        value={imageUrl}
        onChange={(e) => onChangeUrl(e.target.value)}
        placeholder="URL картинки (https://... или /images/...)"
        className={inputCls}
      />
    </div>
  );
};

const TripleArtUploader = ({
  cardUrl,
  iconUrl,
  splashUrl,
  transforms,
  onChangeCard,
  onChangeIcon,
  onChangeSplash,
  onChangeTransforms,
}: {
  cardUrl: string;
  iconUrl: string;
  splashUrl: string;
  transforms: CharacterArtTransforms;
  onChangeCard: (url: string) => void;
  onChangeIcon: (url: string) => void;
  onChangeSplash: (url: string) => void;
  onChangeTransforms: (next: CharacterArtTransforms) => void;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent-light">
        <ImageIcon size={15} />
        <span>
          3 формата графики персонажа + перемещение ракурса (зажми мышкой или крути ползунки)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DraggableArtSlot
          title="1. Большая карточка (3:4.5)"
          subtitle="Для каталога /characters"
          badgeColor="text-white"
          aspectClass="w-32 h-48"
          imageUrl={cardUrl}
          pos={transforms.card}
          onChangeUrl={onChangeCard}
          onChangePos={(card) => onChangeTransforms({ ...transforms, card })}
          onResetPos={() =>
            onChangeTransforms({
              ...transforms,
              card: { ...DEFAULT_ART_TRANSFORMS.card },
            })
          }
          maxW={720}
          maxH={1080}
        />

        <DraggableArtSlot
          title="2. Маленькая иконка (1:1)"
          subtitle="Для Меты /meta, круток и отрядов"
          badgeColor="text-amber-300"
          aspectClass="w-32 h-32 aspect-square"
          imageUrl={iconUrl}
          fallbackUrl={cardUrl}
          pos={transforms.icon}
          onChangeUrl={onChangeIcon}
          onChangePos={(icon) => onChangeTransforms({ ...transforms, icon })}
          onResetPos={() =>
            onChangeTransforms({
              ...transforms,
              icon: { ...DEFAULT_ART_TRANSFORMS.icon },
            })
          }
          maxW={360}
          maxH={360}
        />

        <DraggableArtSlot
          title="3. Горизонтальный арт (16:9)"
          subtitle="Баннер внутри /characters/:id"
          badgeColor="text-cyan-300"
          aspectClass="w-full h-36"
          imageUrl={splashUrl}
          fallbackUrl={cardUrl}
          pos={transforms.splash}
          onChangeUrl={onChangeSplash}
          onChangePos={(splash) =>
            onChangeTransforms({ ...transforms, splash })
          }
          onResetPos={() =>
            onChangeTransforms({
              ...transforms,
              splash: { ...DEFAULT_ART_TRANSFORMS.splash },
            })
          }
          maxW={1400}
          maxH={780}
        />
      </div>
    </div>
  );
};

export const AdminPage = () => {
  useDocumentMeta({
    title: 'Root-Терминал Администратора — Stellar Wiki',
    description:
      'Панель управления Stellar Wiki: редактор плиток Главной страницы, позиционирование артов, мета T0–T3, оружие, Эхо и команды.',
  });

  const { token, user } = useAuth();

  const [mainTab, setMainTab] = useState<
    'home-tiles' | 'edit-char' | 'create-char' | 'bestiary' | 'cms' | 'database'
  >('home-tiles');

  const [refreshTick, setRefreshTick] = useState(0);
  const [statusMsg, setStatusMsg] = useState<{
    type: 'ok' | 'err';
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const notify = (type: 'ok' | 'err', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  /* ==================== СОСТОЯНИЕ ВКЛАДКИ «ГЛАВНАЯ (ПЛИТКИ)» ==================== */
  const [homeTiles, setHomeTilesState] = useState<HomeTileItem[]>(() =>
    getHomeTiles(),
  );
  const tileFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingTileIdx, setUploadingTileIdx] = useState<number | null>(null);

  /* ==================== СОСТОЯНИЕ ВКЛАДКИ СОЗДАНИЯ НОВОГО ПЕРСОНАЖА ==================== */
  const [newChar, setNewChar] = useState<any>(() => createEmptyCharacter());
  const [newCardUrl, setNewCardUrl] = useState<string>('/images/Camellya_Card.webp');
  const [newIconUrl, setNewIconUrl] = useState<string>('');
  const [newSplashUrl, setNewSplashUrl] = useState<string>('');
  const [newTransforms, setNewTransforms] = useState<CharacterArtTransforms>(
    () => JSON.parse(JSON.stringify(DEFAULT_ART_TRANSFORMS)),
  );
  const [autoSlug, setAutoSlug] = useState(true);

  /* ==================== СОСТОЯНИЕ ВКЛАДКИ РЕДАКТОРА СУЩЕСТВУЮЩИХ ГЕРОЕВ ==================== */
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
  const [draftCardUrl, setDraftCardUrl] = useState<string>('');
  const [draftIconUrl, setDraftIconUrl] = useState<string>('');
  const [draftSplashUrl, setDraftSplashUrl] = useState<string>('');
  const [draftTransforms, setDraftTransforms] = useState<CharacterArtTransforms>(
    () => JSON.parse(JSON.stringify(DEFAULT_ART_TRANSFORMS)),
  );
  const [rawJsonText, setRawJsonText] = useState<string>('');
  const [customTeamTagInput, setCustomTeamTagInput] = useState<string>('');

  const [serverEdits, setServerEdits] = useState<
    Record<string, Record<string, unknown>>
  >({});

  /* ==================== СОСТОЯНИЕ БЕСТИАРИЯ И CMS ==================== */
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

  useEffect(() => {
    apiGetCharacterOverrides()
      .then((r: any) => {
        const map: Record<string, Record<string, unknown>> = {};
        if (Array.isArray(r?.overrides)) {
          for (const item of r.overrides) {
            const cid = item.characterId || item.character_id || item.id;
            if (cid) map[cid] = item.data || item.patch || item;
          }
        } else if (r?.edits) {
          Object.assign(map, r.edits);
        }
        setServerEdits(map);
        syncAdminContentToRuntime(map);
        setHomeTilesState(getHomeTiles());
        setRefreshTick((t: number) => t + 1);
      })
      .catch((_: any) => {});

    apiGetBestiary()
      .then((r: any) => setBestiaryEntries(r.entries ?? []))
      .catch((_: any) => {});
  }, []);

  useEffect(() => {
    const found = CHARACTERS.find((c) => c.id === selectedCharId);
    if (!found) return;
    const cloned = JSON.parse(JSON.stringify(found)) as any;
    const artBundle = getCharacterArtUrls(found.id);
    const prydwen = PRYDWEN_CHAR_META[found.id];

    if (!cloned.prydwenMeta) {
      cloned.prydwenMeta = {
        toa: prydwen?.toa ?? 'T0.5',
        wastes: prydwen?.wastes ?? 'T0.5',
        column: prydwen?.column ?? 'Main DPS',
        tags: prydwen?.tags ? [...prydwen.tags] : [],
      };
    }
    if (!cloned.stats) {
      cloned.stats = {
        hp: cloned.rarity === 5 ? 12450 : 10800,
        atk: cloned.rarity === 5 ? 435 : 375,
        def: cloned.rarity === 5 ? 1180 : 1040,
        energyRegen: 120,
      };
    }
    if (!Array.isArray(cloned.targetStats) || cloned.targetStats.length === 0) {
      cloned.targetStats = [
        { name: 'Crit Rate', value: '70–80%', note: 'Приоритет' },
        { name: 'Crit DMG', value: '260–285%', note: 'С учётом базовых 150%' },
        { name: 'ATK', value: '2150–2450+', note: 'На 90 ур.' },
        { name: 'Energy Regen', value: '120–130%', note: 'Ульта по КД' },
      ];
    }

    setDraftChar(cloned);
    setDraftCardUrl(artBundle.card);
    setDraftIconUrl(artBundle.icon);
    setDraftSplashUrl(artBundle.splash);
    setDraftTransforms(artBundle.transforms);
    setRawJsonText(JSON.stringify(cloned, null, 2));
  }, [selectedCharId, refreshTick]);

  const customCharsList = useMemo(() => getCustomCharacters(), [refreshTick]);
  const localOverridesMap = useMemo(() => getLocalCharOverrides(), [refreshTick]);
  const allBestiaryMerged = useMemo(() => {
    const builtin = getBuiltinMaterialsAsEntries();
    return [...bestiaryEntries, ...builtin];
  }, [bestiaryEntries]);

  /* ==================== ОБРАБОТЧИКИ ПЛИТОК ГЛАВНОЙ СТРАНИЦЫ ==================== */
  const handleAddHomeTile = () => {
    const newTile: HomeTileItem = {
      id: `tile-${Date.now()}`,
      title: 'Новая панелька раздела',
      badge: 'РАЗДЕЛ СОЛАРИС-3',
      description: 'Описание раздела или инструмента, которое будет отображаться на Главной странице.',
      path: '/characters',
      image: '/images/Camellya_Card.webp',
      imagePosX: 50,
      imagePosY: 25,
      imageScale: 105,
    };
    setHomeTilesState((prev) => [...prev, newTile]);
  };

  const handleUpdateHomeTile = (idx: number, patch: Partial<HomeTileItem>) => {
    setHomeTilesState((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    );
  };

  const handleMoveHomeTile = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= homeTiles.length) return;
    const copy = [...homeTiles];
    const tmp = copy[idx];
    copy[idx] = copy[target];
    copy[target] = tmp;
    setHomeTilesState(copy);
  };

  const handleDeleteHomeTile = (idx: number) => {
    setHomeTilesState((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUploadHomeTileImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || uploadingTileIdx === null) return;
    try {
      const dataUrl = await compressImage(file, 960, 640);
      handleUpdateHomeTile(uploadingTileIdx, { image: dataUrl });
    } catch {
      notify('err', 'Не удалось загрузить картинку для плитки');
    } finally {
      setUploadingTileIdx(null);
      e.target.value = '';
    }
  };

  const handleSaveAllHomeTiles = async () => {
    setBusy(true);
    try {
      saveHomeTiles(homeTiles);
      if (token) {
        await apiSaveCharacterOverride(token, HOME_TILES_CLOUD_ID, {
          tiles: homeTiles,
          updatedAt: new Date().toISOString(),
        });
      }
      notify(
        'ok',
        `Все ${homeTiles.length} плиток Главной страницы успешно сохранены и обновлены!`,
      );
    } catch (e: any) {
      notify(
        'err',
        e instanceof Error
          ? `Сохранено локально, ошибка облака: ${e.message}`
          : 'Ошибка сохранения плиток',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleResetAllHomeTiles = async () => {
    if (!window.confirm('Вернуть стандартные 6 плиток Главной страницы?')) return;
    const defaults = resetHomeTiles();
    setHomeTilesState(defaults);
    if (token) {
      await apiDeleteCharacterOverride(token, HOME_TILES_CLOUD_ID).catch(
        (_: any) => {},
      );
    }
    notify('ok', 'Плитки Главной страницы сброшены к стандартным');
  };

  /* ==================== ОБРАБОТЧИКИ ПЕРСОНАЖЕЙ ==================== */
  const handleNewCharNameChange = (name: string) => {
    const nextId = autoSlug ? slugifyName(name) || 'new-resonator' : newChar.id;
    setNewChar((prev: any) => ({ ...prev, name, id: nextId }));
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

      saveCharacterArtBundle(cleanId, {
        card: newCardUrl.trim(),
        icon: newIconUrl.trim(),
        splash: newSplashUrl.trim(),
        transforms: newTransforms,
      });

      const existingCustom = getCustomCharacters().filter((c) => c.id !== cleanId);
      saveCustomCharacters([finalChar, ...existingCustom]);

      if (token) {
        await apiSaveCharacterOverride(token, cleanId, {
          ...(finalChar as unknown as Record<string, unknown>),
          __cardImage: newCardUrl.trim(),
          __iconImage: newIconUrl.trim(),
          __splashImage: newSplashUrl.trim(),
          __artTransforms: newTransforms,
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
      setNewIconUrl('');
      setNewSplashUrl('');
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

      saveCharacterArtBundle(toSave.id, {
        card: draftCardUrl,
        icon: draftIconUrl,
        splash: draftSplashUrl,
        transforms: draftTransforms,
      });

      const fullPayload = {
        ...toSave,
        __cardImage: draftCardUrl,
        __iconImage: draftIconUrl,
        __splashImage: draftSplashUrl,
        __artTransforms: draftTransforms,
      };
      saveLocalCharOverride(toSave.id, fullPayload);

      const customList = getCustomCharacters();
      if (customList.some((c) => c.id === toSave.id)) {
        saveCustomCharacters(
          customList.map((c) => (c.id === toSave.id ? fullPayload : c)),
        );
      }

      if (token) {
        await apiSaveCharacterOverride(
          token,
          toSave.id,
          fullPayload as Record<string, unknown>,
        );
        setServerEdits((prev) => ({
          ...prev,
          [toSave.id]: fullPayload as Record<string, unknown>,
        }));
      }

      setRefreshTick((t) => t + 1);
      notify(
        'ok',
        `Все изменения для «${toSave.name}» успешно сохранены!`,
      );
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

  const moveTeamPriority = (idx: number, dir: -1 | 1) => {
    const list = Array.isArray(draftChar.teams) ? [...draftChar.teams] : [];
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    const reindexed = list.map((t: any, i: number) => ({
      ...t,
      priority: i + 1,
    }));
    setDraftChar({ ...draftChar, teams: reindexed });
  };

  /* ==================== ОБРАБОТЧИКИ БЕСТИАРИЯ И CMS ==================== */
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

  const exportFullBackupJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      homeTiles,
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

  const previewNewChar = useMemo<any>(() => {
    const previewId = slugifyName(newChar.id || newChar.name) || 'new-resonator';
    if (newCardUrl) IMAGES[previewId] = newCardUrl;
    if (newIconUrl) CHARACTER_ICONS[previewId] = newIconUrl;
    if (newSplashUrl) CHARACTER_SPLASHES[previewId] = newSplashUrl;
    CHARACTER_ART_TRANSFORMS[previewId] = newTransforms;
    return {
      ...newChar,
      id: previewId,
    };
  }, [newChar, newCardUrl, newIconUrl, newSplashUrl, newTransforms]);

  return (
    <div className="space-y-6 pb-12 w-full animate-fade-in">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* Скрытый инпут для загрузки картинки плитки Главной */}
      <input
        ref={tileFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadHomeTileImage}
        className="hidden"
      />

      {/* ==================== ШАПКА КОМАНДНОГО ЦЕНТРА АДМИНА ==================== */}
      <div className="glass-panel relative overflow-hidden p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-pill text-amber-300 text-[11px] font-black uppercase tracking-widest mb-2.5">
              <ShieldCheck size={14} />
              <span>SOLARIS-3 ROOT TERMINAL · LIQUID GLASS EDITION</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Панель управления Stellar Wiki
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Редактор плиток Главной страницы, 3 форматов артов с перемещением, меты T0–T3, Эхо, оружия и команд
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl liquid-pill text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-300 block">
                Плиток Главной
              </span>
              <strong className="text-2xl font-black text-amber-300 tabular-nums mt-0.5 block">
                {homeTiles.length}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl liquid-pill text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-300 block">
                Резонаторов
              </span>
              <strong className="text-2xl font-black text-white tabular-nums mt-0.5 block">
                {CHARACTERS.length}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl liquid-pill text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-300 block">
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
            <div className="p-3.5 rounded-2xl liquid-pill text-center min-w-[115px]">
              <span className="text-[10px] font-bold uppercase text-gray-300 block">
                В Бестиарии
              </span>
              <strong className="text-2xl font-black text-emerald-300 tabular-nums mt-0.5 block">
                {allBestiaryMerged.length}
              </strong>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/[0.1]">
          {(
            [
              { id: 'home-tiles', label: 'Главная (Плитки)', icon: LayoutGrid },
              { id: 'edit-char', label: 'Конструктор героев (61+)', icon: Sliders },
              { id: 'create-char', label: '+ Создать персонажа', icon: UserPlus },
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] shadow-lg'
                    : 'liquid-pill text-gray-200 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

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
          МОДУЛЬ 0: РЕДАКТОР ПЛИТОК ДОМАШНЕЙ СТРАНИЦЫ (Задача 3)
         ================================================================================= */}
      {mainTab === 'home-tiles' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.1]">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <LayoutGrid size={22} className="text-accent-light" />
                  <span>Горизонтальные плитки на Главной странице ({homeTiles.length})</span>
                </h2>
                <p className="text-xs text-gray-300 mt-1">
                  Добавляй новые панельки, меняй заголовки, описания, ссылки и картинки. Картинка занимает правую половину плитки и плавно растворяется влево.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAddHomeTile}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl liquid-pill text-xs font-extrabold text-amber-200 hover:text-white cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Добавить панельку</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAllHomeTiles}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-xs font-bold text-rose-200 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Сбросить</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAllHomeTiles}
                  disabled={busy}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs sm:text-sm font-black shadow-lg hover:brightness-105 cursor-pointer disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{busy ? 'Сохранение...' : 'Сохранить плитки Главной'}</span>
                </button>
              </div>
            </div>

            {/* Список всех редактируемых плиток с живым превью */}
            <div className="space-y-6">
              {homeTiles.map((tile, idx) => {
                const posX = tile.imagePosX ?? 50;
                const posY = tile.imagePosY ?? 30;
                const scale = tile.imageScale ?? 105;

                return (
                  <div
                    key={tile.id}
                    className="p-5 rounded-3xl bg-black/40 border border-white/12 grid grid-cols-1 xl:grid-cols-[1fr,480px] gap-6 items-center"
                  >
                    {/* Левая часть: поля редактирования плитки */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-amber-400 text-[#09090b] text-xs font-black">
                            Плитка #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleMoveHomeTile(idx, -1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 disabled:opacity-30 cursor-pointer"
                            title="Переместить выше"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveHomeTile(idx, 1)}
                            disabled={idx === homeTiles.length - 1}
                            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 disabled:opacity-30 cursor-pointer"
                            title="Переместить ниже"
                          >
                            <ArrowDown size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteHomeTile(idx)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-bold cursor-pointer"
                        >
                          <Trash2 size={14} />
                          <span>Удалить</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="block">
                          <span className={labelCls}>Заголовок плитки</span>
                          <input
                            type="text"
                            value={tile.title}
                            onChange={(e) =>
                              handleUpdateHomeTile(idx, { title: e.target.value })
                            }
                            placeholder="Каталог Резонаторов"
                            className={inputCls}
                          />
                        </label>

                        <label className="block">
                          <span className={labelCls}>Верхний бейдж</span>
                          <input
                            type="text"
                            value={tile.badge}
                            onChange={(e) =>
                              handleUpdateHomeTile(idx, { badge: e.target.value })
                            }
                            placeholder="БАЗА ГЕРОЕВ"
                            className={inputCls}
                          />
                        </label>

                        <label className="block">
                          <span className={labelCls}>Ссылка при клике (URL)</span>
                          <input
                            type="text"
                            value={tile.path}
                            onChange={(e) =>
                              handleUpdateHomeTile(idx, { path: e.target.value })
                            }
                            placeholder="/characters или /bestiary"
                            className={`${inputCls} font-mono`}
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className={labelCls}>Описание внутри плитки</span>
                        <textarea
                          rows={2}
                          value={tile.description}
                          onChange={(e) =>
                            handleUpdateHomeTile(idx, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Подробное описание раздела..."
                          className={inputCls}
                        />
                      </label>

                      <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-2.5 items-end">
                        <label className="block">
                          <span className={labelCls}>
                            Картинка плитки (занимает 50% справа и плавно исчезает влево)
                          </span>
                          <input
                            type="text"
                            value={tile.image}
                            onChange={(e) =>
                              handleUpdateHomeTile(idx, { image: e.target.value })
                            }
                            placeholder="Вставь ссылку https://... или /images/... либо загрузи файл"
                            className={inputCls}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setUploadingTileIdx(idx);
                            tileFileInputRef.current?.click();
                          }}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-black shrink-0 cursor-pointer"
                        >
                          <Upload size={14} />
                          <span>Загрузить с ПК</span>
                        </button>
                      </div>

                      {/* Ползунки ракурса картинки в плитке */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#090b12]/80 border border-white/[0.06] text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 shrink-0">Сдвиг X:</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={posX}
                            onChange={(e) =>
                              handleUpdateHomeTile(idx, {
                                imagePosX: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-[#caa07d] cursor-pointer"
                          />
                          <span className="font-mono text-ivory w-8 text-right">
                            {posX}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 shrink-0">Сдвиг Y:</span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={posY}
                            onChange={(e) =>
                              handleUpdateHomeTile(idx, {
                                imagePosY: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-[#caa07d] cursor-pointer"
                          />
                          <span className="font-mono text-ivory w-8 text-right">
                            {posY}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 shrink-0">Зум:</span>
                          <input
                            type="range"
                            min={80}
                            max={180}
                            value={scale}
                            onChange={(e) =>
                              handleUpdateHomeTile(idx, {
                                imageScale: Number(e.target.value),
                              })
                            }
                            className="flex-1 accent-[#caa07d] cursor-pointer"
                          />
                          <span className="font-mono text-amber-300 w-9 text-right">
                            {scale}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Правая часть: ЖИВОЕ ПРЕВЬЮ ПЛИТКИ (1 в 1 как на Главной странице) */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                        Живое превью плитки (Liquid Glass + растворение влево):
                      </span>
                      <div className="glass-panel-hover relative overflow-hidden min-h-[195px] p-6 flex flex-col justify-between">
                        {tile.image && (
                          <div
                            aria-hidden="true"
                            className="pointer-events-none select-none absolute inset-y-0 right-0 w-1/2 overflow-hidden tile-image-fade-left"
                          >
                            <img
                              src={tile.image}
                              alt=""
                              draggable={false}
                              style={{
                                objectPosition: `${posX}% ${posY}%`,
                                transformOrigin: `${posX}% ${posY}%`,
                                transform: `scale(${scale / 100})`,
                              }}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c14] via-transparent to-transparent opacity-65" />
                          </div>
                        )}

                        <div className="relative z-10 max-w-[60%] space-y-2">
                          {tile.badge && (
                            <span className="inline-block px-3 py-1 rounded-full liquid-pill text-[10px] font-black uppercase tracking-[0.18em] text-accent-light">
                              {tile.badge}
                            </span>
                          )}
                          <h3 className="text-xl font-black text-white leading-snug">
                            {tile.title}
                          </h3>
                          <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                            {tile.description}
                          </p>
                        </div>

                        <div className="relative z-10 pt-3 flex items-center gap-1.5 text-xs font-extrabold text-accent-light">
                          <span>Открыть раздел</span>
                          <ArrowUpRight size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
                  Настрой 3 формата картинок с перетаскиванием ракурса, тиры T0–T3 и биографию
                </p>
              </div>
            </div>

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

            <TripleArtUploader
              cardUrl={newCardUrl}
              iconUrl={newIconUrl}
              splashUrl={newSplashUrl}
              transforms={newTransforms}
              onChangeCard={setNewCardUrl}
              onChangeIcon={setNewIconUrl}
              onChangeSplash={setNewSplashUrl}
              onChangeTransforms={setNewTransforms}
            />

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <label className="block">
                <span className={labelCls}>Мета ToA (T0–T3)</span>
                <select
                  value={newChar.prydwenMeta?.toa ?? 'T0'}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      prydwenMeta: {
                        ...newChar.prydwenMeta,
                        toa: e.target.value as PrydwenTier,
                      },
                    })
                  }
                  className={inputCls}
                >
                  {PRYDWEN_TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelCls}>Мета Wastes (T0–T3)</span>
                <select
                  value={newChar.prydwenMeta?.wastes ?? 'T0'}
                  onChange={(e) =>
                    setNewChar({
                      ...newChar,
                      prydwenMeta: {
                        ...newChar.prydwenMeta,
                        wastes: e.target.value as PrydwenTier,
                      },
                    })
                  }
                  className={inputCls}
                >
                  {PRYDWEN_TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
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
              <span className={labelCls}>Лор и биография резонатора</span>
              <textarea
                rows={4}
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

          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-accent-light flex items-center gap-1.5">
                <Sparkles size={14} />
                <span>Живое превью карточки</span>
              </span>
              <span className="text-[11px] font-mono text-gray-400">
                /characters/{previewNewChar.id}
              </span>
            </div>

            <div className="max-w-[250px] mx-auto">
              <CharacterCard character={previewNewChar} />
            </div>
          </div>
        </div>
      )}

      {/* =================================================================================
          МОДУЛЬ 2: ВИЗУАЛЬНЫЙ КОНСТРУКТОР СУЩЕСТВУЮЩИХ И НОВЫХ ПЕРСОНАЖЕЙ
         ================================================================================= */}
      {mainTab === 'edit-char' && (
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6 items-start">
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

            <div className="space-y-1 max-h-[620px] overflow-y-auto pr-1">
              {filteredSidebarChars.map((c) => {
                const isSelected = c.id === selectedCharId;
                const isCustom = customCharsList.some((x) => x.id === c.id);
                const isEdited =
                  Boolean(localOverridesMap[c.id]) || Boolean(serverEdits[c.id]);
                const pMeta = PRYDWEN_CHAR_META[c.id];

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
                      variant="icon"
                      className="w-9 h-9 aspect-square rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-extrabold truncate">{c.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {ELEMENTS[c.element].label} · {pMeta?.toa ?? 'T1'}
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

          <div className="glass-panel p-6 space-y-6 min-w-0 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3.5">
                <ImagePlaceholder
                  id={draftChar.id}
                  initials={draftChar.name ? draftChar.name.slice(0, 2) : 'RE'}
                  element={draftChar.element}
                  variant="icon"
                  className="w-14 h-14 aspect-square rounded-2xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-white">{draftChar.name}</h2>
                    <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono text-gray-300">
                      {draftChar.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-black">
                      {draftChar.prydwenMeta?.toa ?? 'T0'}
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
                  <span>Открыть карточку</span>
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
                  <span>{busy ? 'Сохранение...' : 'Сохранить изменения'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: 'general', label: '1. Ракурс 3 Артов, Мета (T0–T3) и Лор' },
                  { id: 'gear', label: `2. Оружие (% пользы), Эхо (Cost/Статы) и Lv.90` },
                  { id: 'teams', label: `3. Команды (${draftChar.teams?.length ?? 0}), Приоритет и Ресурсы` },
                  { id: 'skills', label: `4. Навыки (${draftChar.skills?.length ?? 0}) и Цепи S1–S6` },
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

            {editorSubTab === 'general' && (
              <div className="space-y-6 animate-fade-in">
                <TripleArtUploader
                  cardUrl={draftCardUrl}
                  iconUrl={draftIconUrl}
                  splashUrl={draftSplashUrl}
                  transforms={draftTransforms}
                  onChangeCard={setDraftCardUrl}
                  onChangeIcon={setDraftIconUrl}
                  onChangeSplash={setDraftSplashUrl}
                  onChangeTransforms={setDraftTransforms}
                />

                <div className="p-5 rounded-2xl bg-black/45 border border-amber-400/25 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <Sparkles size={15} />
                      <span>Позиция в Мете (Prydwen T0 — T3) и Боевые метки</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="block">
                      <span className={labelCls}>Ранг в Tower of Adversity</span>
                      <select
                        value={draftChar.prydwenMeta?.toa ?? 'T0.5'}
                        onChange={(e) =>
                          setDraftChar({
                            ...draftChar,
                            prydwenMeta: {
                              ...(draftChar.prydwenMeta ?? {}),
                              toa: e.target.value as PrydwenTier,
                            },
                          })
                        }
                        className={inputCls}
                      >
                        {PRYDWEN_TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={labelCls}>Ранг в Whimpering Wastes</span>
                      <select
                        value={draftChar.prydwenMeta?.wastes ?? 'T0.5'}
                        onChange={(e) =>
                          setDraftChar({
                            ...draftChar,
                            prydwenMeta: {
                              ...(draftChar.prydwenMeta ?? {}),
                              wastes: e.target.value as PrydwenTier,
                            },
                          })
                        }
                        className={inputCls}
                      >
                        {PRYDWEN_TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={labelCls}>Колонка роли в тир-листе</span>
                      <select
                        value={draftChar.prydwenMeta?.column ?? 'Main DPS'}
                        onChange={(e) =>
                          setDraftChar({
                            ...draftChar,
                            prydwenMeta: {
                              ...(draftChar.prydwenMeta ?? {}),
                              column: e.target.value as PrydwenRoleCol,
                            },
                          })
                        }
                        className={inputCls}
                      >
                        {PRYDWEN_COLUMNS.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div>
                    <span className={labelCls}>
                      Подписи механик под иконкой в тир-листе (кликни, чтобы включить/выключить)
                    </span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {PRYDWEN_MECHANIC_TAGS.map((tag) => {
                        const currentTags: string[] = Array.isArray(
                          draftChar.prydwenMeta?.tags,
                        )
                          ? draftChar.prydwenMeta.tags
                          : [];
                        const active = currentTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const nextTags = active
                                ? currentTags.filter((x) => x !== tag)
                                : [...currentTags, tag];
                              setDraftChar({
                                ...draftChar,
                                prydwenMeta: {
                                  ...(draftChar.prydwenMeta ?? {}),
                                  tags: nextTags,
                                },
                              });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase border transition-all cursor-pointer ${
                              active
                                ? 'bg-amber-400 text-[#09090b] border-amber-300 shadow'
                                : 'bg-white/[0.04] text-gray-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/[0.08]">
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

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                    <span className={labelCls}>Роль в карточке</span>
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
                </div>

                <label className="block">
                  <span className={labelCls}>
                    Лор и биография (отображается в верхнем облачке карточки персонажа и во вкладке «Лор»)
                  </span>
                  <textarea
                    rows={4}
                    value={draftChar.lore ?? ''}
                    onChange={(e) =>
                      setDraftChar({ ...draftChar, lore: e.target.value })
                    }
                    placeholder="Напиши описание и биографию резонатора..."
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

            {editorSubTab === 'gear' && (
              <div className="space-y-7 animate-fade-in">
                <div className="p-5 rounded-2xl bg-black/45 border border-white/10 space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-wider text-accent-light">
                    Базовые показатели на 90 ур. (от них работает ползунок 10–90 ур.)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <label className="block">
                      <span className={labelCls}>Базовое HP (Lv.90)</span>
                      <input
                        type="number"
                        value={draftChar.stats?.hp ?? 12450}
                        onChange={(e) =>
                          setDraftChar({
                            ...draftChar,
                            stats: {
                              ...(draftChar.stats ?? {}),
                              hp: Number(e.target.value),
                            },
                          })
                        }
                        className={inputCls}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Базовая ATK (Lv.90)</span>
                      <input
                        type="number"
                        value={draftChar.stats?.atk ?? 435}
                        onChange={(e) =>
                          setDraftChar({
                            ...draftChar,
                            stats: {
                              ...(draftChar.stats ?? {}),
                              atk: Number(e.target.value),
                            },
                          })
                        }
                        className={inputCls}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Базовая DEF (Lv.90)</span>
                      <input
                        type="number"
                        value={draftChar.stats?.def ?? 1180}
                        onChange={(e) =>
                          setDraftChar({
                            ...draftChar,
                            stats: {
                              ...(draftChar.stats ?? {}),
                              def: Number(e.target.value),
                            },
                          })
                        }
                        className={inputCls}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Базовый ER (%)</span>
                      <input
                        type="number"
                        value={draftChar.stats?.energyRegen ?? 120}
                        onChange={(e) =>
                          setDraftChar({
                            ...draftChar,
                            stats: {
                              ...(draftChar.stats ?? {}),
                              energyRegen: Number(e.target.value),
                            },
                          })
                        }
                        className={inputCls}
                      />
                    </label>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className={labelCls}>
                        Целевые показатели статов на 90 ур. (например: Crit Rate 70–80%)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftChar({
                            ...draftChar,
                            targetStats: [
                              ...(draftChar.targetStats ?? []),
                              { name: 'Новый стат', value: '100%', note: '' },
                            ],
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-accent/20 text-accent-light text-xs font-extrabold cursor-pointer"
                      >
                        <Plus size={13} /> Добавить целевой стат
                      </button>
                    </div>

                    {(draftChar.targetStats ?? []).map((ts: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input
                          value={ts.name || ts.stat || ''}
                          onChange={(e) => {
                            const next = [...(draftChar.targetStats ?? [])];
                            next[idx] = { ...ts, name: e.target.value, stat: e.target.value };
                            setDraftChar({ ...draftChar, targetStats: next });
                          }}
                          placeholder="Характеристика (Crit Rate)"
                          className={inputCls}
                        />
                        <input
                          value={ts.value ?? ''}
                          onChange={(e) => {
                            const next = [...(draftChar.targetStats ?? [])];
                            next[idx] = { ...ts, value: e.target.value };
                            setDraftChar({ ...draftChar, targetStats: next });
                          }}
                          placeholder="Значение (70–80%)"
                          className={inputCls}
                        />
                        <div className="flex gap-2">
                          <input
                            value={ts.note ?? ''}
                            onChange={(e) => {
                              const next = [...(draftChar.targetStats ?? [])];
                              next[idx] = { ...ts, note: e.target.value };
                              setDraftChar({ ...draftChar, targetStats: next });
                            }}
                            placeholder="Заметка (Приоритет)"
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDraftChar({
                                ...draftChar,
                                targetStats: draftChar.targetStats.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-accent-light flex items-center gap-2">
                      <Swords size={15} />
                      <span>Рекомендуемое оружие и % пользы ({draftChar.weapons?.length ?? 0})</span>
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
                              stat: 'Crit Rate 24.3%',
                              percent: 90,
                              passive: 'Описание пассивного эффекта',
                              isBest: false,
                              rank: (draftChar.weapons?.length ?? 0) + 1,
                              note: 'Альтернатива',
                            },
                          ],
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
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        <label className="block sm:col-span-4">
                          <span className={labelCls}>Название оружия</span>
                          <input
                            value={w.name ?? ''}
                            onChange={(e) => {
                              const next = [...draftChar.weapons];
                              next[idx] = { ...w, name: e.target.value };
                              setDraftChar({ ...draftChar, weapons: next });
                            }}
                            placeholder="Red Spring"
                            className={inputCls}
                          />
                        </label>

                        <label className="block sm:col-span-3">
                          <span className={labelCls}>Главный стат</span>
                          <input
                            value={w.stat ?? ''}
                            onChange={(e) => {
                              const next = [...draftChar.weapons];
                              next[idx] = { ...w, stat: e.target.value };
                              setDraftChar({ ...draftChar, weapons: next });
                            }}
                            placeholder="Crit Rate 24.3%"
                            className={inputCls}
                          />
                        </label>

                        <label className="block sm:col-span-2">
                          <span className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-300 mb-1.5">
                            % Пользы
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={150}
                            value={
                              typeof w.percent === 'number'
                                ? w.percent
                                : idx === 0
                                ? 100
                                : Math.max(70, 100 - idx * 8)
                            }
                            onChange={(e) => {
                              const next = [...draftChar.weapons];
                              next[idx] = {
                                ...w,
                                percent: Number(e.target.value),
                              };
                              setDraftChar({ ...draftChar, weapons: next });
                            }}
                            className={inputCls}
                          />
                        </label>

                        <div className="sm:col-span-3 flex items-center gap-2">
                          <input
                            value={w.note ?? ''}
                            onChange={(e) => {
                              const next = [...draftChar.weapons];
                              next[idx] = { ...w, note: e.target.value };
                              setDraftChar({ ...draftChar, weapons: next });
                            }}
                            placeholder="BiS / F2P"
                            className={inputCls}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setDraftChar({
                                ...draftChar,
                                weapons: draftChar.weapons.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              })
                            }
                            className="p-2.5 text-gray-500 hover:text-rose-400 cursor-pointer shrink-0"
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

                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-accent-light flex items-center gap-2">
                      <Layers size={15} />
                      <span>
                        Лучшие наборы Эхо: Схема Cost, Мейн-статы и Приоритет саб-статов ({draftChar.echoSets?.length ?? 0})
                      </span>
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
                              costLayout: '4-3-3-1-1',
                              cost4Main: 'Crit Rate / Crit DMG',
                              cost3Main: `${draftChar.element} DMG% / ATK%`,
                              cost1Main: 'ATK% / ATK%',
                              substatsPriority:
                                'Crit Rate = Crit DMG > ATK% > Energy Regen',
                              description: 'Описание бонуса 2pc и 5pc',
                              substats: ['Crit Rate', 'Crit DMG', 'ATK%'],
                            },
                          ],
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
                        <label className="block">
                          <span className={labelCls}>Название набора Эхо</span>
                          <input
                            value={es.name ?? ''}
                            onChange={(e) => {
                              const next = [...draftChar.echoSets];
                              next[idx] = { ...es, name: e.target.value };
                              setDraftChar({ ...draftChar, echoSets: next });
                            }}
                            placeholder="Sun-sinking Eclipse (5pc)"
                            className={inputCls}
                          />
                        </label>

                        <label className="block">
                          <span className={labelCls}>Главное Эхо в 1-м слоте (Cost 4)</span>
                          <input
                            value={es.cost4 ?? ''}
                            onChange={(e) => {
                              const next = [...draftChar.echoSets];
                              next[idx] = { ...es, cost4: e.target.value };
                              setDraftChar({ ...draftChar, echoSets: next });
                            }}
                            placeholder="Nightmare: Crownless"
                            className={inputCls}
                          />
                        </label>

                        <div className="flex items-end gap-2">
                          <label className="block flex-1">
                            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-300 mb-1.5">
                              Схема Cost
                            </span>
                            <input
                              value={es.costLayout ?? '4-3-3-1-1'}
                              onChange={(e) => {
                                const next = [...draftChar.echoSets];
                                next[idx] = { ...es, costLayout: e.target.value };
                                setDraftChar({ ...draftChar, echoSets: next });
                              }}
                              placeholder="4-3-3-1-1 или 4-4-1-1-1"
                              className={inputCls}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setDraftChar({
                                ...draftChar,
                                echoSets: draftChar.echoSets.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              })
                            }
                            className="p-2.5 text-gray-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="block">
                          <span className={labelCls}>Мейн-стат Cost 4</span>
                          <input
                            value={es.cost4Main ?? 'Crit Rate / Crit DMG'}
                            onChange={(e) => {
                              const next = [...draftChar.echoSets];
                              next[idx] = { ...es, cost4Main: e.target.value };
                              setDraftChar({ ...draftChar, echoSets: next });
                            }}
                            placeholder="Crit Rate / Crit DMG"
                            className={inputCls}
                          />
                        </label>

                        <label className="block">
                          <span className={labelCls}>Мейн-стат Cost 3</span>
                          <input
                            value={
                              es.cost3Main ?? `${draftChar.element} DMG% / ATK%`
                            }
                            onChange={(e) => {
                              const next = [...draftChar.echoSets];
                              next[idx] = { ...es, cost3Main: e.target.value };
                              setDraftChar({ ...draftChar, echoSets: next });
                            }}
                            placeholder="Havoc DMG% / ATK%"
                            className={inputCls}
                          />
                        </label>

                        <label className="block">
                          <span className={labelCls}>Мейн-стат Cost 1</span>
                          <input
                            value={es.cost1Main ?? 'ATK%'}
                            onChange={(e) => {
                              const next = [...draftChar.echoSets];
                              next[idx] = { ...es, cost1Main: e.target.value };
                              setDraftChar({ ...draftChar, echoSets: next });
                            }}
                            placeholder="ATK% / HP%"
                            className={inputCls}
                          />
                        </label>
                      </div>

                      <label className="block">
                        <span className={labelCls}>Приоритет саб-статов</span>
                        <input
                          value={
                            es.substatsPriority ??
                            (Array.isArray(es.substats)
                              ? es.substats.join(' > ')
                              : 'Crit Rate = Crit DMG > ATK% > Energy Regen')
                          }
                          onChange={(e) => {
                            const next = [...draftChar.echoSets];
                            next[idx] = {
                              ...es,
                              substatsPriority: e.target.value,
                            };
                            setDraftChar({ ...draftChar, echoSets: next });
                          }}
                          placeholder="Crit Rate = Crit DMG > ATK% > Basic Attack DMG% > ER%"
                          className={inputCls}
                        />
                      </label>

                      <label className="block">
                        <span className={labelCls}>Описание бонуса сета</span>
                        <input
                          value={es.description || es.effect || ''}
                          onChange={(e) => {
                            const next = [...draftChar.echoSets];
                            next[idx] = {
                              ...es,
                              description: e.target.value,
                              effect: e.target.value,
                            };
                            setDraftChar({ ...draftChar, echoSets: next });
                          }}
                          placeholder="Эффект набора 2pc / 5pc"
                          className={inputCls}
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {editorSubTab === 'teams' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-accent-light flex items-center gap-2">
                        <Users size={16} />
                        <span>
                          Команды персонажа, Метки и Приоритет ({draftChar.teams?.length ?? 0})
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400">
                        Добавляй отряды, выбирай 3 героев, ставь метки команды и меняй приоритет стрелками ↑ / ↓
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftChar({
                          ...draftChar,
                          teams: [
                            ...(draftChar.teams ?? []),
                            {
                              name: `Отряд #${(draftChar.teams?.length ?? 0) + 1}`,
                              priority: (draftChar.teams?.length ?? 0) + 1,
                              tags: ['Hypercarry'],
                              members: [draftChar.id, 'roccia', 'shorekeeper'],
                              note: 'Описание ротации и синергии команды',
                            },
                          ],
                        })
                      }
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-black cursor-pointer"
                    >
                      <Plus size={15} />
                      <span>Добавить команду</span>
                    </button>
                  </div>

                  {(draftChar.teams ?? []).map((team: any, idx: number) => {
                    const members: string[] = Array.isArray(team.members)
                      ? team.members
                      : [draftChar.id, '', ''];
                    const tags: string[] = Array.isArray(team.tags) ? team.tags : [];

                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-black/45 border border-white/10 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.07]">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-[#09090b] text-xs font-black">
                              Приоритет #{team.priority ?? idx + 1}
                            </span>

                            <button
                              type="button"
                              onClick={() => moveTeamPriority(idx, -1)}
                              disabled={idx === 0}
                              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveTeamPriority(idx, 1)}
                              disabled={idx === (draftChar.teams?.length ?? 1) - 1}
                              className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-gray-200 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>

                          <div className="flex-1 min-w-[220px]">
                            <input
                              value={team.name ?? ''}
                              onChange={(e) => {
                                const next = [...draftChar.teams];
                                next[idx] = { ...team, name: e.target.value };
                                setDraftChar({ ...draftChar, teams: next });
                              }}
                              placeholder="Название команды"
                              className={inputCls}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setDraftChar({
                                ...draftChar,
                                teams: draftChar.teams.filter(
                                  (_: any, i: number) => i !== idx,
                                ),
                              })
                            }
                            className="p-2 text-gray-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[0, 1, 2].map((slotIdx) => (
                            <label key={slotIdx} className="block">
                              <span className={labelCls}>
                                Слот {slotIdx + 1}{' '}
                                {slotIdx === 0
                                  ? '(Main DPS)'
                                  : slotIdx === 1
                                  ? '(Sub DPS / Amp)'
                                  : '(Support / Sustain)'}
                              </span>
                              <select
                                value={members[slotIdx] ?? ''}
                                onChange={(e) => {
                                  const nextMembers = [...members];
                                  nextMembers[slotIdx] = e.target.value;
                                  const nextTeams = [...draftChar.teams];
                                  nextTeams[idx] = {
                                    ...team,
                                    members: nextMembers,
                                  };
                                  setDraftChar({ ...draftChar, teams: nextTeams });
                                }}
                                className={inputCls}
                              >
                                <option value="">— Выбери резонатора —</option>
                                {CHARACTERS.map((ch) => (
                                  <option key={ch.id} value={ch.id}>
                                    {ch.name} ({ELEMENTS[ch.element].label})
                                  </option>
                                ))}
                              </select>
                            </label>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <span className={labelCls}>
                            Метки команды (кликни для выбора или добавь свою метку)
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {TEAM_PRESET_TAGS.map((tTag) => {
                              const active = tags.includes(tTag);
                              return (
                                <button
                                  key={tTag}
                                  type="button"
                                  onClick={() => {
                                    const nextTags = active
                                      ? tags.filter((x) => x !== tTag)
                                      : [...tags, tTag];
                                    const nextTeams = [...draftChar.teams];
                                    nextTeams[idx] = { ...team, tags: nextTags };
                                    setDraftChar({
                                      ...draftChar,
                                      teams: nextTeams,
                                    });
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all cursor-pointer ${
                                    active
                                      ? 'bg-accent/30 text-accent-light border-accent'
                                      : 'bg-white/[0.04] text-gray-400 border-white/10 hover:text-white'
                                  }`}
                                >
                                  {tTag}
                                </button>
                              );
                            })}

                            {tags
                              .filter((x) => !TEAM_PRESET_TAGS.includes(x))
                              .map((customT) => (
                                <button
                                  key={customT}
                                  type="button"
                                  onClick={() => {
                                    const nextTags = tags.filter(
                                      (x) => x !== customT,
                                    );
                                    const nextTeams = [...draftChar.teams];
                                    nextTeams[idx] = { ...team, tags: nextTags };
                                    setDraftChar({
                                      ...draftChar,
                                      teams: nextTeams,
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/40 cursor-pointer"
                                >
                                  {customT} ×
                                </button>
                              ))}
                          </div>

                          <div className="flex gap-2 max-w-sm pt-1">
                            <input
                              type="text"
                              value={customTeamTagInput}
                              onChange={(e) =>
                                setCustomTeamTagInput(e.target.value)
                              }
                              placeholder="Своя метка (например: S0R1)..."
                              className={inputCls}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = customTeamTagInput.trim();
                                if (!val) return;
                                const nextTags = tags.includes(val)
                                  ? tags
                                  : [...tags, val];
                                const nextTeams = [...draftChar.teams];
                                nextTeams[idx] = { ...team, tags: nextTags };
                                setDraftChar({ ...draftChar, teams: nextTeams });
                                setCustomTeamTagInput('');
                              }}
                              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white shrink-0 cursor-pointer"
                            >
                              + Метка
                            </button>
                          </div>
                        </div>

                        <label className="block">
                          <span className={labelCls}>
                            Описание синергии и ротации команды
                          </span>
                          <textarea
                            rows={2}
                            value={team.note || team.description || ''}
                            onChange={(e) => {
                              const next = [...draftChar.teams];
                              next[idx] = {
                                ...team,
                                note: e.target.value,
                                description: e.target.value,
                              };
                              setDraftChar({ ...draftChar, teams: next });
                            }}
                            placeholder="Как работает эта пачка..."
                            className={inputCls}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-4 border-t border-white/[0.08]">
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
                          ],
                        })
                      }
                      className="text-xs font-extrabold text-accent-light hover:underline cursor-pointer"
                    >
                      + Добавить ресурс
                    </button>
                  </div>

                  {draftChar.materials?.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 animate-fade-in"
                    >
                      <select
                        value={m.type}
                        onChange={(e) => {
                          const next = [...draftChar.materials];
                          next[idx] = { ...m, type: e.target.value as any };
                          setDraftChar({ ...draftChar, materials: next });
                        }}
                        className={inputCls}
                      >
                        <option value="Ascension">Босс / Диковинка (Ascension)</option>
                        <option value="Forte">Недельный / Форте (Forte)</option>
                        <option value="Skill">Навыки / Враги (Skill)</option>
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
                              materials: draftChar.materials.filter(
                                (_: any, i: number) => i !== idx,
                              ),
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
                          ],
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
                              skills: draftChar.skills.filter(
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
                          ],
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
              Скачай полный JSON-слепок всех созданных персонажей, плиток Главной, билдов, новостей и гайдов или синхронизируй базу с облаком Supabase
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
              className="flex items-center gap-2 px-5 py-3 rounded-xl liquid-pill text-xs sm:text-sm font-bold text-ivory cursor-pointer disabled:opacity-50"
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