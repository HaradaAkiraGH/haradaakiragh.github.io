// Конструктор билда + копирование ссылки /build/<code>
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Share2, Check, ExternalLink } from 'lucide-react';
import { Character } from '../../data/types';
import { encodeBuild } from '../../utils/buildShare';

const selectClass = 'w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-sm focus-ring';

const MiniSlider = ({ label, value, min, max, step, suffix, onChange }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (v: number) => void }) => (
  <label className="block">
    <div className="flex items-baseline justify-between gap-2 mb-1">
      <span className="text-xs text-gray-300 font-medium">{label}</span>
      <span className="text-xs text-accent-light font-mono tabular-nums">{value}{suffix}</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[rgb(var(--accent))]" />
  </label>
);

export const BuildSharer = ({ character }: { character: Character }) => {
  const [w, setW] = useState(0);
  const [s, setS] = useState(0);
  const [cr, setCr] = useState(70);
  const [cd, setCd] = useState(170);
  const [atk, setAtk] = useState(100);
  const [copied, setCopied] = useState(false);

  const code = useMemo(() => encodeBuild({ c: character.id, w, s, cr, cd, atk }), [character.id, w, s, cr, cd, atk]);
  const url = `${window.location.origin}/build/${code}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-4 rounded-xl bg-accent/10 border border-accent/25">
      <h4 className="font-semibold text-ivory flex items-center gap-2 mb-3">
        <Share2 size={16} className="text-accent-light" /> Собрать билд и поделиться
      </h4>

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <label className="block">
          <span className="text-xs text-gray-400 block mb-1">Оружие</span>
          <select value={w} onChange={(e) => setW(Number(e.target.value))} className={selectClass}>
            {character.weapons.map((wp, i) => (
              <option key={i} value={i}>{wp.name}{wp.type === 'Signature' ? ' (сигн.)' : ''}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-gray-400 block mb-1">Эхо-набор</span>
          <select value={s} onChange={(e) => setS(Number(e.target.value))} className={selectClass}>
            {character.echoSets.map((st, i) => (
              <option key={i} value={i}>{st.name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        <MiniSlider label="Crit Rate" value={cr} min={0} max={100} step={1} suffix="%" onChange={setCr} />
        <MiniSlider label="Crit DMG" value={cd} min={100} max={300} step={5} suffix="%" onChange={setCd} />
        <MiniSlider label="+ATK" value={atk} min={0} max={200} step={5} suffix="%" onChange={setAtk} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={copy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring"
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? 'Ссылка скопирована!' : 'Скопировать ссылку на билд'}
        </button>
        <Link
          to={`/build/${code}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-ivory hover:border-accent/40 transition-colors focus-ring"
        >
          <ExternalLink size={15} /> Открыть превью
        </Link>
      </div>
      <p className="text-[11px] text-gray-500 mt-3 break-all">
        {url}
      </p>
    </div>
  );
};