// Публичная страница билда по ссылке /build/<code> (без логина)
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Share2, Check, Backpack, AlertTriangle } from 'lucide-react';
import { decodeBuild } from '../utils/buildShare';
import { getCharacterById } from '../data/characters';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';
import { ELEMENTS, WEAPON_ICONS } from '../utils/constants';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { BackgroundFX } from '../components/layout/BackgroundFX';

export const BuildPage = () => {
  const { code } = useParams<{ code: string }>();
  const build = code ? decodeBuild(code) : null;
  const char = build ? getCharacterById(build.c) : undefined;
  const [copied, setCopied] = useState(false);

  const el = char ? ELEMENTS[char.element] : ELEMENTS.Spectro;

  useDocumentMeta({
    title: char ? `Билд ${char.name}` : 'Билд',
    description: char
      ? `Готовый билд для ${char.name}: оружие, эхо-набор и целевые статы. Открой в Stellar Wiki.`
      : 'Ссылка на билд недействительна.',
    path: code ? `/build/${code}` : '/build',
  });

  const copy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!build || !char) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <BackgroundFX />
        <div className="relative glass-panel p-8 max-w-md text-center animate-slide-up">
          <AlertTriangle size={36} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-ivory">Ссылка на билд побита</h1>
          <p className="text-gray-400 text-sm mt-2">Код повреждён или устарел. Загляни в каталог и собери билд заново.</p>
          <Link to="/characters" className="inline-flex items-center gap-2 mt-5 px-5 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg font-bold text-sm hover:shadow-glow transition-all focus-ring">
            <ArrowLeft size={16} /> К персонажам
          </Link>
        </div>
      </div>
    );
  }

  const weapon = char.weapons[build.w] ?? char.weapons[0];
  const set = char.echoSets[build.s] ?? char.echoSets[0];

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <BackgroundFX />
      <div className="relative w-full max-w-2xl glass-panel p-6 md:p-8 animate-slide-up">
        <div className="flex items-center gap-4 mb-6">
          <ImagePlaceholder id={char.id} initials={char.name.slice(0, 2)} element={char.element} className="w-20 aspect-[3/4] rounded-xl border border-glass-border shadow-glow" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-widest uppercase text-accent-light mb-1">Готовый билд</p>
            <h1 className="text-3xl font-bold text-ivory leading-tight">{char.name}</h1>
            <p className="text-sm mt-0.5 flex items-center gap-1.5 text-gray-400">
              <img src={el.icon} alt="" className="w-4 h-4" draggable={false} /> {el.label} · {char.role}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-xl bg-glass border border-glass-border">
            <p className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">
              <img src={WEAPON_ICONS[char.weapon]} alt="" className="w-4 h-4" draggable={false} /> Оружие
            </p>
            <p className="font-semibold text-ivory">{weapon.name}</p>
            <p className="text-xs text-gray-500 mt-1">{weapon.type === 'Signature' ? 'Сигнатурное' : 'Альтернатива'} · рейтинг {weapon.rating}%</p>
          </div>
          <div className="p-4 rounded-xl bg-glass border border-glass-border">
            <p className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-2">
              <Backpack size={12} /> Эхо-набор
            </p>
            <p className="font-semibold text-ivory">{set.name}</p>
            <p className="text-xs text-gray-500 mt-1">Главное эхо: {set.cost4}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-bg-secondary/70 border border-glass-border text-center">
            <p className="text-lg font-bold text-accent-light tabular-nums">{build.cr}%</p>
            <p className="text-[10px] text-gray-500">Crit Rate</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-secondary/70 border border-glass-border text-center">
            <p className="text-lg font-bold text-accent-light tabular-nums">{build.cd}%</p>
            <p className="text-[10px] text-gray-500">Crit DMG</p>
          </div>
          <div className="p-3 rounded-xl bg-bg-secondary/70 border border-glass-border text-center">
            <p className="text-lg font-bold text-accent-light tabular-nums">+{build.atk}%</p>
            <p className="text-[10px] text-gray-500">ATK</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={copy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-bold hover:shadow-glow transition-all focus-ring"
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            {copied ? 'Скопировано!' : 'Поделиться дальше'}
          </button>
          <Link to={`/characters/${char.id}`} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-ivory hover:border-accent/40 transition-colors focus-ring">
            Страница персонажа
          </Link>
          <Link to="/home" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-glass border border-glass-border text-sm text-gray-300 hover:text-ivory hover:border-accent/40 transition-colors focus-ring">
            В вики
          </Link>
        </div>
      </div>
    </div>
  );
};