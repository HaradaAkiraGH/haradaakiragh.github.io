// Дашборд «Сегодня в Соларис-3»: тактический командный центр, баннер с таймером,
// резонатор дня (выбирается из проработанных персонажей с лором) и быстрые модули
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame, Dice5, ArrowRight, Users, Newspaper, Trophy, BookOpen, User,
  Skull, Calculator, Sparkles, Compass,
} from 'lucide-react';
import { NEWS } from '../data/news';
import { CHARACTERS } from '../data/characters';
import { LORE } from '../data/lore';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useNow, countdownParts } from '../utils/countdown';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PlayerProfile, Character } from '../data/types';
import { ELEMENTS, TIER_STYLES, WEAPON_ICONS, WEAPON_LABELS } from '../utils/constants';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '',
  nickname: 'Rover',
  unionLevel: 60,
  signature: '',
  roster: [],
};

// Для витрины «Персонаж дня» берём персонажей с заполненным титулом, чтобы карточка всегда выглядела богато
const FEATURED_POOL = CHARACTERS.filter((c) => c.title && c.title !== '—');

const TimeChip = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center justify-center px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 backdrop-blur-md shadow-inner">
    <span className="font-mono text-lg sm:text-2xl font-extrabold text-accent-light tabular-nums leading-none tracking-tight">
      {value}
    </span>
    <span className="text-[10px] uppercase tracking-widest text-gray-400 mt-1.5">{label}</span>
  </div>
);

export const HomePage = () => {
  useDocumentMeta({
    title: 'Главная',
    description: 'Дашборд игрока: активные баннеры с таймером, персонаж дня, быстрые ссылки.',
  });
  const now = useNow();
  const [profile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [spin, setSpin] = useState<number | null>(null);

  const today = new Date(now);
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const pool = FEATURED_POOL.length > 0 ? FEATURED_POOL : CHARACTERS;
  const spot: Character = pool[spin ?? dayOfYear % pool.length];
  const spotEl = ELEMENTS[spot.element];
  const quote =
    LORE[spot.id]?.quotes[0] ??
    spot.strengths[0] ??
    'Резонатор Соларис-3, готовый к бою в любом режиме.';

  const banner = NEWS.find(
    (n) => n.type === 'banner' && n.dateEnd && new Date(n.dateEnd).getTime() > now,
  );
  const parts = banner?.dateEnd
    ? countdownParts(new Date(banner.dateEnd).getTime() - now)
    : null;
  const dateLabel = today.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const quickLinks = [
    { to: '/characters', icon: Users, label: 'Персонажи', hint: `${CHARACTERS.length} в базе` },
    { to: '/bestiary', icon: Skull, label: 'Бестиарий', hint: 'оружие, эхо и враги' },
    { to: '/pulls', icon: Dice5, label: 'Pull Tracker', hint: 'история круток и pity' },
    { to: '/meta', icon: Trophy, label: 'Мета-тирлист', hint: 'Башня и Wastes' },
    { to: '/calculator', icon: Calculator, label: 'Калькулятор', hint: 'расчёт DPS билда' },
    { to: '/profile', icon: User, label: 'Мой ростер', hint: `${profile.roster.length} в коллекции` },
    { to: '/news', icon: Newspaper, label: 'Новости', hint: 'патчи и события' },
    { to: '/guides', icon: BookOpen, label: 'Гайды', hint: 'база знаний' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Верхняя панель статуса */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-accent-light mb-1">
            <Compass size={12} /> Терминал Соларис-3 · Онлайн
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-ivory tracking-tight">
            Сегодня в Соларис-3
          </h2>
          <p className="text-gray-400 mt-0.5 capitalize text-xs sm:text-sm">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/pulls"
            className="px-3.5 py-2 rounded-xl bg-glass border border-glass-border hover:border-accent/40 text-xs font-semibold text-ivory flex items-center gap-1.5 transition-colors focus-ring"
          >
            <Dice5 size={14} className="text-accent-light" /> Проверить Pity
          </Link>
          <Link
            to="/guides"
            className="px-3.5 py-2 rounded-xl bg-accent/15 border border-accent/35 hover:bg-accent/25 text-xs font-semibold text-accent-light flex items-center gap-1.5 transition-colors focus-ring"
          >
            <BookOpen size={14} /> Гайды
          </Link>
        </div>
      </div>

      {/* Главный ряд: Активный баннер + Резонатор дня */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Карточка активного баннера */}
        <div className="lg:col-span-2 glass-panel solaris-crest p-5 sm:p-7 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/35 text-accent-light text-[10px] font-bold tracking-widest uppercase">
                <Flame size={12} /> Активное соглашение
              </span>
              <span className="text-[11px] font-mono text-gray-400">Патч 3.5</span>
            </div>

            {banner && parts ? (
              <>
                <h3 className="text-xl sm:text-3xl font-extrabold text-ivory tracking-tight">
                  {banner.title}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl">{banner.subtitle}</p>

                {/* Таймер 2×2 на телефоне, 4 колонки с планшета */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                  <TimeChip value={parts.d} label="дней" />
                  <TimeChip value={parts.h} label="часов" />
                  <TimeChip value={parts.m} label="минут" />
                  <TimeChip value={parts.s} label="секунд" />
                </div>

                {banner.characters && (
                  <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-glass-border">
                    <span className="text-xs text-gray-400 mr-1">Повышенный шанс:</span>
                    {banner.characters.map((cid) => {
                      const c = CHARACTERS.find((x) => x.id === cid);
                      if (!c) return null;
                      const cEl = ELEMENTS[c.element];
                      return (
                        <Link
                          key={cid}
                          to={`/characters/${cid}`}
                          className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-accent/50 transition-all focus-ring group"
                        >
                          <ImagePlaceholder
                            id={c.id}
                            initials={c.name.slice(0, 2)}
                            element={c.element}
                            className="w-9 h-10 rounded-lg object-top border border-white/10"
                          />
                          <div>
                            <span className="block text-sm font-bold text-ivory group-hover:text-accent-light transition-colors leading-tight">
                              {c.name}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                              <img src={cEl.icon} alt="" className="w-3 h-3" draggable={false} />
                              {cEl.label} · 5★
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-sm py-8">
                Сейчас нет активных баннеров — самое время копить астриты и готовить эхо-сеты.
              </p>
            )}
          </div>
        </div>

        {/* Резонатор дня */}
        <div className="glass-panel solaris-crest p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-accent-light">
              <Sparkles size={12} /> Резонатор дня
            </span>
            <button
              onClick={() => setSpin(Math.floor(Math.random() * pool.length))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-glass border border-glass-border text-xs text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring"
              aria-label="Показать случайного персонажа"
            >
              <Dice5 size={14} className="text-accent-light" /> Сменить
            </button>
          </div>

          <Link
            to={`/characters/${spot.id}`}
            className="flex items-center gap-4 group focus-ring rounded-xl p-2 -mx-2 hover:bg-glass-hover transition-colors"
          >
            <ImagePlaceholder
              id={spot.id}
              initials={spot.name.slice(0, 2)}
              element={spot.element}
              className="w-20 sm:w-24 aspect-[3/4] rounded-xl border border-glass-border group-hover:border-accent/50 transition-colors shrink-0 object-top shadow-lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-amber-300 font-bold">
                  {'★'.repeat(spot.rarity)}
                </span>
                {spot.metaRating.tower !== '-' && (
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-extrabold ${
                      TIER_STYLES[spot.metaRating.tower]
                    }`}
                  >
                    Tier {spot.metaRating.tower}
                  </span>
                )}
              </div>
              <p className="font-extrabold text-ivory text-lg sm:text-xl group-hover:text-accent-light transition-colors truncate mt-1">
                {spot.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{spot.title}</p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-300">
                <span className="inline-flex items-center gap-1">
                  <img src={spotEl.icon} alt="" className="w-3.5 h-3.5" draggable={false} />
                  {spotEl.label}
                </span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <img src={WEAPON_ICONS[spot.weapon]} alt="" className="w-3.5 h-3.5" draggable={false} />
                  {WEAPON_LABELS[spot.weapon]}
                </span>
              </div>
            </div>
          </Link>

          <blockquote className="text-xs text-gray-400 italic mt-3 pt-3 border-t border-glass-border leading-relaxed line-clamp-2">
            «{quote}»
          </blockquote>
        </div>
      </div>

      {/* Быстрые модули (2 колонки на телефоне, 4 на десктопе) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {quickLinks.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="glass-panel-hover p-3.5 sm:p-4 flex items-center gap-3 group focus-ring"
          >
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/25 via-accent/10 to-transparent border border-accent/30 flex items-center justify-center text-accent-light shrink-0 group-hover:scale-105 transition-transform">
              <q.icon size={18} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-ivory group-hover:text-accent-light transition-colors truncate">
                {q.label}
              </span>
              <span className="block text-xs text-gray-500 truncate hidden sm:block">
                {q.hint}
              </span>
            </span>
            <ArrowRight
              size={15}
              className="text-gray-600 group-hover:text-accent-light group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block"
            />
          </Link>
        ))}
      </div>
    </div>
  );
};