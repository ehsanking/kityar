import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Star, Text, Group } from 'react-konva';
import {
  Layers,
  Square,
  Circle as CircleIcon,
  Star as StarIcon,
  Type,
  Move,
  RotateCw,
  Palette,
  Trash2,
  Sparkles,
  Download,
} from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

export interface KonvaShape {
  id: string;
  type: 'rect' | 'circle' | 'star' | 'text';
  x: number;
  y: number;
  fill: string;
  width?: number;
  height?: number;
  radius?: number;
  numPoints?: number;
  innerRadius?: number;
  outerRadius?: number;
  text?: string;
  fontSize?: number;
  rotation: number;
}

export interface KonvaCanvasStudioProps {
  onSendShapeToMainCanvas?: (shape: KonvaShape) => void;
}

const STAGE_W = 480;
const STAGE_H = 280;

export const KonvaCanvasStudio: React.FC<KonvaCanvasStudioProps> = ({ onSendShapeToMainCanvas }) => {
  const [shapes, setShapes] = useState<KonvaShape[]>([
    {
      id: 'badge-1',
      type: 'star',
      x: 180,
      y: 120,
      fill: '#f59e0b',
      numPoints: 5,
      innerRadius: 20,
      outerRadius: 40,
      rotation: 0,
    },
    {
      id: 'box-1',
      type: 'rect',
      x: 60,
      y: 80,
      width: 100,
      height: 60,
      fill: '#10b981',
      rotation: 12,
    },
    {
      id: 'text-1',
      type: 'text',
      x: 50,
      y: 180,
      text: 'پیش‌نمایش محتوای برداری فروشگاهی',
      fontSize: 16,
      fill: '#ffffff',
      rotation: 0,
    },
  ]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#3b82f6');
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const stageRef = useRef<any>(null);

  const selectedShape = shapes.find((s) => s.id === selectedId);

  // Fit the fixed 480×280 design surface to whatever width the panel gives us
  // (the studio sidebar is narrower than the stage); shape coordinates stay unscaled.
  const stageBoxRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);
  useEffect(() => {
    const box = stageBoxRef.current;
    if (!box || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width;
      if (available > 0) setStageScale(Math.min(1, available / STAGE_W));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const handleAddShape = (type: 'rect' | 'circle' | 'star' | 'text') => {
    const id = `shape-${Date.now()}`;
    const newShape: KonvaShape = {
      id,
      type,
      x: 100 + Math.random() * 80,
      y: 100 + Math.random() * 80,
      fill: currentColor,
      rotation: 0,
      ...(type === 'rect' ? { width: 90, height: 60 } : {}),
      ...(type === 'circle' ? { radius: 35 } : {}),
      ...(type === 'star' ? { numPoints: 6, innerRadius: 18, outerRadius: 36 } : {}),
      ...(type === 'text' ? { text: 'عنصر سفارشی جدید', fontSize: 16 } : {}),
    };
    setShapes((prev) => [...prev, newShape]);
    setSelectedId(id);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (selectedId) {
      setShapes((prev) =>
        prev.map((s) => (s.id === selectedId ? { ...s, fill: color } : s))
      );
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setShapes((prev) => prev.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  };

  const handleRotateSelected = () => {
    if (!selectedId) return;
    setShapes((prev) =>
      prev.map((s) =>
        s.id === selectedId ? { ...s, rotation: (s.rotation + 15) % 360 } : s
      )
    );
  };

  return (
    <div className="@container bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-4 space-y-4 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>بوم گرافیکی تعاملی (Konva Visual Studio)</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                React-Konva
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">ویرایش لایه‌های برداری، چیدمان اشکال و متن‌ها روی بوم گرافیکی</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleAddShape('rect')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-xl border border-white/10 text-xs flex items-center gap-1 transition-all"
            title="مربع/مستطیل"
          >
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">مستطیل</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddShape('circle')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-xl border border-white/10 text-xs flex items-center gap-1 transition-all"
            title="دایره"
          >
            <CircleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">دایره</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddShape('star')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-xl border border-white/10 text-xs flex items-center gap-1 transition-all"
            title="ستاره/بج"
          >
            <StarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">بج ستاره</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddShape('text')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-xl border border-white/10 text-xs flex items-center gap-1 transition-all"
            title="متن برداری"
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">متن</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 @2xl:grid-cols-4 gap-4">
        {/* Stage Container */}
        <div ref={stageBoxRef} className="@2xl:col-span-3 bg-slate-900/80 rounded-xl border border-white/10 p-2 flex items-center justify-center relative overflow-hidden">
          <Stage
            width={STAGE_W * stageScale}
            height={STAGE_H * stageScale}
            scaleX={stageScale}
            scaleY={stageScale}
            ref={stageRef}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
              }
            }}
            className="border border-white/10 rounded-lg bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 shadow-inner"
          >
            <Layer>
              {shapes.map((shape) => {
                const isSelected = shape.id === selectedId;

                if (shape.type === 'rect') {
                  return (
                    <Rect
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                      fill={shape.fill}
                      rotation={shape.rotation}
                      draggable
                      stroke={isSelected ? '#6366f1' : undefined}
                      strokeWidth={isSelected ? 3 : 0}
                      onClick={() => setSelectedId(shape.id)}
                      onDragEnd={(e) => {
                        setShapes((prev) =>
                          prev.map((s) =>
                            s.id === shape.id
                              ? { ...s, x: e.target.x(), y: e.target.y() }
                              : s
                          )
                        );
                      }}
                    />
                  );
                }

                if (shape.type === 'circle') {
                  return (
                    <Circle
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      radius={shape.radius}
                      fill={shape.fill}
                      rotation={shape.rotation}
                      draggable
                      stroke={isSelected ? '#6366f1' : undefined}
                      strokeWidth={isSelected ? 3 : 0}
                      onClick={() => setSelectedId(shape.id)}
                      onDragEnd={(e) => {
                        setShapes((prev) =>
                          prev.map((s) =>
                            s.id === shape.id
                              ? { ...s, x: e.target.x(), y: e.target.y() }
                              : s
                          )
                        );
                      }}
                    />
                  );
                }

                if (shape.type === 'star') {
                  return (
                    <Star
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      numPoints={shape.numPoints || 5}
                      innerRadius={shape.innerRadius || 20}
                      outerRadius={shape.outerRadius || 40}
                      fill={shape.fill}
                      rotation={shape.rotation}
                      draggable
                      stroke={isSelected ? '#6366f1' : undefined}
                      strokeWidth={isSelected ? 3 : 0}
                      onClick={() => setSelectedId(shape.id)}
                      onDragEnd={(e) => {
                        setShapes((prev) =>
                          prev.map((s) =>
                            s.id === shape.id
                              ? { ...s, x: e.target.x(), y: e.target.y() }
                              : s
                          )
                        );
                      }}
                    />
                  );
                }

                if (shape.type === 'text') {
                  return (
                    <Text
                      key={shape.id}
                      id={shape.id}
                      x={shape.x}
                      y={shape.y}
                      text={shape.text}
                      fontSize={shape.fontSize || 16}
                      fill={shape.fill}
                      rotation={shape.rotation}
                      draggable
                      onClick={() => setSelectedId(shape.id)}
                      onDragEnd={(e) => {
                        setShapes((prev) =>
                          prev.map((s) =>
                            s.id === shape.id
                              ? { ...s, x: e.target.x(), y: e.target.y() }
                              : s
                          )
                        );
                      }}
                    />
                  );
                }

                return null;
              })}
            </Layer>
          </Stage>
        </div>

        {/* Selected Layer Inspector & Color Picker */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-white/10 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>تنظیمات لایه</span>
            </span>
            {selectedId && (
              <span className="text-[10px] text-indigo-300 font-mono bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-500/30">
                {selectedShape?.type}
              </span>
            )}
          </div>

          {selectedShape ? (
            <div className="space-y-3">
              {/* Rotation control */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">چرخش:</span>
                <button
                  type="button"
                  onClick={handleRotateSelected}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-white/10 flex items-center gap-1 font-mono text-[11px]"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{selectedShape.rotation}°</span>
                </button>
              </div>

              {/* Text editing if text shape */}
              {selectedShape.type === 'text' && (
                <div className="space-y-1">
                  <span className="text-slate-400 text-[10px]">متن لایه:</span>
                  <input
                    type="text"
                    value={selectedShape.text || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setShapes((prev) =>
                        prev.map((s) => (s.id === selectedId ? { ...s, text: val } : s))
                      );
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-xs"
                  />
                </div>
              )}

              {/* Color Picker toggle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">رنگ لایه:</span>
                  <button
                    type="button"
                    onClick={() => setShowPicker(!showPicker)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded border border-white/10 text-white"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/40"
                      style={{ backgroundColor: selectedShape.fill }}
                    />
                    <span className="font-mono text-[10px] uppercase">{selectedShape.fill}</span>
                  </button>
                </div>

                {showPicker && (
                  <div className="p-2 bg-slate-950 rounded-xl border border-indigo-500/40 shadow-xl space-y-2">
                    <HexColorPicker
                      color={selectedShape.fill}
                      onChange={handleColorChange}
                      style={{ width: '100%', height: '120px' }}
                    />
                  </div>
                )}
              </div>

              {/* Send to Main Canvas button */}
              {onSendShapeToMainCanvas && (
                <button
                  type="button"
                  onClick={() => onSendShapeToMainCanvas(selectedShape)}
                  className="w-full py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                  title="انتقال مستقیم این شکل برداری به عنوان لایه در بوم اصلی"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>انتقال به بوم اصلی ژاکت</span>
                </button>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={handleDeleteSelected}
                className="w-full py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded-lg font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف این لایه</span>
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-[11px] space-y-1">
              <Move className="w-6 h-6 mx-auto text-slate-600 animate-pulse" />
              <p>یک لایه را روی بوم انتخاب کنید تا تنظیمات آن فعال شود.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KonvaCanvasStudio;
