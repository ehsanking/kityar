import React, { useState } from 'react';
import { 
  Sparkles, Layers, ArrowRight, ShieldCheck, Download, CheckCircle2, 
  Smartphone, Grid, Wand2, RefreshCw, Palette, Eye, Play, Star, ChevronLeft
} from 'lucide-react';
import ZhaketLogo from './ZhaketLogo';

interface LandingHeroProps {
  onStartWizard: () => void;
  onOpenStudio: () => void;
  onOpenInspector: () => void;
  productName: string;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartWizard,
  onOpenStudio,
  onOpenInspector,
  productName,
}) => {
  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/10 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span>سامانه هوشمند «کیت یار» ویژه طراحان و توسعه‌دهندگان وب و اپلیکیشن</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-snug">
            اتوماسیون طراحی هوشمند <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
              کیت یار (Kit Yar)
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            طراحی گام‌به‌گام ویزاردی، رندوم‌ساز حرفه‌ای گرادیان‌ها، موکاپ‌های سه‌بعدی موبایل، تبلت و لپتاپ، کتابخانه غنی آیکون‌های وکتور و ویرایشگر زنده متن و تصاویر داخل باکس.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartWizard}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95 group"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>شروع طراحی ویزاردی کاورها</span>
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onOpenStudio}
              className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-slate-700 shadow-lg backdrop-blur-md transition-all hover:border-amber-500/50"
            >
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>ورود مستقیم به استودیو ۵ گانه</span>
            </button>
          </div>

          {/* Hero Feature Pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>پشتیبانی از آپلود مستقیم لوگو</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>خروجی استاندارد مارکت ژاکت</span>
            </span>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            icon: Wand2,
            color: 'amber',
            title: 'ساخت ویزاردی مراحل',
            desc: '۵ گام منظم برای خلق لوگو ۸۰، کاور ۴۰۰، کاورهای ۷۰۰ و اینفوگرافی بدون سردرگمی',
          },
          {
            icon: Palette,
            color: 'purple',
            title: 'رندوم‌ساز گرادیانت',
            desc: 'تغییر آنی پالت و زوایای گرادیانت با یک کلیک بر اساس هارمونی رنگ‌های ژاکت',
          },
          {
            icon: Smartphone,
            color: 'indigo',
            title: 'موکاپ‌های واقعی سیستم',
            desc: 'درج فریم گوشی، تبلت و دسکتاپ و آپلود مستقیم عکس یا اسکرین‌شات از سیستم',
          },
          {
            icon: Grid,
            color: 'emerald',
            title: 'کتابخانه آیکون و درگ زنده',
            desc: 'مجموعه غنی آیکون‌های وکتور رایگان و امکان جابجایی و ویرایش متن‌ها روی پرویو',
          },
        ].map((f, idx) => {
          const Icon = f.icon;
          return (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/40 hover:bg-slate-900 transition-all space-y-2.5 shadow-lg group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {f.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LandingHero;
