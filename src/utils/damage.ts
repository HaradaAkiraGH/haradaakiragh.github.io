// Упрощённая модель урона для сравнения билдов (не 1:1 с игрой,
// но корректно отражает вклад крит/ATK%/бонуса элемента/DEF/RES).
export interface StatsInput {
  atk: number;           // базовая атака
  atkBonusPct: number;   // +% атаки из эхо/оружия
  critRate: number;      // 0..1
  critDmg: number;       // 1.5 = +150%
  elementBonus: number;  // 0.3 = +30% урона элемента
  skillMultiplier: number; // множитель скилла (1.8 = 180% ATK)
  level: number;         // уровень персонажа (для DEF-формулы)
  targetDef: number;     // DEF цели (обычно 400–600 для элит)
  targetRes: number;     // RES цели к элементу (0.1 = 10%)
  hitsPerCycle: number;  // сколько ударов в ротации (для DPS)
  cycleSeconds: number;  // длительность цикла в секундах
}

// DEF-множитель: стандартная для action-RPG формула
const defMult = (level: number, def: number) => (level + 100) / (level + def + 200);

// Базовый урон за один удар (без крита)
const baseDmg = (s: StatsInput) =>
  s.atk * (1 + s.atkBonusPct / 100) * s.skillMultiplier * (1 + s.elementBonus) * defMult(s.level, s.targetDef) * (1 - s.targetRes);

export interface DamageResult {
  normalHit: number;    // обычный удар
  critHit: number;      // критический удар
  averageHit: number;   // средний удар (учёт шанса крита)
  cycleTotal: number;   // сумма за цикл
  dps: number;          // средний DPS за цикл
}

export function calculateDamage(s: StatsInput): DamageResult {
  const base = baseDmg(s);
  const normal = base;
  const crit = base * s.critDmg;
  const avg = normal * (1 - s.critRate) + crit * s.critRate;
  const cycle = avg * s.hitsPerCycle;
  const dps = cycle / Math.max(1, s.cycleSeconds);
  return {
    normalHit: Math.round(normal),
    critHit: Math.round(crit),
    averageHit: Math.round(avg),
    cycleTotal: Math.round(cycle),
    dps: Math.round(dps),
  };
}

// Сравнение двух билдов в процентах
export function compareDamage(a: StatsInput, b: StatsInput) {
  const da = calculateDamage(a);
  const db = calculateDamage(b);
  return {
    dpsDiffPct: da.dps === 0 ? 0 : Math.round(((db.dps - da.dps) / da.dps) * 100),
    cycleDiffPct: da.cycleTotal === 0 ? 0 : Math.round(((db.cycleTotal - da.cycleTotal) / da.cycleTotal) * 100),
    a: da,
    b: db,
  };
}