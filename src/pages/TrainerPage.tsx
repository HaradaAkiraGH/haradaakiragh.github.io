// Страница тренажёра: состав, синергия, шпаргалка по ротации и сама ритм-игра
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ScrollText } from 'lucide-react';
import { TEAM_ROTATIONS } from '../data/teamRotations';
import { getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { TeamRotationTrainer } from '../components/characters/TeamRotationTrainer';

export const TrainerPage = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const team = TEAM_ROTATIONS.find((t) => t.id === teamId);
  const [cheatOpen, setCheatOpen] = useState(false);

  // Блокируем глобальные хоткеи 1–6 и «?», пока открыт тренажёр
  useEffect(() => {
    document.body.dataset.trainer = 'on';
    return () => { delete document.body.dataset.trainer; };
  }, []);

  if (!team) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Команда не найдена</p>
        <Link to="/characters" className="text-accent-light underline">К персонажам</Link>
      </div>
    );
  }

  const first = getCharacterById(team.members[0]);

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <Link
        to={`/characters/${team.members[0]}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-ivory transition-colors focus-ring rounded-lg"
      >
        <ArrowLeft size={18} /> К странице: {first?.name}
      </Link>

      <div>
        <span className="inline-block px-2.5 py-1 rounded-md bg-accent/15 border border-accent/30 text-accent-light text-[10px] font-bold tracking-widest uppercase mb-2">
          {team.role}
        </span>
        <h2 className="text-3xl font-bold text-ivory">{team.name}</h2>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">{team.synergy}</p>
      </div>

      {/* Состав */}
      <div className="flex gap-3">
        {team.members.map((mid) => {
          const c = getCharacterById(mid);
          if (!c) return null;
          return (
            <Link key={mid} to={`/characters/${mid}`} className="flex flex-col items-center gap-1.5 group focus-ring rounded-xl" aria-label={c.name}>
              <ImagePlaceholder id={c.id} initials={c.name.slice(0, 2)} element={c.element} className="w-16 h-20 rounded-xl border border-glass-border group-hover:border-accent/50 transition-colors" />
              <span className="text-xs text-gray-300 group-hover:text-ivory">{c.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Шпаргалка */}
      <div className="glass-panel overflow-hidden">
        <button
          onClick={() => setCheatOpen(!cheatOpen)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-glass-hover transition-colors focus-ring"
          aria-expanded={cheatOpen}
        >
          <span className="flex items-center gap-2 font-semibold text-ivory"><ScrollText size={18} className="text-accent-light" /> Шпаргалка ротации ({team.length}с)</span>
          <ChevronDown size={20} className={`text-gray-400 transition-transform duration-200 ${cheatOpen ? 'rotate-180' : ''}`} />
        </button>
        {cheatOpen && (
          <div className="p-4 pt-0 grid sm:grid-cols-2 gap-1.5 animate-fade-in">
            {team.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-secondary/60 border border-glass-border text-xs">
                <span className="font-mono text-accent-light w-12 shrink-0">{s.t.toFixed(1)}с</span>
                <span className="text-ivory font-semibold shrink-0">{getCharacterById(s.char)?.name}</span>
                <span className="text-gray-300 truncate">{s.skill}</span>
                {s.note && <span className="text-gray-500 truncate hidden md:inline">— {s.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <TeamRotationTrainer team={team} />
    </div>
  );
};