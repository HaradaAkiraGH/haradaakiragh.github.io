// Вкладки детальной страницы персонажа (/characters/:id):
// 1) Статы с ползунком уровней (10–90 ур., шаг 10) + Целевые показатели статов 90 ур.
// 2) Лучшие наборы Эхо (Схема Cost, Мейн-статы Cost 4/3/1, Приоритет саб-статов)
// 3) Оружие с редактируемым % пользы
// 4) Команды с приоритетом (#1, #2...) и метками команды
// 5) Лор и биография (без блока «Оптимальный боевой цикл»)
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Swords,
  Layers,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  BookOpen,
  Gem,
  Shield,
} from 'lucide-react';
import { Character } from '../../data/types';
import { getCharacterById } from '../../data/characters';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { PRYDWEN_TAG_COLORS } from '../../data/prydwenMeta';

// Коэффициенты роста базовых статов от 10 до 90 уровня в Wuthering Waves
const LEVEL_MULTIPLIERS: Record<number, number> = {
  10: 0.16,
  20: 0.26,
  30: 0.37,
  40: 0.48,
  50: 0.6,
  60: 0.71,
  70: 0.81,
  80: 0.9,
  90: 1.0,
};

export const CharacterTabs = ({ character }: { character: Character }) => {
  const charAny = character as any;

  const [activeTab, setActiveTab] = useState<
    'build' | 'skills' | 'teams' | 'materials'
  >('build');

  // Ползунок уровня персонажа: от 10 до 90 с шагом 10
  const [previewLevel, setPreviewLevel] = useState<number>(90);

  // Базовые статы на 90 уровне (редактируются в админке)
  const baseStats90 = useMemo(() => {
    const raw = charAny.stats ?? {};
    return {
      hp: Number(raw.hp) || (character.rarity === 5 ? 12450 : 10800),
      atk: Number(raw.atk) || (character.rarity === 5 ? 435 : 375),
      def: Number(raw.def) || (character.rarity === 5 ? 1180 : 1040),
      energyRegen: Number(raw.energyRegen) || 120,
    };
  }, [charAny.stats, character.rarity]);

  // Пересчёт статов под выбранный ползунком уровень (10..90)
  const scaledStats = useMemo(() => {
    const mult = LEVEL_MULTIPLIERS[previewLevel] ?? 1;
    return {
      hp: Math.round(baseStats90.hp * mult),
      atk: Math.round(baseStats90.atk * mult),
      def: Math.round(baseStats90.def * mult),
      energyRegen: baseStats90.energyRegen,
    };
  }, [baseStats90, previewLevel]);

  // Целевые показатели статов (Target Stats)
  const targetStatsList: Array<{ name: string; value: string; note?: string }> =
    useMemo(() => {
      if (Array.isArray(charAny.targetStats) && charAny.targetStats.length > 0) {
        return charAny.targetStats.map((t: any) => ({
          name: t.name || t.stat || 'Стат',
          value: t.value || '—',
          note: t.note || '',
        }));
      }
      return [
        { name: 'Crit Rate', value: '70–80%', note: 'Приоритет' },
        { name: 'Crit DMG', value: '260–285%', note: 'С учётом базовых 150%' },
        { name: 'ATK', value: '2100–2450+', note: 'На 90 уровне' },
        { name: 'Energy Regen', value: '120–130%', note: 'Комфортный ультимейт' },
      ];
    }, [charAny.targetStats]);

  // Наборы Эхо
  const echoSetsList: any[] = Array.isArray(charAny.echoSets)
    ? charAny.echoSets
    : [];

  // Оружие с редактируемым % пользы
  const weaponsList: any[] = Array.isArray(charAny.weapons)
    ? charAny.weapons
    : [];

  // Навыки и цепи S1–S6
  const skillsList: any[] = Array.isArray(charAny.skills) ? charAny.skills : [];
  const constellationsList: any[] = Array.isArray(charAny.constellations)
    ? charAny.constellations
    : [];
  const skillPriorityList: any[] = Array.isArray(charAny.skillPriority)
    ? charAny.skillPriority
    : [];

  // Команды, отсортированные по приоритету (Задача 7 и 8)
  const sortedTeams: any[] = useMemo(() => {
    const raw: any[] = Array.isArray(charAny.teams) ? [...charAny.teams] : [];
    return raw
      .map((t, idx) => ({
        ...t,
        priority: typeof t.priority === 'number' ? t.priority : idx + 1,
      }))
      .sort((a, b) => a.priority - b.priority);
  }, [charAny.teams]);

  // Материалы
  const materialsList: any[] = Array.isArray(charAny.materials)
    ? charAny.materials
    : [];

  const loreText =
    typeof charAny.lore === 'string' && charAny.lore.trim().length > 0
      ? charAny.lore.trim()
      : '';

  return (
    <div className="space-y-6">
      {/* Переключатель разделов гайда */}
      <div className="glass-panel p-2 flex flex-wrap gap-2">
        {(
          [
            { id: 'build', label: 'Билд: Эхо, Оружие и Статы', icon: Layers },
            { id: 'teams', label: `Команды и Синергия (${sortedTeams.length})`, icon: Users },
            { id: 'skills', label: 'Навыки и Цепи S1–S6', icon: Sparkles },
            { id: 'materials', label: 'Вознесение и Лор', icon: Gem },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] shadow-lg'
                  : 'bg-white/[0.04] hover:bg-white/[0.09] text-gray-300 hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          ВКЛАДКА 1: БИЛД (СТАТЫ С ПОЛЗУНКОМ УРОВНЕЙ, НАБОРЫ ЭХО, ОРУЖИЕ)
         ===================================================================== */}
      {activeTab === 'build' && (
        <div className="space-y-6 animate-fade-in">
          {/* БЛОК 1: БАЗОВЫЕ И ЦЕЛЕВЫЕ ПОКАЗАТЕЛИ СТАТОВ + ПОЛЗУНОК УРОВНЯ 10–90 */}
          <div className="glass-panel p-6 space-y-5 solaris-crest">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sliders size={20} className="text-accent-light" />
                  <span>Характеристики и Целевые показатели (Ур. {previewLevel})</span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Передвигай ползунок с шагом 10 уровней, чтобы посмотреть рост характеристик резонатора
                </p>
              </div>

              {/* Ползунок уровней 10 - 90 (шаг 10) */}
              <div className="w-full md:w-80 p-3.5 rounded-2xl bg-[#090b12]/90 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-gray-400">Уровень персонажа:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-accent/25 text-accent-light font-mono">
                    Lv. {previewLevel} / 90
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={90}
                  step={10}
                  value={previewLevel}
                  onChange={(e) => setPreviewLevel(Number(e.target.value))}
                  className="w-full accent-[#caa07d] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500 px-0.5">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setPreviewLevel(lvl)}
                      className={`hover:text-white cursor-pointer ${
                        previewLevel === lvl ? 'text-accent-light font-black' : ''
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 4 плитки базовых статов на выбранном уровне */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-[#090a10]/85 border border-white/[0.08]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Базовое HP (Lv.{previewLevel})
                </span>
                <strong className="text-2xl font-black text-emerald-300 tabular-nums mt-1 block">
                  {scaledStats.hp.toLocaleString('ru-RU')}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#090a10]/85 border border-white/[0.08]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Базовая Атака (Lv.{previewLevel})
                </span>
                <strong className="text-2xl font-black text-amber-300 tabular-nums mt-1 block">
                  {scaledStats.atk.toLocaleString('ru-RU')}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#090a10]/85 border border-white/[0.08]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Базовая Защита (Lv.{previewLevel})
                </span>
                <strong className="text-2xl font-black text-sky-300 tabular-nums mt-1 block">
                  {scaledStats.def.toLocaleString('ru-RU')}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-[#090a10]/85 border border-white/[0.08]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Восст. энергии (ER)
                </span>
                <strong className="text-2xl font-black text-purple-300 tabular-nums mt-1 block">
                  {scaledStats.energyRegen}%
                </strong>
              </div>
            </div>

            {/* Целевые показатели статов на 90 ур. (финальная сборка с Эхо и оружием) */}
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-accent-light">
                Целевые показатели статов в готовом билде (Lv. 90 с Эхо)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {targetStatsList.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-gray-400">{st.name}</span>
                    <span className="text-lg font-black text-white mt-1">{st.value}</span>
                    {st.note && (
                      <span className="text-[11px] text-accent-light/90 mt-1">
                        {st.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* БЛОК 2: ЛУЧШИЕ НАБОРЫ ЭХО (Схема Cost, Мейн-статы, Приоритет саб-статов) */}
          <div className="glass-panel p-6 space-y-5">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Layers size={20} className="text-accent-light" />
                <span>Лучшие наборы Эхо и Характеристики слотов</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Оптимальные сонатные сеты, схема Cost, главные статы и приоритет саб-статов
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {echoSetsList.map((es: any, idx: number) => {
                const costLayout = es.costLayout || charAny.echoCostLayout || '4-3-3-1-1';
                const cost4Main = es.cost4Main || 'Crit Rate / Crit DMG';
                const cost3Main = es.cost3Main || `${character.element} DMG% / ATK%`;
                const cost1Main = es.cost1Main || 'ATK%';
                const substatPrio =
                  es.substatsPriority ||
                  (Array.isArray(es.substats) && es.substats.length > 0
                    ? es.substats.join(' > ')
                    : 'Crit Rate = Crit DMG > ATK% > Energy Regen');

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#090a10]/90 border border-white/10 space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-accent/20 text-accent-light text-xs font-black">
                            #{idx + 1}
                          </span>
                          <h3 className="text-base font-black text-white">{es.name}</h3>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-extrabold">
                          Схема Cost: {costLayout}
                        </span>
                      </div>

                      {es.cost4 && (
                        <div className="text-xs text-gray-300">
                          <span className="text-gray-500 font-bold">Главное Эхо (Cost 4): </span>
                          <span className="font-extrabold text-accent-light">{es.cost4}</span>
                        </div>
                      )}

                      {(es.description || es.effect) && (
                        <p className="text-xs text-gray-300 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                          {es.description || es.effect}
                        </p>
                      )}
                    </div>

                    {/* Мейн-статы по Cost 4 / Cost 3 / Cost 1 */}
                    <div className="space-y-2.5 pt-2 border-t border-white/[0.07]">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/[0.07]">
                          <span className="text-[10px] font-bold uppercase text-amber-300 block">
                            Cost 4 (Мейн)
                          </span>
                          <span className="font-extrabold text-white mt-0.5 block">
                            {cost4Main}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/[0.07]">
                          <span className="text-[10px] font-bold uppercase text-purple-300 block">
                            Cost 3 (Мейн)
                          </span>
                          <span className="font-extrabold text-white mt-0.5 block">
                            {cost3Main}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-black/50 border border-white/[0.07]">
                          <span className="text-[10px] font-bold uppercase text-cyan-300 block">
                            Cost 1 (Мейн)
                          </span>
                          <span className="font-extrabold text-white mt-0.5 block">
                            {cost1Main}
                          </span>
                        </div>
                      </div>

                      {/* Приоритет саб-статов */}
                      <div className="p-3 rounded-xl bg-black/50 border border-white/[0.07]">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">
                          Приоритет саб-статов:
                        </span>
                        <span className="text-xs font-extrabold text-accent-light mt-1 block">
                          {substatPrio}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* БЛОК 3: РЕКОМЕНДУЕМОЕ ОРУЖИЕ С РЕДАКТИРУЕМЫМ % ПОЛЬЗЫ (Задача 5) */}
          <div className="glass-panel p-6 space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Swords size={20} className="text-accent-light" />
                <span>Рейтинг оружия и % эффективности</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Сравнение урона сигнатурного и альтернативного оружия относительно топ-1 сборки
              </p>
            </div>

            <div className="space-y-3">
              {weaponsList.map((w: any, idx: number) => {
                const percent =
                  typeof w.percent === 'number' && !Number.isNaN(w.percent)
                    ? w.percent
                    : idx === 0
                    ? 100
                    : Math.max(70, 100 - idx * 8);

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#090a10]/90 border border-white/10 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                            idx === 0 || w.isBest
                              ? 'bg-amber-400 text-[#09090b]'
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          #{w.rank ?? idx + 1}
                        </span>
                        <div>
                          <h3 className="text-sm sm:text-base font-black text-white">
                            {w.name}
                          </h3>
                          {w.stat && (
                            <span className="text-xs text-accent-light font-semibold">
                              {w.stat}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {w.note && (
                          <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-[11px] font-bold text-gray-300">
                            {w.note}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tabular-nums">
                          {percent}% пользы
                        </span>
                      </div>
                    </div>

                    {/* Шкала % пользы */}
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, Math.max(15, percent))}%` }}
                        className={`h-full rounded-full ${
                          percent >= 98
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-200'
                            : 'bg-gradient-to-r from-[#caa07d] to-amber-500/70'
                        }`}
                      />
                    </div>

                    {w.passive && (
                      <p className="text-xs text-gray-400 leading-relaxed pt-1">
                        {w.passive}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* БЛОК 4: СИЛЬНЫЕ И СЛАБЫЕ СТОРОНЫ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Сильные стороны</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-200">
                {(character.strengths ?? []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-black mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-5 space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>Слабые стороны</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-200">
                {(character.weaknesses ?? []).map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-400 font-black mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ВКЛАДКА 2: КОМАНДЫ С ПРИОРИТЕТОМ И МЕТКАМИ (Задачи 7 и 8)
         ===================================================================== */}
      {activeTab === 'teams' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-panel p-6 space-y-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Users size={20} className="text-accent-light" />
                <span>Лучшие команды и синергия отрядов</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Отряды отсортированы по приоритету эффективности с боевыми метками синергии
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedTeams.map((team: any, idx: number) => {
                const priorityNum = team.priority ?? idx + 1;
                const teamTags: string[] = Array.isArray(team.tags) ? team.tags : [];
                const teamName =
                  team.name || `Отряд #${priorityNum} (${character.name})`;
                const members: string[] = Array.isArray(team.members)
                  ? team.members
                  : [];

                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#090a10]/90 border border-white/10 flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                              priorityNum === 1
                                ? 'bg-amber-400 text-[#09090b]'
                                : 'bg-accent/20 text-accent-light border border-accent/40'
                            }`}
                          >
                            Приоритет #{priorityNum}
                          </span>

                          {teamTags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                                PRYDWEN_TAG_COLORS[tag] ??
                                'bg-white/10 text-gray-200 border-white/15'
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          {teamName}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {members.map((memberId: string, mIdx: number) => {
                        const memberChar = getCharacterById(memberId);
                        const slotLabel =
                          mIdx === 0
                            ? 'Main DPS'
                            : mIdx === 1
                            ? 'Sub DPS / Amp'
                            : 'Support / Heal';

                        if (!memberChar) {
                          return (
                            <div
                              key={mIdx}
                              className="p-3 rounded-xl bg-black/50 border border-white/10 text-center"
                            >
                              <span className="text-xs font-bold text-gray-300 block">
                                {memberId}
                              </span>
                              <span className="text-[10px] text-gray-500">{slotLabel}</span>
                            </div>
                          );
                        }

                        return (
                          <Link
                            key={`${memberId}-${mIdx}`}
                            to={`/characters/${memberChar.id}`}
                            className="group p-2.5 rounded-2xl bg-black/55 hover:bg-[#141826] border border-white/[0.07] flex flex-col items-center text-center transition-all"
                          >
                            <ImagePlaceholder
                              id={memberChar.id}
                              initials={memberChar.name.slice(0, 2)}
                              element={memberChar.element}
                              variant="icon"
                              className="w-16 h-16 aspect-square rounded-xl object-cover mb-1.5"
                            />
                            <span className="text-xs font-extrabold text-white group-hover:text-accent-light truncate w-full">
                              {memberChar.name}
                            </span>
                            <span className="text-[10px] text-gray-400">{slotLabel}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {(team.note || team.description) && (
                      <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-white/[0.06]">
                        {team.note || team.description}
                      </p>
                    )}
                  </div>
                );
              })}

              {sortedTeams.length === 0 && (
                <p className="text-xs text-gray-400 col-span-full">
                  Команды ещё не добавлены. Добавь их в Админке во вкладке «4. Команды и Ресурсы».
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ВКЛАДКА 3: НАВЫКИ И РЕЗОНАНСНЫЕ ЦЕПИ S1–S6
         ===================================================================== */}
      {activeTab === 'skills' && (
        <div className="space-y-6 animate-fade-in">
          {skillPriorityList.length > 0 && (
            <div className="glass-panel p-6 space-y-3">
              <h2 className="text-lg font-black text-white">
                Приоритет прокачки навыков Форте
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {skillPriorityList.map((sp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#090a10]/85 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-white block">
                        {sp.name || sp.skill}
                      </span>
                      {sp.level && (
                        <span className="text-[11px] text-gray-400">
                          Рекомендуемый ур.: {sp.level}
                        </span>
                      )}
                    </div>
                    <span className="text-amber-300 text-xs font-black">
                      {'★'.repeat(Number(sp.priority) || 5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Sparkles size={20} className="text-accent-light" />
              <span>Активные навыки и Контур Форте</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillsList.map((sk: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#090a10]/90 border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-accent/20 text-accent-light text-[10px] font-black uppercase tracking-wider">
                      {sk.type || 'Skill'}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-white">{sk.name}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {sk.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Shield size={20} className="text-amber-300" />
              <span>Резонансные цепи (Созвездия S1–S6)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {constellationsList.map((con: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#090a10]/90 border border-white/10 flex items-start gap-3.5"
                >
                  <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-[#09090b] text-xs font-black shrink-0">
                    S{con.level ?? idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white">{con.name}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {con.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ВКЛАДКА 4: МАТЕРИАЛЫ ВОЗНЕСЕНИЯ И ПОЛНЫЙ ЛОР / БИОГРАФИЯ (Задача 2)
         ===================================================================== */}
      {activeTab === 'materials' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-panel p-6 space-y-4">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen size={20} className="text-accent-light" />
              <span>Биография и Лор резонатора</span>
            </h2>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line bg-[#090a10]/85 p-5 rounded-2xl border border-white/10">
              {loreText ||
                `Архивная запись Соларис-3 о резонаторе ${character.name} (${character.title}). Ты можешь дополнить биографию в панели администратора.`}
            </p>
          </div>

          {materialsList.length > 0 && (
            <div className="glass-panel p-6 space-y-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Gem size={20} className="text-accent-light" />
                <span>Ресурсы для полного вознесения (Lv. 90 и Форте 10)</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {materialsList.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#090a10]/90 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-accent-light block">
                        {m.type || 'Ресурс'}
                      </span>
                      <span className="text-sm font-extrabold text-white mt-0.5 block">
                        {m.name}
                      </span>
                    </div>
                    {m.count && (
                      <span className="px-3 py-1 rounded-xl bg-white/[0.07] text-xs font-black text-amber-300">
                        ×{m.count}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterTabs;