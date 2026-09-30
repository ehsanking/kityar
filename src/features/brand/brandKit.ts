import type { CanvasLayerItem, CustomGradientConfig } from '../../types/canvasLayers';
import type { CanvasLayersMap } from '../../store/studioStore';

export interface BrandKit {
  primary: string;
  secondary: string;
  accent: string;
  textColor: string;
  fontId: string;
}

export const DEFAULT_BRAND_KIT: BrandKit = {
  primary: '#0f172a',
  secondary: '#1e1b4b',
  accent: '#0f766e',
  textColor: '#ffffff',
  fontId: 'vazirmatn',
};

const STORAGE_KEY = 'kityar_brand_kit';
const HEX = /^#[0-9a-f]{6}$/i;

export const isBrandKit = (v: unknown): v is BrandKit =>
  typeof v === 'object' &&
  v !== null &&
  (['primary', 'secondary', 'accent', 'textColor'] as const).every((k) => HEX.test(String((v as any)[k]))) &&
  typeof (v as any).fontId === 'string';

export function loadBrandKit(storage: Pick<Storage, 'getItem'> | undefined): BrandKit | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return isBrandKit(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveBrandKit(storage: Pick<Storage, 'setItem'> | undefined, kit: BrandKit): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(kit));
    return !!storage;
  } catch {
    return false;
  }
}

export const brandGradient = (kit: BrandKit, current: CustomGradientConfig): CustomGradientConfig => ({
  ...current,
  stop1: kit.primary,
  stop2: kit.secondary,
  stop3: kit.accent,
});

/** Sets the brand text colour on every text layer (all assets); keeps untouched references. */
export function applyBrandToLayers(map: CanvasLayersMap, kit: BrandKit): CanvasLayersMap {
  let changed = false;
  const next: CanvasLayersMap = {};
  for (const [asset, layers] of Object.entries(map)) {
    let assetChanged = false;
    const list = layers.map((l: CanvasLayerItem) => {
      if (l.type !== 'text' || l.data?.textColor === kit.textColor) return l;
      assetChanged = true;
      return { ...l, data: { ...l.data, textColor: kit.textColor } };
    });
    next[asset] = assetChanged ? list : layers;
    changed ||= assetChanged;
  }
  return changed ? next : map;
}
