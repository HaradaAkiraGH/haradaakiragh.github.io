// Pull Tracker: импорт истории круток, статистика pity, список с портретами.
// Мобильная строка: портрет + #номер + звёзды + имя + короткая дата (без переносов).
import { useEffect, useState } from 'react';
import { Link2, Trash2, AlertCircle, Star, Dice5, RefreshCw, HelpCircle } from 'lucide-react';
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
  3: 'text-blue-400',
  4: 'text-purple-400',
  5: 'text-yellow-400',
};

export const PullsPage = () => {
  const { token } = useAuth();
  const [data, setData] = useState<PullsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; perBanner: Record<string, number> } | null>(null);
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
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

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
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ivory flex items-center gap-2">
            <Dice5 className="text-accent-light" /> Pull Tracker
          </h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">История круток и статистика pity</p>
        </div>
        <button onClick={() => setHelpOpen(true)} className="p-2 rounded-lg bg-glass border border-glass-border text-gray-400 hover:text-ivory focus-ring" aria-label="Как достать URL">
          <HelpCircle size={16} />
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
        <p className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-sm">
          Импортировано: <b>{importResult.imported}</b> круток
          {Object.entries(importResult.perBanner).map(([b, n]) => (
            <span key={b} className="ml-2 text-xs text-green-400">({bannerName(b)}: {n})</span>
          ))}
        </p>
      )}

      <div className="glass-panel p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-ivory mb-3 flex items-center gap-2">
          <Link2 size={18} className="text-accent-light" /> Импорт из игры
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL истории круток (https://aki-gm-resources-oversea...)"
            className="flex-1 w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-xs sm:text-sm font-mono text-ivory placeholder-gray-500 focus-ring"
          />
          <div className="flex gap-2">
            <button
              onClick={doImport}
              disabled={importing || !url.trim()}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold disabled:opacity-40 hover:shadow-glow transition-all focus-ring flex items-center justify-center gap-2"
            >
              {importing && <RefreshCw size={14} className="animate-spin" />}
              {importing ? 'Импорт...' : 'Импортировать'}
            </button>
            <button onClick={doReset} className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm hover:bg-red-500/20 focus-ring flex items-center gap-1.5" title="Удалить всю историю">
              <Trash2 size={14} /> Сброс
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-8 text-center text-gray-500">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {(data?.banners?.length ? data.banners.map((b) => b.id) : ['1', '2', '3', '4']).map((bid) => {
            const s = data?.stats[bid] ?? null;
            if (!s) {
              return (
                <div key={bid} className="glass-panel p-4 sm:p-5 opacity-60">
                  <h4 className="font-semibold text-ivory mb-2">{bannerName(bid)}</h4>
                  <p className="text-gray-500 text-sm">Нет данных — импортируй историю</p>
                </div>
              );
            }
            const lastFiveChar = matchCharacter(s.lastFiveName ?? '');
            return (
              <div key={bid} className="glass-panel p-4 sm:p-5">
                <h4 className="font-semibold text-ivory mb-3 truncate">{bannerName(bid)}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Всего круток</p>
                    <p className="text-ivory font-bold text-xl">{s.total}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Текущий pity</p>
                    <p className={`font-bold text-xl ${s.currentPity >= 70 ? 'text-yellow-400' : 'text-ivory'}`}>{s.currentPity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">5★ получено</p>
                    <p className="text-yellow-400 font-semibold">{s.fiveStars}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Средний pity на 5★</p>
                    <p className="text-ivory font-semibold">{s.avgPityAtFive || '—'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">4★</p>
                    <p className="text-purple-400">{s.fourStars}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Последняя 5★</p>
                    {s.lastFiveName ? (
                      <span className="flex items-center gap-1.5 mt-1 min-w-0">
                        {lastFiveChar && (
                          <ImagePlaceholder
                            id={lastFiveChar.id}
                            initials={lastFiveChar.name.slice(0, 2)}
                            element={lastFiveChar.element}
                            className="w-6 h-8 rounded border border-glass-border shrink-0"
                          />
                        )}
                        <span className="text-ivory truncate">{s.lastFiveName}</span>
                      </span>
                    ) : (
                      <p className="text-ivory">—</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {data && data.pulls.length > 0 && (
        <div className="glass-panel p-3 sm:p-5">
          <h3 className="text-base sm:text-lg font-semibold text-ivory mb-3 flex items-center gap-2 px-1 sm:px-0">
            <Star size={18} className="text-accent-light" /> Последние крутки
          </h3>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {data.pulls.slice(0, 100).map((p) => {
              const c = matchCharacter(p.name);
              return (
                <div key={p.id} className="flex items-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded-lg hover:bg-glass-hover transition-colors">
                  {c ? (
                    <ImagePlaceholder
                      id={c.id}
                      initials={c.name.slice(0, 2)}
                      element={c.element}
                      className="w-7 h-9 rounded-md border border-glass-border shrink-0"
                    />
                  ) : (
                    <span className="w-7 h-9 rounded-md bg-bg-secondary border border-glass-border flex items-center justify-center shrink-0">
                      <Star size={12} className={RARITY_COLORS[p.rarity]} />
                    </span>
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-500 font-mono w-8 sm:w-10 shrink-0">#{p.pullNumber}</span>
                  <span className={`text-[10px] sm:text-xs font-semibold shrink-0 ${RARITY_COLORS[p.rarity]}`}>
                    {'★'.repeat(p.rarity)}
                  </span>
                  <span className="text-sm text-ivory flex-1 min-w-0 truncate">{p.name}</span>
                  <span className="text-[10px] sm:text-xs text-gray-500 shrink-0 hidden md:inline">{bannerName(p.bannerId)}</span>
                  <span className="text-[10px] sm:text-xs text-gray-600 shrink-0 tabular-nums">
                    {new Date(p.time).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {helpOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4" onClick={() => setHelpOpen(false)}>
          <div className="glass-panel w-full max-w-2xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 animate-slide-up max-h-[85vh] overflow-y-auto pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-ivory mb-4">Как достать URL круток</h3>
            <p className="text-xs text-yellow-200 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 mb-3">
              Только для <b>Windows</b>. Для Mac/Linux используй ручной путь на <a href="https://wuwatracker.com/import" target="_blank" rel="noopener" className="underline text-accent-light">wuwatracker.com/import</a>.
            </p>
            <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
              <li>Запусти <b>Wuthering Waves</b> и открой в игре <b>Convene History</b> (историю круток)</li>
              <li>Открой <b>Windows PowerShell</b> (Win+R → <code>powershell</code> → Enter)</li>
              <li>Вставь эту команду целиком:
                <pre className="mt-2 p-3 rounded-lg bg-bg-secondary text-xs text-accent-light overflow-x-auto select-all cursor-text">
                  {'iwr -UseBasicParsing -Headers @{"User-Agent"="Mozilla/5.0"} https://raw.githubusercontent.com/wuwatracker/wuwatracker/747a48b1b994baa9c372a4fb933ea7588428bd4b/import.ps1 | iex'}
                </pre>
              </li>
              <li>Скрипт сам найдёт игру, прочитает лог и скопирует URL в буфер обмена</li>
              <li>Вставь URL в поле выше и нажми «Импортировать»</li>
            </ol>
            <p className="mt-4 text-xs text-gray-500">
              URL живёт ~24 часа. Если импорт не работает — запусти команду снова при открытой истории круток в игре.
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Безопасность: команда только читает лог-файл игры, ничего не пишет и не отправляет.
            </p>
            <button onClick={() => setHelpOpen(false)} className="mt-4 w-full py-2.5 rounded-xl bg-glass border border-glass-border text-ivory text-sm hover:border-accent/40 focus-ring">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};