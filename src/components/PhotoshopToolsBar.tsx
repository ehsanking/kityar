import React, { useState } from 'react';
import {
  Move,
  Type,
  ShieldCheck,
  Shapes,
  Sparkles,
  Smartphone,
  Tag,
  Palette,
  Image as ImageIcon,
  Plus,
  HelpCircle,
  Flame,
  Award,
  Star,
  CheckCircle2,
  RefreshCw,
  Headphones,
  Shield
} from 'lucide-react';
import { CanvasLayerItem } from '../types/canvasLayers';

interface PhotoshopToolsBarProps {
  onAddTextLayer: () => void;
  onAddZhaketBadge: (badgeType: string, title: string, tagline?: string, icon?: string, style?: string) => void;
  onOpenIconLibrary: () => void;
  onOpenShapesLibrary: () => void;
  onOpenMockupStudio: () => void;
  onOpenGradientStudio: () => void;
  onOpenImageUpload: () => void;
  onAddPriceTag: () => void;
  onAddRatingBadge: () => void;
}

export const PhotoshopToolsBar: React.FC<PhotoshopToolsBarProps> = ({
  onAddTextLayer,
  onAddZhaketBadge,
  onOpenIconLibrary,
  onOpenShapesLibrary,
  onOpenMockupStudio,
  onOpenGradientStudio,
  onOpenImageUpload,
  onAddPriceTag,
  onAddRatingBadge,
}) => {
  const [activeFlyout, setActiveFlyout] = useState<'badge' | null>(null);

  const ZHAKET_OFFICIAL_BADGES = [
    {
      id: 'zhaket-money-back',
      title: 'گارانتی بازگشت وجه',
      tagline: '۱۰۰٪ تضمین رضایت ژاکت',
      icon: '🛡️',
      style: 'emerald-gradient',
    },
    {
      id: 'zhaket-6m-support',
      title: '۶ ماه پشتیبانی رایگان',
      tagline: 'پاسخگویی سریع کمتر از ۲ ساعت',
      icon: '🎧',
      style: 'orange-zhaket',
    },
    {
      id: 'zhaket-lifetime-update',
      title: 'آپدیت مادام‌العمر رایگان',
      tagline: 'دریافت خودکار از پیشخوان وردپرس',
      icon: '🔄',
      style: 'cyan-gradient',
    },
    {
      id: 'zhaket-original-code',
      title: 'ضمانت اصالت و لایسنس',
      tagline: 'تاییدیه رسمی و کد اورجینال ژاکت',
      icon: '💎',
      style: 'gold-gradient',
    },
    {
      id: 'zhaket-iranian-product',
      title: 'محصول ۱۰۰٪ ایرانی و بومی',
      tagline: 'توسعه‌داده شده برای نیاز بازار ایران',
      icon: '🇮🇷',
      style: 'emerald-gradient',
    },
    {
      id: 'zhaket-vip-gold',
      title: 'نشان محصول برگزیده ژاکت',
      tagline: 'رتبه اول رضایت خریداران',
      icon: '⭐',
      style: 'gold-gradient',
    },
  ];

  return (
    <div className="relative flex flex-col items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 gap-1.5 shadow-2xl backdrop-blur-md z-40 select-none">
      
      {/* 1. Selection Tool (V) */}
      <button
        type="button"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="ابزار جابجایی فتوشاپ (Move Tool - V)"
      >
        <Move className="w-4 h-4 text-amber-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          ابزار جابجایی لایه‌ها (V)
        </span>
      </button>

      {/* 2. Text Tool (T) */}
      <button
        type="button"
        onClick={onAddTextLayer}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="درج لایه متن فارسی (Type Tool - T)"
      >
        <Type className="w-4 h-4 text-sky-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          افزودن متن فارسی (T)
        </span>
      </button>

      {/* 3. Zhaket Official Badges Tool (B) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setActiveFlyout(activeFlyout === 'badge' ? null : 'badge')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative group ${
            activeFlyout === 'badge' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="بج‌های رسمی ژاکت (Zhaket Badges - B)"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            بج‌های رسمی ژاکت (B)
          </span>
        </button>

        {/* Flyout Menu for Zhaket Badges */}
        {activeFlyout === 'badge' && (
          <div className="absolute right-full mr-2 top-0 w-64 bg-slate-950 border border-slate-800 rounded-2xl p-2.5 shadow-2xl space-y-1.5 z-50 text-right backdrop-blur-xl animate-fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px] font-black text-amber-400">
              <span>افزودن مستقیم بج ژاکت به لایه‌ها</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">رسمی</span>
            </div>
            <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
              {ZHAKET_OFFICIAL_BADGES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    onAddZhaketBadge(b.id, b.title, b.tagline, b.icon, b.style);
                    setActiveFlyout(null);
                  }}
                  className="w-full p-2 rounded-xl bg-slate-900/90 hover:bg-amber-500/15 border border-slate-800 hover:border-amber-500/40 text-right flex items-center gap-2 transition-all group"
                >
                  <span className="text-base shrink-0 group-hover:scale-110 transition-transform">{b.icon}</span>
                  <div className="flex-1 overflow-hidden">
                    <span className="text-[11px] font-black text-white group-hover:text-amber-300 block truncate leading-tight">
                      {b.title}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate leading-tight mt-0.5">
                      {b.tagline}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. 213+ Vector Icons Tool (I) */}
      <button
        type="button"
        onClick={onOpenIconLibrary}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="کتابخانه ۲۱۳ آیکون وکتور (Icon Tool - I)"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          کتابخانه ۲۱۳ آیکون وکتور (I)
        </span>
      </button>

      {/* 5. Shapes & Badges Tool (U) */}
      <button
        type="button"
        onClick={onOpenShapesLibrary}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="اشکال هندسی و مدیا (Shape Tool - U)"
      >
        <Shapes className="w-4 h-4 text-purple-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          اشکال وکتور، تخفیف و ۳D (U)
        </span>
      </button>

      {/* 6. Mockup Tool (M) */}
      <button
        type="button"
        onClick={onOpenMockupStudio}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="موکاپ‌های موبایل و لپ‌تاپ (Mockup Tool - M)"
      >
        <Smartphone className="w-4 h-4 text-blue-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          موکاپ موبایل، لپ‌تاپ و جعبه ۳D
        </span>
      </button>

      {/* 7. Price Tag Tool */}
      <button
        type="button"
        onClick={onAddPriceTag}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="برچسب قیمت ووکامرس (Price Tag)"
      >
        <Tag className="w-4 h-4 text-rose-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          برچسب قیمت و تخفیف ووکامرس
        </span>
      </button>

      {/* 8. Rating Badge Tool */}
      <button
        type="button"
        onClick={onAddRatingBadge}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="امتیاز ۵ ستاره خریداران (Rating Badge)"
      >
        <Star className="w-4 h-4 text-amber-300" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          امتیاز ۵ ستاره خریداران
        </span>
      </button>

      <div className="w-6 h-px bg-slate-800 my-0.5" />

      {/* 9. Custom Gradient Studio */}
      <button
        type="button"
        onClick={onOpenGradientStudio}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="طراحی گرادیانت بوم"
      >
        <Palette className="w-4 h-4 text-amber-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          استودیوی گرادیانت سفارشی
        </span>
      </button>

      {/* 10. Image Upload */}
      <button
        type="button"
        onClick={onOpenImageUpload}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative group"
        title="ورود عکس و اسکرین‌شات به بوم"
      >
        <ImageIcon className="w-4 h-4 text-emerald-400" />
        <span className="absolute right-full mr-2 px-2 py-1 bg-slate-950 text-white text-[10px] font-bold rounded-lg border border-slate-800 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          ورود تصویر یا اسکرین‌شات
        </span>
      </button>

    </div>
  );
};

export default PhotoshopToolsBar;
