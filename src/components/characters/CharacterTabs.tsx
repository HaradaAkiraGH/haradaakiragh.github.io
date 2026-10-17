// Вкладки страницы персонажа: Инфо / Мета / Билд / Команды / Прокачка
import { Link } from 'react-router-dom';
import { MapPin, Hammer, Sparkles } from 'lucide-react';
import { getCharacterById } from '../../data/characters';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { LORE } from '../../data/lore';
import { TEAM_ROTATIONS } from '../../data/teamRotations';
import { BuildSharer } from './BuildSharer';
import { CHARACTER_THEME, DEFAULT_THEME, TIER_STYLES } from '../../utils/constants';
import type { Character, TargetStat, SkillPriority } from '../../data/types';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-white mb-4">{children}</h3>
);

/* ---------- Умные заглушки: пока личные данные не наполнены ---------- */
const ROLE_TARGET_STATS: Record<string, TargetStat[]> = {
  'Main DPS': [
    { label: 'Crit Rate', value: '70%+' },
    { label: 'Crit DMG', value: '180–220%' },
    { label: 'ATK', value: '2200+' },
    { label: 'Energy Regen', value: '100–120%' },
  ],
  'Sub DPS': [
    { label: 'Crit Rate', value: '60%+' },
    { label: 'Crit DMG', value: '150–180%' },
    { label: 'ATK', value: '1800+' },
    { label: 'Energy Regen', value: '120–140%' },
  ],
  Support: [
    { label: 'Energy Regen', value: '150%+' },
    { label: 'HP', value: '20000+' },
    { label: 'ATK', value: '1500+' },
    { label: 'DEF', value: '800+' },
  ],
  Healer: [
    { label: 'Energy Regen', value: '150%+' },
    { label: 'HP', value: '22000+' },
    { label: 'Healing Bonus', value: '30%+' },
    { label: 'ATK', value: '1400+' },
  ],
  Defender: [
    { label: 'HP', value: '25000+' },
    { label: 'DEF', value: '1000+' },
    { label: 'Energy Regen', value: '130%+' },
    { label: 'Crit Rate', value: '40%+' },
  ],
};
const ROLE_SKILL_PRIORITY: Record<string, SkillPriority[]> = {
  'Main DPS': [
    { name: 'Resonance Liberation', note: 'главный источник урона' },
    { name: 'Resonance Skill', note: 'держит бафф/метки' },
    { name: 'Basic Attack', note: 'после основных' },
    { name: 'Intro / Outro', note: 'в остаточную очередь' },
  ],
  'Sub DPS': [
    { name: 'Resonance Liberation', note: 'офф-филд урон' },
    { name: 'Resonance Skill', note: 'приложение элемента' },
    { name: 'Intro / Outro', note: 'бафф команды' },
    { name: 'Basic Attack', note: 'качать не обязательно' },
  ],
  Support: [
    { name: 'Resonance Liberation', note: 'бафф/щит команды' },
    { name: 'Resonance Skill', note: 'утилита' },
    { name: 'Intro / Outro', note: 'быстрый вход-выход' },
    { name: 'Basic Attack', note: 'не качается' },
  ],
  Healer: [
    { name: 'Resonance Liberation', note: 'лечащее поле' },
    { name: 'Resonance Skill', note: 'хил и энергия' },
    { name: 'Intro / Outro', note: 'бафф при выходе' },
    { name: 'Basic Attack', note: 'не качается' },
  ],
  Defender: [
    { name: 'Resonance Liberation', note: 'контроль/щит' },
    { name: 'Resonance Skill', note: 'таунт/митигейт' },
    { name: 'Intro / Outro', note: 'защита команды' },
    { name: 'Basic Attack', note: 'не качается' },
  ],
};

/* ========== ВКЛАДКА: ИНФО ========== */
export const InfoTab = ({ char }: { char: Character }) => {
  const theme = CHARACTER_THEME[char.id] ?? DEFAULT_THEME;
  const lore = LORE[char.id];
  return (
    <div className="space-y-6">
      {/* Выход персонажа */}
      <div>
        <SectionTitle>Выход персонажа</SectionTitle>
        {char.release ? (
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-accent-light text-sm font-semibold">
              Патч {char.release.patch}
            </span>
            {char.release.date && (
              <span className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-sm text-gray-300">
                {char.release.date}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Дата выхода уточняется летописцами Соларис-3.</p>
        )}
      </div>
      {/* Навыки */}
      <div>
        <SectionTitle>Навыки</SectionTitle>
        {char.skills && char.skills.length > 0 ? (
          <div className="space-y-3">
            {char.skills.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-glass border border-glass-border">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-ivory">{s.name}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent-light uppercase tracking-wider font-bold shrink-0">
                    {s.type}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <div className={`p-4 rounded-xl border ${theme.skillCard}`}>
              <p className="font-bold text-white">{theme.skills.resonance}</p>
              <p className="text-xs text-white/70 mt-0.5">Resonance Skill</p>
            </div>
            <div className={`p-4 rounded-xl border ${theme.skillCard}`}>
              <p className="font-bold text-white">{theme.skills.liberation}</p>
              <p className="text-xs text-white/70 mt-0.5">Resonance Liberation</p>
            </div>
          </div>
        )}
      </div>
      {/* Ротация */}
      {char.rotation.length > 0 && (
        <div>
          <SectionTitle>Боевой цикл</SectionTitle>
          <div className="space-y-3">
            {char.rotation.map((step) => (
              <div key={step.step} className="flex gap-4 p-3 rounded-lg bg-glass border border-glass-border">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-sm shrink-0">{step.step}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{step.skill}</span>
                    <span className="text-xs text-accent-light font-mono shrink-0">{step.timing}</span>
                  </div>
                  {step.note && <p className="text-sm text-gray-400">{step.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Созвездия */}
      <div>
        <SectionTitle>Резонансные цепи</SectionTitle>
        {char.constellations && char.constellations.length > 0 ? (
          <div className="space-y-2">
            {char.constellations.map((c, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-glass border border-glass-border">
                <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light font-bold text-sm shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ivory text-sm">{c.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{c.effect}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Sparkles size={14} className="text-accent-light" />
            Цепи для этого персонажа ещё описываются — скоро появятся здесь.
          </p>
        )}
      </div>
      {/* Лор */}
      {lore && (
        <div>
          <SectionTitle>Лор</SectionTitle>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">{lore.story}</p>
          <div className="space-y-3 mb-4">
            {lore.quotes.map((q: string, i: number) => (
              <blockquote key={i} className="p-4 rounded-xl bg-glass border border-glass-border border-l-4 border-l-accent text-sm text-gray-200 italic">
                «{q}»
              </blockquote>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {lore.ties.map((t: { label: string; targetId?: string }, i: number) =>
              t.targetId ? (
                <Link key={i} to={`/characters/${t.targetId}`} className="px-3 py-2 rounded-xl bg-glass border border-glass-border hover:border-accent/40 text-sm text-ivory transition-colors focus-ring">
                  {t.label} →
                </Link>
              ) : (
                <span key={i} className="px-3 py-2 rounded-xl bg-glass border border-glass-border text-sm text-gray-300">{t.label}</span>
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
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="p-5 rounded-xl bg-glass border border-glass-border text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Tower of Adversity</p>
        <span className={`inline-block px-6 py-3 rounded-xl border text-3xl font-extrabold ${TIER_STYLES[char.metaRating.tower]}`}>
          {char.metaRating.tower}
        </span>
      </div>
      <div className="p-5 rounded-xl bg-glass border border-glass-border text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Whimpering Wastes</p>
        <span className={`inline-block px-6 py-3 rounded-xl border text-3xl font-extrabold ${TIER_STYLES[char.metaRating.realm]}`}>
          {char.metaRating.realm}
        </span>
      </div>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
        <h4 className="text-green-400 font-semibold mb-2">Сильные стороны</h4>
        <ul className="space-y-2">
          {char.strengths.map((s: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300"><span className="text-green-400">+</span>{s}</li>
          ))}
        </ul>
      </div>
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <h4 className="text-red-400 font-semibold mb-2">Слабые стороны</h4>
        <ul className="space-y-2">
          {char.weaknesses.map((w: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300"><span className="text-red-400">−</span>{w}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

/* ========== ВКЛАДКА: БИЛД ========== */
export const BuildTab = ({ char }: { char: Character }) => {
  const stats = char.targetStats ?? ROLE_TARGET_STATS[char.role] ?? ROLE_TARGET_STATS['Main DPS'];
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Оружие</SectionTitle>
        <div className="space-y-4">
          {char.weapons.map((w, i) => (
            <div key={i} className={`p-4 rounded-xl border ${w.type === 'Signature' ? 'bg-accent/10 border-accent/30' : 'bg-glass border-glass-border'}`}>
              <div className="flex justify-between items-center mb-2 gap-2">
                <h4 className="font-semibold text-white">
                  {w.name}
                  {w.type === 'Signature' && <span className="ml-2 text-xs text-accent-light">сигнатурное</span>}
                </h4>
                <span className="text-sm font-mono text-accent-light">{w.rating}%</span>
              </div>
              <div className="h-2 rounded-full bg-bg-secondary overflow-hidden mb-2">
                <div className="h-full bg-gradient-to-r from-accent to-accent-light" style={{ width: `${w.rating}%` }} />
              </div>
              <p className="text-xs text-gray-400">Источник: {w.source}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Эхо-наборы</SectionTitle>
        <div className="space-y-4">
          {char.echoSets.map((set, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-glass border border-glass-border">
              <div className="flex justify-between items-start mb-3 gap-2">
                <h4 className="font-semibold text-accent-light">{set.name}</h4>
                <span className="text-xs bg-accent/20 px-2 py-1 rounded shrink-0">Приоритет #{set.priority}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-gray-500 block text-xs mb-1">Главное эхо (cost 4)</span><span className="text-white">{set.cost4}</span></div>
                <div><span className="text-gray-500 block text-xs mb-1">Распределение cost</span><span className="text-white font-mono">{set.distribution}</span></div>
                <div><span className="text-gray-500 block text-xs mb-1">Основные статы</span><span className="text-white">{set.mainStats.join(' / ')}</span></div>
              </div>
              <div className="mt-3 text-sm">
                <span className="text-gray-500 text-xs mr-2">Саб-статы:</span>
                {set.subStats.map((s: string, i: number) => (
                  <span key={i} className="inline-block px-2 py-0.5 mr-1 mb-1 rounded bg-glass border border-glass-border text-xs text-gray-300">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Целевые статы</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="p-3 rounded-xl bg-bg-secondary/70 border border-glass-border text-center">
              <p className="text-lg font-bold text-accent-light tabular-nums">{s.value}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {!char.targetStats && (
          <p className="text-[11px] text-gray-600 mt-2">Ориентир для роли {char.role} — личные рекомендации появятся после наполнения.</p>
        )}
      </div>
      <BuildSharer character={char} />
    </div>
  );
};

/* ========== ВКЛАДКА: КОМАНДЫ ========== */
export const TeamsTab = ({ char }: { char: Character }) => {
  const teams = TEAM_ROTATIONS.filter((t) => t.members.includes(char.id));
  return (
    <div className="space-y-4">
      <SectionTitle>Команды и их ротации</SectionTitle>
      {teams.length === 0 && <p className="text-gray-500 text-sm">Для этого персонажа команд пока нет.</p>}
      {teams.map((team) => (
        <div key={team.id} className="p-4 rounded-xl bg-glass border border-glass-border">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="font-semibold text-ivory">{team.name}</h4>
              <span className="text-xs text-accent-light">{team.role}</span>
            </div>
            <Link
              to={`/trainer/${team.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring"
            >
              <Hammer size={15} /> Тренировать
            </Link>
          </div>
          <div className="flex gap-2 mb-3">
            {team.members.map((mid) => {
              const m = getCharacterById(mid);
              if (!m) return null;
              return (
                <Link key={mid} to={`/characters/${mid}`} className="flex flex-col items-center gap-1 group focus-ring rounded-lg" aria-label={m.name}>
                  <ImagePlaceholder id={m.id} initials={m.name.slice(0, 2)} element={m.element} className="w-12 h-14 rounded-lg border border-glass-border group-hover:border-accent/50 transition-colors" />
                  <span className="text-[10px] text-gray-300 group-hover:text-white">{m.name}</span>
                </Link>
              );
            })}
          </div>
          <p className="text-sm text-gray-400 mb-3">{team.synergy}</p>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {team.steps.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-bg-secondary/60 border border-glass-border text-[10px] shrink-0 text-gray-400">
                <span className="font-mono text-accent-light">{s.t.toFixed(1)}с</span>
                <span className="text-ivory font-semibold">{getCharacterById(s.char)?.name}</span>
                <span className="hidden sm:inline">{s.skill}</span>
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
  Ascension: 'Материалы вознесения',
  Forte: 'Материалы форте',
  Skill: 'Материалы навыков',
};
export const ProgressTab = ({ char }: { char: Character }) => {
  const priority = char.skillPriority ?? ROLE_SKILL_PRIORITY[char.role] ?? ROLE_SKILL_PRIORITY['Main DPS'];
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Приоритет прокачки навыков</SectionTitle>
        <div className="space-y-2">
          {priority.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-glass border border-glass-border">
              <span className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-ivory text-sm">{p.name}</p>
                {p.note && <p className="text-xs text-gray-500">{p.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <SectionTitle>Материалы прокачки</SectionTitle>
          <Link
            to="/map"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring shrink-0"
          >
            <MapPin size={15} /> Открыть карту
          </Link>
        </div>
        <div className="space-y-6">
          {char.materials.map((cat, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">{MATERIAL_LABELS[cat.type] || cat.type}</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {cat.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-glass border border-glass-border">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light font-bold shrink-0">
                      {item.quantity}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <MapPin size={11} className="shrink-0" /> {item.location}
                      </p>
                    </div>
                    <Link
                      to="/map"
                      title="Отследить на карте"
                      aria-label={`Отследить ${item.name} на карте`}
                      className="p-2 rounded-lg bg-glass border border-glass-border text-gray-400 hover:text-accent-light hover:border-accent/40 transition-colors focus-ring shrink-0"
                    >
                      <MapPin size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};