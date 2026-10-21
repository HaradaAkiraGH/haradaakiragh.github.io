// Полная база меты с Prydwen.gg (Tier List + Team Tier List + Mechanic Sub-tags + English Echo Sets)
export type PrydwenTier = 'T0' | 'T0.5' | 'T1' | 'T1.5' | 'T2' | 'T3';
export type PrydwenRoleCol = 'Main DPS' | 'Hybrid / Sub DPS' | 'Support / Sustain';

export interface PrydwenCharEntry {
  toa: PrydwenTier;
  wastes: PrydwenTier;
  column: PrydwenRoleCol;
  tags: string[]; // "Chafe", "Bane", "Frazzle", "Erosion", "Burst", "Coord", "Amp", "Heal", "Shield"
}

export const PRYDWEN_TAG_COLORS: Record<string, string> = {
  Bane: 'bg-fuchsia-950/90 text-fuchsia-300 border-fuchsia-400/50',
  Chafe: 'bg-cyan-950/90 text-cyan-300 border-cyan-400/50',
  Frazzle: 'bg-amber-950/90 text-amber-300 border-amber-400/50',
  Erosion: 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50',
  Burst: 'bg-orange-950/90 text-orange-300 border-orange-400/50',
  Coord: 'bg-indigo-950/90 text-indigo-300 border-indigo-400/50',
  Amp: 'bg-rose-950/90 text-rose-300 border-rose-400/50',
  Heal: 'bg-teal-950/90 text-teal-300 border-teal-400/50',
  Shield: 'bg-slate-800/90 text-slate-200 border-slate-400/50',
  AoE: 'bg-purple-950/90 text-purple-300 border-purple-400/50',
};

export const PRYDWEN_CHAR_META: Record<string, PrydwenCharEntry> = {
  // ===== T0 (Apex Meta) =====
  camellya: { toa: 'T0', wastes: 'T0', column: 'Main DPS', tags: ['Bane', 'AoE'] },
  cartethyia: { toa: 'T0', wastes: 'T0', column: 'Main DPS', tags: ['Erosion', 'Amp'] },
  jinhsi: { toa: 'T0', wastes: 'T0.5', column: 'Main DPS', tags: ['Frazzle', 'Burst'] },
  carlotta: { toa: 'T0', wastes: 'T0.5', column: 'Main DPS', tags: ['Chafe'] },
  phrolova: { toa: 'T0', wastes: 'T0', column: 'Main DPS', tags: ['Bane', 'Coord'] },
  zani: { toa: 'T0', wastes: 'T0.5', column: 'Main DPS', tags: ['Frazzle'] },
  lupa: { toa: 'T0', wastes: 'T0.5', column: 'Main DPS', tags: ['Burst', 'Amp'] },
  augusta: { toa: 'T0', wastes: 'T0.5', column: 'Main DPS', tags: ['Chafe', 'Burst'] },
  aemeath: { toa: 'T0', wastes: 'T0', column: 'Main DPS', tags: ['Burst', 'AoE'] },
  hiyuki: { toa: 'T0', wastes: 'T0', column: 'Main DPS', tags: ['Chafe'] },

  phoebe: { toa: 'T0', wastes: 'T0.5', column: 'Hybrid / Sub DPS', tags: ['Frazzle', 'Amp'] },
  zhezhi: { toa: 'T0', wastes: 'T0.5', column: 'Hybrid / Sub DPS', tags: ['Chafe', 'Coord', 'Amp'] },
  roccia: { toa: 'T0.5', wastes: 'T0', column: 'Hybrid / Sub DPS', tags: ['Bane', 'AoE'] },
  cantarella: { toa: 'T0', wastes: 'T0.5', column: 'Hybrid / Sub DPS', tags: ['Bane', 'Coord', 'Heal'] },
  ciaccona: { toa: 'T0', wastes: 'T0', column: 'Hybrid / Sub DPS', tags: ['Erosion', 'Amp'] },
  brant: { toa: 'T0', wastes: 'T0.5', column: 'Hybrid / Sub DPS', tags: ['Burst', 'Heal', 'Shield'] },
  qingxiao: { toa: 'T0', wastes: 'T0', column: 'Hybrid / Sub DPS', tags: ['Erosion', 'Coord'] },

  shorekeeper: { toa: 'T0', wastes: 'T0', column: 'Support / Sustain', tags: ['Amp', 'Heal'] },
  verina: { toa: 'T0', wastes: 'T0', column: 'Support / Sustain', tags: ['Coord', 'Amp', 'Heal'] },
  mornye: { toa: 'T0', wastes: 'T0', column: 'Support / Sustain', tags: ['Frazzle', 'Amp', 'Shield'] },

  // ===== T0.5 =====
  changli: { toa: 'T0.5', wastes: 'T0', column: 'Main DPS', tags: ['Burst', 'Amp'] },
  jiyan: { toa: 'T0.5', wastes: 'T0', column: 'Main DPS', tags: ['Erosion', 'AoE'] },
  'xiangli-yao': { toa: 'T0.5', wastes: 'T0.5', column: 'Main DPS', tags: ['Chafe', 'AoE'] },
  jingran: { toa: 'T0.5', wastes: 'T0.5', column: 'Main DPS', tags: ['Burst'] },
  galbrena: { toa: 'T0.5', wastes: 'T0.5', column: 'Main DPS', tags: ['Burst', 'Chafe'] },
  hsin: { toa: 'T0.5', wastes: 'T0', column: 'Main DPS', tags: ['Bane', 'AoE'] },
  qiuyuan: { toa: 'T0.5', wastes: 'T0.5', column: 'Main DPS', tags: ['Erosion'] },
  suoming: { toa: 'T0.5', wastes: 'T0.5', column: 'Main DPS', tags: ['Chafe'] },
  'yangyang-xuanling': { toa: 'T0.5', wastes: 'T0', column: 'Main DPS', tags: ['Bane', 'AoE'] },
  sigrika: { toa: 'T0.5', wastes: 'T0.5', column: 'Main DPS', tags: ['Erosion'] },

  yinlin: { toa: 'T0.5', wastes: 'T0', column: 'Hybrid / Sub DPS', tags: ['Chafe', 'Coord', 'Amp'] },
  sanhua: { toa: 'T0.5', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Chafe', 'Amp'] },
  'rover-spectro': { toa: 'T0.5', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Frazzle', 'Heal'] },
  'rover-aero': { toa: 'T0.5', wastes: 'T0.5', column: 'Hybrid / Sub DPS', tags: ['Erosion', 'Heal'] },
  lucilla: { toa: 'T0.5', wastes: 'T0.5', column: 'Hybrid / Sub DPS', tags: ['Bane', 'Amp'] },
  lucy: { toa: 'T0.5', wastes: 'T0.5', column: 'Hybrid / Sub DPS', tags: ['Frazzle', 'Coord'] },

  'luuk-herssen': { toa: 'T0.5', wastes: 'T0.5', column: 'Support / Sustain', tags: ['Frazzle', 'Shield'] },
  suisui: { toa: 'T0.5', wastes: 'T0.5', column: 'Support / Sustain', tags: ['Chafe', 'Heal'] },
  lynae: { toa: 'T0.5', wastes: 'T1', column: 'Support / Sustain', tags: ['Frazzle', 'Amp'] },
  denia: { toa: 'T0.5', wastes: 'T0.5', column: 'Support / Sustain', tags: ['Burst', 'Heal'] },
  lily: { toa: 'T0.5', wastes: 'T1', column: 'Support / Sustain', tags: ['Frazzle', 'Amp'] },

  // ===== T1 =====
  encore: { toa: 'T1', wastes: 'T1', column: 'Main DPS', tags: ['Burst'] },
  'rover-havoc': { toa: 'T1', wastes: 'T0.5', column: 'Main DPS', tags: ['Bane', 'AoE'] },
  danjin: { toa: 'T1', wastes: 'T1.5', column: 'Main DPS', tags: ['Bane', 'Amp'] },

  mortefi: { toa: 'T1', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Burst', 'Coord', 'Amp'] },
  'rover-electro': { toa: 'T1', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Chafe', 'Coord'] },
  iuno: { toa: 'T1', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Erosion'] },
  buling: { toa: 'T1', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Chafe', 'Coord'] },
  rebecca: { toa: 'T1', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Chafe'] },

  baizhi: { toa: 'T1', wastes: 'T1.5', column: 'Support / Sustain', tags: ['Coord', 'Amp', 'Heal'] },

  // ===== T1.5 =====
  calcharo: { toa: 'T1.5', wastes: 'T2', column: 'Main DPS', tags: ['Chafe'] },
  chixia: { toa: 'T1.5', wastes: 'T2', column: 'Main DPS', tags: ['Burst'] },

  yangyang: { toa: 'T1.5', wastes: 'T1', column: 'Hybrid / Sub DPS', tags: ['Erosion', 'AoE'] },
  jianxin: { toa: 'T1.5', wastes: 'T1', column: 'Support / Sustain', tags: ['Amp', 'Heal', 'Shield'] },
  chisa: { toa: 'T1.5', wastes: 'T1.5', column: 'Support / Sustain', tags: ['Bane', 'Shield'] },

  // ===== T2 & T3 =====
  lingyang: { toa: 'T2', wastes: 'T2', column: 'Main DPS', tags: ['Chafe'] },
  lumi: { toa: 'T2', wastes: 'T2', column: 'Hybrid / Sub DPS', tags: ['Chafe', 'Amp'] },
  aalto: { toa: 'T2', wastes: 'T2', column: 'Hybrid / Sub DPS', tags: ['Erosion', 'Amp'] },
  yuanwu: { toa: 'T2', wastes: 'T3', column: 'Hybrid / Sub DPS', tags: ['Chafe', 'Coord'] },
  youhu: { toa: 'T2', wastes: 'T2', column: 'Support / Sustain', tags: ['Chafe', 'Coord', 'Heal'] },
  taoqi: { toa: 'T3', wastes: 'T3', column: 'Support / Sustain', tags: ['Bane', 'Amp', 'Shield'] },
};

/* ==================== PRYDWEN TEAM TIER LIST ==================== */
export interface PrydwenTeamEntry {
  id: string;
  name: string;
  archetype: string;
  members: [string, string, string];
  toa: PrydwenTier;
  wastes: PrydwenTier;
  tags: string[];
  note: string;
}

export const PRYDWEN_TEAMS: PrydwenTeamEntry[] = [
  {
    id: 'team-aero-erosion',
    name: 'Cartethyia Aero Erosion',
    archetype: 'Aero Erosion Hypercarry',
    members: ['cartethyia', 'ciaccona', 'rover-aero'],
    toa: 'T0',
    wastes: 'T0',
    tags: ['Erosion', 'Amp', 'Heal'],
    note: 'Ciaccona и Aero Rover разгоняют стаки Aero Erosion до максимума под ультимейт Cartethyia.',
  },
  {
    id: 'team-spectro-frazzle',
    name: 'Zani & Phoebe Spectro Frazzle',
    archetype: 'Spectro Frazzle Dual Core',
    members: ['zani', 'phoebe', 'shorekeeper'],
    toa: 'T0',
    wastes: 'T0',
    tags: ['Frazzle', 'Amp', 'Heal'],
    note: 'Phoebe мгновенно накладывает Spectro Frazzle, раскрывая 100% множителей Zani под баффами Shorekeeper.',
  },
  {
    id: 'team-havoc-bane',
    name: 'Phrolova & Cantarella Havoc Bane',
    archetype: 'Havoc Bane & Coord',
    members: ['phrolova', 'cantarella', 'roccia'],
    toa: 'T0',
    wastes: 'T0',
    tags: ['Bane', 'Coord', 'AoE'],
    note: 'Полная моно-Havoc синергия: стяжка Roccia + хил и Havoc Bane от Cantarella + взрывной урон Phrolova.',
  },
  {
    id: 'team-fusion-triple',
    name: 'Lupa · Brant · Changli',
    archetype: 'Triple Fusion Quickswap',
    members: ['lupa', 'brant', 'changli'],
    toa: 'T0',
    wastes: 'T0',
    tags: ['Burst', 'Amp', 'Shield'],
    note: 'Безостановочная цепочка outro-баффов Fusion и Liberation: Brant даёт щит и хил, Changli и Lupa закрывают ротацию.',
  },
  {
    id: 'team-camellya-hyper',
    name: 'Camellya Crimson Hypercarry',
    archetype: 'Basic Attack Hypercarry',
    members: ['camellya', 'roccia', 'shorekeeper'],
    toa: 'T0',
    wastes: 'T0',
    tags: ['Bane', 'Amp', 'AoE'],
    note: 'Roccia баффает Havoc и обычные атаки + стягивает волны в Whimpering Wastes для вертушки Camellya.',
  },
  {
    id: 'team-carlotta-glacio',
    name: 'Carlotta Glacio Chafe',
    archetype: 'Resonance Skill Carry',
    members: ['carlotta', 'zhezhi', 'shorekeeper'],
    toa: 'T0',
    wastes: 'T0.5',
    tags: ['Chafe', 'Coord', 'Amp'],
    note: 'Zhezhi заливает энергию и усиливает и Glacio, и урон навыка (Resonance Skill) для снайперской серии Carlotta.',
  },
  {
    id: 'team-jinhsi-coord',
    name: 'Jinhsi Incandescence',
    archetype: 'Coordinated Burst Carry',
    members: ['jinhsi', 'cantarella', 'verina'],
    toa: 'T0',
    wastes: 'T0.5',
    tags: ['Frazzle', 'Coord', 'Heal'],
    note: 'Координированные атаки Cantarella и Verina мгновенно заполняют стаки Incandescence для луча Jinhsi.',
  },
  {
    id: 'team-augusta-electro',
    name: 'Augusta Electro Chafe',
    archetype: 'Electro Chafe Carry',
    members: ['augusta', 'yinlin', 'shorekeeper'],
    toa: 'T0.5',
    wastes: 'T0.5',
    tags: ['Chafe', 'Coord', 'Amp'],
    note: 'Yinlin усиливает Electro и урон ультимейта через outro, обеспечивая стабильный AoE-прок меток.',
  },
  {
    id: 'team-jiyan-aero',
    name: 'Jiyan Heavy Dragon',
    archetype: 'Heavy Attack AoE Carry',
    members: ['jiyan', 'mortefi', 'verina'],
    toa: 'T1',
    wastes: 'T0',
    tags: ['Erosion', 'Coord', 'AoE'],
    note: 'Классическая доминация в Whimpering Wastes за счёт постоянной стяжки вихрями Jiyan и координированных огней Mortefi.',
  },
];

/* ==================== АНГЛИЙСКИЕ НАЗВАНИЯ ЭХО-СЕТОВ (Пункт 7) ==================== */
export interface EnglishEchoSetStat {
  name: string;
  sonata: string;
  usersCount: number;
  bestFor: string;
}

export const ENGLISH_ECHO_SETS: EnglishEchoSetStat[] = [
  {
    name: 'Rejuvenating Glow',
    sonata: '2pc Healing +10% · 5pc Team ATK +15% on Heal',
    usersCount: 14,
    bestFor: 'The Shorekeeper, Verina, Baizhi, Suisui',
  },
  {
    name: 'Moonlit Clouds',
    sonata: '2pc Energy Regen +10% · 5pc Next Resonator ATK +22.5%',
    usersCount: 12,
    bestFor: 'Sanhua, Mortefi, Yangyang, Zhezhi',
  },
  {
    name: 'Midnight Veil',
    sonata: '2pc Havoc DMG +10% · 5pc Outro Havoc DMG & Amp +15%',
    usersCount: 9,
    bestFor: 'Cantarella, Roccia, Phrolova, Lucilla',
  },
  {
    name: 'Eternal Radiance',
    sonata: '2pc Spectro DMG +10% · 5pc Spectro Frazzle Crit Rate +20%',
    usersCount: 8,
    bestFor: 'Phoebe, Zani, Rover (Spectro), Mornye',
  },
  {
    name: 'Windward Pilgrimage',
    sonata: '2pc Aero DMG +10% · 5pc Aero Erosion Crit & Aero DMG +30%',
    usersCount: 7,
    bestFor: 'Cartethyia, Ciaccona, Qingxiao, Qiuyuan',
  },
  {
    name: 'Frosty Resolve',
    sonata: '2pc Resonance Skill +12% · 5pc Glacio DMG +22.5%',
    usersCount: 6,
    bestFor: 'Carlotta, Hiyuki, Zhezhi',
  },
  {
    name: 'Flaming Clawprint',
    sonata: '2pc Fusion DMG +10% · 5pc Team Fusion & Liberation DMG',
    usersCount: 6,
    bestFor: 'Lupa, Aemeath, Jingran, Galbrena',
  },
  {
    name: 'Sun-sinking Eclipse',
    sonata: '2pc Havoc DMG +10% · 5pc Basic/Heavy increases Havoc +30%',
    usersCount: 5,
    bestFor: 'Camellya, Rover (Havoc), Danjin',
  },
  {
    name: 'Molten Rift',
    sonata: '2pc Fusion DMG +10% · 5pc Skill increases Fusion DMG +30%',
    usersCount: 5,
    bestFor: 'Changli, Encore, Chixia',
  },
  {
    name: 'Void Thunder',
    sonata: '2pc Electro DMG +10% · 5pc Heavy/Skill increases Electro +30%',
    usersCount: 5,
    bestFor: 'Xiangli Yao, Augusta, Yinlin, Calcharo',
  },
  {
    name: 'Tidebreaking Courage',
    sonata: '2pc Energy Regen +10% · 5pc ATK +15% & All-Attribute +30% at 250% ER',
    usersCount: 4,
    bestFor: 'Brant, Rover (Aero)',
  },
  {
    name: 'Empyrean Anthem',
    sonata: '2pc Energy Regen +10% · 5pc Coordinated Attack DMG +80%',
    usersCount: 4,
    bestFor: 'Zhezhi, Yinlin, Cantarella, Mortefi',
  },
];