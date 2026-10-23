// Отрисовка портретов персонажей с поддержкой 3 форматов (card, icon, splash)
// и точным позиционированием (X%, Y%, Scale%), настроенным в Админке
import { useEffect, useState } from 'react';
import { IMAGES } from '../../data/images';
import { getCharacterArtUrls } from '../../utils/adminStorage';

const GRADIENTS: Record<string, string> = {
  Spectro: 'from-yellow-600/50 to-yellow-950/60',
  Havoc: 'from-fuchsia-600/50 to-purple-950/60',
  Fusion: 'from-red-600/50 to-red-950/60',
  Glacio: 'from-cyan-600/50 to-cyan-950/60',
  Electro: 'from-purple-600/50 to-violet-950/60',
  Aero: 'from-green-600/50 to-green-950/60',
};

const SMALL_ICON_CLASS_RE =
  /\b(w-7|w-8|w-9|w-10|w-11|w-12|w-14|w-16|w-20|aspect-square|aspect-\[3\/3\.8\])\b/;

interface Props {
  id: string;
  initials: string;
  element: string;
  className?: string;
  variant?: 'card' | 'icon' | 'splash';
}

export const ImagePlaceholder = ({
  id,
  initials,
  element,
  className = '',
  variant,
}: Props) => {
  const [failed, setFailed] = useState(false);

  const arts = getCharacterArtUrls(id);

  let resolvedVariant: 'card' | 'icon' | 'splash' = variant ?? 'card';
  if (!variant) {
    if (SMALL_ICON_CLASS_RE.test(className)) {
      resolvedVariant = 'icon';
    } else if (
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith(`/characters/${id}`) &&
      !className.includes('aspect-[3/')
    ) {
      resolvedVariant = 'splash';
    }
  }

  const src =
    resolvedVariant === 'icon'
      ? arts.icon || arts.card || IMAGES[id]
      : resolvedVariant === 'splash'
      ? arts.splash || arts.card || IMAGES[id]
      : arts.card || IMAGES[id];

  const pos = arts.transforms[resolvedVariant] ?? { x: 50, y: 15, scale: 100 };

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
          objectPosition: `${pos.x}% ${pos.y}%`,
          transformOrigin: `${pos.x}% ${pos.y}%`,
          transform:
            pos.scale && pos.scale !== 100
              ? `scale(${pos.scale / 100}) translateZ(0)`
              : 'translateZ(0)',
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