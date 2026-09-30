import { describe, expect, it } from 'vitest';
import { DEFAULT_BRAND_KIT, applyBrandToLayers, brandGradient, isBrandKit, loadBrandKit, saveBrandKit } from './brandKit';

const kit = { ...DEFAULT_BRAND_KIT, textColor: '#ff0000', primary: '#111111' };

describe('brand kit', () => {
  it('validates, saves and loads', () => {
    const data = new Map<string, string>();
    const storage = { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
    expect(saveBrandKit(storage, kit)).toBe(true);
    expect(loadBrandKit(storage)).toEqual(kit);
    expect(isBrandKit({ ...kit, primary: 'red' })).toBe(false);
    expect(loadBrandKit({ getItem: () => '{bad' })).toBeNull();
    expect(loadBrandKit(undefined)).toBeNull();
  });

  it('maps colours onto the gradient', () => {
    expect(brandGradient(kit, { type: 'linear', stop1: '', stop2: '', stop3: '', angle: 90, opacity: 100 } as any)).toMatchObject({ stop1: '#111111', angle: 90 });
  });

  it('recolours text layers only and keeps references when nothing changes', () => {
    const shape = { id: 's', type: 'shape', data: {} } as any;
    const map = { a: [{ id: 't', type: 'text', data: { textColor: '#fff' } } as any, shape], b: [shape] };
    const next = applyBrandToLayers(map, kit);
    expect(next.a[0].data?.textColor).toBe('#ff0000');
    expect(next.a[1]).toBe(shape);
    expect(next.b).toBe(map.b);
    expect(applyBrandToLayers(next, kit)).toBe(next);
  });
});
