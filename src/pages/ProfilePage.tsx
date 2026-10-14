// Профиль: серверный ростер, UID игры, привязка WuWa с автоимпортом
import { useEffect, useState } from 'react';
import { Save, Trash2, UserPlus, Sword, Backpack, Gamepad2, RefreshCw, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiGetProfile, apiSaveProfile, apiImportWuwa, RosterEntry, ServerProfile } from '../utils/api';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PlayerProfile } from '../data/types';

const DEFAULT_LOCAL: PlayerProfile = { uid: '100000000', nickname: 'Rover', unionLevel: 60, signature: '', roster: [] };

export const ProfilePage = () => {
  const { user, token } = useAuth();
  const [local] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_LOCAL);

  const [profile, setProfile] = useState<ServerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uid, setUid] = useState('');
  const [pickId, setPickId] = useState('');
  const [pickLevel, setPickLevel] = useState(60);
  const [pickWeapon, setPickWeapon] = useState('');
  const [pickEcho, setPickEcho] = useState('');

  const [importOpen, setImportOpen] = useState(false);
  const [kuroToken, setKuroToken] = useState('');
  const [importing, setImporting] = useState(false);
  const [importDebug, setImportDebug] = useState<string | null>(null);

  const roster = profile?.roster ?? [];

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const p = await apiGetProfile(token);
      setProfile(p);
      setUid(p.uid ?? '');
      // Миграция: если на сервере пусто, а локально был ростер — заливаем один раз
      if (p.roster.length === 0 && local.roster.length > 0) {
        const migrated: RosterEntry[] = local.roster.map((r) => ({
          characterId: r.characterId, level: r.level, weapon: r.weapon, echoSet: r.echoSet, source: 'manual',
        }));
        const saved = await apiSaveProfile(token, { roster: migrated });
        setProfile(saved);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [token]);

  const save = async (payload: { uid?: string | null; roster?: RosterEntry[] }) => {
    if (!token) return;
    try {
      const p = await apiSaveProfile(token, payload);
      setProfile(p);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить');
    }
  };

  const addToRoster = () => {
    if (!pickId) return;
    save({ roster: [...roster, { characterId: pickId, level: pickLevel, weapon: pickWeapon || '—', echoSet: pickEcho || '—', source: 'manual' }] });
    setPickId(''); setPickWeapon(''); setPickEcho('');
  };

  const removeFromRoster = (charId: string) => {
    save({ roster: roster.filter((r) => r.characterId !== charId) });
  };

  const doImport = async () => {
    if (!token || !kuroToken.trim()) return;
    setImporting(true);
    setImportDebug(null);
    setError(null);
    try {
            await apiImportWuwa(token, kuroToken.trim());
      const p = await apiGetProfile(token);
      setProfile(p);
      setUid(p.uid ?? '');
      setImportOpen(false);
      setKuroToken('');
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : 'Импорт не удался';
      setError(msg);
      if (e?.message?.includes('Kuro')) setImportDebug(String((e as any).debug ? JSON.stringify((e as any).debug, null, 2) : ''));
    } finally {
      setImporting(false);
    }
  };

  const available = CHARACTERS.filter((c) => !roster.some((r) => r.characterId === c.id));
  const inputClass = 'w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-sm text-ivory focus-ring';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-light to-accent flex items-center justify-center text-3xl font-bold border-2 border-glass-border shadow-glow shrink-0 text-bg">
            {(user?.nickname ?? 'R').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-ivory">{user?.nickname}</h2>
            <p className="text-accent-light font-mono text-sm">{user?.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                placeholder="UID в игре (например 100234567)"
                className="px-3 py-2 rounded-lg bg-bg-secondary border border-glass-border text-sm font-mono w-48 focus-ring"
                aria-label="Игровой UID"
              />
              <button onClick={() => save({ uid })} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm hover:border-accent/40 transition-colors focus-ring">
                <Save size={14} /> Сохранить UID
              </button>
              <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring">
                <Gamepad2 size={14} /> Привязать WuWa
              </button>
              {profile?.importedAt && (
                <span className="text-[11px] text-gray-500">импорт: {new Date(profile.importedAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <div className="glass-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-ivory">Мой ростер ({roster.length})</h3>
          {loading && <RefreshCw size={16} className="animate-spin text-gray-500" />}
        </div>

        {roster.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">Пока пусто. Добавь вручную или привяжи аккаунт игры.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {roster.map((r) => {
              const char = getCharacterById(r.characterId);
              if (!char) return null;
              return (
                <div key={r.characterId} className="p-3 rounded-xl bg-glass border border-glass-border flex items-center gap-3">
                  <ImagePlaceholder id={char.id} initials={char.name.slice(0, 2)} element={char.element} className="w-12 h-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ivory truncate">
                      {char.name} · ур. {r.level}
                      {r.source === 'game' && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent-light">из игры</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Sword size={11} className="shrink-0" /> {r.weapon || '—'}
                      <span className="mx-0.5">·</span>
                      <Backpack size={11} className="shrink-0" /> {r.echoSet || '—'}
                    </p>
                  </div>
                  <button onClick={() => removeFromRoster(r.characterId)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-ring" aria-label={`Убрать ${char.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-glass-border pt-4">
          <p className="text-sm text-gray-400 mb-3 flex items-center gap-2"><UserPlus size={16} /> Добавить вручную:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select value={pickId} onChange={(e) => setPickId(e.target.value)} className={inputClass} aria-label="Персонаж">
              <option value="">— персонаж —</option>
              {available.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" min={1} max={90} value={pickLevel} onChange={(e) => setPickLevel(Number(e.target.value))} className={inputClass} aria-label="Уровень" />
            <input value={pickWeapon} onChange={(e) => setPickWeapon(e.target.value)} placeholder="Оружие" className={inputClass} aria-label="Оружие" />
            <input value={pickEcho} onChange={(e) => setPickEcho(e.target.value)} placeholder="Эхо-набор" className={inputClass} aria-label="Эхо-набор" />
            <button onClick={addToRoster} disabled={!pickId} className="py-2 rounded-lg bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-semibold disabled:opacity-40 hover:shadow-glow transition-all focus-ring">
              Добавить
            </button>
          </div>
        </div>
      </div>

      {/* Модалка привязки */}
      {importOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setImportOpen(false)} role="dialog" aria-modal="true">
          <div className="glass-panel w-full max-w-lg p-6 animate-slide-up max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ivory flex items-center gap-2"><Gamepad2 size={18} className="text-accent-light" /> Привязка аккаунта WuWa</h3>
              <button onClick={() => setImportOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-ivory focus-ring" aria-label="Закрыть"><X size={16} /></button>
            </div>

            <div className="space-y-3 text-sm text-gray-300">
              <p className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-xs">
                Экспериментально: импорт идёт через неофициальное API сообщества Kuro. Может сломаться после обновлений игры — тогда просто веди ростер руками.
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-gray-400">
                <li>Открой <span className="text-ivory">kurobbs.com</span> и войди в аккаунт, привязанный к игре</li>
                <li>Нажми F12 → вкладка Network → обнови страницу → кликни любой запрос к api</li>
                <li>В Request Headers найди <span className="font-mono text-accent-light">token</span> и скопируй значение</li>
                <li>Вставь ниже и нажми «Импортировать»</li>
              </ol>
              <textarea
                value={kuroToken}
                onChange={(e) => setKuroToken(e.target.value)}
                placeholder="Токен kurobbs..."
                rows={3}
                className="w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-xs font-mono focus-ring"
              />
              {importDebug && (
                <pre className="p-3 rounded-lg bg-bg-secondary border border-glass-border text-[10px] text-gray-400 overflow-x-auto">{importDebug}</pre>
              )}
              <button
                onClick={doImport}
                disabled={importing || !kuroToken.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold disabled:opacity-40 hover:shadow-glow transition-all focus-ring flex items-center justify-center gap-2"
              >
                {importing && <RefreshCw size={16} className="animate-spin" />}
                {importing ? 'Тянем данные из игры...' : 'Импортировать ростер'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};