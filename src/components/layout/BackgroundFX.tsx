// Живой многослойный фон Stellar Wiki (Solaris-3 Celestial Engine):
// Интерактивное свечение за курсором, вращающаяся астролябия, падающие метеоры,
// восходящие искры резонанса, объёмные лучи и туманности
import { useEffect, useRef } from 'react';

const EMBERS = [
  { id: 1, left: '6%', size: 3, dur: '14s', delay: '0s', opacity: 0.55 },
  { id: 2, left: '14%', size: 2, dur: '18s', delay: '2.5s', opacity: 0.4 },
  { id: 3, left: '22%', size: 4, dur: '16s', delay: '1.2s', opacity: 0.65 },
  { id: 4, left: '31%', size: 2, dur: '21s', delay: '4.0s', opacity: 0.35 },
  { id: 5, left: '42%', size: 3, dur: '15s', delay: '0.7s', opacity: 0.5 },
  { id: 6, left: '53%', size: 4, dur: '19s', delay: '3.3s', opacity: 0.6 },
  { id: 7, left: '64%', size: 2, dur: '17s', delay: '1.8s', opacity: 0.45 },
  { id: 8, left: '73%', size: 3, dur: '13s', delay: '5.1s', opacity: 0.55 },
  { id: 9, left: '82%', size: 4, dur: '20s', delay: '2.1s', opacity: 0.6 },
  { id: 10, left: '91%', size: 2, dur: '16s', delay: '3.9s', opacity: 0.4 },
];

const METEORS = [
  { id: 1, top: '8%', left: '68%', delay: '0s', duration: '9s' },
  { id: 2, top: '22%', left: '85%', delay: '3.5s', duration: '11s' },
  { id: 3, top: '14%', left: '42%', delay: '6.2s', duration: '10s' },
  { id: 4, top: '36%', left: '76%', delay: '8.8s', duration: '12s' },
];

export const BackgroundFX = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Плавное отслеживание курсора через CSS-переменные (0 ререндеров React, 60+ FPS)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId = 0;
    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${e.clientX}px`);
        el.style.setProperty('--my', `${e.clientY}px`);
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ '--mx': '50vw', '--my': '35vh' } as React.CSSProperties}
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none"
    >
      {/* 1. Интерактивный резонансный ореол, следующий за курсором мыши */}
      <div
        className="hidden md:block absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            'radial-gradient(650px circle at var(--mx) var(--my), rgb(var(--accent) / 0.085), rgb(var(--accent-light) / 0.03) 40%, transparent 70%)',
        }}
      />

      {/* 2. Глубокие дрейфующие туманности (Aurora Nebulae) */}
      <div className="absolute -top-48 -left-32 w-[680px] h-[680px] rounded-full bg-accent/10 blur-[150px] aurora-drift" />
      <div className="absolute top-1/4 -right-40 w-[620px] h-[620px] rounded-full bg-accent-light/[0.08] blur-[160px] aurora-drift-slow" />
      <div className="absolute -bottom-56 left-1/3 w-[720px] h-[520px] rounded-full bg-indigo-500/[0.06] blur-[160px] aurora-drift" />

      {/* 3. Тонкая координатная сетка Соларис-3 */}
      <div className="absolute inset-0 solaris-grid" />

      {/* 4. Вращающаяся Небесная Астролябия Соларис-3 (справа сверху) */}
      <div className="hidden lg:flex absolute -top-64 -right-64 w-[860px] h-[860px] items-center justify-center opacity-[0.16]">
        {/* Внешнее кольцо астролябии */}
        <svg
          viewBox="0 0 600 600"
          className="w-full h-full animate-[spin_110s_linear_infinite]"
        >
          <defs>
            <linearGradient id="bgAstrolabeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent-light))" stopOpacity="0.9" />
              <stop offset="50%" stopColor="rgb(var(--accent))" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(var(--accent-light))" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <circle
            cx="300"
            cy="300"
            r="280"
            fill="none"
            stroke="url(#bgAstrolabeGrad)"
            strokeWidth="1.2"
            strokeDasharray="12 8 3 8"
          />
          <circle
            cx="300"
            cy="300"
            r="242"
            fill="none"
            stroke="url(#bgAstrolabeGrad)"
            strokeWidth="0.9"
            strokeDasharray="48 16"
          />
          <circle
            cx="300"
            cy="300"
            r="195"
            fill="none"
            stroke="url(#bgAstrolabeGrad)"
            strokeWidth="0.8"
            strokeDasharray="4 10"
          />
          {/* Осевые линии и звёздные засечки */}
          <line
            x1="20"
            y1="300"
            x2="580"
            y2="300"
            stroke="url(#bgAstrolabeGrad)"
            strokeWidth="0.6"
            strokeDasharray="6 12"
          />
          <line
            x1="300"
            y1="20"
            x2="300"
            y2="580"
            stroke="url(#bgAstrolabeGrad)"
            strokeWidth="0.6"
            strokeDasharray="6 12"
          />
          <polygon points="300,12 306,26 300,22 294,26" fill="rgb(var(--accent-light))" />
          <polygon points="300,588 306,574 300,578 294,574" fill="rgb(var(--accent-light))" />
          <polygon points="12,300 26,306 22,300 26,294" fill="rgb(var(--accent-light))" />
          <polygon points="588,300 574,306 578,300 574,294" fill="rgb(var(--accent-light))" />
        </svg>

        {/* Внутреннее кольцо, вращающееся в обратную сторону */}
        <svg
          viewBox="0 0 400 400"
          className="absolute w-[540px] h-[540px] animate-[spin_75s_linear_infinite_reverse]"
        >
          <circle
            cx="200"
            cy="200"
            r="170"
            fill="none"
            stroke="rgb(var(--accent-light))"
            strokeOpacity="0.45"
            strokeWidth="1"
            strokeDasharray="22 14 4 14"
          />
          <rect
            x="80"
            y="80"
            width="240"
            height="240"
            fill="none"
            stroke="rgb(var(--accent))"
            strokeOpacity="0.25"
            strokeWidth="0.8"
            transform="rotate(45 200 200)"
          />
        </svg>
      </div>

      {/* 5. Диагональные световые лучи (God Rays) */}
      <div className="absolute -top-48 right-[-6%] w-[460px] h-[155%] rotate-[28deg] bg-gradient-to-b from-ivory/[0.055] via-accent-light/[0.02] to-transparent blur-2xl ray-shimmer" />
      <div className="absolute -top-48 right-[18%] w-[240px] h-[145%] rotate-[28deg] bg-gradient-to-b from-accent-light/[0.045] via-ivory/[0.015] to-transparent blur-xl ray-shimmer-slow" />
      <div className="absolute -top-48 left-[12%] w-[180px] h-[125%] rotate-[28deg] bg-gradient-to-b from-ivory/[0.03] to-transparent blur-2xl ray-shimmer" />

      {/* 6. Падающие звёзды / кометы резонанса */}
      <div className="hidden sm:block absolute inset-0">
        {METEORS.map((m) => (
          <span
            key={m.id}
            style={{
              top: m.top,
              left: m.left,
              animationDelay: m.delay,
              animationDuration: m.duration,
            }}
            className="ww-meteor"
          />
        ))}
      </div>

      {/* 7. Парящая звёздная пыль + индивидуальные золотые искры */}
      <div className="absolute inset-0 dust dust-a" />
      <div className="absolute inset-0 dust dust-b" />

      <div className="hidden sm:block absolute inset-0">
        {EMBERS.map((e) => (
          <span
            key={e.id}
            style={{
              left: e.left,
              width: `${e.size}px`,
              height: `${e.size}px`,
              animationDuration: e.dur,
              animationDelay: e.delay,
              opacity: e.opacity,
            }}
            className="ww-ember"
          />
        ))}
      </div>

      {/* 8. Тонкая частотная волна Резонанса вдоль нижней кромки экрана */}
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="hidden md:block absolute bottom-0 inset-x-0 w-full h-16 opacity-[0.14]"
      >
        <path
          d="M0,55 C320,15 620,85 960,40 C1180,12 1320,65 1440,35"
          fill="none"
          stroke="rgb(var(--accent-light))"
          strokeWidth="1.2"
          className="ww-wave-pulse"
        />
        <path
          d="M0,70 C400,90 740,20 1120,62 C1280,78 1380,45 1440,58"
          fill="none"
          stroke="rgb(var(--accent))"
          strokeWidth="0.8"
          strokeDasharray="8 6"
        />
      </svg>

      {/* 9. Текстурный микро-шум и кинематографичная виньетка */}
      <div className="absolute inset-0 noise" />
      <div className="absolute inset-0 vignette" />
    </div>
  );
};

export default BackgroundFX;