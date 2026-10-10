import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { applyReduceMotion } from './hooks/useSettings';
import { applyPalette } from './utils/palette';

// Применяем сохранённые настройки до первой отрисовки
try {
  const s = JSON.parse(localStorage.getItem('ww_settings') || '{}');
  if (s.palette) applyPalette(s.palette);
  if (s.reduceMotion) applyReduceMotion(true);
} catch {
  // первый запуск — настроек ещё нет
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);