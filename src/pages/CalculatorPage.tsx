// Калькулятор урона: форма статов + результаты + пресеты.
// Мобильный бонус: плавающая пилюля с DPS, тап → скролл к результатам.
import { useMemo, useRef, useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { calculateDamage, StatsInput } from '../utils/damage';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const DEFAULTS: StatsInput = {
  atk: 1200, atkBonusPct: 100, critRate: 0.7, critDmg: 1.7,
  elementBonus: 0.3, skillMultiplier: 2.0, level: 80,
  targetDef: 500, targetRes: 0.1, hitsPerCycle: 8, cycleSeconds: 12,
};
const PRESETS: Record<string, Partial<StatsInput>> = {
  'Main DPS': { atk: 1200, atkBonusPct: 120, critRate: 0.75, critDmg: 1.9, elementBonus: 0.4, skillMultiplier: 2.2, hitsPerCycle: 10 },
  'Sub DPS':  { atk: 1000, atkBonusPct: 90, critRate: 0.6, critDmg: 1.6, elementBonus: 0.3, skillMultiplier: 1.6, hitsPerCycle: 4, cycleSeconds: 15 },
  Support:    { atk: 800, atkBonusPct: 50, critRate: 0.3, critDmg: 1.5, elementBonus: 0.1, skillMultiplier: 1.0, hitsPerCycle: 2, cycleSeconds: 15 },
};
interface SliderProps { label: string; hint?: string; value: number; min: number; max: number; step: number; format?: (v: number) => string; onChange: (v: number) => void; }
const Slider = ({ label, hint, value, min, max, step, format = (v) => String(v), onChange }: SliderProps) => (
  <label className="block">
    <div className="flex items-baseline justify-between gap-2 mb-1">
      <span className="text-xs text-gray-300 font-medium">{label}</span>
      <span className="text-xs text-accent-light font-mono tabular-nums">{format(value)}</span>
    </div>
    {hint && <p className="text-[10px] text-gray-500 -mt-0.5 mb-1.5">{hint}</p>}
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-[rgb(var(--accent))] h-6"
    />
  </label>
);
const Stat = ({ label, value, suffix = '' }: { label: string; value: string | number; suffix?: string }) => (
  <div className="p-3 rounded-xl bg-glass border border-glass-border">
    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
    <p className="text-lg sm:text-xl font-bold text-ivory mt-1 tabular-nums">{value}{suffix}</p>
  </div>
);

export const CalculatorPage = () => {
  useDocumentMeta({ title: 'Калькулятор урона', description: 'Посчитай урон билда: ATK, крит, бонус элемента, DEF и RES цели. Пресеты Main DPS / Sub DPS / Support.' });
  const [s, setS] = useState<StatsInput>(DEFAULTS);
  const resultRef = useRef<HTMLDivElement>(null);
  const patch = (p: Partial<StatsInput>) => setS((prev) => ({ ...prev, ...p }));
  const result = useMemo(() => calculateDamage(s), [s]);
  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-ivory flex items-center gap-3">
          <Calculator size={26} className="text-accent-light shrink-0" /> Калькулятор урона
        </h2>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">Упрощённая модель: корректно сравнивает билды, но не гарантирует точность 1:1 с игрой</p>
      </div>
      <div className="grid lg:grid-cols-[1fr,380px] gap-4">
        {/* Форма */}
        <div className="glass-panel p-4 sm:p-5 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-ivory mb-3">Пресеты</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((name) => (
                <button
                  key={name}
                  onClick={() => setS({ ...DEFAULTS, ...PRESETS[name] })}
                  className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-xs text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring"
                >
                  {name}
                </button>
              ))}
              <button
                onClick={() => setS(DEFAULTS)}
                className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-xs text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring flex items-center gap-1.5"
              >
                <RotateCcw size={12} /> Сброс
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Атака</h4>
              <Slider label="Базовый ATK" value={s.atk} min={400} max={2500} step={10} onChange={(v) => patch({ atk: v })} />
              <Slider label="+% ATK (эхо/оружие)" hint="Сумма всех % атаки" value={s.atkBonusPct} min={0} max={200} step={1} format={(v) => `${v}%`} onChange={(v) => patch({ atkBonusPct: v })} />
              <Slider label="Множитель скилла" hint="180% ATK = 1.8" value={s.skillMultiplier} min={0.5} max={5} step={0.05} format={(v) => `${v.toFixed(2)}x`} onChange={(v) => patch({ skillMultiplier: v })} />
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Крит</h4>
              <Slider label="Crit Rate" value={s.critRate} min={0} max={1} step={0.01} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => patch({ critRate: v })} />
              <Slider label="Crit DMG" hint="1.5 = +150%" value={s.critDmg} min={1} max={3} step={0.05} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => patch({ critDmg: v })} />
              <Slider label="Бонус элемента" value={s.elementBonus} min={0} max={0.8} step={0.01} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => patch({ elementBonus: v })} />
            </div>
            <div className="space-y-4 md:col-span-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Цель и цикл</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Slider label="Уровень персонажа" value={s.level} min={1} max={90} step={1} onChange={(v) => patch({ level: v })} />
                <Slider label="DEF цели" hint="элиты ≈ 500, боссы ≈ 700" value={s.targetDef} min={0} max={1500} step={10} onChange={(v) => patch({ targetDef: v })} />
                <Slider label="RES цели к элементу" value={s.targetRes} min={0} max={0.8} step={0.01} format={(v) => `${(v * 100).toFixed(0)}%`} onChange={(v) => patch({ targetRes: v })} />
                <Slider label="Ударов за цикл" value={s.hitsPerCycle} min={1} max={25} step={1} onChange={(v) => patch({ hitsPerCycle: v })} />
                <Slider label="Цикл, сек" value={s.cycleSeconds} min={3} max={30} step={1} onChange={(v) => patch({ cycleSeconds: v })} />
              </div>
            </div>
          </div>
        </div>
        {/* Результаты */}
        <div ref={resultRef} className="glass-panel p-4 sm:p-5 space-y-4 lg:sticky lg:top-6 self-start scroll-mt-20">
          <h3 className="text-sm font-semibold text-ivory">Результат</h3>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Обычный удар" value={result.normalHit.toLocaleString('ru-RU')} />
            <Stat label="Критический" value={result.critHit.toLocaleString('ru-RU')} />
            <Stat label="Средний удар" value={result.averageHit.toLocaleString('ru-RU')} />
            <Stat label="Урон за цикл" value={result.cycleTotal.toLocaleString('ru-RU')} />
          </div>
          <div className="p-4 rounded-xl bg-accent/15 border border-accent/30 text-center">
            <p className="text-[10px] text-accent-light uppercase tracking-widest font-bold">Средний DPS</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-gradient mt-1 tabular-nums">{result.dps.toLocaleString('ru-RU')}</p>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Формула учитывает DEF (чем выше уровень цели — тем меньше твой урон) и RES цели к твоему элементу. Крит усреднён по шансу.
          </p>
        </div>
      </div>
      {/* Мобильная плавающая пилюля DPS */}
      <button
        onClick={() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] z-40 lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold shadow-glow focus-ring"
        aria-label="Показать результаты"
      >
        DPS {result.dps.toLocaleString('ru-RU')}
      </button>
    </div>
  );
};