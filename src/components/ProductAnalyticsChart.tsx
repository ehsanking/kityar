import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  CartesianGrid,
} from 'recharts';
import { BarChart3, LineChart, PieChart, Sparkles, SlidersHorizontal, Plus, Trash2 } from 'lucide-react';

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

export const ProductAnalyticsChart: React.FC = () => {
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
      </div>

      {/* Chart Canvas Display */}
      <div className="w-full h-64 bg-slate-900/60 rounded-xl p-3 border border-white/5 relative overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              <Area type="monotone" dataKey="sales" name="فروش (تعداد)" stroke={accentColor} strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
            </AreaChart>
          ) : chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              <Bar dataKey="sales" name="فروش" fill={accentColor} radius={[6, 6, 0, 0]} />
              <Bar dataKey="performance" name="عملکرد (%)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="name" stroke="#cbd5e1" fontSize={11} />
              <PolarRadiusAxis stroke="#64748b" fontSize={9} />
              <Radar name="امتیاز رضایت" dataKey="rating" stroke={accentColor} fill={accentColor} fillOpacity={0.5} />
              <Radar name="شاخص عملکرد" dataKey="performance" stroke="#a855f7" fill="#a855f7" fillOpacity={0.4} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px' }} />
            </RadarChart>
          )}
        </ResponsiveContainer>
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
