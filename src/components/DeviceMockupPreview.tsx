import React, { useRef } from 'react';
import { Smartphone, Tablet, Laptop, Upload, Trash2, Image as ImageIcon, Eye, Check } from 'lucide-react';

export type MockupType = 'mobile' | 'tablet' | 'desktop' | 'none';

interface DeviceMockupPreviewProps {
  type: MockupType;
  uploadedImage: string | null;
  onUploadImage: (dataUrl: string) => void;
  onRemoveImage: () => void;
  className?: string;
  isDraggable?: boolean;
}

export const DeviceMockupPreview: React.FC<DeviceMockupPreviewProps> = ({
  type,
  uploadedImage,
  onUploadImage,
  onRemoveImage,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onUploadImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (type === 'none') {
    return null;
  }

  // 1. Mobile Phone Mockup (iPhone / Modern Android style)
  if (type === 'mobile') {
    return (
      <div className={`relative mx-auto flex flex-col items-center select-none ${className}`}>
        {/* Phone Frame */}
        <div className="relative w-[150px] sm:w-[170px] h-[280px] sm:h-[310px] bg-slate-950 border-[6px] border-slate-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Dynamic Island / Speaker Notch */}
          <div className="absolute top-2 w-16 h-3.5 bg-slate-900 rounded-full z-20 flex items-center justify-center gap-1 border border-slate-700/50">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
            <div className="w-2 h-1 rounded-full bg-slate-800"></div>
          </div>

          {/* Screen Content */}
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
            {uploadedImage ? (
              <img 
                src={uploadedImage} 
                alt="اسکرین شات موبایل" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-amber-500/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-white mb-0.5">موکاپ گوشی</span>
                <span className="text-[9px] text-amber-300">کلیک برای آپلود اسکرین‌شات از سیستم</span>
              </div>
            )}
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-1.5 w-16 h-1 bg-white/40 rounded-full z-20"></div>
        </div>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // 2. Tablet Mockup (iPad style)
  if (type === 'tablet') {
    return (
      <div className={`relative mx-auto flex flex-col items-center select-none ${className}`}>
        {/* Tablet Frame */}
        <div className="relative w-[210px] sm:w-[240px] h-[260px] sm:h-[290px] bg-slate-950 border-[7px] border-slate-800 rounded-[28px] shadow-2xl overflow-hidden flex flex-col items-center">
          {/* Top Camera Dot */}
          <div className="absolute top-2 w-2 h-2 rounded-full bg-slate-800 z-20 border border-slate-700"></div>

          {/* Screen Content */}
          <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
            {uploadedImage ? (
              <img 
                src={uploadedImage} 
                alt="اسکرین شات تبلت" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-indigo-500/30">
                  <Tablet className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-white mb-0.5">موکاپ تبلت</span>
                <span className="text-[10px] text-indigo-300">کلیک برای آپلود اسکرین‌شات از سیستم</span>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input 
          ref={fileInputRef} 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
    );
  }

  // 3. Desktop / Laptop Mockup (MacBook style)
  return (
    <div className={`relative mx-auto flex flex-col items-center select-none ${className}`}>
      {/* Screen Frame */}
      <div className="relative w-[240px] sm:w-[280px] h-[155px] sm:h-[180px] bg-slate-950 border-[6px] border-slate-800 rounded-t-2xl shadow-2xl overflow-hidden flex flex-col items-center">
        {/* Camera Dot */}
        <div className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-slate-700 z-20"></div>

        {/* Screen Display */}
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
          {uploadedImage ? (
            <img 
              src={uploadedImage} 
              alt="اسکرین شات دسکتاپ" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-slate-800/80 transition-colors group"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform border border-purple-500/30">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white mb-0.5">موکاپ دسکتاپ و وب</span>
              <span className="text-[9px] text-purple-300">کلیک برای آپلود تصویر از سیستم</span>
            </div>
          )}
        </div>
      </div>

      {/* Laptop Base Bottom Stand */}
      <div className="w-[270px] sm:w-[320px] h-[10px] bg-slate-800 rounded-b-xl border-t border-slate-700 flex justify-center shadow-lg">
        <div className="w-12 h-1 bg-slate-950 rounded-b-sm"></div>
      </div>

      {/* Hidden File Input */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileChange}
      />
    </div>
  );
};

export default DeviceMockupPreview;
