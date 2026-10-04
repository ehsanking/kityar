import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, Sparkles, SlidersHorizontal, Plus, Trash2, PlusCircle } from 'lucide-react';
import type { CanvasLayerItem } from '../types/canvasLayers';
import ProductAnalyticsChartView from './ProductAnalyticsChartView';

export interface DataPoint {
  name: string;
  sales: number;
  rating: number;
  performance: number;
}

const DEFAULT_DATA: DataPoint[] = [
  { name: 'فروردین', sales: 420, rating: 85, performance: 78 },
  { name: 'اردیبهشت', sales: 680, rating: 88, performance: 82 },
  { name: 'خرداد', sales: 950, rating: 92, performance: 90 },
  { name: 'تیر', sales: 1200, rating: 96, performance: 95 },
  { name: 'مرداد', sales: 1100, rating: 94, performance: 91 },
  { name: 'شهریور', sales: 1450, rating: 98, performance: 97 },
];

interface ProductAnalyticsChartProps {
  onAddToCanvas?: (layer: Partial<CanvasLayerItem>) => void;
}

export const ProductAnalyticsChart: React.FC<ProductAnalyticsChartProps> = ({ onAddToCanvas }) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'radar'>('area');
  const [data, setData] = useState<DataPoint[]>(DEFAULT_DATA);
  const [accentColor, setAccentColor] = useState<string>('#10b981'); // Emerald default

  const handleAddRow = () => {
    setData((prev) => [
      ...prev,
      {
        name: `ماه ${prev.length + 1}`,
        sales: Math.floor(Math.random() * 800) + 500,
        rating: Math.floor(Math.random() * 20) + 80,
        performance: Math.floor(Math.random() * 25) + 75,
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (data.length <= 2) return;
    setData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleValueChange = (index: number, key: keyof DataPoint, val: string | number) => {
    setData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [key]: typeof updated[index][key] === 'number' ? Number(val) : val,
      };
      return updated;
    });
  };

  return (
    <div className="@container overflow-hidden bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 space-y-4 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>نمودار تحلیل و ویژگی‌های محصول</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Recharts
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">رسم و تجسم داده‌های آمار فروش، امتیاز و عملکرد برای بنر و اینفوگرافیک</p>
          </div>
        </div>

        {/* Chart type buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              chartType === 'area'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>رشد (Area)</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              chartType === 'bar'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>میله‌ای (Bar)</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType('radar')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              chartType === 'radar'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>عنکبوتی (Radar)</span>
          </button>
        </div>

        {onAddToCanvas && (
          <button
            type="button"
            onClick={() =>
              onAddToCanvas({
                name: 'نمودار تحلیل محصول',
                type: 'chart',
                data: {
                  chartType,
                  chartData: data.map((point) => ({ ...point })),
                  chartAccentColor: accentColor,
                  chartTitle: 'نمودار تحلیل محصول',
                },
              })
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-200 transition-colors hover:bg-emerald-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>افزودن به بوم</span>
          </button>
        )}
      </div>

      {/* Chart Canvas Display */}
      <div className="w-full h-64 bg-slate-900/60 rounded-xl p-3 border border-white/5 relative overflow-hidden">
        <ProductAnalyticsChartView chartType={chartType} data={data} accentColor={accentColor} />
      </div>

      {/* Editor & Data Controls */}
      <div className="bg-slate-900/80 rounded-xl p-3 border border-white/5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1 font-bold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>ویرایش داده‌های نمودار</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">رنگ شاخص:</span>
            <div className="flex items-center gap-1">
              {['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    accentColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border border-emerald-500/30"
            >
              <Plus className="w-3 h-3" />
              <span>افزودن نقطه داده</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 @sm:grid-cols-2 @xl:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
          {data.map((item, idx) => (
            <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-white/5 flex items-center gap-1.5 text-xs">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleValueChange(idx, 'name', e.target.value)}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white text-[10px]"
                placeholder="عنوان"
              />
              <input
                type="number"
                value={item.sales}
                onChange={(e) => handleValueChange(idx, 'sales', e.target.value)}
                className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-emerald-400 font-mono text-[10px]"
                placeholder="مقدار"
              />
              {data.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRow(idx)}
                  className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-all mr-auto"
                  title="حذف"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductAnalyticsChart;
