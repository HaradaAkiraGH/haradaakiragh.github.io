// Чистая карточка: арт сверху, инфо-блок снизу; официальные иконки элемента и оружия
import { Link } from 'react-router-dom';
import { Character } from '../../data/types';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import { ELEMENTS, WEAPON_LABELS, WEAPON_ICONS } from '../../utils/constants';
import { useSettings } from '../../hooks/useSettings';

export const CharacterCard = ({ character }: { character: Character }) => {
  const el = ELEMENTS[character.element];
  const [settings] = useSettings();
  const showMeta = settings.showMetaBadge && character.metaRating.tower === 'S';

  return (
    <Link
      to={`/characters/${character.id}`}
      className="group block glass-panel-hover overflow-hidden focus-ring"
      aria-label={`Открыть страницу персонажа ${character.name}`}
    >
      <div className="relative aspect-[3/5] overflow-hidden">
        <ImagePlaceholder
          id={character.id}
          initials={character.name.slice(0, 2)}
          element={character.element}
          className="w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        {showMeta && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur border border-accent/40 text-accent-light text-[10px] font-bold tracking-widest uppercase">
            Meta S
          </span>
        )}
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur text-yellow-400 text-xs font-bold border border-yellow-400/30">
          {'★'.repeat(character.rarity)}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-ivory group-hover:text-accent-light transition-colors">
            {character.name}
          </h3>
          <img src={el.icon} alt={el.label} className="w-5 h-5" draggable={false} />
        </div>
        <p className="text-xs text-gray-400 mt-1 truncate">{character.title}</p>
        <div className="flex gap-2 mt-3 text-[11px] text-gray-300">
          <span className="px-2 py-1 rounded bg-glass border border-glass-border flex items-center gap-1.5">
            <img src={el.icon} alt="" className="w-3.5 h-3.5" draggable={false} />
            {el.label}
          </span>
          <span className="px-2 py-1 rounded bg-glass border border-glass-border flex items-center gap-1.5">
            <img src={WEAPON_ICONS[character.weapon]} alt="" className="w-3.5 h-3.5" draggable={false} />
            {WEAPON_LABELS[character.weapon]}
          </span>
        </div>
      </div>
    </Link>
  );
};