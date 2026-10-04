import React, { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DataPoint } from './ProductAnalyticsChart';

interface ProductAnalyticsChartViewProps {
  chartType: 'area' | 'bar' | 'radar';
  data: DataPoint[];
  accentColor: string;
}

export const ProductAnalyticsChartView: React.FC<ProductAnalyticsChartViewProps> = ({
  chartType,
  data,
  accentColor,
}) => {
  const gradientId = `sales-gradient-${useId().replace(/:/g, '')}`;
  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '11px',
  };
  const legendStyle = { fontSize: '11px', color: '#cbd5e1' };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {chartType === 'area' ? (
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={accentColor} stopOpacity={0.8} />
              <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={legendStyle} />
          <Area
            type="monotone"
            dataKey="sales"
            name="فروش (تعداد)"
            stroke={accentColor}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      ) : chartType === 'bar' ? (
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={legendStyle} />
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
          <Legend wrapperStyle={legendStyle} />
          <Tooltip contentStyle={{ ...tooltipStyle, borderRadius: '10px' }} />
        </RadarChart>
      )}
    </ResponsiveContainer>
  );
};

export default ProductAnalyticsChartView;
