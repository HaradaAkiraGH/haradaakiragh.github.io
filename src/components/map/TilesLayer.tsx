// Тайлы Хуанлуна с CDN игры через прокси /wwtiles.
// 1 единица координат = 1 тайл 12-го зума; строки сервера считаем снизу вверх.
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';

// Кастомная CRS: масштаб привязан к 12-му зуму сервера
export const GameCRS: any = {
  ...L.CRS.Simple,
  scale: (zoom: number) => 256 * Math.pow(2, zoom - 12),
  zoom: (scale: number) => Math.log2(scale / 256) + 12,
};

// Границы Хуанлуна в тайлах 12-го зума
export const huanglongBounds: [[number, number], [number, number]] = [
  [-6, -6],
  [6, 6],
];

// Прозрачный пиксель: заглушка для тайла, которого реально нет на сервере
const BLANK_TILE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const GameTileLayer = (L.TileLayer as any).extend({
  getTileUrl(coords: any): string {
    const x = coords.x;
    const y = -coords.y - 1; // сервер считает строки снизу вверх
    const z = coords.z;
    return `/wwtiles/ww/map-main/v13-rc1/${z}/tile-${x}_${y}.jpg`;
  },
});

export const TilesLayer = () => {
  const map = useMap();

  useEffect(() => {
    const layer = new GameTileLayer('', {
      minZoom: 10,
      minNativeZoom: 12,
      maxNativeZoom: 15,
      maxZoom: 16,
      tileSize: 256,
      noWrap: true,
      updateWhenIdle: false,
      errorTileUrl: BLANK_TILE,
      bounds: L.latLngBounds(huanglongBounds),
    });

    // АВТОРЕТРАЙ: если тайл отвалился (сеть/прокси мигнули),
    // пробуем ещё до 3 раз с нарастающей задержкой — дыры зарастают сами
    const retries = new WeakMap<HTMLImageElement, number>();
    const handleTileError = (e: any) => {
      const img = e.tile as HTMLImageElement;
      const attempt = retries.get(img) ?? 0;
      if (attempt >= 3) return; // сдаёмся: значит тайла реально нет на сервере
      retries.set(img, attempt + 1);
      const base = img.src.split('?retry=')[0];
      setTimeout(() => {
        img.src = `${base}?retry=${attempt + 1}`;
      }, 250 * (attempt + 1));
    };
    layer.on('tileerror', handleTileError);

    layer.addTo(map);
    return () => {
      layer.off('tileerror', handleTileError);
      layer.remove();
    };
  }, [map]);

  return null;
};