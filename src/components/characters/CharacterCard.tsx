// Карточка персонажа:
// На десктопе и планшете (sm+) — чистый вертикальный арт 3:5 без цветной дымки поверх + архитектурный инфо-блок снизу.
// На телефоне (<sm) — компактная мини-карточка (3 в ряд) с именем и стихией поверх нижнего затемнения.
import { Link } from 'react-router-dom';
import { Character } from '../../data/types';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { ELEMENTS, ELEMENT_THEME, WEAPON_LABELS, WEAPON_ICONS } from '../../utils/constants';
import { useSettings } from '../../hooks/useSettings';

export const CharacterCard = ({ character }: { character: Character }) => {
  const el = ELEMENTS[character.element];
  const elTheme = ELEMENT_THEME[character.element];
  const [settings] = useSettings();
  const showMeta = settings.showMetaBadge && character.metaRating.tower === 'S';
  const isFiveStar = character.rarity === 5;

  return (
    <Link
      to={`/characters/${character.id}`}
      className={`group relative block glass-panel overflow-hidden focus-ring transition-all duration-300 ease-out hover:-translate-y-1.5 ${elTheme.glow} ${elTheme.borderHover}`}
      aria-label={`Открыть страницу персонажа ${character.name}`}
    >
      {/* Вертикальный портрет 3:5 — чистый арт без цветной заливки */}
      <div className="relative aspect-[3/5] overflow-hidden bg-bg-secondary">
        <ImagePlaceholder
          id={character.id}
          initials={character.name.slice(0, 2)}
          element={character.element}
          className="w-full h-full object-top transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />

        {/* Тонкая полоска редкости по нижней кромке арта на десктопе */}
        <div
          className={`hidden sm:block absolute inset-x-0 bottom-0 h-[2px] ${
            isFiveStar
              ? 'bg-gradient-to-r from-transparent via-amber-300/80 to-transparent'
              : 'bg-gradient-to-r from-transparent via-purple-400/75 to-transparent'
          }`}
        />

        {/* Верхние бейджи */}
        {showMeta && (
          <span className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-1.5 sm:px-2.5 py-0.5 rounded-md bg-black/65 backdrop-blur-md border border-accent/50 text-accent-light text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase shadow-lg">
            Meta S
          </span>
        )}
        <span
          className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-[10px] sm:text-xs font-bold border shadow-lg ${
            isFiveStar
              ? 'text-amber-300 border-amber-400/40'
              : 'text-purple-300 border-purple-400/40'
          }`}
        >
          {'★'.repeat(character.rarity)}
        </span>

        {/* Мобильная подпись прямо на арте (чтобы помещалось 6+ персов на экране) */}
        <div className="sm:hidden absolute inset-x-0 bottom-0 p-1.5 pt-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
          <p className="text-[11px] font-bold text-ivory truncate leading-tight">
            {character.name}
          </p>
          <div className="flex items-center justify-between gap-1 text-[9px] text-gray-300 mt-0.5">
            <span className="flex items-center gap-1 truncate">
              <img src={el.icon} alt="" className="w-2.5 h-2.5 shrink-0" draggable={false} />
              <span className="truncate">{el.label}</span>
            </span>
            <img
              src={WEAPON_ICONS[character.weapon]}
              alt=""
              className="w-2.5 h-2.5 shrink-0 opacity-80"
              draggable={false}
            />
          </div>
        </div>
      </div>

      {/* Архитектурный инфо-блок: только с планшета и десктопа */}
      <div className="hidden sm:block p-3.5 bg-gradient-to-b from-bg-secondary/90 to-bg/95">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-ivory group-hover:text-accent-light transition-colors truncate">
            {character.name}
          </h3>
          <span className="w-6 h-6 rounded-lg bg-glass border border-glass-border flex items-center justify-center shrink-0">
            <img src={el.icon} alt={el.label} className="w-4 h-4" draggable={false} />
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {character.title && character.title !== '—' ? character.title : character.role}
        </p>
        <div className="flex items-center gap-1.5 mt-3 text-[11px] text-gray-300">
          <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${el.badge}`}>
            <img src={el.icon} alt="" className="w-3 h-3" draggable={false} />
            {el.label}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-glass border border-glass-border flex items-center gap-1 truncate">
            <img src={WEAPON_ICONS[character.weapon]} alt="" className="w-3 h-3 shrink-0" draggable={false} />
            <span className="truncate">{WEAPON_LABELS[character.weapon]}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};