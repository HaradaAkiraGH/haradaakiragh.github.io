// Вкладки страницы персонажа: Инфо / Мета / Билд / Команды / Прокачка
import { Link } from 'react-router-dom';
import { MapPin, Hammer, Sparkles, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { getCharacterById } from '../../data/characters';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { LORE } from '../../data/lore';
import { TEAM_ROTATIONS } from '../../data/teamRotations';
import { BuildSharer } from './BuildSharer';
import { useState } from 'react';
import { getCharacterTheme, TIER_STYLES } from '../../utils/constants';
import type { Character, TargetStat, SkillPriority } from '../../data/types';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="w-1 h-5 rounded-full bg-gradient-to-b from-accent-light to-accent" />
    <h3 className="text-lg sm:text-xl font-bold text-ivory tracking-tight">{children}</h3>
  </div>
);

/* ---------- Умные заглушки по роли ---------- */
const ROLE_TARGET_STATS: Record<string, TargetStat[]> = {
  'Main DPS': [
    { label: 'Crit Rate', value: '70%+' },
    { label: 'Crit DMG', value: '200–240%' },
    { label: 'ATK', value: '2200+' },
    { label: 'Energy Regen', value: '115–125%' },
  ],
  'Sub DPS': [
    { label: 'Crit Rate', value: '65%+' },
    { label: 'Crit DMG', value: '180–210%' },
    { label: 'ATK', value: '1900+' },
    { label: 'Energy Regen', value: '125–140%' },
  ],
  Support: [
    { label: 'Energy Regen', value: '150%+' },
    { label: 'HP', value: '22000+' },
    { label: 'ATK', value: '1600+' },
    { label: 'DEF', value: '1000+' },
  ],
  Healer: [
    { label: 'Energy Regen', value: '160%+' },
    { label: 'HP', value: '25000+' },
    { label: 'Healing Bonus', value: '30%+' },
    { label: 'ATK', value: '1500+' },
  ],
  Defender: [
    { label: 'HP', value: '26000+' },
    { label: 'DEF', value: '1200+' },
    { label: 'Energy Regen', value: '135%+' },
    { label: 'Crit Rate', value: '50%+' },
  ],
};

const ROLE_SKILL_PRIORITY: Record<string, SkillPriority[]> = {
  'Main DPS': [
    { name: 'Forte Circuit & Resonance Liberation', note: 'главный источник взрывного урона' },
    { name: 'Resonance Skill', note: 'генерация стаков и энергии' },
    { name: 'Basic Attack', note: 'основная комбо-ротация на поле' },
    { name: 'Intro / Outro', note: 'в последнюю очередь' },
  ],
  'Sub DPS': [
    { name: 'Resonance Liberation', note: 'основной офф-филд урон' },
    { name: 'Resonance Skill', note: 'быстрый набор Concerto-энергии' },
    { name: 'Intro / Outro', note: 'ключевой бафф для мейн-керри' },
    { name: 'Basic Attack', note: 'минимальный приоритет' },
  ],
  Support: [
    { name: 'Resonance Liberation', note: 'командный бафф и выживаемость' },
    { name: 'Forte Circuit', note: 'пассивные усиления отряда' },
    { name: 'Resonance Skill', note: 'быстрая подкачка энергии' },
    { name: 'Basic Attack', note: 'не требует вложений' },
  ],
  Healer: [
    { name: 'Resonance Liberation', note: 'исцеляющее поле и бафф отряда' },
    { name: 'Forte Circuit', note: 'мгновенное лечение и щиты' },
    { name: 'Resonance Skill', note: 'восстановление энергии' },
    { name: 'Basic Attack', note: 'не требует вложений' },
  ],
  Defender: [
    { name: 'Forte Circuit & Resonance Skill', note: 'прочность щита и контратаки' },
    { name: 'Resonance Liberation', note: 'контроль области и защита' },
    { name: 'Intro / Outro', note: 'снижение входящего урона' },
    { name: 'Basic Attack', note: 'не требует вложений' },
  ],
};

/* ========== ВКЛАДКА: ИНФО ========== */
export const InfoTab = ({ char }: { char: Character }) => {
  const theme = getCharacterTheme(char);
  const lore = LORE[char.id];
  return (
    <div className="space-y-7">
      {/* Выход персонажа */}
      <div>
        <SectionTitle>Досье резонатора</SectionTitle>
        <div className="flex flex-wrap gap-2.5">
          {char.release ? (
            <>
              <span className="px-3.5 py-1.5 rounded-xl bg-accent/15 border border-accent/35 text-accent-light text-xs font-bold">
                Релиз: Патч {char.release.patch}
              </span>
              {char.release.date && (
                <span className="px-3.5 py-1.5 rounded-xl bg-glass border border-glass-border text-xs text-gray-300">
                  {char.release.date}
                </span>
              )}
            </>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl bg-glass border border-glass-border text-xs text-gray-400">
              Архив Соларис-3 · Резонатор {char.rarity}★ ({char.role})
            </span>
          )}
        </div>
      </div>

      {/* Навыки */}
      <div>
        <SectionTitle>Боевые модули и навыки</SectionTitle>
        {char.skills && char.skills.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {char.skills.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-bg/60 border border-glass-border hover:border-accent/35 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-ivory text-sm">{s.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent-light uppercase tracking-wider font-bold shrink-0">
                    {s.type}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border ${theme.skillCard}`}>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Resonance Skill</p>
              <p className="font-bold text-white text-base">{theme.skills.resonance}</p>
              <p className="text-xs text-white/75 mt-1.5">
                Активирует резонансный импульс стихии {char.element} и накапливает шкалу Forte.
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${theme.skillCard}`}>
              <p className="text-[10px] uppercase tracking-widest text-white/70 mb-1">Resonance Liberation</p>
              <p className="font-bold text-white text-base">{theme.skills.liberation}</p>
              <p className="text-xs text-white/75 mt-1.5">
                Высвобождает пиковую мощь резонатора в окно командных баффов.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ротация в виде таймлайна */}
      {char.rotation.length > 0 && (
        <div>
          <SectionTitle>Оптимальный боевой цикл</SectionTitle>
          <div className="relative pl-4 border-l-2 border-accent/30 space-y-3">
            {char.rotation.map((step) => (
              <div
                key={step.step}
                className="relative flex items-start gap-3.5 p-3.5 rounded-xl bg-bg/60 border border-glass-border hover:border-accent/35 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-light to-accent text-bg flex items-center justify-center font-extrabold text-xs shrink-0 shadow-glow-sm">
                  {step.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-ivory text-sm">{step.skill}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-accent-light font-mono shrink-0 px-2 py-0.5 rounded bg-accent/10 border border-accent/25">
                      <Clock size={11} /> {step.timing}
                    </span>
                  </div>
                  {step.note && <p className="text-xs text-gray-400 mt-1">{step.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Созвездия */}
      <div>
        <SectionTitle>Резонансные цепи (Sequences)</SectionTitle>
        {char.constellations && char.constellations.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-2.5">
            {char.constellations.map((c, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-bg/60 border border-glass-border">
                <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/35 flex items-center justify-center text-accent-light font-extrabold text-xs shrink-0">
                  S{i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-ivory text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{c.effect}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-bg/50 border border-glass-border flex items-center gap-3 text-sm text-gray-400">
            <Sparkles size={16} className="text-accent-light shrink-0" />
            <span>Резонансные цепи S1–S6 можно добавить в один клик через панель «Админка».</span>
          </div>
        )}
      </div>

      {/* Лор */}
      {lore && (
        <div>
          <SectionTitle>Архивный лор и связи</SectionTitle>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{lore.story}</p>
          <div className="space-y-2.5 mb-4">
            {lore.quotes.map((q: string, i: number) => (
              <blockquote
                key={i}
                className="p-4 rounded-xl bg-bg/60 border border-glass-border border-l-4 border-l-accent text-sm text-ivory/90 italic"
              >
                «{q}»
              </blockquote>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {lore.ties.map((t: { label: string; targetId?: string }, i: number) =>
              t.targetId ? (
                <Link
                  key={i}
                  to={`/characters/${t.targetId}`}
                  className="px-3.5 py-2 rounded-xl bg-glass border border-glass-border hover:border-accent/45 text-xs font-semibold text-ivory transition-colors focus-ring"
                >
                  {t.label} →
                </Link>
              ) : (
                <span
                  key={i}
                  className="px-3.5 py-2 rounded-xl bg-glass border border-glass-border text-xs text-gray-300"
                >
                  {t.label}
                </span>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ========== ВКЛАДКА: МЕТА ========== */
export const MetaTab = ({ char }: { char: Character }) => (
  <div className="space-y-6">
    <SectionTitle>Позиция в актуальной мете</SectionTitle>
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="p-5 rounded-2xl bg-bg/60 border border-glass-border flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
            Tower of Adversity
          </p>
          <p className="text-xs text-gray-500 mt-1">Боссы и соло-цели на время</p>
        </div>
        <span
          className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl font-extrabold ${
            TIER_STYLES[char.metaRating.tower]
          }`}
        >
          {char.metaRating.tower}
        </span>
      </div>
      <div className="p-5 rounded-2xl bg-bg/60 border border-glass-border flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold">
            Whimpering Wastes
          </p>
          <p className="text-xs text-gray-500 mt-1">Многоволновая зачистка арен</p>
        </div>
        <span
          className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl font-extrabold ${
            TIER_STYLES[char.metaRating.realm]
          }`}
        >
          {char.metaRating.realm}
        </span>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
        <h4 className="text-emerald-300 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          <CheckCircle2 size={16} /> Сильные стороны
        </h4>
        {char.strengths.length > 0 ? (
          <ul className="space-y-2.5">
            {char.strengths.map((s: string, i: number) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-200">
                <span className="text-emerald-400 font-bold">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400">Данные преимуществ уточняются.</p>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25">
        <h4 className="text-rose-300 font-bold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          <ShieldAlert size={16} /> Слабые стороны
        </h4>
        {char.weaknesses.length > 0 ? (
          <ul className="space-y-2.5">
            {char.weaknesses.map((w: string, i: number) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-200">
                <span className="text-rose-400 font-bold">−</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-gray-400">Критических уязвимостей не отмечено.</p>
        )}
      </div>
    </div>
  </div>
);

/* ========== ВКЛАДКА: БИЛД ========== */
export const BuildTab = ({ char }: { char: Character }) => {
  const stats = char.targetStats ?? ROLE_TARGET_STATS[char.role] ?? ROLE_TARGET_STATS['Main DPS'];
  return (
    <div className="space-y-7">
      {/* Оружие */}
      <div>
        <SectionTitle>Рекомендуемое оружие</SectionTitle>
        {char.weapons.length > 0 ? (
          <div className="space-y-3">
            {char.weapons.map((w, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  w.type === 'Signature'
                    ? 'bg-gradient-to-r from-accent/15 via-accent/5 to-transparent border-accent/40'
                    : 'bg-bg/60 border-glass-border'
                }`}
              >
                <div className="flex justify-between items-center mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-glass border border-glass-border flex items-center justify-center text-xs font-mono text-gray-400 shrink-0">
                      #{i + 1}
                    </span>
                    <h4 className="font-bold text-ivory truncate">{w.name}</h4>
                    {w.type === 'Signature' && (
                      <span className="px-2 py-0.5 rounded bg-accent/25 border border-accent/40 text-[10px] font-extrabold uppercase tracking-wider text-accent-light shrink-0">
                        Сигнатура · BiS
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono font-bold text-accent-light shrink-0">
                    {w.rating}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-bg-secondary overflow-hidden mb-2 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent-light rounded-full"
                    style={{ width: `${w.rating}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">Источник: {w.source}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Список оружия для этого резонатора пополняется.</p>
        )}
      </div>

      {/* Эхо-сеты */}
      <div>
        <SectionTitle>Лучшие наборы Эхо</SectionTitle>
        {char.echoSets.length > 0 ? (
          <div className="space-y-4">
            {char.echoSets.map((set, idx) => (
              <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-bg/60 border border-glass-border">
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div>
                    <h4 className="font-bold text-accent-light text-base">{set.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Главный слот (Cost 4): {set.cost4}</p>
                  </div>
                  <span className="text-xs font-bold bg-accent/20 border border-accent/35 text-accent-light px-2.5 py-1 rounded-lg shrink-0">
                    Приоритет #{set.priority}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-glass border border-glass-border">
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-1">
                      Главное эхо (4 Cost)
                    </span>
                    <span className="text-ivory font-semibold text-xs sm:text-sm">{set.cost4}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-glass border border-glass-border">
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-1">
                      Схема Cost
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {set.distribution.split('-').map((c, i) => (
                        <span
                          key={i}
                          className="w-6 h-6 rounded-md bg-accent/15 border border-accent/35 flex items-center justify-center font-mono text-xs font-bold text-accent-light"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-glass border border-glass-border">
                    <span className="text-gray-500 block text-[10px] uppercase tracking-wider mb-1">
                      Main статы (4 / 3 / 1)
                    </span>
                    <span className="text-ivory font-medium text-xs">
                      {set.mainStats.join(' · ')}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-glass-border flex flex-wrap items-center gap-1.5">
                  <span className="text-gray-500 text-xs mr-1">Приоритет саб-статов:</span>
                  {set.subStats.map((s: string, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-md bg-glass border border-glass-border text-xs text-ivory"
                    >
                      {i + 1}. {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Эхо-сеты для этого резонатора скоро будут добавлены.</p>
        )}
      </div>

      {/* Целевые статы */}
      <div>
        <SectionTitle>Целевые показатели статов (Lv. 90)</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-bg/60 border border-glass-border text-center hover:border-accent/35 transition-colors"
            >
              <p className="text-lg sm:text-xl font-extrabold text-accent-light tabular-nums">
                {s.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {char.weapons.length > 0 && char.echoSets.length > 0 && <BuildSharer character={char} />}
    </div>
  );
};

/* ========== ВКЛАДКА: КОМАНДЫ ========== */
export const TeamsTab = ({ char }: { char: Character }) => {
  const teams = TEAM_ROTATIONS.filter((t) => t.members.includes(char.id));
  return (
    <div className="space-y-4">
      <SectionTitle>Синергия и командные ротации</SectionTitle>
      {teams.length === 0 && (
        <p className="text-gray-400 text-sm">
          Персональные командные пресеты для этого резонатора скоро появятся.
        </p>
      )}
      {teams.map((team) => (
        <div key={team.id} className="p-4 sm:p-5 rounded-2xl bg-bg/60 border border-glass-border space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-ivory text-base">{team.name}</h4>
              <span className="text-xs text-accent-light font-medium">{team.role}</span>
            </div>
            <Link to={`/trainer/${team.id}`} className="btn-luxury focus-ring">
              <Hammer size={15} /> Тренировать ротацию
            </Link>
          </div>
          <div className="flex gap-3">
            {team.members.map((mid) => {
              const m = getCharacterById(mid);
              if (!m) return null;
              return (
                <Link
                  key={mid}
                  to={`/characters/${mid}`}
                  className="flex flex-col items-center gap-1.5 group focus-ring rounded-xl"
                  aria-label={m.name}
                >
                  <ImagePlaceholder
                    id={m.id}
                    initials={m.name.slice(0, 2)}
                    element={m.element}
                    className="w-14 h-16 rounded-xl border border-glass-border group-hover:border-accent/50 transition-colors object-top"
                  />
                  <span className="text-xs font-medium text-gray-300 group-hover:text-ivory">
                    {m.name}
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{team.synergy}</p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {team.steps.map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-glass border border-glass-border text-[11px] shrink-0 text-gray-300"
              >
                <span className="font-mono text-accent-light">{s.t.toFixed(1)}с</span>
                <span className="text-ivory font-bold">{getCharacterById(s.char)?.name}</span>
                <span className="hidden sm:inline text-gray-400">{s.skill}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ========== ВКЛАДКА: ПРОКАЧКА ========== */
const MATERIAL_LABELS: Record<string, string> = {
  Ascension: 'Материалы возвышения',
  Forte: 'Материалы Форте',
  Skill: 'Материалы навыков',
};

export const ProgressTab = ({ char }: { char: Character }) => {
  const priority =
    char.skillPriority ?? ROLE_SKILL_PRIORITY[char.role] ?? ROLE_SKILL_PRIORITY['Main DPS'];
  return (
    <div className="space-y-7">
      <div>
        <SectionTitle>Приоритет прокачки Forte</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {priority.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-bg/60 border border-glass-border"
            >
              <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/35 flex items-center justify-center text-accent-light font-extrabold text-sm shrink-0">
                #{i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ivory text-sm truncate">{p.name}</p>
                {p.note && <p className="text-xs text-gray-400 truncate">{p.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <SectionTitle>Ресурсы возвышения</SectionTitle>
          <Link to="/map" className="btn-luxury focus-ring shrink-0">
            <MapPin size={15} /> Интерактивная карта
          </Link>
        </div>
        {char.materials.length > 0 ? (
          <div className="space-y-5">
            {char.materials.map((cat, i) => (
              <div key={i}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2.5">
                  {MATERIAL_LABELS[cat.type] || cat.type}
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {cat.items.map((item, j) => (
                    <div
                      key={j}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-bg/60 border border-glass-border hover:border-accent/35 transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/35 flex items-center justify-center text-accent-light font-mono font-extrabold text-sm shrink-0">
                        ×{item.quantity}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ivory truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-accent-light shrink-0" /> {item.location}
                        </p>
                      </div>
                      <Link
                        to="/map"
                        title="Отследить на карте"
                        aria-label={`Отследить ${item.name} на карте`}
                        className="px-2.5 py-1.5 rounded-lg bg-glass border border-glass-border text-xs font-semibold text-gray-300 hover:text-accent-light hover:border-accent/40 transition-colors focus-ring shrink-0 flex items-center gap-1"
                      >
                        <MapPin size={12} /> Фарм
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            Точный список материалов для этого резонатора можно заполнить через «Админку».
          </p>
        )}
      </div>
    </div>
  );
};
/* ========== ОБЁРТКА: ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК ========== */
type TabId = 'info' | 'meta' | 'build' | 'teams' | 'progress';

const TAB_LIST: { id: TabId; label: string }[] = [
  { id: 'info', label: 'Инфо' },
  { id: 'meta', label: 'Мета' },
  { id: 'build', label: 'Билд' },
  { id: 'teams', label: 'Команды' },
  { id: 'progress', label: 'Прокачка' },
];

export const CharacterTabs = ({ character }: { character: Character }) => {
  const [active, setActive] = useState<TabId>('info');
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-glass border border-glass-border">
        {TAB_LIST.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors focus-ring ${
              active === t.id
                ? 'bg-accent/20 border border-accent/40 text-accent-light'
                : 'border border-transparent text-gray-400 hover:text-ivory'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {active === 'info' && <InfoTab char={character} />}
      {active === 'meta' && <MetaTab char={character} />}
      {active === 'build' && <BuildTab char={character} />}
      {active === 'teams' && <TeamsTab char={character} />}
      {active === 'progress' && <ProgressTab char={character} />}
    </div>
  );
};