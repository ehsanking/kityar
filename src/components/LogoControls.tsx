import React, { useRef, useState } from 'react';
import ColorField from './ColorField';
import { Upload, Trash2, Move, Layers, CheckCircle2, Image as ImageIcon, Sliders } from 'lucide-react';
import ZhaketLogo, { LogoBackdropType, LogoPlacement, ZhaketLogoConfig } from './ZhaketLogo';
import { toPersianDigits } from '../utils/persianNumbers';

interface LogoControlsProps {
  config: ZhaketLogoConfig;
  onChange: (newConfig: ZhaketLogoConfig) => void;
  onAddLogoLayer?: (logoUrl?: string) => void;
}

export const LogoControls: React.FC<LogoControlsProps> = ({ config, onChange, onAddLogoLayer }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file && (file.type.startsWith('image/') || file.name.endsWith('.svg'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onChange({
          ...config,
          enabled: true,
          customLogoUrl: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
            className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
          />
          <span>نمایش لوگوی ژاکت روی کاورها و بنرها</span>
        </label>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
          فایل ۱۰۰٪ آپلود کاربر
        </span>
      </div>

      {onAddLogoLayer && (
        <button
          type="button"
          onClick={() => onAddLogoLayer(config.customLogoUrl || undefined)}
          className="w-full py-2 px-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-95 cursor-pointer"
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>+ افزودن / بازگردانی لایه‌ی لوگوی ژاکت روی بوم</span>
        </button>
      )}

      {config.enabled && (
        <div className="space-y-4 pt-1 text-xs">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* 1. PRIMARY PROMINENT UPLOAD DROPZONE */}
          {!config.customLogoUrl ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2.5 ${
                isDragging
                  ? 'border-amber-400 bg-amber-500/20 scale-[1.02]'
                  : 'border-amber-500/50 hover:border-amber-400 bg-gradient-to-b from-amber-500/10 to-slate-900/60 hover:bg-amber-500/15'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Upload className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-300">
                  فایل لوگوی اصلی خود را اینجا بکشید یا کلیک کنید
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  پشتیبانی از فایل‌های PNG شفاف، SVG وکتور یا JPG با کیفیت بالا
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all"
              >
                انتخاب فایل لوگو از سیستم
              </button>
            </div>
          ) : (
            /* Uploaded File Active Card */
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={config.customLogoUrl}
                    alt="لوگوی آپلود شده شما"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>فایل لوگوی شما با موفقیت بارگذاری شد</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    دقیقاً همان فایل اصلی بدون حتی یک پیکسل تغییر روی کاورها قرار دارد
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-all flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>تغییر فایل</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, customLogoUrl: null })}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                  title="حذف لوگو"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* 2. کاور و پس‌زمینه زیر لوگو (White cover / Backdrop) */}
          <div>
            <label className="text-[11px] font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>کاور زیر لوگو (اختیاری):</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                {config.backdrop === 'white-card' && 'کاور سفید مات'}
                {config.backdrop === 'white-glass' && 'کاور سفید شیشه‌ای'}
                {config.backdrop === 'dark-card' && 'کاور تیره زغالی'}
                {config.backdrop === 'dark-glass' && 'کاور شیشه‌ای دودی'}
                {config.backdrop === 'transparent' && 'بدون کاور (شفاف)'}
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'transparent', label: 'بدون کاور (شفاف)' },
                { id: 'white-card', label: 'سفید مات' },
                { id: 'white-glass', label: 'سفید شیشه' },
                { id: 'dark-card', label: 'تیره زغالی' },
                { id: 'dark-glass', label: 'تیره شیشه' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange({ ...config, backdrop: item.id as LogoBackdropType })}
                  className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all truncate text-center ${
                    config.backdrop === item.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. موقعیت مکانی لوگو روی کادر (Placement) */}
          <div>
            <label className="text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              <span>موقعیت قرارگیری لوگو روی کاور (همچنین با درگ آزاد قابل جابجایی است):</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { id: 'top-right', label: 'بالا راست' },
                { id: 'top-left', label: 'بالا چپ' },
                { id: 'bottom-right', label: 'پایین راست' },
                { id: 'bottom-left', label: 'پایین چپ' },
                { id: 'top-center', label: 'بالا مرکز' },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onChange({ ...config, placement: pos.id as LogoPlacement })}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold border transition-all truncate text-center ${
                    config.placement === pos.id
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. ابعاد و سایزدهی عددی لوگو و باکس کادر (Numerical Size Controls) */}
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>سایزدهی عددی دقیق لوگو و کادر باکس (Photoshop Precision)</span>
              </span>
              <div className="shrink-0 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <ZhaketLogo
                  backdrop={config.backdrop}
                  customLogoUrl={config.customLogoUrl}
                  sizePx={24}
                  boxPaddingPx={config.boxPaddingPx}
                  boxRadiusPx={config.boxRadiusPx}
                  boxBorderWidth={config.boxBorderWidth}
                  boxBorderColor={config.boxBorderColor}
                  boxBgColor={config.boxBgColor}
                />
              </div>
            </div>

            {/* Quick Size Presets */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 block font-medium">سایزهای استاندارد سریع:</span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: `کوچک ${toPersianDigits(32)}px`, size: 32 },
                  { label: `متوسط ${toPersianDigits(48)}px`, size: 48 },
                  { label: `بزرگ ${toPersianDigits(64)}px`, size: 64 },
                  { label: `بنر ${toPersianDigits(80)}px`, size: 80 },
                ].map((preset) => (
                  <button
                    key={preset.size}
                    type="button"
                    onClick={() => onChange({ ...config, customSizePx: preset.size })}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      config.customSizePx === preset.size
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Number inputs for Logo Height & Width */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-medium">ارتفاع لوگو (Height):</span>
                  <span className="font-mono text-amber-400 font-bold">{toPersianDigits(config.customSizePx)}px</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="16"
                    max="240"
                    step="1"
                    value={config.customSizePx || 52}
                    onChange={(e) => onChange({ ...config, customSizePx: Number(e.target.value) || 52 })}
                    className="w-20 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-center font-mono text-white text-xs font-bold outline-none"
                  />
                  <input
                    type="range"
                    min="16"
                    max="200"
                    value={config.customSizePx || 52}
                    onChange={(e) => onChange({ ...config, customSizePx: Number(e.target.value) || 52 })}
                    className="flex-1 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-medium">عرض لوگو (Width):</span>
                  <span className="font-mono text-cyan-400 font-bold">{config.logoWidthPx ? `${config.logoWidthPx}px` : 'خودکار'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="300"
                    step="2"
                    placeholder="0 (خودکار)"
                    value={config.logoWidthPx || ''}
                    onChange={(e) => onChange({ ...config, logoWidthPx: Number(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-lg px-2 py-1 text-center font-mono text-white text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Numerical Box Controls: Padding, Radius, Border Width */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">پدینگ کادر باکس:</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={config.boxPaddingPx ?? 8}
                    onChange={(e) => onChange({ ...config, boxPaddingPx: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-center font-mono text-white text-xs font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">px</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">انحنای گوشه باکس:</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={config.boxRadiusPx ?? 12}
                    onChange={(e) => onChange({ ...config, boxRadiusPx: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-center font-mono text-white text-xs font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">px</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">ضخامت حاشیه باکس:</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="12"
                    value={config.boxBorderWidth ?? 1}
                    onChange={(e) => onChange({ ...config, boxBorderWidth: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-center font-mono text-white text-xs font-bold outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">px</span>
                </div>
              </div>
            </div>

            {/* Colors for Box: Border Color & Background Color */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">رنگ خط حاشیه باکس:</label>
                <div className="flex items-center gap-1.5">
                  <ColorField label="انتخاب رنگ" value={config.boxBorderColor?.startsWith('#') ? config.boxBorderColor : '#f59e0b'} onChange={(v) => onChange({ ...config, boxBorderColor: v })} />
                  <input
                    type="text"
                    value={config.boxBorderColor || '#f59e0b'}
                    onChange={(e) => onChange({ ...config, boxBorderColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">رنگ پس‌زمینه باکس:</label>
                <div className="flex items-center gap-1.5">
                  <ColorField label="انتخاب رنگ" value={config.boxBgColor?.startsWith('#') ? config.boxBgColor : '#0f172a'} onChange={(v) => onChange({ ...config, boxBgColor: v })} />
                  <input
                    type="text"
                    placeholder="شفاف (پیش‌فرض)"
                    value={config.boxBgColor || ''}
                    onChange={(e) => onChange({ ...config, boxBgColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white placeholder:text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Numerical Position Offset (X & Y in px) */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">جابجایی افقی (X):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={config.xOffset || 0}
                    onChange={(e) => onChange({ ...config, xOffset: Number(e.target.value) || 0 })}
                    className="w-14 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-1.5 py-0.5 text-center font-mono text-white text-xs"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">px</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-1.5 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium">جابجایی عمودی (Y):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={config.yOffset || 0}
                    onChange={(e) => onChange({ ...config, yOffset: Number(e.target.value) || 0 })}
                    className="w-14 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded px-1.5 py-0.5 text-center font-mono text-white text-xs"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoControls;
