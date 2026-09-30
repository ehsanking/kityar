import React, { useState } from 'react';
import { 
  Wand2, ArrowRight, ArrowLeft, Check, Layers, Image as ImageIcon, 
  Palette, Sliders, Smartphone, CheckCircle2, Download, Eye, Sparkles, RefreshCw
} from 'lucide-react';
import ZhaketLogo from './ZhaketLogo';

export interface WizardStep {
  id: number;
  title: string;
  subtitle: string;
  assetKey: 'logo80' | 'cover400' | 'cover700_1' | 'cover700_2' | 'infographic';
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'لوگوی محصول (۸۰×۸۰)', subtitle: 'نماد و آواتار شاخص در صفحه دسته‌بندی و سرچ ژاکت', assetKey: 'logo80' },
  { id: 2, title: 'کاور اصلی (۴۰۰×۴۰۰)', subtitle: 'کاور اصلی کارت محصول در ویترین و صفحه اول ژاکت', assetKey: 'cover400' },
  { id: 3, title: 'کاور اول معرفی (۷۰۰×۷۰۰)', subtitle: 'اسلایدر اول صفحه داخلی با موکاپ و ویژگی‌ها', assetKey: 'cover700_1' },
  { id: 4, title: 'کاور دوم معرفی (۷۰۰×۷۰۰)', subtitle: 'اسلایدر دوم با قابلیت‌های پیشرفته و تاییدیه ژاکت', assetKey: 'cover700_2' },
  { id: 5, title: 'اینفوگرافی کامل (۵۹۴×۴۰۰۰)', subtitle: 'جدول مقایسه زنده، تایم‌لاین و مشخصات جامع در ژاکت', assetKey: 'infographic' },
];

export interface WizardHeaderProps {
  activeStep?: 'logo80' | 'cover400' | 'cover700_1' | 'cover700_2' | 'infographic';
  onSelectStep?: (step: 'logo80' | 'cover400' | 'cover700_1' | 'cover700_2' | 'infographic') => void;
  productName?: string;
  onUpdateProductName?: (name: string) => void;
  currentStepIndex?: number;
  onStepClick?: (stepIndex: number) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onComplete?: () => void;
}

export const WizardStepBar: React.FC<WizardHeaderProps> = ({
  activeStep,
  onSelectStep,
  productName,
  onUpdateProductName,
  currentStepIndex,
  onStepClick,
  onNext,
  onPrev,
  onComplete,
}) => {
  const derivedIndex = activeStep
    ? WIZARD_STEPS.findIndex((s) => s.assetKey === activeStep)
    : (currentStepIndex ?? 0);
  const activeIdx = derivedIndex >= 0 ? derivedIndex : 0;
  const currentStep = WIZARD_STEPS[activeIdx];
  const isFirst = activeIdx === 0;
  const isLast = activeIdx === WIZARD_STEPS.length - 1;

  const handleStepClick = (idx: number) => {
    if (onSelectStep) {
      onSelectStep(WIZARD_STEPS[idx].assetKey);
    }
    if (onStepClick) {
      onStepClick(idx);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (onSelectStep && !isLast) {
      onSelectStep(WIZARD_STEPS[activeIdx + 1].assetKey);
    }
  };

  const handlePrev = () => {
    if (onPrev) {
      onPrev();
    } else if (onSelectStep && !isFirst) {
      onSelectStep(WIZARD_STEPS[activeIdx - 1].assetKey);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl mb-6 space-y-4">
      {/* Top progress indicator */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-sm">
            {currentStep.id} / ۵
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">مرحله {currentStep.id} ویزارد کیت یار:</span>
              <h3 className="text-sm sm:text-base font-black text-white">{currentStep.title}</h3>
            </div>
            <p className="text-[11px] text-slate-400">{currentStep.subtitle}</p>
          </div>
        </div>

        {/* Wizard Navigation Controls */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>مرحله قبل</span>
            </button>
          )}

          {!isLast ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/25 transition-all"
            >
              <span>مرحله بعد ({WIZARD_STEPS[activeIdx + 1]?.title.split(' ')[0]})</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>تکمیل ویزارد و دریافت پکیج</span>
            </button>
          )}
        </div>
      </div>

      {/* Steps Step-by-Step Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800/80">
        {WIZARD_STEPS.map((s, idx) => {
          const isActive = idx === activeIdx;
          const isDone = idx < activeIdx;
          return (
            <button
              key={s.id}
              onClick={() => handleStepClick(idx)}
              className={`p-2 rounded-xl text-right transition-all flex items-center gap-2 border text-xs ${
                isActive 
                  ? 'bg-amber-500/20 border-amber-500/60 text-white font-bold shadow-md' 
                  : isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-bold ${
                isActive ? 'bg-amber-500 text-slate-950' : isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}>
                {isDone ? '✓' : s.id}
              </span>
              <span className="truncate">{s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WizardStepBar;
