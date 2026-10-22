// Общий каркас сайта: плавная синхронизация сворачивания сайдбара + автоподгрузка новых героев из админки
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { SearchModal } from './SearchModal';
import { BackgroundFX } from './BackgroundFX';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { initAdminRuntimeSync } from '../../utils/adminStorage';

export const Layout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage<boolean>('ww_sidebar_collapsed', false);
  const [, setSyncTick] = useState(0);

  useEffect(() => {
    initAdminRuntimeSync().then(() => setSyncTick((t) => t + 1));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen flex relative">
      <BackgroundFX />

      <Sidebar
        onOpenSearch={() => setIsSearchOpen(true)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      {/* Кнопка сворачивания сайдбара: плавно едет синхронно с шириной меню */}
      <button
        type="button"
        onClick={() => setCollapsed((prev) => !prev)}
        style={{
          left: collapsed ? '84px' : '260px',
          transition:
            'left 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms ease, background-color 200ms ease',
        }}
        className="hidden md:flex fixed top-1/2 -translate-y-1/2 z-50 w-7 h-12 rounded-xl bg-[#121521]/95 hover:bg-[#1a1f30] text-gray-300 hover:text-accent-light shadow-[0_8px_24px_rgba(0,0,0,0.85)] items-center justify-center cursor-pointer focus-ring"
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        <ChevronLeft
          size={16}
          className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      <main
        style={{
          transition: 'padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`relative z-10 flex-1 pb-20 md:pb-0 min-h-screen ${
          collapsed ? 'md:pl-28' : 'md:pl-72'
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>

      <MobileNav />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};