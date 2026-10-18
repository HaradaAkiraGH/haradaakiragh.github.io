// Pull Tracker: импорт истории круток, визуальные шкалы pity 0/80, список с портретами
import { useEffect, useState } from 'react';
import { Link2, Trash2, AlertCircle, Star, Dice5, RefreshCw, HelpCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiGetPulls, apiImportPulls, apiDeletePulls, PullsData } from '../utils/api';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { matchCharacter } from '../utils/pullMatch';

const BANNER_LABELS: Record<string, string> = {
  '1': 'Стандартное соглашение',
  '2': 'Соглашение с резонатором',
  '3': 'Соглашение с оружием',
  '4': 'Соглашение новичка',
};
const RARITY_COLORS: Record<number, string> = {
  3: 'text-sky-400',
  4: 'text-purple-400',
  5: 'text-amber-300',
};

export const PullsPage = () => {
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

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const d = await apiGetPulls(token);
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line
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
      await load();
      setImportResult(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  const bannerName = (id: string) =>
    data?.banners?.find((b) => b.id === id)?.name ?? BANNER_LABELS[id] ?? `Баннер ${id}`;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-light mb-1">
            <Sparkles size={12} /> Convene Telemetry · Гарант 80
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ivory flex items-center gap-2.5">
            <Dice5 className="text-accent-light" /> Pull Tracker
          </h2>
          <p className="text-gray-400 mt-0.5 text-sm">
            Автоимпорт истории круток из игры, расчёт pity и портреты выпавших резонаторов
          </p>
        </div>
        <button
          onClick={() => setHelpOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-glass border border-glass-border text-xs font-semibold text-ivory hover:border-accent/40 flex items-center gap-1.5 focus-ring"
          aria-label="Как достать URL"
        >
          <HelpCircle size={15} className="text-accent-light" /> Инструкция PowerShell
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
      <div className="glass-panel solaris-crest p-4 sm:p-5">
        <h3 className="text-sm sm:text-base font-bold text-ivory mb-3 flex items-center gap-2">
          <Link2 size={17} className="text-accent-light" /> Импорт ссылки Convene History
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Вставь ссылку (https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html#/record?...)"
            className="flex-1 w-full bg-bg/80 border border-glass-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-ivory placeholder-gray-500 focus-ring"
          />
          <div className="flex gap-2">
            <button
              onClick={doImport}
              disabled={importing || !url.trim()}
              className="flex-1 sm:flex-none btn-luxury disabled:opacity-40 focus-ring"
            >
              {importing && <RefreshCw size={14} className="animate-spin" />}
              {importing ? 'Импорт...' : 'Импортировать'}
            </button>
            <button
              onClick={doReset}
              className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-semibold hover:bg-red-500/20 focus-ring flex items-center gap-1.5"
              title="Удалить всю историю"
            >
              <Trash2 size={14} /> Сброс
            </button>
          </div>
        </div>
      </div>

      {/* Карточки баннеров с прогресс-барами Pity 0..80 */}
      {loading ? (
        <div className="glass-panel p-8 text-center text-gray-500">Загрузка телеметрии...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {(data?.banners?.length ? data.banners.map((b) => b.id) : ['1', '2', '3', '4']).map(
            (bid) => {
              const s = data?.stats[bid] ?? null;
              if (!s) {
                return (
                  <div key={bid} className="glass-panel p-4 sm:p-5 opacity-65">
                    <h4 className="font-bold text-ivory mb-1">{bannerName(bid)}</h4>
                    <p className="text-gray-500 text-xs">
                      Нет записей — импортируй историю круток сверху
                    </p>
                  </div>
                );
              }
              const lastFiveChar = matchCharacter(s.lastFiveName ?? '');
              const pityPct = Math.min(100, Math.round((s.currentPity / 80) * 100));
              const softPity = s.currentPity >= 65;

              return (
                <div key={bid} className="glass-panel solaris-crest p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-ivory truncate">{bannerName(bid)}</h4>
                    <span className="text-xs font-mono text-gray-400 shrink-0">
                      Всего: <b className="text-ivory">{s.total}</b>
                    </span>
                  </div>

                  {/* Шкала гаранта Pity */}
                  <div className="p-3 rounded-xl bg-bg/60 border border-glass-border">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xs text-gray-400">
                        Текущий Pity {softPity && <b className="text-amber-300">(Soft Pity!)</b>}
                      </span>
                      <span
                        className={`font-mono text-base font-extrabold ${
                          softPity ? 'text-amber-300' : 'text-ivory'
                        }`}
                      >
                        {s.currentPity} <span className="text-xs text-gray-500">/ 80</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          softPity
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                            : 'bg-gradient-to-r from-accent to-accent-light'
                        }`}
                        style={{ width: `${pityPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 rounded-xl bg-bg/50 border border-glass-border">
                      <p className="text-amber-300 font-extrabold text-lg tabular-nums">
                        {s.fiveStars}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">5★ дроп</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-bg/50 border border-glass-border">
                      <p className="text-purple-300 font-extrabold text-lg tabular-nums">
                        {s.fourStars}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">4★ дроп</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-bg/50 border border-glass-border">
                      <p className="text-ivory font-extrabold text-lg tabular-nums">
                        {s.avgPityAtFive || '—'}
                      </p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Ср. Pity</p>
                    </div>
                  </div>

                  {/* Последняя 5★ */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-glass-border text-xs">
                    <span className="text-gray-500">Последняя 5★:</span>
                    {s.lastFiveName ? (
                      <span className="flex items-center gap-2 min-w-0 font-semibold text-amber-200">
                        {lastFiveChar && (
                          <ImagePlaceholder
                            id={lastFiveChar.id}
                            initials={lastFiveChar.name.slice(0, 2)}
                            element={lastFiveChar.element}
                            className="w-6 h-7 rounded border border-amber-400/40 shrink-0 object-top"
                          />
                        )}
                        <span className="truncate">{s.lastFiveName}</span>
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {/* Журнал последних круток */}
      {data && data.pulls.length > 0 && (
        <div className="glass-panel solaris-crest p-3.5 sm:p-5">
          <h3 className="text-base sm:text-lg font-bold text-ivory mb-3 flex items-center gap-2 px-1 sm:px-0">
            <Star size={18} className="text-accent-light" /> Журнал круток (последние 100)
          </h3>
          <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
            {data.pulls.slice(0, 100).map((p) => {
              const c = matchCharacter(p.name);
              const isFive = p.rarity === 5;
              const isFour = p.rarity === 4;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 sm:gap-3 py-2 px-2.5 sm:px-3 rounded-xl border transition-colors ${
                    isFive
                      ? 'bg-amber-500/10 border-amber-400/35'
                      : isFour
                        ? 'bg-purple-500/10 border-purple-400/25'
                        : 'bg-transparent border-transparent hover:bg-glass-hover'
                  }`}
                >
                  {c ? (
                    <ImagePlaceholder
                      id={c.id}
                      initials={c.name.slice(0, 2)}
                      element={c.element}
                      className="w-7 h-9 rounded-md border border-glass-border shrink-0 object-top"
                    />
                  ) : (
                    <span className="w-7 h-9 rounded-md bg-bg-secondary border border-glass-border flex items-center justify-center shrink-0">
                      <Star size={12} className={RARITY_COLORS[p.rarity]} />
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-500 font-mono w-8 sm:w-10 shrink-0">
                    #{p.pullNumber}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs font-bold shrink-0 w-12 ${
                      RARITY_COLORS[p.rarity]
                    }`}
                  >
                    {'★'.repeat(p.rarity)}
                  </span>
                  <span className="text-sm font-medium text-ivory flex-1 min-w-0 truncate">
                    {p.name}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 shrink-0 hidden md:inline">
                    {bannerName(p.bannerId)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 shrink-0 tabular-nums font-mono">
                    {new Date(p.time).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Модалка с PowerShell one-liner */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="glass-panel solaris-crest w-full max-w-2xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 animate-slide-up max-h-[85vh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-ivory mb-4">Как достать URL круток</h3>
            <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3">
              Только для <b>Windows</b>. Для Mac/Linux используй инструкцию на{' '}
              <a
                href="https://wuwatracker.com/import"
                target="_blank"
                rel="noopener"
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
                Открой <b>Windows PowerShell</b> (Win+R → <code>powershell</code> → Enter)
              </li>
              <li>
                Вставь эту команду целиком:
                <pre className="mt-2 p-3 rounded-lg bg-bg-secondary border border-glass-border text-xs text-accent-light overflow-x-auto select-all cursor-text font-mono">
                  {'iwr -UseBasicParsing -Headers @{"User-Agent"="Mozilla/5.0"} https://raw.githubusercontent.com/wuwatracker/wuwatracker/747a48b1b994baa9c372a4fb933ea7588428bd4b/import.ps1 | iex'}
                </pre>
              </li>
              <li>Скрипт сам найдёт игру, прочитает лог и скопирует URL в буфер обмена</li>
              <li>Вставь URL в поле выше и нажми «Импортировать»</li>
            </ol>
            <p className="mt-4 text-xs text-gray-500">
              URL живёт ~24 часа. Если импорт не работает — запусти команду снова при открытой истории круток в игре.
            </p>
            <button
              onClick={() => setHelpOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-glass border border-glass-border text-ivory text-sm font-semibold hover:border-accent/40 focus-ring"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};