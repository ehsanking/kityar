import React, { useEffect, useRef } from 'react';
import { 
  Square, Circle, Star, Type, Layers, Sparkles, 
  Trash2, Copy, Lock, Unlock, ArrowUp, ArrowDown, 
  RotateCcw, Download, Maximize2, Palette, Flame, 
  ShieldCheck, Smartphone, Eye, Plus, Zap
} from 'lucide-react';
import { CanvasLayerItem } from '../types/canvasLayers';

export interface CanvasContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  onClose: () => void;
  activeAsset: string;
  selectedLayer: CanvasLayerItem | null;
  onAddVectorShape: (type: 'rect' | 'circle' | 'star' | 'text' | 'badge' | 'discount-ribbon' | 'stat-card' | 'feature-pills') => void;
  onOpen3DModal: () => void;
  onOpenStickerModal: () => void;
  onResetToBlank: () => void;
  onResetToTemplate: () => void;
  onResetInfographicRows?: () => void;
  onRandomizeGradient: () => void;
  onDuplicateLayer?: () => void;
  onToggleLockLayer?: () => void;
  onDeleteLayer?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onExportPng: () => void;
  onToggleFullscreenPreview: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  isOpen,
  x,
  y,
  onClose,
  activeAsset,
  selectedLayer,
  onAddVectorShape,
  onOpen3DModal,
  onOpenStickerModal,
  onResetToBlank,
  onResetToTemplate,
  onResetInfographicRows,
  onRandomizeGradient,
  onDuplicateLayer,
  onToggleLockLayer,
  onDeleteLayer,
  onBringForward,
  onSendBackward,
  onExportPng,
  onToggleFullscreenPreview,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Safe position calculations to avoid overflowing viewport
  const menuWidth = 260;
  const menuHeight = selectedLayer ? 480 : 360;
  const posX = Math.min(x, window.innerWidth - menuWidth - 16);
  const posY = Math.min(y, window.innerHeight - menuHeight - 16);

  return (
    <div
      ref={menuRef}
      style={{ left: `${Math.max(10, posX)}px`, top: `${Math.max(10, posY)}px` }}
      className="fixed z-[100] w-[260px] bg-slate-950/95 border border-amber-500/40 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-2xl p-1.5 text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-800/80"
    >
      {/* Header Info */}
      <div className="px-3 py-2 flex items-center justify-between text-[11px] text-amber-400 font-bold">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>منوی سریع بوم ژاکت</span>
        </span>
        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">
          {activeAsset}
        </span>
      </div>

      {/* 1. Contextual Active Layer Actions (if layer is selected) */}
      {selectedLayer && (
        <div className="py-1">
          <div className="px-2.5 py-1 text-[10px] font-semibold text-indigo-400 flex items-center justify-between">
            <span>لایه: {selectedLayer.name}</span>
            <span className="text-[9px] text-slate-500 font-mono">{selectedLayer.type}</span>
          </div>

          {onDuplicateLayer && (
            <button
              type="button"
              onClick={() => {
                onDuplicateLayer();
                onClose();
              }}
              className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>همانندسازی و کپی لایه</span>
              </div>
              <span className="text-[10px] text-slate-500">Duplicate</span>
            </button>
          )}

          {onToggleLockLayer && (
            <button
              type="button"
              onClick={() => {
                onToggleLockLayer();
                onClose();
              }}
              className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                {selectedLayer.locked ? (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{selectedLayer.locked ? 'باز کردن قفل لایه' : 'قفل کردن لایه'}</span>
              </div>
            </button>
          )}

          {onBringForward && (
            <button
              type="button"
              onClick={() => {
                onBringForward();
                onClose();
              }}
              className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>جلو آوردن ترتیب لایه</span>
            </button>
          )}

          {onSendBackward && (
            <button
              type="button"
              onClick={() => {
                onSendBackward();
                onClose();
              }}
              className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>عقب بردن ترتیب لایه</span>
            </button>
          )}

          {onDeleteLayer && (
            <button
              type="button"
              onClick={() => {
                onDeleteLayer();
                onClose();
              }}
              className="w-full px-2.5 py-1.5 rounded-lg hover:bg-rose-950/60 text-rose-300 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>حذف این لایه</span>
              </div>
              <span className="text-[10px] text-rose-400/70 font-mono">Del</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Add Vector Shapes Section (Integrated from Vector Studio) */}
      <div className="py-1">
        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
          <Square className="w-3 h-3 text-indigo-400" />
          <span>افزودن شکل و لایه برداری (Vector)</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onAddVectorShape('rect');
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Square className="w-3.5 h-3.5 text-indigo-400" />
          <span>مستطیل برداری / کارت شیشه‌ای</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAddVectorShape('circle');
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Circle className="w-3.5 h-3.5 text-emerald-400" />
          <span>دایره برداری / حلقه نوری</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAddVectorShape('star');
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>ستاره و نشان طلایی ویژه</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAddVectorShape('text');
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Type className="w-3.5 h-3.5 text-sky-400" />
          <span>متن و تیتر تایپوگرافی</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onAddVectorShape('discount-ribbon');
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>روبان تخفیف و آفر</span>
        </button>
      </div>

      {/* 3. Libraries & External Assets */}
      <div className="py-1">
        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
          <Layers className="w-3 h-3 text-amber-400" />
          <span>کتابخانه‌ها و المان‌های آماده</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onOpen3DModal();
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-amber-300 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>کتابخانه مدل‌های ۳D و آیکون‌ها</span>
          </div>
          <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono">100+</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenStickerModal();
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>استیکرهای سمانتیک محصول</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onRandomizeGradient();
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>تغییر رنگ تصادفی گرادیانت بوم</span>
        </button>
      </div>

      {/* 4. Canvas Reset & View Actions */}
      <div className="py-1">
        <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400">تنظیمات و عملیات بوم</div>

        <button
          type="button"
          onClick={() => {
            onResetToBlank();
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-rose-950/40 text-rose-300 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold">بوم کاملاً خالی (Blank Canvas)</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            onResetToTemplate();
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>بازنشانی به قالب استاندارد</span>
        </button>

        {activeAsset === 'infographic' && onResetInfographicRows && (
          <button
            type="button"
            onClick={() => {
              onResetInfographicRows();
              onClose();
            }}
            className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-emerald-300 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>بازگردانی ردیف‌های پیش‌فرض اینفوگرافی</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            onToggleFullscreenPreview();
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
          <span>پیش‌نمایش تمام صفحه</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onExportPng();
            onClose();
          }}
          className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-900 text-slate-200 flex items-center gap-2 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>دانلود سریع PNG</span>
        </button>
      </div>
    </div>
  );
};

export default CanvasContextMenu;
