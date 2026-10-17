// Все типы данных проекта
export type ElementType = 'Spectro' | 'Havoc' | 'Fusion' | 'Glacio' | 'Electro' | 'Aero';
export type WeaponType = 'Sword' | 'Broadblade' | 'Pistol' | 'Gauntlets' | 'Rectifier';
export type Rarity = 4 | 5;
export type CharacterRole = 'Main DPS' | 'Sub DPS' | 'Support' | 'Healer' | 'Defender';
export type GameMode = 'Tower of Adversity' | 'Whimpering Wastes' | 'General';
// '-' используется для персонажей, у которых мета-рейтинг ещё не определён
export type Tier = 'S' | 'A' | 'B' | 'C' | '-';
export type MapMarkerType = 'chest' | 'puzzle' | 'resource' | 'echo' | 'boss' | 'viewpoint';

/* ---------- Новые блоки страницы персонажа ---------- */
export interface ReleaseInfo {
  patch: string;      // например '1.0', '2.3'
  date?: string;      // дата выхода патча (опционально)
}
export interface SkillInfo {
  name: string;
  type: string;       // Resonance Skill / Liberation / Intro / Outro / Forte
  description: string;
}
export interface ConstellationInfo {
  name: string;       // название резонансной цепи
  effect: string;     // что даёт
}
export interface TargetStat {
  label: string;      // Crit Rate, ATK, Energy Regen...
  value: string;      // '70%+', '2200+'...
}
export interface SkillPriority {
  name: string;       // какой навык качать
  note?: string;      // комментарий
}

export interface Character {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  element: ElementType;
  weapon: WeaponType;
  role: CharacterRole;
  metaRating: { tower: Tier; realm: Tier };
  strengths: string[];
  weaknesses: string[];
  echoSets: EchoSet[];
  weapons: WeaponInfo[];
  rotation: RotationStep[];
  teams: TeamComposition[];
  materials: MaterialCategory[];
  // Опциональные блоки новых вкладок (наполняются волнами/админкой):
  release?: ReleaseInfo;
  skills?: SkillInfo[];
  constellations?: ConstellationInfo[];
  targetStats?: TargetStat[];
  skillPriority?: SkillPriority[];
}

export interface EchoSet {
  name: string;
  cost4: string;
  distribution: string;
  mainStats: string[];
  subStats: string[];
  priority: number;
}

export interface WeaponInfo {
  name: string;
  type: 'Signature' | 'Alternative';
  rating: number;
  source: string;
}

export interface RotationStep {
  step: number;
  skill: string;
  timing: string;
  note?: string;
}

export interface TeamComposition {
  members: string[];
  synergy: string;
  role: string;
}

export interface MaterialCategory {
  type: 'Ascension' | 'Forte' | 'Skill';
  items: MaterialItem[];
}

export interface MaterialItem {
  name: string;
  quantity: number;
  location: string;
}

export interface MapMarker {
  id: string;
  type: MapMarkerType;
  position: [number, number];
  name: string;
  description: string;
  respawn?: string;
  region: 'Huanglong' | 'Rinata';
}

export interface RosterCharacter {
  characterId: string;
  level: number;
  weapon: string;
  echoSet: string;
}

export interface PlayerProfile {
  uid: string;
  nickname: string;
  unionLevel: number;
  signature: string;
  roster: RosterCharacter[];
}