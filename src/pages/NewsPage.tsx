// Новости и баннеры: живой обратный отсчёт до конца баннеров
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Wrench, Clock } from 'lucide-react';
import { NEWS } from '../data/news';
import { getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';

// Тикающее «сейчас» раз в секунду
const useNow = () => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
};

const fmtCountdown = (ms: number) => {
  if (ms <= 0) return 'завершён';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d}д ${p(h)}:${p(m)}:${p(sec)}`;
};

export const NewsPage = () => {
  const now = useNow();
  const banners = NEWS.filter((n) => n.type === 'banner');
  const patches = NEWS.filter((n) => n.type === 'patch');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-ivory">Новости и баннеры</h2>
        <p className="text-gray-400 mt-1">Что происходит в Соларис-3 прямо сейчас</p>
      </div>

      {/* Баннеры с таймером */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          <Flame size={16} className="text-accent-light" /> Активные баннеры
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {banners.map((n) => {
            const left = n.dateEnd ? new Date(n.dateEnd).getTime() - now : 0;
            return (
              <div key={n.id} className="glass-panel p-5 relative overflow-hidden group hover:border-accent/40 transition-colors">
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent/10 blur-3xl group-hover:bg-accent/20 transition-colors" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-ivory">{n.title}</h4>
                      <p className="text-sm text-gray-400 mt-0.5">{n.subtitle}</p>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-accent/15 border border-accent/30 text-accent-light text-[10px] font-bold tracking-widest uppercase shrink-0">
                      Баннер
                    </span>
                  </div>

                  {/* Таймер */}
                  <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-bg-secondary/70 border border-glass-border">
                    <Clock size={16} className="text-accent-light shrink-0" />
                    <span className="text-xs text-gray-500">До окончания:</span>
                    <code className="ml-auto font-mono text-sm text-accent-light tabular-nums">{fmtCountdown(left)}</code>
                  </div>

                  <ul className="mt-3 space-y-1.5">
                    {n.highlights.map((h, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-300">
                        <span className="text-accent-light">•</span>{h}
                      </li>
                    ))}
                  </ul>

                  {/* Персонажи баннера */}
                  {n.characters && (
                    <div className="flex gap-2 mt-4">
                      {n.characters.map((cid) => {
                        const c = getCharacterById(cid);
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
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Патчи */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300 uppercase tracking-wide">
          <Wrench size={16} className="text-accent-light" /> Патчи
        </h3>
        <div className="space-y-3">
          {patches.map((n) => (
            <div key={n.id} className="glass-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-bold text-ivory">{n.title}</h4>
                <span className="px-2 py-1 rounded-md bg-glass border border-glass-border text-gray-400 text-[10px] font-bold tracking-widest uppercase shrink-0">
                  {n.dateLabel}
                </span>
              </div>
              <ul className="mt-3 grid sm:grid-cols-3 gap-2">
                {n.highlights.map((h, i) => (
                  <li key={i} className="p-2.5 rounded-lg bg-bg-secondary/60 border border-glass-border text-xs text-gray-300">
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};