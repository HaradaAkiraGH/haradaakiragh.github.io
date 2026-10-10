// Живой фон сайта: аврора-пятна с оттенком раздела, параллакс от мыши,
// световые лучи с мерцанием, золотая пыль, плёночное зерно и виньетка.
// Все слои едва заметны по отдельности — вместе дают «дорогую» картинку.
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

// Оттенок авроры под каждый раздел
const TINTS: Record<string, string> = {
  '/characters': '#caa07d', // золото
  '/map': '#3f8e8a',        // морская бирюза
  '/meta': '#e6c9a8',       // шампань
  '/profile': '#c98d7a',    // розовое золото
  '/settings': '#8f8aa0',   // приглушённый лиловый
  '/login': '#caa07d',
};

const tintFor = (path: string): string => {
  const key = Object.keys(TINTS).find((k) => path === k || path.startsWith(k + '/'));
  return TINTS[key ?? '/characters'];
};

export const BackgroundFX = () => {
  const { pathname } = useLocation();
  const [settings] = useSettings();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Параллакс от мыши (отключён в режиме «Уменьшить анимации»)
  useEffect(() => {
    if (settings.reduceMotion) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setPos({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5,
        });
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [settings.reduceMotion]);

  const tint = tintFor(pathname);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Аврора-пятно 1: цвет раздела + медленный дрейф + параллакс */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[55vw] h-[55vw] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${pos.x * 24}px, ${pos.y * 16}px, 0)` }}
      >
        <div
          className="w-full h-full rounded-full blur-[120px] opacity-[0.16] aurora-drift transition-colors duration-1000"
          style={{ backgroundColor: tint }}
        />
      </div>

      {/* Аврора-пятно 2: контр-движение */}
      <div
        className="absolute top-[30%] -right-[15%] w-[45vw] h-[45vw] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${pos.x * -30}px, ${pos.y * -20}px, 0)` }}
      >
        <div
          className="w-full h-full rounded-full blur-[130px] opacity-[0.12] aurora-drift-slow transition-colors duration-1000"
          style={{ backgroundColor: tint }}
        />
      </div>

      {/* Диагональные лучи с медленным мерцанием */}
      <div className="absolute -top-40 right-[-10%] w-[480px] h-[150%] rotate-[28deg] bg-gradient-to-b from-ivory/[0.05] via-ivory/[0.015] to-transparent blur-2xl ray-shimmer" />
      <div className="absolute -top-40 right-[16%] w-[200px] h-[150%] rotate-[28deg] bg-gradient-to-b from-accent/[0.06] to-transparent blur-xl ray-shimmer-slow" />

      {/* Золотая пыль: два слоя частиц с разной скоростью */}
      <div className="absolute inset-0 dust dust-a" />
      <div className="absolute inset-0 dust dust-b" />

      {/* Плёночное зерно поверх градиентов */}
      <div className="absolute inset-0 noise" />

      {/* Виньетка по краям экрана */}
      <div className="absolute inset-0 vignette" />
    </div>
  );
};