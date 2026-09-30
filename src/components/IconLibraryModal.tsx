import React, { useState } from 'react';
import { Search, Check, Grid, X } from 'lucide-react';
import { VECTOR_ICONS_CATALOG, VECTOR_ICON_CATEGORIES, VectorIconItem } from '../data/vectorIcons';

interface IconLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string, iconId: string) => void;
}

export const IconLibraryModal: React.FC<IconLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectIcon,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredIcons = VECTOR_ICONS_CATALOG.filter((item) => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const query = searchTerm.trim().toLowerCase();
    const matchSearch = !query || 
      item.name.toLowerCase().includes(query) || 
      item.id.toLowerCase().includes(query) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(query)));
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>کتابخانه جامع ۲۱۳ آیکون وکتور</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  {VECTOR_ICONS_CATALOG.length} مدل برداری
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                دسته‌بندی شده در ۷ شاخه: فروشگاه، مالی، امنیت، سرور، ارتباطات، مدیا و سیستم
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text"
              placeholder="جست‌وجوی سریع نام آیکون، برچسب‌ها (سرعت، خرید، امنیت، تیکت، هاست، ارز)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {VECTOR_ICON_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {filteredIcons.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectIcon(item.name, item.id);
                      setCopiedId(item.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all flex flex-col items-center justify-center gap-1.5 group text-center relative shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 group-hover:border-amber-500/40 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors">
                      <IconComponent className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-white truncate w-full">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-slate-500 group-hover:text-amber-300/80">
                      {item.categoryLabel}
                    </span>
                    {copiedId === item.id && (
                      <span className="absolute inset-0 bg-emerald-600/95 rounded-2xl flex items-center justify-center text-white text-xs font-bold gap-1 animate-fadeIn">
                        <Check className="w-4 h-4" /> انتخاب شد
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 space-y-2 text-slate-500">
              <Search className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-xs">هیچ آیکونی با این مشخصات یافت نشد.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>روی هر آیکون کلیک کنید تا بلافاصله به کارت فعال یا ویژگی‌ها افزوده شود. ({filteredIcons.length} آیکون فعال)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            بستن
          </button>
        </div>

      </div>
    </div>
  );
};

export default IconLibraryModal;
