import React from 'react';
import ColorField from './ColorField';
import {
  Move,
  Type,
  Palette,
  Layers,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Sparkles,
  Sliders,
  ChevronDown,
  RotateCw,
  Sun,
  ShieldCheck,
  Shapes,
  Box,
  Check
} from 'lucide-react';
import { CanvasLayerItem, BlendMode } from '../types/canvasLayers';
import { BLEND_MODES } from './PhotoshopLayerInspector';

interface PhotoshopOptionsBarProps {
  activeLayer: CanvasLayerItem | null;
  canvasWidth: number;
  canvasHeight: number;
  onUpdateLayer: (updates: Partial<CanvasLayerItem>) => void;
  onUpdateLayerData: (newData: any) => void;
  onDuplicateLayer?: () => void;
  onDeleteLayer?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onDeselect?: () => void;
  // Canvas wide settings when no layer is selected
  showRulers: boolean;
  onToggleRulers: () => void;
  enableMagneticSnap: boolean;
  onToggleSnap: () => void;
  activeAsset: string;
}

const PRESET_COLORS = [
  '#ffffff',
  '#fbbf24', // Amber
  '#f59e0b', // Gold
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#ef4444', // Red
  '#0f172a', // Slate dark
  '#000000',
];

export const PhotoshopOptionsBar: React.FC<PhotoshopOptionsBarProps> = ({
  activeLayer,
  canvasWidth,
  canvasHeight,
  onUpdateLayer,
  onUpdateLayerData,
  onDuplicateLayer,
  onDeleteLayer,
  onBringForward,
  onSendBackward,
  onDeselect,
  showRulers,
  onToggleRulers,
  enableMagneticSnap,
  onToggleSnap,
  activeAsset,
}) => {
  if (!activeLayer) {
    // Default Photoshop Artboard Info Bar when nothing is selected
    return (
      <div className="w-full bg-slate-900/95 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs backdrop-blur-md select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-amber-400 font-mono">Adobe Photoshop Live Mode</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">بوم فعال:</span>
            <span className="text-white font-mono">{canvasWidth}×{canvasHeight}px</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <label className="flex items-center gap-1 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showRulers}
                onChange={onToggleRulers}
                className="w-3.5 h-3.5 accent-amber-500 rounded"
              />
              <span>خط‌کش (Rulers)</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={enableMagneticSnap}
                onChange={onToggleSnap}
                className="w-3.5 h-3.5 accent-amber-500 rounded"
              />
              <span>تراز مغناطیسی (Snap)</span>
            </label>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span>برای ویرایش روی هر لایه کلیک کنید (کنترل جابجایی آزاد در داخل و بیرون بوم فعال است)</span>
        </div>
      </div>
    );
  }

  const data = activeLayer.data || {};
  const isText = activeLayer.type === 'text';
  const isBadge = activeLayer.type === 'badge' || activeLayer.type === 'zhaket-badge';
  const isShape = activeLayer.type === 'shape' || activeLayer.type === 'vector-shape';
  const isIcon = activeLayer.type === 'icon-library';

  // Determine active primary color
  const currentColor = 
    isText ? (data.textColor || '#ffffff') :
    isIcon ? (data.iconColor || '#fbbf24') :
    isBadge ? (data.textColor || data.bgColor || '#fbbf24') :
    isShape ? (data.fillColor || data.shapeColor || '#fbbf24') :
    data.textColor || '#ffffff';

  const handleColorChange = (newColor: string) => {
    if (isText) {
      onUpdateLayerData({ ...data, textColor: newColor });
    } else if (isIcon) {
      onUpdateLayerData({ ...data, iconColor: newColor });
    } else if (isBadge) {
      onUpdateLayerData({ ...data, textColor: newColor, bgColor: newColor });
    } else if (isShape) {
      onUpdateLayerData({ ...data, fillColor: newColor, shapeColor: newColor });
    } else {
      onUpdateLayerData({ ...data, textColor: newColor, color: newColor });
    }
  };

  // Alignment handlers
  const handleAlign = (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => {
    const elWidth = 100;
    const elHeight = 50;
    switch (type) {
      case 'left':
        onUpdateLayer({ x: 0 });
        break;
      case 'centerX':
        onUpdateLayer({ x: Math.round((canvasWidth - elWidth) / 2) });
        break;
      case 'right':
        onUpdateLayer({ x: canvasWidth - elWidth });
        break;
      case 'top':
        onUpdateLayer({ y: 0 });
        break;
      case 'centerY':
        onUpdateLayer({ y: Math.round((canvasHeight - elHeight) / 2) });
        break;
      case 'bottom':
        onUpdateLayer({ y: canvasHeight - elHeight });
        break;
    }
  };

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between gap-3 text-xs backdrop-blur-md select-none overflow-x-auto custom-scrollbar">
      
      {/* 1. Tool / Layer Icon & Label */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-[11px]">
          {isText ? 'T' : isBadge ? 'B' : isIcon ? 'I' : 'V'}
        </div>
        <span className="font-bold text-white text-xs max-w-[130px] truncate" title={activeLayer.name}>
          {activeLayer.name}
        </span>
        <button
          type="button"
          onClick={onDeselect}
          className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
          title="خروج از انتخاب (Deselect)"
        >
          ✕
        </button>
      </div>

      <div className="h-4 w-px bg-slate-800 shrink-0" />

      {/* 2. Numerical Coordinates (X & Y) */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400">X:</span>
          <input
            type="number"
            value={activeLayer.x}
            onChange={(e) => onUpdateLayer({ x: Number(e.target.value) || 0 })}
            className="w-12 bg-transparent text-white font-mono text-xs text-center outline-none"
          />
          <span className="text-[9px] text-slate-500 font-mono">px</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400">Y:</span>
          <input
            type="number"
            value={activeLayer.y}
            onChange={(e) => onUpdateLayer({ y: Number(e.target.value) || 0 })}
            className="w-12 bg-transparent text-white font-mono text-xs text-center outline-none"
          />
          <span className="text-[9px] text-slate-500 font-mono">px</span>
        </div>
      </div>

      <div className="h-4 w-px bg-slate-800 shrink-0" />

      {/* 3. Direct Photoshop Color Swatches & Native Color Picker */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-2 py-1 rounded border border-slate-800">
        <span className="text-[10px] text-slate-400">رنگ:</span>
        <div className="relative flex items-center">
          <ColorField label="پالت کامل رنگ فتوشاپ (Color Picker)" value={currentColor.startsWith('#') ? currentColor : '#fbbf24'} onChange={(v) => handleColorChange(v)} />
        </div>
        <div className="flex items-center gap-1">
          {PRESET_COLORS.slice(0, 6).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              style={{ backgroundColor: c }}
              className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                currentColor === c ? 'scale-125 border-white shadow' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="h-4 w-px bg-slate-800 shrink-0" />

      {/* 4. Text Specific or Shape Specific Options */}
      {isText && (
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-2 py-1 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400">اندازه قلم:</span>
          <input
            type="number"
            min="10"
            max="80"
            value={data.fontSize || 20}
            onChange={(e) => onUpdateLayerData({ ...data, fontSize: Number(e.target.value) || 20 })}
            className="w-10 bg-transparent text-amber-300 font-mono text-xs text-center outline-none font-bold"
          />
          <span className="text-[9px] text-slate-500 font-mono">px</span>
        </div>
      )}

      {/* 5. Opacity Slider & Number */}
      <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 px-2 py-1 rounded border border-slate-800">
        <span className="text-[10px] text-slate-400">شفافیت:</span>
        <input
          type="range"
          min="10"
          max="100"
          value={activeLayer.opacity ?? 100}
          onChange={(e) => onUpdateLayer({ opacity: Number(e.target.value) })}
          className="w-14 accent-amber-500 h-1 bg-slate-800 rounded cursor-pointer"
        />
        <span className="font-mono text-white text-[11px] w-7 text-left">{activeLayer.opacity ?? 100}%</span>
      </div>

      <div className="h-4 w-px bg-slate-800 shrink-0" />

      {/* 6. Alignment Buttons */}
      <div className="flex items-center gap-0.5 shrink-0 bg-slate-950 p-0.5 rounded border border-slate-800">
        <button
          type="button"
          onClick={() => handleAlign('centerX')}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-[10px]"
          title="مرکز افقی"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => handleAlign('centerY')}
          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded text-[10px]"
          title="مرکز عمودی"
        >
          ↕
        </button>
      </div>

      <div className="h-4 w-px bg-slate-800 shrink-0" />

      {/* 7. Layer Order & Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onBringForward && (
          <button
            type="button"
            onClick={onBringForward}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
            title="انتقال لایه به رو (Bring Forward)"
          >
            <ArrowUp className="w-3 h-3" />
          </button>
        )}
        {onSendBackward && (
          <button
            type="button"
            onClick={onSendBackward}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
            title="انتقال لایه به زیر (Send Backward)"
          >
            <ArrowDown className="w-3 h-3" />
          </button>
        )}
        {onDuplicateLayer && (
          <button
            type="button"
            onClick={onDuplicateLayer}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
            title="تکرار لایه (Duplicate)"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        {onDeleteLayer && (
          <button
            type="button"
            onClick={onDeleteLayer}
            className="p-1.5 bg-slate-950 hover:bg-rose-500/20 text-rose-400 rounded border border-slate-800 hover:border-rose-500/30"
            title="حذف لایه (Delete)"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

    </div>
  );
};

export default PhotoshopOptionsBar;
