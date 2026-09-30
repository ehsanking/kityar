import { describe, expect, it } from 'vitest';
import { formatRgba, isColor, parseColor, toHex6, toRgba, withAlpha } from './color';

describe('color utils', () => {
  it.each([
    ['#fff', { r: 255, g: 255, b: 255, a: 1 }],
    ['#0f766e', { r: 15, g: 118, b: 110, a: 1 }],
    ['#00000080', { r: 0, g: 0, b: 0, a: 0.502 }],
    ['rgb(10, 20, 30)', { r: 10, g: 20, b: 30, a: 1 }],
    ['rgba(10,20,30,0.25)', { r: 10, g: 20, b: 30, a: 0.25 }],
    ['rgb(10 20 30 / 50%)', { r: 10, g: 20, b: 30, a: 0.5 }],
  ])('parses %s', (input, expected) => expect(parseColor(input)).toEqual(expected));

  it('rejects non-colours (e.g. Tailwind classes)', () => {
    for (const v of ['text-amber-400', 'red', '#12', 'rgba(1,2)', '', null]) expect(parseColor(v as any)).toBeNull();
    expect(isColor('#abc')).toBe(true);
    expect(isColor(12)).toBe(false);
  });

  it('formats, normalises and converts', () => {
    expect(formatRgba({ r: 1, g: 2, b: 3, a: 0.5 })).toBe('rgba(1, 2, 3, 0.5)');
    expect(toRgba('#ff000080')).toBe('rgba(255, 0, 0, 0.502)');
    expect(toRgba('text-amber-400')).toBe('text-amber-400');
    expect(toHex6('rgba(255, 0, 16, 0.3)')).toBe('#ff0010');
  });

  it('withAlpha multiplies existing alpha', () => {
    expect(withAlpha('#fbbf24', 0.5)).toBe('rgba(251, 191, 36, 0.5)');
    expect(withAlpha('rgba(0, 0, 0, 0.5)', 0.5)).toBe('rgba(0, 0, 0, 0.25)');
  });
});
