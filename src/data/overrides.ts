// Серверные правки карточек: применяются ДО первой отрисовки,
// поверх базовых данных из characters.ts + details/wave*.ts.
// Нет сети или база пустая — сайт молча работает на бандле.
import { CHARACTERS } from './characters';
import { API_BASE } from '../utils/api';

export async function loadCharacterOverrides(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/characters/overrides`);
    if (!res.ok) return 0;
    const body = await res.json().catch(() => null);
    const list = body?.overrides;
    if (!Array.isArray(list)) return 0;
    let applied = 0;
    for (const row of list) {
      const char = CHARACTERS.find((c) => c.id === row?.id);
      if (char && row.data && typeof row.data === 'object' && !Array.isArray(row.data)) {
        Object.assign(char, row.data);
        applied++;
      }
    }
    return applied;
  } catch {
    return 0;
  }
}