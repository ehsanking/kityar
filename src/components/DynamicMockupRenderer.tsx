import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Laptop, Tablet, Monitor, Globe, Box, Sparkles } from 'lucide-react';
import { CanvasLayerItem } from '../types/canvasLayers';

interface DynamicMockupRendererProps {
  layer: CanvasLayerItem;
  isSelected?: boolean;
  onSelect?: () => void;
  isInteractive?: boolean;
}

export const DynamicMockupRenderer: React.FC<DynamicMockupRendererProps> = ({
  layer,
  isSelected = false,
  onSelect,
  isInteractive = true,
}) => {
  if (!layer.visible) return null;

  const data = layer.data || {};
  const mockupType = data.mockupType || 'mobile';
  const screenImage = data.screenImage;
  const frameColor = data.frameColor || 'dark';
  const tilt3D = data.tilt3D ?? true;

  // Frame colors
  let frameBg = 'bg-slate-900 border-slate-700';
  if (frameColor === 'silver') frameBg = 'bg-slate-200 border-slate-300 text-slate-900';
  if (frameColor === 'gold') frameBg = 'bg-amber-950/90 border-amber-500/60';
  if (frameColor === 'midnight') frameBg = 'bg-indigo-950/90 border-indigo-500/50';

  // Flips & scale
  const scaleX = (layer.scale || 1) * (layer.flipHorizontal ? -1 : 1);
  const scaleY = (layer.scale || 1) * (layer.flipVertical ? -1 : 1);

  // Perspective & Rotation
  const perspectiveStyle: React.CSSProperties = tilt3D
    ? {
        transform: `rotateX(10deg) rotateY(-12deg) rotateZ(${layer.rotation || 0}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
        transformStyle: 'preserve-3d',
      }
    : {
        transform: `rotate(${layer.rotation || 0}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
      };

  // Advanced Filters & Layer Styles
  const filters: string[] = [];
  if (layer.blur && layer.blur > 0) filters.push(`blur(${layer.blur}px)`);
  if (layer.brightness !== undefined && layer.brightness !== 100) filters.push(`brightness(${layer.brightness}%)`);
  if (layer.contrast !== undefined && layer.contrast !== 100) filters.push(`contrast(${layer.contrast}%)`);
  if (layer.shadow && layer.shadow.enabled) {
    filters.push(`drop-shadow(${layer.shadow.x}px ${layer.shadow.y}px ${layer.shadow.blur}px ${layer.shadow.color})`);
  }

  const advancedStyles: React.CSSProperties = {
    ...perspectiveStyle,
    opacity: (layer.opacity ?? 100) / 100,
    mixBlendMode: layer.blendMode || 'normal',
    filter: filters.length > 0 ? filters.join(' ') : undefined,
    borderRadius: layer.borderRadius ? `${layer.borderRadius}px` : undefined,
    border: layer.border && layer.border.enabled ? `${layer.border.width}px solid ${layer.border.color}` : undefined,
  };

  const renderScreenContent = () => {
    if (screenImage) {
      return (
        <img
          src={screenImage}
          alt="Mockup Screen"
          className="w-full h-full object-cover rounded-lg select-none pointer-events-none"
        />
      );
    }

    // Default simulated dashboard UI
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-2.5 flex flex-col justify-between text-white text-[9px] select-none">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="font-bold text-[9px] text-amber-400">پنل ووکامرس پلاس</span>
          </div>
          <span className="text-[8px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">آنلاین</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 my-auto">
          <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700">
            <span className="text-slate-400 block text-[7px]">فروش کل</span>
            <span className="font-bold text-amber-300 text-[10px]">۱۲,۴۵۰,۰۰۰ تومان</span>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700">
            <span className="text-slate-400 block text-[7px]">سفارشات جدید</span>
            <span className="font-bold text-purple-300 text-[10px]">۴۸ سفارش</span>
          </div>
        </div>

        <div className="h-6 bg-amber-500/15 border border-amber-500/30 rounded flex items-center justify-center text-amber-300 font-bold text-[8px] gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          <span>پشتیبانی و آپدیت مادام‌العمر</span>
        </div>
      </div>
    );
  };

  const renderDeviceFrame = () => {
    switch (mockupType) {
      case 'mobile':
        return (
          <div className={`w-36 h-72 rounded-[2.5rem] p-2 border-4 shadow-2xl shadow-black/80 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-md ${frameBg}`}>
            {/* Dynamic Island */}
            <div className="w-12 h-3.5 bg-black rounded-full mb-1 z-20 flex items-center justify-end px-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
            {/* Screen */}
            <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-slate-950 border border-slate-800/80">
              {renderScreenContent()}
            </div>
            {/* Home Bar */}
            <div className="w-14 h-1 bg-white/40 rounded-full mt-1.5"></div>
          </div>
        );

      case 'tablet':
        return (
          <div className={`w-56 h-72 rounded-3xl p-2.5 border-4 shadow-2xl shadow-black/80 flex flex-col justify-between backdrop-blur-md ${frameBg}`}>
            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              {renderScreenContent()}
            </div>
          </div>
        );

      case 'laptop':
        return (
          <div className="flex flex-col items-center w-64 select-none">
            <div className={`w-full h-40 rounded-t-2xl p-2 border-4 border-b-0 shadow-2xl backdrop-blur-md ${frameBg}`}>
              <div className="w-full h-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                {renderScreenContent()}
              </div>
            </div>
            {/* Base */}
            <div className="w-72 h-3 bg-slate-700 rounded-b-xl shadow-lg border border-slate-600 flex justify-center">
              <div className="w-12 h-1 bg-slate-500 rounded-full mt-0.5"></div>
            </div>
          </div>
        );

      case 'desktop':
        return (
          <div className="flex flex-col items-center w-64 select-none">
            <div className={`w-full h-44 rounded-2xl p-2 border-4 shadow-2xl backdrop-blur-md ${frameBg}`}>
              <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                {renderScreenContent()}
              </div>
            </div>
            <div className="w-6 h-8 bg-slate-700 border-x border-slate-600"></div>
            <div className="w-24 h-2 bg-slate-600 rounded-full shadow-md"></div>
          </div>
        );

      case 'browser':
        return (
          <div className="w-60 h-44 rounded-2xl border-2 border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-slate-800 px-3 py-1.5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <div className="bg-slate-950 px-3 py-0.5 rounded text-[8px] text-slate-400 font-mono">
                https://yourstore.com/app
              </div>
            </div>
            <div className="flex-1 bg-slate-950">
              {renderScreenContent()}
            </div>
          </div>
        );

      case 'box3d':
        return (
          <div className="w-44 h-56 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-400/80 p-4 flex flex-col justify-between shadow-2xl shadow-amber-950/80 text-white select-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between z-10">
              <span className="text-[10px] font-black bg-slate-950/60 px-2 py-0.5 rounded-full border border-white/20">پکیج رسمی ژاکت</span>
              <Box className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1 text-center z-10 my-auto">
              <h5 className="font-black text-xs text-white">ووکامرس پلاس</h5>
              <p className="text-[9px] text-amber-200">نسخه اختصاصی با لایسنس طلایی</p>
            </div>
            <div className="flex items-center justify-between text-[8px] font-bold border-t border-white/20 pt-2 z-10">
              <span>PRO EDITION</span>
              <span className="text-amber-300">v3.8.0</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isInteractive) {
    return (
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          left: `${layer.x}px`,
          top: `${layer.y}px`,
          ...advancedStyles,
        }}
      >
        {renderDeviceFrame()}
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`absolute z-10 cursor-grab active:cursor-grabbing select-none ${
        isSelected ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 rounded-3xl' : ''
      }`}
      style={{
        left: `${layer.x}px`,
        top: `${layer.y}px`,
        ...advancedStyles,
      }}
      title={`${layer.name} — کلیک برای انتخاب و درگ برای جابجایی آزاد`}
    >
      {isSelected && (
        <div className="absolute -top-6 right-0 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md z-30 pointer-events-none whitespace-nowrap">
          {layer.name}
        </div>
      )}
      {renderDeviceFrame()}
    </motion.div>
  );
};

export default DynamicMockupRenderer;
