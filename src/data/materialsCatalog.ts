// Полный каталог из 163 материалов Wuthering Waves (по базе wuwatracker.com/ru/items, патч 3.7):
// 26 боссов вознесения + 12 еженедельных боссов + 35 диковинок и руды +
// 28 материалов оружия/Форте (7 серий × 4 тира) + 40 ядер/колец/масок врагов (10 серий × 4 тира) +
// 22 предмета опыта, тюнеров и валюты = 163 материала.
import type { BestiaryEntry } from '../utils/api';

export interface BuiltinMaterial {
  id: number;
  category: 'Материалы';
  subcategory:
    | 'Вознесение (Боссы)'
    | 'Диковинки мира'
    | 'Еженедельные боссы'
    | 'Оружие и Форте'
    | 'Дроп с врагов'
    | 'Опыт и Валюта';
  name: string;
  rarity: 1 | 2 | 3 | 4 | 5;
  description: string;
  image: string;
  props: Record<string, string>;
  tags: string;
}

const matSvg = (bg1: string, bg2: string, accent: string, symbol: string, label = '') =>
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${bg1}" stop-opacity="0.98"/>
      <stop offset="68%" stop-color="${bg2}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#090a10" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <rect width="160" height="160" rx="22" fill="url(#g)"/>
  <circle cx="80" cy="76" r="52" fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="2" stroke-dasharray="10 6"/>
  <text x="80" y="92" font-size="56" text-anchor="middle" fill="#ffffff" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.85));">${symbol}</text>
  ${
    label
      ? `<text x="80" y="142" font-family="sans-serif" font-weight="800" font-size="15" text-anchor="middle" fill="${accent}" letter-spacing="1">${label}</text>`
      : ''
  }
</svg>`);

const RARITY_PALETTE: Record<number, [string, string, string]> = {
  5: ['#854d0e', '#271705', '#facc15'],
  4: ['#581c87', '#1e1035', '#c084fc'],
  3: ['#0369a1', '#0f172a', '#38bdf8'],
  2: ['#15803d', '#052e16', '#4ade80'],
  1: ['#374151', '#111827', '#9ca3af'],
};

const iconFor = (rarity: number, symbol: string, badge = '') => {
  const [b1, b2, acc] = RARITY_PALETTE[rarity] ?? RARITY_PALETTE[4];
  return matSvg(b1, b2, acc, symbol, badge);
};

/* 1. БОССЫ ВОЗНЕСЕНИЯ (26 шт.) */
const BOSS_DROPS: Array<[string, string, string, string]> = [
  ['Strife Tacet Core / Ядро Раздора', 'Crownless (Хуанлон)', 'Danjin, Taoqi, Rover (Havoc)', '❖'],
  ['Thundering Tacet Core / Громовое ядро Тасет', 'Thundering Mephis (Хуанлон)', 'Rover (Electro), Buling, Rebecca', '⚡'],
  ['Hidden Thunder Tacet Core / Ядро Скрытого Грома', 'Tempest Mephis (Хуанлон)', 'Calcharo, Augusta, Suoming', '⚡'],
  ['Elegy Tacet Core / Элегическое ядро Тасет', 'Mourning Aix (Хуанлон)', 'Jinhsi, Verina, Rover (Spectro)', '☀️'],
  ['Rage Tacet Core / Яростное ядро Тасет', 'Inferno Rider (Пылающее Море)', 'Changli, Encore, Chixia, Mortefi', '🔥'],
  ['Roaring Rock Fist / Ревущий каменный кулак', 'Feilian Beringal (Лес Дим)', 'Jiyan, Jianxin, Yangyang, Aalto', '🌪️'],
  ['Sound-Keeping Tacet Core / Хранящее звук ядро', 'Lampylumen Myriad (Тигровая Пасть)', 'Zhezhi, Lingyang, Sanhua, Baizhi, Youhu', '❄️'],
  ['Group Abomination Tacet Core / Ядро Мерзости', 'Mech Abomination (Суд Цзиньчжоу)', 'Yinlin, Xiangli Yao, Yuanwu, Lumi', '⚙️'],
  ['Gold-Dissolving Feather / Растворяющее золото перо', 'Impermanence Heron (Хуанлон)', 'Cantarella, Chisa', '🪶'],
  ['Topological Confinement / Топологическое удержание', 'Fallacy of No Return (Чёрные Берега)', 'Camellya, The Shorekeeper', '💠'],
  ['Platinum Core / Платиновое ядро', 'Sentry Construct (Ринашита)', 'Carlotta, Hiyuki, Suisui', '❄️'],
  ['Cleansing Conch / Очищающая раковина', 'Lorelei (Ринашита)', 'Phoebe, Roccia, Zani', '🐚'],
  ['Blazing Bone / Пылающая кость дракона', 'Dragon of Dirge (Ринашита)', 'Brant, Lupa, Galbrena', '🔥'],
  ['Unfading Glory / Неувядающая слава', 'Lioness of Glory (Септимонт)', 'Cartethyia, Ciaccona, Iuno', '🦁'],
  ['Requiem Baton / Жезл Реквиема', 'Fractsidus Maestro (Ринашита)', 'Phrolova, Hsin, Lucilla', '🎼'],
  ['Mysterious Code / Таинственный код', 'Архивы Стражей Соларис-3', 'Rover (Spectro / Havoc / Aero / Electro)', '📜'],
  ['Solaris Astral Prism / Астральная призма', 'Астральный Конструкт 3.x', 'Aemeath, Mornye, Luuk Herssen', '✨'],
  ['Abyssal Husk Core / Ядро Бездны', 'Пожиратель Разлома 3.x', 'Yangyang Xuanling, Denia', '🌑'],
  ['Chrono Spindle / Хроно-веретено', 'Хранитель Времени (Гора Фирмамент)', 'Lily, Lucy, Lynae', '⏳'],
  ['Glacial Heart Core / Сердце Вечной Мерзлоты', 'Ледяной Колосс 3.x', 'Hiyuki, Suisui', '🧊'],
  ['Frostbite Crest / Гребень Хлада', 'Северный Змей', 'Carlotta, Sanhua', '❄️'],
  ['Sovereign’s Sigil / Печать Владыки', 'Владыка Руин Септимонта', 'Jingran, Augusta', '👑'],
  ['Starfall Core / Ядро Звездопада', 'Астральный Голем', 'Sigrika, Qingxiao', '🌠'],
  ['Aetherial Remnant / Эфирный остаток', 'Фантом Прилива', 'Qiuyuan, Rover (Aero)', '💨'],
  ['Voidwalker Core / Ядро Пустоты', 'Тень Разлома', 'Phrolova, Cantarella', '🔮'],
  ['Tempestuous Crest / Буревестник Тасет', 'Грозовой Грифон', 'Suoming, Yinlin', '⚡'],
];

/* 2. ЕЖЕНЕДЕЛЬНЫЕ БОССЫ (12 шт.) */
const WEEKLY_DROPS: Array<[string, string, string]> = [
  ['Monument Bell / Колокол Монумента', 'Bell-Borne Geochelone (Ущелье духов)', 'Jiyan, Verina, Calcharo, Jianxin, Baizhi'],
  ['Unending Destruction / Бесконечное разрушение', 'Scar (Еженедельное испытание)', 'Yinlin, Encore, Lingyang, Sanhua, Yangyang'],
  ['Dreamless Feather / Перо Бессонной', 'Dreamless (Статуя Венца)', 'Camellya, Danjin, Rover (Havoc), Taoqi'],
  ['Sentinel’s Dagger / Кинжал Стража Юэ', 'Sentinel Jué (Гора Фирмамент)', 'Jinhsi, Changli, Zhezhi, Xiangli Yao, The Shorekeeper'],
  ['The Netherworld’s Stare / Взгляд Преисподней', 'Hecate (Ринашита)', 'Carlotta, Roccia, Phoebe, Brant, Zani, Cantarella'],
  ['When Irises Bloom / Когда расцветают ирисы', 'Fleurdelys (Септимонт)', 'Cartethyia, Ciaccona, Lupa, Phrolova'],
  ['Crown of the Eclipse / Корона Затмения', 'Eclipse Sovereign (Патч 3.x)', 'Aemeath, Augusta, Hiyuki, Jingran'],
  ['Seraphic Feather / Серафическое перо', 'Небесный Архонт (Патч 3.x)', 'Qingxiao, Qiuyuan, Sigrika'],
  ['Leviathan’s Scale / Чешуя Левиафана', 'Глубинный Левиафан Ринашиты', 'Mornye, Luuk Herssen, Suisui'],
  ['Eternal Hourglass / Вечные песочные часы', 'Хроно-Страж 3.x', 'Lily, Lucy, Lynae'],
  ['Calamity Heart / Сердце Бедствия', 'Апостол Фрацидуса 3.x', 'Hsin, Lucilla, Yangyang Xuanling'],
  ['Astral Cleaver / Астральный клинок', 'Рыцарь Разлома 3.x', 'Suoming, Galbrena, Denia'],
];

/* 3. ДИКОВИНКИ МИРА И РУДА (35 шт.) */
const WORLD_SPECIALTIES: Array<[string, string, string, string]> = [
  ['Pecok Flower / Цветок Пекок', 'Хуанлон (Цзиньчжоу)', 'Jiyan, Rover, Encore', '🌺'],
  ['Belle Poppy / Мак Белле', 'Хуанлон (Порт Гуйсюй)', 'Verina, Danjin, Chixia', '🌸'],
  ['Iris / Ирис Хуанлуна', 'Хуанлон (Топь Экс)', 'Calcharo, Taoqi', '🪻'],
  ['Terraspawn Fungus / Земнородный гриб', 'Хуанлон (Нагорье Десорок)', 'Xiangli Yao, Yuanwu, Youhu, Lumi', '🍄'],
  ['Lanternberry / Ягода-фонарик', 'Хуанлон (Шахты Тигровой Пасти)', 'Jianxin, Zhezhi, Baizhi', '🍒'],
  ['Coriolus / Кориолус', 'Хуанлон (Гигантский баньян)', 'Yinlin, Lingyang, Mortefi', '🍄'],
  ['Wintry Bell / Зимний колокольчик', 'Хуанлон (Хребты колокола)', 'Sanhua, Yangyang, Aalto', '🔔'],
  ['Violet Coral / Фиолетовый коралл', 'Хуанлон (Побережье залива)', 'Taoqi, Морские резонаторы', '🪸'],
  ['Loong’s Pearl / Жемчужина Дракона', 'Гора Фирмамент', 'Jinhsi', '🔮'],
  ['Pavo Plum / Павлинья слива', 'Гора Фирмамент', 'Changli', '🍑'],
  ['Nova / Нова', 'Чёрные Берега', 'Camellya, The Shorekeeper', '✨'],
  ['Sword Acorus / Мечевидный аир', 'Ринашита (Озёра Рагунны)', 'Carlotta, Ciaccona', '🌿'],
  ['Firecracker Jewelweed / Огненная недотрога', 'Ринашита', 'Roccia, Phoebe, Zani', '🏵️'],
  ['Golden Fleece / Золотое руно', 'Ринашита (Утёсы)', 'Brant, Lupa', '🌼'],
  ['Seaside Cendrelis / Прибрежный Цендрелис', 'Ринашита (Побережье)', 'Cantarella, Phrolova', '🪷'],
  ['Bamboo Iris / Бамбуковый ирис', 'Септимонт', 'Cartethyia, Qingxiao, Qiuyuan', '🎍'],
  ['Starlight Lotus / Звёздный лотос', 'Земли 3.x', 'Aemeath, Hiyuki, Augusta, Jingran', '🪷'],
  ['Noctemint / Ночная мята', 'Хуанлон (Повсеместно)', 'Крафт зелий и кулинария', '🌱'],
  ['Angelica / Дягиль', 'Хуанлон (Луга)', 'Синтез лекарств и блюд', '🌿'],
  ['Honeysuckle / Жимолость', 'Хуанлон (Холмы)', 'Кулинария и синтез баффов', '🌼'],
  ['Lemongrass / Лемонграсс', 'Хуанлон (Речные берега)', 'Кулинария и препараты', '🌾'],
  ['Perilla / Перилла', 'Хуанлон (Леса)', 'Синтез реагентов выживания', '🍃'],
  ['Waterlamp / Водяной фонарик', 'Хуанлон (Водоёмы)', 'Синтез и кулинария', '🌷'],
  ['Dewvetch / Росяная вика', 'Гора Фирмамент', 'Алхимия и синтез', '🌱'],
  ['Climbing Fig / Ползучий инжир', 'Ринашита', 'Кулинария Рагунны', '🍃'],
  ['Erodorchis / Эродорхидея', 'Руины Пылающего Моря', 'Синтез антидотов и баффов', '🥀'],
  ['Cliffside Rose / Скальная роза', 'Септимонт', 'Вознесение героев 3.x', '🌹'],
  ['Silver Lotus / Серебряный лотос', 'Озёра 3.x', 'Вознесение Mornye, Lily, Lucy', '🪷'],
  ['Frostbloom / Морозный первоцвет', 'Снежные пики 3.x', 'Вознесение Hiyuki, Suisui', '❄️'],
  ['Emberleaf / Пепельный лист', 'Вулканические плато 3.x', 'Вознесение Galbrena, Denia', '🍁'],
  ['Fluorite / Флуорит', 'Шахты Хуанлуна', 'Базовая руда ковки и синтеза', '💎'],
  ['Indigoite / Индигоит', 'Каньоны Хуанлуна', 'Ковка 4★ оружия у кузнеца', '🔷'],
  ['Lampylumen / Люминесцентная руда', 'Тигровая Пасть', 'Редкий кристалл для крафта оружия', '💠'],
  ['Scarletthorn / Алый шип (Руда)', 'Гора Фирмамент', 'Крафт оружия и синтез', '♦️'],
  ['Fool’s Gold / Золото глупцов', 'Ринашита (Каменоломни)', 'Крафт оружия Ринашиты', '🪙'],
];

/* 4. ОРУЖИЕ И ФОРТЕ (7 серий × 4 тира = 28 шт.) */
const FORGERY_SERIES: Array<{
  weapon: string;
  dungeon: string;
  items: [string, string, string, string];
}> = [
  {
    weapon: 'Sword (Меч)',
    dungeon: 'Forgery Challenge: Flaming Remnants',
    items: [
      'Inert Metallic Drip / Инертная капля металла',
      'Reactive Metallic Drip / Реактивная капля металла',
      'Polarized Metallic Drip / Поляризованная капля металла',
      'Heterized Metallic Drip / Гетерогенная капля металла',
    ],
  },
  {
    weapon: 'Broadblade (Тяжёлый меч)',
    dungeon: 'Forgery Challenge: Eroded Ruins',
    items: [
      'Waveworn Residue 210 / Волновой осадок 210',
      'Waveworn Residue 226 / Волновой осадок 226',
      'Waveworn Residue 235 / Волновой осадок 235',
      'Waveworn Residue 239 / Волновой осадок 239',
    ],
  },
  {
    weapon: 'Pistol (Пистолеты)',
    dungeon: 'Forgery Challenge: Marigold Woods',
    items: [
      'Impure Phlogiston / Нечистый флогистон',
      'Extracted Phlogiston / Очищенный флогистон',
      'Refined Phlogiston / Рафинированный флогистон',
      'Flawless Phlogiston / Безупречный флогистон',
    ],
  },
  {
    weapon: 'Gauntlets (Перчатки)',
    dungeon: 'Forgery Challenge: Moonlit Groves',
    items: [
      'Cadence Seed / Семя Каденции',
      'Cadence Bud / Бутон Каденции',
      'Cadence Leaf / Лист Каденции',
      'Cadence Blossom / Цветок Каденции',
    ],
  },
  {
    weapon: 'Rectifier (Резонатор)',
    dungeon: 'Forgery Challenge: Misty Forest',
    items: [
      'Lento Helix / Спираль Ленто',
      'Adagio Helix / Спираль Адажио',
      'Andante Helix / Спираль Анданте',
      'Presto Helix / Спираль Престо',
    ],
  },
  {
    weapon: 'Клинки и Косы 3.x',
    dungeon: 'Forgery Challenge: Abyssal Sanctum',
    items: [
      'Dormant Abyssal Tendril / Спящий побег Бездны',
      'Waking Abyssal Tendril / Пробуждённый побег Бездны',
      'Pulsing Abyssal Tendril / Пульсирующий побег Бездны',
      'Sovereign Abyssal Tendril / Высший побег Бездны',
    ],
  },
  {
    weapon: 'Резонаторы и Пистолеты 3.x',
    dungeon: 'Forgery Challenge: Astral Conservatory',
    items: [
      'Muted Astral Chord / Приглушённая струна',
      'Resonant Astral Chord / Резонирующая струна',
      'Harmonic Astral Chord / Гармоническая струна',
      'Celestial Astral Chord / Небесная струна',
    ],
  },
];

/* 5. ДРОП С ВРАГОВ (10 серий × 4 тира = 40 шт.) */
const ENEMY_SERIES: Array<{
  enemy: string;
  items: [string, string, string, string];
}> = [
  {
    enemy: 'Тасет-дискорды Шёпота (Whisperin)',
    items: [
      'LF Whisperin Core / Низкочастотное ядро Шёпота',
      'MF Whisperin Core / Среднечастотное ядро Шёпота',
      'HF Whisperin Core / Высокочастотное ядро Шёпота',
      'FF Whisperin Core / Полночастотное ядро Шёпота',
    ],
  },
  {
    enemy: 'Звериные Тасет-дискорды (Howler)',
    items: [
      'LF Howler Core / Низкочастотное ядро Воя',
      'MF Howler Core / Среднечастотное ядро Воя',
      'HF Howler Core / Высокочастотное ядро Воя',
      'FF Howler Core / Полночастотное ядро Воя',
    ],
  },
  {
    enemy: 'Лагеря Изгнанников (Exiles)',
    items: [
      'Crude Ring / Грубое кольцо Изгнанника',
      'Basic Ring / Обычное кольцо Изгнанника',
      'Improved Ring / Улучшенное кольцо Изгнанника',
      'Tailored Ring / Искусное кольцо Изгнанника',
    ],
  },
  {
    enemy: 'Организация Фрацидус (Fractsidus)',
    items: [
      'Mask of Constraint / Маска Принуждения',
      'Mask of Erosion / Маска Эрозии',
      'Mask of Distortion / Маска Искажения',
      'Mask of Insanity / Маска Безумия',
    ],
  },
  {
    enemy: 'Эхо-конструкты Ринашиты (Polygon)',
    items: [
      'LF Polygon Core / Низкочастотное полигональное ядро',
      'MF Polygon Core / Среднечастотное полигональное ядро',
      'HF Polygon Core / Высокочастотное полигональное ядро',
      'FF Polygon Core / Полночастотное полигональное ядро',
    ],
  },
  {
    enemy: 'Морские дискорды Ринашиты (Tidal)',
    items: [
      'LF Tidal Residuum / Низкочастотный приливной остаток',
      'MF Tidal Residuum / Среднечастотный приливной остаток',
      'HF Tidal Residuum / Высокочастотный приливной остаток',
      'FF Tidal Residuum / Полночастотный приливной остаток',
    ],
  },
  {
    enemy: 'Гладиаторы и звери Септимонта',
    items: [
      'Tarnished Septimont Crest / Потускневший герб Септимонта',
      'Burnished Septimont Crest / Очищенный герб Септимонта',
      'Gilded Septimont Crest / Позолоченный герб Септимонта',
      'Royal Septimont Crest / Королевский герб Септимонта',
    ],
  },
  {
    enemy: 'Автоматоны Руин (Mech)',
    items: [
      'Broken Mech Core / Сломанное ядро автоматона',
      'Standard Mech Core / Стандартное ядро автоматона',
      'Advanced Mech Core / Улучшенное ядро автоматона',
      'Overclocked Mech Core / Разогнанное ядро автоматона',
    ],
  },
  {
    enemy: 'Высшие культисты Фрацидуса 3.x',
    items: [
      'Initiate Fractsidus Sigil / Печать послушника',
      'Adept Fractsidus Sigil / Печать адепта',
      'Overseer Fractsidus Sigil / Печать надзирателя',
      'Archon Fractsidus Sigil / Печать архонта',
    ],
  },
  {
    enemy: 'Фантомы Пустоты 3.x',
    items: [
      'Faint Void Remnant / Слабый след Пустоты',
      'Condensed Void Remnant / Сгущённый след Пустоты',
      'Abyssal Void Remnant / Глубинный след Пустоты',
      'Eternal Void Remnant / Вечный след Пустоты',
    ],
  },
];

/* 6. ОПЫТ, ТЮНЕРЫ, ВАЛЮТА И РАСХОДНИКИ (22 шт.) */
const EXP_AND_CURRENCY: Array<[string, 1 | 2 | 3 | 4 | 5, string, string]> = [
  ['Basic Resonance Potion / Базовое зелье Резонанса', 2, 'Даёт 1 000 EXP персонажа.', '🧪'],
  ['Medium Resonance Potion / Среднее зелье Резонанса', 3, 'Даёт 3 000 EXP персонажа.', '🧪'],
  ['Advanced Resonance Potion / Улучшенное зелье Резонанса', 4, 'Даёт 8 000 EXP персонажа.', '🧪'],
  ['Premium Resonance Potion / Премиум-зелье Резонанса', 5, 'Даёт 20 000 EXP персонажа для прокачки до 90 ур.', '🧪'],
  ['Basic Energy Core / Базовое энергоядро оружия', 2, 'Даёт 1 000 EXP оружия.', '🔋'],
  ['Medium Energy Core / Среднее энергоядро оружия', 3, 'Даёт 3 000 EXP оружия.', '🔋'],
  ['Advanced Energy Core / Улучшенное энергоядро оружия', 4, 'Даёт 8 000 EXP оружия.', '🔋'],
  ['Premium Energy Core / Премиум энергоядро оружия', 5, 'Даёт 20 000 EXP оружия для прокачки до 90 ур.', '🔋'],
  ['Basic Sealed Tube / Базовая колба Эхо', 2, 'Даёт 500 EXP для прокачки Эхо.', '🧬'],
  ['Medium Sealed Tube / Средняя колба Эхо', 3, 'Даёт 1 000 EXP для прокачки Эхо.', '🧬'],
  ['Advanced Sealed Tube / Улучшенная колба Эхо', 4, 'Даёт 2 000 EXP для прокачки Эхо.', '🧬'],
  ['Premium Sealed Tube / Премиум запечатанная колба Эхо', 5, 'Даёт 5 000 EXP для прокачки 5★ Эхо до +25.', '🧬'],
  ['Medium Tuner / Средний тюнер Эхо', 3, 'Открывает сабстаты в 3★ Эхо.', '🎛️'],
  ['Advanced Tuner / Улучшенный тюнер Эхо', 4, 'Открывает сабстаты в 4★ Эхо.', '🎛️'],
  ['Premium Tuner / Премиум тюнер Эхо', 5, 'Открывает сабстаты в золотых 5★ Эхо (10 шт. за 1 слот).', '🎛️'],
  ['Shell Credit / Шелл-кредиты', 3, 'Основная валюта Соларис-3 для всех улучшений.', '🪙'],
  ['Astrite / Астрит', 5, 'Редкий кристалл для круток баннеров и пополнения энергии.', '✦'],
  ['Radiant Tide / Сияющий прилив', 5, 'Валюта призыва ивентового баннера резонаторов.', '🌟'],
  ['Forging Tide / Кузнечный прилив', 5, 'Валюта призыва ивентового баннера оружия.', '⚔️'],
  ['Lustrous Tide / Блестящий прилив', 4, 'Валюта призыва стандартных баннеров.', '🌊'],
  ['Crystal Solvent / Кристаллический растворитель', 4, 'Восстанавливает 60 ед. Волновых пластин (Waveplates).', '🔷'],
  ['Standard Weapon Mold / Заготовка кузнеца', 4, 'Форма с еженедельных боссов для крафта 4★ оружия.', '🔨'],
];

export const BUILTIN_MATERIALS: BuiltinMaterial[] = (() => {
  const list: BuiltinMaterial[] = [];
  let idCounter = 9001;

  // 1. Боссы вознесения (26)
  for (const [name, source, chars, sym] of BOSS_DROPS) {
    list.push({
      id: idCounter++,
      category: 'Материалы',
      subcategory: 'Вознесение (Боссы)',
      name,
      rarity: 4,
      description: `Материал вознесения резонаторов Соларис-3. Добывается за победу над мировым боссом (${source}).`,
      image: iconFor(4, sym, 'BOSS'),
      props: {
        Тип: 'Вознесение персонажа',
        Источник: source,
        Персонажи: chars,
      },
      tags: `босс, вознесение, ${name.toLowerCase()}, ${chars.toLowerCase()}`,
    });
  }

  // 2. Еженедельные боссы (12)
  for (const [name, source, chars] of WEEKLY_DROPS) {
    list.push({
      id: idCounter++,
      category: 'Материалы',
      subcategory: 'Еженедельные боссы',
      name,
      rarity: 4,
      description: `Трофей еженедельного испытания (${source}) для прокачки верхних узлов Форте и навыков 7–10 ур.`,
      image: iconFor(4, '👑', 'WEEKLY'),
      props: {
        Тип: 'Прокачка Форте (Еженедельный босс)',
        Источник: source,
        Персонажи: chars,
      },
      tags: `еженедельный босс, форте, ${name.toLowerCase()}, ${chars.toLowerCase()}`,
    });
  }

  // 3. Диковинки мира (35)
  for (const [name, region, chars, sym] of WORLD_SPECIALTIES) {
    list.push({
      id: idCounter++,
      category: 'Материалы',
      subcategory: 'Диковинки мира',
      name,
      rarity: 2,
      description: `Региональная диковинка (${region}), необходимая для вознесения резонаторов, алхимии и крафта.`,
      image: iconFor(2, sym, 'WORLD'),
      props: {
        Тип: 'Диковинка вознесения / Ресурс',
        Регион: region,
        Персонажи: chars,
      },
      tags: `цветок, диковинка, руда, ${name.toLowerCase()}, ${chars.toLowerCase()}`,
    });
  }

  // 4. Оружие и Форте (28)
  const rarities: Array<2 | 3 | 4 | 5> = [2, 3, 4, 5];
  const tierLabels = ['T1', 'T2', 'T3', 'T4'];
  for (const series of FORGERY_SERIES) {
    series.items.forEach((itemName, idx) => {
      const r = rarities[idx];
      list.push({
        id: idCounter++,
        category: 'Материалы',
        subcategory: 'Оружие и Форте',
        name: itemName,
        rarity: r,
        description: `Материал ранга ${tierLabels[idx]} (${r}★) из данжа ${series.dungeon} для вознесения оружия и прокачки навыков категории ${series.weapon}.`,
        image: iconFor(r, '⚗️', tierLabels[idx]),
        props: {
          Оружие: series.weapon,
          Данж: series.dungeon,
          Ранг: `${tierLabels[idx]} (${r}★)`,
        },
        tags: `оружие, форте, данж, ${series.weapon.toLowerCase()}, ${itemName.toLowerCase()}`,
      });
    });
  }

  // 5. Дроп с врагов (40)
  for (const series of ENEMY_SERIES) {
    series.items.forEach((itemName, idx) => {
      const r = rarities[idx];
      list.push({
        id: idCounter++,
        category: 'Материалы',
        subcategory: 'Дроп с врагов',
        name: itemName,
        rarity: r,
        description: `Трофей ранга ${tierLabels[idx]} (${r}★), выпадающий с противников группы «${series.enemy}» или создаваемый в Синтезаторе.`,
        image: iconFor(r, '✦', tierLabels[idx]),
        props: {
          Источник: series.enemy,
          Ранг: `${tierLabels[idx]} (${r}★)`,
          Применение: 'Вознесение героев, оружия и Форте',
        },
        tags: `враги, ядро, дроп, ${series.enemy.toLowerCase()}, ${itemName.toLowerCase()}`,
      });
    });
  }

  // 6. Опыт и валюта (22)
  for (const [name, rarity, desc, sym] of EXP_AND_CURRENCY) {
    list.push({
      id: idCounter++,
      category: 'Материалы',
      subcategory: 'Опыт и Валюта',
      name,
      rarity,
      description: desc,
      image: iconFor(rarity, sym, 'ITEM'),
      props: {
        Тип: 'Ресурс развития и снабжения',
        Редкость: `${rarity}★`,
      },
      tags: `опыт, валюта, тюнер, ${name.toLowerCase()}`,
    });
  }

  return list;
})();

export const getBuiltinMaterialsAsEntries = (): BestiaryEntry[] =>
  BUILTIN_MATERIALS.map((m) => ({
    id: m.id,
    category: m.category,
    name: m.name,
    rarity: m.rarity,
    description: m.description,
    image: m.image,
    props: {
      Подкатегория: m.subcategory,
      ...m.props,
    },
    tags: `${m.subcategory.toLowerCase()}, ${m.tags}`,
    createdAt: '2026-10-20T00:00:00.000Z',
    updatedAt: '2026-10-20T00:00:00.000Z',
  }));