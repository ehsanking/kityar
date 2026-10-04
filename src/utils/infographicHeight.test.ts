import { describe, expect, it } from 'vitest';
import { getInfographicDisplayHeight } from './infographicHeight';
import type { CanvasLayerItem } from '../types/canvasLayers';

const layer = (y: number, height: number, extra: Partial<CanvasLayerItem> = {}): CanvasLayerItem => ({
  id: 'l', name: 'l', type: 'text', visible: true, locked: false, zIndex: 1,
  scale: 1, rotation: 0, opacity: 100, x: 0, y, data: { height }, ...extra,
});

describe('getInfographicDisplayHeight', () => {
  it('keeps the base height without layers', () => {
    expect(getInfographicDisplayHeight([])).toBe(430);
    expect(getInfographicDisplayHeight(undefined)).toBe(430);
  });
  it('grows below the lowest layer', () => {
    expect(getInfographicDisplayHeight([layer(600, 100)])).toBe(820);
  });
  it('ignores hidden and background layers and honours scale', () => {
    expect(getInfographicDisplayHeight([layer(900, 100, { visible: false }), layer(900, 100, { type: 'background' })])).toBe(430);
    expect(getInfographicDisplayHeight([layer(500, 100, { scale: 2 })])).toBe(820);
  });
  it('caps at maxHeight', () => {
    expect(getInfographicDisplayHeight([layer(9000, 100)], 430, 3000)).toBe(3000);
  });
});
