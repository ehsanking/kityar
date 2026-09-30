// Pure, immutable operations on the per-asset layers map. Every function returns the
// same `map` reference when nothing changes, so the store records no history entry.
import type { CanvasLayerItem } from '../../types/canvasLayers';
import type { CanvasLayersMap } from '../../store/studioStore';

const DEFAULT_Z_INDEX = 10;

const withAsset = (map: CanvasLayersMap, asset: string, next: CanvasLayerItem[]): CanvasLayersMap =>
  next === map[asset] ? map : { ...map, [asset]: next };

/** Maps the layers of one asset; keeps references when the mapper returns the same layer. */
const mapAsset = (
  map: CanvasLayersMap,
  asset: string,
  fn: (layer: CanvasLayerItem) => CanvasLayerItem,
): CanvasLayersMap => {
  const list = map[asset] || [];
  let changed = false;
  const next = list.map((l) => {
    const r = fn(l);
    if (r !== l) changed = true;
    return r;
  });
  return changed ? withAsset(map, asset, next) : map;
};

export const patchLayer = (
  map: CanvasLayersMap,
  asset: string,
  id: string,
  updates: Partial<CanvasLayerItem>,
): CanvasLayersMap => mapAsset(map, asset, (l) => (l.id === id ? { ...l, ...updates } : l));

export const patchLayerData = (
  map: CanvasLayersMap,
  asset: string,
  id: string,
  data: Record<string, unknown>,
): CanvasLayersMap => mapAsset(map, asset, (l) => (l.id === id ? { ...l, data: { ...l.data, ...data } } : l));

export const toggleLayerFlag = (
  map: CanvasLayersMap,
  asset: string,
  id: string,
  flag: 'visible' | 'locked',
): CanvasLayersMap => mapAsset(map, asset, (l) => (l.id === id ? { ...l, [flag]: !l[flag] } : l));

/** Sets a flag on every layer sharing `zIndex`; returns how many layers were targeted. */
export const setFlagForZIndex = (
  map: CanvasLayersMap,
  asset: string,
  zIndex: number,
  flag: 'visible' | 'locked',
  value: boolean,
): CanvasLayersMap =>
  mapAsset(map, asset, (l) => ((l.zIndex ?? DEFAULT_Z_INDEX) === zIndex && l[flag] !== value ? { ...l, [flag]: value } : l));

export const layersAtZIndex = (map: CanvasLayersMap, asset: string, zIndex: number): CanvasLayerItem[] =>
  (map[asset] || []).filter((l) => (l.zIndex ?? DEFAULT_Z_INDEX) === zIndex);

/** Swaps a layer with its neighbour. 'up' moves it later in the list (drawn on top). */
export const moveLayer = (
  map: CanvasLayersMap,
  asset: string,
  id: string,
  direction: 'up' | 'down',
): CanvasLayersMap => {
  const list = map[asset] || [];
  const idx = list.findIndex((l) => l.id === id);
  const target = direction === 'up' ? idx + 1 : idx - 1;
  if (idx === -1 || target < 0 || target >= list.length) return map;
  const next = list.slice();
  [next[idx], next[target]] = [next[target], next[idx]];
  return withAsset(map, asset, next);
};

export const removeLayer = (map: CanvasLayersMap, asset: string, id: string): CanvasLayersMap => {
  const list = map[asset] || [];
  const next = list.filter((l) => l.id !== id);
  return next.length === list.length ? map : withAsset(map, asset, next);
};

export const appendLayer = (map: CanvasLayersMap, asset: string, layer: CanvasLayerItem): CanvasLayersMap =>
  withAsset(map, asset, [...(map[asset] || []), layer]);

export const replaceAssetLayers = (map: CanvasLayersMap, asset: string, layers: CanvasLayerItem[]): CanvasLayersMap =>
  withAsset(map, asset, layers);
