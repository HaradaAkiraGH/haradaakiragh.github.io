// Плавающий стеклянный сайдбар: сворачивание в рельсу, выход через контекст auth,
// пункт «Админка» только для роли admin
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { House, Users, Map, Trophy, Newspaper, BookOpen, Settings as SettingsIcon, Search, LogOut, Calculator, Dice5, ShieldCheck } from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PlayerProfile } from '../../data/types';
import { useAuth } from '../../hooks/useAuth';

const ICONS: Record<string, any> = {
  home: House, users: Users, map: Map, trophy: Trophy,
  news: Newspaper, guides: BookOpen, settings: SettingsIcon, calculator: Calculator,
  dice: Dice5,
};

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '100000000',
  nickname: 'Rover',
  unionLevel: 60,
  signature: '',
  roster: [],
};

const SPRING = { type: 'spring', bounce: 0.25, duration: 0.55 } as const;

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
  return (
    <aside
      className={`hidden md:flex flex-col fixed left-4 top-4 bottom-4 rounded-2xl border border-glass-border bg-bg-secondary/60 backdrop-blur-2xl z-40 overflow-hidden transition-[width] duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <Link to="/home" className="px-4 lg:px-6 pt-5 pb-4 border-b border-glass-border focus-ring flex items-center justify-center lg:justify-start overflow-hidden">
        <span className={`text-xl font-extrabold text-gradient tracking-tight whitespace-nowrap transition-all duration-200 ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100 delay-150'}`}>
          Stellar Wiki
        </span>
        <span className={`text-xl font-extrabold text-gradient transition-all duration-200 ${collapsed ? 'opacity-100 delay-150' : 'w-0 opacity-0 overflow-hidden'}`}>
          S
        </span>
      </Link>
      <button
        onClick={onOpenSearch}
        className={`mx-3 lg:mx-4 mt-4 flex items-center px-3 lg:px-4 py-3 rounded-xl bg-glass border border-glass-border text-gray-400 hover:text-ivory hover:border-accent/50 transition-all focus-ring ${
          collapsed ? 'justify-center' : 'justify-start'
        }`}
        aria-label="Открыть поиск (Ctrl+K)"
      >
        <Search size={18} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm ml-3 whitespace-nowrap">Поиск...</span>
            <kbd className="px-2 py-0.5 text-xs bg-bg border border-glass-border rounded whitespace-nowrap">Ctrl K</kbd>
          </>
        )}
      </button>
      <p className={`pt-4 pb-2 text-[10px] tracking-[0.25em] text-gray-500 transition-all duration-200 ${collapsed ? 'text-center px-1' : 'px-6 text-left'}`}>
        MENU
      </p>
      <nav className="flex-1 px-3 lg:px-4 space-y-1 overflow-y-auto no-scrollbar overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <NavLink
              key={item.id}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `relative flex items-center px-3 lg:px-4 py-3 rounded-xl transition-colors duration-200 focus-ring ${
                  collapsed ? 'justify-center' : 'justify-start'
                } ${isActive ? 'text-ivory' : 'text-gray-400 hover:text-ivory hover:bg-glass-hover'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-accent/15 border border-accent/30 shadow-glow-sm"
                      transition={SPRING}
                    />
                  )}
                  <Icon size={20} className="relative z-10 shrink-0" />
                  <span className={`relative z-10 font-medium whitespace-nowrap transition-all duration-200 ${collapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'ml-3 opacity-100 delay-150'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
        {/* Пункт только для админа */}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            title="Админка"
            className={({ isActive }) =>
              `relative flex items-center px-3 lg:px-4 py-3 rounded-xl transition-colors duration-200 focus-ring ${
                collapsed ? 'justify-center' : 'justify-start'
              } ${isActive ? 'text-ivory' : 'text-gray-400 hover:text-ivory hover:bg-glass-hover'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-accent/15 border border-accent/30 shadow-glow-sm"
                    transition={SPRING}
                  />
                )}
                <ShieldCheck size={20} className="relative z-10 shrink-0" />
                <span className={`relative z-10 font-medium whitespace-nowrap transition-all duration-200 ${collapsed ? 'w-0 ml-0 opacity-0 overflow-hidden' : 'ml-3 opacity-100 delay-150'}`}>
                  Админка
                </span>
              </>
            )}
          </NavLink>
        )}
      </nav>
      <div className={`mx-3 lg:mx-4 mb-4 flex items-center rounded-xl border border-glass-border bg-glass overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
        <NavLink
          to="/profile"
          className={`flex-1 flex items-center p-2.5 lg:p-3 hover:bg-glass-hover transition-colors focus-ring min-w-0 ${collapsed ? 'justify-center' : 'justify-start'}`}
          aria-label="Открыть профиль"
        >
          <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-light to-accent text-bg font-bold flex items-center justify-center shrink-0">
            {profile.nickname.charAt(0).toUpperCase()}
          </span>
          <span className={`flex-1 min-w-0 whitespace-nowrap transition-all duration-200 ${collapsed ? 'w-0 opacity-0 overflow-hidden' : 'ml-3 opacity-100 delay-150'}`}>
            <span className="block text-sm font-semibold text-ivory truncate">{profile.nickname}</span>
            <span className="block text-[11px] text-gray-400">Union Level {profile.unionLevel}</span>
          </span>
        </NavLink>
        {!collapsed && (
          <button
            onClick={handleLogout}
            className="p-2.5 lg:p-3 text-gray-500 hover:text-red-300 hover:bg-red-500/10 transition-colors focus-ring shrink-0"
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