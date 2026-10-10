// Вкладки страницы персонажа. Команды и ротации — из data/teamRotations.ts
import { Link } from 'react-router-dom';
import { Crosshair, MapPin, Lightbulb, Target } from 'lucide-react';
import { getCharacterById } from '../../data/characters';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { LORE } from '../../data/lore';
import { TEAM_ROTATIONS } from '../../data/teamRotations';
import { BuildSharer } from './BuildSharer';

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-white mb-4">{children}</h3>
);

export const MetaTab = ({ char }: any) => (
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
);

export const EchoesTab = ({ char }: any) => (
  <div className="space-y-4">
    <SectionTitle>Рекомендуемые эхо-наборы</SectionTitle>
    {char.echoSets.map((set: any, idx: number) => (
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
    <BuildSharer character={char} />
  </div>
);

export const WeaponsTab = ({ char }: any) => (
  <div className="space-y-4">
    <SectionTitle>Оружие</SectionTitle>
    {char.weapons.map((w: any, i: number) => (
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
);

export const RotationTab = ({ char }: any) => (
  <div className="space-y-4">
    <SectionTitle>Соло-ротация</SectionTitle>
    {char.rotation.map((step: any) => (
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
    <p className="text-xs text-gray-500 flex items-center gap-1.5">
      <Lightbulb size={13} className="text-accent-light shrink-0" />
      Intro-скилл срабатывает при входе на поле, outro-скилл — при выходе.
    </p>
    <div className="p-4 rounded-xl bg-accent/10 border border-accent/25 text-sm text-gray-200 flex items-start gap-2">
      <Target size={16} className="text-accent-light shrink-0 mt-0.5" />
      <span>
        Настоящая тренировка — командная: окна баффов саппортов важнее соло-таймингов.
        Смотри вкладку «Команды» и жми «Тренировать» у нужной связки.
      </span>
    </div>
  </div>
);

export const TeamsTab = ({ char }: any) => {
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
              <Crosshair size={15} /> Тренировать
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

const MATERIAL_LABELS: Record<string, string> = {
  Ascension: 'Материалы вознесения',
  Forte: 'Материалы форте',
  Skill: 'Материалы навыков',
};

export const MaterialsTab = ({ char }: any) => (
  <div className="space-y-6">
    <SectionTitle>Материалы прокачки</SectionTitle>
    {char.materials.map((cat: any, i: number) => (
      <div key={i}>
        <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">{MATERIAL_LABELS[cat.type] || cat.type}</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {cat.items.map((item: any, j: number) => (
            <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-glass border border-glass-border">
              <div className="w-10 h-10 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-light font-bold shrink-0">{item.quantity}</div>
              <div className="min-w-0">
                <p className="text-sm text-white truncate">{item.name}</p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  <MapPin size={11} className="shrink-0" /> {item.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const LoreTab = ({ char }: any) => {
  const lore = LORE[char.id];
  if (!lore) {
    return <p className="text-gray-500 text-sm">Лор для этого персонажа ещё пишется летописцами Соларис-3…</p>;
  }
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>История</SectionTitle>
        <p className="text-sm text-gray-300 leading-relaxed">{lore.story}</p>
      </div>
      <div>
        <SectionTitle>Цитаты</SectionTitle>
        <div className="space-y-3">
          {lore.quotes.map((q: string, i: number) => (
            <blockquote key={i} className="p-4 rounded-xl bg-glass border border-glass-border border-l-4 border-l-accent text-sm text-gray-200 italic">
              «{q}»
            </blockquote>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Факты</SectionTitle>
        <ul className="space-y-2">
          {lore.facts.map((f: string, i: number) => (
            <li key={i} className="flex gap-2 text-sm text-gray-300"><span className="text-accent-light">✦</span>{f}</li>
          ))}
        </ul>
      </div>
      <div>
        <SectionTitle>Связи</SectionTitle>
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
    </div>
  );
};