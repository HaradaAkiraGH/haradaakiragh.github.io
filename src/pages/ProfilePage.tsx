// Профиль: карточка игрока, статистика с count-up, мой ростер (иконки вместо смайликов)
import { useState, useEffect } from 'react';
import { Save, Edit2, Trash2, UserPlus, Sword, Backpack } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useSettings } from '../hooks/useSettings';
import { PlayerProfile } from '../data/types';
import { CHARACTERS, getCharacterById } from '../data/characters';
import { MAP_MARKERS } from '../data/map';
import { ImagePlaceholder } from '../components/ui/ImagePlaceholder';

const DEFAULT_PROFILE: PlayerProfile = {
  uid: '100000000',
  nickname: 'Rover',
  unionLevel: 60,
  signature: 'Исследую Соларис-3 в поисках эхо.',
  roster: [],
};

const ACHIEVEMENTS_MOCK = 47;

// Цифра набегает с лёгким ускорением; в режиме reduceMotion — мгновенно
const CountUp = ({ value }: { value: number }) => {
  const [settings] = useSettings();
  const [display, setDisplay] = useState(settings.reduceMotion ? value : 0);

  useEffect(() => {
    if (settings.reduceMotion) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, settings.reduceMotion]);

  return <>{display}</>;
};

export const ProfilePage = () => {
  const [profile, setProfile] = useLocalStorage<PlayerProfile>('ww_profile', DEFAULT_PROFILE);
  const [collected] = useLocalStorage<string[]>('ww_map_collected', []);
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState<PlayerProfile>(profile);

  const [pickId, setPickId] = useState('');
  const [pickLevel, setPickLevel] = useState(60);
  const [pickWeapon, setPickWeapon] = useState('');
  const [pickEcho, setPickEcho] = useState('');

  const startEdit = () => { setTemp(profile); setIsEditing(true); };
  const saveEdit = () => { setProfile(temp); setIsEditing(false); };

  const available = CHARACTERS.filter((c) => !profile.roster.some((r) => r.characterId === c.id));

  const addToRoster = () => {
    if (!pickId) return;
    setProfile({
      ...profile,
      roster: [...profile.roster, { characterId: pickId, level: pickLevel, weapon: pickWeapon || '—', echoSet: pickEcho || '—' }],
    });
    setPickId(''); setPickWeapon(''); setPickEcho('');
  };

  const removeFromRoster = (charId: string) => {
    setProfile({ ...profile, roster: profile.roster.filter((r) => r.characterId !== charId) });
  };

  const mapPercent = Math.round((collected.length / MAP_MARKERS.length) * 100);
  const inputClass = 'w-full bg-bg-secondary border border-glass-border rounded-lg px-3 py-2 text-sm text-ivory focus-ring';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Карточка игрока */}
      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-light to-accent flex items-center justify-center text-3xl font-bold border-2 border-glass-border shadow-glow shrink-0 text-bg">
            {profile.nickname.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 w-full min-w-0">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div>
                {isEditing ? (
                  <input value={temp.nickname} onChange={(e) => setTemp({ ...temp, nickname: e.target.value })} className="text-2xl font-bold bg-bg-secondary border border-glass-border rounded-lg px-2 py-1 text-ivory mb-1" aria-label="Никнейм" />
                ) : (
                  <h2 className="text-2xl font-bold text-ivory">{profile.nickname}</h2>
                )}
                <p className="text-accent-light font-mono text-sm">UID: {profile.uid} · Union Level {profile.unionLevel}</p>
              </div>
              <button onClick={isEditing ? saveEdit : startEdit} className="p-2 rounded-lg bg-glass border border-glass-border hover:bg-accent/20 hover:border-accent/50 transition-all focus-ring" aria-label={isEditing ? 'Сохранить' : 'Редактировать'}>
                {isEditing ? <Save size={18} className="text-accent-light" /> : <Edit2 size={18} className="text-gray-400" />}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <input value={temp.uid} onChange={(e) => setTemp({ ...temp, uid: e.target.value })} className={inputClass} placeholder="UID" aria-label="UID" />
                <input type="number" value={temp.unionLevel} onChange={(e) => setTemp({ ...temp, unionLevel: Number(e.target.value) })} className={inputClass} placeholder="Union Level" aria-label="Union Level" />
                <input value={temp.signature} onChange={(e) => setTemp({ ...temp, signature: e.target.value })} className={inputClass} placeholder="Подпись" aria-label="Подпись" />
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">«{profile.signature}»</p>
            )}
          </div>
        </div>
      </div>

      {/* Статистика с count-up */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 text-center">
          <p className="text-3xl font-bold text-gradient"><CountUp value={profile.roster.length} /></p>
          <p className="text-xs text-gray-400 mt-1">персонажей в ростере</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-3xl font-bold text-gradient"><CountUp value={ACHIEVEMENTS_MOCK} /></p>
          <p className="text-xs text-gray-400 mt-1">достижений</p>
        </div>
        <div className="glass-panel p-4 text-center">
          <p className="text-3xl font-bold text-gradient"><CountUp value={mapPercent} />%</p>
          <p className="text-xs text-gray-400 mt-1">исследование карты</p>
        </div>
      </div>

      {/* Мой ростер */}
      <div className="glass-panel p-6">
        <h3 className="text-xl font-semibold text-ivory mb-4">Мой ростер ({profile.roster.length})</h3>

        {profile.roster.length === 0 ? (
          <p className="text-gray-500 text-sm mb-4">Пока пусто. Добавь персонажей формой ниже.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {profile.roster.map((r) => {
              const char = getCharacterById(r.characterId);
              if (!char) return null;
              return (
                <div key={r.characterId} className="p-3 rounded-xl bg-glass border border-glass-border flex items-center gap-3">
                  <ImagePlaceholder id={char.id} initials={char.name.slice(0, 2)} element={char.element} className="w-12 h-12 rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-ivory truncate">{char.name} · ур. {r.level}</p>
                    <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                      <Sword size={11} className="shrink-0" /> {r.weapon}
                      <span className="mx-0.5">·</span>
                      <Backpack size={11} className="shrink-0" /> {r.echoSet}
                    </p>
                  </div>
                  <button onClick={() => removeFromRoster(r.characterId)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-ring" aria-label={`Убрать ${char.name} из ростера`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-glass-border pt-4">
          <p className="text-sm text-gray-400 mb-3 flex items-center gap-2"><UserPlus size={16} /> Добавить персонажа:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <select value={pickId} onChange={(e) => setPickId(e.target.value)} className={inputClass} aria-label="Выбрать персонажа">
              <option value="">— персонаж —</option>
              {available.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="number" min={1} max={90} value={pickLevel} onChange={(e) => setPickLevel(Number(e.target.value))} className={inputClass} aria-label="Уровень" />
            <input value={pickWeapon} onChange={(e) => setPickWeapon(e.target.value)} placeholder="Оружие" className={inputClass} aria-label="Оружие" />
            <input value={pickEcho} onChange={(e) => setPickEcho(e.target.value)} placeholder="Эхо-набор" className={inputClass} aria-label="Эхо-набор" />
            <button onClick={addToRoster} disabled={!pickId} className="py-2 rounded-lg bg-gradient-to-r from-accent to-accent-light text-bg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow transition-all focus-ring">
              Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};