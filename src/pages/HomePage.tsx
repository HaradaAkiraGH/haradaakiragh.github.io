// Главная страница Stellar Wiki в эстетике Liquid Glass:
// 1) Без блоков «Лидеры меты» и «Резонатор на сегодня»
// 2) Динамические горизонтальные плитки (редактируемые и добавляемые через /admin)
// 3) В плитках нет иконок: справа на 50% ширины расположена картинка, которая плавно растворяется влево
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sliders, ArrowUpRight } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { BUILTIN_MATERIALS } from '../data/materialsCatalog';
import { useAuth } from '../hooks/useAuth';
import {
  getHomeTiles,
  initAdminRuntimeSync,
  HomeTileItem,
} from '../utils/adminStorage';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export const HomePage = () => {
  useDocumentMeta({
    title: 'Stellar Wiki — Энциклопедия и Терминал Wuthering Waves',
    description:
      'Интерактивная база данных Wuthering Waves (Соларис-3): каталог резонаторов, мета-тирлист Prydwen, бестиарий 163 материалов, трекер круток и карта.',
  });

  const { user } = useAuth();
  const [tiles, setTiles] = useState<HomeTileItem[]>(() => getHomeTiles());

  useEffect(() => {
    initAdminRuntimeSync().then(() => {
      setTiles(getHomeTiles());
    });
  }, []);

  return (
    <div className="space-y-9 pb-14 w-full animate-fade-in">
      <style>{`
        main > div {
          max-width: 1540px !important;
        }
      `}</style>

      {/* ==================== ГЛАВНЫЙ БАННЕР В СТИЛЕ LIQUID GLASS ==================== */}
      <section className="glass-panel relative overflow-hidden p-7 sm:p-11 lg:p-14">
        {/* Жидкие световые рефлексы на фоне */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -left-24 w-96 h-96 rounded-full bg-[#caa07d]/20 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-10 w-[420px] h-[420px] rounded-full bg-purple-500/15 blur-[130px]"
        />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full liquid-pill text-[11px] font-black uppercase tracking-[0.22em] text-ivory">
            <span className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_10px_#fcd34d]" />
            <span>SOLARIS-3 ARCHIVE · LIQUID GLASS TERMINAL</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gradient leading-[1.06]">
            Stellar Wiki
          </h1>

          <p className="text-sm sm:text-base text-gray-200/90 leading-relaxed max-w-2xl">
            Полная интерактивная база данных Wuthering Waves: детальные билды на всех{' '}
            <strong className="text-white">{CHARACTERS.length}</strong> резонаторов, архив из{' '}
            <strong className="text-white">{BUILTIN_MATERIALS.length}</strong> материалов,
            актуальный тир-лист Prydwen, аналитика круток и навигатор Соларис-3.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/characters"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#caa07d] via-[#e6c8ad] to-[#f7ece6] text-[#09090b] text-xs sm:text-sm font-black shadow-[0_12px_32px_rgba(202,160,125,0.35)] hover:brightness-105 transition-all"
            >
              Открыть каталог резонаторов
            </Link>

            <Link
              to="/meta"
              className="px-5 py-3 rounded-2xl liquid-pill text-xs sm:text-sm font-extrabold text-ivory hover:border-white/35 transition-all"
            >
              Тир-лист Prydwen (T0–T3)
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl liquid-pill text-xs font-extrabold text-amber-200 hover:border-amber-300/40 transition-all"
              >
                <Sliders size={14} />
                <span>Настроить плитки Главной</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ==================== ГОРИЗОНТАЛЬНЫЕ ПЛИТКИ LIQUID GLASS (БЕЗ ИКОНОК, КАРТИНКА НА 50% СПРАВА С РАСТВОРЕНИЕМ ВЛЕВО) ==================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Разделы и Терминалы Соларис-3
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Быстрый переход ко всем модулям энциклопедии и инструментам аккаунта
            </p>
          </div>

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-3.5 py-2 rounded-xl liquid-pill text-xs font-extrabold text-accent-light hover:text-white transition-colors"
            >
              + Добавить / изменить панельки
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tiles.map((tile) => {
            const posX = tile.imagePosX ?? 50;
            const posY = tile.imagePosY ?? 30;
            const scale = tile.imageScale ?? 105;

            return (
              <Link
                key={tile.id}
                to={tile.path || '/characters'}
                className="group glass-panel-hover relative overflow-hidden min-h-[195px] sm:min-h-[215px] p-6 sm:p-7 flex flex-col justify-between focus-ring"
              >
                {/* ПРАВАЯ ПОЛОВИНА ПЛИТКИ (50% ширины): Картинка, плавно исчезающая влево */}
                {tile.image && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute inset-y-0 right-0 w-[56%] sm:w-1/2 overflow-hidden tile-image-fade-left"
                  >
                    <img
                      src={tile.image}
                      alt=""
                      draggable={false}
                      style={{
                        objectPosition: `${posX}% ${posY}%`,
                        transformOrigin: `${posX}% ${posY}%`,
                        transform: `scale(${scale / 100})`,
                      }}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-700 ease-out"
                    />
                    {/* Дополнительная мягкая вуаль слева и снизу для идеального слияния со стеклом */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c14] via-transparent to-transparent opacity-65" />
                  </div>
                )}

                {/* ЛЕВАЯ ЧАСТЬ ПЛИТКИ: Чистая типографика без иконок */}
                <div className="relative z-10 max-w-[64%] sm:max-w-[60%] space-y-2.5">
                  {tile.badge && (
                    <span className="inline-block px-3 py-1 rounded-full liquid-pill text-[10px] font-black uppercase tracking-[0.18em] text-accent-light">
                      {tile.badge}
                    </span>
                  )}

                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-accent-light transition-colors leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {tile.title}
                  </h3>

                  <p className="text-xs sm:text-[13px] text-gray-300/95 leading-relaxed line-clamp-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {tile.description}
                  </p>
                </div>

                {/* Нижняя строка перехода */}
                <div className="relative z-10 pt-4 flex items-center gap-1.5 text-xs font-extrabold text-accent-light group-hover:translate-x-1 transition-transform">
                  <span>Открыть раздел</span>
                  <ArrowUpRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default HomePage;