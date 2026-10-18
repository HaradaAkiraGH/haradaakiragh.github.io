// Страница персонажа: hero в цвете персонажа (getCharacterTheme), амбиент-фон, пружинные табы.
// Мобильная версия: компактнее паддинги, скиллы в столбик, вкладки-карусель со snap.
// min-w-0/max-w-full защищают от распирания страницы широкими nowrap-лентами.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, TrendingUp, Wrench, Users, Hammer, Sparkles } from 'lucide-react';
import { getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { ELEMENTS, WEAPON_LABELS, WEAPON_ICONS, TIER_STYLES, getCharacterTheme } from '../utils/constants';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { InfoTab, MetaTab, BuildTab, TeamsTab, ProgressTab } from '../components/characters/CharacterTabs';

const TABS = [
  { id: 'info', label: 'Инфо', icon: Info },
  { id: 'meta', label: 'Мета', icon: TrendingUp },
  { id: 'build', label: 'Билд', icon: Wrench },
  { id: 'teams', label: 'Команды', icon: Users },
  { id: 'progress', label: 'Прокачка', icon: Hammer },
];

export const CharacterPage = () => {
  const { id } = useParams<{ id: string }>();
  const char = getCharacterById(id || '');
  const [activeTab, setActiveTab] = useState('info');
  const el = char ? ELEMENTS[char.element] : ELEMENTS.Spectro;

  useDocumentMeta(
    char
      ? {
          title: char.name,
          description: `${char.name} — ${char.title}. ${char.role}, элемент ${el.label}. Тиры: Башня ${char.metaRating.tower}, Whimpering Wastes ${char.metaRating.realm}. Билды, команды, прокачка и лор.`,
          path: `/characters/${char.id}`,
        }
      : { title: 'Персонаж не найден' },
  );

  if (!char) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 mb-4">Персонаж не найден</p>
        <Link to="/characters" className="text-accent-light underline">
          К списку персонажей
        </Link>
      </div>
    );
  }

  const theme = getCharacterTheme(char);
  const isMeta = char.metaRating.tower === 'S';

  return (
    <div className="relative min-w-0">
      {/* Амбиент-фон в цвете персонажа */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -top-10 h-[420px] md:h-[620px]"
      >
        <div
          className={`absolute -top-24 right-0 w-[540px] h-[540px] rounded-full blur-[140px] ${theme.spot}`}
        />
        <div
          className={`absolute top-48 left-1/4 w-[380px] h-[380px] rounded-full blur-[120px] ${theme.spot} opacity-60`}
        />
      </div>

      <div className="relative space-y-4 md:space-y-6 min-w-0">
        <Link
          to="/characters"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-ivory text-sm font-medium transition-colors focus-ring rounded-lg"
        >
          <ArrowLeft size={17} /> К списку персонажей
        </Link>

        {/* HERO БАННЕР */}
        <div
          className={`relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/15 bg-gradient-to-br shadow-glass ${theme.heroGradient}`}
        >
          {/* Портрет слева на десктопе */}
          <div className="absolute inset-y-0 left-0 w-[46%] max-w-[440px] hidden md:block">
            <ImagePlaceholder
              id={char.id}
              initials={char.name.slice(0, 2)}
              element={char.element}
              className="w-full h-full object-top"
            />
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${theme.heroFade}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
          </div>

          <div className="relative p-4 sm:p-6 md:p-10 md:pl-[46%]">
            <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr,300px] items-start min-w-0">
              <div className="min-w-0">
                {/* Мобильная мини-шапка с портретом */}
                <div className="flex items-center gap-3.5 md:block mb-3">
                  <ImagePlaceholder
                    id={char.id}
                    initials={char.name.slice(0, 2)}
                    element={char.element}
                    className="w-16 h-20 rounded-xl border border-white/20 object-top shrink-0 md:hidden shadow-lg"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {isMeta && (
                        <span className="px-2.5 py-0.5 rounded-md bg-black/45 backdrop-blur-md border border-white/20 text-[10px] font-extrabold tracking-widest uppercase text-amber-200">
                          Meta S
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-black/45 backdrop-blur-md border border-yellow-400/40 text-yellow-300 text-xs font-bold">
                        {'★'.repeat(char.rarity)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-black/45 backdrop-blur-md border border-white/15 text-xs font-semibold text-white/90">
                        {char.role}
                      </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight break-words tracking-tight">
                      {char.name}
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base md:text-lg mt-0.5">
                      {char.title && char.title !== '—'
                        ? char.title
                        : `Резонатор стихии ${el.label}`}
                    </p>
                  </div>
                </div>

                <p className="text-white/75 text-sm mt-3 md:mt-4 max-w-xl leading-relaxed">
                  Резонатор элемента {el.label}, сражающийся оружием «{WEAPON_LABELS[char.weapon]}». Роль в отряде — {char.role}.{' '}
                  {char.strengths[0] ? `${char.strengths[0]}.` : ''}
                </p>

                <div className="flex flex-wrap gap-2 mt-4 md:mt-5">
                  <span className="chip-glass">
                    <img src={el.icon} alt="" className="w-4 h-4" draggable={false} /> {el.label}
                  </span>
                  <span className="chip-glass">
                    <img
                      src={WEAPON_ICONS[char.weapon]}
                      alt=""
                      className="w-4 h-4"
                      draggable={false}
                    />{' '}
                    {WEAPON_LABELS[char.weapon]}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg border text-xs font-bold ${
                      TIER_STYLES[char.metaRating.tower]
                    }`}
                  >
                    Башня: {char.metaRating.tower}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg border text-xs font-bold ${
                      TIER_STYLES[char.metaRating.realm]
                    }`}
                  >
                    Wastes: {char.metaRating.realm}
                  </span>
                </div>
              </div>

              {/* Карточки ключевых навыков */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-0">
                <div
                  className={`flex-1 lg:flex-none min-w-0 rounded-2xl border p-3.5 sm:p-4 flex items-center gap-3.5 backdrop-blur-md transition-colors ${theme.skillCard}`}
                >
                  <span
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-xl border flex items-center justify-center shrink-0 ${theme.medallion}`}
                    aria-hidden="true"
                  >
                    <img src={el.icon} alt="" className="w-6 h-6" draggable={false} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white leading-tight break-words text-sm sm:text-base">
                      {theme.skills.resonance}
                    </p>
                    <p className="text-[11px] text-white/70 mt-0.5 uppercase tracking-wider">
                      Resonance Skill
                    </p>
                  </div>
                </div>
                <div
                  className={`flex-1 lg:flex-none min-w-0 rounded-2xl border p-3.5 sm:p-4 flex items-center gap-3.5 backdrop-blur-md transition-colors ${theme.skillCard}`}
                >
                  <span
                    className={`w-11 h-11 md:w-12 md:h-12 rounded-xl border flex items-center justify-center shrink-0 text-white ${theme.medallion}`}
                    aria-hidden="true"
                  >
                    <Sparkles size={21} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white leading-tight break-words text-sm sm:text-base">
                      {theme.skills.liberation}
                    </p>
                    <p className="text-[11px] text-white/70 mt-0.5 uppercase tracking-wider">
                      Resonance Liberation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Вкладки слева (без дубля постера!) + Контент справа */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-w-0">
          <div className="md:w-60 shrink-0 min-w-0 max-w-full">
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory md:snap-none md:flex-col md:overflow-visible pb-1 md:pb-0 max-w-full glass-panel p-2"
              role="tablist"
              aria-label="Категории информации"
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl whitespace-nowrap shrink-0 md:shrink md:w-full border border-transparent transition-colors focus-ring snap-start ${
                      isActive ? 'text-white' : 'text-gray-400 hover:bg-glass-hover hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="tab-pill"
                        className={`absolute inset-0 rounded-xl border ${theme.tabActive}`}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <Icon size={18} className="relative z-10 shrink-0" />
                    <span className="relative z-10 font-semibold text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0 max-w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="glass-panel solaris-crest p-4 sm:p-6 min-w-0"
              >
                {activeTab === 'info' && <InfoTab char={char} />}
                {activeTab === 'meta' && <MetaTab char={char} />}
                {activeTab === 'build' && <BuildTab char={char} />}
                {activeTab === 'teams' && <TeamsTab char={char} />}
                {activeTab === 'progress' && <ProgressTab char={char} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};