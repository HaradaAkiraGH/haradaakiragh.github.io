// Мобильный таб-бар: 4 вкладки + «Ещё» со шторкой доп. разделов
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  House, Users, Map, Trophy, User, MoreHorizontal,
  Newspaper, BookOpen, Settings as SettingsIcon, X, Calculator, Dice5, Skull,
} from 'lucide-react';
import { MOBILE_NAV_ITEMS, MORE_ITEMS } from '../../utils/constants';

const ICONS: Record<string, any> = {
  home: House, users: Users, map: Map, trophy: Trophy, user: User, more: MoreHorizontal,
  news: Newspaper, guides: BookOpen, settings: SettingsIcon, calculator: Calculator,
  dice: Dice5, bestiary: Skull,
};

const MORE_PATHS = MORE_ITEMS.map((m) => m.path);

export const MobileNav = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-secondary/90 backdrop-blur-xl border-t border-glass-border z-50 flex items-stretch justify-around px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon] ?? House;
          const isMore = item.id === 'more';
          if (isMore) {
            const active = MORE_PATHS.some((p) => window.location.pathname.startsWith(p));
            return (
              <button
                key={item.id}
                onClick={() => setSheetOpen(true)}
                className={`relative flex flex-col items-center justify-center gap-1 w-full rounded-lg transition-colors focus-ring ${
                  active ? 'text-accent-light' : 'text-gray-500'
                }`}
                aria-label="Ещё разделы"
              >
                <Icon size={21} />
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
                {active && (
                  <motion.span layoutId="mobile-dot" className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-light shadow-glow-sm" />
                )}
              </button>
            );
          }
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 w-full rounded-lg transition-colors focus-ring ${
                  isActive ? 'text-accent-light' : 'text-gray-500'
                }`
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                  {isActive && (
                    <motion.span layoutId="mobile-dot" className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-light shadow-glow-sm" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={() => setSheetOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-bg-secondary/95 backdrop-blur-2xl border-t border-glass-border p-4 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ivory">Ещё разделы</h3>
              <button onClick={() => setSheetOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-ivory focus-ring" aria-label="Закрыть">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1">
              {MORE_ITEMS.map((item) => {
                const Icon = ICONS[item.icon] ?? House;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={() => setSheetOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors focus-ring ${
                        isActive ? 'bg-accent/15 text-ivory border border-accent/30' : 'text-gray-300 hover:bg-glass-hover'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};