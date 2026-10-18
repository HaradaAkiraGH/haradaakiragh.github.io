// Плавающий стеклянный сайдбар: сворачивание в рельсу, выход через контекст auth,
// пункт «Админка» только для роли admin
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  House, Users, Map, Trophy, Newspaper, BookOpen, Settings as SettingsIcon,
  Search, LogOut, Calculator, Dice5, Skull, ShieldCheck, Compass,
} from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PlayerProfile } from '../../data/types';
import { useAuth } from '../../hooks/useAuth';

const ICONS: Record<string, any> = {
  home: House,
  users: Users,
  map: Map,
  trophy: Trophy,
  news: Newspaper,
  guides: BookOpen,
  settings: SettingsIcon,
  calculator: Calculator,
  dice: Dice5,
  bestiary: Skull,
};

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '100000000',
  nickname: 'Rover',
  unionLevel: 60,
  signature: '',
  roster: [],
};

const SPRING = { type: 'spring', bounce: 0.22, duration: 0.5 } as const;

interface Props {
  onOpenSearch: () => void;
  collapsed: boolean;
}

export const Sidebar = ({ onOpenSearch, collapsed }: Props) => {
  const [profile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.nickname || profile.nickname || 'Rover';

  return (
    <aside
      className={`hidden md:flex flex-col fixed left-4 top-4 bottom-4 rounded-2xl border border-glass-border bg-bg-secondary/75 backdrop-blur-2xl shadow-glass z-40 overflow-hidden transition-[width] duration-300 ease-in-out solaris-crest ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Брендовая шапка */}
      <Link
        to="/home"
        className={`px-4 lg:px-5 pt-5 pb-4 border-b border-glass-border focus-ring flex items-center overflow-hidden group ${
          collapsed ? 'justify-center' : 'justify-start gap-3'
        }`}
      >
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/30 via-accent/15 to-transparent border border-accent/40 flex items-center justify-center text-accent-light shadow-glow-sm shrink-0 group-hover:scale-105 transition-transform">
          <Compass size={18} />
        </span>
        <div
          className={`min-w-0 whitespace-nowrap transition-all duration-200 ${
            collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100 delay-100'
          }`}
        >
          <span className="block text-lg font-extrabold text-gradient tracking-tight leading-none">
            Stellar Wiki
          </span>
          <span className="block text-[10px] uppercase tracking-[0.22em] text-gray-500 mt-1">
            Solaris-3 Archive
          </span>
        </div>
      </Link>

      {/* Кнопка глобального поиска */}
      <button
        onClick={onOpenSearch}
        className={`mx-3 lg:mx-4 mt-4 flex items-center px-3 lg:px-3.5 py-2.5 rounded-xl bg-bg/60 border border-glass-border text-gray-400 hover:text-ivory hover:border-accent/50 hover:shadow-glow-sm transition-all focus-ring ${
          collapsed ? 'justify-center' : 'justify-start'
        }`}
        aria-label="Открыть поиск (Ctrl+K)"
      >
        <Search size={17} className="shrink-0 text-accent-light/80" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-xs font-medium ml-2.5 whitespace-nowrap">
              Поиск по базе...
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-bg-secondary border border-glass-border rounded text-gray-400 whitespace-nowrap">
              Ctrl K
            </kbd>
          </>
        )}
      </button>

      <p
        className={`pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.24em] text-gray-500 transition-all duration-200 ${
          collapsed ? 'text-center px-1' : 'px-6 text-left'
        }`}
      >
        НАВИГАЦИЯ
      </p>

      {/* Список разделов */}
      <nav className="flex-1 px-3 lg:px-3.5 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon] ?? House;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `relative flex items-center px-3 lg:px-3.5 py-2.5 rounded-xl transition-colors duration-200 focus-ring group ${
                  collapsed ? 'justify-center' : 'justify-start'
                } ${
                  isActive
                    ? 'text-ivory'
                    : 'text-gray-400 hover:text-ivory hover:bg-glass-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border border-accent/35 shadow-glow-sm"
                      transition={SPRING}
                    />
                  )}
                  {isActive && (
                    <span className="absolute left-1 top-2.5 bottom-2.5 w-1 rounded-full bg-accent-light shadow-glow-sm" />
                  )}
                  <Icon
                    size={19}
                    className={`relative z-10 shrink-0 transition-colors ${
                      isActive ? 'text-accent-light' : 'group-hover:text-accent-light/80'
                    }`}
                  />
                  <span
                    className={`relative z-10 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      collapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'ml-3 opacity-100 delay-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            title="Админка"
            className={({ isActive }) =>
              `relative flex items-center px-3 lg:px-3.5 py-2.5 rounded-xl transition-colors duration-200 focus-ring group ${
                collapsed ? 'justify-center' : 'justify-start'
              } ${
                isActive ? 'text-ivory' : 'text-amber-300/80 hover:text-ivory hover:bg-glass-hover'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border border-accent/35 shadow-glow-sm"
                    transition={SPRING}
                  />
                )}
                <ShieldCheck size={19} className="relative z-10 shrink-0 text-accent-light" />
                <span
                  className={`relative z-10 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    collapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'ml-3 opacity-100 delay-100'
                  }`}
                >
                  Админка
                </span>
              </>
            )}
          </NavLink>
        )}
      </nav>

      {/* Карточка профиля внизу */}
      <div
        className={`mx-3 lg:mx-3.5 mb-3.5 mt-2 flex items-center rounded-xl border border-glass-border bg-bg/60 overflow-hidden ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <NavLink
          to="/profile"
          className={`flex-1 flex items-center p-2.5 hover:bg-glass-hover transition-colors focus-ring min-w-0 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          aria-label="Открыть профиль"
        >
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-light to-accent text-bg font-extrabold flex items-center justify-center shrink-0 shadow-glow-sm">
            {displayName.charAt(0).toUpperCase()}
          </span>
          <span
            className={`flex-1 min-w-0 whitespace-nowrap transition-all duration-200 ${
              collapsed ? 'w-0 opacity-0 overflow-hidden' : 'ml-2.5 opacity-100 delay-100'
            }`}
          >
            <span className="block text-sm font-semibold text-ivory truncate leading-tight">
              {displayName}
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-accent-light/80 mt-0.5">
              UL {profile.unionLevel} · Резонатор
            </span>
          </span>
        </NavLink>
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="p-2.5 text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition-colors focus-ring shrink-0"
            aria-label="Выйти из аккаунта"
            title="Выйти"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};