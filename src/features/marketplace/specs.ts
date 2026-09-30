// Marketplace asset specifications. Adding a marketplace = adding one entry here.
export type AssetId = 'logo80' | 'cover400' | 'cover700_1' | 'cover700_2' | 'infographic';
export type PlatformId = 'zhaket' | 'rastchin' | 'bazaar' | 'myket' | 'custom';

export interface AssetSpec {
  width: number;
  height: number;
  label: string;
  /** Smallest legible text in exported pixels. */
  minFontPx: number;
  /** Margin (fraction of each side) that important content should stay inside. */
  safeArea: number;
  /** Tiny assets (icons/logos) should carry no text at all. */
  allowText?: boolean;
  maxFeaturePills?: number;
}

export interface MarketplaceSpec {
  id: PlatformId;
  name: string;
  assets: Record<AssetId, AssetSpec>;
}

const a = (width: number, height: number, label: string, extra: Partial<AssetSpec> = {}): AssetSpec => ({
  width,
  height,
  label,
  minFontPx: Math.max(10, Math.round(Math.min(width, height) * 0.03)),
  safeArea: 0.05,
  allowText: true,
  ...extra,
});

export const MARKETPLACES: Record<Exclude<PlatformId, 'custom'>, MarketplaceSpec> = {
  zhaket: {
    id: 'zhaket',
    name: 'ژاکت',
    assets: {
      logo80: a(80, 80, 'لوگو ۸۰×۸۰', { allowText: false, safeArea: 0.08 }),
      cover400: a(400, 400, 'کاور اصلی ۴۰۰×۴۰۰', { maxFeaturePills: 4 }),
      cover700_1: a(700, 700, 'کاور گالری ۱ (۷۰۰×۷۰۰)'),
      cover700_2: a(700, 700, 'کاور گالری ۲ (۷۰۰×۷۰۰)'),
      infographic: a(594, 4000, 'اینفوگرافی ۵۹۴×۴۰۰۰', { minFontPx: 14, safeArea: 0.03 }),
    },
  },
  rastchin: {
    id: 'rastchin',
    name: 'راست‌چین',
    assets: {
      logo80: a(100, 100, 'نمایه ۱۰۰×۱۰۰', { allowText: false, safeArea: 0.08 }),
      cover400: a(450, 330, 'کاور اصلی (۴۵۰×۳۳۰)', { maxFeaturePills: 4 }),
      cover700_1: a(750, 550, 'گالری اسلاید ۱ (۷۵۰×۵۵۰)'),
      cover700_2: a(750, 550, 'گالری اسلاید ۲ (۷۵۰×۵۵۰)'),
      infographic: a(800, 400, 'بنر عریض (۸۰۰×۴۰۰)'),
    },
  },
  bazaar: {
    id: 'bazaar',
    name: 'کافه‌بازار',
    assets: {
      logo80: a(512, 512, 'آیکون ۵۱۲×۵۱۲', { allowText: false, safeArea: 0.1 }),
      cover400: a(1024, 500, 'هیرو تبلیغاتی (۱۰۲۴×۵۰۰)'),
      cover700_1: a(1080, 1920, 'اسکرین‌شات ۱ (۱۰۸۰×۱۹۲۰)'),
      cover700_2: a(1080, 1920, 'اسکرین‌شات ۲ (۱۰۸۰×۱۹۲۰)'),
      infographic: a(1200, 628, 'بنر لندینگ (۱۲۰۰×۶۲۸)'),
    },
  },
  myket: {
    id: 'myket',
    name: 'مایکت',
    assets: {
      logo80: a(512, 512, 'آیکون ۵۱۲×۵۱۲', { allowText: false, safeArea: 0.1 }),
      cover400: a(1024, 500, 'کاور تبلیغاتی (۱۰۲۴×۵۰۰)'),
      cover700_1: a(720, 1280, 'اسکرین‌شات ۱ (۷۲۰×۱۲۸۰)'),
      cover700_2: a(720, 1280, 'اسکرین‌شات ۲ (۷۲۰×۱۲۸۰)'),
      infographic: a(1200, 628, 'بنر عریض (۱۲۰۰×۶۲۸)'),
    },
  },
};

const CUSTOM_LABELS: Record<AssetId, string> = {
  logo80: 'لوگو سفارشی',
  cover400: 'بوم اصلی سفارشی',
  cover700_1: 'بوم گالری ۱',
  cover700_2: 'بوم گالری ۲',
  infographic: 'سند کشیده سفارشی',
};

export function getAssetSpec(platform: string, assetId: string, custom = { width: 800, height: 800 }): AssetSpec {
  const id = (assetId in CUSTOM_LABELS ? assetId : 'cover400') as AssetId;
  if (platform === 'custom') return a(custom.width, custom.height, CUSTOM_LABELS[id]);
  const spec = MARKETPLACES[platform as keyof typeof MARKETPLACES] ?? MARKETPLACES.zhaket;
  return spec.assets[id];
}
