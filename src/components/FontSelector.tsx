import React, { useState, useRef } from 'react';
import { Type, Check, Upload, AlertCircle, Info, RefreshCw } from 'lucide-react';

export interface FontOption {
  id: string;
  name: string;
  cssClass: string;
  styleDesc: string;
}

// Default copyright-free font option
export const PERSIAN_FONTS: FontOption[] = [
  { id: 'vazirmatn', name: 'وزیرمتن (Vazirmatn)', cssClass: 'font-vazirmatn', styleDesc: 'پیش‌فرض آزاد و متن‌باز' },
  { id: 'custom-uploaded', name: 'فونت بارگذاری‌شده شما (Custom)', cssClass: 'font-custom-uploaded', styleDesc: 'نسخه شخصی خریداری شده شما' }
];

interface FontSelectorProps {
  selectedFontId: string;
  onSelectFont: (fontId: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ selectedFontId, onSelectFont }) => {
  const [uploadedFontName, setUploadedFontName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['ttf', 'woff', 'woff2'].includes(extension || '')) {
      setUploadError('قالب فایل غیرمجاز است. لطفا فقط فایل‌های با پسوند ttf. یا woff2. آپلود نمایید.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (!arrayBuffer) {
            throw new Error('خطا در خواندن فایل فونت');
          }

          // Register font dynamically in CSS Font Loading API
          const customFontFamilyName = 'ZhakitCustomFont';
          const fontFace = new FontFace(customFontFamilyName, arrayBuffer);
          
          await fontFace.load();
          document.fonts.add(fontFace);

          // Insert or update dynamic style block to map .font-custom-uploaded class
          let styleEl = document.getElementById('dynamic-custom-font-style');
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'dynamic-custom-font-style';
            document.head.appendChild(styleEl);
          }
          // Also declare the font as a CSS @font-face with an inline data: URL. Fonts added only via
          // document.fonts are invisible to html-to-image (PNG/PDF/PSD/ZIP export renders in an
          // isolated SVG image), so without this rule exported files fell back to a default font.
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i += 0x8000) {
            binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          }
          const ext = file.name.toLowerCase().split('.').pop();
          const mime = ext === 'woff2' ? 'font/woff2' : ext === 'woff' ? 'font/woff' : ext === 'otf' ? 'font/otf' : 'font/ttf';
          const format = ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : ext === 'otf' ? 'opentype' : 'truetype';
          styleEl.textContent = `
            @font-face {
              font-family: '${customFontFamilyName}';
              src: url(data:${mime};base64,${btoa(binary)}) format('${format}');
              font-weight: 100 900;
              font-display: block;
            }
            .font-custom-uploaded,
            .font-custom-uploaded * {
              font-family: '${customFontFamilyName}', 'Vazirmatn', sans-serif !important;
            }
          `;

          setUploadedFontName(file.name);
          onSelectFont('custom-uploaded');
        } catch (err: any) {
          console.error(err);
          setUploadError('خطا در بارگذاری فونت. مطمئن شوید فایل فونت سالم و معتبر است.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error(err);
      setUploadError('خطا در پردازش فایل فونت.');
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-4 bg-slate-950 rounded-2xl border border-indigo-500/30 space-y-4 shadow-xl text-xs">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">مدیریت فونت و کپی‌رایت طرح</h4>
            <p className="text-[10px] text-slate-400">تنظیم فونت پیش‌فرض قانونی یا بارگذاری فونت‌های تجاری شما</p>
          </div>
        </div>
      </div>

      {/* Copyright Compliancy Card */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5">
        <div className="flex items-start gap-2 text-[10px] text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <div className="space-y-1 leading-relaxed">
            <p className="font-extrabold">بیانیه رعایت حقوق کپی‌رایت طراحان فونت فارسی:</p>
            <p className="text-slate-300">
              به منظور صیانت از زحمات طراحان بزرگ فونت‌های فارسی تجاری (مانند ایران‌سنس، یکان‌بک، کلمه، دانا و غیره) و جلوگیری از توزیع غیرمجاز، فونت پیش‌فرض کل پلتفرم **وزیرمتن (کاملاً رایگان و متن‌باز)** تنظیم شده است.
            </p>
            <p className="text-slate-300 font-bold">
              در صورتی که لایسنس فونت مورد نظر خود را خریداری نموده‌اید، می‌توانید فایل فونت خریداری شده را از بخش زیر بارگذاری کنید تا در طراحی شما اعمال شود.
            </p>
          </div>
        </div>
      </div>

      {/* Selector Options */}
      <div className="grid grid-cols-2 gap-2">
        {PERSIAN_FONTS.map((font) => {
          const isSelected = selectedFontId === font.id;
          const isDisabled = font.id === 'custom-uploaded' && !uploadedFontName;

          return (
            <button
              key={font.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectFont(font.id)}
              className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between gap-1.5 relative ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-black'
                  : isDisabled
                  ? 'bg-slate-900/40 text-slate-600 border-white/5 cursor-not-allowed'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold">
                  {font.id === 'custom-uploaded' && uploadedFontName ? 'فونت شخصی شما' : font.name.split(' ')[0]}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
              </div>
              <span className={`text-[9px] ${isSelected ? 'text-indigo-200' : isDisabled ? 'text-slate-700' : 'text-slate-400'} truncate block`}>
                {font.id === 'custom-uploaded' && uploadedFontName ? uploadedFontName : font.styleDesc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Font Uploader Widget */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-bold">پیشنهاد تعامل بهتر: فونت متغیر (Variable Font) آپلود کنید!</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          برای کارکرد بی‌نقص تمامی ضخامت‌ها (Light, Regular, Bold, Black) روی بوم استودیو، پیشنهاد می‌شود فایل **فونت متغیر (Variable)** خود را بارگذاری کنید.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFontUpload}
          accept=".ttf,.woff,.woff2"
          className="hidden"
        />

        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          ) : (
            <Upload className="w-4 h-4 text-indigo-400" />
          )}
          <span>{uploadedFontName ? 'بارگذاری مجدد فونت متغیر' : 'بارگذاری فایل فونت (.ttf, .woff2)'}</span>
        </button>

        {uploadedFontName && (
          <p className="text-[10px] text-emerald-400 font-bold text-center">
            ✓ فونت «{uploadedFontName}» با موفقیت فعال و در لایه‌ها همگام شد.
          </p>
        )}

        {uploadError && (
          <p className="text-[10px] text-rose-400 text-center font-semibold">
            {uploadError}
          </p>
        )}
      </div>
    </div>
  );
};

export default FontSelector;
