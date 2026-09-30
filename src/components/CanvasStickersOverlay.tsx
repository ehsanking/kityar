import React from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, GripVertical } from 'lucide-react';
import { CanvasStickerInstance, getBadgeStyleClass } from './SemanticStickerLibrary';

interface CanvasStickersOverlayProps {
  stickers: CanvasStickerInstance[];
  onRemoveSticker?: (instanceId: string) => void;
  onUpdateStickerPosition?: (instanceId: string, x: number, y: number) => void;
  isEditable?: boolean;
}

export const CanvasStickersOverlay: React.FC<CanvasStickersOverlayProps> = ({
  stickers,
  onRemoveSticker,
  onUpdateStickerPosition,
  isEditable = true,
}) => {
  if (!stickers || stickers.length === 0) return null;

  return (
    <>
      {stickers.map((stk) => {
        const badgeClass = getBadgeStyleClass(stk.badgeStyle);

        return (
          <motion.div
            key={stk.instanceId}
            drag={isEditable}
            dragMomentum={false}
            dragElastic={0}
            onDragEnd={(_e, info) => {
              if (!onUpdateStickerPosition) return;
              const targetEl = _e.target as HTMLElement;
              const parent = targetEl?.closest('.group') || targetEl?.parentElement;
              const pWidth = parent?.clientWidth || 340;
              const pHeight = parent?.clientHeight || 340;
              const deltaXPercent = (info.offset.x / pWidth) * 100;
              const deltaYPercent = (info.offset.y / pHeight) * 100;
              const newX = Math.round(Math.max(5, Math.min(95, stk.x + deltaXPercent)));
              const newY = Math.round(Math.max(5, Math.min(95, stk.y + deltaYPercent)));
              onUpdateStickerPosition(stk.instanceId, newX, newY);
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: stk.scale || 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute z-20 group select-none ${isEditable ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
            style={{
              top: `${stk.y}%`,
              left: `${stk.x}%`,
              transform: 'translate(-50%, -50%)',
            }}
            title="استیکر معنایی — قابلیت درگ و جابجایی دقیق در هر کجای طرح"
          >
            <div className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${badgeClass} backdrop-blur-md shadow-2xl transition-transform hover:scale-105`}>
              {/* Grip icon for visual affordance */}
              {isEditable && (
                <GripVertical className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
              
              {/* Icon */}
              <span className="text-base leading-none drop-shadow-sm shrink-0">{stk.iconValue}</span>
              
              {/* Title & Tagline */}
              <div className="text-right flex flex-col justify-center">
                <span className="text-[10px] sm:text-[11px] font-black leading-tight tracking-tight whitespace-nowrap">
                  {stk.title}
                </span>
                {stk.tagline && (
                  <span className="text-[8px] opacity-90 leading-none whitespace-nowrap">
                    {stk.tagline}
                  </span>
                )}
              </div>

              {/* Remove Button */}
              {isEditable && onRemoveSticker && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSticker(stk.instanceId);
                  }}
                  className="opacity-0 group-hover:opacity-100 -mr-1 mr-0.5 p-0.5 rounded-full bg-slate-950/80 text-rose-300 hover:text-white hover:bg-rose-600 transition-all"
                  title="حذف این استیکر از طرح"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </>
  );
};

export default CanvasStickersOverlay;
