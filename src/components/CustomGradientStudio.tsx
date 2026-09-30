import React, { useState } from 'react';
import { Palette, RotateCw, Sparkles, Sun, Compass, Sliders, Check } from 'lucide-react';
import { RgbaStringColorPicker } from 'react-colorful';
import { toRgba } from '../utils/color';
import { CustomGradientConfig } from '../types/canvasLayers';
import { toPersianDigits } from '../utils/persianNumbers';

interface CustomGradientStudioProps {
  config: CustomGradientConfig;
  onChange: (newConfig: CustomGradientConfig) => void;
  onRandomize?: () => void;
}

export const PRESET_GRADIENTS: { name: string; stop1: string; stop2: string; stop3?: string }[] = [
  // 1-12: Luxury Gold & Amber
  { name: 'طلایی ژاکت کلاسیک', stop1: '#0f172a', stop2: '#1e293b', stop3: '#d97706' },
  { name: 'کهربایی سلطنتی', stop1: '#1c1917', stop2: '#451a03', stop3: '#f59e0b' },
  { name: 'طلایی لوکس مدرن', stop1: '#09090b', stop2: '#292524', stop3: '#fbbf24' },
  { name: 'برنز و عسل', stop1: '#18181b', stop2: '#3f3f46', stop3: '#f97316' },
  { name: 'زعفرانی نئون', stop1: '#020617', stop2: '#172554', stop3: '#fbbf24' },
  { name: 'طلایی تیتانیوم', stop1: '#0a0a0a', stop2: '#27272a', stop3: '#eab308' },
  { name: 'شامپاین طلایی', stop1: '#111827', stop2: '#374151', stop3: '#fde047' },
  { name: 'کهربایی تیره', stop1: '#0f172a', stop2: '#1e293b', stop3: '#b45309' },
  { name: 'طلایی متالیک', stop1: '#030712', stop2: '#1f2937', stop3: '#f59e0b' },
  { name: 'کوارتز طلایی', stop1: '#09090b', stop2: '#27272a', stop3: '#facc15' },
  { name: 'عقیق طلایی', stop1: '#171717', stop2: '#262626', stop3: '#ca8a04' },
  { name: 'زرین شبانه', stop1: '#020617', stop2: '#0f172a', stop3: '#eab308' },

  // 13-25: Cyberpunk & Neon Purples
  { name: 'سایبرپانک بنفش', stop1: '#18022b', stop2: '#3b0764', stop3: '#9333ea' },
  { name: 'ارغوانی نئونی', stop1: '#090514', stop2: '#2e1065', stop3: '#c084fc' },
  { name: 'بنفش کهکشانی', stop1: '#030014', stop2: '#1e1b4b', stop3: '#7c3aed' },
  { name: 'یاسی و بنفش تیره', stop1: '#0f051d', stop2: '#3b0764', stop3: '#a855f7' },
  { name: 'مادردارک بنفش', stop1: '#05030a', stop2: '#171026', stop3: '#6d28d9' },
  { name: 'نئون بنفش و سرخ', stop1: '#1f0426', stop2: '#4a044e', stop3: '#ec4899' },
  { name: 'بنفش الکتریک', stop1: '#020617', stop2: '#31105c', stop3: '#8b5cf6' },
  { name: 'سوپرنوا بنفش', stop1: '#0f0715', stop2: '#241038', stop3: '#d946ef' },
  { name: 'بنفش مخملی', stop1: '#11051c', stop2: '#2d0c42', stop3: '#a855f7' },
  { name: 'سایبر وایت', stop1: '#030712', stop2: '#3b0764', stop3: '#ec4899' },
  { name: 'بنفش اساطیری', stop1: '#09090b', stop2: '#1e1b4b', stop3: '#9333ea' },
  { name: 'یاسی مدرن', stop1: '#050505', stop2: '#261b36', stop3: '#c084fc' },
  { name: 'کهکشان بنفش', stop1: '#020205', stop2: '#1e0b36', stop3: '#7928ca' },

  // 26-38: Ocean & Deep Blue / Cyan
  { name: 'اقیانوس عمیق', stop1: '#031726', stop2: '#075985', stop3: '#06b6d4' },
  { name: 'آبی نئون سایان', stop1: '#020817', stop2: '#0369a1', stop3: '#38bdf8' },
  { name: 'آبی اطلسی', stop1: '#020617', stop2: '#1e3a8a', stop3: '#3b82f6' },
  { name: 'کوبالت درخشان', stop1: '#050b14', stop2: '#172554', stop3: '#2563eb' },
  { name: 'آبی شبانه', stop1: '#020617', stop2: '#0f172a', stop3: '#0284c7' },
  { name: 'فیروزه‌ای مدرن', stop1: '#04151f', stop2: '#082f49', stop3: '#06b6d4' },
  { name: 'اقیانوس آرام', stop1: '#020617', stop2: '#0c4a6e', stop3: '#22d3ee' },
  { name: 'آبی آتلانتیک', stop1: '#030712', stop2: '#1e293b', stop3: '#0ea5e9' },
  { name: 'آبی کاربنی', stop1: '#000000', stop2: '#1e1b4b', stop3: '#3b82f6' },
  { name: 'آب‌های ژرف', stop1: '#020617', stop2: '#0f172a', stop3: '#0284c7' },
  { name: 'سایان الکتریک', stop1: '#020617', stop2: '#083344', stop3: '#06b6d4' },
  { name: 'آبی یخی', stop1: '#030712', stop2: '#0f172a', stop3: '#38bdf8' },
  { name: 'سرمه‌ای نئون', stop1: '#020617', stop2: '#172554', stop3: '#60a5fa' },

  // 39-50: Emerald & Forest Greens
  { name: 'زمردی ووکامرس', stop1: '#022c22', stop2: '#064e3b', stop3: '#10b981' },
  { name: 'سبز جنگلی لوکس', stop1: '#021a14', stop2: '#022c22', stop3: '#34d399' },
  { name: 'سبز نئون مدرن', stop1: '#030f0c', stop2: '#064e3b', stop3: '#059669' },
  { name: 'سبز پاستلی دارک', stop1: '#041f18', stop2: '#022c22', stop3: '#10b981' },
  { name: 'یشمی درخشان', stop1: '#020f0d', stop2: '#064e3b', stop3: '#6ee7b7' },
  { name: 'سبز ماتريكس', stop1: '#020604', stop2: '#022c22', stop3: '#22c55e' },
  { name: 'سبز سدری', stop1: '#02100c', stop2: '#064e3b', stop3: '#10b981' },
  { name: 'سبز صنوبر', stop1: '#01110e', stop2: '#042f24', stop3: '#34d399' },
  { name: 'سبز مینیمال', stop1: '#020604', stop2: '#064e3b', stop3: '#059669' },
  { name: 'یشمی سلطنتی', stop1: '#021510', stop2: '#064e3b', stop3: '#10b981' },
  { name: 'سبز استوایی', stop1: '#010f0a', stop2: '#064e3b', stop3: '#4ade80' },
  { name: 'زمردی شبانه', stop1: '#020604', stop2: '#022c22', stop3: '#059669' },

  // 51-63: Sunset, Crimson & Warm Oranges
  { name: 'غروب آتشین', stop1: '#1f0907', stop2: '#7f1d1d', stop3: '#f97316' },
  { name: 'نارنجی ژاکت نئون', stop1: '#1c0a00', stop2: '#7c2d12', stop3: '#ea580c' },
  { name: 'سرخ آتش‌فشان', stop1: '#2b0907', stop2: '#991b1b', stop3: '#f43f5e' },
  { name: 'کهربایی گرم', stop1: '#1a0505', stop2: '#7f1d1d', stop3: '#fb923c' },
  { name: 'نارنجی طلایی', stop1: '#140602', stop2: '#431407', stop3: '#f97316' },
  { name: 'سرخ اناری', stop1: '#220909', stop2: '#831843', stop3: '#e11d48' },
  { name: 'غروب پاریس', stop1: '#1f0915', stop2: '#701a75', stop3: '#f43f5e' },
  { name: 'نارنجی تابان', stop1: '#120502', stop2: '#531c0d', stop3: '#fb7185' },
  { name: 'سرخ مرجانی', stop1: '#1c0709', stop2: '#881337', stop3: '#fb7185' },
  { name: 'آتش و خاکستر', stop1: '#0f0505', stop2: '#3f1515', stop3: '#f97316' },
  { name: 'نارنجی سلطنتی', stop1: '#180702', stop2: '#671e05', stop3: '#f59e0b' },
  { name: 'سرخ و طلایی', stop1: '#1f0907', stop2: '#7f1d1d', stop3: '#eab308' },
  { name: 'مرجانی دارک', stop1: '#1a0709', stop2: '#701a75', stop3: '#f43f5e' },

  // 64-75: Titanium, Carbon & Sleek Darks
  { name: 'زغالی متالیک تیتانیوم', stop1: '#020617', stop2: '#0f172a', stop3: '#334155' },
  { name: 'کربن مطلق', stop1: '#000000', stop2: '#09090b', stop3: '#27272a' },
  { name: 'خاکستری مدرن', stop1: '#030712', stop2: '#111827', stop3: '#4b5563' },
  { name: 'فولاد ضدزنگ', stop1: '#09090b', stop2: '#18181b', stop3: '#52525b' },
  { name: 'اسلات دارک', stop1: '#020617', stop2: '#1e293b', stop3: '#64748b' },
  { name: 'دودی متالیک', stop1: '#050505', stop2: '#171717', stop3: '#3f3f46' },
  { name: 'گرافیت تیره', stop1: '#020203', stop2: '#0f0f12', stop3: '#2d2d3d' },
  { name: 'مات متالیک', stop1: '#010409', stop2: '#161b22', stop3: '#30363d' },
  { name: 'کربن فیبر دارک', stop1: '#020408', stop2: '#0d1117', stop3: '#21262d' },
  { name: 'نقره‌ای تیره', stop1: '#09090b', stop2: '#27272a', stop3: '#71717a' },
  { name: 'آنتراسیت', stop1: '#050509', stop2: '#12121a', stop3: '#3f3f46' },
  { name: 'تاریکی مطلق', stop1: '#000000', stop2: '#030305', stop3: '#18181b' },

  // 76-87: Aurora, Pastel & Holographic
  { name: 'مدرن پاستلی شیشه‌ای', stop1: '#1e1b4b', stop2: '#4338ca', stop3: '#a855f7' },
  { name: 'اورورا شمالی', stop1: '#02151a', stop2: '#083344', stop3: '#14b8a6' },
  { name: 'هولوگرافیک مدرن', stop1: '#1e1b4b', stop2: '#312e81', stop3: '#ec4899' },
  { name: 'پاستل رویا', stop1: '#0f172a', stop2: '#312e81', stop3: '#f43f5e' },
  { name: 'نئون متالیک', stop1: '#18022b', stop2: '#0369a1', stop3: '#10b981' },
  { name: 'کهکشان رنگین‌کمان', stop1: '#090514', stop2: '#1e1b4b', stop3: '#3b82f6' },
  { name: 'رؤیای بنفش', stop1: '#130526', stop2: '#4a044e', stop3: '#38bdf8' },
  { name: 'آسمان گرگ‌ومیش', stop1: '#020617', stop2: '#1e1b4b', stop3: '#f43f5e' },
  { name: 'سراب الکتریک', stop1: '#0f0715', stop2: '#0e7490', stop3: '#a855f7' },
  { name: 'نئون فیوژن', stop1: '#050505', stop2: '#2e1065', stop3: '#06b6d4' },
  { name: 'اورورا بنفش و سبز', stop1: '#02100c', stop2: '#3b0764', stop3: '#10b981' },
  { name: 'گرادیانت مدرن پلاس', stop1: '#09090b', stop2: '#312e81', stop3: '#f59e0b' },

  // 88-105: Rose Gold, Pink, Magenta & Velvet
  { name: 'رز گلد لوکس', stop1: '#1c070f', stop2: '#581c87', stop3: '#f43f5e' },
  { name: 'رز گلد متالیک', stop1: '#140508', stop2: '#4c0519', stop3: '#fb7185' },
  { name: 'سرخابي سلطنتی', stop1: '#19030f', stop2: '#701a75', stop3: '#ec4899' },
  { name: 'مروارید صورتی', stop1: '#12040b', stop2: '#500724', stop3: '#f43f5e' },
  { name: 'مخملی سرخابی', stop1: '#1f0417', stop2: '#831843', stop3: '#d946ef' },
  { name: 'رز شیشه‌ای', stop1: '#090206', stop2: '#310413', stop3: '#fb7185' },
  { name: 'ارغوانی مخملی', stop1: '#14020a', stop2: '#4c0519', stop3: '#e11d48' },
  { name: 'رز گلد شبانه', stop1: '#0d0206', stop2: '#2b091e', stop3: '#f43f5e' },
  { name: 'سرخابي نئونی', stop1: '#0f020a', stop2: '#581c87', stop3: '#ec4899' },
  { name: 'مروارید شب', stop1: '#050204', stop2: '#1f0915', stop3: '#f43f5e' },
  { name: 'صورتی مدرن', stop1: '#0a0205', stop2: '#3b0764', stop3: '#f43f5e' },
  { name: 'رز سلطنتی', stop1: '#120308', stop2: '#4c0519', stop3: '#fb7185' },
  { name: 'باربی نئون دارک', stop1: '#0a0005', stop2: '#701a75', stop3: '#ec4899' },
  { name: 'سرخابی متالیک', stop1: '#0f030a', stop2: '#500724', stop3: '#f43f5e' },
  { name: 'رز گلد خالص', stop1: '#080104', stop2: '#310413', stop3: '#fda4af' },
  { name: 'یاسی و رز گلد', stop1: '#0c0208', stop2: '#3b0764', stop3: '#fb7185' },
  { name: 'مخملی تیره', stop1: '#090105', stop2: '#2b091e', stop3: '#e11d48' },
  { name: 'سرخابی شیشه‌ای', stop1: '#0f030a', stop2: '#4a044e', stop3: '#f43f5e' }
];

export const CustomGradientStudio: React.FC<CustomGradientStudioProps> = ({
  config,
  onChange,
  onRandomize,
}) => {
  const [activePicker, setActivePicker] = useState<'stop1' | 'stop2' | 'stop3' | null>(null);

  return (
    <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/30 space-y-4 shadow-xl text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>استودیوی گرادیانت سفارشی</span>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded-full font-mono">
                {toPersianDigits(PRESET_GRADIENTS.length)} پالت حرفه‌ای
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">تنظیم دقیق رنگ‌های مبدا، مقصد و زاویه تابش با تنوع بی‌نظیر برای جلوگیری از تکرار</p>
          </div>
        </div>

        {onRandomize && (
          <button
            type="button"
            onClick={onRandomize}
            className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>رندوم گرادیانت</span>
          </button>
        )}
      </div>

      {/* 1. Gradient Type */}
      <div>
        <label className="text-[11px] font-medium text-slate-300 mb-1.5 flex items-center gap-1">
          <Compass className="w-3.5 h-3.5 text-purple-400" />
          <span>نوع و الگوی گرادیانت:</span>
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'linear', label: 'خطی (Linear)' },
            { id: 'radial', label: 'دایره‌ای (Radial)' },
            { id: 'conic', label: 'مخروطی (Conic)' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...config, type: t.id as any })}
              className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                config.type === t.id
                  ? 'bg-purple-600 text-white border-purple-400 shadow-md font-black'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Color Pickers with react-colorful */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 relative">
        {/* Stop 1 */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>رنگ مبدا:</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActivePicker(activePicker === 'stop1' ? null : 'stop1')}
              className="w-7 h-7 rounded-lg border border-white/20 shadow-sm transition-transform active:scale-95 shrink-0"
              style={{ backgroundColor: config.stop1 }}
              title="تغییر رنگ مبدا با react-colorful"
            />
            <input
              type="text"
              value={config.stop1}
              onChange={(e) => onChange({ ...config, stop1: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-200 uppercase"
            />
          </div>
        </div>

        {/* Stop 2 */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>رنگ میانی:</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActivePicker(activePicker === 'stop2' ? null : 'stop2')}
              className="w-7 h-7 rounded-lg border border-white/20 shadow-sm transition-transform active:scale-95 shrink-0"
              style={{ backgroundColor: config.stop2 }}
              title="تغییر رنگ میانی با react-colorful"
            />
            <input
              type="text"
              value={config.stop2}
              onChange={(e) => onChange({ ...config, stop2: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-200 uppercase"
            />
          </div>
        </div>

        {/* Stop 3 (Accent) */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>رنگ تابش/اکسنت:</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActivePicker(activePicker === 'stop3' ? null : 'stop3')}
              className="w-7 h-7 rounded-lg border border-white/20 shadow-sm transition-transform active:scale-95 shrink-0"
              style={{ backgroundColor: config.stop3 || config.stop2 }}
              title="تغییر رنگ اکسنت با react-colorful"
            />
            <input
              type="text"
              value={config.stop3 || config.stop2}
              onChange={(e) => onChange({ ...config, stop3: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-200 uppercase"
            />
          </div>
        </div>

        {/* Floating react-colorful Color Picker */}
        {activePicker && (
          <div className="col-span-3 p-3 bg-slate-950 rounded-xl border border-purple-500/50 shadow-2xl space-y-2 z-20 animate-fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
              <span>
                انتخابگر پیشرفته رنگ ({activePicker === 'stop1' ? 'مبدا' : activePicker === 'stop2' ? 'میانی' : 'اکسنت'})
              </span>
              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 text-[10px]"
              >
                بستن ✕
              </button>
            </div>
            <RgbaStringColorPicker
              color={toRgba(
                activePicker === 'stop1'
                  ? config.stop1
                  : activePicker === 'stop2'
                  ? config.stop2
                  : config.stop3 || config.stop2
              )}
              onChange={(color) => {
                if (activePicker === 'stop1') onChange({ ...config, stop1: color });
                else if (activePicker === 'stop2') onChange({ ...config, stop2: color });
                else onChange({ ...config, stop3: color });
              }}
              style={{ width: '100%', height: '130px' }}
            />
          </div>
        )}
      </div>

      {/* 3. Angle Slider */}
      {config.type === 'linear' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-purple-400" />
              <span>زاویه گرادیانت ({toPersianDigits(config.angle)}°):</span>
            </span>
            <span className="font-mono text-purple-300 text-[10px]">{config.angle} deg</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={config.angle}
            onChange={(e) => onChange({ ...config, angle: Number(e.target.value) })}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>
      )}

      {/* 4. Quick Gradient Swatches (105 Presets, Scrollable Grid) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-slate-400 block font-bold">
            پالت‌های آماده گرادیانت ({toPersianDigits(PRESET_GRADIENTS.length)} عدد متنوع):
          </label>
          <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">
            بدون تکرار و تنوع ۱۰۰٪
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {PRESET_GRADIENTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                onChange({
                  ...config,
                  stop1: p.stop1,
                  stop2: p.stop2,
                  stop3: p.stop3,
                })
              }
              className="group relative h-9 rounded-xl border border-slate-800 hover:border-purple-400 overflow-hidden transition-all shadow-sm cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${p.stop1}, ${p.stop2} ${p.stop3 ? `, ${p.stop3}` : ''})`,
              }}
              title={`${p.name} (#${idx + 1})`}
            >
              <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] text-white font-bold transition-opacity p-0.5 text-center leading-tight">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomGradientStudio;
