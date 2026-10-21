// Отрисовка портретов персонажей с аппаратным сглаживанием высоких разрешений (без пиксельной ряби)
import { useEffect, useState } from 'react';
import { IMAGES } from '../../data/images';

const GRADIENTS: Record<string, string> = {
  Spectro: 'from-yellow-600/50 to-yellow-950/60',
  Havoc: 'from-fuchsia-600/50 to-purple-950/60',
  Fusion: 'from-red-600/50 to-red-950/60',
  Glacio: 'from-cyan-600/50 to-cyan-950/60',
  Electro: 'from-purple-600/50 to-violet-950/60',
  Aero: 'from-green-600/50 to-green-950/60',
};

interface Props {
  id: string;
  initials: string;
  element: string;
  className?: string;
}

export const ImagePlaceholder = ({ id, initials, element, className = '' }: Props) => {
  const [failed, setFailed] = useState(false);
  const src = IMAGES[id];

  useEffect(() => {
    setFailed(false);
  }, [id, src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={initials}
        decoding="async"
        onError={() => setFailed(true)}
        style={{
          imageRendering: 'auto',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
        }}
        className={`object-cover select-none ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${
        GRADIENTS[element] ?? 'from-gray-700 to-gray-900'
      } ${className}`}
      aria-hidden="true"
    >
      <span className="text-2xl font-bold text-white/80 drop-shadow-md">{initials}</span>
    </div>
  );
};