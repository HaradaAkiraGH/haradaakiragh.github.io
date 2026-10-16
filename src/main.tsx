import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { applyReduceMotion } from './hooks/useSettings';
import { applyPalette } from './utils/palette';
import { loadCharacterOverrides } from './data/overrides';

// Применяем сохранённые настройки до первой отрисовки
try {
  const s = JSON.parse(localStorage.getItem('ww_settings') || '{}');
  if (s.palette) applyPalette(s.palette);
  if (s.reduceMotion) applyReduceMotion(true);
} catch {
  // первый запуск — настроек ещё нет
}

// Сначала тянем серверные правки карточек, потом рисуем приложение.
// Таймаут 2.5с: если API недоступен, сайт откроется на базовых данных.
const boot = async () => {
  await Promise.race([
    loadCharacterOverrides(),
    new Promise((resolve) => setTimeout(resolve, 2500)),
  ]);
};

boot().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});