// Интерактивная карта: тайлы Хуанлуна с CDN, маркеры-иконки, плавающий HUD.
// Мобильный вид: HUD — нижняя шторка до 45% экрана, панель координат сверху,
// высота карты учитывает safe-area таб-бара.
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, Tooltip, ImageOverlay, useMap, useMapEvents } from 'react-leaflet';
import * as L from 'leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { Plus, Minus, Maximize, Crosshair, Copy, Check, SlidersHorizontal, X, Clock } from 'lucide-react';
import { MAP_MARKERS } from '../data/map';
import { MARKER_TYPES } from '../utils/constants';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { MapMarkerType } from '../data/types';
import { TilesLayer, huanglongBounds, GameCRS } from '../components/map/TilesLayer';

const ALL_TYPES = Object.keys(MARKER_TYPES) as MapMarkerType[];

interface RegionConfig {
  label: string;
  bounds: LatLngBoundsExpression;
  center: [number, number];
  image?: string;
}
const REGIONS: Record<'Huanglong' | 'Rinata', RegionConfig> = {
  Huanglong: { label: 'Хуанлон', bounds: huanglongBounds, center: [-0.5, -0.5] },
  Rinata: { label: 'Рината', bounds: [[-6, -6], [6, 6]], center: [-0.5, -0.5], image: '/maps/rinata.png' },
};
type RegionId = keyof typeof REGIONS;

const RegionController = ({ region }: { region: RegionId }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(REGIONS[region].bounds, { padding: [24, 24] });
  }, [region, map]);
  return null;
};
const MapClickCatcher = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onPick(Number(e.latlng.lat.toFixed(2)), Number(e.latlng.lng.toFixed(2)));
    },
  });
  return null;
};
const MapRefSetter = ({ onMap }: { onMap: (m: L.Map) => void }) => {
  const map = useMap();
  useEffect(() => {
    onMap(map);
  }, [map, onMap]);
  return null;
};
const ZoomButtons = ({ map, region, editMode, setEditMode }: { map: L.Map | null; region: RegionId; editMode: boolean; setEditMode: (v: boolean) => void }) => {
  const btn = 'w-9 h-9 rounded-lg bg-bg-secondary/90 border border-glass-border text-white hover:border-accent/50 flex items-center justify-center focus-ring';
  return (
    <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
      <button className={btn} onClick={() => setEditMode(!editMode)} title="Режим расстановки: клик по карте даст координаты" aria-label="Режим расстановки маркеров">
        <Crosshair size={16} className={editMode ? 'text-accent-light' : ''} />
      </button>
      <button className={btn} onClick={() => map?.zoomIn()} aria-label="Приблизить"><Plus size={16} /></button>
      <button className={btn} onClick={() => map?.zoomOut()} aria-label="Отдалить"><Minus size={16} /></button>
      <button className={btn} onClick={() => map?.fitBounds(REGIONS[region].bounds, { padding: [24, 24] })} aria-label="Показать весь регион"><Maximize size={16} /></button>
    </div>
  );
};
const markerIcon = (type: MapMarkerType, isDone: boolean) =>
  L.divIcon({
    className: 'ww-marker',
    html: `<img src="${MARKER_TYPES[type].icon}" alt="" style="width:30px;height:30px;${
      isDone ? 'filter:grayscale(1);opacity:.45;' : 'filter:drop-shadow(0 0 6px rgba(202,160,125,.75));'
    }" />`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
    tooltipAnchor: [0, -18],
  });

export const MapPage = () => {
  const [collected, setCollected] = useLocalStorage<string[]>('ww_map_collected', []);
  const [region, setRegion] = useState<RegionId>('Huanglong');
  const [activeTypes, setActiveTypes] = useState<MapMarkerType[]>(ALL_TYPES);
  const [hideCollected, setHideCollected] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [picked, setPicked] = useState<[number, number] | null>(null);
  const [copied, setCopied] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [hudOpen, setHudOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [hasImage, setHasImage] = useState<Record<string, boolean>>({});
  useEffect(() => {
    (Object.keys(REGIONS) as RegionId[]).forEach((r) => {
      const img = REGIONS[r].image;
      if (!img) return;
      fetch(img).then((res) => setHasImage((p) => ({ ...p, [r]: res.ok }))).catch(() => {});
    });
  }, []);
  const toggleCollected = (id: string) => {
    setCollected(collected.includes(id) ? collected.filter((c) => c !== id) : [...collected, id]);
  };
  const toggleType = (t: MapMarkerType) => {
    setActiveTypes(activeTypes.includes(t) ? activeTypes.filter((x) => x !== t) : [...activeTypes, t]);
  };
  const copyPicked = async () => {
    if (!picked) return;
    await navigator.clipboard.writeText(`[${picked[0]}, ${picked[1]}]`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const visible = MAP_MARKERS.filter((m) => {
    if (m.region !== region) return false;
    if (!activeTypes.includes(m.type)) return false;
    if (hideCollected && collected.includes(m.id)) return false;
    return true;
  });
  const regionMarkers = MAP_MARKERS.filter((m) => m.region === region);
  const regionCollected = regionMarkers.filter((m) => collected.includes(m.id)).length;
  return (
    <div className="relative h-[calc(100vh-6rem-env(safe-area-inset-bottom,0px))] md:h-[calc(100vh-4rem)]">
      {/* Карта на всю область */}
      <div className="absolute inset-0 glass-panel overflow-hidden">
        <MapContainer
          center={REGIONS[region].center}
          zoom={12}
          minZoom={10}
          maxZoom={16}
          zoomSnap={0.25}
          crs={GameCRS}
          zoomControl={false}
          className="w-full h-full absolute inset-0 z-0"
        >
          <RegionController region={region} />
          <MapClickCatcher onPick={(lat, lng) => { if (editMode) setPicked([lat, lng]); }} />
          <MapRefSetter onMap={setMap} />
          {region === 'Huanglong' && <TilesLayer />}
          {region === 'Rinata' && hasImage.Rinata && REGIONS.Rinata.image && (
            <ImageOverlay url={REGIONS.Rinata.image} bounds={REGIONS.Rinata.bounds} />
          )}
          {visible.map((m) => {
            const isDone = collected.includes(m.id);
            return (
              <Marker key={m.id} position={m.position} icon={markerIcon(m.type, isDone)}>
                <Tooltip direction="top" offset={[0, -8]}>{m.name}</Tooltip>
                <Popup>
                  <div className="min-w-[200px]">
                    <h4 className="font-bold text-base mb-1 text-white">{m.name}</h4>
                    <p className="text-xs mb-2" style={{ color: MARKER_TYPES[m.type].color }}>{MARKER_TYPES[m.type].label}</p>
                    <p className="text-sm text-gray-300 mb-2">{m.description}</p>
                    {m.respawn && (
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                        <Clock size={11} className="shrink-0" /> Респаун: {m.respawn}
                      </p>
                    )}
                    <button
                      onClick={() => toggleCollected(m.id)}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                        isDone ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-purple-600 text-white hover:bg-purple-500'
                      }`}
                    >
                      {isDone ? 'Собрано — нажать, чтобы снять' : 'Отметить собранным'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <ZoomButtons map={map} region={region} editMode={editMode} setEditMode={setEditMode} />
      </div>
      {/* HUD: на телефоне — нижняя шторка, на десктопе — левая колонка */}
      {hudOpen ? (
        <div className="absolute z-[550] glass-panel p-4 flex flex-col gap-4 overflow-y-auto animate-fade-in left-4 right-4 bottom-4 max-h-[45vh] lg:left-4 lg:right-auto lg:top-4 lg:bottom-4 lg:max-h-none lg:w-72 lg:max-w-[85vw] lg:gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ivory">Фильтры карты</h3>
            <button
              onClick={() => setHudOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-ivory hover:bg-glass-hover transition-colors focus-ring"
              aria-label="Свернуть панель фильтров"
            >
              <X size={16} />
            </button>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Регион</p>
            <div className="flex gap-2">
              {(Object.keys(REGIONS) as RegionId[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-all focus-ring ${
                    region === r ? 'bg-accent/20 border-accent/40 text-ivory shadow-glow-sm' : 'bg-glass border-glass-border text-gray-400 hover:text-ivory'
                  }`}
                >
                  {REGIONS[r].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Типы объектов</p>
            <div className="space-y-2">
              {ALL_TYPES.map((t) => {
                const total = regionMarkers.filter((m) => m.type === t).length;
                const done = regionMarkers.filter((m) => m.type === t && collected.includes(m.id)).length;
                return (
                  <label key={t} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-ivory transition-colors">
                    <input type="checkbox" checked={activeTypes.includes(t)} onChange={() => toggleType(t)} className="rounded" />
                    <img src={MARKER_TYPES[t].icon} alt="" className="w-5 h-5" />
                    <span className="flex-1">{MARKER_TYPES[t].label}</span>
                    <span className="text-xs text-gray-500">{done}/{total}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-ivory transition-colors">
            <input type="checkbox" checked={hideCollected} onChange={(e) => setHideCollected(e.target.checked)} className="rounded" />
            Скрыть собранные
          </label>
          <div className="mt-auto pt-4 border-t border-glass-border">
            <p className="text-sm text-gray-400 mb-2">Собрано в регионе: <span className="text-ivory font-semibold">{regionCollected}</span> / {regionMarkers.length}</p>
            <div className="h-2 rounded-full bg-bg-secondary overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-300" style={{ width: `${regionMarkers.length ? (regionCollected / regionMarkers.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setHudOpen(true)}
          className="absolute top-4 left-4 z-[550] w-10 h-10 rounded-xl glass-panel flex items-center justify-center text-gray-300 hover:text-ivory hover:border-accent/50 transition-all focus-ring"
          aria-label="Открыть панель фильтров"
          title="Открыть фильтры"
        >
          <SlidersHorizontal size={18} />
        </button>
      )}
      {/* Панель координат: на телефоне сверху (низ занят HUD-шторкой), на десктопе снизу */}
      {editMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[550] glass-panel p-3 flex items-center gap-3 animate-fade-in lg:top-auto lg:bottom-4 max-w-[92vw]">
          <span className="text-xs text-gray-400 shrink-0">Кликни по карте →</span>
          {picked ? (
            <>
              <code className="text-sm text-accent-light font-mono truncate">{`position: [${picked[0]}, ${picked[1]}]`}</code>
              <button onClick={copyPicked} className="p-1.5 rounded-lg bg-glass border border-glass-border hover:border-accent/50 focus-ring shrink-0" aria-label="Скопировать координаты">
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-gray-300" />}
              </button>
            </>
          ) : (
            <span className="text-sm text-gray-500">—</span>
          )}
        </div>
      )}
    </div>
  );
};