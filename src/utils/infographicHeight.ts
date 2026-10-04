import type { CanvasLayerItem } from '../types/canvasLayers';

export const INFOGRAPHIC_BASE_HEIGHT = 430;
export const INFOGRAPHIC_TAIL_PADDING = 120;
const FALLBACK_LAYER_HEIGHT = 120;

/** Display height of the infographic canvas: grows with the lowest layer. */
export function getInfographicDisplayHeight(
  layers: CanvasLayerItem[] | undefined,
  baseHeight: number = INFOGRAPHIC_BASE_HEIGHT,
  maxHeight = Infinity,
): number {
  let bottom = 0;
  for (const layer of layers ?? []) {
    if (layer.type === 'background' || !layer.visible) continue;
    const h = (layer.data?.height ?? FALLBACK_LAYER_HEIGHT) * (layer.scale || 1);
    bottom = Math.max(bottom, layer.y + h);
  }
  const needed = bottom > 0 ? Math.ceil(bottom + INFOGRAPHIC_TAIL_PADDING) : 0;
  return Math.min(maxHeight, Math.max(baseHeight, needed));
}
