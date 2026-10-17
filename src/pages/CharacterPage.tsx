// Страница персонажа: hero в цвете персонажа, амбиент-фон, пружинные табы.
// Мобильная версия: компактнее паддинги, скиллы в столбик, вкладки-карусель со snap.
// min-w-0/max-w-full защищают от распирания страницы широкими nowrap-лентами.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, TrendingUp, Wrench, Users, Hammer } from 'lucide-react';
import { getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { ELEMENTS, WEAPON_LABELS, WEAPON_ICONS, TIER_STYLES, CHARACTER_THEME, DEFAULT_THEME } from '../utils/constants';
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
        <Link to="/characters" className="text-accent-light underline">К списку персонажей</Link>
      </div>
    );
  }
  const theme = CHARACTER_THEME[char.id] ?? DEFAULT_THEME;
  const isMeta = char.metaRating.tower === 'S';
  return (
    <div className="relative min-w-0">
      {/* Амбиент-фон: на телефоне ниже и мягче */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-10 -top-10 h-[420px] md:h-[620px]">
        <div className={`absolute -top-24 right-0 w-[540px] h-[540px] rounded-full blur-[140px] ${theme.spot}`} />
        <div className={`absolute top-48 left-1/4 w-[380px] h-[380px] rounded-full blur-[120px] ${theme.spot} opacity-60`} />
      </div>
      <div className="relative space-y-4 md:space-y-6 min-w-0">
        <Link to="/characters" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors focus-ring rounded-lg">
          <ArrowLeft size={18} /> К списку персонажей
        </Link>
        {/* HERO */}
        <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br ${theme.heroGradient}`}>
          <div className="absolute inset-y-0 left-0 w-[46%] max-w-[430px] hidden md:block">
            <ImagePlaceholder id={char.id} initials={char.name.slice(0, 2)} element={char.element} className="w-full h-full object-top" />
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${theme.heroFade}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
          <div className="relative p-4 sm:p-6 md:p-10 md:pl-[46%]">
            <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr,300px] items-start min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  {isMeta && (
                    <span className="px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur border border-white/20 text-[10px] font-bold tracking-widest uppercase text-white">
                      Meta S
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-md bg-black/30 backdrop-blur border border-yellow-400/40 text-yellow-300 text-xs font-bold">{'★'.repeat(char.rarity)}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight break-words">{char.name}</h1>
                <p className="text-white/80 text-base md:text-lg mt-1">{char.title}</p>
                <p className="text-white/70 text-sm mt-3 md:mt-4 max-w-xl leading-relaxed">
                  Резонатор элемента {el.label}. Роль в команде: {char.role}. {char.strengths[0] ?? ''}
                </p>
                <div className="flex flex-wrap gap-2 mt-4 md:mt-5">
                  <span className="px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur border border-white/20 text-sm text-white flex items-center gap-1.5">
                    <img src={el.icon} alt="" className="w-4 h-4" draggable={false} /> {el.label}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-black/30 backdrop-blur border border-white/20 text-sm text-white flex items-center gap-1.5">
                    <img src={WEAPON_ICONS[char.weapon]} alt="" className="w-4 h-4" draggable={false} /> {WEAPON_LABELS[char.weapon]}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${TIER_STYLES[char.metaRating.tower]}`}>Башня: {char.metaRating.tower}</span>
                  <span className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${TIER_STYLES[char.metaRating.realm]}`}>Wastes: {char.metaRating.realm}</span>
                </div>
              </div>
              {/* Карточки скиллов: на телефоне в столбик, на планшете в ряд, на десктопе снова в столбик */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-0">
                <div className={`flex-1 lg:flex-none min-w-0 rounded-2xl border p-4 flex items-center gap-4 backdrop-blur transition-colors ${theme.skillCard}`}>
                  <span className={`w-11 h-11 md:w-12 md:h-12 rounded-xl border flex items-center justify-center shrink-0 ${theme.medallion}`} aria-hidden="true">
                    <img src={el.icon} alt="" className="w-6 h-6" draggable={false} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white leading-tight break-words">{theme.skills.resonance}</p>
                    <p className="text-xs text-white/70 mt-0.5">(Resonance Skill)</p>
                  </div>
                </div>
                <div className={`flex-1 lg:flex-none min-w-0 rounded-2xl border p-4 flex items-center gap-4 backdrop-blur transition-colors ${theme.skillCard}`}>
                  <span className={`w-11 h-11 md:w-12 md:h-12 rounded-xl border flex items-center justify-center shrink-0 ${theme.medallion}`} aria-hidden="true">
                    <Hammer size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-white leading-tight break-words">{theme.skills.liberation}</p>
                    <p className="text-xs text-white/70 mt-0.5">(Resonance Liberation)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Табы + контент: на телефоне табы — карусель со snap */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 min-w-0">
          <div className="md:w-64 shrink-0 min-w-0 max-w-full">
            <div
              className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory md:snap-none md:flex-col md:overflow-visible pb-1 md:pb-0 max-w-full"
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
                    <Icon size={18} className="relative z-10" />
                    <span className="relative z-10 font-medium text-sm">{tab.label}</span>
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
                className="glass-panel p-4 sm:p-5 md:p-6 min-w-0"
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