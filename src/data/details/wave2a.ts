// Волна 2A: глубокие данные для 8 персонажей endgame-меты.
import type { Character } from '../types';

export const WAVE2A: Record<string, Partial<Character>> = {
  cartethyia: {
    title: 'Странствующая рыцарка', metaRating: { tower: 'S', realm: 'S' },
    strengths: ['Один из сильнейших Aero-DPS', 'Огромное окно урона после разгона', 'Комфортная ротация без жёстких таймингов'],
    weaknesses: ['Требует двух саппортов для раскрытия', 'Долгий разгон перед первым пиком', 'Слабее против рассредоточенных пачек'],
    echoSets: [
      { name: 'Горный ветер', cost4: 'Кошмар: Генерал ветра', distribution: '4-3-3-1-1', mainStats: ['Aero DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
      { name: 'Лунные облака', cost4: 'Кошмар: Корона бесконечности', distribution: '4-3-3-1-1', mainStats: ['Aero DMG', 'Crit Rate', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'Energy Regen'], priority: 2 },
    ],
    weapons: [
      { name: 'Рассветный клинок странницы', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Зелёная вершина', type: 'Alternative', rating: 88, source: 'Стандартный баннер' },
      { name: 'Клинок ночи', type: 'Alternative', rating: 76, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s', note: 'вход под баффы саппортов' },
      { step: 2, skill: 'Resonance Skill', timing: '0.6s' },
      { step: 3, skill: 'Basic Attack x4', timing: '2.2s', note: 'копим заряды клинка' },
      { step: 4, skill: 'Heavy Attack', timing: '3.6s' },
      { step: 5, skill: 'Resonance Liberation', timing: '4.8s', note: 'пик урона, не прерывать анимацию' },
    ],
    teams: [
      { members: ['cartethyia', 'roccia', 'verina'], synergy: 'Roccia держит офф-филд Aero, Verina даёт ATK-бафф — Cartethyia собирает пик.', role: 'Cartethyia — Main DPS' },
      { members: ['cartethyia', 'yinlin', 'verina'], synergy: 'Электро-резонанс энергии ускоряет ульту каждый цикл.', role: 'Cartethyia — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Аэро', quantity: 46, location: 'Элиты Aero' }, { name: 'Перо рассветного грифа', quantity: 60, location: 'Рината, скальные плато' }] },
      { type: 'Forte', items: [{ name: 'Печать рыцарства', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  lupa: {
    title: 'Вожак стаи', metaRating: { tower: 'S', realm: 'A' },
    strengths: ['Мощный Fusion-burst по площади', 'Усиливает себя стаками «ярости»', 'Хорошо чувствует себя в двойном DPS'],
    weaknesses: ['Требует постоянного пребывания на поле', 'Энергоёмкая ультимейт-фаза', 'Без хилера быстро проседает по HP'],
    echoSets: [
      { name: 'Расплавленный разлом', cost4: 'Кошмар: Пламенный страж', distribution: '4-3-3-1-1', mainStats: ['Fusion DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Клык пламенного вожака', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Пламя вечности', type: 'Alternative', rating: 86, source: 'Стандартный баннер' },
      { name: 'Широкий клинок стража', type: 'Alternative', rating: 74, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.8s', note: 'ставим стаки ярости' },
      { step: 3, skill: 'Basic Attack x3', timing: '2.0s' },
      { step: 4, skill: 'Heavy Attack', timing: '3.2s', note: 'взрыв стаков' },
      { step: 5, skill: 'Resonance Liberation', timing: '4.4s' },
    ],
    teams: [
      { members: ['lupa', 'yinlin', 'verina'], synergy: 'Классическая тройка: офф-филд Electro + хил + Fusion-пик Lupa.', role: 'Lupa — Main DPS' },
      { members: ['lupa', 'brant', 'verina'], synergy: 'Brant баффает Fusion-урон и даёт резонанс элемента.', role: 'Lupa — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Фьюжн', quantity: 46, location: 'Элиты Fusion' }, { name: 'Закалённый клык', quantity: 60, location: 'Хуанлон, вулканические пустоши' }] },
      { type: 'Forte', items: [{ name: 'Печать стаи', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  phrolova: {
    title: 'Танцовщица лепестков', metaRating: { tower: 'S', realm: 'A' },
    strengths: ['Высокий Havoc-DPS с быстрыми циклами', 'Сильные контратаки на уклонениях', 'Хорошо масштабируется от критов'],
    weaknesses: ['Ближний бой: требует позиционирования', 'Зависит от качества саб-статов', 'Сложнее раскрыть без Havoc-резонанса'],
    echoSets: [
      { name: 'Глубинный меркатор', cost4: 'Кошмар: Бесформенный ужас', distribution: '4-3-3-1-1', mainStats: ['Havoc DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Коса увядших лепестков', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Багровый цветок', type: 'Alternative', rating: 87, source: 'Ивентовый баннер' },
      { name: 'Пожиратель света', type: 'Alternative', rating: 78, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.5s' },
      { step: 3, skill: 'Dodge Counter x2', timing: '1.8s', note: 'контратаки дают метки' },
      { step: 4, skill: 'Basic Attack x3', timing: '3.0s' },
      { step: 5, skill: 'Resonance Liberation', timing: '4.2s' },
    ],
    teams: [
      { members: ['phrolova', 'cantarella', 'verina'], synergy: 'Cantarella усиливает Havoc-урон через outro, двойной резонанс элемента.', role: 'Phrolova — Main DPS' },
      { members: ['phrolova', 'yinlin', 'verina'], synergy: 'Yinlin закрывает простой между циклами офф-филд уроном.', role: 'Phrolova — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Хаоса', quantity: 46, location: 'Элиты Havoc' }, { name: 'Увядший лепесток', quantity: 60, location: 'Рината, цветочные поля' }] },
      { type: 'Forte', items: [{ name: 'Печать танца', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  cantarella: {
    title: 'Голос кукол', metaRating: { tower: 'A', realm: 'S' },
    strengths: ['Усиливает Havoc-урон союзника через outro', 'Стабильное офф-филд применение', 'Быстрая и дешёвая по энергии ротация'],
    weaknesses: ['Личный урон средний', 'Раскрывается только в Havoc-командах', 'Требует тайминга выхода под пик DPS'],
    echoSets: [
      { name: 'Глубинный меркатор', cost4: 'Кошмар: Бесформенный ужас', distribution: '4-3-3-1-1', mainStats: ['Havoc DMG', 'Energy Regen', 'ATK%'], subStats: ['Energy Regen', 'ATK%', 'Crit Rate'], priority: 1 },
      { name: 'Лунные облака', cost4: 'Кошмар: Корона бесконечности', distribution: '4-3-3-1-1', mainStats: ['Havoc DMG', 'Energy Regen', 'ATK%'], subStats: ['Energy Regen', 'ATK%', 'Crit Rate'], priority: 2 },
    ],
    weapons: [
      { name: 'Яд тысячи голосов', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Астральный маяк', type: 'Alternative', rating: 82, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.6s' },
      { step: 3, skill: 'Resonance Liberation', timing: '1.6s' },
      { step: 4, skill: 'Switch Out', timing: '2.6s', note: 'уходим, оставляя усиление Havoc' },
    ],
    teams: [
      { members: ['phrolova', 'cantarella', 'verina'], synergy: 'Идеальная Havoc-связка: бафф + резонанс + хил.', role: 'Cantarella — Sub DPS' },
      { members: ['camellya', 'cantarella', 'verina'], synergy: 'Camellya получает усиление Havoc в своё окно урона.', role: 'Cantarella — Sub DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Хаоса', quantity: 46, location: 'Элиты Havoc' }, { name: 'Кукольная нить', quantity: 60, location: 'Рината, театральный квартал' }] },
      { type: 'Forte', items: [{ name: 'Печать голоса', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  roccia: {
    title: 'Кулачная поэтесса', metaRating: { tower: 'A', realm: 'A' },
    strengths: ['Офф-филд Aero-урон без пребывания на поле', 'Даёт команде ускорение энергии', 'Универсальна под любого Aero-DPS'],
    weaknesses: ['Низкий личный пик', 'Зависит от частой смены персонажей', 'Сетапы против одиночных целей слабее'],
    echoSets: [
      { name: 'Горный ветер', cost4: 'Фантом: Генерал ветра', distribution: '4-3-3-1-1', mainStats: ['Aero DMG', 'Energy Regen', 'ATK%'], subStats: ['Energy Regen', 'ATK%', 'Crit Rate'], priority: 1 },
    ],
    weapons: [
      { name: 'Кулаки странствующей музы', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Зелёная вершина', type: 'Alternative', rating: 80, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.7s' },
      { step: 3, skill: 'Resonance Liberation', timing: '1.7s' },
      { step: 4, skill: 'Switch Out', timing: '2.7s', note: 'вихрь остаётся на поле' },
    ],
    teams: [
      { members: ['cartethyia', 'roccia', 'verina'], synergy: 'Aero-резонанс + офф-филд вихрь под пик Cartethyia.', role: 'Roccia — Sub DPS' },
      { members: ['jiyan', 'roccia', 'verina'], synergy: 'Двойной Aero: Jiyan зачищает пачки, Roccia добирает одиночек.', role: 'Roccia — Sub DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Аэро', quantity: 46, location: 'Элиты Aero' }, { name: 'Страница ветров', quantity: 60, location: 'Рината, библиотечные руины' }] },
      { type: 'Forte', items: [{ name: 'Печать музы', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  carlotta: {
    title: 'Ледяная снайперша', metaRating: { tower: 'A', realm: 'A' },
    strengths: ['Дальний бой: безопасные позиции', 'Сильный крит-потолок Glacio', 'Хорошая мобильность между выстрелами'],
    weaknesses: ['Требует прицеливания и ритма', 'Слабее в ближних схватках', 'Зависит от сигнатурного оружия'],
    echoSets: [
      { name: 'Морозная решимость', cost4: 'Фантом: Ледяная кисть', distribution: '4-3-3-1-1', mainStats: ['Glacio DMG', 'Crit Rate / Crit DMG', 'ATK%'], subStats: ['Crit Rate', 'Crit DMG', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Пистолет вечной мерзлоты', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Ледяная игла', type: 'Alternative', rating: 82, source: 'Стандартный баннер' },
      { name: 'Абсолютный пульс', type: 'Alternative', rating: 74, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.6s', note: 'метка прицела' },
      { step: 3, skill: 'Charged Shot x2', timing: '2.4s' },
      { step: 4, skill: 'Resonance Liberation', timing: '3.8s', note: 'залп по меткам' },
    ],
    teams: [
      { members: ['carlotta', 'zhezhi', 'verina'], synergy: 'Zhezhi баффает урон, Glacio-резонанс усиливает оба пика.', role: 'Carlotta — Main DPS' },
      { members: ['carlotta', 'yinlin', 'verina'], synergy: 'Yinlin держит урон, пока Carlotta перезаряжается.', role: 'Carlotta — Main DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Glacio', quantity: 46, location: 'Элиты Glacio' }, { name: 'Мерзлотный патрон', quantity: 60, location: 'Рината, ледяные шахты' }] },
      { type: 'Forte', items: [{ name: 'Печать прицела', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  shorekeeper: {
    title: 'Хранительница берега', metaRating: { tower: 'S', realm: 'S' },
    strengths: ['Топ-хилер с командным баффом критов', 'Лечащее поле работает офф-филд', 'Встраивается в любой состав'],
    weaknesses: ['Почти нулевой личный урон', 'Занимает слот, который мог бы дать урон', 'Бафф раскрывается только в длинных боях'],
    echoSets: [
      { name: 'Целебное сияние', cost4: 'Фантом: Целительница', distribution: '4-3-3-1-1', mainStats: ['Healing Bonus', 'HP%', 'Energy Regen'], subStats: ['Energy Regen', 'HP%', 'ATK%'], priority: 1 },
    ],
    weapons: [
      { name: 'Хранитель прилива', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Угасающий сдвиг', type: 'Alternative', rating: 88, source: 'Ивентовый баннер' },
      { name: 'Астральный маяк', type: 'Alternative', rating: 84, source: 'Стандартный баннер' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.7s' },
      { step: 3, skill: 'Resonance Liberation', timing: '1.7s', note: 'поле лечения + бафф критов' },
      { step: 4, skill: 'Switch Out', timing: '2.7s' },
    ],
    teams: [
      { members: ['cartethyia', 'yinlin', 'shorekeeper'], synergy: 'Замена Verina в эндгейме: больше крит-бафф, тот же хил.', role: 'Shorekeeper — Healer' },
      { members: ['phrolova', 'cantarella', 'shorekeeper'], synergy: 'Держит команду живой в длинных Havoc-ротациях.', role: 'Shorekeeper — Healer' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Спектро', quantity: 46, location: 'Элиты Spectro' }, { name: 'Жемчужина прилива', quantity: 60, location: 'Рината, побережье' }] },
      { type: 'Forte', items: [{ name: 'Печать берега', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
  'xiangli-yao': {
    title: 'Грозовой инженер', metaRating: { tower: 'A', realm: 'A' },
    strengths: ['Офф-филд Electro-турель без затрат поля', 'Стабильная энергия команды', 'Лёгкая ротация: поставил и ушёл'],
    weaknesses: ['Турель уязвима к мобильным боссам', 'Средний личный урон', 'Требует Electro-резонанс для полного раскрытия'],
    echoSets: [
      { name: 'Гром пустоты', cost4: 'Фантом: Громовержец', distribution: '4-3-3-1-1', mainStats: ['Electro DMG', 'Energy Regen', 'ATK%'], subStats: ['Energy Regen', 'ATK%', 'Crit Rate'], priority: 1 },
    ],
    weapons: [
      { name: 'Перчатки грозового шага', type: 'Signature', rating: 100, source: 'Ивентовый баннер' },
      { name: 'Повелитель струн', type: 'Alternative', rating: 84, source: 'Ивентовый баннер' },
      { name: 'Абсолютный пульс', type: 'Alternative', rating: 76, source: 'Крафт у кузнеца' },
    ],
    rotation: [
      { step: 1, skill: 'Intro Skill', timing: '0.0s' },
      { step: 2, skill: 'Resonance Skill', timing: '0.6s', note: 'установка турели' },
      { step: 3, skill: 'Resonance Liberation', timing: '1.8s' },
      { step: 4, skill: 'Switch Out', timing: '2.8s', note: 'турель стреляет сама' },
    ],
    teams: [
      { members: ['calcharo', 'xiangli-yao', 'verina'], synergy: 'Полный Electro-резонанс, турель добирает урон в простой Calcharo.', role: 'Xiangli Yao — Sub DPS' },
      { members: ['yinlin', 'xiangli-yao', 'verina'], synergy: 'Двойной электро-офф-филд под любого DPS.', role: 'Xiangli Yao — Sub DPS' },
    ],
    materials: [
      { type: 'Ascension', items: [{ name: 'Ядро Электро', quantity: 46, location: 'Элиты Electro' }, { name: 'Грозовой конденсатор', quantity: 60, location: 'Хуанлон, инженерный двор' }] },
      { type: 'Forte', items: [{ name: 'Печать механизма', quantity: 8, location: 'Еженедельный босс' }] },
    ],
  },
};