import type { CustomGradientConfig, ZhaketProjectData } from '../types/canvasLayers';
import { isLayersMap, isRows } from './persistence';

export const MAX_PROJECT_FILE_BYTES = 50 * 1024 * 1024;

export type ProjectImport = Partial<
  Pick<
    ZhaketProjectData,
    'canvasLayers' | 'infographicRows' | 'customGradient' | 'productName' | 'productSubtitle' | 'selectedFontId' | 'logoConfig' | 'canvasStickers'
  >
>;

export type ParseResult = { ok: true; data: ProjectImport } | { ok: false; error: string };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, max = 500) => (typeof v === 'string' && v.length <= max ? v : undefined);

const isGradient = (v: unknown): v is CustomGradientConfig =>
  isObj(v) && typeof v.type === 'string' && typeof v.stop1 === 'string' && typeof v.stop2 === 'string';

const isStickers = (v: unknown): v is Record<string, unknown[]> =>
  isObj(v) && Object.values(v).every((list) => Array.isArray(list) && list.every(isObj));

/**
 * Validates an imported project file. Only known, well-formed fields are returned; anything
 * malformed is dropped, and a file with no usable design data is rejected. SVG inside layers
 * is still sanitized at render time.
 */
export function parseProjectFile(text: string): ParseResult {
  if (text.length > MAX_PROJECT_FILE_BYTES) return { ok: false, error: 'حجم فایل پروژه بیش از حد مجاز است.' };

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'فایل انتخاب‌شده JSON معتبر نیست.' };
  }
  if (!isObj(raw)) return { ok: false, error: 'ساختار فایل پروژه نامعتبر است.' };

  const data: ProjectImport = {};
  if (isLayersMap(raw.canvasLayers)) data.canvasLayers = raw.canvasLayers;
  if (isRows(raw.infographicRows)) data.infographicRows = raw.infographicRows;
  if (!data.canvasLayers && !data.infographicRows) {
    return { ok: false, error: 'فایل هیچ لایه یا دادهٔ طراحی معتبری ندارد.' };
  }

  if (isGradient(raw.customGradient)) data.customGradient = raw.customGradient;
  if (isStickers(raw.canvasStickers)) data.canvasStickers = raw.canvasStickers as ZhaketProjectData['canvasStickers'];
  if (isObj(raw.logoConfig)) data.logoConfig = raw.logoConfig;
  const productName = str(raw.productName);
  const productSubtitle = str(raw.productSubtitle);
  const selectedFontId = str(raw.selectedFontId, 100);
  if (productName !== undefined) data.productName = productName;
  if (productSubtitle !== undefined) data.productSubtitle = productSubtitle;
  if (selectedFontId !== undefined) data.selectedFontId = selectedFontId;

  return { ok: true, data };
}
