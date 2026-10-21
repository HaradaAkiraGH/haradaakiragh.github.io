// Генератор билд-карточки в PNG (WuWa Flex Card) + шаринг билда по ссылке (/build/:code)
// Работает на чистом HTML5 Canvas без внешних зависимостей
import { useEffect, useState } from 'react';
import { Share2, Download, Check, Sparkles, Sliders } from 'lucide-react';
import type { Character, PlayerProfile } from '../../data/types';
import { IMAGES } from '../../data/images';
import { ELEMENTS, WEAPON_LABELS } from '../../utils/constants';
import { getCharacterResonanceChain } from '../../utils/pullMatch';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { ImagePlaceholder } from '../ui/ImagePlaceholder';

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '700134928',
  nickname: 'Rover',
  unionLevel: 80,
  signature: '',
  roster: [],
};

const ELEMENT_HEX: Record<string, { primary: string; secondary: string }> = {
  Spectro: { primary: '#fbbf24', secondary: '#78350f' },
  Havoc: { primary: '#f43f5e', secondary: '#881337' },
  Fusion: { primary: '#f97316', secondary: '#7c2d12' },
  Glacio: { primary: '#38bdf8', secondary: '#0c4a6e' },
  Electro: { primary: '#a855f7', secondary: '#4c1d95' },
  Aero: { primary: '#34d399', secondary: '#064e3b' },
};

/* Рисование скруглённого прямоугольника на Canvas */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export const BuildSharer = ({ character }: { character: Character }) => {
  const [profile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);

  const defaultWeapon = character.weapons[0]?.name ?? `Сигнатурное (${WEAPON_LABELS[character.weapon]})`;
  const defaultEcho = character.echoSets[0]?.name ?? 'Глубинный меркатор';
  const defaultCost4 = character.echoSets[0]?.cost4 ?? 'Главное Эхо Cost 4';

  const [level, setLevel] = useState(90);
  const [chain, setChain] = useState<number>(() => getCharacterResonanceChain(character.id) ?? 0);
  const [weapon, setWeapon] = useState(defaultWeapon);
  const [echoSet, setEchoSet] = useState(defaultEcho);
  const [critRate, setCritRate] = useState('74.5%');
  const [critDmg, setCritDmg] = useState('268.0%');
  const [atk, setAtk] = useState('2340');
  const [er, setEr] = useState('124.0%');
  const [note, setNote] = useState('Endgame сборка под закрытие Башни на 30★');

  const [copiedLink, setCopiedLink] = useState(false);
  const [generatingPng, setGeneratingPng] = useState(false);

  // Обновляем дефолты при переключении персонажа
  useEffect(() => {
    setWeapon(character.weapons[0]?.name ?? `Сигнатурное (${WEAPON_LABELS[character.weapon]})`);
    setEchoSet(character.echoSets[0]?.name ?? 'Эхо-сет 4-3-3-1-1');
    setChain(getCharacterResonanceChain(character.id) ?? 0);
  }, [character]);

  /* Копирование ссылки /build/:code */
  const copyShareLink = () => {
    const payload = {
      // Короткие и полные ключи одновременно для 100% совместимости с BuildPage
      c: character.id,
      characterId: character.id,
      l: level,
      level,
      s: chain,
      chain,
      w: weapon,
      weapon,
      e: echoSet,
      echoSet,
      cr: critRate,
      cd: critDmg,
      atk,
      er,
      n: note,
      note,
      by: profile.nickname,
      uid: profile.uid,
    };
    const json = JSON.stringify(payload);
    const code = btoa(unescape(encodeURIComponent(json)));
    const shareUrl = `${window.location.origin}/build/${code}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  /* Генерация и скачивание PNG-карточки (1200x675) */
  const downloadPngCard = async () => {
    setGeneratingPng(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 675;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const colors = ELEMENT_HEX[character.element] ?? ELEMENT_HEX.Spectro;

      // 1. Базовый тёмный фон
      const bgGrad = ctx.createLinearGradient(0, 0, 1200, 675);
      bgGrad.addColorStop(0, '#090a10');
      bgGrad.addColorStop(0.55, '#10121c');
      bgGrad.addColorStop(1, '#08090d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1200, 675);

      // 2. Элементальное свечение
      const glow = ctx.createRadialGradient(260, 320, 20, 260, 320, 480);
      glow.addColorStop(0, `${colors.primary}44`);
      glow.addColorStop(0.6, `${colors.secondary}22`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 1200, 675);

      // 3. Отрисовка портрета персонажа слева
      const imgUrl = IMAGES[character.id];
      if (imgUrl) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject();
            img.src = imgUrl;
          });
          ctx.save();
          roundRect(ctx, 28, 28, 430, 619, 28);
          ctx.clip();
          const scale = Math.max(430 / img.width, 619 / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          ctx.drawImage(img, 28 + (430 - dw) / 2, 28, dw, dh);

          // Мягкий градиент поверх портрета снизу
          const charFade = ctx.createLinearGradient(28, 420, 28, 647);
          charFade.addColorStop(0, 'transparent');
          charFade.addColorStop(1, 'rgba(9,10,16,0.92)');
          ctx.fillStyle = charFade;
          ctx.fillRect(28, 28, 430, 619);
          ctx.restore();
        } catch {
          // Если картинка не загрузилась — рисуем стильную плашку
        }
      }

      // Рамка вокруг портрета
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 2;
      roundRect(ctx, 28, 28, 430, 619, 28);
      ctx.stroke();

      // 4. Имя персонажа, титул, редкость и S0–S6 поверх портрета
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px Manrope, sans-serif';
      ctx.fillText('★'.repeat(character.rarity), 52, 555);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 42px Manrope, sans-serif';
      ctx.fillText(character.name, 52, 600);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 17px Manrope, sans-serif';
      ctx.fillText(`${character.title} · Ур. ${level}/90`, 52, 628);

      // Золотой бейдж созвездия S0–S6
      ctx.fillStyle = colors.primary;
      roundRect(ctx, 48, 48, 74, 38, 12);
      ctx.fill();
      ctx.fillStyle = '#090a10';
      ctx.font = '900 20px Manrope, sans-serif';
      ctx.fillText(`S${chain}`, 72, 74);

      // 5. Правая часть карточки: Шапка игрока + STELLAR WIKI
      ctx.fillStyle = '#f7ece6';
      ctx.font = '800 22px Manrope, sans-serif';
      ctx.fillText(`Ровер: ${profile.nickname}`, 495, 64);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px monospace';
      ctx.fillText(`UID: ${profile.uid}  ·  UL ${profile.unionLevel}`, 495, 90);

      ctx.fillStyle = '#caa07d';
      ctx.font = '800 16px Manrope, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('STELLAR WIKI · FLEX CARD', 1165, 64);
      ctx.fillStyle = '#64748b';
      ctx.font = '500 13px Manrope, sans-serif';
      ctx.fillText('haradaakiragh.github.io', 1165, 86);
      ctx.textAlign = 'left';

      // 6. Плашка Оружия и Эхо-набора
      const drawGlassBox = (bx: number, by: number, bw: number, bh: number) => {
        ctx.fillStyle = 'rgba(20, 23, 36, 0.85)';
        roundRect(ctx, bx, by, bw, bh, 20);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.5;
        roundRect(ctx, bx, by, bw, bh, 20);
        ctx.stroke();
      };

      drawGlassBox(495, 118, 670, 105);
      ctx.fillStyle = '#caa07d';
      ctx.font = '700 13px Manrope, sans-serif';
      ctx.fillText(`ОРУЖИЕ (${WEAPON_LABELS[character.weapon].toUpperCase()})`, 520, 148);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 24px Manrope, sans-serif';
      ctx.fillText(weapon, 520, 182);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px Manrope, sans-serif';
      ctx.fillText(`Резонатор: ${ELEMENTS[character.element].label} · ${character.role}`, 520, 206);

      drawGlassBox(495, 240, 670, 105);
      ctx.fillStyle = '#caa07d';
      ctx.font = '700 13px Manrope, sans-serif';
      ctx.fillText('ЭХО-НАБОР (4-3-3-1-1)', 520, 270);
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 24px Manrope, sans-serif';
      ctx.fillText(echoSet, 520, 304);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 14px Manrope, sans-serif';
      ctx.fillText(`Главный слот (Cost 4): ${defaultCost4}`, 520, 328);

      // 7. Четыре плитки целевых характеристик
      const statsBoxes = [
        { label: 'CRIT RATE', val: critRate },
        { label: 'CRIT DMG', val: critDmg },
        { label: 'АТАКА (ATK)', val: atk },
        { label: 'ENERGY REGEN', val: er },
      ];
      statsBoxes.forEach((st, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = 495 + col * 342;
        const sy = 365 + row * 102;
        drawGlassBox(sx, sy, 328, 88);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '700 12px Manrope, sans-serif';
        ctx.fillText(st.label, sx + 22, sy + 32);

        ctx.fillStyle = '#f7ece6';
        ctx.font = '800 28px Manrope, sans-serif';
        ctx.fillText(st.val, sx + 22, sy + 68);
      });

      // 8. Заметка автора билда внизу
      drawGlassBox(495, 575, 670, 72);
      ctx.fillStyle = '#caa07d';
      ctx.font = '700 12px Manrope, sans-serif';
      ctx.fillText('ЗАМЕТКА БИЛДА', 520, 600);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '500 15px Manrope, sans-serif';
      ctx.fillText(note.slice(0, 75), 520, 626);

      // Скачивание PNG
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${character.id}-build-${profile.nickname}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setGeneratingPng(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-black/35 border border-white/10 space-y-5 mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-extrabold text-ivory flex items-center gap-2">
            <Sparkles size={17} className="text-accent-light" />
            <span>Генератор билд-карточки (PNG Flex Card) и Шаринг</span>
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Настрой свои статы и скачай готовую карточку персонажа в PNG или поделись ссылкой
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadPngCard}
            disabled={generatingPng}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#caa07d] to-[#f7ece6] text-[#09090b] text-xs font-extrabold hover:brightness-105 transition-all focus-ring disabled:opacity-50"
          >
            <Download size={15} />
            <span>{generatingPng ? 'Рендерим PNG...' : 'Скачать PNG-карточку'}</span>
          </button>

          <button
            type="button"
            onClick={copyShareLink}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-bold text-ivory transition-all focus-ring"
          >
            {copiedLink ? (
              <>
                <Check size={15} className="text-emerald-400" />
                <span className="text-emerald-300">Ссылка скопирована!</span>
              </>
            ) : (
              <>
                <Share2 size={15} className="text-accent-light" />
                <span>Скопировать ссылку</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Настройки карточки */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1 flex items-center gap-1">
            <Sliders size={11} /> Уровень
          </span>
          <input
            type="number"
            min={1}
            max={90}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1">Цепь резонанса (S0–S6)</span>
          <select
            value={chain}
            onChange={(e) => setChain(Number(e.target.value))}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-amber-300 font-bold"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((s) => (
              <option key={s} value={s}>
                S{s} {s === 0 ? '(Базовый)' : s === 6 ? '(Максимум)' : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1">Оружие</span>
          <input
            type="text"
            value={weapon}
            onChange={(e) => setWeapon(e.target.value)}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1">Эхо-набор</span>
          <input
            type="text"
            value={echoSet}
            onChange={(e) => setEchoSet(e.target.value)}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1">Crit Rate</span>
          <input
            type="text"
            value={critRate}
            onChange={(e) => setCritRate(e.target.value)}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory font-mono"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1">Crit DMG</span>
          <input
            type="text"
            value={critDmg}
            onChange={(e) => setCritDmg(e.target.value)}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory font-mono"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1">ATK</span>
          <input
            type="text"
            value={atk}
            onChange={(e) => setAtk(e.target.value)}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory font-mono"
          />
        </label>

        <label className="block">
          <span className="block text-[11px] text-gray-400 mb-1">Energy Regen</span>
          <input
            type="text"
            value={er}
            onChange={(e) => setEr(e.target.value)}
            className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory font-mono"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-[11px] text-gray-400 mb-1">Комментарий к сборке</span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-bg-secondary border border-glass-border rounded-xl px-3 py-2 text-xs text-ivory"
        />
      </label>

      {/* Живое превью карточки на странице */}
      <div className="rounded-2xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#0c0e16] via-[#131624] to-[#090a10] p-4 sm:p-5 grid grid-cols-1 md:grid-cols-[200px,1fr] gap-5 items-center">
        <div className="relative h-56 md:h-full min-h-[210px] rounded-xl overflow-hidden border border-white/15">
          <ImagePlaceholder
            id={character.id}
            initials={character.name.slice(0, 2)}
            element={character.element}
            className="w-full h-full object-cover object-top"
          />
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-amber-400 text-[#09090b] text-xs font-black shadow">
            S{chain}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            <p className="text-lg font-black text-white leading-tight">{character.name}</p>
            <p className="text-[11px] text-gray-300">Ур. {level}/90 · {character.role}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div>
              <p className="text-sm font-extrabold text-ivory">Ровер: {profile.nickname}</p>
              <p className="text-[11px] font-mono text-gray-400">
                UID: {profile.uid} · UL {profile.unionLevel}
              </p>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent-light">
              STELLAR WIKI CARD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <span className="text-[10px] text-gray-400 uppercase block">Оружие</span>
              <strong className="text-white truncate block mt-0.5">{weapon}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10">
              <span className="text-[10px] text-gray-400 uppercase block">Эхо-набор</span>
              <strong className="text-white truncate block mt-0.5">{echoSet}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Crit Rate</span>
              <strong className="text-sm font-black text-accent-light">{critRate}</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Crit DMG</span>
              <strong className="text-sm font-black text-accent-light">{critDmg}</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 block">ATK</span>
              <strong className="text-sm font-black text-white">{atk}</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-gray-400 block">Energy Regen</span>
              <strong className="text-sm font-black text-white">{er}</strong>
            </div>
          </div>

          {note && <p className="text-xs text-gray-300 italic">«{note}»</p>}
        </div>
      </div>
    </div>
  );
};