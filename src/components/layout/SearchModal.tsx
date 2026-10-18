// Глобальная командная палитра поиска (Ctrl+K): персонажи с портретами, элементами и быстрыми переходами
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, ArrowUpRight } from 'lucide-react';
import { CHARACTERS } from '../../data/characters';
import { ELEMENTS, WEAPON_ICONS, WEAPON_LABELS, TIER_STYLES } from '../../utils/constants';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';

const QUICK_ROUTES = [
  { label: 'Каталог персонажей', path: '/characters', hint: '61 резонатор' },
  { label: 'Бестиарий Соларис-3', path: '/bestiary', hint: 'оружие, эхо, враги' },
  { label: 'Pull Tracker', path: '/pulls', hint: 'история круток и pity' },
  { label: 'Интерактивная карта', path: '/map', hint: 'Хуанлон и Рината' },
  { label: 'Мета и тир-лист', path: '/meta', hint: 'Башня и Wastes' },
  { label: 'Калькулятор урона', path: '/calculator', hint: 'расчёт DPS цикла' },
];

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHARACTERS.slice(0, 8);
    return CHARACTERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.element.toLowerCase().includes(q) ||
        ELEMENTS[c.element].label.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q),
    ).slice(0, 12);
  }, [query]);

  if (!isOpen) return null;

  const go = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start justify-center pt-16 sm:pt-24 p-3 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по базе Stellar Wiki"
    >
      <div
        className="glass-panel solaris-crest w-full max-w-2xl p-4 sm:p-5 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Поле ввода */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-bg/80 border border-glass-border focus-within:border-accent/50 transition-colors">
          <Search size={18} className="text-accent-light shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск персонажа по имени, стихии или роли..."
            className="flex-1 bg-transparent outline-none text-sm sm:text-base text-ivory placeholder-gray-500"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-[11px] font-mono bg-bg-secondary border border-glass-border rounded text-gray-400">
            Esc
          </kbd>
        </div>

        {/* Быстрые разделы, когда строка пустая */}
        {!query.trim() && (
          <div className="mt-4">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 flex items-center gap-1.5">
              <Compass size={12} className="text-accent-light" /> Быстрый переход
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_ROUTES.map((r) => (
                <button
                  key={r.path}
                  onClick={() => go(r.path)}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-glass border border-glass-border hover:border-accent/40 hover:bg-glass-hover text-left transition-all focus-ring group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ivory truncate group-hover:text-accent-light transition-colors">
                      {r.label}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{r.hint}</p>
                  </div>
                  <ArrowUpRight size={14} className="text-gray-500 group-hover:text-accent-light shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Список найденных резонаторов */}
        <div className="mt-4">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">
            {query.trim() ? `Найдено резонаторов: ${results.length}` : 'Популярные резонаторы'}
          </p>
          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
            {results.map((c) => {
              const el = ELEMENTS[c.element];
              return (
                <button
                  key={c.id}
                  onClick={() => go(`/characters/${c.id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-glass-hover border border-transparent hover:border-glass-border text-left transition-all focus-ring group"
                >
                  <ImagePlaceholder
                    id={c.id}
                    initials={c.name.slice(0, 2)}
                    element={c.element}
                    className="w-9 h-11 rounded-lg border border-glass-border shrink-0 object-top"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-ivory group-hover:text-accent-light transition-colors truncate">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-yellow-400 font-bold shrink-0">
                        {'★'.repeat(c.rarity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <img src={el.icon} alt="" className="w-3.5 h-3.5" draggable={false} />
                        {el.label}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <img src={WEAPON_ICONS[c.weapon]} alt="" className="w-3.5 h-3.5" draggable={false} />
                        {WEAPON_LABELS[c.weapon]}
                      </span>
                      <span className="hidden sm:inline">· {c.role}</span>
                    </div>
                  </div>
                  {c.metaRating.tower !== '-' && (
                    <span
                      className={`px-2 py-0.5 rounded-md border text-xs font-bold shrink-0 ${
                        TIER_STYLES[c.metaRating.tower]
                      }`}
                    >
                      {c.metaRating.tower}
                    </span>
                  )}
                </button>
              );
            })}
            {results.length === 0 && (
              <p className="text-center text-gray-500 py-8 text-sm">
                По запросу «{query}» резонаторы не найдены
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};