// Бестиарий: двухуровневая картотека (полки категорий + предметы).
// Карточки компактные: имя, редкость, теги. Описание читается внутри:
// у предмета — в модалке просмотра, у категории — в шапке полки.
// Админ: создание/правка/удаление, перестановка свойств, ИМПОРТ ПАЧКОЙ из JSON (v2 с innerText).
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Search, X, Archive, AlertCircle, Tag, RefreshCw,
  Sword, Skull, Waves, Gem, UtensilsCrossed, Package, KeyRound, ArrowLeft,
  ChevronUp, ChevronDown, Download, Terminal, Check, Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  apiGetBestiary, apiCreateBestiary, apiUpdateBestiary, apiDeleteBestiary,
  apiCreateCategory, apiUpdateCategory, apiDeleteCategory,
  BestiaryEntry, BestiaryCategory,
} from '../utils/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/* ---------- Скрипт-скрейпер v2 для консоли DevTools на prydwen.gg ----------
   Использует innerText (сохраняет пробелы между блоками) и выводит диагностику. */
const SCRAPER_SCRIPT = String.raw`(function () {
  var nodes = document.querySelectorAll('*');
  var cand = [];
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    var t = el.innerText || el.textContent || '';
    if (t.indexOf('Rarity:') !== -1 && /Rarity:\s*[1-5]/.test(t) && el.querySelector('img')) cand.push(el);
  }
  var minimal = cand.filter(function (el) {
    return !cand.some(function (o) { return o !== el && el.contains(o); });
  });
  var cards = [];
  minimal.forEach(function (card) {
    try {
      var text = (card.innerText || card.textContent || '').replace(/\s+/g, ' ').trim();
      var type = '';
      var head = text.match(/^(.*?)\s*Rarity:\s*([1-5])\s*(?:★|\*)?\s*Type:\s*([A-Za-z]+)/);
      if (head) { type = head[3]; }
      else { head = text.match(/^(.*?)\s*Rarity:\s*([1-5])\s*(?:★|\*)?/); }
      if (!head) return;
      var rest = text.slice(head[0].length);
      var atkIdx = rest.indexOf('ATK (Lv.90):');
      var desc = (atkIdx !== -1 ? rest.slice(0, atkIdx) : rest).trim();
      var atkM = rest.match(/ATK \(Lv\.90\):\s*([\d.]+%?)/);
      var after = atkM ? rest.slice(rest.indexOf(atkM[0]) + atkM[0].length) : '';
      var sub2 = after.match(/^\s*([A-Za-z][A-Za-z .%\/]*?)\(Lv\.90\):\s*([\d.]+%?)/);
      var img = card.querySelector('img');
      cards.push({
        name: head[1],
        rarity: Number(head[2]),
        type: type,
        description: desc,
        atk: atkM ? atkM[1] : '',
        substat: sub2 ? sub2[1].trim() + ' (Lv.90)' : '',
        substatValue: sub2 ? sub2[2] : '',
        image: img ? (img.currentSrc || img.src || img.getAttribute('data-src') || '') : ''
      });
    } catch (e) {}
  });
  if (cards.length === 0) {
    var bodyText = document.body.innerText || document.body.textContent || '';
    var idx = bodyText.indexOf('Rarity:');
    console.log('Диагностика: карточек-кандидатов = ' + minimal.length + '; слово Rarity: на странице = ' + (idx !== -1));
    console.log('Фрагмент текста вокруг первого Rarity:: ' + JSON.stringify(bodyText.slice(Math.max(0, idx - 100), idx + 150)));
  } else {
    console.table(cards.map(function (c) { return { name: c.name, rarity: c.rarity, type: c.type }; }));
  }
  copy(JSON.stringify(cards, null, 2));
  console.log('Готово: ' + cards.length + ' записей скопировано в буфер обмена');
})();`;

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
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
        draggable={false}
      />
    );
  }
  return null;
};

const inputClass = 'w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-sm text-ivory focus-ring';
const labelClass = 'block text-xs text-gray-400 mb-1.5';
const sheetClass = 'fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4';
const sheetPanel = 'glass-panel solaris-crest w-full max-w-2xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 animate-slide-up max-h-[85vh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-6';

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
  const [importOpen, setImportOpen] = useState(false);
  const [importCat, setImportCat] = useState('');
  const [importSource, setImportSource] = useState('');
  const [importText, setImportText] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const [importLog, setImportLog] = useState('');
  const [scriptOpen, setScriptOpen] = useState(false);
  const [scriptCopied, setScriptCopied] = useState(false);

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

  const moveProp = (i: number, dir: -1 | 1) =>
    setItemForm((f) => {
      if (!f) return f;
      const j = i + dir;
      if (j < 0 || j >= f.props.length) return f;
      const next = [...f.props];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, props: next };
    });

  const copyScript = async () => {
    await navigator.clipboard.writeText(SCRAPER_SCRIPT);
    setScriptCopied(true);
    setTimeout(() => setScriptCopied(false), 1500);
  };
  const doBulkImport = async () => {
    if (!token) return;
    let arr: any[] = [];
    try {
      arr = JSON.parse(importText);
    } catch {
      setImportLog('Невалидный JSON: проверь, что вставил весь текст из буфера (начинается с [ и заканчивается ])');
      return;
    }
    if (!Array.isArray(arr) || arr.length === 0) {
      setImportLog('Ожидался массив записей, пришло что-то другое');
      return;
    }
    const cat = importCat || current?.name || '';
    if (!cat) { setImportLog('Выбери категорию для импорта'); return; }
    setImportBusy(true);
    setImportLog('Старт...');
    const existing = new Set(
      (data?.entries ?? []).filter((e) => e.category === cat).map((e) => e.name.toLowerCase()),
    );
    let created = 0;
    let skipped = 0;
    for (const item of arr) {
      const name = String(item?.name ?? '').trim();
      if (!name || existing.has(name.toLowerCase())) { skipped++; continue; }
      const props: Record<string, string> = {};
      if (item.type) props['Тип'] = String(item.type);
      if (item.atk) props['ATK (Lv.90)'] = String(item.atk);
      if (item.substat && item.substatValue) props[String(item.substat)] = String(item.substatValue);
      if (importSource.trim()) props['Источник'] = importSource.trim();
      try {
        await apiCreateBestiary(token, {
          category: cat,
          name,
          rarity: item.rarity === undefined || item.rarity === null || item.rarity === '' ? null : Number(item.rarity),
          description: String(item.description ?? ''),
          image: item.image ? String(item.image) : null,
          tags: '',
          props,
        });
        existing.add(name.toLowerCase());
        created++;
      } catch {
        skipped++;
      }
      setImportLog(`Создано: ${created} · пропущено: ${skipped} · из ${arr.length}`);
    }
    setImportBusy(false);
    setImportLog(`Готово. Создано: ${created}, пропущено (дубли/ошибки): ${skipped}`);
    setImportText('');
    await load();
  };

  /* Компактная карточка предмета: без описания — оно внутри модалки */
  const renderCard = (e: BestiaryEntry) => (
    <button
      key={e.id}
      onClick={() => setDetail(e)}
      className="glass-panel-hover overflow-hidden text-left focus-ring group"
      aria-label={`Открыть запись ${e.name}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-secondary">
        <SafeImage src={e.image} alt={e.name} className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
        {!e.image && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2118] to-[#14100c]">
            <span className="text-lg sm:text-xl font-bold text-accent-light/70">{e.name.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
        {e.rarity !== null && (
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/65 backdrop-blur text-amber-300 text-[10px] sm:text-xs font-bold border border-amber-400/35">
            {'★'.repeat(e.rarity)}
          </span>
        )}
      </div>
      <div className="p-2.5 sm:p-3 bg-gradient-to-b from-bg-secondary/85 to-bg/95">
        <h4 className="font-bold text-ivory group-hover:text-accent-light transition-colors truncate text-xs sm:text-sm">
          {e.name}
        </h4>
        {e.tags && (
          <p className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 truncate">
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
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-light mb-1">
                <Sparkles size={12} /> База данных Соларис-3
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ivory flex items-center gap-3">
                <Archive size={24} className="text-accent-light shrink-0" /> Бестиарий
              </h2>
              <p className="text-gray-400 mt-0.5 text-sm">
                Полки Соларис-3: выбери категорию и листай её содержимое
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => { setCatForm({ id: null, name: '', image: '', description: '', sort: '0' }); setMsg(null); }}
                className="btn-luxury focus-ring shrink-0"
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
                    <Link to={`/bestiary/${c.id}`} className="block glass-panel-hover solaris-crest overflow-hidden focus-ring rounded-2xl">
                      <div className="relative aspect-[16/9] overflow-hidden bg-bg-secondary">
                        <SafeImage src={c.image} alt={c.name} className="w-full h-full transition-transform duration-300 group-hover:scale-105" />
                        {!c.image && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a2118] via-[#1b1510] to-[#100d0a]">
                            <Icon size={38} className="text-accent-light/70 group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-black/65 backdrop-blur border border-glass-border text-[11px] font-mono font-bold text-accent-light">
                          {n}
                        </span>
                      </div>
                      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-2">
                        <h3 className="font-bold text-ivory group-hover:text-accent-light transition-colors truncate">
                          {c.name}
                        </h3>
                        <span className="text-[11px] text-gray-500 group-hover:text-accent-light transition-colors">
                          Открыть →
                        </span>
                      </div>
                    </Link>
                    {isAdmin && (
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setCatForm(catToForm(c)); setMsg(null); }}
                          className="p-2 rounded-lg bg-black/65 backdrop-blur border border-glass-border text-gray-300 hover:text-ivory hover:border-accent/50 transition-colors focus-ring"
                          aria-label={`Изменить категорию ${c.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => removeCat(c)}
                          disabled={busy}
                          className="p-2 rounded-lg bg-black/65 backdrop-blur border border-glass-border text-gray-300 hover:text-red-300 hover:border-red-500/50 transition-colors focus-ring disabled:opacity-50"
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
          <Link to="/bestiary" className="inline-flex items-center gap-2 text-gray-400 hover:text-ivory text-sm font-medium transition-colors focus-ring rounded-lg">
            <ArrowLeft size={17} /> Ко всем категориям
          </Link>

          <div className="glass-panel solaris-crest p-4 sm:p-5 flex flex-col md:flex-row gap-4 sm:gap-5 items-start">
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
                <h2 className="text-xl sm:text-2xl font-extrabold text-ivory">{current.name}</h2>
                <span className="px-2.5 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent-light text-xs font-mono font-bold">
                  {countFor(current.name)}
                </span>
              </div>
              {current.description && <p className="text-sm text-gray-400 mt-1 leading-relaxed">{current.description}</p>}
            </div>
            {isAdmin && (
              <div className="flex gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => {
                    setImportCat(current.name);
                    setImportLog('');
                    setImportOpen(true);
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-ivory hover:border-accent/40 transition-colors focus-ring"
                >
                  <Download size={15} /> Импорт пачкой
                </button>
                <button
                  onClick={() => { setItemForm({ id: null, category: current.name, name: '', rarity: '', description: '', image: '', tags: '', props: [{ k: '', v: '' }] }); setMsg(null); }}
                  className="flex-1 md:flex-none btn-luxury focus-ring"
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
            <span className="text-xs text-gray-400 font-mono pr-1">Найдено: {items.length}</span>
          </div>

          {items.length === 0 ? (
            <div className="glass-panel py-16 flex flex-col items-center text-center gap-4">
              <Archive size={40} className="text-gray-600" />
              <div>
                <p className="text-ivory font-semibold">На полке пусто</p>
                <p className="text-gray-500 text-sm mt-1">
                  {search ? 'Попробуй другой запрос' : isAdmin ? 'Добавь первый предмет или импортируй пачкой' : 'Предметы ещё не добавлены'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
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

      {/* ========== МОДАЛКА ПРОСМОТРА ========== */}
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
                  {detail.rarity !== null && <span className="text-amber-300 text-xs font-bold">{'★'.repeat(detail.rarity)}</span>}
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
                    <p className="text-sm font-semibold text-ivory">{String(v)}</p>
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

      {/* ========== МОДАЛКА ИМПОРТА ПАЧКОЙ ========== */}
      {importOpen && (
        <div className={sheetClass} onClick={() => setImportOpen(false)} role="dialog" aria-modal="true">
          <div className={`${sheetPanel} max-w-2xl`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory flex items-center gap-2">
                <Download size={18} className="text-accent-light" /> Импорт пачкой с prydwen.gg
              </h3>
              <button onClick={() => setImportOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-ivory focus-ring" aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            <ol className="space-y-1.5 text-xs text-gray-400 list-decimal list-inside mb-3">
              <li>Открой страницу оружия на prydwen.gg и <b className="text-ivory">прокрути до самого низа</b> (картинки грузятся по мере скролла)</li>
              <li>Нажми F12 → вкладка Console → вставь скрипт v2 (кнопка ниже) → Enter → JSON уйдёт в буфер</li>
              <li>Вернись сюда, выбери категорию, вставь JSON (Ctrl+V) → «Импортировать»</li>
            </ol>
            <button
              onClick={() => setScriptOpen(!scriptOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-glass border border-glass-border text-xs text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring mb-3"
            >
              <Terminal size={13} /> {scriptOpen ? 'Скрыть скрипт-скрейпер v2' : 'Показать скрипт-скрейпер v2'}
            </button>
            {scriptOpen && (
              <div className="mb-3 space-y-2">
                <pre className="p-3 rounded-lg bg-bg-secondary border border-glass-border text-[10px] text-gray-400 overflow-x-auto max-h-48 overflow-y-auto font-mono">
                  {SCRAPER_SCRIPT}
                </pre>
                <button
                  onClick={copyScript}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-xs text-ivory hover:border-accent/40 transition-colors focus-ring"
                >
                  {scriptCopied ? <Check size={12} className="text-emerald-400" /> : <Terminal size={12} />}
                  {scriptCopied ? 'Скопировано!' : 'Скопировать скрипт v2'}
                </button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <label className="block">
                <span className={labelClass}>Категория-приёмник *</span>
                <select value={importCat} onChange={(e) => setImportCat(e.target.value)} className={inputClass}>
                  <option value="">— выбери —</option>
                  {(data?.categories ?? []).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Источник по умолчанию (необязательно)</span>
                <input value={importSource} onChange={(e) => setImportSource(e.target.value)} placeholder="Напр.: Ивентовый баннер" className={inputClass} />
              </label>
            </div>
            <label className="block mb-3">
              <span className={labelClass}>JSON из буфера обмена</span>
              <textarea
                rows={7}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"name":"Starfield Calibrator","rarity":5,...}]'
                className={`${inputClass} font-mono text-xs`}
              />
            </label>
            {importLog && (
              <p className="mb-3 px-3 py-2 rounded-lg bg-bg-secondary border border-glass-border text-xs text-gray-300 font-mono">
                {importLog}
              </p>
            )}
            <button
              onClick={doBulkImport}
              disabled={importBusy || !importText.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold disabled:opacity-50 hover:shadow-glow transition-all focus-ring flex items-center justify-center gap-2"
            >
              {importBusy && <RefreshCw size={15} className="animate-spin" />}
              {importBusy ? 'Импортирую...' : 'Импортировать'}
            </button>
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
              <span className={labelClass}>Свойства (ключ → значение) — стрелки меняют порядок</span>
              <div className="space-y-2">
                {itemForm.props.map((p, i) => (
                  <div key={i} className="flex gap-2 items-stretch">
                    <input value={p.k} onChange={(e) => setProp(i, { k: e.target.value })} placeholder="Ключ (Тип)" className={`${inputClass} flex-1`} />
                    <input value={p.v} onChange={(e) => setProp(i, { v: e.target.value })} placeholder="Значение (Broadblade)" className={`${inputClass} flex-1`} />
                    <div className="flex flex-col gap-0.5 shrink-0 self-center">
                      <button
                        onClick={() => moveProp(i, -1)}
                        disabled={i === 0}
                        className="p-0.5 rounded-md text-gray-500 hover:text-ivory hover:bg-glass-hover transition-colors focus-ring disabled:opacity-30"
                        aria-label="Поднять свойство выше"
                        title="Выше"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveProp(i, 1)}
                        disabled={i === itemForm.props.length - 1}
                        className="p-0.5 rounded-md text-gray-500 hover:text-ivory hover:bg-glass-hover transition-colors focus-ring disabled:opacity-30"
                        aria-label="Опустить свойство ниже"
                        title="Ниже"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => setItemForm({ ...itemForm, props: itemForm.props.filter((_, j) => j !== i) })}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-ring shrink-0 self-center"
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