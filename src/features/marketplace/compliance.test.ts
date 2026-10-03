import { describe, expect, it } from 'vitest';
import { checkCompliance, type LayerMeasure } from './compliance';
import { MARKETPLACES, getAssetSpec } from './specs';

const cover = MARKETPLACES.zhaket.assets.cover400;
const L = (id: string, rect: [number, number, number, number], extra: Partial<LayerMeasure> = {}): LayerMeasure => ({
  id, name: id, type: 'text', rect: { left: rect[0], top: rect[1], right: rect[2], bottom: rect[3] }, minFontPx: null, ...extra,
});
const bg = L('bg', [0, 0, 1, 1], { type: 'background' });
const codes = (layers: LayerMeasure[], spec = cover) => checkCompliance(spec, layers).issues.map((i) => `${i.severity}:${i.code}`);

describe('checkCompliance', () => {
  it('passes a clean design with full score', () => {
    const r = checkCompliance(cover, [bg, L('t', [0.2, 0.2, 0.8, 0.4], { minFontPx: 24 })]);
    expect(r).toMatchObject({ issues: [], score: 100, passed: true });
  });

  it('flags an empty canvas', () => {
    expect(codes([bg])).toEqual(['error:empty']);
  });

  it('distinguishes fully outside (error) from clipped (warning)', () => {
    expect(codes([bg, L('a', [1.1, 0.2, 1.3, 0.3])])).toEqual(['error:out-of-canvas']);
    expect(codes([bg, L('a', [0.8, 0.2, 1.2, 0.3])])).toEqual(['warning:out-of-canvas']);
  });

  it('warns about text outside the safe area but not about decorative shapes', () => {
    expect(codes([bg, L('t', [0.01, 0.2, 0.5, 0.3], { minFontPx: 30 })])).toEqual(['warning:safe-area']);
    expect(codes([bg, L('shape', [0.01, 0.2, 0.5, 0.3], { type: 'shape' })])).toEqual([]);
  });

  it('grades small text as warning, very small as error', () => {
    expect(codes([bg, L('t', [0.2, 0.2, 0.5, 0.3], { minFontPx: cover.minFontPx - 1 })])).toEqual(['warning:small-text']);
    expect(codes([bg, L('t', [0.2, 0.2, 0.5, 0.3], { minFontPx: 4 })])).toEqual(['error:small-text']);
  });

  it('warns about any text on icons/logos', () => {
    expect(codes([bg, L('t', [0.2, 0.2, 0.5, 0.3], { minFontPx: 40 })], MARKETPLACES.zhaket.assets.logo80)).toEqual(['warning:text-on-icon']);
  });

  it('limits feature pills where the spec says so', () => {
    const pills = Array.from({ length: 5 }, (_, i) => L(`p${i}`, [0.2, 0.2, 0.3, 0.3], { type: 'feature-pills' }));
    expect(codes([bg, ...pills])).toEqual(['warning:too-many-pills']);
  });

  it('scores errors and warnings and never goes below zero', () => {
    const r = checkCompliance(cover, [bg, ...Array.from({ length: 6 }, (_, i) => L(`o${i}`, [2, 2, 3, 3]))]);
    expect(r.score).toBe(0);
    expect(r.passed).toBe(false);
  });
});

describe('getAssetSpec', () => {
  it('returns platform specs, custom sizes and a safe fallback', () => {
    expect(getAssetSpec('zhaket', 'infographic')).toMatchObject({ width: 594, height: 4000 });
    expect(getAssetSpec('custom', 'cover400', { width: 300, height: 200 })).toMatchObject({ width: 300, height: 200 });
    expect(getAssetSpec('unknown', 'nope')).toMatchObject({ width: 400, height: 400 });
  });

  it('resolves infographic export dimensions for each selected target', () => {
    expect(getAssetSpec('rastchin', 'infographic')).toMatchObject({ width: 800, height: 400 });
    expect(getAssetSpec('bazaar', 'infographic')).toMatchObject({ width: 1200, height: 628 });
    expect(getAssetSpec('custom', 'infographic', { width: 900, height: 500 })).toMatchObject({ width: 900, height: 500 });
  });
});
