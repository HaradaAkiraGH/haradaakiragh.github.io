// Страница детального обзора персонажа (/characters/:id):
// Полноэкранный горизонтальный арт во весь баннер + информация и навыки в матовых стеклянных «облачках»
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Eye,
  EyeOff,
  Sliders,
} from 'lucide-react';
import { getCharacterById } from '../data/characters';
import { CharacterTabs } from '../components/characters/CharacterTabs';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import {
  ELEMENTS,
  WEAPON_LABELS,
  WEAPON_ICONS,
} from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { getCharacterResonanceChain } from '../utils/pullMatch';
import { PRYDWEN_CHAR_META, PRYDWEN_TAG_COLORS } from '../data/prydwenMeta';
import { initAdminRuntimeSync } from '../utils/adminStorage';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const ELEMENT_CLOUD_ACCENT: Record<
  string,
  { border: string; badgeBg: string; glow: string }
> = {
  Spectro: {
    border: 'border-amber-300/25',
    badgeBg: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
    glow: 'shadow-[0_20px_60px_rgba(251,191,36,0.18)]',
  },
  Havoc: {
    border: 'border-rose-400/25',
    badgeBg: 'bg-rose-500/20 text-rose-200 border-rose-400/40',
    glow: 'shadow-[0_20px_60px_rgba(244,63,94,0.2)]',
  },
  Fusion: {
    border: 'border-orange-400/25',
    badgeBg: 'bg-orange-500/20 text-orange-200 border-orange-400/40',
    glow: 'shadow-[0_20px_60px_rgba(249,115,22,0.2)]',
  },
  Glacio: {
    border: 'border-cyan-300/25',
    badgeBg: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
    glow: 'shadow-[0_20px_60px_rgba(56,189,248,0.2)]',
  },
  Electro: {
    border: 'border-purple-400/25',
    badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
    glow: 'shadow-[0_20px_60px_rgba(168,85,247,0.2)]',
  },
  Aero: {
    border: 'border-emerald-400/25',
    badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
    glow: 'shadow-[0_20px_60px_rgba(52,211,153,0.2)]',
  },
};

export const CharacterPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [, setSyncTick] = useState(0);
  const [hideUiOverlay, setHideUiOverlay] = useState(false);

  useEffect(() => {
    initAdminRuntimeSync().then(() => setSyncTick((t) => t + 1));
  }, [id]);

  const character = id ? getCharacterById(id) : undefined;

  useDocumentMeta({
    title: character
      ? `${character.name} — Билд, Эхо и Гайд · Stellar Wiki`
      : 'Персонаж — Stellar Wiki',
    description: character
      ? `Полный гайд и билд на ${character.name} (${character.element} / ${character.weapon}) в Wuthering Waves: лучшие наборы Эхо, оружие, навыки и команды.`
      : 'Страница резонатора Wuthering Waves.',
  });

  if (!character) {
    return (
      <div className="glass-panel p-12 text-center space-y-4">
        <p className="text-xl font-bold text-white">Резонатор не найден</p>
        <Link
          to="/characters"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/20 text-accent-light text-xs font-extrabold"
        >
          <ArrowLeft size={15} />
          <span>Вернуться к списку персонажей</span>
        </Link>
      </div>
    );
  }

  const charAny = character as any;
  const el = ELEMENTS[character.element];
  const cloudStyle =
    ELEMENT_CLOUD_ACCENT[character.element] ?? ELEMENT_CLOUD_ACCENT.Havoc;
  const prydwen = PRYDWEN_CHAR_META[character.id];
  const chain = getCharacterResonanceChain(character.id);

  const skillsList: any[] = Array.isArray(charAny.skills) ? charAny.skills : [];
  const skillItem =
    skillsList.find((s) => s.type === 'Skill') ?? skillsList[1];
  const libItem =
    skillsList.find((s) => s.type === 'Liberation') ?? skillsList[3];
  const forteItem =
    skillsList.find((s) => s.type === 'Forte') ?? skillsList[2];

  const towerTier = prydwen?.toa ?? character.metaRating?.tower ?? 'S';
  const wastesTier = prydwen?.wastes ?? character.metaRating?.realm ?? 'S';

  const customLore =
    typeof charAny.lore === 'string' && charAny.lore.trim().length > 10
      ? charAny.lore.trim()
      : '';
  const descriptionText =
    customLore ||
    `Резонатор элемента ${el.label}, сражающийся оружием «${WEAPON_LABELS[character.weapon]}». Роль в отряде — ${character.role}. ${
      character.strengths?.slice(0, 2).join('. ') ?? ''
    }`;

  return (
    <div className="space-y-6 pb-12 w-full animate-fade-in">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* Верхняя навигационная строка */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/characters"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-400 hover:text-ivory transition-colors focus-ring rounded-lg py-1"
        >
          <ArrowLeft size={16} />
          <span>К списку персонажей</span>
        </Link>

        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-accent-light transition-colors"
          >
            <Sliders size={13} />
            <span>Редактировать в Админке</span>
          </Link>
        )}
      </div>

      {/* ==================== ПАНОРАМНЫЙ БАННЕР С ГОРИЗОНТАЛЬНЫМ АРТОМ ВО ВСЁ ПОЛЕ ==================== */}
      <div className="relative rounded-[30px] overflow-hidden min-h-[440px] sm:min-h-[480px] bg-[#08090f] shadow-[0_30px_85px_rgba(0,0,0,0.9)] flex flex-col justify-end lg:justify-center p-5 sm:p-8 lg:p-10">
        {/* 1. Горизонтальный арт (variant="splash") растянут на ВСЮ карточку */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <ImagePlaceholder
            id={character.id}
            initials={character.name.slice(0, 2)}
            element={character.element}
            variant="splash"
            className="w-full h-full object-cover object-center transition-transform duration-700"
          />

          {/* Деликатный градиент справа под стеклянными облачками (левая часть с персонажем остаётся чистой) */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-black/25 to-[#07080e]/70 transition-opacity duration-300 ${
              hideUiOverlay ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#07080e]/80 via-transparent to-black/15 transition-opacity duration-300 ${
              hideUiOverlay ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>

        {/* Кнопка просмотра чистого горизонтального арта без текста */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHideUiOverlay((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#090b12]/75 hover:bg-[#090b12]/95 backdrop-blur-xl border border-white/15 text-xs font-extrabold text-ivory shadow-lg transition-all cursor-pointer"
            title={
              hideUiOverlay
                ? 'Показать информационные облачка'
                : 'Скрыть интерфейс и посмотреть чистый арт'
            }
          >
            {hideUiOverlay ? (
              <Eye size={14} className="text-accent-light" />
            ) : (
              <EyeOff size={14} className="text-gray-300" />
            )}
            <span>{hideUiOverlay ? 'Показать инфо' : 'Чистый арт'}</span>
          </button>
        </div>

        {/* 2. Стеклянные «облачка» с информацией и навыками поверх правой части баннера */}
        <div
          className={`relative z-20 grid grid-cols-1 lg:grid-cols-[1fr,470px,330px] gap-5 items-center transition-all duration-300 ${
            hideUiOverlay
              ? 'opacity-0 pointer-events-none translate-y-3'
              : 'opacity-100 translate-y-0'
          }`}
        >
          {/* Пустая левая зона, чтобы не перекрывать персонажа на горизонтальном арте */}
          <div className="hidden lg:block" />

          {/* ГЛАВНОЕ ОБЛАЧКО: Имя, редкость, описание и теги */}
          <div
            className={`rounded-[28px] bg-[#090b12]/78 backdrop-blur-2xl border ${cloudStyle.border} ${cloudStyle.glow} p-6 sm:p-7 space-y-4`}
          >
            {/* Верхние бейджи */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider border ${
                  character.rarity === 5
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                }`}
              >
                {'★'.repeat(character.rarity)}
              </span>

              <span className="px-3 py-1 rounded-xl bg-white/[0.08] border border-white/15 text-xs font-extrabold text-white">
                {character.role}
              </span>

              {typeof chain === 'number' && (
                <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-[#09090b] text-xs font-black shadow">
                  S{chain}
                </span>
              )}

              {prydwen?.tags?.map((tag) => (
                <span
                  key={tag}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider border ${
                    PRYDWEN_TAG_COLORS[tag] ??
                    'bg-white/10 text-gray-200 border-white/15'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Имя и титул */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {character.name}
              </h1>
              <p className="text-sm sm:text-base font-bold text-accent-light mt-1.5">
                {character.title}
              </p>
            </div>

            {/* Описание в читаемом контейнере */}
            <p className="text-xs sm:text-[13.5px] text-gray-100/95 leading-relaxed line-clamp-4">
              {descriptionText}
            </p>

            {/* Нижние пилюли: Стихия, Оружие, Тиры */}
            <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-white/10">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-extrabold ${cloudStyle.badgeBg}`}
              >
                <img
                  src={el.icon}
                  alt={el.label}
                  className="w-4 h-4"
                  draggable={false}
                />
                <span>{el.label}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 text-xs font-extrabold text-white">
                <img
                  src={WEAPON_ICONS[character.weapon]}
                  alt={WEAPON_LABELS[character.weapon]}
                  className="w-4 h-4"
                  draggable={false}
                />
                <span>{WEAPON_LABELS[character.weapon]}</span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 text-xs font-extrabold text-amber-200">
                Башня: {towerTier}
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 text-xs font-extrabold text-cyan-200">
                Wastes: {wastesTier}
              </span>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА ОБЛАЧКОВ: Ключевые навыки */}
          <div className="space-y-3">
            {skillItem && (
              <div
                className={`rounded-2xl bg-[#090b12]/78 backdrop-blur-2xl border ${cloudStyle.border} p-4 flex items-center gap-3.5 shadow-xl`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${cloudStyle.badgeBg}`}
                >
                  <img
                    src={el.icon}
                    alt=""
                    className="w-5 h-5"
                    draggable={false}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {skillItem.name}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-light mt-0.5">
                    RESONANCE SKILL
                  </p>
                </div>
              </div>
            )}

            {libItem && (
              <div
                className={`rounded-2xl bg-[#090b12]/78 backdrop-blur-2xl border ${cloudStyle.border} p-4 flex items-center gap-3.5 shadow-xl`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${cloudStyle.badgeBg}`}
                >
                  <Sparkles size={19} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {libItem.name}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-light mt-0.5">
                    RESONANCE LIBERATION
                  </p>
                </div>
              </div>
            )}

            {forteItem && (
              <div
                className={`rounded-2xl bg-[#090b12]/78 backdrop-blur-2xl border ${cloudStyle.border} p-4 flex items-center gap-3.5 shadow-xl`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${cloudStyle.badgeBg}`}
                >
                  <img
                    src={WEAPON_ICONS[character.weapon]}
                    alt=""
                    className="w-5 h-5"
                    draggable={false}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {forteItem.name}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent-light mt-0.5">
                    FORTE CIRCUIT
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Вкладки детального гайда, билда, ротаций и материалов */}
      <CharacterTabs character={character} />
    </div>
  );
};

export default CharacterPage;