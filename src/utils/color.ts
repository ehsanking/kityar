// Colour helpers shared by every colour picker. The app stores colours as CSS strings;
// new values are written as rgba(...) so transparency is always editable, while older
// hex values keep working.

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Parses #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(...) and rgba(...) (comma or space syntax). */
export function parseColor(input: string | null | undefined): Rgba | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  const hex = s.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? Math.round((n(6) / 255) * 1000) / 1000 : 1 };
  }

  const fn = s.match(/^rgba?\(\s*([^)]+)\)$/);
  if (fn) {
    const parts = fn[1].split(/[\s,/]+/).filter(Boolean);
    if (parts.length < 3 || parts.length > 4) return null;
    const channel = (p: string) => (p.endsWith('%') ? (parseFloat(p) / 100) * 255 : parseFloat(p));
    const [r, g, b] = parts.slice(0, 3).map(channel);
    const a = parts[3] === undefined ? 1 : parts[3].endsWith('%') ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]);
    if ([r, g, b, a].some((v) => Number.isNaN(v))) return null;
    return { r: clamp(Math.round(r), 0, 255), g: clamp(Math.round(g), 0, 255), b: clamp(Math.round(b), 0, 255), a: clamp(a, 0, 1) };
  }
  return null;
}

export const isColor = (input: unknown): input is string => typeof input === 'string' && parseColor(input) !== null;

export const formatRgba = ({ r, g, b, a }: Rgba): string =>
  `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;

/** Normalises any supported colour to rgba(...); returns the input unchanged if unparseable. */
export const toRgba = (input: string): string => {
  const c = parseColor(input);
  return c ? formatRgba(c) : input;
};

/** Same colour with its alpha multiplied by `alpha` (0–1); replaces `${hex}aa`-style suffixes. */
export const withAlpha = (input: string, alpha: number): string => {
  const c = parseColor(input);
  return c ? formatRgba({ ...c, a: clamp(c.a * alpha, 0, 1) }) : input;
};

/** #rrggbb for APIs that cannot take alpha (e.g. <input type="color">). */
export const toHex6 = (input: string): string => {
  const c = parseColor(input);
  if (!c) return '#000000';
  return `#${[c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};
