import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Minimize2, Maximize2, Sparkles, Layers, Box, Layout, Move, RefreshCw } from 'lucide-react';
import RenderPlacedLogo from './RenderPlacedLogo';
import DynamicLayerRenderer from './DynamicLayerRenderer';
import CanvasStickersOverlay from './CanvasStickersOverlay';
import { ZhaketLogoConfig } from './ZhaketLogo';
import { CanvasLayerItem } from '../types/canvasLayers';
import { InfographicRowData } from './SortableInfographicRow';
import { CanvasStickerInstance } from './SemanticStickerLibrary';

interface LiveMiniPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAsset: 'logo80' | 'cover400' | 'cover700_1' | 'cover700_2' | 'infographic';
  onSelectAsset: (asset: 'logo80' | 'cover400' | 'cover700_1' | 'cover700_2' | 'infographic') => void;
  productName: string;
  productSubtitle: string;
  getDynamicBackgroundStyle: () => React.CSSProperties;
  currentFontCss: string;
  logoConfig: ZhaketLogoConfig;
  canvasLayers: Record<string, CanvasLayerItem[]>;
  canvasStickers: Record<string, CanvasStickerInstance[]>;
  infographicRows: InfographicRowData[];
}

export const LiveMiniPreviewModal: React.FC<LiveMiniPreviewModalProps> = ({
  isOpen,
  onClose,
  activeAsset,
  onSelectAsset,
  productName,
  productSubtitle,
  getDynamicBackgroundStyle,
  currentFontCss,
  logoConfig,
  canvasLayers,
  canvasStickers,
  infographicRows,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const currentLayers = canvasLayers[activeAsset] || [];
  const currentStickers = canvasStickers[activeAsset] || [];

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed bottom-6 left-6 z-50 bg-slate-950/90 border border-amber-500/50 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden w-72 sm:w-80 select-none text-right"
      >
        {/* Header Bar */}
        <div className="bg-slate-900/90 px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
            <Eye className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>پیش‌نمایش شناور بلادرنگ</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-mono">
              Live PIP
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              title={isMinimized ? 'بزرگ‌نمایی پیش‌نمایش' : 'کوچک‌سازی'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 transition-all"
              title="بستن پنجره شناور"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-3 space-y-3">
            {/* Asset Selector Mini Buttons */}
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 custom-scrollbar text-[10px]">
              {[
                { id: 'logo80', label: 'لوگو ۸۰' },
                { id: 'cover400', label: 'کاور ۴۰۰' },
                { id: 'cover700_1', label: 'اسلایدر ۱' },
                { id: 'cover700_2', label: 'اسلایدر ۲' },
                { id: 'infographic', label: 'اینفوگرافی' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectAsset(item.id as any)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                    activeAsset === item.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Scaled Render Box */}
            <div className="relative w-full h-48 bg-slate-900/90 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden shadow-inner p-2">
              <div className="transform scale-[0.55] sm:scale-[0.62] origin-center transition-all">
                {activeAsset === 'logo80' && (
                  <div
                    className={`w-[80px] h-[80px] rounded-xl border-2 border-amber-500/70 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden shrink-0 ${currentFontCss}`}
                    style={getDynamicBackgroundStyle()}
                  >
                    <RenderPlacedLogo config={logoConfig} isDraggable={false} />
                    {currentLayers
                      .filter((l) => l.type !== 'background')
                      .map((l) => (
                        <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} />
                      ))}
                    <CanvasStickersOverlay stickers={currentStickers} isEditable={false} />
                  </div>
                )}

                {activeAsset === 'cover400' && (
                  <div
                    className={`w-[340px] h-[340px] rounded-2xl border-2 border-amber-500/40 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden ${currentFontCss}`}
                    style={getDynamicBackgroundStyle()}
                  >
                    <RenderPlacedLogo config={logoConfig} isDraggable={false} />
                    {currentLayers
                      .filter((l) => l.type !== 'background')
                      .map((l) => (
                        <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} />
                      ))}
                    <CanvasStickersOverlay stickers={currentStickers} isEditable={false} />
                  </div>
                )}

                {activeAsset === 'cover700_1' && (
                  <div
                    className={`w-[380px] h-[380px] rounded-2xl border-2 border-amber-500/40 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden ${currentFontCss}`}
                    style={getDynamicBackgroundStyle()}
                  >
                    <RenderPlacedLogo config={logoConfig} isDraggable={false} />
                    {currentLayers
                      .filter((l) => l.type !== 'background')
                      .map((l) => (
                        <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} />
                      ))}
                    <CanvasStickersOverlay stickers={currentStickers} isEditable={false} />
                  </div>
                )}

                {activeAsset === 'cover700_2' && (
                  <div
                    className={`w-[380px] h-[380px] rounded-2xl border-2 border-indigo-500/40 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden ${currentFontCss}`}
                    style={getDynamicBackgroundStyle()}
                  >
                    <RenderPlacedLogo config={logoConfig} isDraggable={false} />
                    {currentLayers
                      .filter((l) => l.type !== 'background')
                      .map((l) => (
                        <DynamicLayerRenderer key={l.id} layer={l} isInteractive={false} />
                      ))}
                    <CanvasStickersOverlay stickers={currentStickers} isEditable={false} />
                  </div>
                )}

                {activeAsset === 'infographic' && (
                  <div
                    className={`w-[320px] h-[380px] overflow-y-auto custom-scrollbar rounded-2xl border-2 border-emerald-500/40 p-4 space-y-3 relative ${currentFontCss}`}
                    style={getDynamicBackgroundStyle()}
                  >
                    <RenderPlacedLogo config={logoConfig} isDraggable={false} />
                    <CanvasStickersOverlay stickers={currentStickers} isEditable={false} />
                    <div className="text-center bg-slate-950/85 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                      <span className="text-[9px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        اینفوگرافی رسمی
                      </span>
                      <h4 className="text-xs font-black text-white">{productName}</h4>
                    </div>
                    {infographicRows.slice(0, 3).map((row, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-2.5 rounded-xl border border-white/10 text-[10px]">
                        <h6 className="font-bold text-amber-300 mb-0.5">{row.title}</h6>
                        <p className="text-slate-300 truncate">{row.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>تغییرات بلادرنگ بدون بستن تنظیمات</span>
              </span>
              <span className="font-mono text-amber-300">{activeAsset}</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default LiveMiniPreviewModal;
