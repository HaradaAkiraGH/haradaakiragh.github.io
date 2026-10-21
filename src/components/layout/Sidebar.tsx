// Плавающий сайдбар Stellar Wiki без белой обводки, с мягкой глубокой тенью и синхронным сворачиванием
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  House,
  Users,
  Skull,
  Archive,
  Dice5,
  Map,
  Trophy,
  Calculator,
  Newspaper,
  BookOpen,
  Settings as SettingsIcon,
  Search,
  LogOut,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
} from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';
import { CHARACTERS } from '../../data/characters';
import { MAP_MARKERS } from '../../data/map';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PlayerProfile } from '../../data/types';
import { useAuth } from '../../hooks/useAuth';
import { getCachedLuckSummary } from '../../utils/pullMatch';

const ICONS: Record<string, any> = {
  home: House,
  users: Users,
  bestiary: Skull,
  archive: Archive,
  dice: Dice5,
  map: Map,
  trophy: Trophy,
  calculator: Calculator,
  news: Newspaper,
  guides: BookOpen,
  settings: SettingsIcon,
};

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '700134928',
  nickname: 'HaradaAkira',
  unionLevel: 80,
  signature: '',
  roster: [],
};

const GROUP_MAP: Record<string, 'db' | 'tools' | 'system'> = {
  home: 'db',
  characters: 'db',
  bestiary: 'db',
  meta: 'db',
  pulls: 'tools',
  map: 'tools',
  calculator: 'tools',
  guides: 'system',
  news: 'system',
  settings: 'system',
};

const SPRING = { type: 'spring' as const, bounce: 0.2, duration: 0.5 };

function getShortResetTimer(): string {
  const now = new Date();
  const target = new Date(now);
  target.setHours(4, 0, 0, 0);
  if (now >= target) target.setDate(target.getDate() + 1);
  const diff = Math.max(0, target.getTime() - now.getTime());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${String(h).padStart(2, '0')}ч ${String(m).padStart(2, '0')}м`;
}

interface Props {
  onOpenSearch: () => void;
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({ onOpenSearch, collapsed }: Props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [collected] = useLocalStorage<string[]>('ww_map_collected', []);

  const [customData, setCustomData] = useState<{
    avatarUrl?: string;
    bannerUrl?: string;
    username?: string;
  }>({});

  useEffect(() => {
    try {
      const rawV2 = localStorage.getItem('ww_profile_custom_v2');
      const rawV1 = localStorage.getItem('ww_profile_custom_v1');
      const parsed = JSON.parse(rawV2 || rawV1 || '{}');
      setCustomData(parsed);
    } catch {
      setCustomData({});
    }
  }, [location.pathname]);

  const luckSummary = useMemo(() => getCachedLuckSummary(), [location.pathname]);
  const mapPercent = useMemo(
    () => Math.round((collected.length / Math.max(1, MAP_MARKERS.length)) * 100),
    [collected],
  );

  const [resetTime, setResetTime] = useState(() => getShortResetTimer());
  useEffect(() => {
    const id = setInterval(() => setResetTime(getShortResetTimer()), 30000);
    return () => clearInterval(id);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('ww_sidebar_vol');
    return saved !== null ? Number(saved) : 0.15;
  });

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = muted ? 0 : volume;
    el.muted = muted;
    localStorage.setItem('ww_sidebar_vol', String(volume));
  }, [volume, muted]);

  const toggleMusic = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
    } else {
      el.volume = muted ? 0 : volume;
      el.play().catch(() => {});
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fullNavItems = useMemo(() => {
    const hasBestiary = NAV_ITEMS.some((i) => i.path === '/bestiary' || i.id === 'bestiary');
    if (hasBestiary) return NAV_ITEMS;
    const copy = [...NAV_ITEMS];
    const charIdx = copy.findIndex((i) => i.id === 'characters');
    copy.splice(charIdx + 1, 0, {
      id: 'bestiary',
      label: 'Бестиарий',
      icon: 'bestiary',
      path: '/bestiary',
    });
    return copy;
  }, []);

  const getBadgeForItem = (id: string): { text: string; highlight?: boolean } | null => {
    switch (id) {
      case 'characters':
        return { text: String(CHARACTERS.length), highlight: true };
      case 'pulls':
        return luckSummary?.luckGrade && luckSummary.luckGrade !== '—'
          ? { text: luckSummary.luckGrade, highlight: true }
          : { text: '50/50' };
      case 'map':
        return { text: `${mapPercent}%` };
      case 'meta':
        return { text: 'T0' };
      case 'calculator':
        return { text: 'ECHO' };
      default:
        return null;
    }
  };

  const groups = useMemo(() => {
    const db = fullNavItems.filter((i) => (GROUP_MAP[i.id] ?? 'system') === 'db');
    const tools = fullNavItems.filter((i) => GROUP_MAP[i.id] === 'tools');
    const sys = fullNavItems.filter((i) => (GROUP_MAP[i.id] ?? 'system') === 'system');
    return [
      { key: 'db', title: 'ЭНЦИКЛОПЕДИЯ', items: db },
      { key: 'tools', title: 'ТЕРМИНАЛЫ', items: tools },
      { key: 'system', title: 'СИСТЕМА', items: sys },
    ];
  }, [fullNavItems]);

  const displayName = profile.nickname || user?.nickname || 'Rover';
  const avatarSrc = customData.avatarUrl || '/images/Camellya_Card.webp';

  return (
    <aside
      style={{
        width: collapsed ? '80px' : '256px',
        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      className="hidden md:flex flex-col fixed left-4 top-4 bottom-4 rounded-[26px] bg-[#0b0d14]/90 backdrop-blur-2xl shadow-[0_28px_70px_rgba(0,0,0,0.9)] z-40 overflow-hidden"
    >
      <audio
        ref={audioRef}
        src="/login-bgm.mp3"
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Мягкое внутреннее золотое свечение сверху вместо белой обводки */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-36 rounded-full bg-accent/15 blur-3xl"
      />

      {/* 1. ШАПКА САЙДБАРА */}
      <Link
        to="/home"
        className={`relative z-10 pt-5 pb-4 border-b border-white/[0.04] focus-ring flex items-center transition-all ${
          collapsed ? 'px-3 justify-center' : 'px-5 gap-3.5 justify-start'
        }`}
      >
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#261f18] to-[#12100e] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(202,160,125,0.2)]">
          <svg
            viewBox="0 0 44 44"
            className="absolute inset-0 w-full h-full animate-[spin_26s_linear_infinite] opacity-65 pointer-events-none"
          >
            <circle
              cx="22"
              cy="22"
              r="19"
              fill="none"
              stroke="rgb(var(--accent-light))"
              strokeWidth="1"
              strokeDasharray="6 4"
            />
          </svg>
          <Compass size={19} className="text-accent-light relative z-10" />
        </div>

        {!collapsed && (
          <div className="min-w-0 overflow-hidden">
            <span className="block text-lg font-extrabold text-gradient tracking-tight leading-none truncate">
              Stellar Wiki
            </span>
            <span className="block text-[9px] font-bold tracking-[0.24em] text-gray-400 uppercase mt-1.5 truncate">
              SOLARIS-3 ARCHIVE
            </span>
          </div>
        )}
      </Link>

      {/* 2. КНОПКА ГЛОБАЛЬНОГО ПОИСКА */}
      <button
        onClick={onOpenSearch}
        className={`relative z-10 mx-3.5 mt-3.5 flex items-center rounded-2xl bg-[#131622]/90 hover:bg-[#191d2d] text-gray-300 hover:text-ivory transition-all focus-ring group ${
          collapsed ? 'p-2.5 justify-center' : 'px-3.5 py-2.5 justify-between'
        }`}
        aria-label="Открыть поиск (Ctrl+K)"
        title="Поиск по базе (Ctrl+K)"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search
            size={16}
            className="text-accent-light shrink-0 group-hover:scale-110 transition-transform"
          />
          {!collapsed && (
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 truncate">
              Поиск по базе...
            </span>
          )}
        </div>
        {!collapsed && (
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-black/50 rounded-md text-gray-400 shrink-0">
            Ctrl K
          </kbd>
        )}
      </button>

      {/* 3. НАВИГАЦИЯ */}
      <nav className="relative z-10 flex-1 px-3 py-3 space-y-4 overflow-y-auto no-scrollbar overflow-x-hidden">
        {groups.map((group) => (
          <div key={group.key} className="space-y-1">
            {!collapsed ? (
              <div className="px-3 pb-1 flex items-center gap-2">
                <span className="text-[9px] font-extrabold tracking-[0.22em] text-gray-500 uppercase">
                  {group.title}
                </span>
                <span className="flex-1 h-[1px] bg-gradient-to-r from-white/[0.05] to-transparent" />
              </div>
            ) : (
              <div className="mx-3 my-1 h-[1px] bg-white/[0.05]" />
            )}

            {group.items.map((item) => {
              const Icon = item.id === 'bestiary' ? Skull : ICONS[item.icon] ?? House;
              const badge = getBadgeForItem(item.id);

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  title={item.label}
                  className={({ isActive }) =>
                    `group relative flex items-center rounded-xl transition-all duration-200 focus-ring ${
                      collapsed ? 'justify-center py-2.5 px-2' : 'justify-between px-3 py-2'
                    } ${
                      isActive
                        ? 'text-ivory'
                        : 'text-gray-400 hover:text-ivory hover:bg-white/[0.04]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent/25 via-accent/10 to-transparent shadow-[0_0_20px_rgba(202,160,125,0.14)]"
                          transition={SPRING}
                        />
                      )}

                      {isActive && (
                        <motion.span
                          layoutId="nav-bar"
                          className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-ivory to-accent shadow-[0_0_8px_rgba(247,236,230,0.9)]"
                          transition={SPRING}
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? 'bg-accent/25 text-accent-light'
                              : 'bg-white/[0.03] text-gray-400 group-hover:text-ivory group-hover:bg-white/[0.07]'
                          }`}
                        >
                          <Icon size={15} />
                        </span>

                        {!collapsed && (
                          <span className="text-[13px] font-semibold truncate">{item.label}</span>
                        )}
                      </div>

                      {!collapsed && badge && (
                        <span
                          className={`relative z-10 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider tabular-nums shrink-0 ${
                            isActive || badge.highlight
                              ? 'bg-accent/20 text-accent-light'
                              : 'bg-white/[0.05] text-gray-400'
                          }`}
                        >
                          {badge.text}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}

        {user?.role === 'admin' && (
          <div className="pt-1">
            <NavLink
              to="/admin"
              title="Админка"
              className={({ isActive }) =>
                `group relative flex items-center rounded-xl transition-all duration-200 focus-ring ${
                  collapsed ? 'justify-center py-2.5 px-2' : 'justify-between px-3 py-2'
                } ${
                  isActive
                    ? 'text-amber-200'
                    : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-500/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent"
                      transition={SPRING}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                      <ShieldCheck size={15} />
                    </span>
                    {!collapsed && (
                      <span className="text-[13px] font-bold truncate">Админка</span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="relative z-10 px-1.5 py-0.5 rounded-md bg-amber-500/20 text-[9px] font-black uppercase tracking-wider text-amber-200">
                      ROOT
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* 4. МИНИ-РАДИО И ТАЙМЕР */}
      {!collapsed ? (
        <div className="relative z-10 mx-3.5 mb-2.5 p-2.5 rounded-2xl bg-[#111420]/90 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleMusic}
              className="flex items-center gap-2 text-left group min-w-0 flex-1 focus-ring rounded-lg"
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  playing
                    ? 'bg-accent/25 text-accent-light'
                    : 'bg-white/[0.06] text-gray-300 group-hover:text-white'
                }`}
              >
                {playing ? <Pause size={13} /> : <Play size={13} className="translate-x-[0.5px]" />}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold text-ivory truncate block">
                  Solaris-3 Radio
                </span>
                <span className="block text-[9px] text-gray-500 truncate">
                  {playing ? 'Звучит фоновая тема' : 'Нажми для запуска BGM'}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-ivory hover:bg-white/10 transition-colors"
            >
              {muted || volume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>

          {playing && (
            <input
              type="range"
              min={0}
              max={0.6}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (muted) setMuted(false);
              }}
              aria-label="Громкость радио"
              className="w-full h-1"
            />
          )}

          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1.5 border-t border-white/[0.05]">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-accent-light" />
              <span>Сброс сервера:</span>
            </span>
            <span className="font-mono font-bold text-accent-light tabular-nums">{resetTime}</span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggleMusic}
          title={playing ? 'Пауза BGM' : 'Включить BGM Соларис-3'}
          className={`mx-auto mb-2.5 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            playing
              ? 'bg-accent/25 text-accent-light'
              : 'bg-white/[0.04] text-gray-400 hover:text-white'
          }`}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
      )}

      {/* 5. НИЖНЯЯ КАРТОЧКА ПРОФИЛЯ */}
      <div
        className={`relative z-10 mx-3.5 mb-3.5 rounded-2xl overflow-hidden bg-[#131622] shadow-lg ${
          collapsed ? 'flex justify-center' : ''
        }`}
      >
        {customData.bannerUrl && !collapsed && (
          <img
            src={customData.bannerUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-[#0b0d14]/90 via-[#0b0d14]/75 to-[#0b0d14]/90 pointer-events-none"
        />

        <div className="relative z-10 flex items-center">
          <NavLink
            to="/profile"
            className={`flex-1 flex items-center p-2.5 hover:bg-white/[0.05] transition-colors focus-ring min-w-0 ${
              collapsed ? 'justify-center' : 'justify-start gap-3'
            }`}
            aria-label="Открыть профиль"
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-accent-light to-accent flex items-center justify-center shadow-glow-sm">
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <span
                title="В сети"
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple-400 border-2 border-[#0b0d14] shadow-[0_0_8px_#c084fc]"
              />
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-extrabold text-white truncate">
                  {displayName}
                </span>
                <span className="block text-[10px] font-bold tracking-wider uppercase text-accent-light truncate">
                  UL {profile.unionLevel} · РЕЗОНАТОР
                </span>
              </div>
            )}
          </NavLink>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-3 text-gray-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors focus-ring shrink-0"
              aria-label="Выйти из аккаунта"
              title="Выйти"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};