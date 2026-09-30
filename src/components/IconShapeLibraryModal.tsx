import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Search, Sparkles, Tag, ShieldCheck, ShoppingBag, Zap, 
  Flame, Percent, Star, Award, CheckCircle2, Lock, Gift, 
  CreditCard, Smartphone, Download, Globe, Rocket, 
  Crown, Heart, Cpu, Layers, Terminal, Database, Server, Box, 
  DollarSign, TrendingUp, PhoneCall, Send, QrCode, Plus,
  ThumbsUp, MousePointer, Code, ShoppingCart, Briefcase, 
  Stethoscope, Palette, Wallet, Cloud, Truck, CheckCircle,
  ExternalLink, Sparkle, CircleDot, Grid, Filter, RotateCcw,
  SearchX, Lightbulb, Apple, Play, Bell, Touchpad, BatteryCharging, Wifi
} from 'lucide-react';
import { CanvasLayerItem, LayerType } from '../types/canvasLayers';
import { VECTOR_ICONS_CATALOG, VECTOR_ICON_CATEGORIES, VectorIconItem } from '../data/vectorIcons';

interface IconShapeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLayer: (layer: Partial<CanvasLayerItem>) => void;
}

// 1. Icon Definitions Catalog (213+ Icons from vectorIcons catalog)
const ICONS_CATALOG = VECTOR_ICONS_CATALOG;

// 2. Comprehensive 3D Models & Renders Catalog
// Integrated free 3D assets from:
// - Shapefest.com (Clay, Frosted Glass, Geometry)
// - Figma 3D Community (SaaS Badges, UI 3D, Dev Gear)
// - DrawKit.com (E-commerce 3D, Business & Creative Characters)
// - Iconscout.com (Fintech Wallet, Glossy Emojis, Cloud & Express Box)
const MODELS_3D_CATALOG = [
  // --- SHAPEFEST.COM ---
  {
    id: 'shapefest-clay-hand',
    name: 'دست Clay خمیری ۳D لایک (Shapefest)',
    source: 'shapefest',
    sourceLabel: 'Shapefest.com',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'shapefest-clay-hand',
      model3dTitle: 'تضمین کیفیت',
      model3dColor: '#38bdf8',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-400 to-indigo-300 p-2 border-2 border-sky-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(56,189,248,0.4)] transform -rotate-6">
        <ThumbsUp className="w-8 h-8 text-slate-950 drop-shadow" />
        <span className="text-[7px] font-black tracking-tighter">SHAPEFEST</span>
      </div>
    )
  },
  {
    id: 'shapefest-frosted-glass',
    name: 'مکعب شیشه‌ای مات Glass Cube (Shapefest)',
    source: 'shapefest',
    sourceLabel: 'Shapefest.com',
    category: 'abstract',
    categoryLabel: 'انتزاعی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'shapefest-frosted-glass',
      model3dTitle: 'شیشه مات ۳D',
      model3dColor: '#a855f7',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/80 via-fuchsia-600 to-indigo-900 p-2 border-2 border-purple-300 flex flex-col items-center justify-center text-white font-black shadow-[0_10px_20px_rgba(168,85,247,0.4)] backdrop-blur-md transform rotate-3">
        <Box className="w-8 h-8 text-purple-200 drop-shadow" />
        <span className="text-[7px] font-black">FROSTED 3D</span>
      </div>
    )
  },
  {
    id: 'shapefest-abstract-donut',
    name: 'دونات خمیری Clay Donut (Shapefest)',
    source: 'shapefest',
    sourceLabel: 'Shapefest.com',
    category: 'abstract',
    categoryLabel: 'انتزاعی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'shapefest-abstract-donut',
      model3dTitle: 'المان انتزاعی',
      model3dColor: '#ec4899',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 via-rose-400 to-amber-300 p-2 border-4 border-pink-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(236,72,153,0.4)] transform rotate-12">
        <CircleDot className="w-8 h-8 text-slate-950 drop-shadow" />
        <span className="text-[6px] font-black">CLAY 3D</span>
      </div>
    )
  },
  {
    id: 'shapefest-gradient-spheres-ring',
    name: 'شکل انتزاعی گوی و حلقه ۳D Gradient Shape (Shapefest)',
    source: 'shapefest',
    sourceLabel: 'Shapefest.com',
    category: 'abstract',
    categoryLabel: 'انتزاعی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'shapefest-gradient-spheres-ring',
      model3dTitle: 'گوی انتزاعی',
      model3dColor: '#c084fc',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-400 to-amber-300 p-2 border-2 border-purple-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(192,132,252,0.5)] transform -rotate-3 overflow-hidden relative">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 absolute top-1 right-1 border border-white/80 shadow-sm" />
        <div className="w-10 h-2 bg-white/90 rounded-full transform -rotate-45 absolute border border-purple-300 shadow-sm" />
        <span className="text-[6px] font-black text-slate-950 mt-auto z-10">SPHERES 3D</span>
      </div>
    )
  },

  // --- FIGMA 3D COMMUNITY ---
  {
    id: 'figma3d-saas-badge',
    name: 'نشان ۳D ساس پریمیم (Figma 3D)',
    source: 'figma3d',
    sourceLabel: 'Figma Community',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'figma3d-saas-badge',
      model3dTitle: 'نسخه PRO ساس',
      model3dColor: '#6366f1',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-950 p-2 border-2 border-indigo-300 flex flex-col items-center justify-center text-white font-black shadow-[0_10px_20px_rgba(99,102,241,0.5)] transform -rotate-3">
        <Sparkles className="w-8 h-8 text-indigo-200 drop-shadow" />
        <span className="text-[7px] font-black text-indigo-200">FIGMA 3D</span>
      </div>
    )
  },
  {
    id: 'figma3d-layers-stack',
    name: 'استک لایه‌های ۳D فیگما (Figma 3D)',
    source: 'figma3d',
    sourceLabel: 'Figma Community',
    category: 'illustrations',
    categoryLabel: 'تصویرسازی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'figma3d-layers-stack',
      model3dTitle: 'چند لایه هوشمند',
      model3dColor: '#38bdf8',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-700 via-blue-500 to-teal-300 p-2 border-2 border-sky-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(56,189,248,0.5)] transform rotate-6">
        <Layers className="w-8 h-8 text-slate-950 drop-shadow" />
        <span className="text-[7px] font-black">STACK 3D</span>
      </div>
    )
  },
  {
    id: 'figma3d-cursor-pointer',
    name: 'نشانگر موس ۳D فیگما (Figma 3D)',
    source: 'figma3d',
    sourceLabel: 'Figma Community',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'figma3d-cursor-pointer',
      model3dTitle: 'کلیک فوری',
      model3dColor: '#f59e0b',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-400 via-orange-500 to-slate-950 p-2 border-2 border-amber-200 flex flex-col items-center justify-center text-amber-300 font-black shadow-[0_10px_20px_rgba(245,158,11,0.5)] transform -rotate-12">
        <MousePointer className="w-8 h-8 text-amber-200 drop-shadow" />
        <span className="text-[7px] font-black">POINTER</span>
      </div>
    )
  },

  // --- DRAWKIT.COM ---
  {
    id: 'drawkit-ecommerce-cart',
    name: 'سبد خرید ۳D فروشگاهی (DrawKit)',
    source: 'drawkit',
    sourceLabel: 'DrawKit.com',
    category: 'ecommerce',
    categoryLabel: 'فروشگاهی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'drawkit-ecommerce-cart',
      model3dTitle: 'سبد خرید آنلاین',
      model3dColor: '#10b981',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-300 p-2 border-2 border-emerald-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(16,185,129,0.5)] transform rotate-3">
        <ShoppingCart className="w-8 h-8 text-slate-950 drop-shadow" />
        <span className="text-[7px] font-black">DRAWKIT</span>
      </div>
    )
  },
  {
    id: 'drawkit-business-briefcase',
    name: 'کیف کسب‌وکار ۳D چرمی (DrawKit)',
    source: 'drawkit',
    sourceLabel: 'DrawKit.com',
    category: 'ecommerce',
    categoryLabel: 'فروشگاهی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'drawkit-business-briefcase',
      model3dTitle: 'پکیج تجاری',
      model3dColor: '#f59e0b',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-500 via-amber-700 to-amber-950 p-2 border-2 border-amber-300 flex flex-col items-center justify-center text-amber-200 font-black shadow-[0_10px_20px_rgba(245,158,11,0.5)] transform -rotate-6">
        <Briefcase className="w-8 h-8 text-amber-200 drop-shadow" />
        <span className="text-[7px] font-black">BUSINESS</span>
      </div>
    )
  },
  {
    id: 'drawkit-creative-palette',
    name: 'پالت رنگ و طراحی ۳D (DrawKit)',
    source: 'drawkit',
    sourceLabel: 'DrawKit.com',
    category: 'illustrations',
    categoryLabel: 'تصویرسازی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'drawkit-creative-palette',
      model3dTitle: 'طراحی اختصاصی',
      model3dColor: '#f43f5e',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-pink-500 to-purple-600 p-2 border-2 border-rose-200 flex flex-col items-center justify-center text-white font-black shadow-[0_10px_20px_rgba(244,63,94,0.5)] transform rotate-6">
        <Palette className="w-8 h-8 text-white drop-shadow" />
        <span className="text-[7px] font-black">ART 3D</span>
      </div>
    )
  },

  // --- ICONSCOUNT.COM ---
  {
    id: 'iconscout-fintech-wallet',
    name: 'کیف پول و رمزارز ۳D (IconScout)',
    source: 'iconscout',
    sourceLabel: 'IconScout.com',
    category: 'ecommerce',
    categoryLabel: 'فروشگاهی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'iconscout-fintech-wallet',
      model3dTitle: 'درگاه پرداخت ۳D',
      model3dColor: '#10b981',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-700 via-emerald-500 to-cyan-300 p-2 border-2 border-emerald-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(16,185,129,0.5)] transform -rotate-3">
        <Wallet className="w-8 h-8 text-slate-950 drop-shadow" />
        <span className="text-[7px] font-black">ICONSCOUNT</span>
      </div>
    )
  },
  {
    id: 'iconscout-glossy-fire',
    name: 'اموجی آتش درخشان ۳D (IconScout)',
    source: 'iconscout',
    sourceLabel: 'IconScout.com',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'iconscout-glossy-fire',
      model3dTitle: 'پیشنهاد داغ',
      model3dColor: '#f97316',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-t from-rose-700 via-orange-500 to-amber-300 p-2 border-2 border-amber-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(249,115,22,0.5)] transform rotate-12">
        <Flame className="w-8 h-8 text-slate-950 fill-slate-950 drop-shadow" />
        <span className="text-[7px] font-black">HOT 3D</span>
      </div>
    )
  },
  {
    id: 'iconscout-cloud-server',
    name: 'ابر دیتابیس ۳D (IconScout)',
    source: 'iconscout',
    sourceLabel: 'IconScout.com',
    category: 'illustrations',
    categoryLabel: 'تصویرسازی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'iconscout-cloud-server',
      model3dTitle: 'میزبانی ابری',
      model3dColor: '#38bdf8',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-slate-950 p-2 border-2 border-sky-300 flex flex-col items-center justify-center text-sky-200 font-black shadow-[0_10px_20px_rgba(56,189,248,0.5)] transform -rotate-6">
        <Cloud className="w-8 h-8 text-sky-200 drop-shadow" />
        <span className="text-[7px] font-black">CLOUD 3D</span>
      </div>
    )
  },
  {
    id: 'iconscout-express-box',
    name: 'باکس ارسال سریع ۳D (IconScout)',
    source: 'iconscout',
    sourceLabel: 'IconScout.com',
    category: 'ecommerce',
    categoryLabel: 'فروشگاهی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'iconscout-express-box',
      model3dTitle: 'پست پیشتاز',
      model3dColor: '#f59e0b',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-2 border-2 border-yellow-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(245,158,11,0.5)] transform rotate-6">
        <Truck className="w-8 h-8 text-slate-950 drop-shadow" />
        <span className="text-[7px] font-black">EXPRESS</span>
      </div>
    )
  },

  // --- STANDARD GENERAL 3D MODELS ---
  {
    id: 'box3d-woocommerce',
    name: 'باکس ۳D سه بعدی ووکامرس (3D Box)',
    source: 'general',
    sourceLabel: 'ووکامرس ۳D',
    category: 'ecommerce',
    categoryLabel: 'فروشگاهی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'box3d-woocommerce',
      model3dTitle: 'پکیج ووکامرس',
      model3dColor: '#f59e0b',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-2 border-2 border-amber-200 flex flex-col items-center justify-center text-slate-950 font-black shadow-[0_10px_20px_rgba(245,158,11,0.4)] transform -rotate-6">
        <Box className="w-8 h-8 text-slate-950 drop-shadow" />
        <span className="text-[8px] font-black">WOO 3D</span>
      </div>
    )
  },
  {
    id: 'trophy3d-gold',
    name: 'کاپ قهرمانی ۳D درخشان (3D Trophy)',
    source: 'general',
    sourceLabel: 'ژاکت VIP',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'trophy3d-gold',
      model3dTitle: 'محصول برتر سال',
      model3dColor: '#fbbf24',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 p-2 border-2 border-yellow-100 flex flex-col items-center justify-center text-slate-950 shadow-[0_10px_25px_rgba(251,191,36,0.5)] transform rotate-3">
        <Award className="w-8 h-8 text-slate-950 drop-shadow-md" />
        <span className="text-[8px] font-black">TOP #1</span>
      </div>
    )
  },
  {
    id: 'rocket3d-speed',
    name: 'موشک پرتاب ۳D توربو (3D Rocket)',
    source: 'general',
    sourceLabel: 'سرعت توربو',
    category: 'illustrations',
    categoryLabel: 'تصویرسازی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'rocket3d-speed',
      model3dTitle: 'راه‌اندازی فوری',
      model3dColor: '#c084fc',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-800 via-purple-600 to-indigo-400 p-2 border-2 border-purple-300 flex flex-col items-center justify-center text-white shadow-[0_10px_25px_rgba(192,132,252,0.5)] transform -rotate-12">
        <Rocket className="w-8 h-8 text-amber-300 drop-shadow" />
        <span className="text-[8px] font-black text-amber-300">TURBO</span>
      </div>
    )
  },
  {
    id: 'shield3d-secure',
    name: 'سپر امنیتی ۳D برجسته (3D Shield)',
    source: 'general',
    sourceLabel: 'گارانتی',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'shield3d-secure',
      model3dTitle: 'گارانتی بازگشت وجه',
      model3dColor: '#34d399',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-emerald-400 via-teal-600 to-slate-900 p-2 border-2 border-emerald-300 flex flex-col items-center justify-center text-emerald-300 shadow-[0_10px_20px_rgba(52,211,153,0.4)] transform rotate-6">
        <ShieldCheck className="w-8 h-8 text-emerald-200 drop-shadow" />
        <span className="text-[8px] font-black text-emerald-200">SECURE</span>
      </div>
    )
  },
  {
    id: 'star3d-gold',
    name: 'ستاره طلایی ۳D برجسته (3D Star)',
    source: 'general',
    sourceLabel: 'امتیاز VIP',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'star3d-gold',
      model3dTitle: 'امتیاز ۵ ستاره',
      model3dColor: '#f59e0b',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-2 border-2 border-yellow-200 flex flex-col items-center justify-center text-slate-950 shadow-[0_10px_25px_rgba(245,158,11,0.5)] transform -rotate-6">
        <Star className="w-8 h-8 fill-slate-950 text-slate-950 drop-shadow" />
        <span className="text-[8px] font-black">5.0 VIP</span>
      </div>
    )
  },
  {
    id: 'coin3d-dollar',
    name: 'سکه طلایی ۳D تخفیف (3D Gold Coin)',
    source: 'general',
    sourceLabel: 'وفاداری',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'coin3d-dollar',
      model3dTitle: 'سیستم وفاداری',
      model3dColor: '#fbbf24',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-2 border-4 border-amber-200 flex flex-col items-center justify-center text-slate-950 shadow-[0_10px_20px_rgba(251,191,36,0.5)] transform rotate-12">
        <DollarSign className="w-8 h-8 text-slate-950 font-black stroke-[3]" />
      </div>
    )
  },
  {
    id: 'phone3d-mobile',
    name: 'موبایل اپلیکیشن ۳D (3D Phone)',
    source: 'general',
    sourceLabel: 'اپلیکیشن',
    category: 'illustrations',
    categoryLabel: 'تصویرسازی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'phone3d-mobile',
      model3dTitle: 'ریسپانسیو کامل',
      showText: false,
      hideBackground: false,
      model3dColor: '#3b82f6',
      model3dGlow: true,
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-blue-500 via-indigo-600 to-slate-900 p-2 border-2 border-blue-300 flex flex-col items-center justify-center text-white shadow-[0_10px_25px_rgba(59,130,246,0.5)] transform rotate-6">
        <Smartphone className="w-8 h-8 text-sky-200 drop-shadow" />
        <span className="text-[8px] font-black text-sky-200">APP 3D</span>
      </div>
    )
  },

  // --- MOBILE APP & MOBILE UI 3D MODELS ---
  {
    id: 'mobile-app-store',
    name: 'دانلود از اپ استور ۳D (Apple App Store)',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-app-store',
      model3dTitle: 'دانلود iOS',
      showText: false,
      hideBackground: false,
      model3dColor: '#000000',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-slate-950 p-2 border-2 border-slate-700 flex flex-col items-center justify-center text-white shadow-xl transform hover:scale-105 transition-transform">
        <Apple className="w-8 h-8 text-white drop-shadow" />
        <span className="text-[7px] font-black text-slate-300 mt-1">App Store</span>
      </div>
    )
  },
  {
    id: 'mobile-google-play',
    name: 'دانلود از گوگل پلی ۳D (Google Play)',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-google-play',
      model3dTitle: 'گوگل پلی',
      showText: false,
      hideBackground: false,
      model3dColor: '#059669',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-950 p-2 border-2 border-emerald-500/50 flex flex-col items-center justify-center text-emerald-400 shadow-xl transform hover:scale-105 transition-transform">
        <Play className="w-8 h-8 text-emerald-400 fill-emerald-400 drop-shadow" />
        <span className="text-[7px] font-black text-emerald-300 mt-1">Google Play</span>
      </div>
    )
  },
  {
    id: 'mobile-push-bell',
    name: 'پوش نوتیفیکیشن موبایل ۳D (Push Bell)',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-push-bell',
      model3dTitle: 'پوش نوتیفیکیشن',
      showText: false,
      hideBackground: false,
      model3dColor: '#f59e0b',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-yellow-500 p-2 border-2 border-amber-300 flex flex-col items-center justify-center text-slate-950 shadow-xl transform -rotate-6">
        <Bell className="w-8 h-8 text-slate-950 fill-slate-950 drop-shadow animate-pulse" />
        <span className="text-[7px] font-black text-slate-950 mt-1">PUSH BELL</span>
      </div>
    )
  },
  {
    id: 'mobile-wallet-card',
    name: 'کارت اعتباری و پرداخت موبایلی ۳D',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'ecommerce',
    categoryLabel: 'فروشگاهی',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-wallet-card',
      model3dTitle: 'پرداخت اینترنتی',
      showText: false,
      hideBackground: false,
      model3dColor: '#06b6d4',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-700 to-slate-950 p-2 border-2 border-cyan-300 flex flex-col items-center justify-center text-cyan-200 shadow-xl transform rotate-3">
        <CreditCard className="w-8 h-8 text-cyan-200 drop-shadow" />
        <span className="text-[7px] font-black text-cyan-200 mt-1">PAYMENT 3D</span>
      </div>
    )
  },
  {
    id: 'mobile-5g-speed',
    name: 'اینترنت ۵G و سرعت فوق‌العاده موبایل ۳D',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-5g-speed',
      model3dTitle: 'سرعت ۵G',
      showText: false,
      hideBackground: false,
      model3dColor: '#fbbf24',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-slate-950 p-2 border-2 border-amber-300 flex flex-col items-center justify-center text-amber-200 shadow-xl transform -rotate-12">
        <Zap className="w-8 h-8 text-amber-300 fill-amber-300 drop-shadow" />
        <span className="text-[7px] font-black text-amber-300 mt-1">5G SPEED</span>
      </div>
    )
  },
  {
    id: 'mobile-sms-lock',
    name: 'رمز یکبار مصرف OTP و قفل موبایل ۳D',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-sms-lock',
      model3dTitle: 'رمز OTP',
      showText: false,
      hideBackground: false,
      model3dColor: '#10b981',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-950 p-2 border-2 border-emerald-300 flex flex-col items-center justify-center text-emerald-200 shadow-xl transform rotate-6">
        <Lock className="w-8 h-8 text-emerald-300 drop-shadow" />
        <span className="text-[7px] font-black text-emerald-200 mt-1">OTP LOCK</span>
      </div>
    )
  },
  {
    id: 'mobile-qr-scan',
    name: 'اسکن مستقیم کد QR موبایلی ۳D',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-qr-scan',
      model3dTitle: 'اسکن QR',
      showText: false,
      hideBackground: false,
      model3dColor: '#38bdf8',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-slate-950 p-2 border-2 border-sky-300 flex flex-col items-center justify-center text-sky-200 shadow-xl transform -rotate-3">
        <QrCode className="w-8 h-8 text-sky-200 drop-shadow" />
        <span className="text-[7px] font-black text-sky-200 mt-1">QR SCAN</span>
      </div>
    )
  },
  {
    id: 'mobile-touch-gesture',
    name: 'جسچر لمسی و لمس صفحه ۳D',
    source: 'mobile',
    sourceLabel: 'موبایل و اپ',
    category: 'icons',
    categoryLabel: 'آیکون‌ها',
    type: '3d-model' as LayerType,
    data: {
      model3dId: 'mobile-touch-gesture',
      model3dTitle: 'لمس هوشمند',
      showText: false,
      hideBackground: false,
      model3dColor: '#a855f7',
    },
    preview: (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-700 to-slate-950 p-2 border-2 border-purple-300 flex flex-col items-center justify-center text-purple-200 shadow-xl transform rotate-12">
        <Touchpad className="w-8 h-8 text-purple-200 drop-shadow" />
        <span className="text-[7px] font-black text-purple-200 mt-1">TOUCH 3D</span>
      </div>
    )
  }
];

// 3. Vector Shapes & Badges Catalog
const SHAPES_CATALOG = [
  {
    id: 'shape-starburst',
    name: 'ستاره نشان تخفیف ویژه (Starburst)',
    type: 'shape' as LayerType,
    data: {
      shapeType: 'starburst',
      shapeText: 'OFF 50%',
      shapeColor: '#f59e0b',
    },
    preview: (
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 border-2 border-amber-300 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-lg shadow-amber-500/30">
        OFF 50%
      </div>
    )
  },
  {
    id: 'shape-circle-neon',
    name: 'حلقه نئونی درخشان (Neon Glow Circle)',
    type: 'shape' as LayerType,
    data: {
      shapeType: 'circle-glow',
      shapeText: 'PRO',
      shapeColor: '#6366f1',
    },
    preview: (
      <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 font-black text-xs shadow-[0_0_20px_rgba(99,102,241,0.6)]">
        PRO
      </div>
    )
  },
  {
    id: 'shape-hexagon-gold',
    name: 'شش ضلعی طلایی ژاکت (Golden Hexagon)',
    type: 'shape' as LayerType,
    data: {
      shapeType: 'hexagon-gold',
      shapeText: 'VIP',
      shapeColor: '#fbbf24',
    },
    preview: (
      <div className="w-16 h-16 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 rounded-2xl flex items-center justify-center text-slate-950 font-black text-sm shadow-xl rotate-45 border-2 border-amber-200">
        <span className="-rotate-45 font-black">VIP</span>
      </div>
    )
  },
  {
    id: 'discount-corner-ribbon',
    name: 'ربان تخفیف گوشه طرح (Corner Ribbon)',
    type: 'discount-ribbon' as LayerType,
    data: {
      discountPercent: '۵۰٪ تخفیف',
      discountText: 'فروش ویژه',
      ribbonStyle: 'corner',
    },
    preview: (
      <div className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-[10px] rounded-lg shadow-lg border border-amber-300 flex items-center gap-1">
        <Flame className="w-3 h-3 text-amber-200" />
        <span>۵۰٪ تخفیف ویژه</span>
      </div>
    )
  },
  {
    id: 'rating-stars-badge',
    name: 'امتیاز ۵ ستاره خریداران (5.0 Stars Rating)',
    type: 'rating-badge' as LayerType,
    data: {
      ratingValue: '۵.۰',
      ratingCount: '(۱۲۸ نظر)',
    },
    preview: (
      <div className="px-3 py-1.5 bg-slate-900/90 border border-amber-500/40 rounded-xl flex items-center gap-1.5 shadow-md">
        <div className="flex text-amber-400">
          {'★★★★★'.split('').map((s, i) => <span key={i} className="text-xs">{s}</span>)}
        </div>
        <span className="text-[10px] font-bold text-white font-mono">5.0</span>
      </div>
    )
  },
  {
    id: 'price-tag-card',
    name: 'برچسب قیمت و تخفیف ووکامرس (Price Tag)',
    type: 'price-tag' as LayerType,
    data: {
      originalPrice: '۴۹۰,۰۰۰',
      salePrice: '۲۹۰,۰۰۰',
      currency: 'تومان',
    },
    preview: (
      <div className="px-3 py-1.5 bg-slate-950 border border-emerald-500/40 rounded-xl flex items-center gap-2 shadow-lg">
        <span className="line-through text-slate-500 text-[9px]">۴۹۰,۰۰۰</span>
        <span className="text-emerald-400 font-bold text-xs">۲۹۰,۰۰۰ ت</span>
      </div>
    )
  },
  {
    id: 'qr-code-badge',
    name: 'کیو‌آرکد پیش‌نمایش زنده (Live Demo QR)',
    type: 'qr-code' as LayerType,
    data: {
      qrTitle: 'مشاهده دمو آنلاین',
      qrSubtitle: 'با دوربین اسکن کنید',
    },
    preview: (
      <div className="p-2 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-2">
        <div className="w-8 h-8 bg-white p-1 rounded flex items-center justify-center">
          <QrCode className="w-6 h-6 text-slate-950" />
        </div>
        <div className="text-[9px] text-right">
          <span className="text-amber-300 font-bold block">اسکن دمو</span>
          <span className="text-slate-400">پیش‌نمایش</span>
        </div>
      </div>
    )
  },
];

// 4. Empty State Visual Component for 3D Model Library
interface Empty3DLibraryStateProps {
  searchQuery: string;
  selected3dCategory: string;
  selected3dSource: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

const SUGGESTED_SEARCH_TERMS = [
  { label: 'دست خمیری (Clay)', term: 'خمیری' },
  { label: 'شیشه مات (Glass)', term: 'شیشه' },
  { label: 'سبد خرید (Cart)', term: 'سبد' },
  { label: 'کیف پول (Wallet)', term: 'کیف' },
  { label: 'موشک (Rocket)', term: 'موشک' },
  { label: 'کاپ (Trophy)', term: 'کاپ' },
  { label: 'سپر امنیتی (Shield)', term: 'سپر' },
  { label: 'اموجی آتش (Fire)', term: 'آتش' },
];

export const Empty3DLibraryState: React.FC<Empty3DLibraryStateProps> = ({
  searchQuery,
  selected3dCategory,
  selected3dSource,
  onSearchChange,
  onResetFilters,
}) => {
  return (
    <div className="py-8 px-5 text-center bg-slate-900/70 rounded-3xl border border-slate-800/90 shadow-2xl space-y-5 my-2 backdrop-blur-sm relative overflow-hidden">
      {/* Background ambient glow effect */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main 3D graphic badge */}
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.2)] transform hover:scale-105 transition-transform duration-300">
          <SearchX className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Message and Context */}
      <div className="space-y-1.5 max-w-md mx-auto relative z-10">
        <h4 className="text-base font-black text-white flex items-center justify-center gap-2">
          <span>مدل سه‌بعدی یافت نشد!</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          {searchQuery ? (
            <span>
              عبارت «<span className="text-amber-300 font-bold underline decoration-amber-500/50">{searchQuery}</span>» با مدلی در دسته‌بندی و منبع انتخابی تطابق نداشت.
            </span>
          ) : (
            <span>هیچ مدلی متناسب با فیلترهای فعال انتخابی یافت نشد.</span>
          )}
        </p>
      </div>

      {/* Friendly Suggestions */}
      <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5 max-w-lg mx-auto relative z-10 text-right">
        <div className="flex items-center gap-2 text-[11px] font-bold text-amber-300">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>پیشنهاد: عبارات یا برچسب‌های پرکاربرد زیر را جهت جستجو امتحان کنید:</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {SUGGESTED_SEARCH_TERMS.map((item) => (
            <button
              key={item.term}
              onClick={() => onSearchChange(item.term)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700/80 transition-all flex items-center gap-1 group shadow-sm active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-amber-400 group-hover:text-slate-950 transition-colors" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="flex items-center justify-center gap-3 pt-1 relative z-10">
        <button
          onClick={onResetFilters}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>پاکسازی همه فیلترها و عبارت جستجو</span>
        </button>
      </div>
    </div>
  );
};

export const IconShapeLibraryModal: React.FC<IconShapeLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddLayer,
}) => {
  const [activeTab, setActiveTab] = useState<'models3d' | 'icons' | 'shapes'>('models3d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected3dSource, setSelected3dSource] = useState<string>('all');
  const [selected3dCategory, setSelected3dCategory] = useState<string>('all');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [iconBgShape, setIconBgShape] = useState<'none' | 'circle' | 'square' | 'rounded'>('circle');
  const [iconColor, setIconColor] = useState('#f59e0b');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [focused3dIndex, setFocused3dIndex] = useState<number>(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset focused item index when filters or search query change
  useEffect(() => {
    setFocused3dIndex(0);
  }, [searchQuery, selected3dSource, selected3dCategory, activeTab]);

  // Scroll focused card into view smoothly when focused index changes
  useEffect(() => {
    if (activeTab === 'models3d' && cardRefs.current[focused3dIndex]) {
      cardRefs.current[focused3dIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [focused3dIndex, activeTab]);

  // Real-time search-as-you-type + provider source filter + category tab filter for 3D Assets
  const filtered3dModels = MODELS_3D_CATALOG.filter((item) => {
    const matchSource = selected3dSource === 'all' || item.source === selected3dSource;
    const matchCategory = selected3dCategory === 'all' || item.category === selected3dCategory;
    
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || 
      item.name.toLowerCase().includes(query) || 
      item.sourceLabel.toLowerCase().includes(query) ||
      (item.categoryLabel && item.categoryLabel.toLowerCase().includes(query)) ||
      (item.data && item.data.model3dTitle && item.data.model3dTitle.toLowerCase().includes(query));

    return matchSource && matchCategory && matchSearch;
  });

  // Global Keyboard Listener for Ctrl+K, '/', Arrow Keys, and Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Shortcut: Ctrl+K, Cmd+K, or '/' to focus search input
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && document.activeElement !== searchInputRef.current)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      // 2. Escape to close modal or clear search
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current && searchQuery) {
          setSearchQuery('');
        } else {
          onClose();
        }
        return;
      }

      // 3. Arrow Keys Navigation for 3D Models Tab
      if (activeTab === 'models3d' && filtered3dModels.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setFocused3dIndex((prev) => Math.min(filtered3dModels.length - 1, prev + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setFocused3dIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'ArrowLeft') {
          // ArrowLeft moves to next item
          e.preventDefault();
          setFocused3dIndex((prev) => Math.min(filtered3dModels.length - 1, prev + 1));
        } else if (e.key === 'ArrowRight') {
          // ArrowRight moves to previous item
          e.preventDefault();
          setFocused3dIndex((prev) => Math.max(0, prev - 1));
        } else if (e.key === 'Enter') {
          // If input is not currently focused or if navigating, enter selects the focused 3D model
          if (focused3dIndex >= 0 && focused3dIndex < filtered3dModels.length) {
            e.preventDefault();
            handleSelectModel3D(filtered3dModels[focused3dIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, filtered3dModels, focused3dIndex, searchQuery, onClose]);

  const filteredIcons = ICONS_CATALOG.filter((item) => {
    const matchCat = selectedCat === 'all' || item.category === selectedCat;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || 
      item.name.toLowerCase().includes(query) || 
      item.id.toLowerCase().includes(query) ||
      (item.tags && item.tags.some((t: string) => t.toLowerCase().includes(query)));
    return matchCat && matchSearch;
  });

  const handleSelectIcon = (iconItem: typeof ICONS_CATALOG[0]) => {
    onAddLayer({
      name: `آیکون ${iconItem.name}`,
      type: 'icon-library',
      visible: true,
      locked: false,
      zIndex: 25,
      scale: 1,
      rotation: 0,
      opacity: 100,
      x: 140,
      y: 120,
      data: {
        iconName: iconItem.id,
        iconColor: iconColor,
        iconBgShape: iconBgShape,
        iconSize: 32,
      },
    });
    onClose();
  };

  const handleSelectModel3D = (modelItem: typeof MODELS_3D_CATALOG[0]) => {
    onAddLayer({
      name: modelItem.name,
      type: '3d-model',
      visible: true,
      locked: false,
      zIndex: 30,
      scale: 1,
      rotation: 0,
      opacity: 100,
      x: 120,
      y: 110,
      data: modelItem.data as any,
    });
    onClose();
  };

  const handleSelectShape = (shapeItem: typeof SHAPES_CATALOG[0]) => {
    onAddLayer({
      name: shapeItem.name,
      type: shapeItem.type,
      visible: true,
      locked: false,
      zIndex: 25,
      scale: 1,
      rotation: 0,
      opacity: 100,
      x: 100,
      y: 100,
      data: shapeItem.data as any,
    });
    onClose();
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelected3dSource('all');
    setSelected3dCategory('all');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[88vh] flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 shrink-0 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Box className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm text-white flex flex-wrap items-center gap-2">
                <span>کتابخانهٔ مدل‌های سه‌بعدی و آیکون‌ها</span>
                <span className="shrink-0 whitespace-nowrap text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  ۱۰۰٪ رایگان
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-5">
                منابع رایگان از <bdi>Shapefest</bdi>، <bdi>Figma Community</bdi>، <bdi>DrawKit</bdi> و <bdi>IconScout</bdi>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-colors"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Modal Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('models3d')}
            className={`min-w-0 px-2 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'models3d'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>مدل‌های سه‌بعدی</span>
          </button>
          <button
            onClick={() => setActiveTab('icons')}
            className={`min-w-0 px-2 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'icons'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>آیکون‌های وکتور <span className="opacity-70">(۲۱۳)</span></span>
          </button>
          <button
            onClick={() => setActiveTab('shapes')}
            className={`min-w-0 px-2 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              activeTab === 'shapes'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>اشکال، قیمت و تخفیف</span>
          </button>
        </div>

        {/* TAB 1: 3D MODELS CATALOG */}
        {activeTab === 'models3d' && (
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            
            {/* Search-As-You-Type Input & Live Status Counter */}
            <div className="space-y-2.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 absolute right-3.5 top-3 text-amber-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="جستجوی همزمان در Shapefest, Figma, DrawKit, IconScout..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-20 py-2.5 text-xs text-white placeholder-slate-400 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner"
                />
                <div className="absolute left-3 top-2.5 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white bg-slate-800 p-0.5 rounded-md"
                      title="پاک کردن جستجو"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-md">
                    Ctrl+K
                  </kbd>
                </div>
              </div>

              {/* Category Filter Tabs (e.g., 'Icons', 'Illustrations', 'Abstract', 'E-commerce') */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <Filter className="w-3 h-3 text-amber-400" />
                    <span>فیلتر دسته‌بندی موضوعی (Categories):</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {filtered3dModels.length} مدل از {MODELS_3D_CATALOG.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pb-1 text-[11px]">
                  {[
                    { id: 'all', label: 'همه دسته‌ها', icon: Grid },
                    { id: 'icons', label: 'آیکون‌ها (Icons)', icon: Sparkles },
                    { id: 'illustrations', label: 'تصویرسازی (Illustrations)', icon: Palette },
                    { id: 'abstract', label: 'انتزاعی (Abstract)', icon: CircleDot },
                    { id: 'ecommerce', label: 'فروشگاهی (E-commerce)', icon: ShoppingBag },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isActive = selected3dCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelected3dCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <CatIcon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Provider / Source Filter Tabs (Shapefest, Figma, DrawKit, IconScout) */}
              <div className="space-y-1 pt-1 border-t border-slate-800/60">
                <div className="text-[10px] font-bold text-slate-400 px-1">
                  <span>منبع و کتابخانه (3D Source):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pb-0.5 text-[10px]">
                  {[
                    { id: 'all', label: 'همه منابع (All Sources)' },
                    { id: 'shapefest', label: 'Shapefest.com' },
                    { id: 'figma3d', label: 'Figma Community' },
                    { id: 'drawkit', label: 'DrawKit.com' },
                    { id: 'iconscout', label: 'IconScout.com' },
                    { id: 'general', label: 'ژاکت ۳D' },
                  ].map((src) => {
                    const isActive = selected3dSource === src.id;
                    return (
                      <button
                        key={src.id}
                        onClick={() => setSelected3dSource(src.id)}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-colors whitespace-nowrap ${
                          isActive
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/60 font-black'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {src.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Keyboard Navigation Instructions Banner */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 pt-1.5 border-t border-slate-800/40">
                <span className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-amber-400 font-bold">
                    Ctrl+K / /
                  </span>
                  <span>فوکوس جستجو</span>
                  <span>·</span>
                  <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-indigo-300 font-bold">
                    ↑ ↓ ← →
                  </span>
                  <span>جابجایی کارت‌ها</span>
                </span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-emerald-300">
                    Enter ↵
                  </span>
                  <span>افزودن مدل</span>
                </span>
              </div>

            </div>

            {/* 3D Models Grid */}
            {filtered3dModels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {filtered3dModels.map((model, idx) => {
                  const isFocused = idx === focused3dIndex;
                  return (
                    <div
                      key={model.id}
                      ref={(el) => { cardRefs.current[idx] = el; }}
                      onClick={() => handleSelectModel3D(model)}
                      onMouseEnter={() => setFocused3dIndex(idx)}
                      className={`p-3 rounded-2xl bg-slate-900/90 border transition-all flex flex-col justify-between gap-3 cursor-pointer group shadow-lg ${
                        isFocused
                          ? 'border-amber-400 ring-2 ring-amber-400/80 scale-[1.02] bg-slate-900 shadow-amber-500/10'
                          : 'border-slate-800 hover:border-amber-500/60 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {model.sourceLabel}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 rounded font-medium">
                            {model.categoryLabel}
                          </span>
                          <span className="text-[8px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            رایگان
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {model.preview}
                        </div>
                        <div className="space-y-1 overflow-hidden">
                          <h5 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors leading-snug truncate">
                            {model.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 block font-medium">
                            {isFocused ? 'فشار دکمه Enter برای افزودن' : 'افزودن مستقیم به بوم'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty3DLibraryState
                searchQuery={searchQuery}
                selected3dCategory={selected3dCategory}
                selected3dSource={selected3dSource}
                onSearchChange={(term) => {
                  setSearchQuery(term);
                  setSelected3dCategory('all');
                  setSelected3dSource('all');
                }}
                onResetFilters={resetFilters}
              />
            )}
          </div>
        )}

        {/* TAB 2: ICONS CATALOG */}
        {activeTab === 'icons' && (
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {/* Search and category filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="جستجوی آیکون (خرید، سرعت، لایسنس، سرور...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
              </div>

              {/* Icon Frame Shape */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-[10px]">
                <span className="text-slate-400 px-1">کادر:</span>
                {[
                  { id: 'circle', label: 'دایره' },
                  { id: 'rounded', label: 'مربع گرد' },
                  { id: 'none', label: 'بدون کادر' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setIconBgShape(s.id as any)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-colors ${
                      iconBgShape === s.id ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Icon Color Picker */}
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
                <span className="text-[10px] text-slate-400">رنگ:</span>
                {['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#38bdf8', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setIconColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-4 h-4 rounded-full border transition-transform ${
                      iconColor === c ? 'scale-125 border-white shadow' : 'border-transparent opacity-70'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-1.5 pb-1 text-[11px]">
              {VECTOR_ICON_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-colors whitespace-nowrap ${
                    selectedCat === cat.id
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Icons Grid */}
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                {filteredIcons.map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectIcon(item)}
                      className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800/90 hover:border-amber-500/60 flex flex-col items-center justify-center text-center gap-1.5 transition-all group shadow-md"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComp className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-300 truncate max-w-full">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 px-5 text-center bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4 my-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <SearchX className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">هیچ آیکونی یافت نشد!</h4>
                  <p className="text-xs text-slate-400">
                    عبارت «{searchQuery}» با هیچ‌یک از آیکون‌های وکتور تطابق ندارد.
                  </p>
                </div>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCat('all'); }}
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>پاکسازی فیلتر آیکون‌ها</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHAPES & BADGES CATALOG */}
        {activeTab === 'shapes' && (
          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHAPES_CATALOG.map((shape) => (
                <div
                  key={shape.id}
                  onClick={() => handleSelectShape(shape)}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-lg"
                >
                  <div className="space-y-1">
                    <h5 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                      {shape.name}
                    </h5>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold inline-block border border-emerald-500/20">
                      کلیک برای افزودن به بوم
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {shape.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IconShapeLibraryModal;
