// Мета: кастомные фильтры, тир-лист персонажей, тир-лист команд, сворачиваемые блоки
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, UsersRound } from 'lucide-react';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { TIER_STYLES } from '../utils/constants';
import { TEAM_TIERS } from '../data/teams';
import { Tier } from '../data/types';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { FilterDropdown, FilterOption } from '../components/ui/FilterDropdown';

const TIERS: Tier[] = ['S', 'A', 'B', 'C'];

const MODE_OPTIONS: FilterOption[] = [
  { value: 'tower', label: 'Башня невзгод' },
  { value: 'realm', label: 'Иллюзорное царство' },
];

const ROLE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Все роли' },
  { value: 'Main DPS', label: 'Main DPS' },
  { value: 'Sub DPS', label: 'Sub DPS' },
  { value: 'Support', label: 'Support' },
  { value: 'Healer', label: 'Healer' },
];

const Collapse = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-glass-hover transition-colors focus-ring" aria-expanded={open}>
        <span className="font-semibold text-ivory">{title}</span>
        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-4 pt-0 animate-fade-in">{children}</div>}
    </div>
  );
};

export const MetaPage = () => {
  useDocumentMeta({ title: 'Мета', description: 'Тир-листы персонажей и команд для Башни невзгод и Иллюзорного царства. Лучшие эхо-наборы и оружие.' });
  const [mode, setMode] = useState<'tower' | 'realm'>('tower');
  const [role, setRole] = useState('all');

  const filtered = CHARACTERS.filter((c) => role === 'all' || c.role === role);

  const echoStats = new Map<string, number>();
  CHARACTERS.forEach((c) => c.echoSets.filter((s) => s.priority === 1).forEach((s) => echoStats.set(s.name, (echoStats.get(s.name) || 0) + 1)));

  const weaponStats = new Map<string, number>();
  CHARACTERS.forEach((c) => c.weapons.forEach((w) => {
    if (!weaponStats.has(w.name) || weaponStats.get(w.name)! < w.rating) weaponStats.set(w.name, w.rating);
  }));
  const topWeapons = [...weaponStats.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-ivory">Мета</h2>
        <p className="text-gray-400 mt-1">Тир-листы актуального патча: персонажи и готовые связки</p>
      </div>

      {/* Панель фильтров: relative z-30 — слой выше стеклянных рядов тир-листа */}
      <div className="glass-panel p-3 flex flex-wrap gap-2 items-center relative z-30">
        <FilterDropdown
          value={mode}
          options={MODE_OPTIONS}
          onChange={(v) => setMode(v as 'tower' | 'realm')}
          ariaLabel="Игровой режим"
        />
        <FilterDropdown
          value={role}
          options={ROLE_OPTIONS}
          onChange={setRole}
          ariaLabel="Роль персонажа"
        />
        <span className="text-xs text-gray-500 ml-auto pr-1">Показано: {filtered.length}</span>
      </div>

      {/* Тир-лист персонажей */}
      <div className="space-y-4">
        {TIERS.map((tier) => {
          const chars = filtered.filter((c) => c.metaRating[mode] === tier);
          return (
            <div key={tier} className="flex flex-col md:flex-row gap-3">
              <div className={`w-full md:w-20 rounded-xl flex items-center justify-center text-2xl font-bold border shrink-0 ${TIER_STYLES[tier]}`}>
                {tier}
              </div>
              <div className="flex-1 glass-panel p-3 flex flex-wrap gap-3 min-h-[84px] items-center">
                {chars.map((c) => (
                  <Link key={c.id} to={`/characters/${c.id}`} className="flex flex-col items-center gap-1 group focus-ring rounded-lg" aria-label={c.name}>
                    <ImagePlaceholder id={c.id} initials={c.name.slice(0, 2)} element={c.element} className="w-14 h-14 rounded-xl border border-glass-border group-hover:border-accent/60 group-hover:shadow-glow-sm transition-all" />
                    <span className="text-[11px] text-gray-300 group-hover:text-ivory">{c.name}</span>
                  </Link>
                ))}
                {chars.length === 0 && <span className="text-gray-600 text-sm px-2">пусто</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Тир-лист команд */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-ivory">
          <UsersRound size={20} className="text-accent-light" /> Тир-лист команд
        </h3>
        {TIERS.filter((t) => TEAM_TIERS.some((team) => team.tier === t)).map((tier) => (
          <div key={tier} className="flex flex-col md:flex-row gap-3">
            <div className={`w-full md:w-20 rounded-xl flex items-center justify-center text-2xl font-bold border shrink-0 ${TIER_STYLES[tier]}`}>
              {tier}
            </div>
            <div className="flex-1 grid md:grid-cols-2 gap-3">
              {TEAM_TIERS.filter((t) => t.tier === tier).map((team, i) => (
                <div key={i} className="glass-panel p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex -space-x-2 shrink-0">
                      {team.members.map((mid) => {
                        const m = getCharacterById(mid);
                        if (!m) return null;
                        return (
                          <Link key={mid} to={`/characters/${mid}`} aria-label={m.name} className="focus-ring rounded-lg">
                            <ImagePlaceholder id={m.id} initials={m.name.slice(0, 2)} element={m.element} className="w-9 h-11 rounded-lg border border-glass-border hover:border-accent/50 transition-colors" />
                          </Link>
                        );
                      })}
                    </div>
                    <span className="font-semibold text-ivory text-sm">{team.name}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{team.note}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Сворачиваемые блоки */}
      <Collapse title="Лучшие эхо-наборы">
        <div className="grid sm:grid-cols-2 gap-3">
          {[...echoStats.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => (
            <div key={name} className="p-3 rounded-lg bg-glass border border-glass-border flex justify-between items-center">
              <span className="text-sm text-ivory">{name}</span>
              <span className="text-xs text-accent-light">{count} перс.</span>
            </div>
          ))}
        </div>
      </Collapse>

      <Collapse title="Тир-лист оружия">
        <div className="space-y-2">
          {topWeapons.map(([name, rating], i) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-6 text-center text-sm text-gray-500 font-mono">{i + 1}</span>
              <span className="flex-1 text-sm text-ivory truncate">{name}</span>
              <div className="w-32 h-2 rounded-full bg-bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-to-r from-accent to-accent-light" style={{ width: `${rating}%` }} />
              </div>
              <span className="w-10 text-right text-xs text-accent-light font-mono">{rating}%</span>
            </div>
          ))}
        </div>
      </Collapse>
    </div>
  );
};