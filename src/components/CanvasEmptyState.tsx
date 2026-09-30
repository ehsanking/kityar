import React from 'react';
import { 
  Sparkles, RotateCcw, Plus, Square, Circle, 
  Star, Type, Layers, Flame, ArrowRight
} from 'lucide-react';

export interface CanvasEmptyStateProps {
  activeAsset: string;
  isCompact?: boolean;
  onRestoreTemplate: () => void;
  onAddStarterElements?: () => void;
  onOpen3DModal: () => void;
  onAddVectorShape?: (type: 'rect' | 'circle' | 'star' | 'text' | 'discount-ribbon') => void;
}

export const CanvasEmptyState: React.FC<CanvasEmptyStateProps> = ({
  activeAsset,
  isCompact = false,
  onRestoreTemplate,
  onAddStarterElements,
  onOpen3DModal,
  onAddVectorShape,
}) => {
  // If it's the 80x80 logo, render an ultra-compact indicator to fit inside 80x80 px
  if (isCompact || activeAsset === 'logo80') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center bg-slate-950/70 backdrop-blur-sm z-20 select-none animate-in fade-in duration-200">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRestoreTemplate();
          }}
          className="group flex flex-col items-center justify-center gap-0.5 p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-all hover:scale-105 active:scale-95"
          title="بوم خالی است - کلیک برای بارگذاری قالب پیش‌فرض لوگو ۸۰"
        >
          <RotateCcw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
          <span className="text-[8px] font-black leading-tight">بازیابی قالب</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-4 flex flex-col items-center justify-center p-4 text-center rounded-2xl bg-slate-950/85 border-2 border-dashed border-amber-500/40 backdrop-blur-md z-20 select-none space-y-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Ambient Pulsing Icon Badge */}
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-indigo-500/30 rounded-2xl blur-lg animate-pulse" />
        <div className="relative w-12 h-12 rounded-2xl bg-slate-900 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-xl">
          <Layers className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* Headline & Description */}
      <div className="space-y-1 max-w-xs">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <h4 className="text-xs sm:text-sm font-black text-white">
            بوم در حال حاضر خالی و آماده است
          </h4>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          می‌توانید قالب استاندارد ژاکت را بازیابی کنید یا لایه‌های دلخواه خود را بیافزایید.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs justify-center pt-1">
        {/* Restore Template Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRestoreTemplate();
          }}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          title="بارگذاری و بازیابی لایه‌های قالب استاندارد ژاکت"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازیابی قالب استاندارد</span>
        </button>

        {/* Quick Add 3D Model */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen3DModal();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          title="باز کردن کتابخانه مدل‌های سه‌بعدی و آیکون‌ها"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>مدل‌های ۳D</span>
        </button>
      </div>

      {/* Quick Vector Shapes Short Strip */}
      {onAddVectorShape && (
        <div className="pt-2 border-t border-slate-800/80 w-full max-w-xs">
          <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">افزودن سریع المان برداری:</span>
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddVectorShape('rect');
              }}
              className="px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
              title="مستطیل / کارت شیشه‌ای"
            >
              <Square className="w-3 h-3 text-indigo-400" />
              <span>مستطیل</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddVectorShape('circle');
              }}
              className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
              title="دایره برداری"
            >
              <Circle className="w-3 h-3 text-emerald-400" />
              <span>دایره</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddVectorShape('star');
              }}
              className="px-2 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
              title="ستاره ویژه"
            >
              <Star className="w-3 h-3 text-amber-400" />
              <span>ستاره</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddVectorShape('text');
              }}
              className="px-2 py-1 rounded-lg bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-500/30 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95"
              title="تیتر متنی"
            >
              <Type className="w-3 h-3 text-sky-400" />
              <span>متن</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasEmptyState;
