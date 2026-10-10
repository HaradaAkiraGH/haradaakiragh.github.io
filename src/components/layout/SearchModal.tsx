// Модальное окно поиска (открывается по Ctrl+K)
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { CHARACTERS } from '../../data/characters';

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Закрытие по Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!isOpen) return null;

  const results = CHARACTERS.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-start justify-center pt-24 md:pt-32 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Поиск персонажей"
    >
      <div className="glass-panel w-full max-w-2xl p-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-3 py-2 border-b border-glass-border">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введи имя персонажа..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
            autoFocus
          />
          <kbd className="px-2 py-0.5 text-xs bg-bg border border-glass-border rounded text-gray-400">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto mt-2 space-y-1">
          {results.map((c) => (
            <button
              key={c.id}
              onClick={() => { navigate(`/characters/${c.id}`); onClose(); setQuery(''); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-glass-hover text-left focus-ring"
            >
              <span className="text-white">{c.name}</span>
              <span className="text-xs text-gray-400">{c.element} · {c.rarity}★</span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="text-center text-gray-500 py-6">Ничего не найдено</p>
          )}
        </div>
      </div>
    </div>
  );
};