// Готовые команды для тир-листа связок (раздел «Мета»)
import { Tier } from './types';

export interface TeamTierEntry {
  tier: Tier;
  name: string;
  members: string[]; // id персонажей
  note: string;
}

export const TEAM_TIERS: TeamTierEntry[] = [
  { tier: 'S', name: 'Havoc-гиперкэрри', members: ['camellya', 'yinlin', 'verina'], note: 'Yinlin держит офф-филд урон, Verina лечит и баффает ATK — Камеллия собирает пик в окно баффов.' },
  { tier: 'S', name: 'Fusion-классика', members: ['changli', 'yinlin', 'verina'], note: 'Резонанс Fusion+Electro, стабильная энергия, самый ровный урон по боссам.' },
  { tier: 'S', name: 'Spectro-буря', members: ['jinhsi', 'phoebe', 'verina'], note: 'Двойной Spectro-резонанс разгоняет ульты обоих; Phoebe закрывает простой Jinhsi на зарядке.' },
  { tier: 'A', name: 'Electro-экзекуция', members: ['calcharo', 'yinlin', 'verina'], note: 'Полный электро-резонанс; требует парирования, но платит выше среднего.' },
  { tier: 'A', name: 'Aero-зачистка', members: ['jiyan', 'yinlin', 'verina'], note: 'Лучший AoE-вариант мета-тройки: Jiyan сносит пачки, Yinlin добирает одиночек.' },
  { tier: 'A', name: 'Glacio-контроль', members: ['camellya', 'zhezhi', 'verina'], note: 'Полотно Zhezhi усиливает урон союзника; комфортнее против медленных боссов.' },
  { tier: 'B', name: 'Стартовый состав', members: ['encore', 'yinlin', 'verina'], note: 'Честно работает до первого 5★ DPS: хватает на Башню до 30 этажа.' },
];