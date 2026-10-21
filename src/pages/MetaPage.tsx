// Страница Меты (Prydwen Tier List + Team Tier List + English Echo Sets):
// 1) Тиры T0 / T0.5 / T1 / T1.5 / T2 / T3 по колонкам ролей (Main DPS / Sub DPS / Support)
// 2) Подписи механик под каждым героем ("Chafe", "Bane", "Frazzle", "Erosion", "Burst" и др.)
// 3) Вкладка Командного тир-листа (Prydwen Team Tier List)
// 4) Популярность наборов Эхо на английском языке (без бесполезного рейтинга оружия)
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Sparkles, Layers } from 'lucide-react';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { ELEMENTS } from '../utils/constants';
import {
  PRYDWEN_CHAR_META,
  PRYDWEN_TAG_COLORS,
  PRYDWEN_TEAMS,
  ENGLISH_ECHO_SETS,
  PrydwenTier,
  PrydwenRoleCol,
} from '../data/prydwenMeta';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const TIERS: PrydwenTier[] = ['T0', 'T0.5', 'T1', 'T1.5', 'T2', 'T3'];
const COLUMNS: PrydwenRoleCol[] = [
  'Main DPS',
  'Hybrid / Sub DPS',
  'Support / Sustain',
];

const TIER_BADGE_STYLE: Record<PrydwenTier, string> = {
  T0: 'bg-gradient-to-b from-amber-400/30 to-amber-600/15 text-amber-300 border-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.2)]',
  'T0.5':
    'bg-gradient-to-b from-rose-500/25 to-rose-700/15 text-rose-300 border-rose-400/45',
  T1: 'bg-gradient-to-b from-purple-500/25 to-purple-700/15 text-purple-300 border-purple-400/45',
  'T1.5':
    'bg-gradient-to-b from-sky-500/25 to-sky-700/15 text-sky-300 border-sky-400/40',
  T2: 'bg-gradient-to-b from-emerald-500/20 to-emerald-700/10 text-emerald-300 border-emerald-400/35',
  T3: 'bg-white/[0.04] text-gray-400 border-white/10',
};

export const MetaPage = () => {
  useDocumentMeta({
    title: 'Мета и Тир-лист Prydwen — Stellar Wiki',
    description:
      'Актуальный тир-лист персонажей и команд Wuthering Waves (Prydwen T0–T3) для Tower of Adversity и Whimpering Wastes.',
  });

  const [viewTab, setViewTab] = useState<'characters' | 'teams'>('characters');
  const [mode, setMode] = useState<'toa' | 'wastes'>('toa');
  const [roleFilter, setRoleFilter] = useState<'all' | PrydwenRoleCol>('all');

  const visibleColumns = useMemo(
    () => (roleFilter === 'all' ? COLUMNS : [roleFilter]),
    [roleFilter],
  );

  return (
    <div className="space-y-7 pb-10 w-full">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* Шапка страницы Меты */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent-light mb-1">
            <Sparkles size={13} />
            <span>PRYDWEN META ANALYTICS · ПАТЧ 3.7</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Trophy size={28} className="text-accent-light" />
            <span>Мета-тирлист Соларис-3</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Рейтинг всех 61 резонатора и топовых отрядов с тегами механик (Bane, Chafe, Frazzle, Erosion, Burst)
          </p>
        </div>

        {/* Переключатели: Персонажи / Команды + Режим (Tower of Adversity / Whimpering Wastes) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => setViewTab('characters')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewTab === 'characters'
                  ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy size={14} />
              <span>Тир-лист героев</span>
            </button>
            <button
              type="button"
              onClick={() => setViewTab('teams')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                viewTab === 'teams'
                  ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Командный тир-лист</span>
            </button>
          </div>

          <div className="flex p-1 rounded-2xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => setMode('toa')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                mode === 'toa'
                  ? 'bg-accent/25 text-accent-light border border-accent/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tower of Adversity
            </button>
            <button
              type="button"
              onClick={() => setMode('wastes')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                mode === 'wastes'
                  ? 'bg-accent/25 text-accent-light border border-accent/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Whimpering Wastes
            </button>
          </div>
        </div>
      </div>

      {/* ==================== ВКЛАДКА 1: ТИР-ЛИСТ ПЕРСОНАЖЕЙ (PRYDWEN) ==================== */}
      {viewTab === 'characters' ? (
        <div className="space-y-4">
          {/* Фильтр по колонке роли + легенда тегов Prydwen */}
          <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', ...COLUMNS] as const).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setRoleFilter(col)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                    roleFilter === col
                      ? 'bg-accent/25 border-accent text-ivory'
                      : 'bg-white/[0.03] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {col === 'all' ? 'Все роли (3 колонки)' : col}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-gray-400 font-bold mr-1">Механики Prydwen:</span>
              {(['Bane', 'Chafe', 'Frazzle', 'Erosion', 'Burst', 'Coord', 'Amp', 'Heal'] as const).map(
                (t) => (
                  <span
                    key={t}
                    className={`px-2 py-0.5 rounded-md font-extrabold border ${PRYDWEN_TAG_COLORS[t]}`}
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Шапка колонок ролей */}
          {roleFilter === 'all' && (
            <div className="hidden lg:grid lg:grid-cols-[110px,1fr,1fr,1fr] gap-3 px-1">
              <div />
              {COLUMNS.map((col) => (
                <div
                  key={col}
                  className="glass-panel py-2.5 px-4 text-center text-xs font-black uppercase tracking-widest text-accent-light"
                >
                  {col}
                </div>
              ))}
            </div>
          )}

          {/* Строки T0 -> T3 */}
          <div className="space-y-3.5">
            {TIERS.map((tier) => (
              <div
                key={tier}
                className={`grid grid-cols-1 ${
                  roleFilter === 'all'
                    ? 'lg:grid-cols-[110px,1fr,1fr,1fr]'
                    : 'lg:grid-cols-[110px,1fr]'
                } gap-3 items-stretch`}
              >
                {/* Бейдж тира слева */}
                <div
                  className={`rounded-2xl border flex flex-col items-center justify-center p-4 shrink-0 ${TIER_BADGE_STYLE[tier]}`}
                >
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">{tier}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-75 mt-0.5">
                    {tier === 'T0'
                      ? 'Apex'
                      : tier === 'T0.5'
                      ? 'Meta'
                      : tier === 'T1'
                      ? 'Strong'
                      : tier === 'T1.5'
                      ? 'Balanced'
                      : 'Niche'}
                  </span>
                </div>

                {/* Колонки ролей */}
                {visibleColumns.map((col) => {
                  const charsInCell = CHARACTERS.filter((c) => {
                    const m = PRYDWEN_CHAR_META[c.id];
                    if (!m) return false;
                    const t = mode === 'toa' ? m.toa : m.wastes;
                    return t === tier && m.column === col;
                  });

                  return (
                    <div
                      key={col}
                      className="glass-panel p-3.5 flex flex-wrap content-start gap-2.5 min-h-[116px]"
                    >
                      {charsInCell.map((c) => {
                        const m = PRYDWEN_CHAR_META[c.id];
                        const el = ELEMENTS[c.element];
                        return (
                          <Link
                            key={c.id}
                            to={`/characters/${c.id}`}
                            className="group w-[88px] flex flex-col items-center bg-[#0b0d14]/90 hover:bg-[#141826] rounded-xl p-1.5 transition-all hover:-translate-y-1 focus-ring"
                          >
                            <div className="relative w-full aspect-[3/3.8] rounded-lg overflow-hidden bg-[#121520]">
                              <ImagePlaceholder
                                id={c.id}
                                initials={c.name.slice(0, 2)}
                                element={c.element}
                                className="w-full h-full object-cover object-top"
                              />
                              <span className="absolute top-1 left-1 w-4 h-4 rounded-md bg-black/75 flex items-center justify-center">
                                <img
                                  src={el.icon}
                                  alt={el.label}
                                  className="w-3 h-3"
                                  draggable={false}
                                />
                              </span>
                              <span
                                className={`absolute bottom-0 inset-x-0 h-[2px] ${
                                  c.rarity === 5 ? 'bg-amber-400' : 'bg-purple-400'
                                }`}
                              />
                            </div>

                            <span className="text-[11px] font-extrabold text-white group-hover:text-accent-light truncate w-full text-center mt-1.5">
                              {c.name}
                            </span>

                            {/* Теги Prydwen под персонажем ("Chafe", "Bane", "Frazzle" и т.д.) */}
                            {m && m.tags.length > 0 && (
                              <div className="flex flex-wrap justify-center gap-0.5 mt-1 w-full">
                                {m.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className={`px-1.5 py-[1px] rounded text-[9px] font-black leading-tight border ${
                                      PRYDWEN_TAG_COLORS[tag] ??
                                      'bg-white/10 text-gray-300 border-white/15'
                                    }`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>
                        );
                      })}

                      {charsInCell.length === 0 && (
                        <span className="text-xs text-gray-600 m-auto">—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ==================== ВКЛАДКА 2: КОМАНДНЫЙ ТИР-ЛИСТ (PRYDWEN TEAM TIER LIST) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRYDWEN_TEAMS.map((team) => {
            const teamTier = mode === 'toa' ? team.toa : team.wastes;
            return (
              <div
                key={team.id}
                className="glass-panel p-5 flex flex-col justify-between gap-4 solaris-crest"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {team.tags.map((t) => (
                        <span
                          key={t}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                            PRYDWEN_TAG_COLORS[t] ?? 'bg-white/10 text-gray-200 border-white/15'
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-black text-white">{team.name}</h3>
                    <p className="text-xs text-accent-light font-semibold">{team.archetype}</p>
                  </div>

                  <span
                    className={`px-3.5 py-1.5 rounded-xl border text-base font-black shrink-0 ${TIER_BADGE_STYLE[teamTier]}`}
                  >
                    {teamTier}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {team.members.map((mid, idx) => {
                    const ch = getCharacterById(mid);
                    if (!ch) return null;
                    const roleSlot = idx === 0 ? 'Main DPS' : idx === 1 ? 'Sub DPS' : 'Sustain';
                    return (
                      <Link
                        key={mid}
                        to={`/characters/${ch.id}`}
                        className="group p-2 rounded-2xl bg-[#090a10]/85 hover:bg-[#131624] flex flex-col items-center text-center transition-all"
                      >
                        <ImagePlaceholder
                          id={ch.id}
                          initials={ch.name.slice(0, 2)}
                          element={ch.element}
                          className="w-16 h-20 rounded-xl object-cover object-top mb-1.5"
                        />
                        <span className="text-xs font-extrabold text-white group-hover:text-accent-light truncate w-full">
                          {ch.name}
                        </span>
                        <span className="text-[10px] text-gray-400">{roleSlot}</span>
                      </Link>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-white/[0.06]">
                  {team.note}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================== ПОПУЛЯРНОСТЬ НАБОРОВ ЭХО НА АНГЛИЙСКОМ (Пункт 7) ==================== */}
      <div className="glass-panel p-6 space-y-4 solaris-crest">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Layers size={20} className="text-accent-light" />
              <span>Популярность наборов Эхо (Echo Sets)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Официальные английские названия сонатных наборов и количество резонаторов, использующих сет
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ENGLISH_ECHO_SETS.map((set) => (
            <div
              key={set.name}
              className="p-4 rounded-2xl bg-[#090a10]/85 border border-white/[0.07] flex flex-col justify-between gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-extrabold text-white">{set.name}</h3>
                <span className="px-2.5 py-0.5 rounded-lg bg-accent/20 text-accent-light text-[11px] font-black shrink-0">
                  {set.usersCount} перс.
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{set.sonata}</p>
              <p className="text-[11px] text-gray-300 pt-1.5 border-t border-white/[0.05] truncate">
                <span className="text-gray-500">Топ носители: </span>
                {set.bestFor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};