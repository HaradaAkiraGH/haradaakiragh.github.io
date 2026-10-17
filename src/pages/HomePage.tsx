// Дашборд: баннер с таймером (2×2 на телефоне), персонаж дня, быстрые ссылки (2 колонки)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Dice5, ArrowRight, Users, Newspaper, Trophy, BookOpen, User } from 'lucide-react';
import { NEWS } from '../data/news';
import { CHARACTERS } from '../data/characters';
import { LORE } from '../data/lore';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { useNow, countdownParts } from '../utils/countdown';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PlayerProfile, Character } from '../data/types';
import { TIER_STYLES } from '../utils/constants';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const DEFAULT_PROFILE: PlayerProfile = { uid: '', nickname: 'Rover', unionLevel: 60, signature: '', roster: [] };

const TimeChip = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center px-2 sm:px-3 py-2 rounded-xl bg-bg-secondary/70 border border-glass-border">
    <span className="font-mono text-base sm:text-lg text-accent-light tabular-nums leading-none">{value}</span>
    <span className="text-[10px] text-gray-500 mt-1">{label}</span>
  </div>
);

export const HomePage = () => {
  useDocumentMeta({ title: 'Главная', description: 'Дашборд игрока: активные баннеры с таймером, персонаж дня, быстрые ссылки.' });
  const now = useNow();
  const [profile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [spin, setSpin] = useState<number | null>(null);
  const today = new Date(now);
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const spot: Character = CHARACTERS[spin ?? dayOfYear % CHARACTERS.length];
  const quote = LORE[spot.id]?.quotes[0];
  const banner = NEWS.find((n) => n.type === 'banner' && n.dateEnd && new Date(n.dateEnd).getTime() > now);
  const parts = banner?.dateEnd ? countdownParts(new Date(banner.dateEnd).getTime() - now) : null;
  const dateLabel = today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const quickLinks = [
    { to: '/characters', icon: Users, label: 'Персонажи', hint: `${CHARACTERS.length} в каталоге` },
    { to: '/profile', icon: User, label: 'Мой ростер', hint: `${profile.roster.length} персонажей` },
    { to: '/news', icon: Newspaper, label: 'Новости', hint: 'баннеры и патчи' },
    { to: '/meta', icon: Trophy, label: 'Мета', hint: 'тир-листы и команды' },
  ];
  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ivory">Сегодня в Соларис-3</h2>
          <p className="text-gray-400 mt-1 capitalize text-sm sm:text-base">{dateLabel}</p>
        </div>
        <Link to="/guides" className="flex items-center gap-2 text-sm text-accent-light hover:underline focus-ring rounded-lg">
          <BookOpen size={16} /> Гайды для новичков
        </Link>
      </div>
      <div className="grid lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Активный баннер с таймером */}
        <div className="lg:col-span-2 glass-panel p-4 sm:p-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/15 border border-accent/30 text-accent-light text-[10px] font-bold tracking-widest uppercase mb-3">
              <Flame size={12} /> Активный баннер
            </span>
            {banner && parts ? (
              <>
                <h3 className="text-xl sm:text-2xl font-bold text-ivory">{banner.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{banner.subtitle}</p>
                {/* 2×2 на телефоне, 4 в ряд с планшета */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 sm:mt-5">
                  <TimeChip value={parts.d} label="дней" />
                  <TimeChip value={parts.h} label="часов" />
                  <TimeChip value={parts.m} label="минут" />
                  <TimeChip value={parts.s} label="секунд" />
                </div>
                {banner.characters && (
                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                    {banner.characters.map((cid) => {
                      const c = CHARACTERS.find((x) => x.id === cid);
                      if (!c) return null;
                      return (
                        <Link key={cid} to={`/characters/${cid}`} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-glass border border-glass-border hover:border-accent/40 transition-colors focus-ring">
                          <ImagePlaceholder id={c.id} initials={c.name.slice(0, 2)} element={c.element} className="w-8 h-8 rounded-lg" />
                          <span className="text-sm text-ivory">{c.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-sm">Сейчас нет активных баннеров — время копить астриты.</p>
            )}
          </div>
        </div>
        {/* Персонаж дня */}
        <div className="glass-panel p-4 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Персонаж дня</span>
            <button
              onClick={() => setSpin(Math.floor(Math.random() * CHARACTERS.length))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-glass border border-glass-border text-xs text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring"
              aria-label="Показать случайного персонажа"
            >
              <Dice5 size={14} /> Крутануть
            </button>
          </div>
          <Link to={`/characters/${spot.id}`} className="flex items-center gap-3 sm:gap-4 group focus-ring rounded-xl">
            <ImagePlaceholder id={spot.id} initials={spot.name.slice(0, 2)} element={spot.element} className="w-16 sm:w-20 aspect-[3/4] rounded-xl border border-glass-border group-hover:border-accent/50 transition-colors shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-ivory text-base sm:text-lg group-hover:text-accent-light transition-colors truncate">{spot.name}</p>
              <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold mt-1 ${TIER_STYLES[spot.metaRating.tower]}`}>
                Башня: {spot.metaRating.tower}
              </span>
            </div>
          </Link>
          {quote && <p className="text-xs text-gray-500 italic mt-4 leading-relaxed">«{quote}»</p>}
        </div>
      </div>
      {/* Быстрые ссылки: 2 колонки на телефоне */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickLinks.map((q) => (
          <Link key={q.to} to={q.to} className="glass-panel-hover p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 group focus-ring">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent-light shrink-0">
              <q.icon size={18} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-semibold text-ivory truncate">{q.label}</span>
              <span className="block text-xs text-gray-500 truncate hidden sm:block">{q.hint}</span>
            </span>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-accent-light group-hover:translate-x-0.5 transition-all shrink-0 hidden sm:block" />
          </Link>
        ))}
      </div>
    </div>
  );
};