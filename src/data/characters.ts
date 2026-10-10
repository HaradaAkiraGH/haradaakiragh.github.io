// Мок-данные персонажей. Чтобы добавить нового персонажа —
// просто допиши ещё один объект в массив CHARACTERS. Код трогать не нужно.
import { Character } from './types';

export const CHARACTERS: Character[] = [
  {
    id: 'camellya', name: 'Camellya', title: 'Колючий цветок', rarity: 5, element: 'Havoc', weapon: 'Sword', role: 'Main DPS',
    metaRating: { tower: 'S', realm: 'S' },
    strengths: ['Огромный урон в ближнем бою', 'Высокая мобильность', 'Мощный резонансный взрыв'],
    weaknesses: ['Требует точного позиционирования', 'Сильно зависит от качества эхо'],
    echoSets: [
      { name: 'Глубинный меркатор', cost4: 'Кошмар: Бесформенный ужас', distribution: '4-3-3-1-1', mainStats: ['Havoc DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
      { name: 'Лунные облака', cost4: 'Кошмар: Корона бесконечности', distribution: '4-3-3-1-1', mainStats: ['Havoc DMG', 'Crit Rate', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'Energy Regen'], priority: 2 },
    ],
    weapons: [
      { name: 'Багровый цветок', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Пожиратель света', type: 'Alternative', rating: 87, source: 'Стандартный баннер' },
      { name: 'Клинок ночи', type: 'Alternative', rating: 78, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s', note: 'Вход с усиленным ударом' },
      { step: 2, skill: 'Resonance Skill', timing: '0.5s' },
      { step: 3, skill: 'Basic Attack x3', timing: '1.5s', note: 'Копим метки цветка' },
      { step: 4, skill: 'Heavy Attack', timing: '2.5s' },
      { step: 5, skill: 'Resonance Liberation', timing: '3.5s', note: 'Тратить при полном заряде' },
    ],
    teams: [
      { members: ['camellya', 'yinlin', 'verina'], synergy: 'Yinlin даёт офф-филд урон и электро-резонанс, Verina лечит и баффает атаку.', role: 'Camellya — Main DPS' },
      { members: ['camellya', 'zhezhi', 'verina'], synergy: 'Zhezhi усиливает урон союзников своим intro-скиллом.', role: 'Camellya — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Хаоса', quantity: 46, location: 'Элиты Havoc (Хуанлон)' }, { name: 'Флуорит', quantity: 60, location: 'Шахты региона Хуанлон' }] },
      { type: 'Forte', items: [{ name: 'ПечатьCamellya', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  {
    id: 'phoebe', name: 'Phoebe', title: 'Звёздная проводница', rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Sub DPS',
    metaRating: { tower: 'A', realm: 'S' },
    strengths: ['Отличный офф-филд урон', 'Быстрая ротация', 'Универсальна в любых командах'],
    weaknesses: ['Средний урон в соло', 'Зависит от смены персонажей'],
    echoSets: [
      { name: 'Небесный свет', cost4: 'Фантом: Страж света', distribution: '4-3-3-1-1', mainStats: ['Spectro DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'Energy Regen'], priority: 1 },
    ],
    weapons: [
      { name: 'Астральный маяк', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Абсолютный пульс', type: 'Alternative', rating: 80, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Resonance Skill', timing: '0.0s' },
      { step: 2, skill: 'Basic Attack x5', timing: '2.0s' },
      { step: 3, skill: 'Resonance Liberation', timing: '4.0s', note: 'Сразу уходить на другого персонажа' },
    ],
    teams: [
      { members: ['phoebe', 'jinhsi', 'verina'], synergy: 'Двойной Spectro-резонанс ускоряет зарядку энергии обоих.', role: 'Phoebe — Sub DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Спектро', quantity: 46, location: 'Элиты Spectro' }] },
    ],
  },
  {
    id: 'jinhsi', name: 'Jinhsi', title: 'Магистральный судья', rarity: 5, element: 'Spectro', weapon: 'Broadblade', role: 'Main DPS',
    metaRating: { tower: 'S', realm: 'A' },
    strengths: ['Массивный burst-урон', 'Хороший AoE', 'Красивая анимация ульты'],
    weaknesses: ['Долгие анимации', 'Высокая энергоёмкость'],
    echoSets: [
      { name: 'Небесный свет', cost4: 'Фантом: Страж света', distribution: '4-3-3-1-1', mainStats: ['Spectro DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Пожинатель веков', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Широкий клинок стража', type: 'Alternative', rating: 76, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.5s', note: 'Копим заряды меча' },
      { step: 3, skill: 'Charged Attack', timing: '2.0s' },
      { step: 4, skill: 'Resonance Liberation', timing: '4.0s' },
    ],
    teams: [
      { members: ['jinhsi', 'yinlin', 'verina'], synergy: 'Yinlin закрывает простой Jinhsi во время зарядки.', role: 'Jinhsi — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Спектро', quantity: 46, location: 'Элиты Spectro' }] },
    ],
  },
  {
    id: 'changli', name: 'Changli', title: 'Советник', rarity: 5, element: 'Fusion', weapon: 'Sword', role: 'Main DPS',
    metaRating: { tower: 'S', realm: 'S' },
    strengths: ['Высокий постоянный DPS', 'Отличная мобильность', 'Сильный burst'],
    weaknesses: ['Сложная ротация', 'Требует практики таймингов'],
    echoSets: [
      { name: 'Расплавленный разлом', cost4: 'Кошмар: Пламенный страж', distribution: '4-3-3-1-1', mainStats: ['Fusion DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Пламя вечности', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Клинок феникса', type: 'Alternative', rating: 82, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.5s' },
      { step: 3, skill: 'Basic Attack x3', timing: '1.5s' },
      { step: 4, skill: 'Heavy Attack', timing: '2.5s', note: 'Активирует перо феникса' },
      { step: 5, skill: 'Resonance Liberation', timing: '3.5s' },
    ],
    teams: [
      { members: ['changli', 'yinlin', 'verina'], synergy: 'Классическая мета-команда: Fusion + Electro резонанс.', role: 'Changli — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Фьюжн', quantity: 46, location: 'Элиты Fusion' }] },
    ],
  },
  {
    id: 'yinlin', name: 'Yinlin', title: 'Магистральный инспектор', rarity: 5, element: 'Electro', weapon: 'Rectifier', role: 'Sub DPS',
    metaRating: { tower: 'S', realm: 'A' },
    strengths: ['Лучший офф-филд саб-DPS', 'Постоянное электро-приложение', 'Бафф урона через outro-скилл'],
    weaknesses: ['Средний урон на поле', 'Зависит от кулдаунов'],
    echoSets: [
      { name: 'Гром пустоты', cost4: 'Фантом: Громовержец', distribution: '4-3-3-1-1', mainStats: ['Electro DMG', 'Energy Regen', 'ATK%'], subStats: ['Energy Regen', 'ATK%', 'Crit Rate'], priority: 1 },
    ],
    weapons: [
      { name: 'Повелитель струн', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Абсолютный пульс', type: 'Alternative', rating: 79, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Resonance Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Liberation', timing: '1.0s' },
      { step: 3, skill: 'Switch Out', timing: '2.0s', note: 'Оставляет молнии на поле' },
    ],
    teams: [
      { members: ['camellya', 'yinlin', 'verina'], synergy: 'Универсальный саб-DPS под любого основного DPS.', role: 'Yinlin — Sub DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Электро', quantity: 46, location: 'Элиты Electro' }] },
    ],
  },
  {
    id: 'encore', name: 'Encore', title: 'Дитя эха', rarity: 5, element: 'Fusion', weapon: 'Rectifier', role: 'Main DPS',
    metaRating: { tower: 'A', realm: 'A' },
    strengths: ['Даётся в начале игры', 'Простая ротация', 'Хороший AoE'],
    weaknesses: ['Уступает топовым 5★', 'Ограниченный потенциал'],
    echoSets: [
      { name: 'Расплавленный разлом', cost4: 'Кошмар: Пламенный страж', distribution: '4-3-3-1-1', mainStats: ['Fusion DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Звёздная симфония', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Абсолютный пульс', type: 'Alternative', rating: 75, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Resonance Skill', timing: '0.0s' },
      { step: 2, skill: 'Basic Attack', timing: '1.0s' },
      { step: 3, skill: 'Resonance Liberation', timing: '3.0s', note: 'Режим овечки усиливает атаки' },
    ],
    teams: [
      { members: ['encore', 'yinlin', 'verina'], synergy: 'Стартовая команда новичка.', role: 'Encore — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Фьюжн', quantity: 46, location: 'Элиты Fusion' }] },
    ],
  },
  {
    id: 'verina', name: 'Verina', title: 'Ботаник', rarity: 5, element: 'Spectro', weapon: 'Rectifier', role: 'Healer',
    metaRating: { tower: 'S', realm: 'S' },
    strengths: ['Лучший хилер игры', 'Бафф атаки всей команде', 'Подходит в любой состав'],
    weaknesses: ['Почти не наносит урон', 'Только роль поддержки'],
    echoSets: [
      { name: 'Целебное сияние', cost4: 'Фантом: Целительница', distribution: '4-3-3-1-1', mainStats: ['Healing Bonus', 'HP%', 'Energy Regen'], subStats: ['Energy Regen', 'HP%', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Угасающий сдвиг', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Астральный маяк', type: 'Alternative', rating: 84, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Resonance Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Liberation', timing: '1.0s', note: 'Ставит лечащее поле' },
      { step: 3, skill: 'Switch Out', timing: '2.0s' },
    ],
    teams: [
      { members: ['camellya', 'yinlin', 'verina'], synergy: 'Обязательный слот поддержки в 90% команд.', role: 'Verina — Healer' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Спектро', quantity: 46, location: 'Элиты Spectro' }] },
    ],
  },
  {
    id: 'calcharo', name: 'Calcharo', title: 'Генеральный директор', rarity: 5, element: 'Electro', weapon: 'Broadblade', role: 'Main DPS',
    metaRating: { tower: 'A', realm: 'A' },
    strengths: ['Высокий burst-урон', 'Хороший AoE', 'Стильные контратаки'],
    weaknesses: ['Сложная механика парирования', 'Требует точности'],
    echoSets: [
      { name: 'Гром пустоты', cost4: 'Фантом: Громовержец', distribution: '4-3-3-1-1', mainStats: ['Electro DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Падение истины', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Широкий клинок стража', type: 'Alternative', rating: 74, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.5s' },
      { step: 3, skill: 'Basic Attack x5', timing: '2.0s' },
      { step: 4, skill: 'Resonance Liberation', timing: '4.0s', note: 'Призывает фантомных клинков' },
    ],
    teams: [
      { members: ['calcharo', 'yinlin', 'verina'], synergy: 'Полная электро-команда с резонансом элемента.', role: 'Calcharo — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Электро', quantity: 46, location: 'Элиты Electro' }] },
    ],
  },
  {
    id: 'jiyan', name: 'Jiyan', title: 'Генерал', rarity: 5, element: 'Aero', weapon: 'Broadblade', role: 'Main DPS',
    metaRating: { tower: 'S', realm: 'A' },
    strengths: ['Отличный AoE', 'Высокая мобильность', 'Сильный burst в режиме дракона'],
    weaknesses: ['Слабее против одиночных целей', 'Энергоёмкий'],
    echoSets: [
      { name: 'Горный ветер', cost4: 'Фантом: Генерал ветра', distribution: '4-3-3-1-1', mainStats: ['Aero DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Зелёная вершина', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Клинок ночи', type: 'Alternative', rating: 77, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.5s', note: 'Копим заряды ветра' },
      { step: 3, skill: 'Basic Attack x3', timing: '1.5s' },
      { step: 4, skill: 'Resonance Liberation', timing: '3.0s', note: 'Режим дракона' },
    ],
    teams: [
      { members: ['jiyan', 'yinlin', 'verina'], synergy: 'Aero + Electro резонанс усиливает урон.', role: 'Jiyan — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Аэро', quantity: 46, location: 'Элиты Aero' }] },
    ],
  },
  {
    id: 'zhezhi', name: 'Zhezhi', title: 'Художница', rarity: 5, element: 'Glacio', weapon: 'Rectifier', role: 'Sub DPS',
    metaRating: { tower: 'A', realm: 'A' },
    strengths: ['Усиливает урон союзника через outro', 'Glacio-приложение', 'Комфортная ротация'],
    weaknesses: ['Нишевая роль', 'Средний личный урон'],
    echoSets: [
      { name: 'Морозная решимость', cost4: 'Фантом: Ледяная кисть', distribution: '4-3-3-1-1', mainStats: ['Glacio DMG', 'Energy Regen', 'ATK%'], subStats: ['Energy Regen', 'ATK%', 'Crit Rate'], priority: 1 },
    ],
    weapons: [
      { name: 'Побеги инея', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Астральный маяк', type: 'Alternative', rating: 81, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Resonance Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Liberation', timing: '1.0s', note: 'Оставляет холст на поле' },
      { step: 3, skill: 'Switch Out', timing: '2.0s' },
    ],
    teams: [
      { members: ['camellya', 'zhezhi', 'verina'], synergy: 'Zhezhi баффает урон Camellya своим холстом.', role: 'Zhezhi — Sub DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Glacio', quantity: 46, location: 'Элиты Glacio' }] },
    ],
  },
];

export const getCharacterById = (id: string) => CHARACTERS.find((c) => c.id === id);