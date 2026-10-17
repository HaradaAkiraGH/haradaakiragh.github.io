// Бестиарий: двухуровневая картотека (полки категорий + предметы).
// Мобильный вид: 2 колонки карточек, модалки-bottom-sheet.
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Search, X, Archive, AlertCircle, Tag, RefreshCw,
  Sword, Skull, Waves, Gem, UtensilsCrossed, Package, KeyRound, ArrowLeft,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  apiGetBestiary, apiCreateBestiary, apiUpdateBestiary, apiDeleteBestiary,
  apiCreateCategory, apiUpdateCategory, apiDeleteCategory,
  BestiaryEntry, BestiaryCategory,
} from '../utils/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const CATEGORY_ALIASES: { keys: string[]; icon: LucideIcon }[] = [
  { keys: ['оружие', 'weapon', 'weapons', 'пушки'], icon: Sword },
  { keys: ['враги', 'enemy', 'enemies', 'босс', 'боссы', 'boss', 'монстр', 'монстры'], icon: Skull },
  { keys: ['эхо', 'echo', 'echoes'], icon: Waves },
  { keys: ['материалы', 'material', 'ресурс', 'resource', 'камни'], icon: Gem },
  { keys: ['еда', 'food', 'кулинария', 'блюд', 'рецепт'], icon: UtensilsCrossed },
  { keys: ['предмет', 'item', 'расходник', 'инвентарь'], icon: Package },
  { keys: ['ключ', 'key', 'ключи'], icon: KeyRound },
];
const categoryIcon = (cat: string): LucideIcon => {
  const c = cat.toLowerCase();
  for (const a of CATEGORY_ALIASES) {
    if (a.keys.some((k) => c.includes(k))) return a.icon;
  }
  return Archive;
};

const PAGE_SIZE = 24;

interface PropRow { k: string; v: string; }
interface ItemForm {
  id: number | null;
  category: string;
  name: string;
  rarity: string;
  description: string;
  image: string;
  tags: string;
  props: PropRow[];
}
interface CatForm {
  id: number | null;
  name: string;
  image: string;
  description: string;
  sort: string;
}

const entryToForm = (e: BestiaryEntry): ItemForm => ({
  id: e.id,
  category: e.category,
  name: e.name,
  rarity: e.rarity === null ? '' : String(e.rarity),
  description: e.description,
  image: e.image ?? '',
  tags: e.tags,
  props: Object.entries(e.props ?? {}).map(([k, v]) => ({ k, v: String(v) })),
});
const catToForm = (c: BestiaryCategory): CatForm => ({
  id: c.id,
  name: c.name,
  image: c.image ?? '',
  description: c.description,
  sort: String(c.sort ?? 0),
});

const SafeImage = ({ src, alt, className = '' }: { src: string | null; alt: string; className?: string }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (src && !failed) {
    return <img src={src} alt={alt} onError={() => setFailed(true)} className={`object-cover ${className}`} draggable={false} />;
  }
  return null;
};

const inputClass = 'w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-sm text-ivory focus-ring';
const labelClass = 'block text-xs text-gray-400 mb-1.5';
// Обёртка модалок: на телефоне — bottom-sheet, на десктопе — по центру
const sheetClass = 'fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4';
const sheetPanel = 'glass-panel w-full max-w-2xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 animate-slide-up max-h-[85vh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-6';

export const BestiaryPage = () => {
  const { catId } = useParams<{ catId: string }>();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [data, setData] = useState<{ categories: BestiaryCategory[]; entries: BestiaryEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<BestiaryEntry | null>(null);
  const [itemForm, setItemForm] = useState<ItemForm | null>(null);
  const [catForm, setCatForm] = useState<CatForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await apiGetBestiary();
      setData({ categories: r.categories, entries: r.entries });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить бестиарий');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { setSearch(''); setExpanded(false); }, [catId]);

  const current = data?.categories.find((c) => String(c.id) === catId) ?? null;
  useDocumentMeta(
    current
      ? {
          title: `Бестиарий: ${current.name}`,
          description: current.description || `Категория «${current.name}» в картотеке Stellar Wiki.`,
          path: `/bestiary/${current.id}`,
        }
      : { title: 'Бестиарий', description: 'Универсальная картотека Wuthering Waves: оружие, враги, эхо, материалы и любые другие предметы.' },
  );

  const countFor = (catName: string) => data?.entries.filter((e) => e.category === catName).length ?? 0;

  const items = useMemo(() => {
    if (!current || !data) return [];
    const q = search.trim().toLowerCase();
    return data.entries
      .filter((e) => e.category === current.name)
      .filter((e) =>
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.toLowerCase().includes(q) ||
        Object.values(e.props ?? {}).some((v) => String(v).toLowerCase().includes(q)),
      )
      .sort((a, b) => (b.rarity ?? 0) - (a.rarity ?? 0) || a.name.localeCompare(b.name, 'ru'));
  }, [data, current, search]);

  const saveCat = async () => {
    if (!catForm || !token) return;
    if (!catForm.name.trim()) { setMsg('Название категории обязательно'); return; }
    setBusy(true);
    setMsg(null);
    const payload = {
      name: catForm.name.trim(),
      image: catForm.image.trim() || null,
      description: catForm.description,
      sort: Number(catForm.sort || 0),
    };
    try {
      if (catForm.id === null) await apiCreateCategory(token, payload);
      else await apiUpdateCategory(token, catForm.id, payload);
      setCatForm(null);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Не удалось сохранить категорию');
    } finally {
      setBusy(false);
    }
  };
  const removeCat = async (c: BestiaryCategory) => {
    if (!token) return;
    const n = countFor(c.name);
    if (!window.confirm(`Удалить категорию «${c.name}» вместе со всеми её предметами (${n})? Это необратимо.`)) return;
    setBusy(true);
    try {
      await apiDeleteCategory(token, c.id);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Не удалось удалить категорию');
    } finally {
      setBusy(false);
    }
  };

  const saveItem = async () => {
    if (!itemForm || !token) return;
    if (!itemForm.category || !itemForm.name.trim()) { setMsg('Категория и название обязательны'); return; }
    setBusy(true);
    setMsg(null);
    const props: Record<string, string> = {};
    itemForm.props.forEach((p) => { if (p.k.trim()) props[p.k.trim()] = p.v; });
    const payload = {
      category: itemForm.category,
      name: itemForm.name.trim(),
      rarity: itemForm.rarity === '' ? null : Number(itemForm.rarity),
      description: itemForm.description,
      image: itemForm.image.trim() || null,
      tags: itemForm.tags,
      props,
    };
    try {
      if (itemForm.id === null) await apiCreateBestiary(token, payload);
      else await apiUpdateBestiary(token, itemForm.id, payload);
      setItemForm(null);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Не удалось сохранить предмет');
    } finally {
      setBusy(false);
    }
  };
  const removeItem = async (id: number) => {
    if (!token) return;
    if (!window.confirm('Удалить предмет? Это необратимо.')) return;
    setBusy(true);
    try {
      await apiDeleteBestiary(token, id);
      setDetail(null);
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Не удалось удалить предмет');
    } finally {
      setBusy(false);
    }
  };

  const setProp = (i: number, patch: Partial<PropRow>) =>
    setItemForm((f) => (f ? { ...f, props: f.props.map((p, j) => (j === i ? { ...p, ...patch } : p)) } : f));

  const renderCard = (e: BestiaryEntry) => (
    <button
      key={e.id}
      onClick={() => setDetail(e)}
      className="glass-panel-hover overflow-hidden text-left focus-ring group"
      aria-label={`Открыть запись ${e.name}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SafeImage src={e.image} alt={e.name} className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
        {!e.image && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2118] to-[#14100c]">
            <span className="text-lg sm:text-xl font-bold text-accent-light/70">{e.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        {e.rarity !== null && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/55 backdrop-blur text-yellow-400 text-xs font-bold border border-yellow-400/30">
            {'★'.repeat(e.rarity)}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h4 className="font-semibold text-ivory group-hover:text-accent-light transition-colors truncate text-sm sm:text-base">{e.name}</h4>
        {e.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed hidden sm:block">{e.description}</p>}
        {e.tags && (
          <p className="flex items-center gap-1 text-[10px] text-gray-500 mt-2 truncate">
            <Tag size={10} className="shrink-0" /> {e.tags}
          </p>
        )}
      </div>
    </button>
  );

  if (!loading && catId && !current) {
    return (
      <div className="glass-panel py-16 flex flex-col items-center text-center gap-4">
        <Archive size={40} className="text-gray-600" />
        <div>
          <p className="text-ivory font-semibold">Категория не найдена</p>
          <p className="text-gray-500 text-sm mt-1">Возможно, полку переименовали или удалили</p>
        </div>
        <Link to="/bestiary" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-ivory hover:border-accent/40 transition-colors focus-ring">
          <ArrowLeft size={15} /> Ко всем категориям
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ========== ВИТРИНА КАТЕГОРИЙ ========== */}
      {!catId && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-ivory flex items-center gap-3">
                <Archive size={24} className="text-accent-light shrink-0" /> Бестиарий
              </h2>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Полки Соларис-3: выбери категорию и листай её содержимое</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => { setCatForm({ id: null, name: '', image: '', description: '', sort: '0' }); setMsg(null); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring shrink-0"
              >
                <Plus size={16} /> Новая категория
              </button>
            )}
          </div>

          {error && (
            <div className="glass-panel p-5 flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-300 flex-1">{error}</p>
              <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm hover:border-accent/40 transition-colors focus-ring">
                <RefreshCw size={14} /> Повторить
              </button>
            </div>
          )}

          {loading ? (
            <div className="glass-panel p-8 text-center text-gray-500">Загрузка картотеки...</div>
          ) : (data?.categories.length ?? 0) === 0 ? (
            <div className="glass-panel py-16 flex flex-col items-center text-center gap-4">
              <Archive size={40} className="text-gray-600" />
              <div>
                <p className="text-ivory font-semibold">Пока пусто</p>
                <p className="text-gray-500 text-sm mt-1">{isAdmin ? 'Создай первую категорию кнопкой сверху' : 'Категории ещё не заведены'}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {data!.categories.map((c) => {
                const Icon = categoryIcon(c.name);
                const n = countFor(c.name);
                return (
                  <div key={c.id} className="relative group">
                    <Link to={`/bestiary/${c.id}`} className="block glass-panel-hover overflow-hidden focus-ring rounded-2xl">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <SafeImage src={c.image} alt={c.name} className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
                        {!c.image && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2118] to-[#14100c]">
                            <Icon size={36} className="text-accent-light/60" />
                          </div>
                        )}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/55 backdrop-blur border border-glass-border text-[11px] font-bold text-ivory">
                          {n}
                        </span>
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-bold text-ivory group-hover:text-accent-light transition-colors truncate">{c.name}</h3>
                        {c.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed hidden sm:block">{c.description}</p>}
                      </div>
                    </Link>
                    {isAdmin && (
                      <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setCatForm(catToForm(c)); setMsg(null); }}
                          className="p-2 rounded-lg bg-black/60 backdrop-blur border border-glass-border text-gray-300 hover:text-ivory hover:border-accent/50 transition-colors focus-ring"
                          aria-label={`Изменить категорию ${c.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => removeCat(c)}
                          disabled={busy}
                          className="p-2 rounded-lg bg-black/60 backdrop-blur border border-glass-border text-gray-300 hover:text-red-300 hover:border-red-500/50 transition-colors focus-ring disabled:opacity-50"
                          aria-label={`Удалить категорию ${c.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========== ПОЛКА КАТЕГОРИИ ========== */}
      {catId && current && (
        <>
          <Link to="/bestiary" className="inline-flex items-center gap-2 text-gray-400 hover:text-ivory transition-colors focus-ring rounded-lg">
            <ArrowLeft size={18} /> Ко всем категориям
          </Link>

          <div className="glass-panel p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-5 items-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-glass-border overflow-hidden shrink-0 relative">
              <SafeImage src={current.image} alt={current.name} className="w-full h-full" />
              {!current.image && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2118] to-[#14100c]">
                  {(() => { const Icon = categoryIcon(current.name); return <Icon size={28} className="text-accent-light/60" />; })()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-ivory">{current.name}</h2>
                <span className="px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent-light text-[11px] font-bold">
                  {countFor(current.name)}
                </span>
              </div>
              {current.description && <p className="text-sm text-gray-400 mt-1 leading-relaxed">{current.description}</p>}
            </div>
            {isAdmin && (
              <div className="flex gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => { setItemForm({ id: null, category: current.name, name: '', rarity: '', description: '', image: '', tags: '', props: [{ k: '', v: '' }] }); setMsg(null); }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring"
                >
                  <Plus size={15} /> Добавить предмет
                </button>
                <button
                  onClick={() => { setCatForm(catToForm(current)); setMsg(null); }}
                  className="p-2.5 rounded-xl bg-glass border border-glass-border text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring"
                  aria-label="Изменить категорию"
                >
                  <Pencil size={15} />
                </button>
              </div>
            )}
          </div>

          <div className="glass-panel p-2.5 sm:p-3 flex flex-wrap gap-2 items-center relative z-30">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по полке..."
                className="pl-9 pr-4 py-2 bg-bg-secondary border border-glass-border rounded-xl text-sm focus-ring w-full"
                aria-label="Поиск по категории"
              />
            </div>
            <span className="text-xs text-gray-500 pr-1">Найдено: {items.length}</span>
          </div>

          {items.length === 0 ? (
            <div className="glass-panel py-16 flex flex-col items-center text-center gap-4">
              <Archive size={40} className="text-gray-600" />
              <div>
                <p className="text-ivory font-semibold">На полке пусто</p>
                <p className="text-gray-500 text-sm mt-1">
                  {search ? 'Попробуй другой запрос' : isAdmin ? 'Добавь первый предмет кнопкой сверху' : 'Предметы ещё не добавлены'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                {(expanded ? items : items.slice(0, PAGE_SIZE)).map(renderCard)}
              </div>
              {items.length > PAGE_SIZE && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="w-full py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring"
                >
                  {expanded ? 'Свернуть' : `Показать ещё ${items.length - PAGE_SIZE}`}
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* ========== МОДАЛКА ПРОСМОТРА (bottom-sheet на мобильном) ========== */}
      {detail && (
        <div className={sheetClass} onClick={() => setDetail(null)} role="dialog" aria-modal="true">
          <div className={sheetPanel} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-glass-border overflow-hidden shrink-0 relative">
                <SafeImage src={detail.image} alt={detail.name} className="w-full h-full" />
                {!detail.image && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2118] to-[#14100c]">
                    <span className="text-xl font-bold text-accent-light/70">{detail.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Link
                    to={`/bestiary/${data?.categories.find((c) => c.name === detail.category)?.id ?? ''}`}
                    onClick={() => setDetail(null)}
                    className="px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent-light text-[10px] font-bold uppercase tracking-wider hover:border-accent/60 transition-colors"
                  >
                    {detail.category}
                  </Link>
                  {detail.rarity !== null && <span className="text-yellow-400 text-xs font-bold">{'★'.repeat(detail.rarity)}</span>}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-ivory leading-tight">{detail.name}</h3>
                {detail.tags && <p className="flex items-center gap-1 text-xs text-gray-500 mt-1"><Tag size={11} /> {detail.tags}</p>}
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-ivory focus-ring shrink-0" aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            {detail.description && <p className="text-sm text-gray-300 leading-relaxed mb-4">{detail.description}</p>}
            {Object.keys(detail.props ?? {}).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {Object.entries(detail.props).map(([k, v]) => (
                  <div key={k} className="p-3 rounded-lg bg-bg-secondary/60 border border-glass-border">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{k}</p>
                    <p className="text-sm text-ivory">{String(v)}</p>
                  </div>
                ))}
              </div>
            )}
            {isAdmin && (
              <div className="flex gap-2 pt-2 border-t border-glass-border">
                <button
                  onClick={() => { setItemForm(entryToForm(detail)); setDetail(null); setMsg(null); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-ivory hover:border-accent/40 transition-colors focus-ring"
                >
                  <Pencil size={14} /> Изменить
                </button>
                <button
                  onClick={() => removeItem(detail.id)}
                  disabled={busy}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm hover:bg-red-500/20 transition-colors focus-ring disabled:opacity-50"
                >
                  <Trash2 size={14} /> Удалить
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== МОДАЛКА ФОРМЫ ПРЕДМЕТА ========== */}
      {itemForm && (
        <div className={sheetClass} onClick={() => setItemForm(null)} role="dialog" aria-modal="true">
          <div className={sheetPanel} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory">{itemForm.id === null ? 'Новый предмет' : 'Правка предмета'}</h3>
              <button onClick={() => setItemForm(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-ivory focus-ring" aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            {msg && (
              <p className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertCircle size={15} className="shrink-0" /> {msg}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className={labelClass}>Категория *</span>
                <select value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} className={inputClass}>
                  {(data?.categories ?? []).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Название *</span>
                <input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Verdant Summit" className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Редкость</span>
                <select value={itemForm.rarity} onChange={(e) => setItemForm({ ...itemForm, rarity: e.target.value })} className={inputClass}>
                  <option value="">Без редкости</option>
                  <option value="3">3★</option>
                  <option value="4">4★</option>
                  <option value="5">5★</option>
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Картинка (url или /images/...)</span>
                <input value={itemForm.image} onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })} placeholder="/images/verdant-summit.webp" className={inputClass} />
              </label>
            </div>
            <label className="block mb-4">
              <span className={labelClass}>Описание</span>
              <textarea rows={3} value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} className={inputClass} />
            </label>
            <label className="block mb-4">
              <span className={labelClass}>Теги (через запятую)</span>
              <input value={itemForm.tags} onChange={(e) => setItemForm({ ...itemForm, tags: e.target.value })} placeholder="сигнатура, aero" className={inputClass} />
            </label>
            <div className="mb-4">
              <span className={labelClass}>Свойства (ключ → значение)</span>
              <div className="space-y-2">
                {itemForm.props.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={p.k} onChange={(e) => setProp(i, { k: e.target.value })} placeholder="Ключ (Тип)" className={`${inputClass} flex-1`} />
                    <input value={p.v} onChange={(e) => setProp(i, { v: e.target.value })} placeholder="Значение (Broadblade)" className={`${inputClass} flex-1`} />
                    <button
                      onClick={() => setItemForm({ ...itemForm, props: itemForm.props.filter((_, j) => j !== i) })}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-ring shrink-0"
                      aria-label="Убрать свойство"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setItemForm({ ...itemForm, props: [...itemForm.props, { k: '', v: '' }] })}
                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-xs text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring"
              >
                <Plus size={12} /> Добавить свойство
              </button>
            </div>
            <button
              onClick={saveItem}
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold disabled:opacity-50 hover:shadow-glow transition-all focus-ring"
            >
              {busy ? 'Сохраняю...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}

      {/* ========== МОДАЛКА ФОРМЫ КАТЕГОРИИ ========== */}
      {catForm && (
        <div className={sheetClass} onClick={() => setCatForm(null)} role="dialog" aria-modal="true">
          <div className={`${sheetPanel} max-w-lg`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory">{catForm.id === null ? 'Новая категория' : 'Правка категории'}</h3>
              <button onClick={() => setCatForm(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-ivory focus-ring" aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            {msg && (
              <p className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                <AlertCircle size={15} className="shrink-0" /> {msg}
              </p>
            )}
            <div className="space-y-4">
              <label className="block">
                <span className={labelClass}>Название *</span>
                <input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Оружие / Враги / Еда..." className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Картинка полки (url или /images/...)</span>
                <input value={catForm.image} onChange={(e) => setCatForm({ ...catForm, image: e.target.value })} placeholder="/images/cat-weapons.webp" className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Описание</span>
                <textarea rows={2} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Порядок (меньше — выше)</span>
                <input type="number" value={catForm.sort} onChange={(e) => setCatForm({ ...catForm, sort: e.target.value })} className={inputClass} />
              </label>
            </div>
            <button
              onClick={saveCat}
              disabled={busy}
              className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold disabled:opacity-50 hover:shadow-glow transition-all focus-ring"
            >
              {busy ? 'Сохраняю...' : 'Сохранить'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};