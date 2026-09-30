import React, { useState } from 'react';
import { 
  Sparkles, ShieldCheck, Zap, Award, Star, Gift, Flame, 
  Crown, Smartphone, ShoppingCart, Check, Heart, Bell, 
  Tag, Search, Layers, X, Plus, CheckCircle, Info
} from 'lucide-react';

export interface SemanticSticker {
  id: string;
  title: string;
  category: 'guarantee' | '3d-shapes' | 'features' | 'offers';
  categoryLabel: string;
  tagline?: string;
  iconType: 'lucide' | 'emoji' | 'svg';
  iconValue: string;
  badgeStyle: 'white-glow' | 'gold-gradient' | 'emerald-gradient' | 'cyan-gradient' | 'orange-zhaket' | 'purple-gradient' | 'dark-glass';
  textColor: string;
  borderColor: string;
  defaultPosition?: { x: number; y: number };
}

export interface CanvasStickerInstance {
  instanceId: string;
  stickerId: string;
  title: string;
  tagline?: string;
  iconValue: string;
  badgeStyle: SemanticSticker['badgeStyle'];
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const SEMANTIC_STICKERS_DATA: SemanticSticker[] = [
  // 1. بج‌های قانونی و تضمین ژاکت (Zhaket Official Trust Badges)
  {
    id: 'zhaket-money-back',
    title: 'گارانتی بازگشت وجه',
    tagline: '۱۰۰٪ تضمین رضایت ژاکت',
    category: 'guarantee',
    categoryLabel: 'بج‌های تضمین ژاکت',
    iconType: 'emoji',
    iconValue: '🛡️',
    badgeStyle: 'emerald-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  {
    id: 'zhaket-6m-support',
    title: '۶ ماه پشتیبانی رایگان',
    tagline: 'پاسخگویی سریع کمتر از ۲ ساعت',
    category: 'guarantee',
    categoryLabel: 'بج‌های تضمین ژاکت',
    iconType: 'emoji',
    iconValue: '🎧',
    badgeStyle: 'orange-zhaket',
    textColor: '#ffffff',
    borderColor: 'rgba(255, 122, 0, 0.6)',
  },
  {
    id: 'zhaket-lifetime-update',
    title: 'آپدیت مادام‌العمر رایگان',
    tagline: 'دریافت خودکار از پیشخوان وردپرس',
    category: 'guarantee',
    categoryLabel: 'بج‌های تضمین ژاکت',
    iconType: 'emoji',
    iconValue: '🔄',
    badgeStyle: 'cyan-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(6, 182, 212, 0.6)',
  },
  {
    id: 'zhaket-original-code',
    title: 'ضمانت اصالت و لایسنس',
    tagline: 'تاییدیه رسمی و کد اورجینال ژاکت',
    category: 'guarantee',
    categoryLabel: 'بج‌های تضمین ژاکت',
    iconType: 'emoji',
    iconValue: '💎',
    badgeStyle: 'gold-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(245, 158, 11, 0.6)',
  },
  {
    id: 'zhaket-technical-certified',
    title: 'تاییدیه فنی ژاکت',
    tagline: 'تست شده با استانداردهای امنیتی',
    category: 'guarantee',
    categoryLabel: 'بج‌های تضمین ژاکت',
    iconType: 'emoji',
    iconValue: '⭐',
    badgeStyle: 'purple-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(147, 51, 234, 0.6)',
  },
  {
    id: 'zhaket-free-install',
    title: 'نصب و راه‌اندازی رایگان',
    tagline: 'توسط تیم فنی اختصاصی',
    category: 'guarantee',
    categoryLabel: 'بج‌های تضمین ژاکت',
    iconType: 'emoji',
    iconValue: '🚀',
    badgeStyle: 'white-glow',
    textColor: '#0f172a',
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },

  // 2. استیکرهای معنایی ۳D و هایپر رئال (3D Shapes & Semantic Stickers)
  {
    id: '3d-rocket-speed',
    title: 'سرعت لود موشکی',
    tagline: 'افزایش رتبه گوگل و لایت‌هاوس ۹۹+',
    category: '3d-shapes',
    categoryLabel: 'استیکرهای معنایی ۳D',
    iconType: 'emoji',
    iconValue: '🚀',
    badgeStyle: 'cyan-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(56, 189, 248, 0.6)',
  },
  {
    id: '3d-lightning-instant',
    title: 'عملکرد آنی و بی‌درنگ',
    tagline: 'بدون حتی ۱ ثانیه تاخیر',
    category: '3d-shapes',
    categoryLabel: 'استیکرهای معنایی ۳D',
    iconType: 'emoji',
    iconValue: '⚡',
    badgeStyle: 'gold-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(234, 179, 8, 0.6)',
  },
  {
    id: '3d-vip-diamond',
    title: 'نسخه اختصاصی VIP',
    tagline: 'امکانات نامحدود پریمیوم',
    category: '3d-shapes',
    categoryLabel: 'استیکرهای معنایی ۳D',
    iconType: 'emoji',
    iconValue: '💎',
    badgeStyle: 'purple-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },
  {
    id: '3d-golden-crown',
    title: 'محصول برتر و برگزیده',
    tagline: 'رتبه ۱ رضایت خریداران',
    category: '3d-shapes',
    categoryLabel: 'استیکرهای معنایی ۳D',
    iconType: 'emoji',
    iconValue: '👑',
    badgeStyle: 'gold-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(245, 158, 11, 0.6)',
  },
  {
    id: '3d-hot-trend',
    title: 'پرفروش‌ترین و داغ',
    tagline: 'بیش از ۱۰۰۰ نصب موفق',
    category: '3d-shapes',
    categoryLabel: 'استیکرهای معنایی ۳D',
    iconType: 'emoji',
    iconValue: '🔥',
    badgeStyle: 'orange-zhaket',
    textColor: '#ffffff',
    borderColor: 'rgba(249, 115, 22, 0.6)',
  },
  {
    id: '3d-gift-box',
    title: 'همراه با پکیج هدیه',
    tagline: 'قالب و افزونه‌های مکمل رایگان',
    category: '3d-shapes',
    categoryLabel: 'استیکرهای معنایی ۳D',
    iconType: 'emoji',
    iconValue: '🎁',
    badgeStyle: 'emerald-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },

  // 3. استیکرهای فنی و مزیت‌های رقابتی (Technical & Feature Badges)
  {
    id: 'feat-elementor-ready',
    title: 'سازگار کامل با المنتور',
    tagline: 'بیش از ۲۰ ویجت اختصاصی Elementor',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '🧩',
    badgeStyle: 'purple-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  {
    id: 'feat-direct-gateway',
    title: 'اتصال به تمام درگاه‌های پرداخت',
    tagline: 'زرین‌پال، سامان، ملت، پاسارگاد و...',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '💳',
    badgeStyle: 'cyan-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(6, 182, 212, 0.5)',
  },
  {
    id: 'feat-100-persian-rtl',
    title: '۱۰۰٪ فارسی و راست‌چین',
    tagline: 'همراه با فونت‌های استاندارد ژاکت',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '🇮🇷',
    badgeStyle: 'emerald-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'feat-mobile-responsive',
    title: 'کاملاً واکنش‌گرا و ریسپانسیو',
    tagline: 'نمایش بی‌نقص در موبایل و تبلت',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '📱',
    badgeStyle: 'orange-zhaket',
    textColor: '#ffffff',
    borderColor: 'rgba(255, 122, 0, 0.5)',
  },
  {
    id: 'feat-zero-code',
    title: 'بدون نیاز به یک خط کدنویسی',
    tagline: 'راه‌اندازی آسان فقط با یک کلیک',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '🪄',
    badgeStyle: 'gold-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  {
    id: 'feat-push-notification',
    title: 'پوش نوتیفیکیشن هوشمند',
    tagline: 'افزایش ۳۰۰ درصدی نرخ بازگشت مشتری',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '🔔',
    badgeStyle: 'white-glow',
    textColor: '#0f172a',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  {
    id: 'mobile-app-ios-android',
    title: 'اپلیکیشن iOS و Android',
    tagline: 'همراه با فایل‌های آماده سورس کد',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '📲',
    badgeStyle: 'cyan-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(6, 182, 212, 0.6)',
  },
  {
    id: 'mobile-direct-apk',
    title: 'دانلود مستقیم APK',
    tagline: 'بدون نیاز به مارکت و فیلتر',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '🤖',
    badgeStyle: 'emerald-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  {
    id: 'mobile-pwa-install',
    title: 'وب‌اپلیکیشن PWA پیشرفته',
    tagline: 'نصب آسان روی دسکتاپ و موبایل',
    category: 'features',
    categoryLabel: 'ویژگی‌ها و مزیت‌های محصول',
    iconType: 'emoji',
    iconValue: '🌐',
    badgeStyle: 'purple-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },

  // 4. ریبون‌ها و برچسب‌های پیشنهاد ویژه و تخفیف (Offer Ribbons)
  {
    id: 'offer-zhaket-special',
    title: 'پیشنهاد ویژه ژاکت',
    tagline: 'تخفیف محدود ویژه اعضای طلایی',
    category: 'offers',
    categoryLabel: 'ریبون و تگ‌های پیشنهاد ویژه',
    iconType: 'emoji',
    iconValue: '🏷️',
    badgeStyle: 'orange-zhaket',
    textColor: '#ffffff',
    borderColor: 'rgba(255, 122, 0, 0.7)',
  },
  {
    id: 'offer-super-deal',
    title: 'تخفیف شگفت‌انگیز',
    tagline: 'فقط برای مدت محدود',
    category: 'offers',
    categoryLabel: 'ریبون و تگ‌های پیشنهاد ویژه',
    iconType: 'emoji',
    iconValue: '💥',
    badgeStyle: 'gold-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(239, 68, 68, 0.7)',
  },
  {
    id: 'offer-new-release',
    title: 'نسخه جدید ۳.۵ منتشر شد',
    tagline: 'با امکانات فوق‌العاده و جذاب',
    category: 'offers',
    categoryLabel: 'ریبون و تگ‌های پیشنهاد ویژه',
    iconType: 'emoji',
    iconValue: '✨',
    badgeStyle: 'cyan-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(56, 189, 248, 0.7)',
  },
  {
    id: 'offer-bestseller-badge',
    title: 'پرفروش‌ترین ماه ژاکت',
    tagline: 'انتخاب اول بیش از ۵۰۰۰ متخصص وب',
    category: 'offers',
    categoryLabel: 'ریبون و تگ‌های پیشنهاد ویژه',
    iconType: 'emoji',
    iconValue: '🏆',
    badgeStyle: 'purple-gradient',
    textColor: '#ffffff',
    borderColor: 'rgba(168, 85, 247, 0.7)',
  },
];

export const getBadgeStyleClass = (style: SemanticSticker['badgeStyle']) => {
  switch (style) {
    case 'white-glow':
      return 'bg-white text-slate-950 shadow-[0_8px_25px_rgba(255,255,255,0.3)] border border-white/80 font-bold';
    case 'gold-gradient':
      return 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-[0_8px_25px_rgba(245,158,11,0.35)] border border-yellow-200/60 font-black';
    case 'emerald-gradient':
      return 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_8px_25px_rgba(16,185,129,0.35)] border border-emerald-400/50 font-bold';
    case 'cyan-gradient':
      return 'bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 text-white shadow-[0_8px_25px_rgba(6,182,212,0.35)] border border-cyan-300/50 font-bold';
    case 'orange-zhaket':
      return 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-[0_8px_25px_rgba(255,122,0,0.4)] border border-orange-300/60 font-black';
    case 'purple-gradient':
      return 'bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 text-white shadow-[0_8px_25px_rgba(147,51,234,0.35)] border border-purple-300/50 font-bold';
    case 'dark-glass':
    default:
      return 'bg-slate-950/85 text-white backdrop-blur-md shadow-xl border border-white/20 font-semibold';
  }
};

interface SemanticStickerLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStickerToCanvas: (sticker: SemanticSticker) => void;
}

export const SemanticStickerLibraryModal: React.FC<SemanticStickerLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddStickerToCanvas,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedStickerId, setAddedStickerId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'همه استیکرها' },
    { id: 'guarantee', label: '🛡️ تضمین و اصالت ژاکت' },
    { id: '3d-shapes', label: '🚀 استیکرهای ۳D و جذاب' },
    { id: 'features', label: '⚡ ویژگی‌ها و مزایا' },
    { id: 'offers', label: '🏷️ ریبون و تخفیف‌ها' },
  ];

  const filteredStickers = SEMANTIC_STICKERS_DATA.filter((s) => {
    const matchesCat = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch = 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.tagline && s.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSelect = (sticker: SemanticSticker) => {
    onAddStickerToCanvas(sticker);
    setAddedStickerId(sticker.id);
    setTimeout(() => {
      setAddedStickerId(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-['Vazirmatn']">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">کتابخانه رایگان استیکر و طرح‌های معنایی ژاکت</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  الزام قوانین مارکت ژاکت
                </span>
              </div>
              <p className="text-xs text-slate-400">
                استیکرهای ۳D، بج‌های قانونی و طرح‌های معنایی را با یک کلیک به پیش‌نمایش زنده اضافه کنید و آزادانه درگ نمایید.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجوی استیکر معنایی..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Sticker Cards Grid */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStickers.map((sticker) => {
              const isAdded = addedStickerId === sticker.id;
              const badgeClass = getBadgeStyleClass(sticker.badgeStyle);

              return (
                <div
                  key={sticker.id}
                  className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/50 rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all hover:shadow-xl group"
                >
                  {/* Sticker Preview Component */}
                  <div className="flex items-center justify-center p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 min-h-[70px]">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${badgeClass} transform group-hover:scale-105 transition-transform duration-200 select-none`}>
                      <span className="text-lg filter drop-shadow">{sticker.iconValue}</span>
                      <div className="text-right">
                        <div className="text-xs font-extrabold leading-tight">{sticker.title}</div>
                        {sticker.tagline && (
                          <div className="text-[9px] opacity-85 leading-tight">{sticker.tagline}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info and Add Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {sticker.categoryLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelect(sticker)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>افزوده شد!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>درج روی کاور</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStickers.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Info className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">استیکری مطابق با جستجوی شما یافت نشد.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>تمام استیکرها ۱۰۰٪ رایگان و مجاز برای ثبت محصول در ژاکت هستند.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};

export default SemanticStickerLibraryModal;
