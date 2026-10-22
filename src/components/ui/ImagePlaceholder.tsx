// Умная отрисовка портретов персонажей с поддержкой 3 форматов:
// - 'card'   (Скрин 1): Большая вертикальная карточка для каталога
// - 'icon'   (Скрин 2): Маленькая квадратная иконка для Меты, круток и мини-слотов
// - 'splash' (Скрин 3): Горизонтальный арт для внутренней страницы персонажа
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

// Регулярка для автоопределения мини-слотов (Мета, Крутки, Поиск, Калькулятор, Отряды)
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

  // Определяем нужный формат картинки (явно переданный или по контексту)
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