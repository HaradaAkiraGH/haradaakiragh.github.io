// Каркас: живой фон, сворачиваемый сайдбар с кнопкой-«ушком», контент, таб-бар, поиск, хоткеи
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { SearchModal } from './SearchModal';
import { BackgroundFX } from './BackgroundFX';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const HOTKEYS = [
  { keys: ['Ctrl', 'K'], desc: 'Глобальный поиск по персонажам' },
  { keys: ['?'], desc: 'Открыть эту справку' },
  { keys: ['1'], desc: 'Раздел «Главная»' },
  { keys: ['2'], desc: 'Раздел «Персонажи»' },
  { keys: ['3'], desc: 'Раздел «Карта»' },
  { keys: ['4'], desc: 'Раздел «Мета»' },
  { keys: ['5'], desc: 'Раздел «Новости»' },
  { keys: ['6'], desc: 'Раздел «Гайды»' },
  { keys: ['Esc'], desc: 'Закрыть поиск / справку' },
];

const HotkeysModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Горячие клавиши">
      <div className="glass-panel w-full max-w-sm p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-ivory mb-4">Горячие клавиши</h3>
        <div className="space-y-2">
          {HOTKEYS.map((h, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-300">{h.desc}</span>
              <span className="flex gap-1 shrink-0">
                {h.keys.map((k) => (
                  <kbd key={k} className="px-2 py-1 text-xs bg-bg border border-glass-border rounded text-gray-300">{k}</kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4">На странице тренажёра цифры 1–4 нажимают персонажей</p>
      </div>
    </div>
  );
};

export const Layout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [collapsed, setCollapsed] = useLocalStorage<boolean>(
    'ww_sidebar_collapsed',
    typeof window !== 'undefined' ? window.innerWidth < 1280 : false,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsHelpOpen(false);
        return;
      }
      if (typing) return;
      if (document.body.dataset.trainer === 'on') return;

      if (e.key === '?') {
        setIsHelpOpen((v) => !v);
        return;
      }
      const routes: Record<string, string> = {
        '1': '/home', '2': '/characters', '3': '/map', '4': '/meta', '5': '/news', '6': '/guides',
      };
      if (routes[e.key]) navigate(routes[e.key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div className="min-h-screen flex">
      <BackgroundFX />

      <Sidebar onOpenSearch={() => setIsSearchOpen(true)} collapsed={collapsed} />

      {/* Кнопка-«ушко» на кромке сайдбара: ездит вместе с шириной */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-bg-secondary border border-glass-border items-center justify-center text-gray-400 hover:text-accent-light hover:border-accent/50 shadow-lg transition-[left] duration-300 ease-in-out focus-ring ${
          collapsed ? 'left-[82px]' : 'left-[258px]'
        }`}
        aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        title={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
      >
        {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
      </button>

      {/* Контент: отступ синхронно анимируется с шириной сайдбара */}
      <main
        className={`relative z-10 flex-1 pb-20 md:pb-0 min-h-screen transition-[margin-left] duration-300 ease-in-out ${
          collapsed ? 'md:ml-28' : 'md:ml-72'
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>

      <MobileNav />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <HotkeysModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};