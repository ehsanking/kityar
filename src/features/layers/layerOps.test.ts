import { describe, expect, it } from 'vitest';
import { appendLayer, layersAtZIndex, moveLayer, patchLayer, patchLayerData, removeLayer, setFlagForZIndex, toggleLayerFlag } from './layerOps';
import type { CanvasLayerItem } from '../../types/canvasLayers';

const l = (id: string, extra: Partial<CanvasLayerItem> = {}) =>
  ({ id, name: id, type: 'text', visible: true, locked: false, zIndex: 10, data: { a: 1 }, ...extra }) as CanvasLayerItem;
const map = () => ({ cover: [l('a'), l('b', { zIndex: 20 }), l('c')], other: [l('z')] });

describe('layerOps', () => {
  it('patches one layer and keeps untouched references', () => {
    const m = map();
    const next = patchLayer(m, 'cover', 'b', { x: 5 });
    expect(next.cover[1].x).toBe(5);
    expect(next.cover[0]).toBe(m.cover[0]);
    expect(next.other).toBe(m.other);
  });

  it('returns the same map when nothing matches (no history entry)', () => {
    const m = map();
    expect(patchLayer(m, 'cover', 'missing', { x: 1 })).toBe(m);
    expect(removeLayer(m, 'cover', 'missing')).toBe(m);
    expect(moveLayer(m, 'cover', 'c', 'up')).toBe(m);
    expect(moveLayer(m, 'cover', 'a', 'down')).toBe(m);
    expect(setFlagForZIndex(m, 'cover', 20, 'visible', true)).toBe(m);
  });

  it('merges layer data', () => {
    const next = patchLayerData(map(), 'cover', 'a', { b: 2 });
    expect(next.cover[0].data).toEqual({ a: 1, b: 2 });
  });

  it('toggles flags', () => {
    expect(toggleLayerFlag(map(), 'cover', 'a', 'locked').cover[0].locked).toBe(true);
    expect(toggleLayerFlag(map(), 'cover', 'a', 'visible').cover[0].visible).toBe(false);
  });

  it('moves layers up/down', () => {
    expect(moveLayer(map(), 'cover', 'a', 'up').cover.map((x) => x.id)).toEqual(['b', 'a', 'c']);
    expect(moveLayer(map(), 'cover', 'c', 'down').cover.map((x) => x.id)).toEqual(['a', 'c', 'b']);
  });

  it('removes and appends, creating missing assets', () => {
    expect(removeLayer(map(), 'cover', 'b').cover.map((x) => x.id)).toEqual(['a', 'c']);
    expect(appendLayer(map(), 'new', l('n')).new.map((x) => x.id)).toEqual(['n']);
  });

  it('sets a flag for every layer at a z-index (default 10)', () => {
    const m = { cover: [l('a'), l('b', { zIndex: undefined }), l('c', { zIndex: 20 })] };
    expect(layersAtZIndex(m, 'cover', 10).map((x) => x.id)).toEqual(['a', 'b']);
    const next = setFlagForZIndex(m, 'cover', 10, 'visible', false);
    expect(next.cover.map((x) => x.visible)).toEqual([false, false, true]);
  });
});
