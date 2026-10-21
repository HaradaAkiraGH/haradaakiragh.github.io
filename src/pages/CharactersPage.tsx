// Каталог персонажей Stellar Wiki:
// Единая панель стихий, интерактивные чипы оружия с иконками, фильтр ролей, редкости и сортировка
// (без дублирующего выпадающего списка «Все элементы»)
import { useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
  RotateCcw,
  ArrowUpDown,
  LayoutGrid,
  Grid,
  X,
} from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { CharacterCard } from '../components/characters/CharacterCard';
import {
  ELEMENTS,
  WEAPON_LABELS,
  WEAPON_ICONS,
} from '../utils/constants';
import type { ElementType, WeaponType, CharacterRole } from '../data/types';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const ROLE_OPTIONS: CharacterRole[] = [
  'Main DPS',
  'Sub DPS',
  'Support',
  'Healer',
  'Defender',
];

const TIER_WEIGHT: Record<string, number> = {
  S: 4,
  A: 3,
  B: 2,
  C: 1,
  '-': 0,
};

export const CharactersPage = () => {
  useDocumentMeta({
    title: 'Персонажи — Stellar Wiki',
    description: 'Полный каталог резонаторов Wuthering Waves (61 персонаж): билды, эхо, ротации и мета-рейтинг.',
  });

  const [search, setSearch] = useState('');
  const [filterElement, setFilterElement] = useState<'all' | ElementType>('all');
  const [filterWeapon, setFilterWeapon] = useState<'all' | WeaponType>('all');
  const [filterRarity, setFilterRarity] = useState<'all' | 5 | 4>('all');
  const [filterRole, setFilterRole] = useState<'all' | CharacterRole>('all');
  const [sortBy, setSortBy] = useState<'default' | 'meta' | 'name' | 'rarity'>('default');
  const [compactGrid, setCompactGrid] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = CHARACTERS.filter((c) => {
      if (filterElement !== 'all' && c.element !== filterElement) return false;
      if (filterWeapon !== 'all' && c.weapon !== filterWeapon) return false;
      if (filterRarity !== 'all' && c.rarity !== filterRarity) return false;
      if (filterRole !== 'all' && c.role !== filterRole) return false;
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.title.toLowerCase().includes(q) &&
        !c.role.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    if (sortBy === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'rarity') {
      return [...list].sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
    }
    if (sortBy === 'meta') {
      return [...list].sort(
        (a, b) =>
          (TIER_WEIGHT[b.metaRating.tower] ?? 0) - (TIER_WEIGHT[a.metaRating.tower] ?? 0) ||
          b.rarity - a.rarity,
      );
    }
    return list;
  }, [search, filterElement, filterWeapon, filterRarity, filterRole, sortBy]);

  const hasActiveFilters =
    filterElement !== 'all' ||
    filterWeapon !== 'all' ||
    filterRarity !== 'all' ||
    filterRole !== 'all' ||
    search.trim().length > 0;

  const resetFilters = () => {
    setFilterElement('all');
    setFilterWeapon('all');
    setFilterRarity('all');
    setFilterRole('all');
    setSearch('');
  };

  const fiveStarCount = useMemo(
    () => filtered.filter((c) => c.rarity === 5).length,
    [filtered],
  );
  const fourStarCount = useMemo(
    () => filtered.filter((c) => c.rarity === 4).length,
    [filtered],
  );

  return (
    <div className="space-y-6 pb-10 w-full">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* Шапка каталога */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent-light mb-1">
            <Sparkles size={13} />
            <span>АРХИВ РЕЗОНАТОРОВ · {CHARACTERS.length} В БАЗЕ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Персонажи
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Полный ростер Соларис-3: билды, эхо-наборы, ротации и мета-рейтинг
          </p>
        </div>

        {/* Поле быстрого поиска */}
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={17}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или роли... (Ctrl+K)"
            className="pl-10 pr-9 py-2.5 bg-[#0b0d14]/85 border border-white/15 rounded-2xl text-sm text-ivory placeholder-gray-500 focus-ring w-full"
            aria-label="Поиск персонажей"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Командная панель фильтров (БЕЗ дублирующего дропдауна «Все элементы») */}
      <div className="glass-panel p-4 sm:p-5 space-y-3.5 solaris-crest">
        {/* Ряд 1: Стихии (пилюли с официальными иконками) + Редкость */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterElement('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                filterElement === 'all'
                  ? 'bg-accent/25 border-accent text-ivory shadow-glow-sm'
                  : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Все стихии
            </button>

            {(Object.keys(ELEMENTS) as ElementType[]).map((elKey) => {
              const el = ELEMENTS[elKey];
              const active = filterElement === elKey;
              return (
                <button
                  key={elKey}
                  type="button"
                  onClick={() => setFilterElement(active ? 'all' : elKey)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'bg-accent/25 border-accent text-white shadow-glow-sm'
                      : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white hover:border-white/25'
                  }`}
                >
                  <img src={el.icon} alt="" className="w-4 h-4" draggable={false} />
                  <span>{el.label}</span>
                </button>
              );
            })}
          </div>

          {/* Переключатель редкости 5★ / 4★ */}
          <div className="flex items-center gap-1.5">
            {(['all', 5, 4] as const).map((r) => (
              <button
                key={String(r)}
                type="button"
                onClick={() => setFilterRarity(r)}
                className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                  filterRarity === r
                    ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                    : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                {r === 'all' ? 'Любая ★' : `${r} ★`}
              </button>
            ))}
          </div>
        </div>

        {/* Ряд 2: Оружие (кнопки с иконками) + Роль + Сортировка + Счётчик */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
          {/* Кнопки оружия */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterWeapon('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                filterWeapon === 'all'
                  ? 'bg-white/15 border-white/30 text-white'
                  : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              Всё оружие
            </button>

            {(Object.keys(WEAPON_LABELS) as WeaponType[]).map((wKey) => {
              const active = filterWeapon === wKey;
              return (
                <button
                  key={wKey}
                  type="button"
                  onClick={() => setFilterWeapon(active ? 'all' : wKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'bg-accent/25 border-accent text-accent-light'
                      : 'bg-white/[0.03] border-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <img
                    src={WEAPON_ICONS[wKey]}
                    alt=""
                    className="w-3.5 h-3.5"
                    draggable={false}
                  />
                  <span>{WEAPON_LABELS[wKey]}</span>
                </button>
              );
            })}
          </div>

          {/* Правая группа: Роль + Сортировка + Вид сетки + Счётчик */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as 'all' | CharacterRole)}
              className="bg-[#0b0d14] border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-200 focus-ring"
              aria-label="Фильтр по роли"
            >
              <option value="all">Все роли</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <div className="relative flex items-center">
              <ArrowUpDown
                size={13}
                className="absolute left-2.5 text-accent-light pointer-events-none"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0b0d14] border border-white/15 rounded-xl pl-7 pr-3 py-1.5 text-xs font-bold text-gray-200 focus-ring"
                aria-label="Сортировка"
              >
                <option value="default">По умолчанию</option>
                <option value="meta">По мете (S ➔ C)</option>
                <option value="rarity">По редкости (5★ ➔ 4★)</option>
                <option value="name">По имени (А–Я)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setCompactGrid((v) => !v)}
              title={compactGrid ? 'Крупные карточки' : 'Компактная сетка'}
              className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-gray-300 hover:text-white"
            >
              {compactGrid ? <LayoutGrid size={15} /> : <Grid size={15} />}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-400/30 text-xs font-bold text-rose-300 hover:bg-rose-500/25"
              >
                <RotateCcw size={12} />
                <span>Сброс</span>
              </button>
            )}

            <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs font-mono">
              <span className="text-amber-300 font-bold">{fiveStarCount}×5★</span>
              <span className="text-purple-300 font-bold">{fourStarCount}×4★</span>
              <span className="text-gray-400">
                ({filtered.length}/{CHARACTERS.length})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Сетка карточек */}
      <div
        className={
          compactGrid
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3.5'
            : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
        }
      >
        {filtered.map((char) => (
          <CharacterCard key={char.id} character={char} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-panel py-20 text-center space-y-3">
          <p className="text-lg font-bold text-white">Резонаторы не найдены</p>
          <p className="text-xs text-gray-400">
            Попробуй изменить выбранную стихию, оружие или поисковый запрос
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-accent/20 border border-accent text-accent-light text-xs font-extrabold"
          >
            Сбросить все фильтры
          </button>
        </div>
      )}
    </div>
  );
};