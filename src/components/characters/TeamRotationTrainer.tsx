// Ритм-тренажёр командной ротации: кнопки персонажей, тайминги, оценки, комбо
import { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Eye, EyeOff, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { TeamRotation } from '../../data/teamRotations';
import { getCharacterById } from '../../data/characters';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { TIER_STYLES } from '../../utils/constants';

type Grade = 'PERFECT' | 'GOOD' | 'OK' | 'LATE' | 'MISS';

const GRADE_SCORE: Record<Grade, number> = { PERFECT: 100, GOOD: 75, OK: 45, LATE: 20, MISS: 0 };
const GRADE_COLOR: Record<Grade, string> = {
  PERFECT: 'text-accent-light', GOOD: 'text-green-400', OK: 'text-yellow-300', LATE: 'text-orange-400', MISS: 'text-red-400',
};
const W_PERFECT = 0.25, W_GOOD = 0.6, W_OK = 1.1, W_MISS = 1.5;

interface RunState { idx: number; grades: Grade[]; errors: number; combo: number; maxCombo: number; }

export const TeamRotationTrainer = ({ team }: { team: TeamRotation }) => {
  const steps = team.steps;
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [hints, setHints] = useState(true);
  const [, setFrame] = useState(0);
  const [flash, setFlash] = useState<Record<string, { kind: 'hit' | 'err'; key: number }>>({});

  const startRef = useRef(0);
  const elapsedRef = useRef(0);
  const runRef = useRef<RunState>({ idx: 0, grades: [], errors: 0, combo: 0, maxCombo: 0 });
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const finish = () => {
    const run = runRef.current;
    while (run.grades.length < steps.length) run.grades.push('MISS');
    setPhase('done');
  };

  const start = () => {
    runRef.current = { idx: 0, grades: [], errors: 0, combo: 0, maxCombo: 0 };
    startRef.current = performance.now();
    elapsedRef.current = 0;
    setFlash({});
    setPhase('running');
  };

  const press = (charId: string) => {
    if (phaseRef.current !== 'running') return;
    const run = runRef.current;
    if (run.idx >= steps.length) return;
    const elapsed = elapsedRef.current;
    if (elapsed < 0.15) return;
    const step = steps[run.idx];

    if (charId !== step.char) {
      run.errors++;
      run.combo = 0;
      setFlash((f) => ({ ...f, [charId]: { kind: 'err', key: Date.now() } }));
      setFrame((f) => f + 1);
      return;
    }

    const delta = Math.abs(elapsed - step.t);
    const grade: Grade = delta <= W_PERFECT ? 'PERFECT' : delta <= W_GOOD ? 'GOOD' : delta <= W_OK ? 'OK' : 'LATE';
    run.grades.push(grade);
    run.combo++;
    run.maxCombo = Math.max(run.maxCombo, run.combo);
    run.idx++;
    setFlash((f) => ({ ...f, [charId]: { kind: 'hit', key: Date.now() } }));
    if (run.idx >= steps.length) finish();
    else setFrame((f) => f + 1);
  };

  // Игровой цикл: плейhead + автопромахи
  useEffect(() => {
    if (phase !== 'running') return;
    let raf = 0;
    const loop = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      elapsedRef.current = elapsed;
      const run = runRef.current;
      while (run.idx < steps.length && elapsed > steps[run.idx].t + W_MISS) {
        run.grades.push('MISS');
        run.combo = 0;
        run.idx++;
      }
      if (run.idx >= steps.length || elapsed > team.length + 1) {
        finish();
        return;
      }
      setFrame((f) => f + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Клавиши 1..4
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'running') return;
      const n = Number(e.key);
      if (n >= 1 && n <= team.members.length) press(team.members[n - 1]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team]);

  const run = runRef.current;
  const elapsed = elapsedRef.current;
  const current = steps[run.idx];
  const score = phase === 'done'
    ? Math.max(0, Math.round(run.grades.reduce((s, g) => s + GRADE_SCORE[g], 0) / steps.length - run.errors * 10))
    : 0;
  const rating: 'S' | 'A' | 'B' | 'C' = score >= 90 ? 'S' : score >= 75 ? 'A' : score >= 55 ? 'B' : 'C';
  const accuracy = phase === 'done' ? Math.round((run.grades.filter((g) => g !== 'MISS').length / steps.length) * 100) : 0;

  return (
    <div className="glass-panel p-5 md:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-semibold text-ivory flex items-center gap-2">
            <Target size={16} className="text-accent-light" /> Тренажёр ротации команды
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Жми кнопки персонажей в порядке и в тайминги (клавиши 1–{team.members.length}). Окна баффов важнее скорости!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHints(!hints)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-glass border border-glass-border text-xs text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring"
            aria-label={hints ? 'Скрыть подсказки скиллов' : 'Показать подсказки скиллов'}
          >
            {hints ? <Eye size={14} /> : <EyeOff size={14} />}
            {hints ? 'Подсказки вкл' : 'Подсказки выкл'}
          </button>
          {phase !== 'running' && (
            <button
              onClick={start}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring"
            >
              {phase === 'done' ? <><RotateCcw size={16} /> Ещё раз</> : <><Play size={16} /> Старт</>}
            </button>
          )}
        </div>
      </div>

      {/* Таймлайн с плейhead */}
      <div className="relative h-4 rounded-full bg-bg-secondary border border-glass-border overflow-visible">
        {steps.map((s, i) => {
          const grade = run.grades[i];
          const isCurrent = i === run.idx && phase === 'running';
          return (
            <span
              key={i}
              title={`${s.t.toFixed(1)}с · ${getCharacterById(s.char)?.name}`}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-colors ${
                grade ? (grade === 'MISS' ? 'bg-red-500' : grade === 'PERFECT' ? 'bg-accent-light' : 'bg-green-400')
                  : isCurrent ? 'bg-ivory ring-2 ring-accent' : 'bg-gray-600'
              }`}
              style={{ left: `${(s.t / team.length) * 100}%`, width: isCurrent ? 12 : 8, height: isCurrent ? 12 : 8 }}
            />
          );
        })}
        {phase !== 'idle' && (
          <span
            className="absolute top-[-4px] bottom-[-4px] w-[2px] bg-accent-light shadow-glow-sm"
            style={{ left: `${Math.min(100, (elapsed / team.length) * 100)}%` }}
          />
        )}
      </div>

      {/* Текущая цель + счётчики */}
      {phase === 'running' && (
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-mono text-accent-light tabular-nums text-lg">{elapsed.toFixed(1)}с</span>
          <span className="text-gray-400">Шаг {Math.min(run.idx + 1, steps.length)} / {steps.length}</span>
          <span className="text-gray-400">Комбо: <span className="text-ivory font-semibold">{run.combo}</span></span>
          <span className={`ml-auto ${run.errors ? 'text-red-400' : 'text-gray-500'}`}>Промахов: {run.errors}</span>
          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-gray-500 shrink-0">Сейчас:</span>
            {current && (
              <span className="px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-accent-light text-xs font-semibold">
                {getCharacterById(current.char)?.name}
                {hints ? ` — ${current.skill}` : ''} <span className="text-gray-400 font-mono">({current.t.toFixed(1)}с)</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Очередь шагов */}
      {phase === 'running' && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {steps.slice(run.idx, run.idx + 5).map((s, i) => (
            <span key={`${s.t}-${i}`} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs shrink-0 ${i === 0 ? 'bg-accent/15 border-accent/40 text-ivory' : 'bg-glass border-glass-border text-gray-400'}`}>
              <span className="font-mono">{s.t.toFixed(1)}с</span>
              <span className="font-semibold">{getCharacterById(s.char)?.name}</span>
              {hints && <span className="text-gray-500">{s.skill}</span>}
            </span>
          ))}
        </div>
      )}

      {/* Кнопки персонажей */}
      <div className={`grid gap-3 ${team.members.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {team.members.map((mid, i) => {
          const c = getCharacterById(mid);
          if (!c) return null;
          const fl = flash[mid];
          return (
            <motion.button
              key={mid}
              whileTap={{ scale: 0.93 }}
              onClick={() => press(mid)}
              disabled={phase !== 'running'}
              className="relative overflow-hidden rounded-2xl border border-glass-border bg-glass p-2 disabled:opacity-60 hover:border-accent/40 transition-colors focus-ring"
              aria-label={`Нажать ${c.name} (клавиша ${i + 1})`}
            >
              {fl && (
                <motion.span
                  key={fl.key}
                  initial={{ opacity: 0.65 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className={`absolute inset-0 z-10 ${fl.kind === 'hit' ? 'bg-green-400/50' : 'bg-red-500/50'}`}
                />
              )}
              <ImagePlaceholder id={c.id} initials={c.name.slice(0, 2)} element={c.element} className="w-full aspect-square rounded-xl" />
              <span className="block mt-2 text-sm font-semibold text-ivory truncate">{c.name}</span>
              <kbd className="absolute top-3 right-3 px-1.5 py-0.5 text-[10px] bg-bg/80 border border-glass-border rounded text-gray-400">{i + 1}</kbd>
            </motion.button>
          );
        })}
      </div>

      {/* Результаты */}
      {phase === 'done' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-glass border border-glass-border">
            <span className={`w-14 h-14 rounded-xl border flex items-center justify-center text-2xl font-extrabold ${TIER_STYLES[rating]}`}>{rating}</span>
            <div className="flex-1 min-w-[160px] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div><p className="text-lg font-bold text-ivory">{score}</p><p className="text-[10px] text-gray-500">очки</p></div>
              <div><p className="text-lg font-bold text-ivory">{accuracy}%</p><p className="text-[10px] text-gray-500">точность</p></div>
              <div><p className="text-lg font-bold text-ivory">x{run.maxCombo}</p><p className="text-[10px] text-gray-500">макс. комбо</p></div>
              <div><p className="text-lg font-bold text-ivory">{elapsedRef.current.toFixed(1)}с</p><p className="text-[10px] text-gray-500">время</p></div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-secondary/60 border border-glass-border text-xs">
                <span className="font-mono text-gray-500 w-12 shrink-0">{s.t.toFixed(1)}с</span>
                <span className="text-ivory truncate flex-1">{getCharacterById(s.char)?.name} · {s.skill}</span>
                <span className={`font-bold shrink-0 ${GRADE_COLOR[run.grades[i]]}`}>{run.grades[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};