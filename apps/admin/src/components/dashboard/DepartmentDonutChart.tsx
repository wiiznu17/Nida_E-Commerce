import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils';
import type { AnalyticsDepartmentShare } from '@repo/types';

interface DepartmentDonutChartProps {
  shares: AnalyticsDepartmentShare[];
}

export function DepartmentDonutChart({ shares }: DepartmentDonutChartProps) {
  const { language, t } = useLanguage();
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);

  const radius = 56;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const totalRevenue = shares.reduce((s, item) => s + item.revenue, 0);

  // Compute stroke offsets for each slice
  let accumulatedOffset = 0;
  const slices = shares.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (item.percentage / 100) * circumference;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = hoveredDept
    ? shares.find((s) => s.department === hoveredDept)
    : null;

  return (
    <div className="bg-white border border-brand-border p-5 shadow-xs flex flex-col justify-between">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
          {t('dashboard.charts.departmentTitle')}
        </h3>
        <p className="text-xs text-gray-500">
          {t('dashboard.charts.departmentSub')}
        </p>
      </div>

      {/* SVG Donut Ring */}
      <div className="flex items-center justify-center my-4 relative">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="rotate-[-90deg]"
        >
          {/* Background circle track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#FAF7F2"
            strokeWidth={strokeWidth}
          />
          {/* Colored slices */}
          {slices.map((slice) => {
            const isHovered = hoveredDept === slice.department;
            return (
              <circle
                key={slice.department}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredDept(slice.department)}
                onMouseLeave={() => setHoveredDept(null)}
              />
            );
          })}
        </svg>

        {/* Center Text Info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
            {activeSlice
              ? language === 'th'
                ? activeSlice.labelTh
                : activeSlice.labelEn
              : t('dashboard.charts.totalSales')}
          </span>
          <span className="text-xs font-mono font-bold text-brand-brown">
            {activeSlice
              ? `${activeSlice.percentage}%`
              : formatPrice(totalRevenue)}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="space-y-2 border-t border-gray-50 pt-3">
        {shares.map((item) => {
          const isHovered = hoveredDept === item.department;
          return (
            <div
              key={item.department}
              onMouseEnter={() => setHoveredDept(item.department)}
              onMouseLeave={() => setHoveredDept(null)}
              className={`flex items-center justify-between text-xs py-1 px-1.5 transition-colors cursor-pointer ${
                isHovered ? 'bg-brand-cream/80' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-2xs flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-700 font-bold">
                  {language === 'th' ? item.labelTh : item.labelEn}
                </span>
              </div>
              <div className="flex items-center space-x-2 font-mono">
                <span className="text-gray-400 text-[11px]">
                  {formatPrice(item.revenue)}
                </span>
                <span className="font-bold text-brand-brown w-9 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
