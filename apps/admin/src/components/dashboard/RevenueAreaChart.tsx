import { useState, useId } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice, formatCompactPrice } from '../../utils';
import type { AnalyticsRevenuePoint, AnalyticsTimeframe } from '@repo/types';
import { TIMEFRAME_OPTIONS } from './dashboardConstants';

interface RevenueAreaChartProps {
  points: AnalyticsRevenuePoint[];
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
}

export function RevenueAreaChart({
  points,
  timeframe,
  onTimeframeChange,
}: RevenueAreaChartProps) {
  const { t } = useLanguage();
  const gradId = useId();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-gray-400 text-xs">
        {t('common.noData')}
      </div>
    );
  }

  // Calculate compact SVG dimensions and coordinate paths
  const svgWidth = 1000;
  const svgHeight = 150;
  const padLeft = 54;
  const padRight = 16;
  const padTop = 14;
  const padBottom = 22;

  const rawMax = Math.max(...points.map((p) => p.revenue), 1000);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const step = magnitude >= 1000 ? magnitude / 2 : 500;
  const maxVal = Math.max(Math.ceil((rawMax * 1.15) / step) * step, 1000);
  const minVal = 0;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const getX = (idx: number) => {
    if (points.length <= 1) return padLeft + chartW / 2;
    return padLeft + (idx / (points.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;
  };

  const coords = points.map((p, i) => ({
    x: getX(i),
    y: getY(p.revenue),
    point: p,
  }));

  // Build smooth Bézier SVG curve path
  const buildSmoothPath = () => {
    if (coords.length < 2) return '';
    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] ?? p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath();
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${coords[0].x} ${padTop + chartH} Z`;

  const totalPeriodRev = points.reduce((s, p) => s + p.revenue, 0);
  const avgDailyRev = Math.round(totalPeriodRev / points.length);
  const activeHover =
    hoveredIdx !== null ? coords[hoveredIdx] : coords[coords.length - 1];

  // Y-axis ticks at 0%, 25%, 50%, 75%, 100%
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white border border-brand-border px-5 py-3.5 shadow-xs flex flex-col justify-between">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-gray-100 gap-2">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
            {t('dashboard.charts.revenueTrendTitle')}
          </h3>
          <p className="text-xs text-gray-500">
            {t('dashboard.charts.revenueTrendSub')}
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="flex items-center space-x-1 bg-brand-cream/80 p-0.5 border border-brand-border">
          {TIMEFRAME_OPTIONS.map((tf) => (
            <button
              key={tf.id}
              onClick={() => onTimeframeChange(tf.id)}
              className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                timeframe === tf.id
                  ? 'bg-brand-brown text-white shadow-2xs'
                  : 'text-gray-600 hover:text-brand-brown'
              }`}
            >
              {t(tf.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Micro Bar */}
      <div className="flex items-center space-x-6 py-2 border-b border-gray-50 text-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            {t('dashboard.charts.periodRevenue')}
          </span>
          <span className="font-mono font-bold text-brand-brown text-sm">
            {formatPrice(totalPeriodRev)}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">
            {t('dashboard.charts.dailyAverage')}
          </span>
          <span className="font-mono font-bold text-gray-700 text-sm">
            {formatPrice(avgDailyRev)}
          </span>
        </div>
        {activeHover && (
          <div className="ml-auto text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-amber block">
              {activeHover.point.label}
            </span>
            <span className="font-mono font-bold text-brand-brown text-sm">
              {formatPrice(activeHover.point.revenue)}{' '}
              <span className="text-[10px] font-sans font-normal text-gray-500">
                ({activeHover.point.orders} {t('dashboard.hero.ordersUnit')})
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Vector Curve Chart */}
      <div className="relative pt-1.5">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2B1810" stopOpacity="0.25" />
              <stop offset="85%" stopColor="#D97706" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y-axis Ticks & Horizontal Grid lines */}
          {yTicks.map((pct, i) => {
            const y = padTop + chartH * (1 - pct);
            const tickVal = Math.round(minVal + pct * (maxVal - minVal));
            return (
              <g key={`y-axis-${i}`}>
                {/* Horizontal line */}
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="#EAE3D9"
                  strokeWidth="1"
                  strokeDasharray={pct === 0 ? undefined : '3 3'}
                />
                {/* Y-axis label */}
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-gray-400 select-none"
                >
                  {formatCompactPrice(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Y-axis vertical divider */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + chartH}
            stroke="#EAE3D9"
            strokeWidth="1"
          />

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#2B1810"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Interactive Plot Nodes */}
          {coords.map((c, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g
                key={i}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Invisible hover target */}
                <circle cx={c.x} cy={c.y} r="12" fill="transparent" />

                {/* Visible node */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? '5' : '3.5'}
                  fill={isHovered ? '#D97706' : '#2B1810'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* X-axis label */}
                <text
                  x={c.x}
                  y={padTop + chartH + 16}
                  textAnchor="middle"
                  className={`text-[9px] font-sans ${
                    isHovered ? 'fill-brand-brown font-bold' : 'fill-gray-400'
                  }`}
                >
                  {c.point.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
