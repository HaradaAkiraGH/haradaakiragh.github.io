// Маркеры карты. Координаты: 1 единица = 1 тайл 12-го зума.
// Хуанлон занимает примерно x: -4..3, y: -3..4 (север = +y).
import { MapMarker } from './types';

export const MAP_MARKERS: MapMarker[] = [
  { id: 'm1', type: 'chest', position: [-0.5, 1.2], name: 'Богатый сундук пристани', description: 'Сундук с астритами у причала.', region: 'Huanglong' },
  { id: 'm2', type: 'puzzle', position: [0.8, 2.1], name: 'Монолиты долины', description: 'Активируй все монолиты по порядку.', region: 'Huanglong' },
  { id: 'm3', type: 'boss', position: [-2.2, -1.8], name: 'Bell-Borne Geochelone', description: 'Мировой босс. Требует команду 60+ уровня.', respawn: '24 часа', region: 'Huanglong' },
  { id: 'm4', type: 'echo', position: [1.5, 0.4], name: 'Элита: Crownless', description: 'Элитный враг, даёт эхо 4 cost.', respawn: '12 часов', region: 'Huanglong' },
  { id: 'm5', type: 'resource', position: [-3.1, -0.6], name: 'Залежи флуорита', description: 'Точка добычи руды для вознесения.', region: 'Huanglong' },
  { id: 'm6', type: 'viewpoint', position: [0.2, 3.0], name: 'Точка обзора: башня Цзиньчжоу', description: 'Открой вид на регион.', region: 'Huanglong' },
  { id: 'm7', type: 'chest', position: [2.4, -2.4], name: 'Сундук руин', description: 'Спрятан под обломками моста.', region: 'Huanglong' },
  { id: 'm8', type: 'puzzle', position: [-1.4, 2.6], name: 'Печати храма', description: 'Собери три печати в храме.', region: 'Huanglong' },
  { id: 'm9', type: 'chest', position: [0.5, -0.5], name: 'Сундук Ринаты', description: 'Первый сундук нового региона.', region: 'Rinata' },
  { id: 'm10', type: 'boss', position: [-2, -2], name: 'Lament', description: 'Босс региона Рината.', respawn: '24 часа', region: 'Rinata' },
  { id: 'm11', type: 'resource', position: [1, 1], name: 'Роща серебристых цветов', description: 'Ресурс для вознесения персонажей Ринаты.', region: 'Rinata' },
  { id: 'm12', type: 'viewpoint', position: [2, 2], name: 'Точка обзора: берег Ринаты', description: 'Открой вид на новый регион.', region: 'Rinata' },
];