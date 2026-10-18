// Живой фон сайта: аврора с оттенком раздела, координатная сетка Соларис-3, лучи, виньетка.
// МОБИЛЬНЫЙ РЕЖИМ (touch / узкий экран): без пыли, зерна и параллакса для честных 60 FPS.
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const TINTS: Record<string, string> = {
  '/home': '#caa07d',
  '/characters': '#caa07d',
  '/bestiary': '#c4956a',
  '/pulls': '#d9b382',
  '/map': '#3f8e8a',
  '/meta': '#e6c9a8',
  '/calculator': '#b59273',
  '/profile': '#c98d7a',
  '/settings': '#8f8aa0',
  '/login': '#caa07d',
};

const tintFor = (path: string): string => {
  const key = Object.keys(TINTS).find((k) => path === k || path.startsWith(k + '/'));
  return TINTS[key ?? '/characters'];
};

const isCoarse = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);

export const BackgroundFX = () => {
  const { pathname } = useLocation();
  const [settings] = useSettings();
  const [coarse, setCoarse] = useState(isCoarse);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onResize = () => setCoarse(isCoarse());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (settings.reduceMotion || coarse) return;
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
  }, [settings.reduceMotion, coarse]);

  const tint = tintFor(pathname);
  const blurA = coarse ? 'blur-[70px]' : 'blur-[130px]';
  const blurB = coarse ? 'blur-[80px]' : 'blur-[140px]';
  const shift = coarse ? { x: 0, y: 0 } : pos;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Тонкая тактическая сетка Соларис-3 */}
      <div className="absolute inset-0 solaris-grid" />
      {/* Аврора-пятно 1 */}
      <div
        className="absolute -top-[22%] -left-[10%] w-[55vw] h-[55vw] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${shift.x * 24}px, ${shift.y * 16}px, 0)` }}
      >
        <div
          className={`w-full h-full rounded-full ${blurA} opacity-[0.17] aurora-drift transition-colors duration-1000`}
          style={{ backgroundColor: tint }}
        />
      </div>
      {/* Аврора-пятно 2 */}
      <div
        className="absolute top-[28%] -right-[15%] w-[45vw] h-[45vw] transition-transform duration-300 ease-out"
        style={{ transform: `translate3d(${shift.x * -30}px, ${shift.y * -20}px, 0)` }}
      >
        <div
          className={`w-full h-full rounded-full ${blurB} opacity-[0.12] aurora-drift-slow transition-colors duration-1000`}
          style={{ backgroundColor: tint }}
        />
      </div>
      {/* Диагональные лучи света */}
      <div className="absolute -top-40 right-[-10%] w-[480px] h-[150%] rotate-[28deg] bg-gradient-to-b from-ivory/[0.05] via-ivory/[0.015] to-transparent blur-2xl ray-shimmer" />
      <div className="absolute -top-40 right-[16%] w-[220px] h-[150%] rotate-[28deg] bg-gradient-to-b from-accent/[0.06] to-transparent blur-xl ray-shimmer-slow" />
      {!coarse && (
        <>
          <div className="absolute inset-0 dust dust-a" />
          <div className="absolute inset-0 dust dust-b" />
          <div className="absolute inset-0 noise" />
        </>
      )}
      <div className="absolute inset-0 vignette" />
    </div>
  );
};