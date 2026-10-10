// Настройки сайта + глобальные режимы (аниимации off, палитра)
import { useLocalStorage } from './useLocalStorage';
import { PaletteId } from '../utils/palette';

export interface SiteSettings {
  reduceMotion: boolean;   // отключить все анимации и переходы
  showMetaBadge: boolean;  // бейдж META S на карточках
  palette: PaletteId;      // акцент-палитра интерфейса
}

const DEFAULTS: SiteSettings = { reduceMotion: false, showMetaBadge: true, palette: 'gold' };

export function useSettings() {
  return useLocalStorage<SiteSettings>('ww_settings', DEFAULTS);
}

// Режим «без анимаций» через инъекцию style
export function applyReduceMotion(on: boolean) {
  const id = 'ww-reduce-motion';
  const existing = document.getElementById(id);
  if (on && !existing) {
    const st = document.createElement('style');
    st.id = id;
    st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;}';
    document.head.appendChild(st);
  } else if (!on && existing) {
    existing.remove();
  }
}