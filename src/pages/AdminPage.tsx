// Админка: редактор карточек персонажей (правки поверх бандла).
// Хранится в таблице character_edits, применяется у всех при старте сайта (src/data/overrides.ts).
import { useEffect, useState } from 'react';
import { ShieldCheck, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { useAuth } from '../hooks/useAuth';
import { apiGetCharacterOverrides, apiSaveCharacterOverride, apiDeleteCharacterOverride } from '../utils/api';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const ELEMENT_OPTIONS = ['Spectro', 'Havoc', 'Fusion', 'Glacio', 'Electro', 'Aero'];
const WEAPON_OPTIONS = ['Sword', 'Broadblade', 'Pistol', 'Gauntlets', 'Rectifier'];
const ROLE_OPTIONS = ['Main DPS', 'Sub DPS', 'Support', 'Healer', 'Defender'];
const TIER_OPTIONS = ['S', 'A', 'B', 'C', '-'];
const RARITY_OPTIONS = ['4', '5'];

interface FormState {
  title: string; role: string; rarity: string; element: string; weapon: string;
  tower: string; realm: string; strengths: string; weaknesses: string;
  echoSets: string; weapons: string; rotation: string; teams: string; materials: string;
}

const loadForm = (c: any): FormState => ({
  title: c.title ?? '',
  role: c.role ?? 'Main DPS',
  rarity: String(c.rarity ?? 5),
  element: c.element ?? 'Spectro',
  weapon: c.weapon ?? 'Sword',
  tower: c.metaRating?.tower ?? '-',
  realm: c.metaRating?.realm ?? '-',
  strengths: (c.strengths ?? []).join('\n'),
  weaknesses: (c.weaknesses ?? []).join('\n'),
  echoSets: JSON.stringify(c.echoSets ?? [], null, 2),
  weapons: JSON.stringify(c.weapons ?? [], null, 2),
  rotation: JSON.stringify(c.rotation ?? [], null, 2),
  teams: JSON.stringify(c.teams ?? [], null, 2),
  materials: JSON.stringify(c.materials ?? [], null, 2),
});

const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);
const inputClass = 'w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-sm text-ivory focus-ring';
const labelClass = 'block text-xs text-gray-400 mb-1.5';

export const AdminPage = () => {
  useDocumentMeta({ title: 'Админка', description: 'Редактор карточек персонажей Stellar Wiki.' });
  const { user, token } = useAuth();
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState<FormState | null>(null);
  const [overrideIds, setOverrideIds] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiGetCharacterOverrides()
      .then((r) => setOverrideIds(r.overrides.map((o) => o.id)))
      .catch(() => setOverrideIds([]));
  }, [token]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="glass-panel p-8 max-w-md text-center">
        <ShieldCheck size={32} className="text-red-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-ivory">Доступ закрыт</h2>
        <p className="text-gray-400 text-sm mt-2">Раздел доступен только аккаунту с ролью admin.</p>
      </div>
    );
  }

  const selectChar = (id: string) => {
    const c = CHARACTERS.find((x) => x.id === id);
    if (!c) return;
    setSelectedId(id);
    setForm(loadForm(c));
    setMsg(null);
  };

  const set = (patch: Partial<FormState>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const save = async () => {
    if (!form || !selectedId || !token) return;
    setBusy(true);
    setMsg(null);
    try {
      const parsed: Record<string, unknown> = {};
      for (const key of ['echoSets', 'weapons', 'rotation', 'teams', 'materials'] as const) {
        try {
          parsed[key] = JSON.parse(form[key] || '[]');
        } catch {
          setMsg({ kind: 'err', text: `Поле «${key}» — невалидный JSON, проверь скобки и запятые` });
          setBusy(false);
          return;
        }
      }
      const patch: Record<string, unknown> = {
        title: form.title,
        role: form.role,
        rarity: Number(form.rarity),
        element: form.element,
        weapon: form.weapon,
        metaRating: { tower: form.tower, realm: form.realm },
        strengths: lines(form.strengths),
        weaknesses: lines(form.weaknesses),
        ...parsed,
      };
      await apiSaveCharacterOverride(token, selectedId, patch);
      const r = await apiGetCharacterOverrides();
      setOverrideIds(r.overrides.map((o) => o.id));
      setMsg({ kind: 'ok', text: 'Сохранено. На сайте изменения появятся после обновления страницы (F5) — у всех посетителей.' });
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Не удалось сохранить' });
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!selectedId || !token) return;
    if (!window.confirm('Убрать все правки этого персонажа и вернуть базовые значения из бандла?')) return;
    setBusy(true);
    setMsg(null);
    try {
      await apiDeleteCharacterOverride(token, selectedId);
      const r = await apiGetCharacterOverrides();
      setOverrideIds(r.overrides.map((o) => o.id));
      setMsg({ kind: 'ok', text: 'Правка удалена. Нажми F5 и заново выбери персонажа, чтобы увидеть базовые значения.' });
    } catch (e) {
      setMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Не удалось сбросить' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-ivory flex items-center gap-3">
          <ShieldCheck size={26} className="text-accent-light" /> Админка
        </h2>
        <p className="text-gray-400 mt-1">Редактор карточек: правки хранятся на сервере и применяются при старте сайта у всех</p>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <label className="block">
          <span className={labelClass}>Персонаж</span>
          <select value={selectedId} onChange={(e) => selectChar(e.target.value)} className={inputClass}>
            <option value="">— выбери —</option>
            {CHARACTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{overrideIds.includes(c.id) ? ' · изменён' : ''}
              </option>
            ))}
          </select>
        </label>
        {msg && (
          <p className={`flex items-start gap-2 px-4 py-3 rounded-xl text-sm ${
            msg.kind === 'ok'
              ? 'bg-green-500/10 border border-green-500/30 text-green-300'
              : 'bg-red-500/10 border border-red-500/30 text-red-300'
          }`}>
            {msg.kind === 'ok' ? <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> : <AlertCircle size={16} className="shrink-0 mt-0.5" />}
            {msg.text}
          </p>
        )}
      </div>

      {form && (
        <>
          <div className="glass-panel p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="block sm:col-span-2">
              <span className={labelClass}>Титул</span>
              <input value={form.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Редкость</span>
              <select value={form.rarity} onChange={(e) => set({ rarity: e.target.value })} className={inputClass}>
                {RARITY_OPTIONS.map((r) => <option key={r} value={r}>{r}★</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Элемент</span>
              <select value={form.element} onChange={(e) => set({ element: e.target.value })} className={inputClass}>
                {ELEMENT_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Оружие</span>
              <select value={form.weapon} onChange={(e) => set({ weapon: e.target.value })} className={inputClass}>
                {WEAPON_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Роль</span>
              <select value={form.role} onChange={(e) => set({ role: e.target.value })} className={inputClass}>
                {ROLE_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Тир: Башня</span>
              <select value={form.tower} onChange={(e) => set({ tower: e.target.value })} className={inputClass}>
                {TIER_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Тир: Царство</span>
              <select value={form.realm} onChange={(e) => set({ realm: e.target.value })} className={inputClass}>
                {TIER_OPTIONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </label>
          </div>

          <div className="glass-panel p-5 grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className={labelClass}>Сильные стороны (по одной на строку)</span>
              <textarea rows={5} value={form.strengths} onChange={(e) => set({ strengths: e.target.value })} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Слабые стороны (по одной на строку)</span>
              <textarea rows={5} value={form.weaknesses} onChange={(e) => set({ weaknesses: e.target.value })} className={inputClass} />
            </label>
          </div>

          <div className="glass-panel p-5 space-y-4">
            <p className="text-sm font-semibold text-ivory">Глубокие данные (JSON — аккуратно со скобками)</p>
            {([
              ['echoSets', 'Эхо-наборы'],
              ['weapons', 'Оружие'],
              ['rotation', 'Ротация'],
              ['teams', 'Команды'],
              ['materials', 'Материалы'],
            ] as const).map(([key, label]) => (
              <label className="block" key={key}>
                <span className={labelClass}>{label}</span>
                <textarea
                  rows={6}
                  value={form[key]}
                  onChange={(e) => set({ [key]: e.target.value } as Partial<FormState>)}
                  className={`${inputClass} font-mono text-xs`}
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={save}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring disabled:opacity-50"
            >
              <Save size={16} /> {busy ? 'Сохраняю...' : 'Сохранить изменения'}
            </button>
            <button
              onClick={reset}
              disabled={busy}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm hover:bg-red-500/20 transition-colors focus-ring disabled:opacity-50"
            >
              <RotateCcw size={16} /> Сбросить к базовым
            </button>
          </div>
        </>
      )}
    </div>
  );
};