// Акцент-палитры сайта. Цвета хранятся как RGB-компоненты ("202 160 125"),
// потому что Tailwind подставляет их в rgb(var(--accent) / <alpha-value>)
export type PaletteId = 'gold' | 'nostalgia' | 'ice';

export const PALETTES: Record<PaletteId, { label: string; accent: string; accentLight: string; swatch: string }> = {
  gold:      { label: 'Золото Хуанлуна',  accent: '202 160 125', accentLight: '230 201 168', swatch: '#caa07d' },
  nostalgia: { label: 'Ностальгия (неон)', accent: '124 58 237',  accentLight: '168 85 247',  swatch: '#7c3aed' },
  ice:       { label: 'Лёд Ринаты',       accent: '110 168 196', accentLight: '184 220 234', swatch: '#6ea8c4' },
};

// Применяет палитру к документу (CSS-переменные на :root)
export function applyPalette(id: PaletteId) {
  const p = PALETTES[id] ?? PALETTES.gold;
  const root = document.documentElement;
  root.style.setProperty('--accent', p.accent);
  root.style.setProperty('--accent-light', p.accentLight);
}