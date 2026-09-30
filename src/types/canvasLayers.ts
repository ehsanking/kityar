export type LayerType = 
  | 'background' 
  | 'mockup' 
  | 'sticker' 
  | 'text' 
  | 'badge'
  | 'zhaket-badge'
  | 'feature-pills'
  | 'stat-card'
  | 'trust-seal'
  | 'icon-library'
  | 'shape'
  | 'discount-ribbon'
  | 'rating-badge'
  | 'price-tag'
  | 'qr-code'
  | 'logo' 
  | 'vector-shape' 
  | 'ai-graphic'
  | '3d-model'
  | 'infographic-table'
  | 'chart';

export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten' 
  | 'color-dodge' 
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'luminosity';

export interface LayerShadowConfig {
  enabled: boolean;
  x: number;
  y: number;
  blur: number;
  color: string;
  angle?: number; // 0 to 360 degrees
  distance?: number; // shadow distance
  spread?: number; // shadow spread
}

export interface LayerGlowConfig {
  enabled: boolean;
  blur: number;
  color: string;
}

export interface LayerBorderConfig {
  enabled: boolean;
  width: number;
  color: string;
}

export interface CanvasLayerItem {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  scale: number; // 0.2 to 3.0
  rotation: number; // -180 to 180
  opacity: number; // 0 to 100
  x: number;
  y: number;
  
  // Advanced Layer FX & Studio Tools
  blendMode?: BlendMode;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  tagColor?: 'slate' | 'amber' | 'emerald' | 'indigo' | 'purple' | 'rose' | 'cyan';
  shadow?: LayerShadowConfig;
  outerGlow?: LayerGlowConfig;
  innerGlow?: LayerGlowConfig;
  border?: LayerBorderConfig;
  blur?: number; // 0 to 30px
  backdropBlur?: number; // 0 to 30px (Frosted Glass)
  brightness?: number; // 50 to 200%
  contrast?: number; // 50 to 200%
  saturate?: number; // 0 to 200%
  hueRotate?: number; // -180 to 180 deg
  grayscale?: number; // 0 to 100%
  invert?: number; // 0 to 100%
  borderRadius?: number; // 0 to 50px
  lockAspectRatio?: boolean;
  lockOpacity?: boolean;
  lockLog?: { action: 'lock' | 'unlock'; timestamp: string }[];
  groupId?: string;
  
  // Specific data payloads
  data?: {
    lockAspectRatio?: boolean;
    // Mockup payload
    mockupType?: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'browser' | 'box3d';
    screenImage?: string | null;
    frameColor?: 'dark' | 'silver' | 'gold' | 'midnight' | 'white';
    tilt3D?: boolean;
    // Sticker / Badge payload
    stickerId?: string;
    stickerTitle?: string;
    stickerIcon?: string;
    stickerColor?: string;
    // Text payload
    text?: string;
    subtitle?: string;
    fontSize?: number;
    fontWeight?: string;
    textColor?: string;
    bgColor?: string;
    textAlign?: 'right' | 'center' | 'left';
    fontFamily?: string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    // Badge & Zhaket Badge payload
    badgeText?: string;
    badgeTitle?: string;
    badgeTagline?: string;
    badgeIcon?: string;
    badgeStyle?: string;
    borderColor?: string;
    // Features payload
    features?: string[];
    layoutMode?: 'grid2x2' | 'horizontal' | 'vertical' | 'wrap';
    pillBgColor?: string;
    pillTextColor?: string;
    pillIcon?: string;
    pillIcons?: string[];
    // Chart payload
    chartType?: 'area' | 'bar' | 'radar';
    chartTitle?: string;
    chartAccentColor?: string;
    chartData?: { name: string; sales: number; rating: number; performance: number }[];
    // Stats payload
    stats?: { title: string; subtitle: string; color?: string }[];
    // Trust seal payload
    trustTitle?: string;
    trustSubtitle?: string;
    // Icon library payload
    iconName?: string;
    iconColor?: string;
    iconBgColor?: string;
    iconSize?: number;
    iconBgShape?: 'circle' | 'square' | 'rounded' | 'none';
    // Shape payload
    shapeType?: 'starburst' | 'circle-glow' | 'hexagon-gold' | 'ribbon' | 'glass-card' | 'gradient-pill' | 'sparkle-star' | string;
    shapeVariant?: string;
    shapeColor?: string;
    shapeText?: string;
    fillColor?: string;
    strokeColor?: string;
    width?: number;
    height?: number;
    radius?: number;
    // Discount Ribbon payload
    discountPercent?: string | number;
    discountText?: string;
    ribbonStyle?: 'corner' | 'badge' | 'neon' | string;
    // Rating payload
    rating?: number;
    reviewsCount?: number;
    ratingValue?: string;
    ratingCount?: string;
    // Price tag payload
    price?: string;
    oldPrice?: string;
    originalPrice?: string;
    salePrice?: string;
    currency?: string;
    // QR code payload
    qrTitle?: string;
    qrSubtitle?: string;
    // Table rows payload
    tableRows?: { id: string; title: string; desc: string; items: string[] }[];
    // Vector / AI Shape payload
    svgCode?: string;
    aiPrompt?: string;
    imageUrl?: string;
    // 3D Model payload
    model3dId?: string;
    model3dTitle?: string;
    model3dCategory?: string;
    model3dColor?: string;
    model3dGlow?: boolean;
    model3dDepth?: number;
    showText?: boolean;
    hideBackground?: boolean;
    model3dBgShape?: string;
    model3dBgColor?: string;
    model3dBorderColor?: string;
    // Logo payload
    customLogoUrl?: string;
    logoSize?: number;
    customSizePx?: number;
    boxPadding?: number;
    boxRadiusPx?: number;
    boxBgColor?: string;
    boxBorderColor?: string;
  };
}

export interface CustomGradientConfig {
  type: 'linear' | 'radial' | 'conic' | 'mesh';
  stop1: string;
  stop2: string;
  stop3?: string;
  angle: number; // 0 to 360
  opacity: number; // 0 to 100
}

export interface ZhaketProjectData {
  version: string;
  savedAt: string;
  productName: string;
  productSubtitle: string;
  selectedFontId: string;
  activeAsset: string;
  customGradient: CustomGradientConfig;
  logoConfig: any;
  canvasLayers: Record<string, CanvasLayerItem[]>;
  canvasStickers: Record<string, any[]>;
  infographicRows: any[];
  cover400Features: string[];
}
