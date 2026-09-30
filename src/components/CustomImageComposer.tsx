import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Plus, Trash2, Sliders, Check } from 'lucide-react';
import { CanvasLayerItem } from '../types/canvasLayers';

interface CustomImageComposerProps {
  onAddImageLayer: (layerConfig: Partial<CanvasLayerItem>) => void;
}

export const CustomImageComposer: React.FC<CustomImageComposerProps> = ({ onAddImageLayer }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('تصویر سفارشی');
  const [scale, setScale] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
        setImageName(file.name.split('.')[0] || 'تصویر سفارشی');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleAdd = () => {
    if (!previewImage) return;

    onAddImageLayer({
      name: imageName || 'تصویر آپلود شده',
      type: 'ai-graphic',
      scale: scale || 1.0,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      data: {
        imageUrl: previewImage,
      },
    });

    setPreviewImage(null);
  };

  return (
    <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-3 shadow-xl text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">ورود عکس و اسکرین‌شات دلخواه</h4>
            <p className="text-[10px] text-slate-400">آپلود هرگونه تصویر، بنر یا لوگو به عنوان لایه آزاد</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-2 ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/20'
              : 'border-emerald-500/40 hover:border-emerald-400 bg-slate-900/60 hover:bg-emerald-500/10'
          }`}
        >
          <Upload className="w-5 h-5 text-emerald-400" />
          <span className="text-[11px] font-bold text-emerald-300">
            کلیک برای انتخاب عکس یا کشیدن و رها کردن فایل
          </span>
          <span className="text-[10px] text-slate-400">PNG شفاف، JPG، WebP، SVG</span>
        </div>
      ) : (
        <div className="space-y-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <img src={previewImage} alt="Preview" className="w-14 h-14 object-contain rounded-lg bg-black/40 border border-slate-700" />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={imageName}
                onChange={(e) => setImageName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                placeholder="نام لایه..."
              />
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" /> فایل آماده افزودن به بوم است
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>درج این عکس روی بوم طراحی</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomImageComposer;
