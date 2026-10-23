// Полноэкранный зацикленный видеофон Соларис-3 (/bg-video.mp4) под интерфейс Liquid Glass
import { useEffect, useRef } from 'react';

export const BackgroundFX = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.play().catch(() => {});

    const ensurePlaying = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', ensurePlaying);
    return () => {
      document.removeEventListener('visibilitychange', ensurePlaying);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden bg-[#060810]"
    >
      {/* Зацикленное фоновое видео на весь экран */}
      <video
        ref={videoRef}
        src="/bg-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onEnded={(e) => {
          e.currentTarget.currentTime = 0;
          e.currentTarget.play().catch(() => {});
        }}
        className="absolute inset-0 w-full h-full object-cover object-center scale-[1.01]"
      />

      {/* Мягкая атмосферная тонировка, чтобы белый текст читался идеально, а видео светилось сквозь Liquid Glass */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060812]/45 via-[#070914]/50 to-[#060810]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,transparent_25%,rgba(5,7,14,0.55)_100%)]" />
    </div>
  );
};

export default BackgroundFX;