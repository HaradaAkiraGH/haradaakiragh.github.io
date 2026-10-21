// Интерактивный калькулятор Stellar Wiki:
// 1) Оценщик ценности Эхо (Echo Scorer) под конкретного персонажа с рангами C / B / A / S / SS / SSS
// 2) Калькулятор итогового урона и Crit Value (CV)
import { useMemo, useState } from 'react';
import {
  Calculator,
  Sparkles,
  Swords,
  Plus,
  Trash2,
  RotateCcw,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

/* ---------- Справочник сабстатов Эхо и их реальных роллов в Wuthering Waves ---------- */
interface SubstatDef {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultVal: number;
  unit: string;
}

const SUBSTATS: SubstatDef[] = [
  { id: 'cr', label: 'Crit Rate', min: 6.3, max: 10.5, step: 0.3, defaultVal: 8.4, unit: '%' },
  { id: 'cd', label: 'Crit DMG', min: 12.6, max: 21.0, step: 0.6, defaultVal: 16.8, unit: '%' },
  { id: 'atk_pct', label: 'ATK %', min: 6.4, max: 11.6, step: 0.4, defaultVal: 8.6, unit: '%' },
  { id: 'er', label: 'Energy Regen', min: 6.8, max: 12.4, step: 0.4, defaultVal: 9.2, unit: '%' },
  { id: 'skill_dmg', label: 'Resonance Skill DMG', min: 6.4, max: 11.6, step: 0.4, defaultVal: 8.6, unit: '%' },
  { id: 'lib_dmg', label: 'Resonance Liberation DMG', min: 6.4, max: 11.6, step: 0.4, defaultVal: 8.6, unit: '%' },
  { id: 'heavy_dmg', label: 'Heavy Attack DMG', min: 6.4, max: 11.6, step: 0.4, defaultVal: 8.6, unit: '%' },
  { id: 'basic_dmg', label: 'Basic Attack DMG', min: 6.4, max: 11.6, step: 0.4, defaultVal: 8.6, unit: '%' },
  { id: 'hp_pct', label: 'HP %', min: 6.4, max: 11.6, step: 0.4, defaultVal: 8.6, unit: '%' },
  { id: 'def_pct', label: 'DEF %', min: 8.1, max: 14.7, step: 0.5, defaultVal: 10.9, unit: '%' },
  { id: 'atk_flat', label: 'Flat ATK', min: 30, max: 60, step: 10, defaultVal: 40, unit: '' },
];

interface SubstatSlot {
  statId: string;
  value: number;
}

interface SavedEchoItem {
  id: string;
  charId: string;
  cost: 4 | 3 | 1;
  mainStat: string;
  score: number;
  cv: number;
  grade: string;
}

const DEFAULT_SLOTS: SubstatSlot[] = [
  { statId: 'cr', value: 8.7 },
  { id: 'cd', statId: 'cd', value: 17.4 } as SubstatSlot,
  { statId: 'atk_pct', value: 8.6 },
  { statId: 'er', value: 9.2 },
  { statId: 'lib_dmg', value: 8.6 },
];

/* Веса статов в зависимости от роли персонажа */
function getWeightsForRole(role: string): Record<string, number> {
  if (role === 'Healer') {
    return {
      er: 1.8,
      hp_pct: 1.6,
      atk_pct: 1.1,
      def_pct: 0.7,
      cr: 0.6,
      cd: 0.3,
      lib_dmg: 0.5,
      skill_dmg: 0.5,
      heavy_dmg: 0.3,
      basic_dmg: 0.3,
      atk_flat: 0.3,
    };
  }
  if (role === 'Defender') {
    return {
      def_pct: 1.7,
      hp_pct: 1.5,
      er: 1.5,
      cr: 1.0,
      cd: 0.6,
      atk_pct: 0.8,
      skill_dmg: 0.7,
      lib_dmg: 0.7,
      heavy_dmg: 0.5,
      basic_dmg: 0.4,
      atk_flat: 0.2,
    };
  }
  if (role === 'Support' || role === 'Sub DPS') {
    return {
      cr: 2.0,
      cd: 1.0,
      er: 1.35,
      atk_pct: 1.15,
      skill_dmg: 0.95,
      lib_dmg: 1.0,
      heavy_dmg: 0.75,
      basic_dmg: 0.75,
      atk_flat: 0.35,
      hp_pct: 0.2,
      def_pct: 0.2,
    };
  }
  // Main DPS
  return {
    cr: 2.0,
    cd: 1.0,
    atk_pct: 1.25,
    er: 0.95,
    skill_dmg: 0.95,
    lib_dmg: 0.95,
    heavy_dmg: 0.9,
    basic_dmg: 0.9,
    atk_flat: 0.4,
    hp_pct: 0.15,
    def_pct: 0.15,
  };
}

function getGradeMeta(score: number) {
  if (score >= 48) {
    return {
      grade: 'SSS',
      title: 'Божественный шедевр Соларис-3',
      color: 'text-amber-300 border-amber-400/60 bg-amber-500/20 shadow-[0_0_25px_rgba(251,191,36,0.35)]',
    };
  }
  if (score >= 40) {
    return {
      grade: 'SS',
      title: 'Эндгейм-совершенство',
      color: 'text-rose-300 border-rose-400/50 bg-rose-500/20',
    };
  }
  if (score >= 32) {
    return {
      grade: 'S',
      title: 'Отличное боевое Эхо',
      color: 'text-purple-300 border-purple-400/50 bg-purple-500/20',
    };
  }
  if (score >= 24) {
    return {
      grade: 'A',
      title: 'Хорошая рабочая база',
      color: 'text-cyan-300 border-cyan-400/50 bg-cyan-500/15',
    };
  }
  if (score >= 16) {
    return {
      grade: 'B',
      title: 'Временный вариант',
      color: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10',
    };
  }
  return {
    grade: 'C',
    title: 'На перековку (корм)',
    color: 'text-gray-400 border-white/15 bg-white/5',
  };
}

export const CalculatorPage = () => {
  useDocumentMeta({
    title: 'Оценщик Эхо и Калькулятор — Stellar Wiki',
    description: 'Калькулятор ценности Эхо (Echo Scorer) с рангами B–SSS и расчёт урона резонаторов.',
  });

  const [activeTab, setActiveTab] = useState<'scorer' | 'damage'>('scorer');

  // Состояние Echo Scorer
  const [selectedCharId, setSelectedCharId] = useState('camellya');
  const [echoCost, setEchoCost] = useState<4 | 3 | 1>(4);
  const [mainStat, setMainStat] = useState('Crit DMG 44%');
  const [slots, setSlots] = useState<SubstatSlot[]>(DEFAULT_SLOTS);
  const [savedEchoes, setSavedEchoes] = useLocalStorage<SavedEchoItem[]>('ww_saved_echoes_v1', []);

  // Состояние Калькулятора урона
  const [baseAtk, setBaseAtk] = useState(2350);
  const [critRatePct, setCritRatePct] = useState(72);
  const [critDmgPct, setCritDmgPct] = useState(265);
  const [elemBonusPct, setElemBonusPct] = useState(82);
  const [skillMultPct, setSkillMultPct] = useState(420);

  const selectedChar = useMemo(
    () => getCharacterById(selectedCharId) ?? CHARACTERS[0],
    [selectedCharId],
  );

  // Расчёт Echo Score и Crit Value (CV)
  const echoResult = useMemo(() => {
    const weights = getWeightsForRole(selectedChar.role);
    let totalScore = 0;
    let critValue = 0;

    for (const sl of slots) {
      const def = SUBSTATS.find((s) => s.id === sl.statId);
      if (!def) continue;
      const w = weights[sl.statId] ?? 0.2;

      if (sl.statId === 'cr') critValue += sl.value * 2;
      if (sl.statId === 'cd') critValue += sl.value;

      // Нормализуем вклад стата относительно максимального ролла (до ~12 очков за идеальный крит-ролл)
      const ratio = Math.min(1.2, Math.max(0, sl.value / def.max));
      totalScore += ratio * 10 * w;
    }

    const roundedScore = Math.round(totalScore * 10) / 10;
    const roundedCv = Math.round(critValue * 10) / 10;
    const meta = getGradeMeta(roundedScore);

    return {
      score: roundedScore,
      cv: roundedCv,
      ...meta,
    };
  }, [slots, selectedChar.role]);

  const updateSlotStat = (idx: number, nextStatId: string) => {
    const def = SUBSTATS.find((s) => s.id === nextStatId) ?? SUBSTATS[0];
    setSlots((prev) =>
      prev.map((item, i) => (i === idx ? { statId: def.id, value: def.defaultVal } : item)),
    );
  };

  const updateSlotValue = (idx: number, nextVal: number) => {
    setSlots((prev) => prev.map((item, i) => (i === idx ? { ...item, value: nextVal } : item)));
  };

  const saveCurrentEcho = () => {
    const item: SavedEchoItem = {
      id: `${Date.now()}`,
      charId: selectedChar.id,
      cost: echoCost,
      mainStat,
      score: echoResult.score,
      cv: echoResult.cv,
      grade: echoResult.grade,
    };
    setSavedEchoes([item, ...savedEchoes.slice(0, 14)]);
  };

  const removeSavedEcho = (id: string) => {
    setSavedEchoes(savedEchoes.filter((x) => x.id !== id));
  };

  // Расчёт урона для вкладки 2
  const damageResult = useMemo(() => {
    const mult = skillMultPct / 100;
    const bonus = 1 + elemBonusPct / 100;
    const defFactor = 0.48; // стандартное сопротивление и защита босса 90 ур.
    const nonCrit = Math.round(baseAtk * mult * bonus * defFactor);
    const critHit = Math.round(nonCrit * (critDmgPct / 100));
    const clampedCr = Math.min(100, Math.max(0, critRatePct)) / 100;
    const avgDmg = Math.round(nonCrit * (1 - clampedCr) + critHit * clampedCr);
    return { nonCrit, critHit, avgDmg };
  }, [baseAtk, critRatePct, critDmgPct, elemBonusPct, skillMultPct]);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Шапка и переключатель режимов */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-ivory flex items-center gap-2.5">
            <Calculator className="text-accent-light" /> Инженерный терминал: Оценщик Эхо и Урон
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Проверь ценность выпавшего Эхо под конкретного резонатора или рассчитай пиковый урон
          </p>
        </div>

        <div className="flex gap-2 p-1 rounded-2xl bg-black/40 border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('scorer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'scorer'
                ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>Оценщик Эхо (Echo Scorer)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('damage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'damage'
                ? 'bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Swords size={14} />
            <span>Калькулятор урона</span>
          </button>
        </div>
      </div>

      {/* ==================== ВКЛАДКА 1: ECHO SCORER ==================== */}
      {activeTab === 'scorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
          {/* Левая панель ввода */}
          <div className="glass-panel p-5 sm:p-6 space-y-5">
            {/* Выбор персонажа и параметров куска Эхо */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="block text-xs font-bold text-gray-300 mb-1.5">Резонатор</span>
                <select
                  value={selectedCharId}
                  onChange={(e) => setSelectedCharId(e.target.value)}
                  className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-sm text-ivory focus-ring"
                >
                  {CHARACTERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-gray-300 mb-1.5">Cost Эхо</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {([4, 3, 1] as const).map((cost) => (
                    <button
                      key={cost}
                      type="button"
                      onClick={() => setEchoCost(cost)}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all ${
                        echoCost === cost
                          ? 'bg-accent/25 border-accent text-accent-light'
                          : 'bg-white/[0.04] border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      Cost {cost}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="block text-xs font-bold text-gray-300 mb-1.5">Основной стат</span>
                <select
                  value={mainStat}
                  onChange={(e) => setMainStat(e.target.value)}
                  className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2.5 text-sm text-ivory focus-ring"
                >
                  <option value="Crit Rate 22%">Crit Rate 22%</option>
                  <option value="Crit DMG 44%">Crit DMG 44%</option>
                  <option value="Element DMG 30%">Element DMG 30%</option>
                  <option value="Energy Regen 32%">Energy Regen 32%</option>
                  <option value="ATK 30% / 18%">ATK% (30% / 18%)</option>
                  <option value="Healing Bonus 26%">Healing Bonus 26%</option>
                  <option value="HP% / DEF%">HP% / DEF%</option>
                </select>
              </label>
            </div>

            {/* 5 слотов сабстатов */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  5 сабстатов твоего Эхо
                </span>
                <button
                  type="button"
                  onClick={() => setSlots(DEFAULT_SLOTS)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Сбросить
                </button>
              </div>

              {slots.map((slot, idx) => {
                const def = SUBSTATS.find((s) => s.id === slot.statId) ?? SUBSTATS[0];
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-[190px,1fr,70px] gap-3 items-center"
                  >
                    <select
                      value={slot.statId}
                      onChange={(e) => updateSlotStat(idx, e.target.value)}
                      className="bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs font-bold text-ivory focus-ring"
                    >
                      {SUBSTATS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    <input
                      type="range"
                      min={def.min}
                      max={def.max}
                      step={def.step}
                      value={slot.value}
                      onChange={(e) => updateSlotValue(idx, parseFloat(e.target.value))}
                      className="w-full"
                    />

                    <span className="text-right font-mono text-sm font-extrabold text-accent-light tabular-nums">
                      {slot.value}
                      {def.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Правая колонка: Итоговый вердикт и сохранённые Эхо */}
          <div className="space-y-4">
            <div className="glass-panel p-6 text-center space-y-4 solaris-crest">
              <div className="flex items-center justify-center gap-3">
                <ImagePlaceholder
                  id={selectedChar.id}
                  initials={selectedChar.name.slice(0, 2)}
                  element={selectedChar.element}
                  className="w-12 h-14 rounded-xl border border-white/15 object-cover object-top"
                />
                <div className="text-left">
                  <p className="text-sm font-extrabold text-white">{selectedChar.name}</p>
                  <p className="text-xs text-gray-400">
                    Роль: {selectedChar.role} · Cost {echoCost}
                  </p>
                </div>
              </div>

              <div className={`py-4 px-5 rounded-2xl border ${echoResult.color}`}>
                <p className="text-xs font-bold uppercase tracking-widest opacity-80">Итоговый грейд</p>
                <p className="text-5xl font-black tracking-tight my-1">{echoResult.grade}</p>
                <p className="text-xs font-semibold">{echoResult.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Echo Score
                  </span>
                  <strong className="text-xl font-black text-white tabular-nums">
                    {echoResult.score} pt
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">
                    Crit Value (CV)
                  </span>
                  <strong className="text-xl font-black text-accent-light tabular-nums">
                    {echoResult.cv}%
                  </strong>
                </div>
              </div>

              <button
                type="button"
                onClick={saveCurrentEcho}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-extrabold flex items-center justify-center gap-2 hover:brightness-105 transition-all"
              >
                <Plus size={15} />
                <span>Сохранить на полку Эхо</span>
              </button>
            </div>

            {/* Полка сохранённых Эхо */}
            {savedEchoes.length > 0 && (
              <div className="glass-panel p-4 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Award size={14} className="text-accent-light" />
                  <span>Моя полка Эхо ({savedEchoes.length})</span>
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {savedEchoes.map((item) => {
                    const ch = getCharacterById(item.charId);
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">
                            {ch?.name ?? item.charId} · Cost {item.cost}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {item.mainStat} · CV {item.cv}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-accent/20 text-accent-light font-black">
                            {item.grade} ({item.score})
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSavedEcho(item.id)}
                            className="text-gray-500 hover:text-rose-400"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== ВКЛАДКА 2: КАЛЬКУЛЯТОР УРОНА ==================== */}
      {activeTab === 'damage' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
          <div className="glass-panel p-5 sm:p-6 space-y-4">
            <h3 className="text-lg font-bold text-ivory">Параметры атаки резонатора</h3>

            <label className="block">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold">Итоговая Атака (ATK)</span>
                <span className="font-mono text-accent-light font-bold">{baseAtk}</span>
              </div>
              <input
                type="range"
                min={800}
                max={4500}
                step={25}
                value={baseAtk}
                onChange={(e) => setBaseAtk(Number(e.target.value))}
                className="w-full"
              />
            </label>

            <label className="block">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold">Crit Rate (%)</span>
                <span className="font-mono text-accent-light font-bold">{critRatePct}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={1}
                value={critRatePct}
                onChange={(e) => setCritRatePct(Number(e.target.value))}
                className="w-full"
              />
            </label>

            <label className="block">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold">Crit DMG (%)</span>
                <span className="font-mono text-accent-light font-bold">{critDmgPct}%</span>
              </div>
              <input
                type="range"
                min={150}
                max={380}
                step={2}
                value={critDmgPct}
                onChange={(e) => setCritDmgPct(Number(e.target.value))}
                className="w-full"
              />
            </label>

            <label className="block">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold">Бонус элементального и тип-урона (%)</span>
                <span className="font-mono text-accent-light font-bold">{elemBonusPct}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                step={2}
                value={elemBonusPct}
                onChange={(e) => setElemBonusPct(Number(e.target.value))}
                className="w-full"
              />
            </label>

            <label className="block">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold">Множитель навыка / ульты (%)</span>
                <span className="font-mono text-accent-light font-bold">{skillMultPct}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={1500}
                step={10}
                value={skillMultPct}
                onChange={(e) => setSkillMultPct(Number(e.target.value))}
                className="w-full"
              />
            </label>
          </div>

          <div className="glass-panel p-6 space-y-4 solaris-crest">
            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-400" />
              <span>Расчёт по боссу 90 ур.</span>
            </h4>

            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-center">
              <span className="text-[11px] uppercase font-bold text-amber-200 block">
                Критический удар
              </span>
              <strong className="text-3xl font-black text-amber-300 tabular-nums mt-1 block">
                {damageResult.critHit.toLocaleString('ru-RU')}
              </strong>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Средний урон
                </span>
                <strong className="text-lg font-black text-white tabular-nums">
                  {damageResult.avgDmg.toLocaleString('ru-RU')}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">
                  Без крита
                </span>
                <strong className="text-lg font-black text-gray-300 tabular-nums">
                  {damageResult.nonCrit.toLocaleString('ru-RU')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};