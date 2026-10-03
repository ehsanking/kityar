import React, { useRef } from 'react';
import { 
  Smartphone, Tablet, Laptop, Monitor, Globe, Box, 
  Upload, Sliders, RotateCw, Trash2, Plus, Check, Eye
} from 'lucide-react';
import { CanvasLayerItem } from '../types/canvasLayers';

interface MockupComposerProps {
  onAddMockup: (mockupConfig: Partial<CanvasLayerItem>) => void;
}

export interface MockupPreset {
  id: 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'browser' | 'box3d';
  title: string;
  icon: any;
  defaultScale: number;
  description: string;
}

export const MOCKUP_PRESETS: MockupPreset[] = [
  { id: 'mobile', title: 'گوشی هوشمند (آیفون ۱۶ پرو)', icon: Smartphone, defaultScale: 1.0, description: 'قاب مدرن موبایل با داینامیک آیلند و سایه نرم' },
  { id: 'tablet', title: 'تبلت حرفه‌ای (آیپد پرو)', icon: Tablet, defaultScale: 0.9, description: 'کادر تبلت با نسبت تصویر متناسب با داشبوردهای مدیریتی' },
  { id: 'laptop', title: 'لپ‌تاپ مدرن (مک‌بوک پرو)', icon: Laptop, defaultScale: 0.95, description: 'موکاپ لپ‌تاپ باز با کیبورد و بازتاب نور' },
  { id: 'desktop', title: 'مانیتور دسکتاپ (Studio Display)', icon: Monitor, defaultScale: 0.85, description: 'نمایشگر عریض با پایه آلومینیومی و صفحه تمام‌صفحه' },
  { id: 'browser', title: 'پنجره مرورگر وب (Safari / Web)', icon: Globe, defaultScale: 0.9, description: 'فریم مینیمال مرورگر با دکمه‌های کنترلی' },
  { id: 'box3d', title: 'جعبه پکیج نرم‌افزاری ۳ بعدی', icon: Box, defaultScale: 1.0, description: 'باکس محصول سه‌بعدی با زاویه پرسپکتیو استاندارد ژاکت' },
];

export const MockupComposer: React.FC<MockupComposerProps> = ({ onAddMockup }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = React.useState<'mobile' | 'tablet' | 'laptop' | 'desktop' | 'browser' | 'box3d'>('mobile');
  const [frameColor, setFrameColor] = React.useState<'dark' | 'silver' | 'gold' | 'midnight' | 'white'>('dark');
  const [screenPreview, setScreenPreview] = React.useState<string | null>(null);
  const [scale, setScale] = React.useState<number>(1.0);
  const [tilt3D, setTilt3D] = React.useState<boolean>(true);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateAndAdd = () => {
    const preset = MOCKUP_PRESETS.find((p) => p.id === selectedType);
    onAddMockup({
      name: `موکاپ ${preset?.title.split(' ')[0] || 'دستگاه'}`,
      type: 'mockup',
      scale: scale || preset?.defaultScale || 1.0,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      data: {
        mockupType: selectedType,
        screenImage: screenPreview,
        frameColor: frameColor,
        tilt3D: tilt3D,
      },
    });

    // Reset preview or leave ready for next
    setScreenPreview(null);
  };

  return (
    <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/30 space-y-4 shadow-xl text-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">کامپوزر موکاپ‌های سه‌بعدی</h4>
            <p className="text-[11px] leading-5 text-slate-300">افزودن فریم گوشی، تبلت، لپ‌تاپ، دسکتاپ، مرورگر و باکس سه‌بعدی به کاور</p>
          </div>
        </div>

        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
          قابل درگ و ریسایز
        </span>
      </div>

      {/* 1. Device Type Grid */}
      <div>
        <label className="text-[11px] font-medium text-slate-300 mb-1.5 block">انتخاب نوع فریم دستگاه:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {MOCKUP_PRESETS.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedType === m.id;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={isSelected}
                title={m.title}
                onClick={() => {
                  setSelectedType(m.id);
                  setScale(m.defaultScale);
                }}
                className={`min-h-14 p-2.5 rounded-xl border text-right transition-colors flex flex-col justify-between gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-400'}`} />
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[11px] leading-4">{m.title.split(' ')[0]} {m.title.split(' ')[1] || ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Upload Screen Content */}
      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-300 font-medium">تصویر صفحه داخل موکاپ:</span>
          {screenPreview && (
            <button
              type="button"
              onClick={() => setScreenPreview(null)}
              className="min-h-10 px-2 text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Trash2 className="w-3 h-3" />
              <span>حذف تصویر</span>
            </button>
          )}
        </div>

        {screenPreview ? (
          <div className="flex items-center gap-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
            <img src={screenPreview} alt="Screen Preview" className="w-12 h-12 object-cover rounded" />
            <div className="text-[10px] text-slate-300 truncate">
              <span>تصویر با موفقیت انتخاب شد</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-amber-400 block hover:underline font-bold mt-0.5"
              >
                تغییر تصویر
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-11 py-2.5 px-3 rounded-xl border border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>آپلود اسکرین‌شات / عکس دلخواه برای صفحه موکاپ</span>
          </button>
        )}
      </div>

      {/* 3. Frame Style & Perspective */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-slate-300 mb-1 block">رنگ فریم:</label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'dark', label: 'تیره', color: '#0f172a' },
              { id: 'silver', label: 'نقره‌ای', color: '#cbd5e1' },
              { id: 'gold', label: 'طلایی', color: '#f59e0b' },
              { id: 'midnight', label: 'دودی', color: '#1e1b4b' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                aria-label={`رنگ فریم ${c.label}`}
                aria-pressed={frameColor === c.id}
                onClick={() => setFrameColor(c.id as any)}
                className={`min-h-11 rounded-lg border flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
                  frameColor === c.id ? 'border-amber-400 ring-2 ring-amber-500/50' : 'border-slate-800'
                }`}
                style={{ backgroundColor: c.color }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-300 mb-1 block">زاویه سه‌بعدی:</label>
          <button
            type="button"
            aria-pressed={tilt3D}
            onClick={() => setTilt3D(!tilt3D)}
            className={`w-full min-h-11 rounded-lg text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
              tilt3D
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            <span>{tilt3D ? 'پرسپکتیو ایزومتریک' : 'تخت ۲ بعدی (Flat)'}</span>
          </button>
        </div>
      </div>

      {/* 4. Action Button to Add Mockup to Canvas */}
      <button
        type="button"
        onClick={handleCreateAndAdd}
        className="w-full min-h-11 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <Plus className="w-4 h-4" />
        <span>افزودن این موکاپ به لایه‌های بوم</span>
      </button>
    </div>
  );
};

export default MockupComposer;
