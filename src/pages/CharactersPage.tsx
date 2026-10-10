// Каталог персонажей: кастомные фильтры-дропадауны, поиск, пустое состояние
import { useMemo, useState } from 'react';
import { CHARACTERS } from '../data/characters';
import { CharacterCard } from '../components/characters/CharacterCard';
import { ELEMENTS, WEAPON_LABELS, WEAPON_ICONS } from '../utils/constants';
import { Search, Filter, SearchX, RotateCcw } from 'lucide-react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { FilterDropdown, FilterOption } from '../components/ui/FilterDropdown';
import { WeaponType } from '../data/types';

const ELEMENT_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Все элементы' },
  ...Object.entries(ELEMENTS).map(([key, v]) => ({ value: key, label: v.label, icon: v.icon })),
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
  useDocumentMeta({ title: 'Персонажи', description: 'Каталог резонаторов Wuthering Waves: сборки, ротации, тиры и лор.' });
  const [search, setSearch] = useState('');
  const [filterElement, setFilterElement] = useState('all');
  const [filterWeapon, setFilterWeapon] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');

  const hasFilters = search !== '' || filterElement !== 'all' || filterWeapon !== 'all' || filterRarity !== 'all';

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ivory">Персонажи</h2>
          <p className="text-gray-400 mt-1">Каталог резонаторов: сборки, мета, ротации</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени... (Ctrl+K)"
            className="pl-10 pr-4 py-2.5 bg-glass border border-glass-border rounded-xl text-sm focus-ring w-full md:w-72"
            aria-label="Поиск персонажей"
          />
        </div>
      </div>

      {/* Панель фильтров: relative z-30 поднимает её слой НАД карточками,
          иначе backdrop-blur карточек перекрывает открытый список */}
      <div className="glass-panel p-3 flex flex-wrap gap-2 items-center relative z-30">
        <span className="px-2 text-gray-500" aria-hidden="true"><Filter size={16} /></span>
        <FilterDropdown value={filterElement} options={ELEMENT_OPTIONS} onChange={setFilterElement} ariaLabel="Фильтр по элементу" />
        <FilterDropdown value={filterWeapon} options={WEAPON_OPTIONS} onChange={setFilterWeapon} ariaLabel="Фильтр по оружию" />
        <FilterDropdown value={filterRarity} options={RARITY_OPTIONS} onChange={setFilterRarity} ariaLabel="Фильтр по редкости" />
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-ivory hover:bg-glass-hover transition-colors focus-ring"
          >
            <RotateCcw size={12} /> Сбросить
          </button>
        )}
        <span className="text-xs text-gray-500 ml-auto pr-1">Найдено: {filtered.length}</span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((char) => <CharacterCard key={char.id} character={char} />)}
        </div>
      ) : (
        <div className="glass-panel py-16 flex flex-col items-center text-center gap-4 animate-fade-in">
          <SearchX size={40} className="text-gray-600" />
          <div>
            <p className="text-ivory font-semibold">Никого не нашли</p>
            <p className="text-gray-500 text-sm mt-1">Попробуй изменить фильтры или сбросить их совсем</p>
          </div>
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};