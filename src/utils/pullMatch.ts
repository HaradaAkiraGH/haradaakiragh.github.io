// Связка круток из игры с каталогом вики: сопоставление по английскому имени.
// Игра отдаёт name в EN (languageCode: 'en' в импорте), поэтому маппинг resourceId не нужен.
import { CHARACTERS } from '../data/characters';
import type { Character } from '../data/types';

// Приводим имя к канону: нижний регистр, только буквы/цифры через пробел
export const normalizeName = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Ручные алиасы: как игра/старые записи могут написать имя
const ALIASES: Record<string, string> = {
  'shorekeeper': 'shorekeeper',
  'the shorekeeper': 'shorekeeper',
  'yangyang xuanling': 'yangyang-xuanling',
  'xuanling': 'yangyang-xuanling',
  'luuk herssen': 'luuk-herssen',
  'xiangli yao': 'xiangli-yao',
  'rover': 'rover-spectro',
};

const BY_NAME: Map<string, Character> = (() => {
  const m = new Map<string, Character>();
  for (const c of CHARACTERS) {
    m.set(normalizeName(c.name), c);
  }
  for (const [alias, id] of Object.entries(ALIASES)) {
    const c = CHARACTERS.find((x) => x.id === id);
    if (c && !m.has(alias)) m.set(alias, c);
  }
  return m;
})();

// Персонаж по имени крутки; undefined — значит это оружие/предмет
export const matchCharacter = (pullName: string): Character | undefined =>
  BY_NAME.get(normalizeName(pullName ?? ''));