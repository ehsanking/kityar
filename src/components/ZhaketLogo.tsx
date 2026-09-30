import React, { useState } from 'react';
import { Upload } from 'lucide-react';

export type LogoBackdropType = 'white-card' | 'white-glass' | 'dark-card' | 'dark-glass' | 'transparent';
export type LogoPlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'custom';
export type LogoVariantType = 'png-standard';

export interface ZhaketLogoConfig {
  enabled: boolean;
  variant: LogoVariantType;
  backdrop: LogoBackdropType;
  placement: LogoPlacement;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customSizePx: number; // Height in px
  logoWidthPx?: number; // Width in px (optional, default auto)
  boxPaddingPx?: number; // Box padding in px (default 8)
  boxRadiusPx?: number; // Box border-radius in px (default 12)
  boxBorderWidth?: number; // Box border width in px (default 1)
  boxBorderColor?: string; // Box border color
  boxBgColor?: string; // Custom box bg color
  customLogoUrl: string | null;
  showTextLabel: boolean;
  textLabel: string;
  xOffset: number;
  yOffset: number;
}

export const DEFAULT_LOGO_CONFIG: ZhaketLogoConfig = {
  enabled: true,
  variant: 'png-standard',
  backdrop: 'transparent',
  placement: 'top-right',
  size: 'md',
  customSizePx: 52,
  logoWidthPx: 0,
  boxPaddingPx: 8,
  boxRadiusPx: 12,
  boxBorderWidth: 1,
  boxBorderColor: 'rgba(255,255,255,0.2)',
  boxBgColor: '',
  customLogoUrl: null,
  showTextLabel: false,
  textLabel: '',
  xOffset: 0,
  yOffset: 0,
};

interface ZhaketLogoProps {
  className?: string;
  variant?: LogoVariantType;
  backdrop?: LogoBackdropType;
  customLogoUrl?: string | null;
  sizePx?: number;
  logoWidthPx?: number;
  boxPaddingPx?: number;
  boxRadiusPx?: number;
  boxBorderWidth?: number;
  boxBorderColor?: string;
  boxBgColor?: string;
  theme?: 'dark' | 'light' | 'auto';
  showText?: boolean;
  onUploadClick?: () => void;
}

/**
 * Zhaket Logo Component (100% User-Uploaded File)
 * Directly and purely renders the user's uploaded image file without any code alteration.
 */
export const ZhaketLogo: React.FC<ZhaketLogoProps> = ({
  className = '',
  backdrop = 'transparent',
  customLogoUrl = null,
  sizePx = 52,
  logoWidthPx = 0,
  boxPaddingPx,
  boxRadiusPx,
  boxBorderWidth,
  boxBorderColor,
  boxBgColor,
  onUploadClick,
}) => {
  const [imgError, setImgError] = useState(false);

  // Backdrop classes when user chooses a backing card
  let backdropClass = '';
  switch (backdrop) {
    case 'white-card':
      backdropClass = 'bg-white border border-slate-200 shadow-sm rounded-xl p-2';
      break;
    case 'white-glass':
      backdropClass = 'bg-white/95 border border-white/90 shadow-md backdrop-blur-sm rounded-xl p-2';
      break;
    case 'dark-card':
      backdropClass = 'bg-slate-900 border border-slate-800 shadow-md rounded-xl p-2';
      break;
    case 'dark-glass':
      backdropClass = 'bg-slate-900/85 border border-white/10 shadow-md backdrop-blur-sm rounded-xl p-2';
      break;
    case 'transparent':
    default:
      backdropClass = 'bg-transparent p-0';
      break;
  }

  const effectiveHeight = sizePx || 52;
  const customBoxStyle: React.CSSProperties = {};
  if (boxPaddingPx !== undefined) customBoxStyle.padding = `${boxPaddingPx}px`;
  if (boxRadiusPx !== undefined) customBoxStyle.borderRadius = `${boxRadiusPx}px`;
  if (boxBorderWidth !== undefined && backdrop !== 'transparent') {
    customBoxStyle.borderWidth = `${boxBorderWidth}px`;
  }
  if (boxBorderColor && backdrop !== 'transparent') {
    customBoxStyle.borderColor = boxBorderColor;
  }
  if (boxBgColor) {
    customBoxStyle.backgroundColor = boxBgColor;
  }

  const imgStyle: React.CSSProperties = {
    height: `${effectiveHeight}px`,
    width: logoWidthPx && logoWidthPx > 0 ? `${logoWidthPx}px` : 'auto',
  };

  // 1. When user has uploaded a logo file:
  if (customLogoUrl && !imgError) {
    return (
      <div 
        style={customBoxStyle}
        className={`inline-flex items-center justify-center select-none transition-all ${backdropClass} ${className}`}
        title="فایل لوگوی اختصاصی ژاکت"
      >
        <img 
          src={customLogoUrl} 
          alt="لوگوی آپلود شده" 
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          style={imgStyle}
          className="max-h-full max-w-full object-contain pointer-events-none" 
        />
      </div>
    );
  }

  // 2. Default Official Zhaket Brand Logo (Vector SVG with numerical sizing)
  return (
    <div 
      style={customBoxStyle}
      className={`inline-flex items-center justify-center select-none transition-all ${backdropClass} ${className}`}
      title="لوگوی رسمی مارکت ژاکت"
    >
      <div 
        style={{
          height: `${effectiveHeight}px`,
          width: logoWidthPx && logoWidthPx > 0 ? `${logoWidthPx}px` : 'auto',
        }}
        className="flex items-center gap-1.5"
      >
        {/* Official Zhaket Emblem */}
        <div 
          style={{ width: `${effectiveHeight}px`, height: `${effectiveHeight}px` }} 
          className="relative rounded-2xl bg-gradient-to-tr from-[#ea580c] via-[#f97316] to-[#fbbf24] flex items-center justify-center shadow-lg shadow-orange-500/30 p-1.5 shrink-0"
        >
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full drop-shadow">
            <path 
              d="M12 9H28C30.2 9 32 10.8 32 13V27C32 29.2 30.2 31 28 31H12C9.8 31 8 29.2 8 27V13C8 10.8 9.8 9 12 9Z" 
              fill="white" 
              fillOpacity="0.2"
            />
            {/* Persian Letter 'ژ' / Zhaket monogram styled */}
            <path 
              d="M13 15C13 15 17 14 20 18C23 22 27 21 27 21M15 25C18 26 22 25 25 21" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <circle cx="20" cy="11" r="1.8" fill="white" />
            <circle cx="16" cy="12.5" r="1.5" fill="white" />
            <circle cx="24" cy="12.5" r="1.5" fill="white" />
          </svg>
        </div>
        {/* Optional Zhaket Wordmark if wide */}
        {effectiveHeight >= 36 && (
          <div className="flex flex-col text-right pr-0.5">
            <span style={{ fontSize: `${Math.max(11, Math.round(effectiveHeight * 0.36))}px` }} className="font-black text-white leading-none tracking-tight">
              ژاکـــــت
            </span>
            <span style={{ fontSize: `${Math.max(7, Math.round(effectiveHeight * 0.2))}px` }} className="text-amber-300 font-bold opacity-90 leading-tight">
              zhaket
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZhaketLogo;
