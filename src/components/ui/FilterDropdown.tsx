// Кастомный стеклянный дропдаун вместо нативного select
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
  icon?: string;   // путь к картинке (глифы элементов/оружия)
  stars?: number;  // звёзды для редкости
}

interface Props {
  value: string;
  options: FilterOption[];
  onChange: (v: string) => void;
  ariaLabel: string;
}

export const FilterDropdown = ({ value, options, onChange, ariaLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Закрытие по клику мимо и по Esc
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const current = options.find((o) => o.value === value);
  const isActive = !!current && current.value !== 'all';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm transition-all focus-ring ${
          isActive
            ? 'bg-accent/15 border-accent/50 text-accent-light shadow-glow-sm'
            : open
              ? 'bg-glass-hover border-accent/40 text-ivory'
              : 'bg-glass border-glass-border text-gray-300 hover:text-ivory hover:border-accent/30'
        }`}
      >
        {current?.icon && <img src={current.icon} alt="" className="w-4 h-4" draggable={false} />}
        {current?.stars ? <span className="text-yellow-400 text-xs tracking-tight">{'★'.repeat(current.stars)}</span> : null}
        <span className="font-medium">{current ? current.label : '—'}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="listbox"
            aria-label={ariaLabel}
            className="absolute z-40 mt-2 left-0 w-max min-w-full p-1.5 rounded-xl bg-bg-secondary/95 backdrop-blur-2xl border border-glass-border shadow-2xl"
          >
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    role="option"
                    aria-selected={selected}
                    onClick={() => { onChange(o.value); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors focus-ring ${
                      selected ? 'bg-accent/20 text-accent-light' : 'text-gray-300 hover:bg-glass-hover hover:text-ivory'
                    }`}
                  >
                    {o.icon && <img src={o.icon} alt="" className="w-4 h-4" draggable={false} />}
                    {o.stars ? <span className="text-yellow-400 text-xs tracking-tight">{'★'.repeat(o.stars)}</span> : null}
                    <span className="flex-1 pr-2">{o.label}</span>
                    {selected && <Check size={14} className="shrink-0" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};