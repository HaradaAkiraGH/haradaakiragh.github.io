// Pull Tracker: импорт истории круток, аналитика удачи (50/50 winrate + цветовая лента 5★ пити),
// иконки оружия и портреты персонажей, сохранение созвездий S0–S6 для витрины профиля
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Link2,
  Trash2,
  AlertCircle,
  Star,
  Dice5,
  RefreshCw,
  HelpCircle,
  Trophy,
  Sparkles,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiGetPulls, apiImportPulls, apiDeletePulls, PullsData, PullEntry } from '../utils/api';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import {
  matchCharacter,
  matchWeapon,
  isStandardFiveStar,
  savePullsCache,
  saveLuckSummaryCache,
} from '../utils/pullMatch';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const BANNER_LABELS: Record<string, string> = {
  '1': 'Ивентовый резонатор',
  '2': 'Ивентовое оружие',
  '3': 'Стандартный резонатор',
  '4': 'Стандартное оружие',
  '5': 'Баннер новичка',
  '6': 'Селектор новичка',
  '7': 'Выбор резонатора',
  '8': 'Особое соглашение',
};

const RARITY_COLORS: Record<number, string> = {
  3: 'text-sky-400',
  4: 'text-purple-400',
  5: 'text-amber-300',
};

interface FiveStarTimelineItem {
  id: number;
  name: string;
  bannerId: string;
  pity: number;
  time: string;
  outcome?: 'WIN' | 'LOSE' | 'GUARANTEED';
}

/* Определение цвета пити-бейджа: 1–40 зелёный, 41–65 золотой, 66+ красный */
const getPityBadgeStyle = (pity: number) => {
  if (pity <= 40) {
    return {
      cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]',
      tag: 'Ранняя',
    };
  }
  if (pity <= 65) {
    return {
      cls: 'bg-amber-500/20 text-amber-200 border-amber-400/50',
      tag: 'Норма',
    };
  }
  return {
    cls: 'bg-rose-500/20 text-rose-300 border-rose-400/50',
    tag: 'Софт-пити',
  };
};

/* Универсальная миниатюра дропа: портрет персонажа ИЛИ иконка оружия */
const PullItemThumb = ({
  name,
  rarity,
  size = 'sm',
}: {
  name: string;
  rarity: number;
  size?: 'sm' | 'md';
}) => {
  const char = matchCharacter(name);
  const weapon = !char ? matchWeapon(name) : undefined;
  const boxCls = size === 'md' ? 'w-11 h-14 rounded-xl' : 'w-8 h-10 rounded-lg';

  if (char) {
    return (
      <ImagePlaceholder
        id={char.id}
        initials={char.name.slice(0, 2)}
        element={char.element}
        className={`${boxCls} border border-white/15 shrink-0 object-cover object-top`}
      />
    );
  }

  if (weapon) {
    const rarityBg =
      rarity === 5
        ? 'from-amber-500/30 via-amber-900/25 to-[#0b0d14] border-amber-400/50'
        : rarity === 4
        ? 'from-purple-500/30 via-purple-900/25 to-[#0b0d14] border-purple-400/45'
        : 'from-sky-500/20 via-sky-950/20 to-[#0b0d14] border-sky-400/30';
    return (
      <span
        title={`${weapon.label}: ${weapon.name}`}
        className={`${boxCls} bg-gradient-to-br ${rarityBg} border flex items-center justify-center shrink-0 p-1.5`}
      >
        <img
          src={weapon.icon}
          alt={weapon.label}
          className="w-full h-full object-contain drop-shadow"
          draggable={false}
        />
      </span>
    );
  }

  return (
    <span
      className={`${boxCls} bg-bg-secondary border border-glass-border flex items-center justify-center shrink-0`}
    >
      <Star size={13} className={RARITY_COLORS[rarity] ?? 'text-gray-400'} />
    </span>
  );
};

export const PullsPage = () => {
  useDocumentMeta({
    title: 'Крутки и Аналитика Удачи — Stellar Wiki',
    description: 'Импорт истории круток Wuthering Waves, статистика 50/50, лента пити и иконки оружия.',
  });

  const { token } = useAuth();
  const [data, setData] = useState<PullsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    imported: number;
    perBanner: Record<string, number>;
  } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [importDebug, setImportDebug] = useState<string | null>(null);

  // Фильтры списка круток
  const [rarityFilter, setRarityFilter] = useState<'all' | 5 | 4>('all');
  const [bannerFilter, setBannerFilter] = useState<string>('all');

  const load = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const d = await apiGetPulls(token);
      setData(d);
      if (d.pulls) {
        savePullsCache(d.pulls);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const doImport = async () => {
    if (!token || !url.trim()) return;
    setImporting(true);
    setError(null);
    setImportResult(null);
    setImportDebug(null);
    try {
      const res = await apiImportPulls(token, url.trim());
      setImportResult({ imported: res.imported, perBanner: res.perBanner });
      setUrl('');
      await load();
    } catch (e: any) {
      setError(e instanceof Error ? e.message : 'Импорт не удался');
      setImportDebug(e?.payload?.debug ? JSON.stringify(e.payload.debug, null, 2) : null);
    } finally {
      setImporting(false);
    }
  };

  const doReset = async () => {
    if (!token) return;
    if (!window.confirm('Удалить всю историю круток? Это необратимо.')) return;
    try {
      await apiDeletePulls(token);
      savePullsCache([]);
      await load();
      setImportResult(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  const bannerName = (id: string) =>
    data?.banners?.find((b) => b.id === id)?.name ?? BANNER_LABELS[id] ?? `Баннер ${id}`;

  /* ---------- Глубокая аналитика удачи: пити каждой 5★, винрейт 50/50, ранг удачи ---------- */
  const luckAnalytics = useMemo(() => {
    const pulls: PullEntry[] = data?.pulls ?? [];
    if (pulls.length === 0) return null;

    // Сортируем по возрастанию номера крутки внутри каждого баннера
    const byBanner = new Map<string, PullEntry[]>();
    for (const p of pulls) {
      const list = byBanner.get(p.bannerId) ?? [];
      list.push(p);
      byBanner.set(p.bannerId, list);
    }

    const timeline: FiveStarTimelineItem[] = [];
    let fiftyFiftyWins = 0;
    let fiftyFiftyTotal = 0;

    for (const [bId, bPulls] of byBanner.entries()) {
      const asc = [...bPulls].sort((a, b) => a.pullNumber - b.pullNumber);
      let prevFivePullNum = 0;
      let guaranteedNext = false;

      for (const p of asc) {
        if (p.rarity === 5) {
          const pity = Math.max(1, p.pullNumber - prevFivePullNum);
          prevFivePullNum = p.pullNumber;

          let outcome: FiveStarTimelineItem['outcome'] = undefined;
          // Считаем 50/50 для ивентового баннера персонажей (обычно id '1')
          const isCharPull = Boolean(matchCharacter(p.name));
          if (bId === '1' || (bId === '2' && isCharPull)) {
            const lostToStandard = isStandardFiveStar(p.name);
            if (guaranteedNext) {
              outcome = 'GUARANTEED';
              guaranteedNext = false;
            } else if (lostToStandard) {
              outcome = 'LOSE';
              fiftyFiftyTotal++;
              guaranteedNext = true;
            } else {
              outcome = 'WIN';
              fiftyFiftyWins++;
              fiftyFiftyTotal++;
              guaranteedNext = false;
            }
          }

          timeline.push({
            id: p.id,
            name: p.name,
            bannerId: bId,
            pity,
            time: p.time,
            outcome,
          });
        }
      }
    }

    // Сортируем ленту 5★ от самых свежих к старым
    timeline.sort((a, b) => String(b.time).localeCompare(String(a.time)) || b.id - a.id);

    const avgPity =
      timeline.length > 0
        ? Math.round(timeline.reduce((acc, x) => acc + x.pity, 0) / timeline.length)
        : 0;
    const minPity =
      timeline.length > 0 ? Math.min(...timeline.map((x) => x.pity)) : 0;
    const winRate5050 =
      fiftyFiftyTotal > 0 ? Math.round((fiftyFiftyWins / fiftyFiftyTotal) * 100) : null;

    // Определяем грейд удачи относительно математического среднего WuWa (~54 крутки на 5★)
    let luckGrade = 'A';
    let luckTitle = 'Благословение Соларис';
    let luckColor = 'text-amber-300 border-amber-400/40 bg-amber-500/15';

    if (timeline.length === 0) {
      luckGrade = '—';
      luckTitle = 'Копим на 5★';
      luckColor = 'text-gray-300 border-white/15 bg-white/5';
    } else if (avgPity <= 38) {
      luckGrade = 'SSS';
      luckTitle = 'Избранник Архонтов (Топ 5%)';
      luckColor = 'text-emerald-300 border-emerald-400/50 bg-emerald-500/15';
    } else if (avgPity <= 50) {
      luckGrade = 'S+';
      luckTitle = 'Высокая удача (Топ 20%)';
      luckColor = 'text-cyan-300 border-cyan-400/50 bg-cyan-500/15';
    } else if (avgPity <= 60) {
      luckGrade = 'A';
      luckTitle = 'Стабильный резонанс';
      luckColor = 'text-amber-300 border-amber-400/50 bg-amber-500/15';
    } else {
      luckGrade = 'B';
      luckTitle = 'Закалённый софт-пити';
      luckColor = 'text-rose-300 border-rose-400/50 bg-rose-500/15';
    }

    return {
      totalPulls: pulls.length,
      fiveStarCount: timeline.length,
      avgPity,
      minPity,
      winRate5050,
      fiftyFiftyWins,
      fiftyFiftyTotal,
      luckGrade,
      luckTitle,
      luckColor,
      timeline,
    };
  }, [data]);

  // Сохраняем сводку удачи в кэш для отображения в Профиле
  useEffect(() => {
    if (!luckAnalytics) return;
    saveLuckSummaryCache({
      totalPulls: luckAnalytics.totalPulls,
      fiveStarCount: luckAnalytics.fiveStarCount,
      avgPity: luckAnalytics.avgPity,
      winRate5050: luckAnalytics.winRate5050,
      luckGrade: luckAnalytics.luckGrade,
      updatedAt: new Date().toISOString(),
    });
  }, [luckAnalytics]);

  const filteredPulls = useMemo(() => {
    if (!data?.pulls) return [];
    return data.pulls.filter((p) => {
      if (rarityFilter !== 'all' && p.rarity !== rarityFilter) return false;
      if (bannerFilter !== 'all' && p.bannerId !== bannerFilter) return false;
      return true;
    });
  }, [data, rarityFilter, bannerFilter]);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Шапка */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold text-ivory flex items-center gap-2.5">
            <Dice5 className="text-accent-light" /> Pull Tracker & Аналитика Удачи
          </h2>
          <p className="text-gray-400 mt-1 text-sm">
            История круток, статистика 50/50, цветовая лента 5★ пити и автоматический расчёт созвездий S0–S6
          </p>
        </div>
        <button
          onClick={() => setHelpOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-glass border border-glass-border text-xs font-semibold text-gray-300 hover:text-ivory hover:border-accent/40 focus-ring"
        >
          <HelpCircle size={15} className="text-accent-light" />
          <span>Как достать URL</span>
        </button>
      </div>

      {error && (
        <p className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </p>
      )}
      {importDebug && (
        <pre className="px-4 py-3 rounded-xl bg-bg-secondary border border-glass-border text-[11px] text-gray-400 overflow-x-auto max-h-64 overflow-y-auto">
          {importDebug}
        </pre>
      )}
      {importResult && (
        <p className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          Импортировано: <b>{importResult.imported}</b> круток
          {Object.entries(importResult.perBanner).map(([b, n]) => (
            <span key={b} className="ml-2 text-xs text-emerald-400">
              ({bannerName(b)}: {n})
            </span>
          ))}
        </p>
      )}

      {/* Панель импорта */}
      <div className="glass-panel p-5">
        <h3 className="text-base font-bold text-ivory mb-3 flex items-center gap-2">
          <Link2 size={17} className="text-accent-light" /> Импорт истории Convene из игры
        </h3>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Вставь URL истории круток (https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?...)"
            className="flex-1 min-w-[260px] bg-bg-secondary border border-glass-border rounded-xl px-3.5 py-2.5 text-sm font-mono text-ivory placeholder-gray-500 focus-ring"
          />
          <button
            onClick={doImport}
            disabled={importing || !url.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-extrabold disabled:opacity-40 hover:shadow-glow transition-all focus-ring flex items-center gap-2"
          >
            {importing && <RefreshCw size={14} className="animate-spin" />}
            {importing ? 'Импорт...' : 'Импортировать'}
          </button>
          <button
            onClick={doReset}
            className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm hover:bg-red-500/20 focus-ring flex items-center gap-1.5"
            title="Удалить всю историю"
          >
            <Trash2 size={14} /> Сброс
          </button>
        </div>
      </div>

      {/* БЛОК АНАЛИТИКИ УДАЧИ И ЛЕНТЫ 5★ (Пункт 6) */}
      {luckAnalytics && luckAnalytics.totalPulls > 0 && (
        <div className="glass-panel p-5 sm:p-6 space-y-5 solaris-crest">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent/15 border border-accent/35 flex items-center justify-center text-accent-light">
                <Trophy size={22} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <span>Аналитика удачи аккаунта</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Автоматический расчёт 50/50, среднего пити и созвездий S0–S6
                </p>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 ${luckAnalytics.luckColor}`}>
              <Sparkles size={16} />
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">
                  Ранг удачи: {luckAnalytics.luckGrade}
                </span>
                <span className="text-[11px] opacity-85 block">{luckAnalytics.luckTitle}</span>
              </div>
            </div>
          </div>

          {/* 4 сводные метрики удачи */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] text-gray-400 uppercase font-bold">Всего круток</p>
              <p className="text-2xl font-black text-white mt-1 tabular-nums">
                {luckAnalytics.totalPulls}
              </p>
              <p className="text-[11px] text-accent-light mt-0.5">
                {(luckAnalytics.totalPulls * 160).toLocaleString('ru-RU')} астрита
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] text-gray-400 uppercase font-bold">Средний пити 5★</p>
              <p className="text-2xl font-black text-amber-300 mt-1 tabular-nums">
                {luckAnalytics.avgPity || '—'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Лучший дроп: {luckAnalytics.minPity ? `на ${luckAnalytics.minPity}-й` : '—'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] text-gray-400 uppercase font-bold">Винрейт 50/50</p>
              <p className="text-2xl font-black text-emerald-300 mt-1 tabular-nums">
                {luckAnalytics.winRate5050 !== null ? `${luckAnalytics.winRate5050}%` : '—'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Выиграно: {luckAnalytics.fiftyFiftyWins} из {luckAnalytics.fiftyFiftyTotal}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <p className="text-[11px] text-gray-400 uppercase font-bold">Всего 5★ дропов</p>
              <p className="text-2xl font-black text-purple-300 mt-1 tabular-nums">
                {luckAnalytics.fiveStarCount}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Созвездия синхронизированы с профилем
              </p>
            </div>
          </div>

          {/* Цветовая лента всех выбитых 5★ */}
          {luckAnalytics.timeline.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-accent-light" />
                  <span>Хронология выпавших 5★ (зелёный 1–40 · золотой 41–65 · алый 66+)</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {luckAnalytics.timeline.map((item) => {
                  const ch = matchCharacter(item.name);
                  const badge = getPityBadgeStyle(item.pity);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 p-2 pr-3 rounded-2xl bg-[#0b0d14]/80 border border-white/10 hover:border-accent/40 transition-all"
                    >
                      <PullItemThumb name={item.name} rarity={5} size="md" />
                      <div className="min-w-0">
                        {ch ? (
                          <Link
                            to={`/characters/${ch.id}`}
                            className="text-xs font-extrabold text-white hover:text-accent-light block truncate max-w-[130px]"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <span className="text-xs font-extrabold text-white block truncate max-w-[130px]">
                            {item.name}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-500 block truncate">
                          {bannerName(item.bannerId)}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md border text-[10px] font-black tabular-nums ${badge.cls}`}
                          >
                            #{item.pity}
                          </span>
                          {item.outcome === 'WIN' && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[9px] font-extrabold">
                              WIN 50/50
                            </span>
                          )}
                          {item.outcome === 'LOSE' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[9px] font-extrabold">
                              50/50 LOSE
                            </span>
                          )}
                          {item.outcome === 'GUARANTEED' && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200 text-[9px] font-extrabold">
                              ГАРАНТ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Карточки баннеров */}
      {loading ? (
        <div className="glass-panel p-8 text-center text-gray-500">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.banners?.length ? data.banners.map((b) => b.id) : ['1', '2', '3', '4']).map(
            (bid) => {
              const s = data?.stats[bid] ?? null;
              if (!s) {
                return (
                  <div key={bid} className="glass-panel p-5 opacity-60">
                    <h4 className="font-semibold text-ivory mb-2">{bannerName(bid)}</h4>
                    <p className="text-gray-500 text-sm">Нет данных — импортируй историю</p>
                  </div>
                );
              }
              return (
                <div key={bid} className="glass-panel p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h4 className="font-bold text-ivory">{bannerName(bid)}</h4>
                    <span className="text-[11px] font-mono text-gray-400">
                      До гаранта: {Math.max(0, 80 - s.currentPity)}
                    </span>
                  </div>

                  {/* Прогресс-бар текущего пити до 80 */}
                  <div className="h-2 rounded-full bg-black/50 border border-white/5 overflow-hidden mb-4">
                    <div
                      style={{ width: `${Math.min(100, (s.currentPity / 80) * 100)}%` }}
                      className={`h-full rounded-full transition-all ${
                        s.currentPity >= 65
                          ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                          : 'bg-gradient-to-r from-accent to-accent-light'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Всего круток</p>
                      <p className="text-ivory font-bold text-xl tabular-nums">{s.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Текущий pity</p>
                      <p
                        className={`font-bold text-xl tabular-nums ${
                          s.currentPity >= 66 ? 'text-amber-300' : 'text-ivory'
                        }`}
                      >
                        {s.currentPity} <span className="text-xs text-gray-500 font-normal">/ 80</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">5★ получено</p>
                      <p className="text-amber-300 font-semibold tabular-nums">{s.fiveStars}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Средний pity на 5★</p>
                      <p className="text-ivory font-semibold tabular-nums">
                        {s.avgPityAtFive || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">4★ дропов</p>
                      <p className="text-purple-400 font-semibold tabular-nums">{s.fourStars}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Последняя 5★</p>
                      {s.lastFiveName ? (
                        <span className="flex items-center gap-2 mt-1 min-w-0">
                          <PullItemThumb name={s.lastFiveName} rarity={5} size="sm" />
                          <span className="text-ivory font-semibold text-xs truncate">
                            {s.lastFiveName}
                          </span>
                        </span>
                      ) : (
                        <p className="text-ivory">—</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Полный журнал круток с иконками оружия и портретами персонажей */}
      {data && data.pulls.length > 0 && (
        <div className="glass-panel p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-ivory flex items-center gap-2">
              <Star size={18} className="text-accent-light" /> Журнал круток ({filteredPulls.length})
            </h3>

            {/* Фильтры по редкости и баннеру */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              {(['all', 5, 4] as const).map((r) => (
                <button
                  key={String(r)}
                  type="button"
                  onClick={() => setRarityFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    rarityFilter === r
                      ? 'bg-accent/20 border-accent text-accent-light'
                      : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {r === 'all' ? 'Все' : `${r}★`}
                </button>
              ))}

              <select
                value={bannerFilter}
                onChange={(e) => setBannerFilter(e.target.value)}
                className="bg-bg-secondary border border-glass-border rounded-lg px-2.5 py-1 text-xs text-ivory focus-ring"
              >
                <option value="all">Все баннеры</option>
                {(data.banners ?? []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {bannerName(b.id)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredPulls.slice(0, 150).map((p) => {
              const c = matchCharacter(p.name);
              const w = !c ? matchWeapon(p.name) : undefined;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 py-2 px-3 rounded-xl border transition-colors ${
                    p.rarity === 5
                      ? 'bg-amber-500/10 border-amber-400/30'
                      : p.rarity === 4
                      ? 'bg-purple-500/10 border-purple-400/20'
                      : 'bg-white/[0.02] border-transparent hover:bg-glass-hover'
                  }`}
                >
                  <PullItemThumb name={p.name} rarity={p.rarity} size="sm" />

                  <span className="text-xs text-gray-500 font-mono w-11 shrink-0">
                    #{p.pullNumber}
                  </span>

                  <span
                    className={`text-xs font-bold w-14 shrink-0 ${RARITY_COLORS[p.rarity]}`}
                  >
                    {'★'.repeat(p.rarity)}
                  </span>

                  <div className="flex-1 min-w-0">
                    {c ? (
                      <Link
                        to={`/characters/${c.id}`}
                        className="text-sm font-bold text-ivory hover:text-accent-light truncate block"
                      >
                        {p.name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-ivory truncate block">
                        {p.name}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500">
                      {c ? `Резонатор · ${c.element}` : w ? `Оружие · ${w.label}` : 'Предмет'}
                    </span>
                  </div>

                  <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">
                    {bannerName(p.bannerId)}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0 tabular-nums">
                    {new Date(p.time).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Инструкция */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="glass-panel w-full max-w-2xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-ivory mb-4">Как достать URL круток</h3>
            <p className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 mb-3">
              Только для <b>Windows</b>. Для Mac/Linux используй ручной путь на{' '}
              <a
                href="https://wuwatracker.com/import"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-accent-light"
              >
                wuwatracker.com/import
              </a>
              .
            </p>
            <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
              <li>
                Запусти <b>Wuthering Waves</b> и открой в игре <b>Convene History</b> (историю круток)
              </li>
              <li>
                Открой <b>Windows PowerShell</b> (Win+R ➔ <code>powershell</code> ➔ Enter)
              </li>
              <li>
                Вставь эту команду целиком:
                <pre className="mt-2 p-3 rounded-lg bg-bg-secondary text-xs text-accent-light overflow-x-auto select-all cursor-text">
                  {'iwr -UseBasicParsing -Headers @{"User-Agent"="Mozilla/5.0"} https://raw.githubusercontent.com/wuwatracker/wuwatracker/747a48b1b994baa9c372a4fb933ea7588428bd4b/import.ps1 | iex'}
                </pre>
              </li>
              <li>Скрипт сам найдёт игру, прочитает лог и скопирует URL в буфер обмена</li>
              <li>Вставь URL в поле выше и нажми «Импортировать»</li>
            </ol>
            <button
              onClick={() => setHelpOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-glass border border-glass-border text-ivory text-sm hover:border-accent/40 focus-ring"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};