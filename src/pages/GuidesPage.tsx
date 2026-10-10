// Гайды: список статей + чтение. Всё из data/guides.ts
import { useState } from 'react';
import { ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';
import { GUIDES } from '../data/guides';

export const GuidesPage = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const guide = GUIDES.find((g) => g.id === openId);

  // Режим чтения статьи
  if (guide) {
    return (
      <div className="max-w-3xl space-y-6 animate-fade-in">
        <button
          onClick={() => setOpenId(null)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-ivory transition-colors focus-ring rounded-lg"
        >
          <ArrowLeft size={18} /> Все гайды
        </button>

        <div>
          <span className="inline-block px-2.5 py-1 rounded-md bg-accent/15 border border-accent/30 text-accent-light text-[10px] font-bold tracking-widest uppercase mb-3">
            {guide.tag}
          </span>
          <h2 className="text-3xl font-bold text-ivory">{guide.title}</h2>
          <p className="text-gray-400 mt-2 leading-relaxed">{guide.intro}</p>
        </div>

        {guide.sections.map((s, i) => (
          <section key={i} className="glass-panel p-5">
            <h3 className="font-semibold text-ivory mb-2">{s.heading}</h3>
            <p className="text-sm text-gray-300 leading-relaxed">{s.body}</p>
          </section>
        ))}

        <section className="p-5 rounded-2xl bg-accent/10 border border-accent/25">
          <h3 className="flex items-center gap-2 font-semibold text-accent-light mb-3">
            <Lightbulb size={18} /> Советы
          </h3>
          <ul className="space-y-2">
            {guide.tips.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-200">
                <span className="text-accent-light">✦</span>{t}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  // Список статей
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-ivory">Гайды</h2>
        <p className="text-gray-400 mt-1">Короткие статьи, после которых игра становится понятнее</p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {GUIDES.map((g) => (
          <button
            key={g.id}
            onClick={() => setOpenId(g.id)}
            className="glass-panel-hover p-5 text-left focus-ring flex flex-col gap-3"
          >
            <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-accent-light">
              <BookOpen size={14} /> {g.tag}
            </span>
            <h3 className="font-bold text-ivory leading-snug">{g.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed flex-1">{g.intro}</p>
            <span className="text-xs text-accent-light font-semibold">Читать →</span>
          </button>
        ))}
      </div>
    </div>
  );
};