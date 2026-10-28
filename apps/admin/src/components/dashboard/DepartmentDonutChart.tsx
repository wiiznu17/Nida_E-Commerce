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

  const radius = 68;
  const strokeWidth = 24;
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
    <div className="bg-white border border-brand-border p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="border-b border-gray-100 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
          {t('dashboard.charts.departmentTitle')}
        </h3>
        <p className="text-xs text-gray-500">
          {t('dashboard.charts.departmentSub')}
        </p>
      </div>

      {/* Main Content: Donut Chart on Left (4:10), Data Breakdown on Right (6:10) */}
      <div className="flex-1 flex flex-col md:flex-row items-center gap-5 sm:gap-6 lg:gap-8 py-3 my-auto">
        {/* SVG Donut Ring (4:10 proportion) */}
        <div className="w-full md:w-[40%] flex-shrink-0 flex items-center justify-center relative">
          <svg
            viewBox="0 0 190 190"
            className="w-40 h-40 sm:w-44 sm:h-44 xl:w-48 xl:h-48 rotate-[-90deg] select-none"
          >
            {/* Background circle track */}
            <circle
              cx="95"
              cy="95"
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
                  cx="95"
                  cy="95"
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
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block truncate max-w-[130px]">
              {activeSlice
                ? language === 'th'
                  ? activeSlice.labelTh
                  : activeSlice.labelEn
                : t('dashboard.charts.totalSales')}
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-brand-brown">
              {activeSlice
                ? `${activeSlice.percentage}%`
                : formatPrice(totalRevenue)}
            </span>
          </div>
        </div>

        {/* Legend & Breakdown List (6:10 proportion, shifted closer) */}
        <div className="w-full md:w-[60%] flex-1 space-y-1.5 sm:space-y-2 md:border-l md:border-gray-100 md:pl-5 lg:pl-6 min-w-0">
          {shares.length === 0 || totalRevenue === 0 ? (
            <div className="py-4 text-center text-xs text-stone-400">
              {t('dashboard.charts.noDeptData')}
            </div>
          ) : (
            shares.map((item) => {
              const isHovered = hoveredDept === item.department;
              return (
                <div
                  key={item.department}
                  onMouseEnter={() => setHoveredDept(item.department)}
                  onMouseLeave={() => setHoveredDept(null)}
                  className={`flex items-center justify-between text-xs py-1.5 px-2 rounded-2xs transition-colors cursor-pointer min-w-0 ${
                    isHovered ? 'bg-brand-cream/80' : 'hover:bg-brand-cream/40'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <span
                      className="w-2.5 h-2.5 rounded-2xs flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700 font-bold truncate">
                      {language === 'th' ? item.labelTh : item.labelEn}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono shrink-0">
                    <span className="text-gray-400 text-[11px]">
                      {formatPrice(item.revenue)}
                    </span>
                    <span className="font-bold text-brand-brown w-9 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
