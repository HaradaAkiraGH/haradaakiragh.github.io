// Ротации КОМАНД: последовательность нажатий с таймингами (секунды от старта).
// t — целевой момент нажатия; окна оценок задаёт тренажёр.
// Добавляй новые команды просто дописывая объект.
export interface TeamRotationStep {
  t: number;        // целевое время, сек
  char: string;     // id персонажа, кнопку которого жмём
  skill: string;    // что нажимаем
  note?: string;    // зачем (баффы, окна урона)
}

export interface TeamRotation {
  id: string;
  name: string;
  members: string[];
  role: string;
  synergy: string;
  length: number;   // длительность цикла, сек
  steps: TeamRotationStep[];
}

export const TEAM_ROTATIONS: TeamRotation[] = [
  {
    id: 'camellya-hyper',
    name: 'Havoc-гиперкэрри',
    members: ['camellya', 'yinlin', 'verina'],
    role: 'Camellya — Main DPS',
    synergy: 'Verina ставит бафф ATK и лечение, Yinlin держит офф-филд электро, Camellya собирает пик в окно баффов.',
    length: 15,
    steps: [
      { t: 0.0, char: 'verina', skill: 'Intro Skill', note: 'вход с баффом атаки' },
      { t: 1.0, char: 'verina', skill: 'Resonance Liberation', note: 'лечащее поле + бафф ATK' },
      { t: 2.2, char: 'verina', skill: 'Resonance Skill' },
      { t: 3.2, char: 'yinlin', skill: 'Intro Skill', note: 'электро-приложение' },
      { t: 4.2, char: 'yinlin', skill: 'Resonance Liberation' },
      { t: 5.4, char: 'yinlin', skill: 'Resonance Skill', note: 'молнии остаются — уходим' },
      { t: 6.6, char: 'camellya', skill: 'Intro Skill', note: 'вход ровно в окно баффов' },
      { t: 7.6, char: 'camellya', skill: 'Resonance Skill' },
      { t: 8.8, char: 'camellya', skill: 'Basic Attack x3', note: 'копим метки цветка' },
      { t: 10.4, char: 'camellya', skill: 'Heavy Attack' },
      { t: 11.6, char: 'camellya', skill: 'Resonance Liberation', note: 'пик урона внутри баффов' },
      { t: 13.2, char: 'camellya', skill: 'Basic Attack x2', note: 'дожим цикла' },
    ],
  },
  {
    id: 'camellya-glacio',
    name: 'Glacio-полотно',
    members: ['camellya', 'zhezhi', 'verina'],
    role: 'Camellya — Main DPS',
    synergy: 'Полотно Zhezhi усиливает урон союзника; комфортный вариант против медленных боссов.',
    length: 14,
    steps: [
      { t: 0.0, char: 'verina', skill: 'Intro Skill' },
      { t: 1.0, char: 'verina', skill: 'Resonance Liberation', note: 'бафф ATK' },
      { t: 2.4, char: 'zhezhi', skill: 'Intro Skill' },
      { t: 3.4, char: 'zhezhi', skill: 'Resonance Liberation', note: 'холст баффает урон союзника' },
      { t: 4.6, char: 'zhezhi', skill: 'Resonance Skill', note: 'уходим с поля' },
      { t: 5.8, char: 'camellya', skill: 'Intro Skill', note: 'вход под двойной бафф' },
      { t: 7.0, char: 'camellya', skill: 'Resonance Skill' },
      { t: 8.2, char: 'camellya', skill: 'Basic Attack x3' },
      { t: 9.8, char: 'camellya', skill: 'Heavy Attack' },
      { t: 11.0, char: 'camellya', skill: 'Resonance Liberation', note: 'пик под полотном' },
    ],
  },
  {
    id: 'changli-fusion',
    name: 'Fusion-классика',
    members: ['changli', 'yinlin', 'verina'],
    role: 'Changli — Main DPS',
    synergy: 'Резонанс Fusion+Electro, стабильная энергия, самый ровный урон по боссам.',
    length: 14,
    steps: [
      { t: 0.0, char: 'verina', skill: 'Intro Skill' },
      { t: 1.0, char: 'verina', skill: 'Resonance Liberation' },
      { t: 2.4, char: 'yinlin', skill: 'Intro Skill' },
      { t: 3.4, char: 'yinlin', skill: 'Resonance Liberation' },
      { t: 4.6, char: 'yinlin', skill: 'Resonance Skill', note: 'уходим' },
      { t: 5.8, char: 'changli', skill: 'Intro Skill', note: 'вход в окно баффов' },
      { t: 6.8, char: 'changli', skill: 'Resonance Skill' },
      { t: 8.0, char: 'changli', skill: 'Basic Attack x3', note: 'заряжаем перо феникса' },
      { t: 9.6, char: 'changli', skill: 'Heavy Attack', note: 'активация пера' },
      { t: 11.0, char: 'changli', skill: 'Resonance Liberation', note: 'пик цикла' },
    ],
  },
  {
    id: 'jinhsi-spectro',
    name: 'Spectro-буря',
    members: ['jinhsi', 'phoebe', 'verina'],
    role: 'Jinhsi — Main DPS',
    synergy: 'Двойной Spectro-резонанс разгоняет ульты; Phoebe закрывает простой Jinhsi на зарядке.',
    length: 15,
    steps: [
      { t: 0.0, char: 'verina', skill: 'Intro Skill' },
      { t: 1.0, char: 'verina', skill: 'Resonance Liberation' },
      { t: 2.4, char: 'phoebe', skill: 'Intro Skill' },
      { t: 3.4, char: 'phoebe', skill: 'Resonance Skill', note: 'офф-филд урон на время зарядки' },
      { t: 4.6, char: 'phoebe', skill: 'Resonance Liberation' },
      { t: 6.0, char: 'jinhsi', skill: 'Intro Skill' },
      { t: 7.0, char: 'jinhsi', skill: 'Resonance Skill', note: 'копим заряды меча' },
      { t: 8.6, char: 'jinhsi', skill: 'Charged Attack' },
      { t: 10.2, char: 'jinhsi', skill: 'Resonance Liberation', note: 'буря по площади' },
      { t: 12.0, char: 'jinhsi', skill: 'Basic Attack x2' },
    ],
  },
  {
    id: 'encore-starter',
    name: 'Стартовый состав',
    members: ['encore', 'yinlin', 'verina'],
    role: 'Encore — Main DPS',
    synergy: 'Честно работает до первого 5★ DPS: хватает на Башню до 30 этажа.',
    length: 12,
    steps: [
      { t: 0.0, char: 'verina', skill: 'Intro Skill' },
      { t: 1.2, char: 'verina', skill: 'Resonance Liberation' },
      { t: 2.6, char: 'yinlin', skill: 'Resonance Skill' },
      { t: 3.8, char: 'yinlin', skill: 'Resonance Liberation', note: 'уходим' },
      { t: 5.2, char: 'encore', skill: 'Intro Skill' },
      { t: 6.4, char: 'encore', skill: 'Resonance Skill', note: 'режим овечки' },
      { t: 7.8, char: 'encore', skill: 'Basic Attack x3' },
      { t: 9.6, char: 'encore', skill: 'Resonance Liberation' },
    ],
  },
];