import React, { useState } from 'react';
import ColorField from './ColorField';
import { formatRgba, isColor, parseColor, toHex6 } from '../utils/color';
import {
  Sliders,
  Type,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Grid,
  Columns,
  Rows,
  LayoutGrid,
  Palette,
  RotateCw,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Plus,
  Move,
  Maximize2,
  Sparkles,
  Layers,
  Smartphone,
  ShieldCheck,
  Tag,
  Zap,
  Box,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Droplet,
  Flame,
  Blend,
  CircleDot,
  Wand2,
  MoveUp,
  MoveDown,
  Award,
  Upload,
  Link,
  Unlink,
  Clipboard,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { CanvasLayerItem, BlendMode, LayerShadowConfig, LayerGlowConfig, LayerBorderConfig } from '../types/canvasLayers';
import { PERSIAN_FONTS } from './FontSelector';
import { toPersianDigits } from '../utils/persianNumbers';

// Color conversion helpers for shadow color picker
const getHexAndAlpha = (colorStr: string | undefined) => {
  const c = parseColor(colorStr);
  return { hex: toHex6(colorStr ?? '#000000'), alpha: c ? c.a : 1 };
};

// Temporary style clipboard cache for Copy / Paste Style
let globalStyleClipboard: {
  shadow?: LayerShadowConfig;
  opacity?: number;
  rotation?: number;
} | null = null;

interface PhotoshopLayerInspectorProps {
  layer: CanvasLayerItem;
  allLayers?: CanvasLayerItem[];
  canvasWidth?: number;
  canvasHeight?: number;
  onUpdateLayer: (updates: Partial<CanvasLayerItem>) => void;
  onUpdateLayerData: (newData: any) => void;
  onDeleteLayer: () => void;
  onDuplicateLayer: () => void;
  onToggleSameZIndexVisibility?: (zIndex: number) => void;
  onToggleSameZIndexLock?: (zIndex: number) => void;
  onUpdateLayerById?: (id: string, updates: Partial<CanvasLayerItem>) => void;
}

export const BLEND_MODES: { id: BlendMode; name: string; desc: string }[] = [
  { id: 'normal', name: 'Normal (عادی)', desc: 'نمایش استاندارد بدون ترکیب رنگ' },
  { id: 'multiply', name: 'Multiply (ضرب/تیره‌ساز)', desc: 'تیره‌سازی و ضرب مقادیر رنگی با پس‌زمینه' },
  { id: 'screen', name: 'Screen (اسکرین/روشن‌ساز)', desc: 'روشن‌سازی و حذف بخش‌های تیره لایه' },
  { id: 'overlay', name: 'Overlay (روکش/کنتراست)', desc: 'ترکیب Multiply و Screen جهت افزایش جذابیت' },
  { id: 'color-dodge', name: 'Color Dodge (درخشش رنگ)', desc: 'روشن‌سازی فوق‌العاده نئونی و درخشان' },
  { id: 'color-burn', name: 'Color Burn (سوختگی رنگ)', desc: 'افزایش کنتراست و اشباع رنگی لایه‌ها' },
  { id: 'darken', name: 'Darken (فقط تیره‌ها)', desc: 'حفظ پیکسل‌های تیره‌تر از پس‌زمینه' },
  { id: 'lighten', name: 'Lighten (فقط روشن‌ها)', desc: 'حفظ پیکسل‌های روشن‌تر از پس‌زمینه' },
  { id: 'hard-light', name: 'Hard Light (نور تند)', desc: 'ایجاد افکت سایه‌روشن برجسته و قوی' },
  { id: 'soft-light', name: 'Soft Light (نور ملایم)', desc: 'پخش نور طبیعی و نرم مشابه پروژکتور' },
  { id: 'difference', name: 'Difference (تفریق رنگ)', desc: 'وارونگی معکوس مقادیر رنگی' },
  { id: 'exclusion', name: 'Exclusion (استثنا)', desc: 'مشابه Difference با کنتراست ملایم‌تر' },
  { id: 'luminosity', name: 'Luminosity (درخشندگی)', desc: 'حفظ درخشندگی لایه و جذب رنگ پس‌زمینه' },
];

export const PhotoshopLayerInspector: React.FC<PhotoshopLayerInspectorProps> = ({
  layer,
  allLayers = [],
  canvasWidth = 340,
  canvasHeight = 340,
  onUpdateLayer,
  onUpdateLayerData,
  onDeleteLayer,
  onDuplicateLayer,
  onToggleSameZIndexVisibility,
  onToggleSameZIndexLock,
  onUpdateLayerById,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'fx' | 'transform'>('content');
  const [activeColorTarget, setActiveColorColorTarget] = useState<'textColor' | 'pillBgColor' | 'shapeColor' | 'shadowColor' | 'outerGlowColor' | 'innerGlowColor' | 'borderColor' | null>(null);
  const [hasCopiedStyle, setHasCopiedStyle] = useState<boolean>(globalStyleClipboard !== null);

  const handleCopyStyle = () => {
    globalStyleClipboard = {
      shadow: layer.shadow ? { ...layer.shadow } : undefined,
      opacity: layer.opacity,
      rotation: layer.rotation,
    };
    setHasCopiedStyle(true);
  };

  const handlePasteStyle = () => {
    if (!globalStyleClipboard) return;
    onUpdateLayer({
      ...(globalStyleClipboard.shadow !== undefined ? { shadow: { ...globalStyleClipboard.shadow } } : {}),
      ...(globalStyleClipboard.opacity !== undefined ? { opacity: globalStyleClipboard.opacity } : {}),
      ...(globalStyleClipboard.rotation !== undefined ? { rotation: globalStyleClipboard.rotation } : {}),
    });
  };

  const data = layer.data || {};
  const currentZIndex = layer.zIndex ?? 10;
  const sameZLayers = allLayers.filter((l) => (l.zIndex ?? 10) === currentZIndex);
  const isAnySameZHidden = sameZLayers.some((l) => l.visible === false);
  const isAllSameZHidden = sameZLayers.length > 0 && sameZLayers.every((l) => l.visible === false);
  const isAnySameZLocked = sameZLayers.some((l) => l.locked === true);
  const isAllSameZLocked = sameZLayers.length > 0 && sameZLayers.every((l) => l.locked === true);

  const handleDataChange = (key: string, value: any) => {
    onUpdateLayerData({ ...data, [key]: value });
  };

  // Quick Alignment Handlers to Canvas
  const handleAlign = (type: 'left' | 'centerX' | 'right' | 'top' | 'centerY' | 'bottom') => {
    const elWidth = 100;
    const elHeight = 50;
    switch (type) {
      case 'left':
        onUpdateLayer({ x: 0 });
        break;
      case 'centerX':
        onUpdateLayer({ x: Math.round((canvasWidth - elWidth) / 2) });
        break;
      case 'right':
        onUpdateLayer({ x: canvasWidth - elWidth });
        break;
      case 'top':
        onUpdateLayer({ y: 0 });
        break;
      case 'centerY':
        onUpdateLayer({ y: Math.round((canvasHeight - elHeight) / 2) });
        break;
      case 'bottom':
        onUpdateLayer({ y: canvasHeight - elHeight });
        break;
    }
  };

  // Distribute Handlers for Multiple / Same Z-Index Layers
  const handleDistribute = (direction: 'horizontal' | 'vertical') => {
    const targetLayers = sameZLayers.length >= 2 ? sameZLayers : allLayers;
    if (targetLayers.length < 2 || !onUpdateLayerById) return;

    const sorted = [...targetLayers].sort((a, b) => {
      if (direction === 'horizontal') return (a.x || 0) - (b.x || 0);
      return (a.y || 0) - (b.y || 0);
    });

    const minCoord = direction === 'horizontal' ? (sorted[0].x || 0) : (sorted[0].y || 0);
    const maxCoord = direction === 'horizontal' ? (sorted[sorted.length - 1].x || 0) : (sorted[sorted.length - 1].y || 0);
    const span = maxCoord - minCoord;
    const step = sorted.length > 1 ? span / (sorted.length - 1) : 0;

    sorted.forEach((l, idx) => {
      const newCoord = Math.round(minCoord + step * idx);
      if (direction === 'horizontal') {
        onUpdateLayerById(l.id, { x: newCoord });
      } else {
        onUpdateLayerById(l.id, { y: newCoord });
      }
    });
  };

  return (
    <div className="PhotoshopLayerInspector bg-slate-950/95 border border-amber-500/40 rounded-2xl p-4 space-y-4 shadow-2xl backdrop-blur-xl text-xs text-right animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col gap-3 border-b border-white/10 pb-3">
        <div className="flex items-start gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xs flex flex-wrap items-center gap-1.5">
              <span>تنظیمات لایه</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-mono">
                {layer.type}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 leading-5">محتوا، افکت‌ها، آمیختگی و ترانسفورم</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1" role="toolbar" aria-label="عملیات لایه">
          {/* Toggle Lock All Layers Sharing Same Z-Index */}
          <button
            type="button"
            onClick={() => onToggleSameZIndexLock?.(currentZIndex)}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
              isAllSameZLocked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
            title={`قفل/باز کردن تمام لایه‌های هم‌سطح (Z-Index: ${toPersianDigits(currentZIndex)}) - تعداد: ${toPersianDigits(sameZLayers.length)} لایه`}
          >
            {isAllSameZLocked ? (
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Unlock className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Toggle All Layers Sharing Same Z-Index */}
          <button
            type="button"
            onClick={() => onToggleSameZIndexVisibility?.(currentZIndex)}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
              isAnySameZHidden
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
            title={`تغییر وضعیت نمایش تمام لایه‌های هم‌سطح (Z-Index: ${toPersianDigits(currentZIndex)}) - تعداد: ${toPersianDigits(sameZLayers.length)} لایه`}
          >
            {isAllSameZHidden ? (
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="font-mono text-[9px] font-bold">Z:{toPersianDigits(currentZIndex)}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyStyle}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all flex items-center gap-1"
            title="کپی استایل لایه (سایه، شفافیت، چرخش)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] whitespace-nowrap">کپی استایل</span>
          </button>
          <button
            type="button"
            onClick={handlePasteStyle}
            disabled={!hasCopiedStyle}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
              hasCopiedStyle
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-900/50 text-slate-600 border-white/5 cursor-not-allowed'
            }`}
            title="چسباندن استایل لایه"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span className="text-[9px] whitespace-nowrap">چسباندن</span>
          </button>

          <button
            type="button"
            onClick={onDuplicateLayer}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all"
            title="کپی از لایه"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {/* Bring to Front & Send to Back */}
          <button
            type="button"
            onClick={() => onUpdateLayer({ zIndex: Math.max(...allLayers.map(l => l.zIndex ?? 10)) + 10 })}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all"
            title="انتقال به رو (Bring to Front)"
          >
            <MoveUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUpdateLayer({ zIndex: Math.min(...allLayers.map(l => l.zIndex ?? 10)) - 10 })}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 transition-all"
            title="انتقال به پشت (Send to Back)"
          >
            <MoveDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDeleteLayer}
            className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 transition-all"
            title="حذف لایه"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3-Tab Navigator: Content vs Layer FX vs Transform & Align */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'content'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span className="whitespace-nowrap">محتوا</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fx')}
          className={`py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'fx'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span className="whitespace-nowrap">افکت‌ها (FX)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transform')}
          className={`py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'transform'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Move className="w-3 h-3" />
          <span className="whitespace-nowrap">چیدمان</span>
        </button>
      </div>

      {/* Persistent Blend Mode & Opacity Panel (Photoshop style) */}
      <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 block">حالت آمیختگی (Blend Mode):</span>
            <select
              value={layer.blendMode || 'normal'}
              onChange={(e) => onUpdateLayer({ blendMode: e.target.value as BlendMode })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white font-mono text-[10px] focus:border-amber-400 outline-none"
            >
              {BLEND_MODES.map((bm) => (
                <option key={bm.id} value={bm.id}>
                  {bm.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-400">شفافیت (Opacity):</span>
              <span className="font-mono text-amber-300">{layer.opacity ?? 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={layer.lockOpacity}
              value={layer.opacity ?? 100}
              onChange={(e) => !layer.lockOpacity && onUpdateLayer({ opacity: Number(e.target.value) })}
              className={`w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer mt-1 ${
                layer.lockOpacity ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Lock Position Toggle Switch */}
        <div className="flex flex-col pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300">
              {layer.locked ? (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Unlock className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="text-[10px] font-bold">قفل کردن موقعیت لایه (Lock Position)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const newLockedState = !layer.locked;
                const newLogEntry: { action: 'lock' | 'unlock'; timestamp: string } = {
                  action: newLockedState ? 'lock' : 'unlock',
                  timestamp: new Date().toISOString()
                };
                onUpdateLayer({
                  locked: newLockedState,
                  lockLog: [...(layer.lockLog || []), newLogEntry]
                });
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                layer.locked ? 'bg-amber-500' : 'bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  layer.locked ? 'translate-x-[-16px]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Lock/Unlock Log */}
          {layer.lockLog && layer.lockLog.length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] text-slate-400 font-bold">تاریخچه قفل/باز کردن:</span>
              <div className="max-h-20 overflow-y-auto space-y-1 bg-slate-950 p-1.5 rounded-lg text-[9px] font-mono custom-scrollbar">
                {layer.lockLog.slice().reverse().map((log, index) => (
                  <div key={index} className="flex justify-between items-center border-b border-slate-800/50 pb-0.5 last:border-0">
                    <span className={log.action === 'lock' ? 'text-amber-400' : 'text-emerald-400'}>
                      {log.action === 'lock' ? 'قفل' : 'باز'}
                    </span>
                    <span className="text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: CONTENT SPECIFIC CONTROLS */}
      {activeTab === 'content' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* CASE A: TEXT LAYER */}
          {layer.type === 'text' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Type className="w-4 h-4 text-amber-400" />
                <span>تنظیمات تایپوگرافی و متن</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">متن عنوان اصلی:</label>
                <input
                  type="text"
                  value={data.text || ''}
                  onChange={(e) => handleDataChange('text', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-amber-400 outline-none"
                  placeholder="عنوان لایه..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">زیرعنوان (توضیح کوتاه اختیاری):</label>
                <input
                  type="text"
                  value={data.subtitle || ''}
                  onChange={(e) => handleDataChange('subtitle', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-amber-400 outline-none"
                  placeholder="زیرعنوان..."
                />
              </div>

              {/* Font Family Selector */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">تایپ‌فیس فارسی:</label>
                <select
                  value={data.fontFamily || ''}
                  onChange={(e) => handleDataChange('fontFamily', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-bold"
                >
                  <option value="">پیش‌فرض سیستم (وزیرمتن / Vazirmatn)</option>
                  {PERSIAN_FONTS.map((font) => (
                    <option key={font.id} value={font.cssClass}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size & Alignment */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">اندازه قلم:</span>
                    <span className="font-mono text-amber-300">{data.fontSize || 20}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="64"
                    value={data.fontSize || 20}
                    onChange={(e) => handleDataChange('fontSize', Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block">چینش متن:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'right', icon: AlignRight },
                      { id: 'center', icon: AlignCenter },
                      { id: 'left', icon: AlignLeft },
                    ].map((al) => {
                      const Icon = al.icon;
                      return (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => handleDataChange('textAlign', al.id)}
                          className={`py-1 rounded flex items-center justify-center border transition-all ${
                            (data.textAlign || 'right') === al.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Text Color Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400">رنگ متن:</label>
                  <span className="font-mono text-amber-300 text-[10px] uppercase">{data.textColor || '#ffffff'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ColorField label="انتخاب رنگ" value={data.textColor || '#ffffff'} onChange={(v) => handleDataChange('textColor', v)} />
                  <div className="flex gap-1 flex-wrap">
                    {['#ffffff', '#fbbf24', '#10b981', '#06b6d4', '#ec4899', '#6366f1', '#f43f5e', '#0f172a'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleDataChange('textColor', c)}
                        style={{ backgroundColor: c }}
                        className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE B: FEATURE PILLS */}
          {layer.type === 'feature-pills' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Grid className="w-4 h-4 text-amber-400" />
                <span>تنظیمات کپسول‌های ویژگی</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">چیدمان نمایش (Layout):</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'grid2x2', label: 'شبکه‌ای ۲×۲', icon: LayoutGrid },
                    { id: 'horizontal', label: 'افقی', icon: Columns },
                    { id: 'vertical', label: 'عمودی', icon: Rows },
                    { id: 'wrap', label: 'شناور آزاد', icon: Grid },
                  ].map((l) => {
                    const Icon = l.icon;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleDataChange('layoutMode', l.id)}
                        className={`py-1 px-1 rounded flex flex-col items-center gap-1 border text-[9px] font-bold transition-all ${
                          (data.layoutMode || 'grid2x2') === l.id
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{l.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feature Items Editor */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 block">متن ویژگی‌ها:</label>
                {(data.features || ['سرعت لود فوق‌العاده', 'اورجینال و فارسی', 'پشتیبانی ۲۴ ساعته', 'طراحی اختصاصی']).map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-4 text-[9px] font-mono text-amber-400">{idx + 1}.</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const newFeatures = [...(data.features || [])];
                        newFeatures[idx] = e.target.value;
                        handleDataChange('features', newFeatures);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                    />
                  </div>
                ))}
              </div>
              {/* Feature Pills Colors */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">رنگ پس‌زمینه کپسول‌ها:</label>
                  <div className="flex items-center gap-1.5">
                    <ColorField label="انتخاب رنگ" value={data.pillBgColor?.startsWith('#') ? data.pillBgColor : '#0f172a'} onChange={(v) => handleDataChange('pillBgColor', v)} />
                    <input
                      type="text"
                      placeholder="پیش‌فرض دارک"
                      value={data.pillBgColor || ''}
                      onChange={(e) => handleDataChange('pillBgColor', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">رنگ متن ویژگی‌ها:</label>
                  <div className="flex items-center gap-1.5">
                    <ColorField label="انتخاب رنگ" value={data.pillTextColor || '#ffffff'} onChange={(v) => handleDataChange('pillTextColor', v)} />
                    <input
                      type="text"
                      value={data.pillTextColor || '#ffffff'}
                      onChange={(e) => handleDataChange('pillTextColor', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE C: SHAPE & VECTOR GEOMETRY */}
          {layer.type === 'shape' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>تنظیمات و رنگ اشکال برداری (Vector Shape)</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">متن داخل شکل:</label>
                <input
                  type="text"
                  value={data.shapeText || ''}
                  onChange={(e) => handleDataChange('shapeText', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-amber-400 outline-none"
                  placeholder="متن شکل..."
                />
              </div>

              {/* Fill Color */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400">رنگ پر کردن شکل (Fill Color):</label>
                  <span className="font-mono text-amber-300 text-[10px] uppercase">{data.fillColor || '#4f46e5'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ColorField label="انتخاب رنگ" value={data.fillColor?.startsWith('#') ? data.fillColor : '#4f46e5'} onChange={(v) => handleDataChange('fillColor', v)} />
                  <input
                    type="text"
                    value={data.fillColor || '#4f46e5'}
                    onChange={(e) => handleDataChange('fillColor', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono text-xs text-white"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {['#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ec4899', '#f43f5e', 'rgba(15,23,42,0.8)'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleDataChange('fillColor', c)}
                        style={{ backgroundColor: c }}
                        className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Stroke / Border Color */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400">رنگ خط حاشیه (Stroke / Border):</label>
                  <span className="font-mono text-cyan-300 text-[10px] uppercase">{data.strokeColor || '#818cf8'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ColorField label="انتخاب رنگ" value={data.strokeColor?.startsWith('#') ? data.strokeColor : '#818cf8'} onChange={(v) => handleDataChange('strokeColor', v)} />
                  <input
                    type="text"
                    value={data.strokeColor || '#818cf8'}
                    onChange={(e) => handleDataChange('strokeColor', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono text-xs text-white"
                  />
                </div>
              </div>

              {/* Lock Aspect Ratio for Shape Layer */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  {data.lockAspectRatio || layer.lockAspectRatio ? (
                    <Link className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  ) : (
                    <Unlink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="text-[11px] font-bold text-slate-200">قفل نسبت ابعاد (Lock Aspect Ratio):</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !(data.lockAspectRatio || layer.lockAspectRatio);
                    handleDataChange('lockAspectRatio', nextVal);
                    onUpdateLayer({ lockAspectRatio: nextVal });
                  }}
                  className={`px-2 py-1 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition-all ${
                    data.lockAspectRatio || layer.lockAspectRatio
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title={data.lockAspectRatio || layer.lockAspectRatio ? 'باز کردن قفل تناسب' : 'قفل کردن نسبت ابعاد'}
                >
                  {data.lockAspectRatio || layer.lockAspectRatio ? (
                    <>
                      <Link className="w-3 h-3 text-slate-950" />
                      <span>قفل شد</span>
                    </>
                  ) : (
                    <>
                      <Unlink className="w-3 h-3 text-slate-400" />
                      <span>آزاد</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* CASE LOGO: ZHAKET / CUSTOM LOGO LAYER */}
          {layer.type === 'logo' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>تنظیمات لوگوی اختصاصی / رسمی ژاکت</span>
              </div>

              {/* Upload file button */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">تصویر لوگو روی بوم:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/png,image/jpeg,image/svg+xml,image/webp';
                      input.onchange = (e: any) => {
                        const file = e.target?.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            const result = re.target?.result as string;
                            handleDataChange('customLogoUrl', result);
                            handleDataChange('imageUrl', result);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    className="w-full py-2 px-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow transition-all active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>آپلود / انتخاب لوگو از کامپیوتر یا سیستم</span>
                  </button>
                  {data.customLogoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        handleDataChange('customLogoUrl', null);
                        handleDataChange('imageUrl', null);
                      }}
                      className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 rounded-xl transition-all"
                      title="بازنشانی به لوگوی رسمی ژاکت"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Logo Sizing */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">سایز لوگو (ارتفاع):</span>
                    <span className="font-mono text-amber-300">{toPersianDigits(data.logoSize || data.customSizePx || 48)}px</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="160"
                    value={data.logoSize || data.customSizePx || 48}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      handleDataChange('logoSize', val);
                      handleDataChange('customSizePx', val);
                    }}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">پدینگ کادر باکس:</span>
                    <span className="font-mono text-amber-300">{toPersianDigits(data.boxPadding !== undefined ? data.boxPadding : 8)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={data.boxPadding !== undefined ? data.boxPadding : 8}
                    onChange={(e) => handleDataChange('boxPadding', Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">رنگ پس‌زمینه کادر:</label>
                  <div className="flex items-center gap-1.5">
                    <ColorField label="انتخاب رنگ" value={data.boxBgColor?.startsWith('#') ? data.boxBgColor : '#0f172a'} onChange={(v) => handleDataChange('boxBgColor', v)} />
                    <input
                      type="text"
                      placeholder="rgba(15,23,42,0.8)"
                      value={data.boxBgColor || ''}
                      onChange={(e) => handleDataChange('boxBgColor', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">رنگ خط حاشیه کادر:</label>
                  <div className="flex items-center gap-1.5">
                    <ColorField label="انتخاب رنگ" value={data.boxBorderColor?.startsWith('#') ? data.boxBorderColor : '#fbbf24'} onChange={(v) => handleDataChange('boxBorderColor', v)} />
                    <input
                      type="text"
                      value={data.boxBorderColor || ''}
                      onChange={(e) => handleDataChange('boxBorderColor', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE D: BADGE & OFFICIAL ZHAKET BADGES */}
          {(layer.type === 'badge' || layer.type === 'zhaket-badge') && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>تنظیمات بج رسمی ژاکت و رنگ‌ها</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">عنوان بج:</label>
                <input
                  type="text"
                  value={data.badgeTitle || data.badgeText || ''}
                  onChange={(e) => {
                    handleDataChange('badgeTitle', e.target.value);
                    handleDataChange('badgeText', e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-amber-400 outline-none"
                  placeholder="عنوان بج..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">توضیح کوتاه / شعار بج (اختیاری):</label>
                <input
                  type="text"
                  value={data.badgeTagline || ''}
                  onChange={(e) => handleDataChange('badgeTagline', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:border-amber-400 outline-none"
                  placeholder="شعار یا توضیح بج..."
                />
              </div>

              {/* Style Presets */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">قالب و تم رنگی استاندارد ژاکت:</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'gold-gradient', label: 'طلایی لوکس', bg: 'from-amber-500 to-yellow-600' },
                    { id: 'emerald-gradient', label: 'سبز تضمین', bg: 'from-emerald-600 to-teal-700' },
                    { id: 'orange-zhaket', label: 'نارنجی ژاکت', bg: 'from-orange-600 to-amber-700' },
                    { id: 'cyan-gradient', label: 'آبی سایان', bg: 'from-cyan-600 to-blue-700' },
                    { id: 'purple-gradient', label: 'بنفش رویال', bg: 'from-purple-600 to-indigo-700' },
                    { id: 'dark-glass', label: 'شیشه‌ای دارک', bg: 'from-slate-900 to-slate-950' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleDataChange('badgeStyle', st.id)}
                      className={`py-1.5 px-1 rounded-lg text-[9px] font-bold border transition-all text-center truncate ${
                        (data.badgeStyle || 'gold-gradient') === st.id
                          ? 'border-amber-400 bg-amber-500/20 text-white font-black'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Color Customization */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">رنگ اختصاصی متن:</label>
                  <div className="flex items-center gap-1.5">
                    <ColorField label="انتخاب رنگ" value={data.textColor || '#ffffff'} onChange={(v) => handleDataChange('textColor', v)} />
                    <input
                      type="text"
                      value={data.textColor || '#ffffff'}
                      onChange={(e) => handleDataChange('textColor', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 block">رنگ خط حاشیه:</label>
                  <div className="flex items-center gap-1.5">
                    <ColorField label="انتخاب رنگ" value={data.borderColor?.startsWith('#') ? data.borderColor : '#fbbf24'} onChange={(v) => handleDataChange('borderColor', v)} />
                    <input
                      type="text"
                      value={data.borderColor || '#fbbf24'}
                      onChange={(e) => handleDataChange('borderColor', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE E: ICON LIBRARY LAYER */}
          {layer.type === 'icon-library' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>رنگ و قالب آیکون‌های وکتور (Vector Icon)</span>
              </div>

              {/* Icon Color */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400">رنگ آیکون:</label>
                  <span className="font-mono text-amber-300 text-[10px] uppercase">{data.iconColor || '#fbbf24'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ColorField label="انتخاب رنگ" value={data.iconColor?.startsWith('#') ? data.iconColor : '#fbbf24'} onChange={(v) => handleDataChange('iconColor', v)} />
                  <input
                    type="text"
                    value={data.iconColor || '#fbbf24'}
                    onChange={(e) => handleDataChange('iconColor', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 font-mono text-xs text-white"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {['#fbbf24', '#10b981', '#06b6d4', '#ec4899', '#6366f1', '#ffffff', '#f43f5e'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleDataChange('iconColor', c)}
                        style={{ backgroundColor: c }}
                        className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Shape Form */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">فرم کادر پس‌زمینه آیکون:</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'circle', label: 'دایره' },
                    { id: 'rounded', label: 'مربعی نرم' },
                    { id: 'hexagon', label: '۶ ضلعی' },
                    { id: 'none', label: 'بدون کادر' },
                  ].map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => handleDataChange('iconBgShape', sh.id)}
                      className={`py-1 rounded text-[9px] font-bold border transition-all ${
                        (data.iconBgShape || 'circle') === sh.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {sh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Background Color */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">رنگ پس‌زمینه کادر آیکون:</label>
                <div className="flex items-center gap-1.5">
                  <ColorField label="انتخاب رنگ" value={data.iconBgColor?.startsWith('#') ? data.iconBgColor : '#0f172a'} onChange={(v) => handleDataChange('iconBgColor', v)} />
                  <input
                    type="text"
                    placeholder="پیش‌فرض دارک گلس"
                    value={data.iconBgColor || ''}
                    onChange={(e) => handleDataChange('iconBgColor', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CASE F: DISCOUNT RIBBON */}
          {layer.type === 'discount-ribbon' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>تنظیمات روبان آفر و تخفیف ویژه</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">متن روی روبان:</label>
                <input
                  type="text"
                  value={data.discountPercent || ''}
                  onChange={(e) => handleDataChange('discountPercent', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-amber-400 outline-none"
                  placeholder="مثال: ۵۰٪ تخفیف ویژه ژاکت"
                />
              </div>
            </div>
          )}

          {/* CASE G: MOCKUP LAYER */}
          {layer.type === 'mockup' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>تنظیمات موکاپ و قالب دستگاه</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">نوع دستگاه:</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'mobile', label: 'موبایل' },
                    { id: 'laptop', label: 'لپ‌تاپ' },
                    { id: 'tablet', label: 'تبلت' },
                    { id: 'desktop', label: 'دسکتاپ' },
                    { id: 'browser', label: 'پنجره وب' },
                    { id: 'box3d', label: 'جعبه ۳D' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleDataChange('mockupType', m.id)}
                      className={`py-1 rounded text-[10px] font-bold border transition-all ${
                        (data.mockupType || 'mobile') === m.id
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block">رنگ فریم دستگاه:</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'dark', label: 'تیره' },
                    { id: 'silver', label: 'نقره‌ای' },
                    { id: 'gold', label: 'طلایی' },
                    { id: 'midnight', label: 'سورمه‌ای' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleDataChange('frameColor', f.id)}
                      className={`py-1 rounded text-[10px] font-bold border transition-all ${
                        (data.frameColor || 'dark') === f.id
                          ? 'bg-indigo-600 text-white border-indigo-400 font-black'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CASE D: 3D MODEL LAYER */}
          {layer.type === '3d-model' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold border-b border-white/5 pb-2">
                <Box className="w-4 h-4 text-amber-400" />
                <span>تنظیمات المان ۳D سه‌بعدی و پس‌زمینه</span>
              </div>

              {/* Toggle Text Display */}
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                <label className="text-[11px] font-bold text-slate-200 cursor-pointer flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>نمایش متن / عنوان روی المان ۳D</span>
                </label>
                <input
                  type="checkbox"
                  checked={data.showText === true}
                  onChange={(e) => handleDataChange('showText', e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Title Input (Shown when showText is checked) */}
              {data.showText && (
                <div className="space-y-1 animate-in fade-in duration-150">
                  <label className="text-[10px] text-slate-400 block">عنوان روی المان سه بعدی:</label>
                  <input
                    type="text"
                    value={data.model3dTitle || ''}
                    onChange={(e) => handleDataChange('model3dTitle', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-bold text-xs focus:border-amber-400 outline-none"
                    placeholder="عنوان المان سه‌بعدی..."
                  />
                </div>
              )}

              {/* Toggle Background Removal (Transparent) */}
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
                <label className="text-[11px] font-bold text-slate-200 cursor-pointer flex items-center gap-2">
                  <EyeOff className="w-3.5 h-3.5 text-cyan-400" />
                  <span>حذف کامل پس‌زمینه (شفاف / Transparent)</span>
                </label>
                <input
                  type="checkbox"
                  checked={data.hideBackground === true}
                  onChange={(e) => handleDataChange('hideBackground', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Background Color & Border Color when hideBackground is false */}
              {!data.hideBackground && (
                <div className="space-y-2 pt-2 border-t border-white/5 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block">رنگ پس‌زمینه کادر:</label>
                      <div className="flex items-center gap-1.5">
                        <ColorField label="انتخاب رنگ" value={(data.model3dBgColor || data.fillColor)?.startsWith('#') ? (data.model3dBgColor || data.fillColor) : '#1e1b4b'} onChange={(v) => {
                            handleDataChange('model3dBgColor', v);
                            handleDataChange('fillColor', v);
                          }} />
                        <input
                          type="text"
                          placeholder="پیش‌فرض سورمه‌ای"
                          value={data.model3dBgColor || data.fillColor || ''}
                          onChange={(e) => {
                            handleDataChange('model3dBgColor', e.target.value);
                            handleDataChange('fillColor', e.target.value);
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 block">رنگ خط حاشیه کادر:</label>
                      <div className="flex items-center gap-1.5">
                        <ColorField label="انتخاب رنگ" value={(data.model3dBorderColor || data.strokeColor)?.startsWith('#') ? (data.model3dBorderColor || data.strokeColor) : '#818cf8'} onChange={(v) => {
                            handleDataChange('model3dBorderColor', v);
                            handleDataChange('strokeColor', v);
                          }} />
                        <input
                          type="text"
                          value={data.model3dBorderColor || data.strokeColor || ''}
                          onChange={(e) => {
                            handleDataChange('model3dBorderColor', e.target.value);
                            handleDataChange('strokeColor', e.target.value);
                          }}
                          className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 font-mono text-[10px] text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preset Quick Colors */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">پالت‌های سریع پس‌زمینه 3D:</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {[
                        { name: 'سورمه‌ای دارک', bg: '#1e1b4b', border: '#6366f1' },
                        { name: 'طلایی لوکس', bg: '#451a03', border: '#f59e0b' },
                        { name: 'زمردی', bg: '#064e3b', border: '#10b981' },
                        { name: 'رز نئون', bg: '#4c0519', border: '#f43f5e' },
                        { name: 'دارک خالص', bg: '#020617', border: '#334155' },
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            handleDataChange('model3dBgColor', p.bg);
                            handleDataChange('fillColor', p.bg);
                            handleDataChange('model3dBorderColor', p.border);
                            handleDataChange('strokeColor', p.border);
                          }}
                          style={{ backgroundColor: p.bg, borderColor: p.border }}
                          className="px-2 py-1 rounded-lg border text-[9px] font-bold text-white hover:scale-105 transition-transform"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CASE: STAT CARD — three title/subtitle cells */}
          {layer.type === 'stat-card' && (
            <div className="space-y-3 bg-slate-900/70 p-3 rounded-xl border border-white/5">
              <div className="text-amber-300 font-bold border-b border-white/5 pb-2">کارت‌های آمار</div>
              {(Array.isArray(data.stats) ? data.stats : DEFAULT_STAT_CARDS).map((st: any, idx: number, all: any[]) => (
                <div key={idx} className="grid grid-cols-2 gap-2">
                  {(['title', 'subtitle'] as const).map((field) => (
                    <input
                      key={field}
                      type="text"
                      value={st[field] ?? ''}
                      aria-label={`${field === 'title' ? 'عنوان' : 'زیرعنوان'} کارت ${toPersianDigits(idx + 1)}`}
                      onChange={(e) => {
                        const next = all.map((c: any, i: number) => (i === idx ? { ...c, [field]: e.target.value } : c));
                        handleDataChange('stats', next);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:border-amber-400 outline-none"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* FALLBACK: generic editor for layer types without a dedicated panel */}
          {!DEDICATED_EDITOR_TYPES.has(layer.type) && (
            <GenericDataEditor data={data} onChange={handleDataChange} />
          )}
        </div>
      )}

      {/* TAB 2: LAYER FX & BLEND MODES (PHOTOSHOP SUITE) */}
      {activeTab === 'fx' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Blend Mode Selector */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Blend className="w-3.5 h-3.5 text-amber-400" />
                <span>حالت آمیختگی لایه (Blend Mode)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                {layer.blendMode || 'normal'}
              </span>
            </div>

            <select
              value={layer.blendMode || 'normal'}
              onChange={(e) => onUpdateLayer({ blendMode: e.target.value as BlendMode })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:border-amber-400 outline-none"
            >
              {BLEND_MODES.map((bm) => (
                <option key={bm.id} value={bm.id}>
                  {bm.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 italic">
              {BLEND_MODES.find((b) => b.id === (layer.blendMode || 'normal'))?.desc}
            </p>
          </div>

          {/* Layer Shadow Configuration Section */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                <span>سایه لایه (Layer Shadow)</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.shadow?.enabled ?? false}
                  onChange={(e) =>
                    onUpdateLayer({
                      shadow: {
                        enabled: e.target.checked,
                        x: layer.shadow?.x ?? 0,
                        y: layer.shadow?.y ?? 6,
                        blur: layer.shadow?.blur ?? 16,
                        color: layer.shadow?.color ?? 'rgba(0,0,0,0.6)',
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
              </label>
            </div>

            {layer.shadow?.enabled && (
              <div className="space-y-2.5 pt-2 border-t border-white/5 animate-in fade-in duration-150">
                {/* Shadow Presets Dropdown */}
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400">پیش‌تنظیم‌های آماده (Shadow Presets):</span>
                  <select
                    onChange={(e) => {
                      const val = e.target.value;
                      let presetUpdates: Partial<LayerShadowConfig> = {};
                      if (val === 'soft-glow') {
                        presetUpdates = { blur: 24, distance: 4, angle: 90, x: 0, y: 4, color: 'rgba(245,158,11,0.6)' };
                      } else if (val === 'hard-edge') {
                        presetUpdates = { blur: 2, distance: 3, angle: 45, x: 2, y: 2, color: '#000000' };
                      } else if (val === 'inset-shadow') {
                        presetUpdates = { blur: 10, distance: 2, angle: 135, x: -1, y: 1, color: 'rgba(0,0,0,0.8)' };
                      } else if (val === 'long-casting') {
                        presetUpdates = { blur: 32, distance: 28, angle: 45, x: 20, y: 20, color: 'rgba(0,0,0,0.45)' };
                      }
                      onUpdateLayer({ shadow: { ...layer.shadow!, ...presetUpdates } });
                    }}
                    defaultValue=""
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-[10px] focus:border-amber-400 outline-none"
                  >
                    <option value="" disabled>انتخاب پیش‌تنظیم سایه...</option>
                    <option value="soft-glow">Soft Glow (توه نرم و درخشان)</option>
                    <option value="hard-edge">Hard Edge (لبه تیز و کلاسیک)</option>
                    <option value="inset-shadow">Inset Shadow (سایه عمیق داخلی)</option>
                    <option value="long-casting">Long Casting Shadow (سایه بلند موازی)</option>
                  </select>
                </div>

                {/* High-fidelity Shadow Color Picker supporting RGBA and HEX */}
                <div className="space-y-2.5 bg-slate-950/45 p-2 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">تنظیم دقیق رنگ سایه (RGBA & HEX):</span>
                    <span className="font-mono text-amber-300 text-[9px] bg-slate-950 px-1.5 py-0.5 rounded border border-white/5">
                      {layer.shadow!.color}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Native color picker button */}
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0">
<ColorField label="رنگ سایه" value={layer.shadow!.color} onChange={(v) => onUpdateLayer({ shadow: { ...layer.shadow!, color: v } })} />
                    </div>

                    {/* Direct HEX/RGBA text box editor */}
                    <input
                      type="text"
                      value={layer.shadow!.color}
                      onChange={(e) => {
                        onUpdateLayer({ shadow: { ...layer.shadow!, color: e.target.value } });
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono text-[10px] focus:border-amber-400 outline-none text-left"
                      placeholder="e.g. #ff0055 or rgba(0,0,0,0.5)"
                    />
                  </div>

                  {/* High fidelity Alpha/Opacity slider for Shadow color */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>شفافیت رنگ سایه (Alpha/Opacity):</span>
                      <span className="font-mono text-amber-400">
                        {Math.round(getHexAndAlpha(layer.shadow!.color).alpha * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={Math.round(getHexAndAlpha(layer.shadow!.color).alpha * 100)}
                      onChange={(e) => {
                        const alphaVal = Number(e.target.value) / 100;
                        const c = parseColor(layer.shadow!.color) ?? { r: 0, g: 0, b: 0, a: 1 };
                        onUpdateLayer({ shadow: { ...layer.shadow!, color: formatRgba({ ...c, a: alphaVal }) } });
                      }}
                      className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>

                {/* Shadow Angle (زاویه سایه 0-360 درجه) */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>زاویه سایه (Shadow Angle):</span>
                    <span className="font-mono text-amber-300 font-bold">{layer.shadow.angle ?? 45}°</span>
                  </div>
                  {/* Circular Dial UI for Shadow Angle */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full border border-slate-700 bg-slate-950 flex items-center justify-center shrink-0">
                      <div 
                        className="absolute w-0.5 h-4 bg-amber-500 rounded-full origin-bottom" 
                        style={{ transform: `rotate(${layer.shadow.angle ?? 45}deg)` }}
                      ></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={layer.shadow.angle ?? 45}
                      onChange={(e) => {
                        const angle = Number(e.target.value);
                        const dist = (layer.shadow!.distance ?? Math.round(Math.sqrt((layer.shadow!.x ?? 0) ** 2 + (layer.shadow!.y ?? 6) ** 2))) || 12;
                        const rad = (angle * Math.PI) / 180;
                        const x = Math.round(dist * Math.cos(rad));
                        const y = Math.round(dist * Math.sin(rad));
                        onUpdateLayer({
                          shadow: { ...layer.shadow!, angle, distance: dist, x, y }
                        });
                      }}
                      className="flex-1 accent-amber-500 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>

                {/* Shadow Distance (فاصله سایه 0-50px) */}
                <div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>فاصله سایه (Shadow Distance):</span>
                    <span className="font-mono text-amber-300">
                      {layer.shadow.distance ?? Math.round(Math.sqrt((layer.shadow.x ?? 0) ** 2 + (layer.shadow.y ?? 6) ** 2))}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={layer.shadow.distance ?? Math.round(Math.sqrt((layer.shadow.x ?? 0) ** 2 + (layer.shadow.y ?? 6) ** 2))}
                      onChange={(e) => {
                        const distance = Number(e.target.value);
                        const angle = layer.shadow!.angle ?? 45;
                        const rad = (angle * Math.PI) / 180;
                        const x = Math.round(distance * Math.cos(rad));
                        const y = Math.round(distance * Math.sin(rad));
                        onUpdateLayer({
                          shadow: { ...layer.shadow!, distance, x, y }
                        });
                      }}
                      className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                    />
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={layer.shadow.distance ?? Math.round(Math.sqrt((layer.shadow.x ?? 0) ** 2 + (layer.shadow.y ?? 6) ** 2))}
                      onChange={(e) => {
                        const distance = Number(e.target.value);
                        const angle = layer.shadow!.angle ?? 45;
                        const rad = (angle * Math.PI) / 180;
                        const x = Math.round(distance * Math.cos(rad));
                        const y = Math.round(distance * Math.sin(rad));
                        onUpdateLayer({
                          shadow: { ...layer.shadow!, distance, x, y }
                        });
                      }}
                      className="w-12 bg-slate-950 border border-white/10 rounded px-1 py-0.5 text-center font-mono text-[10px] text-amber-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>انحراف افقی (X):</span>
                      <span className="font-mono text-amber-300">{layer.shadow.x}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={layer.shadow.x}
                      onChange={(e) =>
                        onUpdateLayer({ shadow: { ...layer.shadow!, x: Number(e.target.value) } })
                      }
                      className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>انحراف عمودی (Y):</span>
                      <span className="font-mono text-amber-300">{layer.shadow.y}px</span>
                    </div>
                    <input
                      type="range"
                      min="-30"
                      max="30"
                      value={layer.shadow.y}
                      onChange={(e) =>
                        onUpdateLayer({ shadow: { ...layer.shadow!, y: Number(e.target.value) } })
                      }
                      className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>میزان پخش سایه (Blur):</span>
                      <span className="font-mono text-amber-300">{layer.shadow.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={layer.shadow.blur}
                      onChange={(e) =>
                        onUpdateLayer({ shadow: { ...layer.shadow!, blur: Number(e.target.value) } })
                      }
                      className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>گسترش سایه (Spread):</span>
                      <span className="font-mono text-amber-300">{layer.shadow.spread ?? 0}px</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={layer.shadow.spread ?? 0}
                        onChange={(e) =>
                          onUpdateLayer({ shadow: { ...layer.shadow!, spread: Number(e.target.value) } })
                        }
                        className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                      />
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={layer.shadow.spread ?? 0}
                        onChange={(e) =>
                          onUpdateLayer({ shadow: { ...layer.shadow!, spread: Number(e.target.value) } })
                        }
                        className="w-10 bg-slate-950 border border-white/10 rounded px-1 py-0.5 text-center font-mono text-[9px] text-amber-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Background Blur (backdrop-blur) Slider inside Layer Shadow section */}
                <div className="pt-2.5 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Droplet className="w-3 h-3 text-indigo-400" />
                      <span>تاری پس‌زمینه لایه (Background Blur):</span>
                    </span>
                    <span className="font-mono text-amber-300">{layer.backdropBlur || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={layer.backdropBlur || 0}
                    onChange={(e) => onUpdateLayer({ backdropBlur: Number(e.target.value) })}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Reset Shadow Button */}
                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[9px] text-slate-500 italic">تأثیر شیشه مات در پس‌زمینه</span>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateLayer({
                        backdropBlur: 0,
                        shadow: {
                          enabled: true,
                          x: 0,
                          y: 4,
                          blur: 16,
                          spread: 0,
                          color: 'rgba(0,0,0,0.3)',
                          angle: 90,
                          distance: 4
                        }
                      });
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/20 text-[10px] font-bold transition-all"
                  >
                    <span>ریست تنظیمات سایه (Reset Shadow)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Inner Glow FX (تابش نئونی داخلی) */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <CircleDot className="w-3.5 h-3.5 text-rose-400" />
                <span>تابش نئونی داخلی (Inner Glow)</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.innerGlow?.enabled ?? false}
                  onChange={(e) =>
                    onUpdateLayer({
                      innerGlow: {
                        enabled: e.target.checked,
                        blur: layer.innerGlow?.blur ?? 10,
                        color: layer.innerGlow?.color ?? '#f43f5e',
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
              </label>
            </div>

            {layer.innerGlow?.enabled && (
              <div className="space-y-2 pt-2 border-t border-white/5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">رنگ تابش داخلی:</span>
                  <div className="flex items-center gap-1">
                    <ColorField label="انتخاب رنگ" value={layer.innerGlow.color} onChange={(v) => onUpdateLayer({ innerGlow: { ...layer.innerGlow!, color: v } })
                      } />
                    <span className="font-mono text-[9px] text-rose-300">{layer.innerGlow.color}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>اندازه تابش (Glow Size):</span>
                    <span className="font-mono text-rose-300">{layer.innerGlow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={layer.innerGlow.blur}
                    onChange={(e) =>
                      onUpdateLayer({ innerGlow: { ...layer.innerGlow!, blur: Number(e.target.value) } })
                    }
                    className="w-full accent-rose-500 h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Outer Glow FX (تابش نئونی بیرونی) */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>تابش نئونی بیرونی (Outer Glow)</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={layer.outerGlow?.enabled ?? false}
                  onChange={(e) =>
                    onUpdateLayer({
                      outerGlow: {
                        enabled: e.target.checked,
                        blur: layer.outerGlow?.blur ?? 14,
                        color: layer.outerGlow?.color ?? '#fbbf24',
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-7 h-4 bg-slate-800 rounded-full peer peer-checked:bg-amber-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-3"></div>
              </label>
            </div>

            {layer.outerGlow?.enabled && (
              <div className="space-y-2 pt-2 border-t border-white/5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">رنگ تابش نئون:</span>
                  <div className="flex items-center gap-1">
                    <ColorField label="انتخاب رنگ" value={layer.outerGlow.color} onChange={(v) => onUpdateLayer({ outerGlow: { ...layer.outerGlow!, color: v } })
                      } />
                    <span className="font-mono text-[9px] text-amber-300">{layer.outerGlow.color}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>شدت انتشار نور (Glow Radius):</span>
                    <span className="font-mono text-amber-300">{layer.outerGlow.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="35"
                    value={layer.outerGlow.blur}
                    onChange={(e) =>
                      onUpdateLayer({ outerGlow: { ...layer.outerGlow!, blur: Number(e.target.value) } })
                    }
                    className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Frosted Glass Blur (تاری شیشه‌ای مات) */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-slate-200">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>افکت شیشه مات (Frosted Glass Blur)</span>
              </span>
              <span className="font-mono text-[10px] text-amber-300 font-bold">
                {layer.backdropBlur || 0}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              value={layer.backdropBlur || 0}
              onChange={(e) => onUpdateLayer({ backdropBlur: Number(e.target.value) })}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          {/* Color Adjustments: Saturation, Hue, Grayscale */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/10 space-y-2">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>تنظیمات رنگ و اشباع (Color Grading)</span>
            </span>

            <div className="space-y-2 pt-1">
              <div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>اشباع رنگ (Saturation):</span>
                  <span className="font-mono text-amber-300">{layer.saturate ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={layer.saturate ?? 100}
                  onChange={(e) => onUpdateLayer({ saturate: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>چرخش فام رنگ (Hue Rotate):</span>
                  <span className="font-mono text-amber-300">{layer.hueRotate ?? 0}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={layer.hueRotate ?? 0}
                  onChange={(e) => onUpdateLayer({ hueRotate: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                />
              </div>

              <div>
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>سیاه‌وسفید (Grayscale):</span>
                  <span className="font-mono text-amber-300">{layer.grayscale ?? 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={layer.grayscale ?? 0}
                  onChange={(e) => onUpdateLayer({ grayscale: Number(e.target.value) })}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSFORM & ALIGNMENT MATRIX */}
      {activeTab === 'transform' && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {/* Z-Index Grouping & Batch Operations */}
          <div className="bg-slate-900/90 rounded-2xl p-3 border border-amber-500/30 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>گروه‌بندی لایه‌ها بر اساس Z-Index (طرح‌های پیچیده)</span>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                سطح Z: {toPersianDigits(currentZIndex)} ({toPersianDigits(sameZLayers.length)} لایه)
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">
              عملیات دسته‌جمعی روی تمام لایه‌هایی که در سطح عمقی <span className="font-mono text-amber-300">Z-Index = {currentZIndex}</span> قرار دارند:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Toggle Lock All in Z-Index */}
              <button
                type="button"
                onClick={() => onToggleSameZIndexLock?.(currentZIndex)}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAllSameZLocked
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {isAllSameZLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-950" />
                    <span>آنلاک همه هم‌سطح (Unlock)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>قفل همه هم‌سطح (Lock All)</span>
                  </>
                )}
              </button>

              {/* Toggle Visibility for All in Z-Index */}
              <button
                type="button"
                onClick={() => onToggleSameZIndexVisibility?.(currentZIndex)}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAllSameZHidden
                    ? 'bg-rose-950 text-rose-300 border-rose-500/40 font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {isAllSameZHidden ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>نمایش همه هم‌سطح (Show)</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                    <span>پنهان همه هم‌سطح (Hide)</span>
                  </>
                )}
              </button>
            </div>

            {/* List of layers sharing this Z-Index */}
            <div className="pt-2 border-t border-white/5 space-y-1">
              <span className="text-[9px] text-slate-400 block font-bold">لایه‌های حاضر در این سطح عمقی (Z-Index: {currentZIndex}):</span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
                {sameZLayers.map((sl) => (
                  <span
                    key={sl.id}
                    className={`text-[9px] px-1.5 py-0.5 rounded border font-mono flex items-center gap-1 ${
                      sl.id === layer.id
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    <span>{sl.name || sl.type}</span>
                    {sl.locked && <Lock className="w-2.5 h-2.5 opacity-70" />}
                    {!sl.visible && <EyeOff className="w-2.5 h-2.5 opacity-70 text-rose-400" />}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Canvas Alignment Matrix */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-slate-200 block">تراز سریع (Quick Align):</span>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => handleAlign('top')}
                className="py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded flex items-center justify-center"
                title="تراز به بالا"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('bottom')}
                className="py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded flex items-center justify-center"
                title="تراز به پایین"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('left')}
                className="py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded flex items-center justify-center"
                title="تراز به چپ"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('right')}
                className="py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded flex items-center justify-center"
                title="تراز به راست"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleAlign('centerX')}
                className="py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded col-span-2 text-[10px] font-black"
                title="تراز افقی مرکز"
              >
                مرکز افقی ⬌
              </button>
              <button
                type="button"
                onClick={() => handleAlign('centerY')}
                className="py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded col-span-2 text-[10px] font-black"
                title="تراز عمودی مرکز"
              >
                مرکز عمودی ⬍
              </button>
            </div>
          </div>

          {/* Enhanced Distribute Section */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5" />
                توزیع متوازن لایه‌ها:
              </span>
              <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">
                {toPersianDigits(sameZLayers.length)} لایه
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDistribute('horizontal')}
                className="py-2 bg-slate-950 hover:bg-indigo-950 text-indigo-200 border border-indigo-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                title="توزیع افقی (Distribute Horizontally)"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>افقی</span>
              </button>
              <button
                type="button"
                onClick={() => handleDistribute('vertical')}
                className="py-2 bg-slate-950 hover:bg-indigo-950 text-indigo-200 border border-indigo-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all"
                title="توزیع عمودی (Distribute Vertically)"
              >
                <Rows className="w-3.5 h-3.5" />
                <span>عمودی</span>
              </button>
            </div>
          </div>

          {/* Flip Controls */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-slate-200 block">قرینه‌سازی (Flip):</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateLayer({ flipHorizontal: !layer.flipHorizontal })}
                className={`py-1.5 rounded-lg border font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                  layer.flipHorizontal
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
                <span>قرینه افقی</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateLayer({ flipVertical: !layer.flipVertical })}
                className={`py-1.5 rounded-lg border font-bold text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                  layer.flipVertical
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'
                }`}
              >
                <FlipVertical className="w-3.5 h-3.5" />
                <span>قرینه عمودی</span>
              </button>
            </div>
          </div>

          {/* Exact Coordinates (X, Y) */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-white/10 space-y-3">
            {/* Lock Aspect Ratio Toggle with Chain Link Icon */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {data.lockAspectRatio || layer.lockAspectRatio ? (
                  <Link className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Unlink className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <div>
                  <span className="text-[11px] font-bold text-slate-200 block">
                    قفل نسبت ابعاد (Lock Aspect Ratio)
                  </span>
                  <span className="text-[9px] text-slate-400 block">
                    حفظ نسبت عرض به ارتفاع هنگام کشیدن گوشه‌ها
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !(data.lockAspectRatio || layer.lockAspectRatio);
                  handleDataChange('lockAspectRatio', nextVal);
                  onUpdateLayer({ lockAspectRatio: nextVal });
                }}
                className={`px-2.5 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  data.lockAspectRatio || layer.lockAspectRatio
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title={data.lockAspectRatio || layer.lockAspectRatio ? 'باز کردن قفل تناسب' : 'قفل کردن نسبت ابعاد'}
              >
                {data.lockAspectRatio || layer.lockAspectRatio ? (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    <span>قفل شد</span>
                  </>
                ) : (
                  <>
                    <Unlink className="w-3.5 h-3.5" />
                    <span>آزاد</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">موقعیت X:</span>
                  <span className="font-mono text-amber-300">{layer.x || 0}px</span>
                </div>
                <input
                  type="number"
                  value={layer.x || 0}
                  onChange={(e) => onUpdateLayer({ x: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">موقعیت Y:</span>
                  <span className="font-mono text-amber-300">{layer.y || 0}px</span>
                </div>
                <input
                  type="number"
                  value={layer.y || 0}
                  onChange={(e) => onUpdateLayer({ y: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Scale Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">مقیاس اندازه (Scale):</span>
                <span className="font-mono text-amber-300">{Math.round((layer.scale || 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={layer.scale || 1}
                onChange={(e) => onUpdateLayer({ scale: Number(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">زاویه چرخش:</span>
                <span className="font-mono text-amber-300">{layer.rotation || 0}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={layer.rotation || 0}
                onChange={(e) => onUpdateLayer({ rotation: Number(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">شفافیت کل لایه (Opacity):</span>
                  <button
                    type="button"
                    onClick={() => onUpdateLayer({ lockOpacity: !layer.lockOpacity })}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] transition-colors border ${
                      layer.lockOpacity
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                    title={layer.lockOpacity ? 'باز کردن قفل شفافیت' : 'قفل کردن شفافیت'}
                  >
                    {layer.lockOpacity ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                    <span>{layer.lockOpacity ? 'قفل شفافیت فعال' : 'قفل شفافیت'}</span>
                  </button>
                </div>
                <span className="font-mono text-amber-300">{layer.opacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                disabled={layer.lockOpacity}
                value={layer.opacity ?? 100}
                onChange={(e) => !layer.lockOpacity && onUpdateLayer({ opacity: Number(e.target.value) })}
                className={`w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer ${
                  layer.lockOpacity ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
              <div className={`flex items-center gap-1 pt-0.5 ${layer.lockOpacity ? 'opacity-50 pointer-events-none' : ''}`}>
                <span className="text-[9px] text-slate-500 mr-1">پیش‌فرض:</span>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    disabled={layer.lockOpacity}
                    onClick={() => !layer.lockOpacity && onUpdateLayer({ opacity: pct })}
                    className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${
                      (layer.opacity ?? 100) === pct
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    } ${layer.lockOpacity ? 'cursor-not-allowed' : ''}`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">شعاع گردی گوشه‌ها (Border Radius):</span>
                <span className="font-mono text-amber-300">{layer.borderRadius || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={layer.borderRadius || 0}
                onChange={(e) => onUpdateLayer({ borderRadius: Number(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Reset Transform Button */}
            <div className="pt-2.5 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  onUpdateLayer({
                    scale: 1,
                    rotation: 0,
                    flipHorizontal: false,
                    flipVertical: false
                  });
                }}
                className="w-full py-2 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                title="بازنشانی مقیاس، چرخش و قرینه‌سازی لایه بدون تغییر موقعیت X و Y"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>ریست ترانسفورم (Reset Transform)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Layer types with a hand-written panel above; everything else gets GenericDataEditor.
const DEDICATED_EDITOR_TYPES = new Set([
  'text', 'feature-pills', 'shape', 'logo', 'badge', 'zhaket-badge', 'icon-library',
  'discount-ribbon', 'mockup', '3d-model', 'stat-card', 'background',
]);

const DEFAULT_STAT_CARDS = [
  { title: 'REST API', subtitle: 'اتصال سریع', color: 'text-amber-400' },
  { title: 'UI مدرن', subtitle: 'دارک و لایت', color: 'text-purple-400' },
  { title: 'پوش آنی', subtitle: 'بدون تاخیر', color: 'text-emerald-400' },
];

// Keys that hold machine data (markup, images, internal ids) and must not be edited as text.
const HIDDEN_DATA_KEYS = new Set(['svgCode', 'imageUrl', 'src', 'lockAspectRatio', 'id']);

/** Edits the short string/number/boolean fields of a layer's data payload. */
const GenericDataEditor: React.FC<{ data: Record<string, any>; onChange: (key: string, value: any) => void }> = ({ data, onChange }) => {
  const fields = Object.entries(data).filter(
    ([key, value]) =>
      !HIDDEN_DATA_KEYS.has(key) &&
      (typeof value === 'number' || typeof value === 'boolean' || (typeof value === 'string' && value.length <= 300)),
  );
  if (fields.length === 0) return null;
  return (
    <div className="space-y-2 bg-slate-900/70 p-3 rounded-xl border border-white/5">
      <div className="text-amber-300 font-bold border-b border-white/5 pb-2">محتوای لایه</div>
      {fields.map(([key, value]) => (
        <label key={key} className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-mono shrink-0">{key}</span>
          {typeof value === 'boolean' ? (
            <input type="checkbox" checked={value} onChange={(e) => onChange(key, e.target.checked)} />
          ) : isColor(value) ? (
            <ColorField label={key} value={value} onChange={(v) => onChange(key, v)} />
          ) : (
            <input
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => onChange(key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
              className="w-full min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-white text-xs focus:border-amber-400 outline-none"
            />
          )}
        </label>
      ))}
    </div>
  );
};

export default PhotoshopLayerInspector;
