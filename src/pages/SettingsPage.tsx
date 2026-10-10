// Настройки: палитра, внешний вид, данные и аккаунт
import { useNavigate } from 'react-router-dom';
import { Palette, Database, LogOut, Download, RotateCcw, Trash2, Brush } from 'lucide-react';
import { useSettings, applyReduceMotion } from '../hooks/useSettings';
import { PALETTES, applyPalette, PaletteId } from '../utils/palette';

const Toggle = ({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: string; hint: string }) => (
  <button
    role="switch"
    aria-checked={on}
    onClick={() => onChange(!on)}
    className="w-full flex items-center justify-between gap-4 p-4 rounded-xl bg-glass border border-glass-border hover:border-accent/30 transition-colors focus-ring text-left"
  >
    <span className="min-w-0">
      <span className="block text-sm font-medium text-ivory">{label}</span>
      <span className="block text-xs text-gray-500 mt-0.5">{hint}</span>
    </span>
    <span className={`relative w-11 h-6 shrink-0 rounded-full border transition-colors ${on ? 'bg-accent/30 border-accent/50' : 'bg-bg-secondary border-glass-border'}`}>
      <span className={`absolute top-[2px] left-0 w-5 h-5 rounded-full bg-ivory shadow transition-transform duration-200 ${on ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </span>
  </button>
);

const ActionButton = ({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-xl border transition-colors focus-ring text-left ${
      danger
        ? 'bg-red-500/10 border-red-500/25 text-red-300 hover:bg-red-500/20'
        : 'bg-glass border-glass-border text-ivory hover:border-accent/30'
    }`}
  >
    <Icon size={18} className="shrink-0" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export const SettingsPage = () => {
  const [settings, setSettings] = useSettings();
  const navigate = useNavigate();

  const set = (patch: Partial<typeof settings>) => setSettings({ ...settings, ...patch });

  const exportBackup = () => {
    const data = {
      profile: localStorage.getItem('ww_profile'),
      mapCollected: localStorage.getItem('ww_map_collected'),
      settings: localStorage.getItem('ww_settings'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wuwa-wiki-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetMap = () => {
    if (window.confirm('Сбросить весь прогресс карты (отметки «собрано»)?')) {
      localStorage.removeItem('ww_map_collected');
      window.location.reload();
    }
  };

  const resetProfile = () => {
    if (window.confirm('Сбросить профиль и ростер до значений по умолчанию?')) {
      localStorage.removeItem('ww_profile');
      window.location.reload();
    }
  };

  const logout = () => {
    localStorage.removeItem('ww_auth');
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold text-ivory">Настройки</h2>
        <p className="text-gray-400 mt-1">Всё хранится локально в твоём браузере</p>
      </div>

      {/* Палитра */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          <Brush size={16} className="text-accent-light" /> Палитра акцента
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
            <button
              key={id}
              onClick={() => { set({ palette: id }); applyPalette(id); }}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all focus-ring ${
                settings.palette === id
                  ? 'border-accent/60 bg-accent/10 shadow-glow-sm'
                  : 'bg-glass border-glass-border hover:border-accent/30'
              }`}
              aria-pressed={settings.palette === id}
            >
              <span
                className="w-8 h-8 rounded-full border border-white/20 shrink-0"
                style={{ background: `linear-gradient(135deg, ${PALETTES[id].swatch}, #0d0d0f)` }}
              />
              <span className="text-sm text-ivory text-left">{PALETTES[id].label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Внешний вид */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          <Palette size={16} className="text-accent-light" /> Внешний вид
        </h3>
        <Toggle
          on={settings.reduceMotion}
          onChange={(v) => { set({ reduceMotion: v }); applyReduceMotion(v); }}
          label="Уменьшить анимации"
          hint="Полностью отключает переходы, дрейф фона и параллакс"
        />
        <Toggle
          on={settings.showMetaBadge}
          onChange={(v) => set({ showMetaBadge: v })}
          label="Бейдж META S на карточках"
          hint="Показывать значок меты для топовых персонажей в каталоге"
        />
      </section>

      {/* Данные и аккаунт */}
      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          <Database size={16} className="text-accent-light" /> Данные и аккаунт
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <ActionButton icon={Download} label="Скачать бэкап прогресса" onClick={exportBackup} />
          <ActionButton icon={RotateCcw} label="Сбросить прогресс карты" onClick={resetMap} />
          <ActionButton icon={Trash2} label="Сбросить профиль и ростер" onClick={resetProfile} danger />
          <ActionButton icon={LogOut} label="Выйти из аккаунта" onClick={logout} danger />
        </div>
      </section>
    </div>
  );
};