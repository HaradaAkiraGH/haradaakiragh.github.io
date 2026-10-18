// Каталог: быстрые иконки-фильтры по стихиям и оружию, 3 колонки мини-карточек на телефоне
import { useMemo, useState } from 'react';
import { CHARACTERS } from '../data/characters';
import { CharacterCard } from '../components/characters/CharacterCard';
import { ELEMENTS, WEAPON_LABELS, WEAPON_ICONS } from '../utils/constants';
import { Search, Filter, SearchX, RotateCcw, Sparkles } from 'lucide-react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { FilterDropdown, FilterOption } from '../components/ui/FilterDropdown';
import { ElementType, WeaponType } from '../data/types';

const ELEMENT_KEYS = Object.keys(ELEMENTS) as ElementType[];

const ELEMENT_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Все элементы' },
  ...ELEMENT_KEYS.map((key) => ({
    value: key,
    label: ELEMENTS[key].label,
    icon: ELEMENTS[key].icon,
  })),
];
const WEAPON_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Всё оружие' },
  ...Object.entries(WEAPON_LABELS).map(([key, label]) => ({
    value: key,
    label,
    icon: WEAPON_ICONS[key as WeaponType],
  })),
];
const RARITY_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Любая редкость' },
  { value: '5', label: '5 звёзд', stars: 5 },
  { value: '4', label: '4 звезды', stars: 4 },
];

export const CharactersPage = () => {
  useDocumentMeta({
    title: 'Персонажи',
    description: 'Каталог резонаторов Wuthering Waves: сборки, ротации, тиры и лор.',
  });
  const [search, setSearch] = useState('');
  const [filterElement, setFilterElement] = useState('all');
  const [filterWeapon, setFilterWeapon] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');

  const hasFilters =
    search !== '' || filterElement !== 'all' || filterWeapon !== 'all' || filterRarity !== 'all';

  const resetFilters = () => {
    setSearch('');
    setFilterElement('all');
    setFilterWeapon('all');
    setFilterRarity('all');
  };

  const filtered = useMemo(() => {
    return CHARACTERS.filter((c) => {
      if (filterElement !== 'all' && c.element !== filterElement) return false;
      if (filterWeapon !== 'all' && c.weapon !== filterWeapon) return false;
      if (filterRarity !== 'all' && c.rarity !== Number(filterRarity)) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filterElement, filterWeapon, filterRarity]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Шапка */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-light mb-1.5">
            <Sparkles size={12} /> Архив резонаторов · {CHARACTERS.length} в базе
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ivory tracking-tight">
            Персонажи
          </h2>
          <p className="text-gray-400 mt-0.5 text-sm">
            Полный ростер Соларис-3: билды, эхо-наборы, ротации и мета-рейтинг
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={17} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени... (Ctrl+K)"
            className="pl-10 pr-4 py-2.5 bg-glass border border-glass-border rounded-xl text-sm text-ivory placeholder-gray-500 focus-ring w-full md:w-72"
            aria-label="Поиск персонажей"
          />
        </div>
      </div>

      {/* Панель фильтров: быстрые кнопки стихий + дропдауны (relative z-30 — выше карточек) */}
      <div className="glass-panel solaris-crest p-2.5 sm:p-3.5 space-y-2.5 relative z-30">
        {/* Быстрая лента стихий как в самой игре */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setFilterElement('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 focus-ring ${
              filterElement === 'all'
                ? 'bg-accent/20 border-accent/50 text-accent-light shadow-glow-sm'
                : 'bg-bg/50 border-glass-border text-gray-400 hover:text-ivory'
            }`}
          >
            Все стихии
          </button>
          {ELEMENT_KEYS.map((elKey) => {
            const el = ELEMENTS[elKey];
            const active = filterElement === elKey;
            return (
              <button
                key={elKey}
                onClick={() => setFilterElement(active ? 'all' : elKey)}
                title={el.label}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all shrink-0 focus-ring ${
                  active
                    ? 'bg-accent/20 border-accent/55 text-ivory shadow-glow-sm'
                    : 'bg-bg/50 border-glass-border text-gray-400 hover:text-ivory hover:border-white/20'
                }`}
              >
                <img src={el.icon} alt="" className="w-4 h-4" draggable={false} />
                <span className="hidden sm:inline">{el.label}</span>
              </button>
            );
          })}
        </div>

        {/* Вторая строка: дропдауны оружия и редкости + счётчик */}
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-glass-border">
          <span className="px-1 text-gray-500 hidden sm:inline" aria-hidden="true">
            <Filter size={15} />
          </span>
          <FilterDropdown
            value={filterElement}
            options={ELEMENT_OPTIONS}
            onChange={setFilterElement}
            ariaLabel="Фильтр по элементу"
          />
          <FilterDropdown
            value={filterWeapon}
            options={WEAPON_OPTIONS}
            onChange={setFilterWeapon}
            ariaLabel="Фильтр по оружию"
          />
          <FilterDropdown
            value={filterRarity}
            options={RARITY_OPTIONS}
            onChange={setFilterRarity}
            ariaLabel="Фильтр по редкости"
          />
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-accent-light hover:bg-accent/15 border border-accent/30 transition-colors focus-ring"
            >
              <RotateCcw size={12} /> Сбросить
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto pr-1 font-mono">
            {filtered.length} / {CHARACTERS.length}
          </span>
        </div>
      </div>

      {/* Сетка: 3 колонки на телефоне, 4 на широком экране */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
          {filtered.map((char) => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </div>
      ) : (
        <div className="glass-panel py-16 flex flex-col items-center text-center gap-4 animate-fade-in">
          <SearchX size={40} className="text-gray-600" />
          <div>
            <p className="text-ivory font-semibold">Никого не нашли</p>
            <p className="text-gray-500 text-sm mt-1">
              Попробуй изменить фильтры или сбросить их совсем
            </p>
          </div>
          <button onClick={resetFilters} className="btn-luxury focus-ring">
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};