// Карточка персонажа в каталоге:
// Выводит актуальный тир T0 / T0.5 / T1... и применяет сохранённое позиционирование картинки
import { Link } from 'react-router-dom';
import { Character } from '../../data/types';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';
import {
  ELEMENTS,
  WEAPON_LABELS,
  WEAPON_ICONS,
  ELEMENT_THEME,
} from '../../utils/constants';
import { getCharacterResonanceChain } from '../../utils/pullMatch';
import { PRYDWEN_CHAR_META } from '../../data/prydwenMeta';

export const CharacterCard = ({ character }: { character: Character }) => {
  const el = ELEMENTS[character.element];
  const theme = ELEMENT_THEME[character.element];
  const chain = getCharacterResonanceChain(character.id);
  const prydwen = PRYDWEN_CHAR_META[character.id];
  const charAny = character as any;
  const displayTier =
    charAny.prydwenMeta?.toa ||
    prydwen?.toa ||
    (character.metaRating?.tower !== '-' ? character.metaRating?.tower : null);

  return (
    <Link
      to={`/characters/${character.id}`}
      className={`group relative block rounded-2xl overflow-hidden bg-[#0c0e15] shadow-[0_18px_42px_rgba(0,0,0,0.75)] transition-all duration-300 hover:-translate-y-1.5 focus-ring ${theme.glow}`}
      aria-label={`Открыть страницу персонажа ${character.name}`}
    >
      <div className="relative aspect-[3/4.5] overflow-hidden bg-[#0e1018]">
        <ImagePlaceholder
          id={character.id}
          initials={character.name.slice(0, 2)}
          element={character.element}
          variant="card"
          className="w-full h-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03]"
        />

        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5 z-10">
          <div className="flex items-center gap-1.5">
            <span
              title={el.label}
              className="w-8 h-8 rounded-xl bg-black/70 backdrop-blur-md flex items-center justify-center shadow-md"
            >
              <img
                src={el.icon}
                alt={el.label}
                className="w-4 h-4 object-contain"
                draggable={false}
              />
            </span>

            {typeof chain === 'number' && (
              <span
                title={`Выбито в крутках: S${chain}`}
                className="px-2 py-1 rounded-lg bg-amber-400 text-[#09090b] text-[10px] font-black shadow"
              >
                S{chain}
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-0.5 rounded-lg backdrop-blur-md text-[11px] font-black ${
                character.rarity === 5
                  ? 'bg-black/70 text-amber-300'
                  : 'bg-black/70 text-purple-300'
              }`}
            >
              {'★'.repeat(character.rarity)}
            </span>

            {displayTier && (
              <span className="px-2 py-0.5 rounded-md bg-black/75 border border-amber-400/35 text-amber-200 text-[10px] font-black backdrop-blur-md">
                {displayTier}
              </span>
            )}
          </div>
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t ${theme.gradient} pointer-events-none opacity-75`}
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0c0e15] via-[#0c0e15]/75 to-transparent pointer-events-none" />
      </div>

      <div className="p-3.5 bg-[#0c0e15] relative z-10">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-extrabold text-base text-white group-hover:text-accent-light transition-colors truncate">
            {character.name}
          </h3>
          <img
            src={WEAPON_ICONS[character.weapon]}
            alt={WEAPON_LABELS[character.weapon]}
            title={WEAPON_LABELS[character.weapon]}
            className="w-4 h-4 opacity-80 group-hover:opacity-100 shrink-0"
            draggable={false}
          />
        </div>

        <p className="text-xs text-gray-400 mt-0.5 truncate">{character.title}</p>

        <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-white/[0.05] text-[11px]">
          <span className={`font-bold ${el.color}`}>{el.label}</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-300 font-medium truncate">{character.role}</span>
        </div>
      </div>
    </Link>
  );
};