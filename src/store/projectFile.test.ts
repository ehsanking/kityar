import { describe, expect, it } from 'vitest';
import { MAX_PROJECT_FILE_BYTES, parseProjectFile } from './projectFile';

const valid = {
  version: '1', canvasLayers: { cover: [{ id: 'a' }] }, infographicRows: [{ id: 'r' }],
  productName: 'n', productSubtitle: '', selectedFontId: 'vazirmatn',
  customGradient: { type: 'linear', stop1: '#000', stop2: '#fff' }, logoConfig: {}, canvasStickers: { cover: [{}] },
};

describe('parseProjectFile', () => {
  it('accepts a valid project and keeps known fields only', () => {
    const r = parseProjectFile(JSON.stringify({ ...valid, evil: '<script>' }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.canvasLayers).toEqual(valid.canvasLayers);
      expect(r.data.productSubtitle).toBe('');
      expect(r.data).not.toHaveProperty('evil');
    }
  });

  it('drops malformed optional fields', () => {
    const r = parseProjectFile(JSON.stringify({ ...valid, productName: 42, customGradient: 'x', canvasStickers: { cover: 'x' }, selectedFontId: 'f'.repeat(200) }));
    expect(r.ok && [r.data.productName, r.data.customGradient, r.data.canvasStickers, r.data.selectedFontId]).toEqual([undefined, undefined, undefined, undefined]);
  });

  it.each([
    ['invalid JSON', '{nope'],
    ['non-object', '[1,2]'],
    ['no design data', JSON.stringify({ productName: 'x' })],
    ['layers without ids', JSON.stringify({ canvasLayers: { cover: [{}] } })],
    ['oversized', 'x'.repeat(MAX_PROJECT_FILE_BYTES + 1)],
  ])('rejects %s', (_l, text) => {
    expect(parseProjectFile(text).ok).toBe(false);
  });
});
