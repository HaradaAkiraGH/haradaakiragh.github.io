// Бестиарий Соларис-3 (Полный редизайн полок и карточек + встроенный каталог всех материалов до патча 3.7):
// 1) Коллекционные обложки категорий с мини-витриной предметов и разбивкой по редкости
// 2) Автоматическое слияние встроенной базы материалов с серверной базой Supabase
// 3) Фильтрация по подкатегориям материалов, редкости (2★–5★) и кнопка синхронизации в Supabase для админа
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Archive,
  AlertCircle,
  Tag,
  RefreshCw,
  ArrowLeft,
  Sparkles,
  Swords,
  Skull,
  Gem,
  CloudUpload,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  apiGetBestiary,
  apiCreateBestiary,
  apiUpdateBestiary,
  apiDeleteBestiary,
  BestiaryEntry,
} from '../utils/api';
import {
  BUILTIN_MATERIALS,
  getBuiltinMaterialsAsEntries,
} from '../data/materialsCatalog';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

interface PropRow {
  k: string;
  v: string;
}

interface FormState {
  id: number | null;
  category: string;
  name: string;
  rarity: string;
  description: string;
  image: string;
  tags: string;
  props: PropRow[];
}

const EMPTY_FORM: FormState = {
  id: null,
  category: 'Материалы',
  name: '',
  rarity: '4',
  description: '',
  image: '',
  tags: '',
  props: [{ k: 'Источник', v: '' }],
};

const entryToForm = (e: BestiaryEntry): FormState => ({
  id: e.id,
  category: e.category,
  name: e.name,
  rarity: e.rarity === null ? '' : String(e.rarity),
  description: e.description,
  image: e.image ?? '',
  tags: e.tags,
  props: Object.entries(e.props ?? {}).map(([k, v]) => ({ k, v: String(v) })),
});

/* Курируемые обложки и описания для главных полок Бестиария */
const CATEGORY_META: Record<
  string,
  {
    subtitle: string;
    bannerGrad: string;
    borderGlow: string;
    accentText: string;
    icon: any;
    coverArt: string;
  }
> = {
  Материалы: {
    subtitle:
      'Боссы вознесения, диковинки Соларис-3, еженедельные трофеи Форте, руда и ядра врагов (патч 3.7)',
    bannerGrad: 'from-amber-500/25 via-[#1c1610] to-[#0a0b10]',
    borderGlow: 'hover:border-amber-400/50',
    accentText: 'text-amber-300',
    icon: Gem,
    coverArt:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80',
  },
  Оружие: {
    subtitle:
      'Сигнатурные и альтернативные клинки, тяжёлые мечи, пистолеты, перчатки и резонаторы',
    bannerGrad: 'from-rose-500/25 via-[#1f1018] to-[#0a0b10]',
    borderGlow: 'hover:border-rose-400/50',
    accentText: 'text-rose-300',
    icon: Swords,
    coverArt:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',
  },
  Эхо: {
    subtitle:
      'Поглощённые частоты Тасет-дискордов (Cost 4 / 3 / 1) и сонатные эффекты сетов',
    bannerGrad: 'from-cyan-500/25 via-[#0e1b26] to-[#0a0b10]',
    borderGlow: 'hover:border-cyan-400/50',
    accentText: 'text-cyan-300',
    icon: Sparkles,
    coverArt:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80',
  },
  Враги: {
    subtitle:
      'Мировые боссы, элитные Тасет-дискорды, Фрацидус и противники Голограмм',
    bannerGrad: 'from-purple-500/25 via-[#191129] to-[#0a0b10]',
    borderGlow: 'hover:border-purple-400/50',
    accentText: 'text-purple-300',
    icon: Skull,
    coverArt:
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=900&q=80',
  },
};

const RARITY_SLOT_STYLE: Record<number, { bg: string; border: string; badge: string }> = {
  5: {
    bg: 'from-amber-500/25 via-amber-900/15 to-[#0b0d14]',
    border: 'border-amber-400/45 group-hover:border-amber-300',
    badge: 'bg-amber-400 text-[#09090b]',
  },
  4: {
    bg: 'from-purple-500/25 via-purple-900/15 to-[#0b0d14]',
    border: 'border-purple-400/40 group-hover:border-purple-300',
    badge: 'bg-purple-500 text-white',
  },
  3: {
    bg: 'from-sky-500/25 via-sky-900/15 to-[#0b0d14]',
    border: 'border-sky-400/40 group-hover:border-sky-300',
    badge: 'bg-sky-500 text-[#09090b]',
  },
  2: {
    bg: 'from-emerald-500/20 via-emerald-900/15 to-[#0b0d14]',
    border: 'border-emerald-400/35 group-hover:border-emerald-300',
    badge: 'bg-emerald-500 text-[#09090b]',
  },
};

/* Иконка предмета в слоте инвентаря (object-contain, без обрезки краёв) */
const BestiaryItemIcon = ({
  entry,
  size = 'md',
}: {
  entry: BestiaryEntry;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [entry.image]);

  const rStyle = RARITY_SLOT_STYLE[entry.rarity ?? 4] ?? RARITY_SLOT_STYLE[4];
  const dims =
    size === 'lg'
      ? 'w-24 h-24 rounded-2xl p-3'
      : size === 'sm'
      ? 'w-11 h-11 rounded-xl p-1.5'
      : 'w-16 h-16 rounded-2xl p-2';

  return (
    <div
      className={`relative ${dims} bg-gradient-to-br ${rStyle.bg} border ${rStyle.border} flex items-center justify-center shrink-0 overflow-hidden shadow-inner transition-colors`}
    >
      {entry.image && !failed ? (
        <img
          src={entry.image}
          alt={entry.name}
          onError={() => setFailed(true)}
          className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-110"
          draggable={false}
        />
      ) : (
        <span className="text-base font-black text-accent-light">
          {entry.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
};

const MATERIAL_SUBCATEGORIES = [
  'all',
  'Вознесение (Боссы)',
  'Диковинки мира',
  'Еженедельные боссы',
  'Оружие и Форте',
  'Дроп с врагов',
  'Опыт и Валюта',
] as const;

const inputClass =
  'w-full bg-bg-secondary border border-glass-border rounded-xl px-3.5 py-2.5 text-sm text-ivory focus-ring';
const labelClass = 'block text-xs font-bold text-gray-300 mb-1.5';

export const BestiaryPage = () => {
  useDocumentMeta({
    title: 'Бестиарий и Архив Материалов — Stellar Wiki',
    description:
      'Полная база предметов Wuthering Waves (патч 3.7): все материалы вознесения, боссы, цветы, оружие, эхо и враги.',
  });

  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [serverEntries, setServerEntries] = useState<BestiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | 5 | 4 | 3 | 2>('all');
  const [search, setSearch] = useState('');

  const [detail, setDetail] = useState<BestiaryEntry | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGetBestiary();
      setServerEntries(r.entries ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить серверный бестиарий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Объединяем серверные записи с нашей полной встроенной базой материалов (без дублей по имени)
  const allEntries = useMemo(() => {
    const builtin = getBuiltinMaterialsAsEntries();
    const existingNames = new Set(
      serverEntries.map((e) => `${e.category.toLowerCase()}|${e.name.toLowerCase()}`),
    );
    const merged = [...serverEntries];
    for (const b of builtin) {
      const key = `${b.category.toLowerCase()}|${b.name.toLowerCase()}`;
      if (!existingNames.has(key)) {
        merged.push(b);
      }
    }
    return merged;
  }, [serverEntries]);

  // Группировка по категориям для витрины полок
  const shelves = useMemo(() => {
    const map = new Map<string, BestiaryEntry[]>();
    for (const item of allEntries) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    const order = ['Материалы', 'Оружие', 'Эхо', 'Враги'];
    const keys = [...new Set([...order, ...map.keys()])].filter(
      (k) => (map.get(k)?.length ?? 0) > 0,
    );
    return keys.map((cat) => {
      const items = map.get(cat) ?? [];
      const fives = items.filter((i) => i.rarity === 5).length;
      const fours = items.filter((i) => i.rarity === 4).length;
      return {
        category: cat,
        count: items.length,
        fives,
        fours,
        samples: items.slice(0, 4),
      };
    });
  }, [allEntries]);

  // Фильтрация записей внутри выбранной категории (или при глобальном поиске)
  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allEntries.filter((e) => {
      if (activeCategory && e.category !== activeCategory) return false;
      if (rarityFilter !== 'all' && e.rarity !== rarityFilter) return false;
      if (
        activeCategory === 'Материалы' &&
        subFilter !== 'all' &&
        e.props?.['Подкатегория'] !== subFilter
      ) {
        return false;
      }
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.toLowerCase().includes(q) ||
        Object.values(e.props ?? {}).some((v) => String(v).toLowerCase().includes(q))
      );
    });
  }, [allEntries, activeCategory, rarityFilter, subFilter, search]);

  const syncMaterialsToSupabase = async () => {
    if (!token || !isAdmin) return;
    setBusy(true);
    setSyncStatus('Синхронизация материалов с базой Supabase...');
    try {
      const existingNames = new Set(
        serverEntries
          .filter((e) => e.category === 'Материалы')
          .map((e) => e.name.toLowerCase()),
      );
      const toUpload = BUILTIN_MATERIALS.filter(
        (m) => !existingNames.has(m.name.toLowerCase()),
      );

      let uploaded = 0;
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
        uploaded++;
      }
      await load();
      setSyncStatus(
        uploaded > 0
          ? `Успешно записано в БД Supabase: ${uploaded} новых материалов!`
          : 'Все материалы уже синхронизированы с БД Supabase.',
      );
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (e) {
      setSyncStatus(e instanceof Error ? e.message : 'Ошибка синхронизации');
    } finally {
      setBusy(false);
    }
  };

  const saveForm = async () => {
    if (!form || !token) return;
    if (!form.category.trim() || !form.name.trim()) {
      setMsg('Категория и название обязательны');
      return;
    }
    setBusy(true);
    setMsg(null);
    const props: Record<string, string> = {};
    form.props.forEach((p) => {
      if (p.k.trim()) props[p.k.trim()] = p.v;
    });
    const payload = {
      category: form.category.trim(),
      name: form.name.trim(),
      rarity: form.rarity === '' ? null : Number(form.rarity),
      description: form.description,
      image: form.image.trim() || null,
      tags: form.tags,
      props,
    };
    try {
      if (form.id === null || form.id >= 9000) {
        await apiCreateBestiary(token, payload);
      } else {
        await apiUpdateBestiary(token, form.id, payload);
      }
      setForm(null);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Не удалось сохранить');
    } finally {
      setBusy(false);
    }
  };

  const removeEntry = async (id: number) => {
    if (!token) return;
    if (id >= 9000) {
      window.alert(
        'Это встроенный материал базового каталога. Ты можешь переопределить его через «Изменить».',
      );
      return;
    }
    if (!window.confirm('Удалить запись из базы? Это необратимо.')) return;
    setBusy(true);
    try {
      await apiDeleteBestiary(token, id);
      setDetail(null);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  const setProp = (i: number, patch: Partial<PropRow>) =>
    setForm((f) =>
      f ? { ...f, props: f.props.map((p, j) => (j === i ? { ...p, ...patch } : p)) } : f,
    );

  return (
    <div className="space-y-6 pb-10 w-full">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* ==================== ШАПКА БЕСТИАРИЯ ==================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent-light mb-1">
            <Sparkles size={13} />
            <span>БАЗА ДАННЫХ СОЛАРИС-3 · ПАТЧ 3.7</span>
            {loading && (
              <RefreshCw
                size={12}
                className="animate-spin text-accent-light ml-1"
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeCategory && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  setSubFilter('all');
                  setRarityFilter('all');
                }}
                className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-ivory transition-all"
                title="Вернуться ко всем полкам"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
              <Archive size={28} className="text-accent-light" />
              <span>{activeCategory ? `Архив: ${activeCategory}` : 'Бестиарий Соларис-3'}</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {activeCategory
              ? CATEGORY_META[activeCategory]?.subtitle ?? `Все записи категории «${activeCategory}»`
              : 'Интерактивное хранилище материалов вознесения, оружия, эхо и бестий Wuthering Waves'}
          </p>
        </div>

        {/* Кнопки администратора */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={syncMaterialsToSupabase}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-ivory transition-all focus-ring disabled:opacity-50"
                title="Записать все встроенные материалы в облачную таблицу bestiary"
              >
                <CloudUpload size={15} className="text-accent-light" />
                <span>Синхронизировать материалы в БД</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...EMPTY_FORM,
                    category: activeCategory || 'Материалы',
                    props: [{ k: 'Источник', v: '' }],
                  });
                  setMsg(null);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs sm:text-sm font-extrabold hover:brightness-105 transition-all focus-ring"
              >
                <Plus size={16} />
                <span>Добавить запись</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Уведомление синхронизации */}
      {syncStatus && (
        <div className="glass-panel px-4 py-3 flex items-center gap-2.5 border-emerald-400/40 text-emerald-200 text-xs font-bold">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-400 shrink-0" />
          <p className="text-xs text-gray-300 flex-1">
            Сервер временно недоступен ({error}) — отображается встроенный архив Соларис-3.
          </p>
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-xs hover:border-accent/40"
          >
            <RefreshCw size={13} /> Обновить
          </button>
        </div>
      )}

      {/* ==================== ПАНЕЛЬ ПОИСКА И БЫСТРОГО ПЕРЕКЛЮЧЕНИЯ ПОЛОК ==================== */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по названию материала, оружия, босса или имени персонажа (например: Camellya, Jinhsi, флогистон)..."
              className="pl-10 pr-9 py-2.5 bg-[#090a10] border border-white/12 rounded-xl text-sm text-ivory placeholder-gray-500 focus-ring w-full"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setSubFilter('all');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                activeCategory === null
                  ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] border-transparent shadow'
                  : 'bg-white/[0.04] border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              Все полки · {allEntries.length}
            </button>

            {shelves.map((sh) => (
              <button
                key={sh.category}
                type="button"
                onClick={() => {
                  setActiveCategory(sh.category);
                  setSubFilter('all');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                  activeCategory === sh.category
                    ? 'bg-accent/25 border-accent text-accent-light shadow-glow-sm'
                    : 'bg-white/[0.04] border-white/10 text-gray-300 hover:text-white'
                }`}
              >
                {sh.category} · {sh.count}
              </button>
            ))}
          </div>
        </div>

        {(activeCategory !== null || search.trim().length > 0) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            {activeCategory === 'Материалы' ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {MATERIAL_SUBCATEGORIES.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubFilter(sub)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      subFilter === sub
                        ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {sub === 'all' ? 'Все типы материалов' : sub}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 flex items-center gap-1.5">
                <Filter size={13} className="text-accent-light" />
                <span>Найдено предметов: {filteredEntries.length}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              {(['all', 5, 4, 3, 2] as const).map((r) => (
                <button
                  key={String(r)}
                  type="button"
                  onClick={() => setRarityFilter(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border transition-all ${
                    rarityFilter === r
                      ? 'bg-accent/25 border-accent text-accent-light'
                      : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {r === 'all' ? 'Все ★' : `${r}★`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ==================== РЕЖИМ 1: ВИТРИНА ПОЛОК КАТЕГОРИЙ ==================== */}
      {activeCategory === null && search.trim().length === 0 ? (
        <div className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {shelves.map((sh) => {
              const meta = CATEGORY_META[sh.category] ?? {
                subtitle: `Все предметы раздела «${sh.category}»`,
                bannerGrad: 'from-accent/25 via-[#171412] to-[#0a0b10]',
                borderGlow: 'hover:border-accent/50',
                accentText: 'text-accent-light',
                icon: Archive,
                coverArt:
                  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
              };
              const Icon = meta.icon;

              return (
                <button
                  key={sh.category}
                  type="button"
                  onClick={() => setActiveCategory(sh.category)}
                  className={`group relative rounded-3xl overflow-hidden border border-white/12 bg-[#0b0d14] text-left transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_55px_rgba(0,0,0,0.75)] ${meta.borderGlow} focus-ring`}
                >
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                    <img
                      src={meta.coverArt}
                      alt={sh.category}
                      className="w-full h-full object-cover object-center opacity-40 group-hover:scale-105 group-hover:opacity-55 transition-all duration-700"
                      draggable={false}
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${meta.bannerGrad} mix-blend-multiply`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d14] via-[#0b0d14]/65 to-transparent" />

                    <div className="absolute top-4 left-5 right-5 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-xs font-extrabold ${meta.accentText}`}
                      >
                        <Icon size={15} />
                        <span>Раздел архива</span>
                      </span>

                      <span className="px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-xs font-black text-white tabular-nums">
                        {sh.count} предм.
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-5 hidden sm:flex items-center -space-x-2">
                      {sh.samples.map((samp) => (
                        <div
                          key={samp.id}
                          className="w-12 h-12 rounded-2xl bg-[#0e1018]/95 border border-white/20 p-1.5 shadow-xl flex items-center justify-center group-hover:translate-y-[-2px] transition-transform"
                        >
                          {samp.image ? (
                            <img
                              src={samp.image}
                              alt=""
                              className="w-full h-full object-contain"
                              draggable={false}
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-accent-light">
                              {samp.name.slice(0, 2)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-4 left-5 right-5 sm:right-48">
                      <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-accent-light transition-colors">
                        {sh.category}
                      </h2>
                      <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                        {meta.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-[#0e1018] border-t border-white/[0.08] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      {sh.fives > 0 && (
                        <span className="text-amber-300 font-bold">5★: {sh.fives}</span>
                      )}
                      {sh.fours > 0 && (
                        <span className="text-purple-300 font-bold">4★: {sh.fours}</span>
                      )}
                      <span className="text-gray-400">Всего записей: {sh.count}</span>
                    </div>
                    <span className="font-extrabold text-accent-light group-hover:translate-x-1 transition-transform">
                      Открыть полку →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================== РЕЖИМ 2: СЕТКА ПРЕДМЕТОВ ВНУТРИ ПОЛКИ / ПОИСКА ==================== */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredEntries.map((e) => {
            const subcat = e.props?.['Подкатегория'] || e.category;
            const usedBy = e.props?.['Персонажи'] || e.props?.['Источник'] || '';

            return (
              <button
                key={`${e.category}-${e.id}`}
                type="button"
                onClick={() => setDetail(e)}
                className="group glass-panel-hover p-4 text-left flex items-start gap-3.5 focus-ring"
              >
                <BestiaryItemIcon entry={e} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent-light truncate">
                      {subcat}
                    </span>
                    {e.rarity !== null && (
                      <span className="text-amber-300 text-[11px] font-black shrink-0">
                        {'★'.repeat(e.rarity)}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-white group-hover:text-accent-light transition-colors line-clamp-1 mt-0.5">
                    {e.name}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                    {e.description}
                  </p>

                  {usedBy && (
                    <p className="text-[11px] text-gray-300/90 font-medium truncate mt-2 pt-1.5 border-t border-white/[0.06]">
                      <span className="text-gray-500">Инфо: </span>
                      {usedBy}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          {filteredEntries.length === 0 && (
            <div className="col-span-full glass-panel py-16 text-center space-y-2">
              <Archive size={36} className="text-gray-500 mx-auto" />
              <p className="text-base font-bold text-white">Записи не найдены</p>
              <p className="text-xs text-gray-400">
                Попробуй сбросить фильтр редкости или изменить поисковый запрос
              </p>
            </div>
          )}
        </div>
      )}

      {/* ==================== МОДАЛКА ДЕТАЛЬНОГО ПРОСМОТРА ПРЕДМЕТА ==================== */}
      <AnimatePresence>
        {detail && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-2xl p-6 sm:p-7 max-h-[86vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-start gap-4">
                <BestiaryItemIcon entry={detail} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-lg bg-accent/20 border border-accent/40 text-accent-light text-[11px] font-extrabold uppercase tracking-wider">
                      {detail.category}
                    </span>
                    {detail.rarity !== null && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black">
                        {'★'.repeat(detail.rarity)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                    {detail.name}
                  </h3>
                  {detail.tags && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
                      <Tag size={12} className="text-accent-light shrink-0" />
                      <span>{detail.tags}</span>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {detail.description && (
                <p className="text-sm text-gray-200 leading-relaxed bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                  {detail.description}
                </p>
              )}

              {Object.keys(detail.props ?? {}).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(detail.props).map(([k, v]) => (
                    <div
                      key={k}
                      className="p-3.5 rounded-2xl bg-[#090a10]/80 border border-white/10"
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {k}
                      </span>
                      <span className="block text-sm font-bold text-ivory mt-1">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {isAdmin && (
                <div className="flex flex-wrap justify-end gap-2.5 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(entryToForm(detail));
                      setDetail(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-ivory"
                  >
                    <Pencil size={14} />
                    <span>Изменить</span>
                  </button>
                  {detail.id < 9000 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(detail.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-xs font-bold text-rose-300"
                    >
                      <Trash2 size={14} />
                      <span>Удалить</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== МОДАЛКА СОЗДАНИЯ / РЕДАКТИРОВАНИЯ (ДЛЯ АДМИНА) ==================== */}
      <AnimatePresence>
        {form && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setForm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-2xl p-6 sm:p-7 max-h-[88vh] overflow-y-auto space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-extrabold text-white">
                  {form.id === null ? 'Новая запись Бестиария' : 'Редактировать запись'}
                </h3>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {msg && (
                <p className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-xs text-rose-200">
                  {msg}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className={labelClass}>Категория</span>
                  <input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Материалы / Оружие / Эхо / Враги"
                    className={inputClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>Название</span>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Например: Topological Confinement"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className={labelClass}>Редкость</span>
                  <select
                    value={form.rarity}
                    onChange={(e) => setForm({ ...form, rarity: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Без редкости</option>
                    <option value="2">2★ (Зелёный)</option>
                    <option value="3">3★ (Синий)</option>
                    <option value="4">4★ (Фиолетовый)</option>
                    <option value="5">5★ (Золотой)</option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>URL иконки / картинки</span>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://... или /images/..."
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className={labelClass}>Описание</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputClass}
                />
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={labelClass}>Характеристики (ключ — значение)</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, props: [...form.props, { k: '', v: '' }] })
                    }
                    className="text-xs font-bold text-accent-light hover:underline"
                  >
                    + Добавить свойство
                  </button>
                </div>
                {form.props.map((p, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      value={p.k}
                      onChange={(e) => setProp(idx, { k: e.target.value })}
                      placeholder="Свойство (Источник)"
                      className={inputClass}
                    />
                    <input
                      value={p.v}
                      onChange={(e) => setProp(idx, { v: e.target.value })}
                      placeholder="Значение (Босс: Fallacy of No Return)"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          props: form.props.filter((_, j) => j !== idx),
                        })
                      }
                      className="p-2 text-gray-500 hover:text-rose-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <label className="block">
                <span className={labelClass}>Теги для поиска (через запятую)</span>
                <input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className={inputClass}
                />
              </label>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-xs font-bold text-gray-300"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={saveForm}
                  disabled={busy}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-extrabold"
                >
                  {busy ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};